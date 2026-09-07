import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { AuthRateLimitGuard } from '../common/rate-limit.guard.js';
import { AuthService } from './auth.service.js';
import { clearSessionCookie, setSessionCookie } from './cookie.js';
import { LoginDto } from './dto/login.dto.js';
import { RegisterDto } from './dto/register.dto.js';

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
    };
  }

  @Post('logout')
  logout(@Res({ passthrough: true }) res: Response) {
    clearSessionCookie(res);
    return { ok: true };
  }

  @Get('me')
  me(@Req() req: Request) {
    const session = this.auth.sessionFromRequest(req);
    if (!session) {
      throw new UnauthorizedException('Not signed in.');
    }
    return {
      userId: session.userId,
      email: session.email,
      role: session.role,
      expiresAt: new Date(session.exp * 1000).toISOString(),
    };
  }
}
