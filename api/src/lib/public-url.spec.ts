import { describe, expect, it } from 'vitest';
import { isBlockedHostname, sanitizePublicUrl } from './public-url.js';

describe('sanitizePublicUrl', () => {
  it('accepts public https URLs', () => {
    expect(sanitizePublicUrl('https://billspot.co/')).toBe(
      'https://billspot.co/',
    );
  });

  it('rejects localhost and private hosts', () => {
    expect(sanitizePublicUrl('http://localhost:3000')).toBeNull();
    expect(sanitizePublicUrl('http://127.0.0.1/x')).toBeNull();
    expect(sanitizePublicUrl('http://192.168.1.10/x')).toBeNull();
    expect(sanitizePublicUrl('http://10.0.0.2/x')).toBeNull();
  });

  it('rejects non-http schemes and junk', () => {
    expect(sanitizePublicUrl('ftp://example.com')).toBeNull();
    expect(sanitizePublicUrl('not a url')).toBeNull();
    expect(sanitizePublicUrl('')).toBeNull();
    expect(sanitizePublicUrl(null)).toBeNull();
  });

  it('rejects URLs with credentials', () => {
    expect(sanitizePublicUrl('https://user:pass@example.com')).toBeNull();
  });
});

describe('isBlockedHostname', () => {
  it('blocks local and link-local names', () => {
    expect(isBlockedHostname('localhost')).toBe(true);
    expect(isBlockedHostname('foo.local')).toBe(true);
    expect(isBlockedHostname('169.254.1.1')).toBe(true);
  });

  it('allows public hosts', () => {
    expect(isBlockedHostname('billspot.co')).toBe(false);
    expect(isBlockedHostname('example.com')).toBe(false);
  });
});
