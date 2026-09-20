import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Put,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { AuthRateLimitGuard } from '../common/rate-limit.guard.js';
import { AuthService } from './auth.service.js';
import { clearSessionCookie, setSessionCookie } from './cookie.js';
import { LoginDto } from './dto/login.dto.js';
import { OrbioKeyDto } from './dto/orbio-key.dto.js';
import { RegisterDto } from './dto/register.dto.js';
import { WalletAddressDto } from './dto/wallet-address.dto.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('register')
  @UseGuards(AuthRateLimitGuard)
  async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const session = await this.auth.register(dto.email, dto.password, dto.role);
    setSessionCookie(res, session.token);
    return {
      userId: session.userId,
      email: session.email,
      role: session.role,
      expiresAt: session.expiresAt,
      hasOrbioKey: session.hasOrbioKey,
      walletAddress: session.walletAddress,
    };
  }

  @Post('login')
  @UseGuards(AuthRateLimitGuard)
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const session = await this.auth.login(dto.email, dto.password);
    setSessionCookie(res, session.token);
    return {
      userId: session.userId,
      email: session.email,
      role: session.role,
      expiresAt: session.expiresAt,
      hasOrbioKey: session.hasOrbioKey,
      walletAddress: session.walletAddress,
    };
  }

  @Post('logout')
  logout(@Res({ passthrough: true }) res: Response) {
    clearSessionCookie(res);
    return { ok: true };
  }

  @Get('me')
  me(@Req() req: Request) {
    return this.auth.me(req);
  }

  @Get('orbio-balance')
  async orbioBalance(@Req() req: Request) {
    const session = this.auth.requireSession(req);
    return this.auth.getOrbioBalance(session.userId);
  }

  @Put('orbio-key')
  async setOrbioKey(@Req() req: Request, @Body() dto: OrbioKeyDto) {
    const session = this.auth.requireSession(req);
    return this.auth.setOrbioKey(session.userId, dto.apiKey);
  }

  @Delete('orbio-key')
  async clearOrbioKey(@Req() req: Request) {
    const session = this.auth.requireSession(req);
    return this.auth.clearOrbioKey(session.userId);
  }

  @Put('wallet')
  async setWallet(@Req() req: Request, @Body() dto: WalletAddressDto) {
    const session = this.auth.requireSession(req);
    return this.auth.setWalletAddress(session.userId, dto.address);
  }

  @Delete('wallet')
  async clearWallet(@Req() req: Request) {
    const session = this.auth.requireSession(req);
    return this.auth.clearWalletAddress(session.userId);
  }
}
