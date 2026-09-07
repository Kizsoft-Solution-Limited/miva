import type { Request, Response } from 'express';

export const SESSION_COOKIE = 'miva_session';
const MAX_AGE_MS = 60 * 60 * 24 * 7 * 1000;

export function sessionCookieOptions() {
  const crossSite =
    process.env.COOKIE_SAMESITE?.trim().toLowerCase() === 'none' ||
    process.env.NODE_ENV === 'production';
  return {
    httpOnly: true,
    secure: crossSite,
    sameSite: (crossSite ? 'none' : 'lax') as 'none' | 'lax',
    path: '/',
    maxAge: MAX_AGE_MS,
  };
}

export function setSessionCookie(res: Response, token: string) {
  res.cookie(SESSION_COOKIE, token, sessionCookieOptions());
}

export function clearSessionCookie(res: Response) {
  res.clearCookie(SESSION_COOKIE, {
    ...sessionCookieOptions(),
    maxAge: 0,
  });
}

export function readSessionToken(req: Request): string | null {
  const header = req.headers.authorization;
  if (header?.startsWith('Bearer ')) {
    const bearer = header.slice('Bearer '.length).trim();
    if (bearer) return bearer;
  }
  const raw = req.headers.cookie;
  if (!raw) return null;
  for (const part of raw.split(';')) {
    const i = part.indexOf('=');
    if (i < 0) continue;
    const name = part.slice(0, i).trim();
    if (name !== SESSION_COOKIE) continue;
    return decodeURIComponent(part.slice(i + 1).trim());
  }
  return null;
}
