import { Module } from '@nestjs/common';
import { VerificationModule } from '../verification/verification.module.js';
import { MilestonesController } from './milestones.controller.js';
import { MilestonesService } from './milestones.service.js';

@Module({
  imports: [VerificationModule],
  controllers: [MilestonesController],
  providers: [MilestonesService],
})
export class MilestonesModule {}
