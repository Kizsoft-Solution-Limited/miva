import { beforeEach, describe, expect, it, vi } from 'vitest';
import { VerificationService } from './verification.service.js';
import { claimTopics } from './verification.service.js';
import type { OpenRouterService } from '../openrouter/openrouter.service.js';

vi.mock('../lib/url-probe.js', () => ({
  probePublicUrl: vi.fn(async (raw: string) => ({
    url: raw,
    ok: true,
    status: 200,
    title: 'BillSpot',
    whois: {
      host: 'billspot.co',
      created: '2024-04-12',
      expires: '2027-04-12',
      registrar: 'NameCheap, Inc.',
    },
  })),
}));

vi.mock('../lib/github-repo.js', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../lib/github-repo.js')>();
  return {
    ...actual,
    probeGithubRepo: vi.fn(async (raw: string) => ({
      url: raw,
      ok: true,
      fullName: 'nestjs/nest',
      htmlUrl: 'https://github.com/nestjs/nest',
      description: 'A progressive Node.js framework',
      stars: 50000,
      forks: 5000,
      latestReleaseTag: 'v11.0.0',
      latestReleaseUrl: 'https://github.com/nestjs/nest/releases/tag/v11.0.0',
      latestReleasePublishedAt: '2025-01-01',
    })),
  };
});

function mockOpenRouter(
  overrides: Partial<OpenRouterService> & {
    chatForVerification?: OpenRouterService['chatForVerification'];
  } = {},
) {
  return {
    hasKey: true,
    chatForVerification: vi.fn(),
    ...overrides,
  } as unknown as OpenRouterService;
}

describe('claimTopics', () => {
  it('detects company age and founder claims', () => {
    const topics = claimTopics(
      'Billspot age',
      'Verify the age of billspot and the founder',
    );
    expect(topics.companyAge).toBe(true);
    expect(topics.founder).toBe(true);
  });

  it('detects live site claims', () => {
    expect(claimTopics('Site', 'Public site is live').liveSite).toBe(true);
  });
});

