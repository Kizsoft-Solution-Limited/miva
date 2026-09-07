import { describe, expect, it } from 'vitest';
import { passwordMatches, signSession, verifyToken } from './session.js';

describe('auth session', () => {
  it('signs and verifies a founder token', () => {
    const { token, session } = signSession('founder', 3600, 'test-secret');
    expect(session.role).toBe('founder');
    expect(verifyToken(token, 'test-secret')?.role).toBe('founder');
  });

  it('rejects tampered tokens', () => {
    const { token } = signSession('investor', 3600, 'test-secret');
    expect(verifyToken(token + 'x', 'test-secret')).toBeNull();
    expect(verifyToken(token, 'other-secret')).toBeNull();
  });

  it('checks demo passwords', () => {
    process.env.DEMO_FOUNDER_PASSWORD = 'founder';
    process.env.DEMO_INVESTOR_PASSWORD = 'investor';
    expect(passwordMatches('founder', 'founder')).toBe(true);
    expect(passwordMatches('investor', 'wrong')).toBe(false);
  });
});
