import { describe, expect, it } from 'vitest';
import { signSession, verifyToken } from './session.js';

describe('auth session', () => {
  it('signs and verifies a founder token', () => {
    const { token, session } = signSession(
      {
        userId: 'u1',
        email: 'founder@example.com',
        role: 'founder',
      },
      3600,
      'test-secret',
    );
    expect(session.role).toBe('founder');
    expect(verifyToken(token, 'test-secret')?.email).toBe('founder@example.com');
  });

  it('rejects tampered tokens', () => {
    const { token } = signSession(
      {
        userId: 'u1',
        email: 'a@b.co',
        role: 'investor',
      },
      3600,
      'test-secret',
    );
    expect(verifyToken(token + 'x', 'test-secret')).toBeNull();
    expect(verifyToken(token, 'other-secret')).toBeNull();
  });
});
