import { describe, expect, it } from 'vitest';
import {
  clearSessionCookie,
  readSessionToken,
  SESSION_COOKIE,
  setSessionCookie,
} from './cookie.js';
import type { Request, Response } from 'express';

describe('session cookie', () => {
  it('reads Bearer or cookie token', () => {
    expect(
      readSessionToken({
        headers: { authorization: 'Bearer abc' },
      } as Request),
    ).toBe('abc');
    expect(
      readSessionToken({
        headers: { cookie: `${SESSION_COOKIE}=tok123; other=1` },
      } as Request),
    ).toBe('tok123');
  });

  it('sets httpOnly cookie options', () => {
    const headers: string[] = [];
    const res = {
      cookie: (name: string, value: string, opts: Record<string, unknown>) => {
        expect(name).toBe(SESSION_COOKIE);
        expect(value).toBe('t');
        expect(opts.httpOnly).toBe(true);
        headers.push(name);
      },
      clearCookie: () => {
        headers.push('cleared');
      },
    } as unknown as Response;
    setSessionCookie(res, 't');
    clearSessionCookie(res);
    expect(headers).toEqual([SESSION_COOKIE, 'cleared']);
  });
});
