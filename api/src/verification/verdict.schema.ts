import { z } from 'zod';

const optionalUrl = z.preprocess((value) => {
  if (value === '' || value === null || value === undefined) return undefined;
  return value;
}, z.string().url().optional());

export const FindingSchema = z.object({
  claim: z.string().min(1),
  evidence: z.string().min(1),
  sourceUrl: optionalUrl,
  confidence: z.coerce.number().min(0).max(1),
});

export const VerdictSchema = z.object({
  recommendation: z.enum(['approve', 'reject', 'needs_more_info']),
  summary: z.string().min(1),
  confirmed: z.array(FindingSchema).default([]),
  unconfirmed: z.array(FindingSchema).default([]),
  reasoning: z.string().min(1),
});

export type Finding = z.infer<typeof FindingSchema>;
export type VerdictResult = z.infer<typeof VerdictSchema>;

function asRecord(value: unknown): Record<string, unknown> {
  return value !== null && typeof value === 'object'
    ? (value as Record<string, unknown>)
    : {};
}

function normalizeFinding(raw: unknown, fallbackClaim: string): unknown {
  const row = asRecord(raw);
  const claim =
    (typeof row.claim === 'string' && row.claim) ||
    (typeof row.statement === 'string' && row.statement) ||
    fallbackClaim;
  const evidence =
    (typeof row.evidence === 'string' && row.evidence) ||
    (typeof row.reason === 'string' && row.reason) ||
    (typeof row.why === 'string' && row.why) ||
    (typeof row.detail === 'string' && row.detail) ||
    'No evidence detail returned by the model.';
  const sourceUrl =
    row.sourceUrl ?? row.source_url ?? row.url ?? row.link ?? undefined;
  const confidence = row.confidence ?? row.score ?? 0.4;

  return { claim, evidence, sourceUrl, confidence };
}

export function normalizeVerdictPayload(
  raw: unknown,
  fallbackClaim: string,
): unknown {
  const row = asRecord(raw);
  const recommendationRaw = String(row.recommendation ?? row.verdict ?? '')
    .toLowerCase()
    .replace(/\s+/g, '_');

  let recommendation = 'needs_more_info';
  if (
    recommendationRaw === 'approve' ||
    recommendationRaw === 'approved' ||
    recommendationRaw === 'accept'
  ) {
    recommendation = 'approve';
  } else if (
    recommendationRaw === 'reject' ||
    recommendationRaw === 'rejected' ||
    recommendationRaw === 'deny'
  ) {
    recommendation = 'reject';
  } else if (
    recommendationRaw.includes('more') ||
    recommendationRaw === 'needs_more_info' ||
    recommendationRaw === 'inconclusive'
  ) {
    recommendation = 'needs_more_info';
  }

  const confirmedRaw = Array.isArray(row.confirmed)
    ? row.confirmed
    : Array.isArray(row.verified)
      ? row.verified
      : [];
  const unconfirmedRaw = Array.isArray(row.unconfirmed)
    ? row.unconfirmed
    : Array.isArray(row.unverified)
      ? row.unverified
      : [];

  return {
    recommendation,
    summary:
      (typeof row.summary === 'string' && row.summary) ||
      (typeof row.overview === 'string' && row.overview) ||
      'Verification completed.',
    confirmed: confirmedRaw.map((item) =>
      normalizeFinding(item, fallbackClaim),
    ),
    unconfirmed: unconfirmedRaw.map((item) =>
      normalizeFinding(item, fallbackClaim),
    ),
    reasoning:
      (typeof row.reasoning === 'string' && row.reasoning) ||
      (typeof row.rationale === 'string' && row.rationale) ||
      (typeof row.explanation === 'string' && row.explanation) ||
      'No detailed reasoning returned.',
  };
}
