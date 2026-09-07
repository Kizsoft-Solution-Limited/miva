import {
  CanActivate,
  ExecutionContext,
  Injectable,
  mixin,
  type Type,
} from '@nestjs/common';
import type { Request } from 'express';
import { AuthService } from './auth.service.js';
import type { DemoRole } from './session.js';

export function RoleGuard(role: DemoRole): Type<CanActivate> {
  @Injectable()
  class RoleGuardMixin implements CanActivate {
    constructor(private readonly auth: AuthService) {}

    canActivate(context: ExecutionContext): boolean {
      const req = context.switchToHttp().getRequest<Request>();
      this.auth.requireRole(req, role);
      return true;
    }
  }
  return mixin(RoleGuardMixin);
}

export const FounderGuard = RoleGuard('founder');
export const InvestorGuard = RoleGuard('investor');
