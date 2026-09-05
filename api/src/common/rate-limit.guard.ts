import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import type { Request } from 'express';

interface Bucket {
  count: number;
  resetAt: number;
}

abstract class BaseRateLimitGuard implements CanActivate {
  private readonly buckets = new Map<string, Bucket>();

  protected constructor(
    private readonly limit: number,
    private readonly windowMs: number,
    private readonly prefix: string,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<Request>();
    const forwarded = req.headers['x-forwarded-for'];
    const ip =
      (typeof forwarded === 'string'
        ? forwarded.split(',')[0]?.trim()
        : null) ||
      req.ip ||
      'unknown';
    const key = `${this.prefix}:${ip}`;
    const now = Date.now();
    const existing = this.buckets.get(key);

    if (!existing || existing.resetAt <= now) {
      this.buckets.set(key, { count: 1, resetAt: now + this.windowMs });
      return true;
    }

    if (existing.count >= this.limit) {
      const retrySec = Math.max(1, Math.ceil((existing.resetAt - now) / 1000));
      throw new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          message: `Too many requests. Try again in ${retrySec}s.`,
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    existing.count += 1;
    return true;
  }
}

/** 8 verifies / minute / IP — OpenRouter calls are expensive. */
@Injectable()
export class VerifyRateLimitGuard extends BaseRateLimitGuard {
  constructor() {
    super(8, 60_000, 'verify');
  }
}

/** 30 decisions / minute / IP */
@Injectable()
export class DecideRateLimitGuard extends BaseRateLimitGuard {
  constructor() {
    super(30, 60_000, 'decide');
  }
}
