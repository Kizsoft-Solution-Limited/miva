import { sanitizePublicUrl } from './public-url.js';

export interface GithubRepoProbe {
  url: string;
  ok: boolean;
  fullName?: string;
  description?: string | null;
  htmlUrl?: string;
  pushedAt?: string;
  createdAt?: string;
  defaultBranch?: string;
  stars?: number;
  forks?: number;
  latestReleaseTag?: string;
  latestReleaseUrl?: string;
  latestReleasePublishedAt?: string;
  error?: string;
}

export function parseGithubRepoUrl(
  raw?: string | null,
): { owner: string; repo: string } | null {
  const url = sanitizePublicUrl(raw);
  if (!url) return null;
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.toLowerCase();
    if (host !== 'github.com' && host !== 'www.github.com') return null;
    const parts = parsed.pathname.split('/').filter(Boolean);
    if (parts.length < 2) return null;
    const owner = parts[0];
    const repo = parts[1].replace(/\.git$/i, '');
    if (!owner || !repo || owner === 'orgs' || owner === 'settings') return null;
    return { owner, repo };
  } catch {
    return null;
  }
}

export async function probeGithubRepo(
  raw?: string | null,
): Promise<GithubRepoProbe | null> {
  const url = sanitizePublicUrl(raw);
  if (!url) return null;
  const parsed = parseGithubRepoUrl(url);
  if (!parsed) return null;

  const apiBase = `https://api.github.com/repos/${parsed.owner}/${parsed.repo}`;
  const headers = {
    Accept: 'application/vnd.github+json',
    'User-Agent':
      'MIVA-Verify/1.0 (+https://github.com/Kizsoft-Solution-Limited/miva)',
    'X-GitHub-Api-Version': '2022-11-28',
  };

  try {
    const repoRes = await fetch(apiBase, {
      headers,
      signal: AbortSignal.timeout(12_000),
    });

    if (repoRes.status === 404) {
      return {
        url,
        ok: false,
        error: 'GitHub API: repository not found or private',
      };
    }

    if (!repoRes.ok) {
      return {
        url,
        ok: false,
        error: `GitHub API repo status ${repoRes.status}`,
      };
    }

    const repo = (await repoRes.json()) as {
      full_name?: string;
      description?: string | null;
      html_url?: string;
      private?: boolean;
      pushed_at?: string;
      created_at?: string;
      default_branch?: string;
      stargazers_count?: number;
      forks_count?: number;
    };

    if (repo.private) {
      return {
        url,
        ok: false,
        fullName: repo.full_name,
        error: 'Repository is private — not checkable as public proof',
      };
    }

    let latestReleaseTag: string | undefined;
    let latestReleaseUrl: string | undefined;
    let latestReleasePublishedAt: string | undefined;

    try {
      const relRes = await fetch(`${apiBase}/releases/latest`, {
        headers,
        signal: AbortSignal.timeout(12_000),
      });
      if (relRes.ok) {
        const rel = (await relRes.json()) as {
          tag_name?: string;
          html_url?: string;
          published_at?: string;
        };
        latestReleaseTag = rel.tag_name;
        latestReleaseUrl = rel.html_url;
        latestReleasePublishedAt = rel.published_at?.slice(0, 10);
      }
    } catch {
      /* release lookup is optional */
    }

    return {
      url,
      ok: true,
      fullName: repo.full_name,
      description: repo.description ?? null,
      htmlUrl: repo.html_url,
      pushedAt: repo.pushed_at?.slice(0, 10),
      createdAt: repo.created_at?.slice(0, 10),
      defaultBranch: repo.default_branch,
      stars: repo.stargazers_count,
      forks: repo.forks_count,
      latestReleaseTag,
      latestReleaseUrl,
      latestReleasePublishedAt,
    };
  } catch (error) {
    return {
      url,
      ok: false,
      error: error instanceof Error ? error.message : 'GitHub probe failed',
    };
  }
}
