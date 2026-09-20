import { describe, expect, it } from 'vitest';
import { normalizeWalletAddress } from './wallet-address.js';

describe('normalizeWalletAddress', () => {
  it('accepts a 0x address', () => {
    expect(
      normalizeWalletAddress('  0xAa07A0e9209e16aC99708C3EC70159c6eF3128A3  '),
    ).toBe('0xAa07A0e9209e16aC99708C3EC70159c6eF3128A3');
  });

  it('rejects junk', () => {
    expect(() => normalizeWalletAddress('not-a-wallet')).toThrow(
      /0x address/,
    );
  });
});
