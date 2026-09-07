import { Body, Controller, Get, Post, Req, UnauthorizedException } from '@nestjs/common';
import type { Request } from 'express';
import { AuthService } from './auth.service.js';
import { LoginDto } from './dto/login.dto.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.auth.login(dto.role, dto.password);
  }

  @Get('me')
  me(@Req() req: Request) {
    const session = this.auth.sessionFromRequest(req);
    if (!session) {
      throw new UnauthorizedException('Not signed in.');
    }
    return { role: session.role, expiresAt: new Date(session.exp * 1000).toISOString() };
  }
}
