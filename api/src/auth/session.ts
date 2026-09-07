import { createHmac, timingSafeEqual } from 'node:crypto';

export type DemoRole = 'founder' | 'investor';

export interface AuthSession {
  role: DemoRole;
  exp: number;
}

function b64url(input: Buffer | string): string {
  const buf = Buffer.isBuffer(input) ? input : Buffer.from(input);
  return buf
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

function fromB64url(input: string): Buffer {
  const pad = input.length % 4 === 0 ? '' : '='.repeat(4 - (input.length % 4));
  const raw = input.replace(/-/g, '+').replace(/_/g, '/') + pad;
  return Buffer.from(raw, 'base64');
}

export function authSecret(): string {
  return process.env.AUTH_SECRET?.trim() || 'miva-demo-auth-secret';
}

export function demoPassword(role: DemoRole): string {
  if (role === 'founder') {
    return process.env.DEMO_FOUNDER_PASSWORD?.trim() || 'founder';
  }
  return process.env.DEMO_INVESTOR_PASSWORD?.trim() || 'investor';
}

export function signSession(
  role: DemoRole,
  ttlSec = 60 * 60 * 24 * 7,
  secret = authSecret(),
): { token: string; session: AuthSession } {
  const session: AuthSession = {
    role,
    exp: Math.floor(Date.now() / 1000) + ttlSec,
  };
  const payload = b64url(JSON.stringify(session));
  const sig = b64url(createHmac('sha256', secret).update(payload).digest());
  return { token: `${payload}.${sig}`, session };
}

export function verifyToken(
  token: string | undefined | null,
  secret = authSecret(),
): AuthSession | null {
  if (!token) return null;
  const [payload, sig] = token.split('.');
  if (!payload || !sig) return null;
  const expected = b64url(createHmac('sha256', secret).update(payload).digest());
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const session = JSON.parse(fromB64url(payload).toString('utf8')) as AuthSession;
    if (session.role !== 'founder' && session.role !== 'investor') return null;
    if (!session.exp || session.exp < Math.floor(Date.now() / 1000)) return null;
    return session;
  } catch {
    return null;
  }
}

export function passwordMatches(role: DemoRole, password: string): boolean {
  const expected = demoPassword(role);
  const a = Buffer.from(password);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}
