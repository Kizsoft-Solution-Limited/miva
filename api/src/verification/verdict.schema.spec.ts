import { describe, expect, it } from 'vitest';
import {
  VerdictSchema,
  normalizeVerdictPayload,
} from '../verification/verdict.schema.js';

describe('normalizeVerdictPayload', () => {
  it('normalizes approve aliases and findings', () => {
    const raw = normalizeVerdictPayload(
      {
        recommendation: 'approved',
        summary: 'Site checks out',
        confirmed: [
          {
            claim: 'Site live',
            evidence: 'HTTP 200',
            source_url: 'https://billspot.co',
            score: 0.9,
          },
        ],
        unconfirmed: [],
        rationale: 'Probe succeeded',
      },
      'fallback claim',
    );

    const verdict = VerdictSchema.parse(raw);
    expect(verdict.recommendation).toBe('approve');
    expect(verdict.confirmed[0]?.sourceUrl).toBe('https://billspot.co');
    expect(verdict.confirmed[0]?.confidence).toBe(0.9);
    expect(verdict.reasoning).toBe('Probe succeeded');
  });

  it('defaults unknown recommendations to needs_more_info', () => {
    const verdict = VerdictSchema.parse(
      normalizeVerdictPayload(
        {
          recommendation: 'maybe',
          summary: 'Unclear',
          confirmed: [],
          unconfirmed: [{ evidence: 'thin' }],
        },
        'Claim X',
      ),
    );
    expect(verdict.recommendation).toBe('needs_more_info');
    expect(verdict.unconfirmed[0]?.claim).toBe('Claim X');
  });

  it('maps reject aliases', () => {
    const verdict = VerdictSchema.parse(
      normalizeVerdictPayload(
        { recommendation: 'failed', summary: 'Bad', confirmed: [], unconfirmed: [] },
        'x',
      ),
    );
    expect(verdict.recommendation).toBe('reject');
  });
});
