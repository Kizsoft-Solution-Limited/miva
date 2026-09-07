import { describe, expect, it } from 'vitest';
import { ExecutionContext, HttpException } from '@nestjs/common';
import { AuthRateLimitGuard, VerifyRateLimitGuard } from './rate-limit.guard.js';

function mockContext(ip = '1.2.3.4'): ExecutionContext {
  return {
    switchToHttp: () => ({
      getRequest: () => ({
        ip,
        headers: {},
      }),
    }),
  } as unknown as ExecutionContext;
}

describe('VerifyRateLimitGuard', () => {
  it('allows requests under the limit', () => {
    const guard = new VerifyRateLimitGuard();
    const ctx = mockContext('10.0.0.1');
    for (let i = 0; i < 8; i += 1) {
      expect(guard.canActivate(ctx)).toBe(true);
    }
  });

  it('blocks the 9th verify in the window', () => {
    const guard = new VerifyRateLimitGuard();
    const ctx = mockContext('10.0.0.2');
    for (let i = 0; i < 8; i += 1) guard.canActivate(ctx);
    expect(() => guard.canActivate(ctx)).toThrow(HttpException);
  });
});

describe('AuthRateLimitGuard', () => {
  it('blocks the 21st auth attempt in the window', () => {
    const guard = new AuthRateLimitGuard();
    const ctx = mockContext('10.0.0.3');
    for (let i = 0; i < 20; i += 1) guard.canActivate(ctx);
    expect(() => guard.canActivate(ctx)).toThrow(HttpException);
  });
});
