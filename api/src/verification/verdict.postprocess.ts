import { Finding, VerdictResult } from './verdict.schema.js';
import type { VerifyMilestoneInput } from './verify.types.js';
import {
  claimTopics,
  isContextFinding,
  stripContextPrefix,
} from './claim-topics.js';
import type { UrlProbe } from '../lib/url-probe.js';
import type { GithubRepoProbe } from '../lib/github-repo.js';
import type { OnchainProbe } from '../lib/onchain.js';

export function stripFounderLabelNoise(
  verdict: VerdictResult,
  input: VerifyMilestoneInput,
): VerdictResult {
  const name = input.founderName?.trim().toLowerCase();
  if (!name) return verdict;
  if (claimTopics(input.title, input.claim).founder) return verdict;

  const isLabel = (claim: string) => {
    const c = claim.toLowerCase().trim();
    if (
      c === name ||
      c === `founder name: ${name}` ||
      c === `founder: ${name}`
    ) {
      return true;
    }
    return (
      (c.includes('founder name') || c.startsWith('founder ')) &&
      c.includes(name) &&
      c.length < name.length + 40
    );
  };

  return {
    ...verdict,
    confirmed: verdict.confirmed.filter((f) => !isLabel(f.claim)),
    unconfirmed: verdict.unconfirmed.filter((f) => !isLabel(f.claim)),
  };
}

export function promoteMisfiledContext(
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
    next.unconfirmed.some((f, i) => f.claim !== verdict.unconfirmed[i]?.claim);

  if (!changed) return verdict;
  return {
    ...next,
    reasoning: `${verdict.reasoning} Promoted claim-relevant Context findings to primary.`,
  };
}

export function enforceConsistency(
  verdict: VerdictResult,
  input: VerifyMilestoneInput,
  probe: UrlProbe | null,
  github: GithubRepoProbe | null = null,
  onchain: OnchainProbe | null = null,
): VerdictResult {
  let recommendation = verdict.recommendation;
  const reasoningBits: string[] = [];

  const claimLooksLive =
    /\b(live|online|up|reachable|deployed|public site|website|url|domain)\b/i.test(
      `${input.title} ${input.claim}`,
    );
  const claimLooksRepo =
    input.proofType === 'repo' ||
    /\b(repo|github|gitlab|release|open\s*source)\b/i.test(
      `${input.title} ${input.claim}`,
    );
  const claimLooksOnchain =
    input.proofType === 'onchain' ||
    /\b(on-?chain|ethereum|smart\s*contract|tx\s*hash|etherscan)\b/i.test(
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

  if (recommendation === 'approve' && github && !github.ok && claimLooksRepo) {
    recommendation = 'reject';
    reasoningBits.push(
      'Downgraded approve → reject because the GitHub repo probe failed or the repo is not public.',
    );
  }

  if (
    recommendation === 'approve' &&
    onchain &&
    !onchain.ok &&
    claimLooksOnchain
  ) {
    recommendation = 'reject';
    reasoningBits.push(
      'Downgraded approve → reject because the Ethereum RPC probe failed (no contract bytecode or tx not successful).',
    );
  }

  if (
    recommendation === 'approve' &&
    claimLooksRepo &&
    /\brelease\b/i.test(`${input.title} ${input.claim}`) &&
    github?.ok &&
    !github.latestReleaseTag
  ) {
    recommendation = 'needs_more_info';
    reasoningBits.push(
      'Downgraded approve → needs_more_info because the claim mentions a release but GitHub returned no latest release tag.',
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

export function attachCitations(
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
