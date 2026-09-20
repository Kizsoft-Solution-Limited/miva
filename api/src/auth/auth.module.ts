import { Module } from '@nestjs/common';
import { AuthRateLimitGuard } from '../common/rate-limit.guard.js';
import { OpenRouterModule } from '../openrouter/openrouter.module.js';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';

@Module({
  imports: [OpenRouterModule],
  controllers: [AuthController],
  providers: [AuthService, AuthRateLimitGuard],
  exports: [AuthService],
})
export class AuthModule {}
