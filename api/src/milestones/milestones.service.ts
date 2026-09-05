import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InvestorDecision, Recommendation, Verdict } from '@prisma/client';
import { sanitizePublicUrl } from '../lib/public-url.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { VerificationService } from '../verification/verification.service.js';
import { CreateMilestoneDto } from './dto/create-milestone.dto.js';
import { InvestorDecisionDto } from './dto/investor-decision.dto.js';
import { UpdateProofDto } from './dto/update-proof.dto.js';

const MAX_PDF_BYTES = 4 * 1024 * 1024;

export type UploadedProofFile = {
  originalname: string;
  mimetype: string;
  buffer: Buffer;
  size: number;
};

@Injectable()
export class MilestonesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly verification: VerificationService,
  ) {}

  async create(dto: CreateMilestoneDto, file?: UploadedProofFile) {
    const proof = this.normalizeProofInput(dto.proofType, dto.proofUrl, dto.proofText, file);
    const milestone = await this.prisma.milestone.create({
      data: {
        title: dto.title,
        claim: dto.claim,
        founderName: dto.founderName,
        proofType: proof.proofType,
        proofUrl: proof.proofUrl,
        proofText: proof.proofText,
        proofFileName: proof.proofFileName,
        proofMime: proof.proofMime,
        proofData: proof.proofData,
      },
    });

    return this.runVerification(milestone.id);
  }

  async findAll() {
    const rows = await this.prisma.milestone.findMany({
      include: { verdicts: { orderBy: { version: 'desc' } } },
      orderBy: { createdAt: 'desc' },
    });
    return rows.map((row) => this.serialize(row, row.verdicts));
  }

  async findOne(id: string) {
    const row = await this.prisma.milestone.findUnique({
      where: { id },
      include: { verdicts: { orderBy: { version: 'desc' } } },
    });
    if (!row) {
      throw new NotFoundException(`Milestone ${id} not found`);
    }
    return this.serialize(row, row.verdicts);
  }

  async decide(id: string, dto: InvestorDecisionDto) {
    const milestone = await this.prisma.milestone.findUnique({
      where: { id },
      include: { verdicts: { orderBy: { version: 'desc' }, take: 1 } },
    });
    const current = milestone?.verdicts[0];
    if (!milestone || !current) {
      throw new NotFoundException(`Verdict for milestone ${id} not found`);
    }

    await this.prisma.verdict.update({
      where: { id: current.id },
      data: {
        investorDecision: dto.decision as InvestorDecision,
        investorNote: dto.note,
      },
    });

    return this.findOne(id);
  }

  async updateProof(id: string, dto: UpdateProofDto, file?: UploadedProofFile) {
    const existing = await this.prisma.milestone.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Milestone ${id} not found`);
    }

    const proofType = dto.proofType ?? existing.proofType;
    const nextUrl =
      dto.proofUrl !== undefined ? dto.proofUrl : existing.proofUrl ?? undefined;
    const nextText =
      dto.proofText !== undefined ? dto.proofText : existing.proofText ?? undefined;

    let proofFileName = existing.proofFileName;
    let proofMime = existing.proofMime;
    let proofData = existing.proofData;

    if (file) {
      this.assertPdfUpload(file);
      proofFileName = file.originalname.slice(0, 180);
      proofMime = file.mimetype;
      proofData = file.buffer.toString('base64');
    } else if (dto.clearFile || proofType !== 'pdf') {
      proofFileName = null;
      proofMime = null;
      proofData = null;
    }

    const url = sanitizePublicUrl(nextUrl ?? undefined);
    const text = nextText?.trim() || null;
    const finalType = file ? 'pdf' : proofType;

    if (finalType === 'pdf' && !url && !proofData && !text) {
      throw new BadRequestException(
        'PDF proof needs a public PDF link or an uploaded file.',
      );
    }

    await this.prisma.milestone.update({
      where: { id },
      data: {
        claim: dto.claim ?? existing.claim,
        proofType: finalType,
        proofUrl: url,
        proofText: text,
        proofFileName,
        proofMime,
        proofData,
      },
    });

    return this.findOne(id);
  }

  async recheck(id: string, dto?: UpdateProofDto, file?: UploadedProofFile) {
    if (dto || file) {
      await this.updateProof(id, dto || {}, file);
    }
    return this.runVerification(id);
  }

  private async runVerification(milestoneId: string) {
    const milestone = await this.prisma.milestone.findUnique({
      where: { id: milestoneId },
      include: { verdicts: { orderBy: { version: 'desc' }, take: 1 } },
    });
    if (!milestone) {
      throw new NotFoundException(`Milestone ${milestoneId} not found`);
    }

    const input = {
      title: milestone.title,
      claim: milestone.claim,
      founderName: milestone.founderName,
      proofType: milestone.proofType,
      proofUrl: milestone.proofUrl,
      proofText: milestone.proofText,
      proofFileName: milestone.proofFileName,
      proofMime: milestone.proofMime,
      proofData: milestone.proofData,
    };

    const result = await this.verification.verifyMilestone(input);
    const check = this.verification.buildCheckMeta(input);
    const nextVersion = (milestone.verdicts[0]?.version ?? 0) + 1;

    await this.prisma.verdict.create({
      data: {
        milestoneId: milestone.id,
        version: nextVersion,
        recommendation: result.recommendation as Recommendation,
        summary: result.summary,
        confirmedJson: JSON.stringify(result.confirmed),
        unconfirmedJson: JSON.stringify(result.unconfirmed),
        reasoning: result.reasoning,
        checkJson: JSON.stringify(check),
      },
    });

    return this.findOne(milestoneId);
  }

  private normalizeProofInput(
    proofType: string,
    proofUrl: string | undefined | null,
    proofText: string | undefined | null,
    file?: UploadedProofFile,
    opts?: {
      keepExistingFile?: boolean;
      existingFile?: {
        proofFileName: string | null;
        proofMime: string | null;
        proofData: string | null;
      };
    },
  ) {
    let proofFileName: string | null = null;
    let proofMime: string | null = null;
    let proofData: string | null = null;

    if (file) {
      this.assertPdfUpload(file);
      proofFileName = file.originalname.slice(0, 180);
      proofMime = file.mimetype;
      proofData = file.buffer.toString('base64');
      proofType = 'pdf';
    } else if (opts?.keepExistingFile && opts.existingFile?.proofData) {
      proofFileName = opts.existingFile.proofFileName;
      proofMime = opts.existingFile.proofMime;
      proofData = opts.existingFile.proofData;
    }

    const url = sanitizePublicUrl(proofUrl ?? undefined);
    const text = proofText?.trim() || null;

    if (proofType === 'pdf' && !url && !proofData && !text) {
      throw new BadRequestException(
        'PDF proof needs a public PDF link or an uploaded file.',
      );
    }

    return {
      proofType,
      proofUrl: url,
      proofText: text,
      proofFileName,
      proofMime,
      proofData,
    };
  }

  private assertPdfUpload(file: UploadedProofFile) {
    if (file.size > MAX_PDF_BYTES) {
      throw new BadRequestException('PDF must be 4MB or smaller.');
    }
    const okMime =
      file.mimetype === 'application/pdf' ||
      file.originalname.toLowerCase().endsWith('.pdf');
    if (!okMime) {
      throw new BadRequestException('Only PDF uploads are supported.');
    }
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
      proofFileName: string | null;
      proofMime: string | null;
      proofData: string | null;
      createdAt: Date;
      updatedAt: Date;
    },
    verdicts: Verdict[],
  ) {
    const current = verdicts[0] ?? null;
    const history = verdicts.map((v) => this.serializeVerdict(v));

    const checkFromJson = current?.checkJson
      ? (JSON.parse(current.checkJson) as Record<string, boolean>)
      : null;

    return {
      id: milestone.id,
      title: milestone.title,
      claim: milestone.claim,
      founderName: milestone.founderName,
      proofType: milestone.proofType,
      proofUrl: milestone.proofUrl,
      proofText: milestone.proofText,
      proofFileName: milestone.proofFileName,
      hasProofFile: Boolean(milestone.proofData),
      createdAt: milestone.createdAt,
      updatedAt: milestone.updatedAt,
      verdict: history[0] ?? null,
      verdictHistory: history,
      check: checkFromJson ?? {
        orbio: true,
        webSearch: ['url', 'metric', 'repo', 'pdf'].includes(milestone.proofType),
        pdf:
          milestone.proofType === 'pdf' &&
          (Boolean(milestone.proofData) ||
            Boolean(milestone.proofUrl?.toLowerCase().includes('.pdf'))),
        structuredJson: Boolean(current),
      },
    };
  }

  private serializeVerdict(verdict: Verdict) {
    return {
      id: verdict.id,
      version: verdict.version,
      recommendation: verdict.recommendation,
      summary: verdict.summary,
      confirmed: JSON.parse(verdict.confirmedJson) as unknown[],
      unconfirmed: JSON.parse(verdict.unconfirmedJson) as unknown[],
      reasoning: verdict.reasoning,
      investorDecision: verdict.investorDecision,
      investorNote: verdict.investorNote,
      createdAt: verdict.createdAt,
    };
  }
}
