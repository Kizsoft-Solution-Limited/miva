import { Injectable, UnauthorizedException } from '@nestjs/common';
import type { Request } from 'express';
import {
  type AuthSession,
  type DemoRole,
  passwordMatches,
  signSession,
  verifyToken,
} from './session.js';

@Injectable()
export class AuthService {
  login(role: DemoRole, password: string) {
    if (!passwordMatches(role, password)) {
      throw new UnauthorizedException('Wrong password for that role.');
    }
    const { token, session } = signSession(role);
    return {
      role: session.role,
      token,
      expiresAt: new Date(session.exp * 1000).toISOString(),
    };
  }

  sessionFromRequest(req: Request): AuthSession | null {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) return null;
    return verifyToken(header.slice('Bearer '.length).trim());
  }

  requireRole(req: Request, role: DemoRole): AuthSession {
    const session = this.sessionFromRequest(req);
    if (!session || session.role !== role) {
      throw new UnauthorizedException(
        role === 'investor'
          ? 'Investor login required to record a decision.'
          : 'Founder login required to submit or re-check proof.',
      );
    }
    return session;
  }
}
