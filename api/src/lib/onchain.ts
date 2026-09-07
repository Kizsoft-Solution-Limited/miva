import { sanitizePublicUrl } from './public-url.js';

export type OnchainKind = 'contract' | 'tx';

export interface OnchainProbe {
  input: string;
  kind: OnchainKind;
  ok: boolean;
  chainId?: number;
  rpcUrl?: string;
  address?: string;
  txHash?: string;
  /** Contract has bytecode (not EOA) */
  isContract?: boolean;
  bytecodeBytes?: number;
  txStatus?: 'success' | 'reverted' | 'unknown';
  blockNumber?: number;
  explorerUrl?: string;
  error?: string;
}

const ADDR_RE = /\b(0x[a-fA-F0-9]{40})\b/;
const TX_RE = /\b(0x[a-fA-F0-9]{64})\b/;

const DEFAULT_RPCS = [
  'https://cloudflare-eth.com',
  'https://ethereum.publicnode.com',
  'https://rpc.ankr.com/eth',
];

function rpcList(): string[] {
  const fromEnv = process.env.ETH_RPC_URL?.trim();
  return fromEnv ? [fromEnv, ...DEFAULT_RPCS.filter((u) => u !== fromEnv)] : DEFAULT_RPCS;
}

/** Extract mainnet address or tx from an etherscan (or similar) URL / raw hex. */
export function parseOnchainTarget(raw?: string | null): {
  kind: OnchainKind;
  value: string;
  explorerUrl?: string;
} | null {
  if (!raw?.trim()) return null;
  const trimmed = raw.trim();

  const url = sanitizePublicUrl(trimmed);
  if (url) {
    try {
      const parsed = new URL(url);
      const host = parsed.hostname.toLowerCase();
      const path = parsed.pathname;
      if (
        host.includes('etherscan.io') ||
        host.includes('etherscan.com') ||
        host === 'eth.blockscout.com'
      ) {
        const addr = path.match(/\/address\/(0x[a-fA-F0-9]{40})/i)?.[1];
        if (addr) {
          return {
            kind: 'contract',
            value: addr.toLowerCase(),
            explorerUrl: `https://etherscan.io/address/${addr}`,
          };
        }
        const tx = path.match(/\/tx\/(0x[a-fA-F0-9]{64})/i)?.[1];
        if (tx) {
          return {
            kind: 'tx',
            value: tx.toLowerCase(),
            explorerUrl: `https://etherscan.io/tx/${tx}`,
          };
        }
      }
      // Any public URL that embeds hex in the path/query
      const pathTx = `${path}?${parsed.search}`.match(TX_RE)?.[1];
      if (pathTx) {
        return {
          kind: 'tx',
          value: pathTx.toLowerCase(),
          explorerUrl: `https://etherscan.io/tx/${pathTx}`,
        };
      }
      const pathAddr = `${path}?${parsed.search}`.match(ADDR_RE)?.[1];
      if (pathAddr) {
        return {
          kind: 'contract',
          value: pathAddr.toLowerCase(),
          explorerUrl: `https://etherscan.io/address/${pathAddr}`,
        };
      }
    } catch {
      /* fall through */
    }
  }

  const txOnly = trimmed.match(TX_RE)?.[1];
  if (txOnly && trimmed.replace(/\s/g, '').length <= 66) {
    return {
      kind: 'tx',
      value: txOnly.toLowerCase(),
      explorerUrl: `https://etherscan.io/tx/${txOnly}`,
    };
  }
  const addrOnly = trimmed.match(ADDR_RE)?.[1];
  if (addrOnly && !TX_RE.test(trimmed)) {
    return {
      kind: 'contract',
      value: addrOnly.toLowerCase(),
      explorerUrl: `https://etherscan.io/address/${addrOnly}`,
    };
  }
  return null;
}

async function ethRpc<T>(
  rpcUrl: string,
  method: string,
  params: unknown[],
): Promise<T> {
  const res = await fetch(rpcUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'MIVA-Verify/1.0 (+https://github.com/Kizsoft-Solution-Limited/miva)',
    },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }),
    signal: AbortSignal.timeout(12_000),
  });
  if (!res.ok) {
    throw new Error(`RPC HTTP ${res.status}`);
  }
  const body = (await res.json()) as {
    result?: T;
    error?: { message?: string };
  };
  if (body.error?.message) {
    throw new Error(body.error.message);
  }
  return body.result as T;
}

export async function probeOnchain(
  raw?: string | null,
): Promise<OnchainProbe | null> {
  const target = parseOnchainTarget(raw);
  if (!target) return null;

  const base: OnchainProbe = {
    input: raw!.trim(),
    kind: target.kind,
    ok: false,
    explorerUrl: target.explorerUrl,
    chainId: 1,
  };

  if (target.kind === 'contract') {
    base.address = target.value;
  } else {
    base.txHash = target.value;
  }

  let lastError = 'All Ethereum RPC endpoints failed';
  for (const rpcUrl of rpcList()) {
    try {
      if (target.kind === 'contract') {
        const code = await ethRpc<string>(rpcUrl, 'eth_getCode', [
          target.value,
          'latest',
        ]);
        const hex = (code || '0x').replace(/^0x/i, '');
        const bytecodeBytes = Math.floor(hex.length / 2);
        const isContract = bytecodeBytes > 0;
        return {
          ...base,
          ok: isContract,
          rpcUrl,
          isContract,
          bytecodeBytes,
          error: isContract
            ? undefined
            : 'Address has no contract bytecode (EOA or empty)',
        };
      }

      const receipt = await ethRpc<{
        status?: string;
        blockNumber?: string;
      } | null>(rpcUrl, 'eth_getTransactionReceipt', [target.value]);

      if (!receipt) {
        return {
          ...base,
          ok: false,
          rpcUrl,
          error: 'Transaction not found on Ethereum mainnet',
        };
      }
      const statusHex = receipt.status?.toLowerCase();
      const txStatus =
        statusHex === '0x1'
          ? 'success'
          : statusHex === '0x0'
            ? 'reverted'
            : 'unknown';
      const blockNumber = receipt.blockNumber
        ? Number.parseInt(receipt.blockNumber, 16)
        : undefined;
      return {
        ...base,
        ok: txStatus === 'success',
        rpcUrl,
        txStatus,
        blockNumber,
        error:
          txStatus === 'success'
            ? undefined
            : `Transaction status: ${txStatus}`,
      };
    } catch (error) {
      lastError = error instanceof Error ? error.message : String(error);
    }
  }

  return { ...base, error: lastError };
}
