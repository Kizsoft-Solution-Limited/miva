import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Request } from 'express';
import type { AuthSession } from '../auth/session.js';
import { FounderGuard, InvestorGuard } from '../auth/role.guard.js';
import {
  DecideRateLimitGuard,
  VerifyRateLimitGuard,
} from '../common/rate-limit.guard.js';
import { CreateMilestoneDto } from './dto/create-milestone.dto.js';
import { InvestorDecisionDto } from './dto/investor-decision.dto.js';
import { UpdateProofDto } from './dto/update-proof.dto.js';
import { MilestonesService } from './milestones.service.js';

type IncomingFile = {
  originalname: string;
  mimetype: string;
  buffer: Buffer;
  size: number;
};

type AuthedRequest = Request & { auth?: AuthSession };

@Controller('milestones')
export class MilestonesController {
  constructor(private readonly milestonesService: MilestonesService) {}

  @Post()
  @UseGuards(VerifyRateLimitGuard, FounderGuard)
  @UseInterceptors(FileInterceptor('file'))
  create(
    @Req() req: AuthedRequest,
    @Body() dto: CreateMilestoneDto,
    @UploadedFile() file?: IncomingFile,
  ) {
    return this.milestonesService.create(dto, file, req.auth?.userId);
  }

  @Get()
  findAll() {
    return this.milestonesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.milestonesService.findOne(id);
  }

  @Patch(':id/decision')
  @UseGuards(DecideRateLimitGuard, InvestorGuard)
  decide(@Param('id') id: string, @Body() dto: InvestorDecisionDto) {
    return this.milestonesService.decide(id, dto);
  }

  @Patch(':id/proof')
  @UseGuards(FounderGuard)
  @UseInterceptors(FileInterceptor('file'))
  updateProof(
    @Param('id') id: string,
    @Body() dto: UpdateProofDto,
    @UploadedFile() file?: IncomingFile,
  ) {
    return this.milestonesService.updateProof(id, dto, file);
  }

  @Post(':id/recheck')
  @UseGuards(VerifyRateLimitGuard, FounderGuard)
  @UseInterceptors(FileInterceptor('file'))
  recheck(
    @Req() req: AuthedRequest,
    @Param('id') id: string,
    @Body() dto: UpdateProofDto,
    @UploadedFile() file?: IncomingFile,
  ) {
    return this.milestonesService.recheck(id, dto, file, req.auth?.userId);
  }
}
