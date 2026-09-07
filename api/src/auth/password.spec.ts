import { describe, expect, it } from 'vitest';
import { hashPassword, verifyPassword } from './password.js';

describe('password', () => {
  it('hashes and verifies', async () => {
    const hash = await hashPassword('secret-pass-1');
    expect(hash.startsWith('scrypt$')).toBe(true);
    expect(await verifyPassword('secret-pass-1', hash)).toBe(true);
    expect(await verifyPassword('wrong', hash)).toBe(false);
  });
});
