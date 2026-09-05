import { Injectable, Logger } from '@nestjs/common';
import {
  VerdictResult,
  VerdictSchema,
  normalizeVerdictPayload,
} from './verdict.schema.js';
import { OpenRouterService } from '../openrouter/openrouter.service.js';

export interface VerifyMilestoneInput {
  title: string;
  claim: string;
  proofType: string;
  proofUrl?: string | null;
  proofText?: string | null;
}

const VERDICT_JSON_SHAPE = `{
  "recommendation": "approve" | "reject" | "needs_more_info",
  "summary": "one short paragraph",
  "confirmed": [{ "claim": string, "evidence": string, "sourceUrl"?: string, "confidence": 0-1 }],
  "unconfirmed": [{ "claim": string, "evidence": string, "sourceUrl"?: string, "confidence": 0-1 }],
  "reasoning": "why this recommendation"
}`;

@Injectable()
export class VerificationService {
  private readonly logger = new Logger(VerificationService.name);

  constructor(private readonly openRouter: OpenRouterService) {}

  async verifyMilestone(input: VerifyMilestoneInput): Promise<VerdictResult> {
    if (!this.openRouter.hasKey) {
      return this.offlineVerdict(input);
    }

    try {
      return await this.runAgent(input);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Verification agent failed: ${message}`);
      return this.offlineVerdict(input, true);
    }
  }

  private async runAgent(input: VerifyMilestoneInput): Promise<VerdictResult> {
    const userContent = [
      `Milestone: ${input.title}`,
      `Claim: ${input.claim}`,
      `Proof type: ${input.proofType}`,
      input.proofUrl ? `Proof URL: ${input.proofUrl}` : null,
      input.proofText ? `Proof text/excerpt:\n${input.proofText}` : null,
      '',
      'Return ONLY JSON with this exact shape:',
      VERDICT_JSON_SHAPE,
      '',
      'Rules:',
      '- Do not invent sources or URLs.',
      '- Every confirmed/unconfirmed item MUST include claim, evidence, confidence.',
      '- If you cannot verify live, use needs_more_info and explain in unconfirmed.evidence.',
      '- Prefer needs_more_info over a weak approve.',
    ]
      .filter(Boolean)
      .join('\n');

    const response = await this.openRouter.openai.chat.completions.create({
      model: 'openai/gpt-4o-mini',
      temperature: 0.1,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content:
            'You are MIVA, a milestone verification agent for investors. Be skeptical. Output valid JSON only.',
        },
        { role: 'user', content: userContent },
      ],
    });

    const raw = response.choices[0]?.message?.content ?? '{}';
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      this.logger.warn('Model returned non-JSON; wrapping as unconfirmed');
      parsed = {
        recommendation: 'needs_more_info',
        summary: 'Model returned non-JSON output.',
        confirmed: [],
        unconfirmed: [
          {
            claim: input.claim,
            evidence: raw.slice(0, 500),
            confidence: 0.2,
          },
        ],
        reasoning: 'Could not parse model output as JSON.',
      };
    }

    return VerdictSchema.parse(normalizeVerdictPayload(parsed, input.claim));
  }

  private offlineVerdict(
    input: VerifyMilestoneInput,
    failed = false,
  ): VerdictResult {
    const hasProof = Boolean(input.proofUrl || input.proofText);
    return VerdictSchema.parse({
      recommendation: hasProof ? 'needs_more_info' : 'reject',
      summary: failed
        ? 'Agent run failed; returning a conservative placeholder verdict.'
        : 'No Orbio/OpenRouter key configured; returning a scaffold verdict.',
      confirmed: [],
      unconfirmed: [
        {
          claim: input.claim,
          evidence: hasProof
            ? 'Proof was submitted but live verification is unavailable in this environment.'
            : 'No proof URL or text was provided.',
          sourceUrl: input.proofUrl || undefined,
          confidence: 0.1,
        },
      ],
      reasoning: failed
        ? 'Live model call failed validation or transport. Retry the submission; if it keeps failing, check API logs.'
        : 'Set OPENROUTER_API_KEY in api/.env to enable live verification.',
    });
  }
}
