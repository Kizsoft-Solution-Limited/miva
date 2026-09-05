import { Module } from '@nestjs/common';
import { OpenRouterModule } from '../openrouter/openrouter.module.js';
import { VerificationService } from './verification.service.js';

@Module({
  imports: [OpenRouterModule],
  providers: [VerificationService],
  exports: [VerificationService],
})
export class VerificationModule {}
