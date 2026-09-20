import { describe, expect, it } from 'vitest';
import { maskOrbioKey, openSecret, sealSecret } from './secret-box.js';

describe('secret-box', () => {
  it('seals and opens a key', () => {
    process.env.AUTH_SECRET = 'test-secret-box';
    const sealed = sealSecret('sk-orbio-abcdef123456');
    expect(sealed.startsWith('v1$')).toBe(true);
    expect(openSecret(sealed)).toBe('sk-orbio-abcdef123456');
  });

  it('masks keys for display', () => {
    expect(maskOrbioKey('sk-orbio-PwkA1GhWDxZ3')).toMatch(/^sk-orbio…/);
  });
});
