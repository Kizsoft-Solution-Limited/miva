import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { CreateMilestoneDto } from './dto/create-milestone.dto.js';
import { InvestorDecisionDto } from './dto/investor-decision.dto.js';
import { MilestonesService } from './milestones.service.js';

@Controller('milestones')
export class MilestonesController {
  constructor(private readonly milestonesService: MilestonesService) {}

  @Post()
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
  decide(@Param('id') id: string, @Body() dto: InvestorDecisionDto) {
    return this.milestonesService.decide(id, dto);
  }
}
