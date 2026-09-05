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
  founderName?: string | null;
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

Mission: verify the factual milestone claim against checkable evidence. Do not cheerlead. Do not give investment advice ("good to invest" / "raise" / "pass").

Output valid JSON only. Never invent sources, metrics, press, customers, registry filings, LinkedIn profiles, ages, founding years, funding rounds, or URLs.

Decision rubric:
- approve — the core claim is clearly backed by independent, checkable evidence. Confirmed[] must include ≥1 PRIMARY finding that directly answers the claim.
- needs_more_info — default when evidence is thin, partial, self-attested, ambiguous, or only weakly related. Prefer this over a weak approve.
- reject — proof contradicts the claim, or required proof is clearly bogus / unreachable when the claim depends on it.

PRIMARY vs SECONDARY findings (critical):
1) PRIMARY (no prefix) — any finding that directly answers THIS milestone claim. Always use primary for the main question, whatever it is (site live, company age, founder identity, metric, repo activity, PDF contents, press coverage, etc.).
2) SECONDARY context — ONLY bonus extras when the claim is about something else. Prefix exactly:
   - "Context · Company"
   - "Context · Founder"
   - "Context · Metric trend"
   Secondary context alone never justifies approve.
   Wrong: claim is "confirm founding year" and you only emit "Context · Company". Right: emit a normal confirmed/unconfirmed finding about the founding year.

Be thorough for EVERY claim type:
- Live URL / product site: use server probe + page title/content + search. Non-OK probe → do not approve reachability claims.
- Repo: public repo existence, visibility, recent activity only if checkable; no fake stars/commits.
- PDF / docs: ground in document text; quote or paraphrase precisely; do not invent clauses.
- Metric: match the number/timeframe to a public source or mark unconfirmed; no invented dashboards.
- Company age / registry: WHOIS/domain registration, About/footer copyright, LinkedIn company page, registry, press with an explicit founding year. If the server probe includes domainCreated, cite it as a PRIMARY unconfirmed/partial finding about domain age — clearly label it as domain registration, not company founding. Weak signals alone → needs_more_info. Never invent a year.
- Founder / team: public LinkedIn/bio/press only with real URLs; do not invent profiles.
- Press / coverage: find the article; if missing → unconfirmed/reject as appropriate.

Always separate what is proven from what is missing. Put leftovers in unconfirmed even on approve.

