import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MilestonesModule } from './milestones/milestones.module.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { VerificationModule } from './verification/verification.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    VerificationModule,
    MilestonesModule,
  ],
})
export class AppModule {}
