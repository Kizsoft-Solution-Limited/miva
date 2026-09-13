import { Injectable, Logger } from '@nestjs/common';
import {
  VerdictResult,
  VerdictSchema,
  normalizeVerdictPayload,
} from './verdict.schema.js';
import { OpenRouterService } from '../openrouter/openrouter.service.js';
import { redactSecrets, sanitizePublicUrl } from '../lib/public-url.js';
import { probePublicUrl } from '../lib/url-probe.js';
import { parseGithubRepoUrl, probeGithubRepo } from '../lib/github-repo.js';
import { parseOnchainTarget, probeOnchain } from '../lib/onchain.js';
import type { VerifyMilestoneInput } from './verify.types.js';
import { claimTopics } from './claim-topics.js';
import { SYSTEM_PROMPT, VERDICT_JSON_SHAPE } from './agent.prompts.js';
import { formatGithub, formatOnchain, formatProbe } from './probe-format.js';
import {
  attachCitations,
  enforceConsistency,
  promoteMisfiledContext,
  stripFounderLabelNoise,
} from './verdict.postprocess.js';

export type { VerifyMilestoneInput } from './verify.types.js';
export { claimTopics } from './claim-topics.js';

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
    const github =
      input.proofType === 'repo' ||
      Boolean(proofUrl && parseGithubRepoUrl(proofUrl));
    const onchain =
      input.proofType === 'onchain' ||
      Boolean(
        (proofUrl || input.proofText) &&
        parseOnchainTarget(proofUrl || input.proofText),
      );
    return {
      orbio: this.openRouter.hasKey,
      webSearch: this.shouldUseWebSearch(
        input.proofType,
        proofUrl ?? undefined,
        input.founderName,
      ),
      pdf,
      github,
      onchain,
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
    const github =
      input.proofType === 'repo' || (proofUrl && parseGithubRepoUrl(proofUrl))
        ? await probeGithubRepo(proofUrl)
        : null;
    const onchainTarget = parseOnchainTarget(proofUrl || input.proofText);
    const onchain =
      input.proofType === 'onchain' || onchainTarget
        ? await probeOnchain(proofUrl || input.proofText)
        : null;

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
    if (input.proofType === 'repo' || topics.repo || github) {
      playbook.push(
        '- Repo: trust the server GitHub probe (API, or HTML fallback when API is rate-limited/403). Do not invent stars/commits/releases. If probe.ok with latestReleaseTag, that supports a public-release claim. Cite htmlUrl / release URL as sourceUrl. A rate-limited note is not a failed claim when ok is true.',
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
    if (input.proofType === 'onchain' || topics.onchain || onchain) {
      playbook.push(
        '- On-chain: trust the server Ethereum RPC probe. Contract with bytecode / successful tx receipt supports the claim. Do not invent chain data. Cite explorerUrl. A marketing homepage alone never verifies an on-chain claim.',
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
        ? `Server probe (authoritative reachability):\n${formatProbe(probe)}`
        : null,
      github
        ? `Server GitHub probe (authoritative for public repos):\n${formatGithub(github)}`
        : null,
      onchain
        ? `Server Ethereum RPC probe (authoritative for on-chain claims):\n${formatOnchain(onchain)}`
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
      '- Founder name is a form label only — never put it in confirmed or unconfirmed unless the claim itself is about that person.',
      '- Every confirmed/unconfirmed item MUST include claim, evidence, confidence.',
      '- If the claim is about a live site/page and the server probe failed or returned non-OK, do not approve.',
      '- If the claim is about a public repo/release and the GitHub probe failed or found no repo, do not approve.',
      '- If the claim is on-chain and the Ethereum RPC probe failed (no bytecode / missing tx), do not approve.',
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
    verdict = attachCitations(verdict, citations, proofUrl);
    verdict = promoteMisfiledContext(verdict, input);
    verdict = stripFounderLabelNoise(verdict, input);
    verdict = enforceConsistency(verdict, input, probe, github, onchain);
    return verdict;
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
    if (['url', 'metric', 'repo', 'pdf', 'onchain'].includes(proofType))
      return true;
    if (proofUrl) return true;
    if (founderName?.trim()) return true;
    return false;
  }

  private looksLikePdf(url: string): boolean {
    const lower = url.toLowerCase();
    return lower.includes('.pdf') || lower.includes('application/pdf');
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
