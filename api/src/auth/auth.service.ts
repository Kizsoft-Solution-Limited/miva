import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import { PrismaService } from '../prisma/prisma.service.js';
import { readSessionToken } from './cookie.js';
import { hashPassword, verifyPassword } from './password.js';
import {
  type AuthSession,
  type AuthRole,
  signSession,
  verifyToken,
} from './session.js';

@Injectable()
export class AuthService {
  private timingPadHash: string | null = null;

  constructor(private readonly prisma: PrismaService) {}

  async register(email: string, password: string, role: AuthRole) {
    const normalized = email.trim().toLowerCase();
    const existing = await this.prisma.user.findUnique({
      where: { email: normalized },
    });
    if (existing) {
      throw new ConflictException('That email is already registered.');
    }
    const passwordHash = await hashPassword(password);
    const user = await this.prisma.user.create({
      data: {
        email: normalized,
        passwordHash,
        role,
      },
    });
    return this.issueToken(user.id, user.email, user.role as AuthRole);
  }

  async login(email: string, password: string) {
    const normalized = email.trim().toLowerCase();
    const user = await this.prisma.user.findUnique({
      where: { email: normalized },
    });
    const hash = user?.passwordHash ?? (await this.padHash());
    const ok = await verifyPassword(password, hash);
    if (!user || !ok) {
      throw new UnauthorizedException('Wrong email or password.');
    }
    return this.issueToken(user.id, user.email, user.role as AuthRole);
  }

  sessionFromRequest(req: Request): AuthSession | null {
    return verifyToken(readSessionToken(req));
  }

  requireRole(req: Request, role: AuthRole): AuthSession {
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

  private async padHash() {
    if (!this.timingPadHash) {
      this.timingPadHash = await hashPassword('__miva_timing_pad__');
    }
    return this.timingPadHash;
  }

  private issueToken(userId: string, email: string, role: AuthRole) {
    const { token, session } = signSession({ userId, email, role });
    return {
      userId: session.userId,
      email: session.email,
      role: session.role,
      token,
      expiresAt: new Date(session.exp * 1000).toISOString(),
    };
  }
}