describe('VerificationService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('rejects when no proof is provided', async () => {
    const service = new VerificationService(mockOpenRouter());
    const result = await service.verifyMilestone({
      title: 'X',
      claim: 'Something happened',
      proofType: 'url',
    });
    expect(result.recommendation).toBe('reject');
    expect(result.confirmed).toHaveLength(0);
  });

  it('rejects invalid proof URLs', async () => {
    const service = new VerificationService(mockOpenRouter());
    const result = await service.verifyMilestone({
      title: 'X',
      claim: 'Site is live',
      proofType: 'url',
      proofUrl: 'http://localhost/secret',
    });
    expect(result.recommendation).toBe('reject');
  });

  it('returns offline scaffold when OpenRouter key is missing', async () => {
    const service = new VerificationService(
      mockOpenRouter({ hasKey: false }),
    );
    const result = await service.verifyMilestone({
      title: 'X',
      claim: 'Site is live at billspot.co',
      proofType: 'url',
      proofUrl: 'https://billspot.co',
    });
    expect(result.recommendation).toBe('needs_more_info');
    expect(result.confirmed).toHaveLength(0);
  });

  it('promotes Context findings when age is the claim', async () => {
    const chat = vi.fn().mockResolvedValue({
      content: JSON.stringify({
        recommendation: 'needs_more_info',
        summary: 'Age unclear',
        confirmed: [],
        unconfirmed: [
          {
            claim: 'Context · Company',
            evidence: 'No founding year on site',
            sourceUrl: 'https://billspot.co/',
            confidence: 0.4,
          },
        ],
        reasoning: 'Need registry',
      }),
      citations: [],
    });
    const service = new VerificationService(
      mockOpenRouter({ chatForVerification: chat }),
    );

    const result = await service.verifyMilestone({
      title: 'Billspot age',
      claim: 'Verify the founding year of Billspot',
      founderName: 'Demo',
      proofType: 'url',
      proofUrl: 'https://billspot.co/',
    });

    expect(chat).toHaveBeenCalled();
    expect(
      result.unconfirmed.some((f) => f.claim.toLowerCase().startsWith('context ·')),
    ).toBe(false);
    expect(result.unconfirmed[0]?.claim.toLowerCase()).not.toContain('context ·');
  });

  it('downgrades approve with empty confirmed to needs_more_info', async () => {
    const chat = vi.fn().mockResolvedValue({
      content: JSON.stringify({
        recommendation: 'approve',
        summary: 'Looks fine',
        confirmed: [],
        unconfirmed: [],
        reasoning: 'Vibes',
      }),
      citations: [],
    });
    const service = new VerificationService(
      mockOpenRouter({ chatForVerification: chat }),
    );

    const result = await service.verifyMilestone({
      title: 'Site',
      claim: 'Public site is live',
      proofType: 'url',
      proofUrl: 'https://billspot.co/',
    });

    expect(result.recommendation).toBe('needs_more_info');
  });

  it('buildCheckMeta reflects web + structured JSON', () => {
    const service = new VerificationService(mockOpenRouter());
    expect(
      service.buildCheckMeta({
        title: 't',
        claim: 'c',
        proofType: 'url',
        proofUrl: 'https://billspot.co',
      }),
    ).toMatchObject({
      orbio: true,
      webSearch: true,
      github: false,
      structuredJson: true,
    });
  });

  it('buildCheckMeta marks github for repo proof', () => {
    const service = new VerificationService(mockOpenRouter());
    expect(
      service.buildCheckMeta({
        title: 'Repo live',
        claim: 'Public repo has releases',
        proofType: 'repo',
        proofUrl: 'https://github.com/nestjs/nest',
      }),
    ).toMatchObject({ github: true, webSearch: true });
  });

  it('drops founder-name label noise when claim is not about the founder', async () => {
    const chat = vi.fn().mockResolvedValue({
      content: JSON.stringify({
        recommendation: 'approve',
        summary: 'Repo and release look real.',
        confirmed: [
          {
            claim: 'Public NestJS repo',
            evidence: 'github.com/nestjs/nest',
            confidence: 0.9,
            sourceUrl: 'https://github.com/nestjs/nest',
          },
        ],
        unconfirmed: [
          {
            claim: 'Founder name: NestJS',
            evidence: 'No identity proof for that label',
            confidence: 0.4,
          },
        ],
        reasoning: 'GitHub probe ok',
      }),
      citations: [],
    });
    const service = new VerificationService(
      mockOpenRouter({ chatForVerification: chat }),
    );
    const result = await service.verifyMilestone({
      title: 'Open-source release shipped',
      claim:
        'NestJS maintains a public GitHub repository at github.com/nestjs/nest with a published release tag',
      founderName: 'NestJS',
      proofType: 'repo',
      proofUrl: 'https://github.com/nestjs/nest',
    });
    expect(result.recommendation).toBe('approve');
    expect(
      result.unconfirmed.some((f) =>
        f.claim.toLowerCase().includes('founder name'),
      ),
    ).toBe(false);
  });

  it('downgrades approve when GitHub probe fails for a repo claim', async () => {
    const { probeGithubRepo } = await import('../lib/github-repo.js');
    vi.mocked(probeGithubRepo).mockResolvedValueOnce({
      url: 'https://github.com/no/such-repo-miva',
      ok: false,
      error: 'GitHub API: repository not found or private',
    });

    const chat = vi.fn().mockResolvedValue({
      content: JSON.stringify({
        recommendation: 'approve',
        summary: 'Repo exists',
        confirmed: [
          {
            claim: 'Repo public',
            evidence: 'Found it',
            confidence: 0.9,
          },
        ],
        unconfirmed: [],
        reasoning: 'Ok',
      }),
      citations: [],
    });
    const service = new VerificationService(
      mockOpenRouter({ chatForVerification: chat }),
    );

    const result = await service.verifyMilestone({
      title: 'Open source release',
      claim: 'Public GitHub repo with a tagged release',
      proofType: 'repo',
      proofUrl: 'https://github.com/no/such-repo-miva',
    });

    expect(result.recommendation).toBe('reject');
  });
});
