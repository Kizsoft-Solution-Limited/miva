import { Injectable, Logger } from '@nestjs/common';
import {
  Finding,
  VerdictResult,
  VerdictSchema,
  normalizeVerdictPayload,
} from './verdict.schema.js';
import { OpenRouterService } from '../openrouter/openrouter.service.js';
import { redactSecrets, sanitizePublicUrl } from '../lib/public-url.js';

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
      const message = redactSecrets(
        error instanceof Error ? error.message : String(error),
      );
      this.logger.error(`Verification agent failed: ${message}`);
      return this.offlineVerdict(input, true);
    }
  }

  private async runAgent(input: VerifyMilestoneInput): Promise<VerdictResult> {
    const proofUrl = sanitizePublicUrl(input.proofUrl) ?? undefined;
    const wantsWeb = this.shouldUseWebSearch(input.proofType, proofUrl);
    const pdfUrl =
      input.proofType === 'pdf' && proofUrl && this.looksLikePdf(proofUrl)
        ? proofUrl
        : undefined;

    const userText = [
      `Milestone: ${input.title}`,
      `Claim: ${input.claim}`,
      `Proof type: ${input.proofType}`,
      proofUrl ? `Proof URL: ${proofUrl}` : null,
      input.proofText ? `Proof text/excerpt:\n${input.proofText}` : null,
      wantsWeb
        ? 'Web search is enabled. Use live results. Put real source URLs in sourceUrl fields.'
        : null,
      pdfUrl
        ? 'A PDF is attached. Ground the verdict in what the document actually says.'
        : null,
      '',
      'Return ONLY JSON with this exact shape:',
      VERDICT_JSON_SHAPE,
      '',
      'Rules:',
      '- Do not invent sources, URLs, metrics, or press mentions.',
      '- Every confirmed/unconfirmed item MUST include claim, evidence, confidence.',
      '- confirmed[].sourceUrl should be a real URL you used (proof URL or search citation).',
      '- If evidence is thin, partial, or only the founder saying so → needs_more_info (not approve).',
      '- approve only when the claim is clearly backed by verifiable evidence.',
      '- reject when the proof contradicts the claim or is clearly bogus.',
    ]
      .filter(Boolean)
      .join('\n');

    const { content, citations } = await this.openRouter.chatForVerification({
      system:
        'You are MIVA, a milestone verification agent for investors. Be skeptical. Prefer needs_more_info over a weak approve. Output valid JSON only.',
      userText,
      webSearch: wantsWeb,
      pdfUrl,
    });

    let parsed: unknown;
    try {
      parsed = JSON.parse(content);
    } catch {
      this.logger.warn('Model returned non-JSON; wrapping as unconfirmed');
      parsed = {
        recommendation: 'needs_more_info',
        summary: 'Model returned non-JSON output.',
        confirmed: [],
        unconfirmed: [
          {
            claim: input.claim,
            evidence: content.slice(0, 500),
            confidence: 0.2,
          },
        ],
        reasoning: 'Could not parse model output as JSON.',
      };
    }

    const verdict = VerdictSchema.parse(
      normalizeVerdictPayload(parsed, input.claim),
    );
    return this.attachCitations(verdict, citations, proofUrl);
  }

  private shouldUseWebSearch(proofType: string, proofUrl?: string): boolean {
    if (['url', 'metric', 'repo', 'pdf'].includes(proofType)) return true;
    return Boolean(proofUrl);
  }

  private looksLikePdf(url: string): boolean {
    const lower = url.toLowerCase();
    return lower.includes('.pdf') || lower.includes('application/pdf');
  }

  private attachCitations(
    verdict: VerdictResult,
    citations: Array<{ url: string; title?: string; excerpt?: string }>,
    proofUrl?: string,
  ): VerdictResult {
    if (!citations.length && !proofUrl) return verdict;

    const fill = (items: Finding[]): Finding[] =>
      items.map((item) => {
        if (item.sourceUrl) return item;
        const match =
          citations.find((c) => {
            try {
              const host = new URL(c.url).hostname.toLowerCase();
              return item.evidence.toLowerCase().includes(host);
            } catch {
              return false;
            }
          }) || citations[0];
        if (match?.url) {
          return { ...item, sourceUrl: match.url };
        }
        if (proofUrl && item.confidence >= 0.5) {
          return { ...item, sourceUrl: proofUrl };
        }
        return item;
      });

    return {
      ...verdict,
      confirmed: fill(verdict.confirmed),
      unconfirmed: fill(verdict.unconfirmed),
    };
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
          sourceUrl: sanitizePublicUrl(input.proofUrl) ?? undefined,
          confidence: 0.1,
        },
      ],
      reasoning: failed
        ? 'Live model call failed validation or transport. Retry the submission; if it keeps failing, check API logs.'
        : 'Set OPENROUTER_API_KEY in api/.env to enable live verification.',
    });
  }
}