Confidence: 0.8+ direct evidence; 0.4–0.7 partial; <0.4 weak/hearsay.`;

export function claimTopics(title: string, claim: string) {
  const text = `${title} ${claim}`.toLowerCase();
  return {
    companyAge:
      /\b(age|founded|founding|incorporated|incorporation|registry|how old|established|since\s+\d{4}|company age)\b/.test(
        text,
      ),
    founder:
      /\b(founder|co-?founder|ceo|linkedin|who\s+is|team lead|director)\b/.test(
        text,
      ),
    metric:
      /\b(metric|users|mau|dau|revenue|mrr|arr|gmv|growth|%\s*mo|customers|subscribers)\b/.test(
        text,
      ),
    liveSite:
      /\b(live|online|up|reachable|deployed|public site|website|domain|url)\b/.test(
        text,
      ),
    repo: /\b(repo|github|gitlab|commit|open\s*source|pull request)\b/.test(
      text,
    ),
    press: /\b(press|techcrunch|featured|covered|article|news)\b/.test(text),
  };
}

function isContextFinding(claim: string) {
  return claim.toLowerCase().startsWith('context ·');
}

function stripContextPrefix(claim: string) {
  return claim.replace(/^context\s*·\s*/i, '').trim();
}

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
      webSearch: this.shouldUseWebSearch(
        input.proofType,
        proofUrl ?? undefined,
        input.founderName,
      ),
      pdf,
      structuredJson: true,
    };
  }

  private async runAgent(input: VerifyMilestoneInput): Promise<VerdictResult> {
    const proofUrl = sanitizePublicUrl(input.proofUrl) ?? undefined;
    const wantsWeb = this.shouldUseWebSearch(
      input.proofType,
      proofUrl,
      input.founderName,
    );
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

    const topics = claimTopics(input.title, input.claim);
    const playbook: string[] = [
      'Web search is enabled. Use live results and cite real sourceUrl values.',
      'PRIMARY job: answer the milestone claim. Put direct answers in confirmed/unconfirmed with NO Context prefix.',
      'SECONDARY Context · Company / Founder / Metric trend ONLY for bonus extras when the claim is about something else.',
      `Proof-type playbook (${input.proofType}):`,
    ];

    if (input.proofType === 'url' || topics.liveSite) {
      playbook.push(
        '- URL/live: trust the server probe for reachability; check page title/content; search for corroboration.',
      );
    }
    if (input.proofType === 'repo' || topics.repo) {
      playbook.push(
        '- Repo: confirm the public repo exists and matches the claim; do not invent stars/commits.',
      );
    }
    if (input.proofType === 'pdf') {
      playbook.push(
        '- PDF: extract only what the document states; quote/paraphrase; mark missing clauses unconfirmed.',
      );
    }
    if (input.proofType === 'metric' || topics.metric) {
      playbook.push(
        '- Metric: verify the number and timeframe against public sources; otherwise unconfirmed.',
      );
    }
    if (input.proofType === 'text') {
      playbook.push(
        '- Text-only proof is weak unless search finds independent corroboration.',
      );
    }
    if (topics.companyAge) {
      playbook.push(
        '- Age/founding is the PRIMARY claim here → normal findings, not Context ·. Use server probe domainCreated as domain-registration evidence (label clearly; not company founding). Also search About/footer, LinkedIn company, registry, press. Never invent a year.',
      );
    }
    if (topics.founder) {
      playbook.push(
        '- Founder identity is PRIMARY → normal findings. Search public LinkedIn/bio/press with real URLs only.',
      );
    }
    if (topics.press) {
      playbook.push(
        '- Press claim is PRIMARY → find the actual article URL or mark unconfirmed/reject.',
      );
    }
    playbook.push(
      'Do not give investment advice. Only verify facts stated in the claim.',
    );

    const userText = [
      `Milestone: ${input.title}`,
      `Claim: ${input.claim}`,
      input.founderName?.trim()
        ? `Founder name: ${input.founderName.trim()}`
        : null,
      `Proof type: ${input.proofType}`,
      proofUrl ? `Proof URL: ${proofUrl}` : null,
      input.proofFileName ? `Uploaded file: ${input.proofFileName}` : null,
      input.proofText ? `Proof text/excerpt:\n${input.proofText}` : null,
      probe
        ? `Server probe (authoritative reachability):\n${this.formatProbe(probe)}`
        : null,
      wantsWeb ? playbook.join('\n') : null,
      pdfRef
        ? 'A PDF is attached. Ground findings in what the document actually says — quote or paraphrase precisely.'
        : null,
      '',
      'Return ONLY JSON with this exact shape:',
      VERDICT_JSON_SHAPE,
      '',
      'Hard rules:',
      '- Do not invent sources, URLs, metrics, customers, press, company age, or founder profiles.',
      '- Every confirmed/unconfirmed item MUST include claim, evidence, confidence.',
      '- If the claim is about a live site/page and the server probe failed or returned non-OK, do not approve.',
      '- If evidence is thin, partial, or only the founder asserting it → needs_more_info.',
      '- Direct answers to THIS claim are PRIMARY findings (no Context · prefix).',
      '- Context · is bonus only when verifying a different claim; it alone never justifies approve.',
      '- Never recommend investing or not investing — only whether the claim is verified.',
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
    verdict = this.promoteMisfiledContext(verdict, input);
    verdict = this.enforceConsistency(verdict, input, probe);
    return verdict;
  }

  private promoteMisfiledContext(
    verdict: VerdictResult,
    input: VerifyMilestoneInput,
  ): VerdictResult {
    const topics = claimTopics(input.title, input.claim);
    const shouldPromote = (claim: string) => {
      if (!isContextFinding(claim)) return false;
      const lower = claim.toLowerCase();
      if (topics.companyAge && lower.startsWith('context · company')) {
        return true;
      }
      if (topics.founder && lower.startsWith('context · founder')) return true;
      if (topics.metric && lower.startsWith('context · metric')) return true;
      if (
        !topics.liveSite &&
        (lower.startsWith('context · company') ||
          lower.startsWith('context · founder') ||
          lower.startsWith('context · metric'))
      ) {
        return true;
      }
      return false;
    };

    const mapFinding = (f: Finding): Finding =>
      shouldPromote(f.claim)
        ? { ...f, claim: stripContextPrefix(f.claim) || f.claim }
        : f;

    const next = {
      ...verdict,
      confirmed: verdict.confirmed.map(mapFinding),
      unconfirmed: verdict.unconfirmed.map(mapFinding),
    };

    const changed =
      next.confirmed.some((f, i) => f.claim !== verdict.confirmed[i]?.claim) ||
      next.unconfirmed.some(
        (f, i) => f.claim !== verdict.unconfirmed[i]?.claim,
      );

    if (!changed) return verdict;
    return {
      ...next,
      reasoning: `${verdict.reasoning} Promoted claim-relevant Context findings to primary.`,
    };
  }

  private formatProbe(probe: UrlProbe): string {
    const whoisLines = probe.whois
      ? [
          `domainHost: ${probe.whois.host}`,
          probe.whois.created
            ? `domainCreated: ${probe.whois.created} (domain registration — NOT company founding year)`
            : null,
          probe.whois.expires ? `domainExpires: ${probe.whois.expires}` : null,
          probe.whois.registrar ? `registrar: ${probe.whois.registrar}` : null,
          probe.whois.error ? `domainWhoisError: ${probe.whois.error}` : null,
        ].filter(Boolean)
      : [];

    if (!probe.ok) {
      return [
        `url: ${probe.url}`,
        `reachable: no`,
        probe.status != null ? `status: ${probe.status}` : null,
        probe.error ? `error: ${probe.error}` : null,
        ...whoisLines,
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
      ...whoisLines,
    ]
      .filter(Boolean)
      .join('\n');
  }

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

    const coreConfirmed = verdict.confirmed.filter(
      (f) => !isContextFinding(f.claim),
    );

    if (recommendation === 'approve' && coreConfirmed.length === 0) {
      recommendation = 'needs_more_info';
      reasoningBits.push(
        'Downgraded approve → needs_more_info because confirmed[] had no non-context evidence for the claim.',
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
      coreConfirmed.every((f) => f.confidence < 0.55)
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

  private shouldUseWebSearch(
    proofType: string,
    proofUrl?: string,
    founderName?: string | null,
  ): boolean {
    if (['url', 'metric', 'repo', 'pdf'].includes(proofType)) return true;
    if (proofUrl) return true;
    if (founderName?.trim()) return true;
    return false;
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
