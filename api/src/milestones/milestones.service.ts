import { Injectable, NotFoundException } from '@nestjs/common';
import { InvestorDecision, Recommendation } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
import { VerificationService } from '../verification/verification.service.js';
import { CreateMilestoneDto } from './dto/create-milestone.dto.js';
import { InvestorDecisionDto } from './dto/investor-decision.dto.js';

@Injectable()
export class MilestonesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly verification: VerificationService,
  ) {}

  async create(dto: CreateMilestoneDto) {
    const milestone = await this.prisma.milestone.create({
      data: {
        title: dto.title,
        claim: dto.claim,
        founderName: dto.founderName,
        proofType: dto.proofType,
        proofUrl: dto.proofUrl,
        proofText: dto.proofText,
      },
    });

    const result = await this.verification.verifyMilestone({
      title: milestone.title,
      claim: milestone.claim,
      proofType: milestone.proofType,
      proofUrl: milestone.proofUrl,
      proofText: milestone.proofText,
    });

    const verdict = await this.prisma.verdict.create({
      data: {
        milestoneId: milestone.id,
        recommendation: result.recommendation as Recommendation,
        summary: result.summary,
        confirmedJson: JSON.stringify(result.confirmed),
        unconfirmedJson: JSON.stringify(result.unconfirmed),
        reasoning: result.reasoning,
      },
    });

    return this.serialize(milestone, verdict);
  }

  async findAll() {
    const rows = await this.prisma.milestone.findMany({
      include: { verdict: true },
      orderBy: { createdAt: 'desc' },
    });
    return rows.map((row) => this.serialize(row, row.verdict));
  }

  async findOne(id: string) {
    const row = await this.prisma.milestone.findUnique({
      where: { id },
      include: { verdict: true },
    });
    if (!row) {
      throw new NotFoundException(`Milestone ${id} not found`);
    }
    return this.serialize(row, row.verdict);
  }

  async decide(id: string, dto: InvestorDecisionDto) {
    const milestone = await this.prisma.milestone.findUnique({
      where: { id },
      include: { verdict: true },
    });
    if (!milestone?.verdict) {
      throw new NotFoundException(`Verdict for milestone ${id} not found`);
    }

    const verdict = await this.prisma.verdict.update({
      where: { id: milestone.verdict.id },
      data: {
        investorDecision: dto.decision as InvestorDecision,
        investorNote: dto.note,
      },
    });

    return this.serialize(milestone, verdict);
  }

  private serialize(
    milestone: {
      id: string;
      title: string;
      claim: string;
      founderName: string;
      proofType: string;
      proofUrl: string | null;
      proofText: string | null;
      createdAt: Date;
      updatedAt: Date;
    },
    verdict: {
      id: string;
      recommendation: Recommendation;
      summary: string;
      confirmedJson: string;
      unconfirmedJson: string;
      reasoning: string;
      investorDecision: InvestorDecision;
      investorNote: string | null;
      createdAt: Date;
    } | null,
  ) {
    return {
      id: milestone.id,
      title: milestone.title,
      claim: milestone.claim,
      founderName: milestone.founderName,
      proofType: milestone.proofType,
      proofUrl: milestone.proofUrl,
      proofText: milestone.proofText,
      createdAt: milestone.createdAt,
      updatedAt: milestone.updatedAt,
      verdict: verdict
        ? {
            id: verdict.id,
            recommendation: verdict.recommendation,
            summary: verdict.summary,
            confirmed: JSON.parse(verdict.confirmedJson) as unknown[],
            unconfirmed: JSON.parse(verdict.unconfirmedJson) as unknown[],
            reasoning: verdict.reasoning,
            investorDecision: verdict.investorDecision,
            investorNote: verdict.investorNote,
            createdAt: verdict.createdAt,
          }
        : null,
    };
  }
}
