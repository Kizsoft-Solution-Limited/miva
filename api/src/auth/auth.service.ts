import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import { PrismaService } from '../prisma/prisma.service.js';
import { readSessionToken } from './cookie.js';
import { hashPassword, verifyPassword } from './password.js';
import { openSecret, sealSecret } from './secret-box.js';
import {
  type AuthSession,
  type AuthRole,
  signSession,
  verifyToken,
} from './session.js';
import { normalizeWalletAddress } from './wallet-address.js';
import { milestonesForFounderWalletSync } from './milestone-wallet-sync.js';

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
    return this.issueToken(user.id, user.email, user.role as AuthRole, {
      hasOrbioKey: false,
      walletAddress: null,
    });
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
    return this.issueToken(user.id, user.email, user.role as AuthRole, {
      hasOrbioKey: Boolean(user.orbioKeyEnc),
      walletAddress: user.walletAddress,
    });
  }

  sessionFromRequest(req: Request): AuthSession | null {
    return verifyToken(readSessionToken(req));
  }

  requireSession(req: Request): AuthSession {
    const session = this.sessionFromRequest(req);
    if (!session) {
      throw new UnauthorizedException('Not signed in.');
    }
    return session;
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

  async me(req: Request) {
    const session = this.requireSession(req);
    const user = await this.prisma.user.findUnique({
      where: { id: session.userId },
      select: { orbioKeyEnc: true, walletAddress: true },
    });
    return {
      userId: session.userId,
      email: session.email,
      role: session.role,
      expiresAt: new Date(session.exp * 1000).toISOString(),
      hasOrbioKey: Boolean(user?.orbioKeyEnc),
      walletAddress: user?.walletAddress ?? null,
    };
  }

  async setOrbioKey(userId: string, apiKey: string) {
    const trimmed = apiKey.trim();
    if (!trimmed) {
      throw new BadRequestException('Paste an Orbio key from orbio.so.');
    }
    await this.prisma.user.update({
      where: { id: userId },
      data: { orbioKeyEnc: sealSecret(trimmed) },
    });
    return { hasOrbioKey: true };
  }

  async clearOrbioKey(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { orbioKeyEnc: null },
    });
    return { hasOrbioKey: false };
  }

  async getDecryptedOrbioKey(userId: string): Promise<string | null> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { orbioKeyEnc: true },
    });
    if (!user?.orbioKeyEnc) return null;
    return openSecret(user.orbioKeyEnc);
  }

  async setWalletAddress(userId: string, address: string) {
    const walletAddress = normalizeWalletAddress(address);
    const existing = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { walletAddress: true },
    });
    await this.prisma.user.update({
      where: { id: userId },
      data: { walletAddress },
    });
    await this.syncMilestonePayoutWallets(
      userId,
      walletAddress,
      existing?.walletAddress ?? null,
    );
    return { walletAddress };
  }

  async clearWalletAddress(userId: string) {
    const existing = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { walletAddress: true },
    });
    await this.prisma.user.update({
      where: { id: userId },
      data: { walletAddress: null },
    });
    await this.syncMilestonePayoutWallets(
      userId,
      null,
      existing?.walletAddress ?? null,
    );
    return { walletAddress: null as string | null };
  }

  private async syncMilestonePayoutWallets(
    userId: string,
    nextWallet: string | null,
    previousWallet: string | null,
  ) {
    await this.prisma.milestone.updateMany({
      where: milestonesForFounderWalletSync(userId, previousWallet),
      data: {
        payoutWallet: nextWallet,
        founderUserId: userId,
      },
    });
  }

  async getWalletAddress(userId: string): Promise<string | null> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { walletAddress: true },
    });
    return user?.walletAddress ?? null;
  }

  private async padHash() {
    if (!this.timingPadHash) {
      this.timingPadHash = await hashPassword('__miva_timing_pad__');
    }
    return this.timingPadHash;
  }

  private issueToken(
    userId: string,
    email: string,
    role: AuthRole,
    extras?: { hasOrbioKey?: boolean; walletAddress?: string | null },
  ) {
    const { token, session } = signSession({ userId, email, role });
    return {
      userId: session.userId,
      email: session.email,
      role: session.role,
      token,
      expiresAt: new Date(session.exp * 1000).toISOString(),
      hasOrbioKey: extras?.hasOrbioKey ?? false,
      walletAddress: extras?.walletAddress ?? null,
    };
  }
}
