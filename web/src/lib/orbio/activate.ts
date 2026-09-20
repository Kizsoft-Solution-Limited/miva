import {
  createPublicClient,
  createWalletClient,
  custom,
  formatUnits,
  http,
  parseUnits,
  type Address,
  type Hash,
} from 'viem'
import { creditAbi, erc20Abi, exchangeAbi } from './abi'
import { toBeneficiary } from './beneficiary'
import {
  ORBIO,
  ORBIO_TOKEN_DECIMALS,
  ROBINHOOD_CHAIN_ID,
  robinhoodChain,
} from './chain'

type EthereumProvider = {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>
}

function getEthereum(): EthereumProvider {
  const eth = (window as unknown as { ethereum?: EthereumProvider }).ethereum
  if (!eth) {
    throw new Error('No wallet found. Install MetaMask or Rabby.')
  }
  return eth
}

export function publicOrbioClient() {
  return createPublicClient({
    chain: robinhoodChain,
    transport: http(robinhoodChain.rpcUrls.default.http[0]),
  })
}

export async function connectOrbioWallet(): Promise<Address> {
  const eth = getEthereum()
  const accounts = (await eth.request({
    method: 'eth_requestAccounts',
  })) as string[]
  const account = accounts[0] as Address | undefined
  if (!account) throw new Error('Wallet did not return an account.')
  await ensureRobinhoodChain(eth)
  return account
}

async function ensureRobinhoodChain(eth: EthereumProvider) {
  const hexId = `0x${ROBINHOOD_CHAIN_ID.toString(16)}`
  try {
    await eth.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: hexId }],
    })
  } catch (err) {
    const code = (err as { code?: number })?.code
    if (code !== 4902) throw err
    await eth.request({
      method: 'wallet_addEthereumChain',
      params: [
        {
          chainId: hexId,
          chainName: robinhoodChain.name,
          nativeCurrency: robinhoodChain.nativeCurrency,
          rpcUrls: robinhoodChain.rpcUrls.default.http,
          blockExplorerUrls: [robinhoodChain.blockExplorers.default.url],
        },
      ],
    })
  }
}

function walletClient(account: Address) {
  return createWalletClient({
    account,
    chain: robinhoodChain,
    transport: custom(getEthereum()),
  })
}

export type ActivationQuote = {
  creditOut: bigint
  usdgSpent: bigint
  creditedAtoms: bigint
  activationFeeAtoms: bigint
  maxFills: bigint
  creditOutLabel: string
  creditedLabel: string
}

export async function quoteBuyAndActivate(
  usdgAmount: string,
): Promise<ActivationQuote> {
  const usdgIn = parseUnits(usdgAmount.trim() || '0', ORBIO_TOKEN_DECIMALS)
  if (usdgIn <= 0n) throw new Error('Enter a USDG amount greater than 0.')

  const publicClient = publicOrbioClient()
  const maxFills = await publicClient.readContract({
    address: ORBIO.exchange,
    abi: exchangeAbi,
    functionName: 'MAX_FILLS',
  })
  const [quote, creditedAtoms, activationFeeAtoms] =
    await publicClient.readContract({
      address: ORBIO.exchange,
      abi: exchangeAbi,
      functionName: 'getActivationQuote',
      args: [usdgIn, maxFills],
    })

  if (quote.creditOut <= 0n) {
    throw new Error('No CREDIT liquidity for that size. Try a smaller amount.')
  }

  return {
    creditOut: quote.creditOut,
    usdgSpent: quote.usdgSpent,
    creditedAtoms,
    activationFeeAtoms,
    maxFills,
    creditOutLabel: formatUnits(quote.creditOut, ORBIO_TOKEN_DECIMALS),
    creditedLabel: formatUnits(creditedAtoms, ORBIO_TOKEN_DECIMALS),
  }
}

export async function buyAndActivateForFounder(input: {
  account: Address
  founderWallet: string
  usdgAmount: string
  quote: ActivationQuote
}): Promise<Hash> {
  const usdgIn = parseUnits(input.usdgAmount.trim(), ORBIO_TOKEN_DECIMALS)
  const minCreditOut = (input.quote.creditOut * 98n) / 100n
  const beneficiary = toBeneficiary(input.founderWallet)
  const publicClient = publicOrbioClient()
  const wallet = walletClient(input.account)

  const allowance = await publicClient.readContract({
    address: ORBIO.usdg,
    abi: erc20Abi,
    functionName: 'allowance',
    args: [input.account, ORBIO.exchange],
  })
  if (allowance < usdgIn) {
    const approveHash = await wallet.writeContract({
      address: ORBIO.usdg,
      abi: erc20Abi,
      functionName: 'approve',
      args: [ORBIO.exchange, usdgIn],
    })
    await publicClient.waitForTransactionReceipt({ hash: approveHash })
  }

  const hash = await wallet.writeContract({
    address: ORBIO.exchange,
    abi: exchangeAbi,
    functionName: 'buyAndActivate',
    args: [usdgIn, minCreditOut, beneficiary, input.quote.maxFills],
  })
  await publicClient.waitForTransactionReceipt({ hash })
  return hash
}

export async function activateCreditForFounder(input: {
  account: Address
  founderWallet: string
  creditAmount: string
}): Promise<Hash> {
  const amount = parseUnits(input.creditAmount.trim(), ORBIO_TOKEN_DECIMALS)
  if (amount <= 0n) throw new Error('Enter a CREDIT amount greater than 0.')
  const beneficiary = toBeneficiary(input.founderWallet)
  const publicClient = publicOrbioClient()
  const wallet = walletClient(input.account)

  const balance = await publicClient.readContract({
    address: ORBIO.credit,
    abi: creditAbi,
    functionName: 'balanceOf',
    args: [input.account],
  })
  if (balance < amount) {
    throw new Error('Not enough CREDIT in this wallet.')
  }

  const hash = await wallet.writeContract({
    address: ORBIO.credit,
    abi: creditAbi,
    functionName: 'activate',
    args: [amount, beneficiary],
  })
  await publicClient.waitForTransactionReceipt({ hash })
  return hash
}

export function explorerTxUrl(hash: Hash): string {
  return `${robinhoodChain.blockExplorers.default.url}/tx/${hash}`
}
