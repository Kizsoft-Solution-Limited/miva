import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { FounderGuard, InvestorGuard } from '../auth/role.guard.js';
import {
  DecideRateLimitGuard,
  VerifyRateLimitGuard,
} from '../common/rate-limit.guard.js';
import { VerificationModule } from '../verification/verification.module.js';
import { MilestonesController } from './milestones.controller.js';
import { MilestonesService } from './milestones.service.js';

@Module({
  imports: [VerificationModule, AuthModule],
  controllers: [MilestonesController],
  providers: [
    MilestonesService,
    VerifyRateLimitGuard,
    DecideRateLimitGuard,
    FounderGuard,
    InvestorGuard,
  ],
})
export class MilestonesModule {}
