import { Injectable, Logger } from '@nestjs/common';
import {
  Finding,
  VerdictResult,
  VerdictSchema,
  normalizeVerdictPayload,
} from './verdict.schema.js';
import { OpenRouterService } from '../openrouter/openrouter.service.js';
import { redactSecrets, sanitizePublicUrl } from '../lib/public-url.js';
import { probePublicUrl, type UrlProbe } from '../lib/url-probe.js';

export interface VerifyMilestoneInput {
  title: string;
  claim: string;
  proofType: string;
  proofUrl?: string | null;
  proofText?: string | null;
  proofFileName?: string | null;
  proofMime?: string | null;
  /** Raw base64 (no data: prefix) */
  proofData?: string | null;
}

const VERDICT_JSON_SHAPE = `{
  "recommendation": "approve" | "reject" | "needs_more_info",
  "summary": "one short paragraph for the investor",
  "confirmed": [{ "claim": string, "evidence": string, "sourceUrl"?: string, "confidence": 0-1 }],
  "unconfirmed": [{ "claim": string, "evidence": string, "sourceUrl"?: string, "confidence": 0-1 }],
  "reasoning": "plain explanation of the call"
}`;

const SYSTEM_PROMPT = `You are MIVA, a skeptical milestone verification agent for investors.

Your job is not to cheerlead founders. Your job is to separate what can be verified from what cannot.

Output valid JSON only. Never invent sources, metrics, press, customers, or URLs.

Decision rubric:
- approve — only if the core claim is clearly backed by independent, checkable evidence (live URL content, PDF text, reputable search results). Confirmed[] must be non-empty and specific.
- needs_more_info — default when proof is thin, partial, self-attested only, off-claim, or ambiguous. Prefer this over a weak approve.
- reject — proof contradicts the claim, URL/doc is clearly bogus or unreachable when the claim depends on it, or there is no usable proof at all.

Checks to run mentally:
1) What exact claim is being made?
2) What evidence was supplied?
3) What did live web / PDF / server probe actually show?
4) Does evidence support, contradict, or miss the claim?
5) Put support in confirmed with real sourceUrl when possible; put gaps/contradictions in unconfirmed.

Confidence guide: 0.8+ only with direct evidence; 0.4–0.7 partial; below 0.4 weak/hearsay.`;

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

  buildCheckMeta(input: VerifyMilestoneInput) {
    const proofUrl = sanitizePublicUrl(input.proofUrl);
    const hasUpload = Boolean(input.proofData);
    const pdf =
      input.proofType === 'pdf' &&
      (hasUpload || Boolean(proofUrl && this.looksLikePdf(proofUrl)));
    return {
      orbio: this.openRouter.hasKey,
      webSearch: this.shouldUseWebSearch(input.proofType, proofUrl ?? undefined),
      pdf,
      structuredJson: true,
    };
  }

  private async runAgent(input: VerifyMilestoneInput): Promise<VerdictResult> {
    const proofUrl = sanitizePublicUrl(input.proofUrl) ?? undefined;
    const wantsWeb = this.shouldUseWebSearch(input.proofType, proofUrl);
    const pdfRef = this.resolvePdfRef(input, proofUrl);
    const hasProof = Boolean(
      proofUrl || input.proofText?.trim() || input.proofData,
    );

    if (!hasProof) {
      return VerdictSchema.parse({
        recommendation: 'reject',
        summary: 'No usable proof was submitted with this claim.',
        confirmed: [],
        unconfirmed: [
          {
            claim: input.claim,
            evidence:
              'Founder provided a claim with no URL, PDF, or excerpt to check.',
            confidence: 0.95,
          },
        ],
        reasoning:
          'Without proof there is nothing to verify. Investor should reject or demand evidence.',
      });
    }

    // Invalid/blocked URL string that founder typed — treat as bad proof early.
    if (input.proofUrl?.trim() && !proofUrl) {
      return VerdictSchema.parse({
        recommendation: 'reject',
        summary: 'Proof URL is invalid or not a public http(s) link.',
        confirmed: [],
        unconfirmed: [
          {
            claim: input.claim,
            evidence: `Submitted URL could not be used: ${input.proofUrl.trim()}`,
            confidence: 0.9,
          },
        ],
        reasoning:
          'Only public http(s) URLs are checked. Localhost, private IPs, and malformed links are rejected.',
      });
    }

    const probe = proofUrl ? await probePublicUrl(proofUrl) : null;

    const userText = [
      `Milestone: ${input.title}`,
      `Claim: ${input.claim}`,
      `Proof type: ${input.proofType}`,
      proofUrl ? `Proof URL: ${proofUrl}` : null,
      input.proofFileName ? `Uploaded file: ${input.proofFileName}` : null,
      input.proofText ? `Proof text/excerpt:\n${input.proofText}` : null,
      probe ? `Server probe (authoritative reachability):\n${this.formatProbe(probe)}` : null,
      wantsWeb
        ? 'Web search is enabled. Use live results. Prefer the proof URL and reputable sources. Cite real URLs in sourceUrl.'
        : null,
      pdfRef
        ? 'A PDF is attached. Ground findings in what the document actually says — quote or paraphrase precisely.'
        : null,
      '',
      'Return ONLY JSON with this exact shape:',
      VERDICT_JSON_SHAPE,
      '',
      'Hard rules:',
      '- Do not invent sources, URLs, metrics, customers, or press.',
      '- Every confirmed/unconfirmed item MUST include claim, evidence, confidence.',
      '- If the claim is about a live site/page and the server probe failed or returned non-OK, do not approve.',
      '- If evidence is thin, partial, or only the founder asserting it → needs_more_info.',
      '- approve only when confirmed evidence clearly covers the core claim.',
      '- reject when proof contradicts the claim or is clearly bogus/unreachable for a reachability claim.',
      '- Put leftover gaps in unconfirmed even when recommending approve.',
    ]
      .filter(Boolean)
      .join('\n');

    const { content, citations } = await this.openRouter.chatForVerification({
      system: SYSTEM_PROMPT,
      userText,
      webSearch: wantsWeb,
      pdfUrl: pdfRef?.data,
      pdfFilename: pdfRef?.filename,
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

    let verdict = VerdictSchema.parse(
      normalizeVerdictPayload(parsed, input.claim),
    );
    verdict = this.attachCitations(verdict, citations, proofUrl);
    verdict = this.enforceConsistency(verdict, input, probe);
    return verdict;
  }

  private formatProbe(probe: UrlProbe): string {
    if (!probe.ok) {
      return [
        `url: ${probe.url}`,
        `reachable: no`,
        probe.status != null ? `status: ${probe.status}` : null,
        probe.error ? `error: ${probe.error}` : null,
      ]
        .filter(Boolean)
        .join('\n');
    }
    return [
      `url: ${probe.url}`,
      `reachable: yes`,
      `status: ${probe.status}`,
      probe.finalUrl && probe.finalUrl !== probe.url
        ? `finalUrl: ${probe.finalUrl}`
        : null,
      probe.contentType ? `contentType: ${probe.contentType}` : null,
      probe.title ? `title: ${probe.title}` : null,
    ]
      .filter(Boolean)
      .join('\n');
  }

  /** Keep the model honest when it over-approves. */
  private enforceConsistency(
    verdict: VerdictResult,
    input: VerifyMilestoneInput,
    probe: UrlProbe | null,
  ): VerdictResult {
    let recommendation = verdict.recommendation;
    const reasoningBits: string[] = [];

    const claimLooksLive =
      /\b(live|online|up|reachable|deployed|public site|website|url|domain)\b/i.test(
        `${input.title} ${input.claim}`,
      );

    if (
      recommendation === 'approve' &&
      verdict.confirmed.length === 0
    ) {
      recommendation = 'needs_more_info';
      reasoningBits.push(
        'Downgraded approve → needs_more_info because confirmed[] was empty.',
      );
    }

    if (
      recommendation === 'approve' &&
      probe &&
      !probe.ok &&
      (input.proofType === 'url' || claimLooksLive)
    ) {
      recommendation = 'reject';
      reasoningBits.push(
        'Downgraded approve → reject because the proof URL was not reachable.',
      );
    }

    if (
      recommendation === 'approve' &&
      verdict.confirmed.every((f) => f.confidence < 0.55)
    ) {
      recommendation = 'needs_more_info';
      reasoningBits.push(
        'Downgraded approve → needs_more_info because confirmed confidence stayed low.',
      );
    }

    if (recommendation === verdict.recommendation) return verdict;

    return {
      ...verdict,
      recommendation,
      reasoning: [verdict.reasoning, ...reasoningBits].join(' '),
    };
  }

  private resolvePdfRef(
    input: VerifyMilestoneInput,
    proofUrl?: string,
  ): { data: string; filename: string } | undefined {
    if (input.proofType !== 'pdf') return undefined;
    if (input.proofData) {
      const mime = input.proofMime || 'application/pdf';
      return {
        data: `data:${mime};base64,${input.proofData}`,
        filename: input.proofFileName || 'upload.pdf',
      };
    }
    if (proofUrl && this.looksLikePdf(proofUrl)) {
      return { data: proofUrl, filename: 'document.pdf' };
    }
    return undefined;
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
    const hasProof = Boolean(
      input.proofUrl || input.proofText || input.proofData,
    );
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
            : 'No proof URL, text, or file was provided.',
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
