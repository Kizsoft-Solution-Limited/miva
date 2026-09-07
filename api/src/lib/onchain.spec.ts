import { describe, expect, it } from 'vitest';
import { parseOnchainTarget } from './onchain.js';

describe('parseOnchainTarget', () => {
  it('parses etherscan address URLs', () => {
    expect(
      parseOnchainTarget(
        'https://etherscan.io/address/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
      ),
    ).toEqual({
      kind: 'contract',
      value: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
      explorerUrl:
        'https://etherscan.io/address/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    });
  });

  it('parses etherscan tx URLs', () => {
    const full = `0x${'ab'.repeat(32)}`;
    expect(full.length).toBe(66);
    const parsed = parseOnchainTarget(`https://etherscan.io/tx/${full}`);
    expect(parsed?.kind).toBe('tx');
    expect(parsed?.value).toBe(full.toLowerCase());
  });

  it('rejects non-hex junk', () => {
    expect(parseOnchainTarget('https://example.com')).toBeNull();
  });
});
