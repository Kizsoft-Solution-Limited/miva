import { Module } from '@nestjs/common';
import { OpenRouterService } from './openrouter.service.js';

@Module({
  providers: [OpenRouterService],
  exports: [OpenRouterService],
})
export class OpenRouterModule {}
