import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import {
  DecideRateLimitGuard,
  VerifyRateLimitGuard,
} from '../common/rate-limit.guard.js';
import { CreateMilestoneDto } from './dto/create-milestone.dto.js';
import { InvestorDecisionDto } from './dto/investor-decision.dto.js';
import { MilestonesService } from './milestones.service.js';

@Controller('milestones')
export class MilestonesController {
  constructor(private readonly milestonesService: MilestonesService) {}

  @Post()
  @UseGuards(VerifyRateLimitGuard)
  create(@Body() dto: CreateMilestoneDto) {
    return this.milestonesService.create(dto);
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
  @UseGuards(DecideRateLimitGuard)
  decide(@Param('id') id: string, @Body() dto: InvestorDecisionDto) {
    return this.milestonesService.decide(id, dto);
  }
}
