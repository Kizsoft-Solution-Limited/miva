import { sanitizePublicUrl } from './public-url.js';

export interface GithubRepoProbe {
  url: string;
  ok: boolean;
  /** api = GitHub REST; html = public page scrape after API block */
  source?: 'api' | 'html';
  /** True when API returned 403/429 and we fell back to HTML */
  rateLimited?: boolean;
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

const UA =
  'MIVA-Verify/1.0 (+https://github.com/Kizsoft-Solution-Limited/miva)';

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

function apiHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'User-Agent': UA,
    'X-GitHub-Api-Version': '2022-11-28',
  };
  const token = process.env.GITHUB_TOKEN?.trim();
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

/** Pure parser for HTML fallback (tests). */
export function parseGithubHtmlFallback(
  owner: string,
  repo: string,
  repoHtml: string,
  releasesHtml?: string,
): Pick<
  GithubRepoProbe,
  'fullName' | 'htmlUrl' | 'latestReleaseTag' | 'latestReleaseUrl' | 'error'
> & { pageLooksPublic: boolean } {
  const fullName = `${owner}/${repo}`;
  const htmlUrl = `https://github.com/${fullName}`;
  const lower = repoHtml.toLowerCase();
  if (
    lower.includes('not found') &&
    lower.includes("this is not the web page you are looking for")
  ) {
    return { pageLooksPublic: false, error: 'GitHub HTML: repository not found' };
  }
  if (lower.includes('this repository is private')) {
    return {
      pageLooksPublic: false,
      fullName,
      error: 'Repository is private — not checkable as public proof',
    };
  }

  const pageLooksPublic =
    lower.includes(fullName.toLowerCase()) ||
    /itemprop="name(?:code)?repository"/i.test(repoHtml) ||
    /data-turbo-transient="true"/i.test(repoHtml);

  const haystack = `${repoHtml}\n${releasesHtml || ''}`;
  const tagMatches = [
    ...haystack.matchAll(
      new RegExp(`/${owner}/${repo}/releases/tag/([^"'\\s?#]+)`, 'gi'),
    ),
  ];
  const latestReleaseTag = tagMatches[0]?.[1]
    ? decodeURIComponent(tagMatches[0][1])
    : undefined;

  return {
    pageLooksPublic,
    fullName,
    htmlUrl,
    latestReleaseTag,
    latestReleaseUrl: latestReleaseTag
      ? `https://github.com/${fullName}/releases/tag/${latestReleaseTag}`
      : undefined,
  };
}

async function probeGithubHtml(
  url: string,
  owner: string,
  repo: string,
  rateLimited: boolean,
): Promise<GithubRepoProbe> {
  try {
    const [repoRes, releasesRes] = await Promise.all([
      fetch(url, {
        headers: {
          'User-Agent': UA,
          Accept: 'text/html',
        },
        redirect: 'follow',
        signal: AbortSignal.timeout(12_000),
      }),
      fetch(`https://github.com/${owner}/${repo}/releases`, {
        headers: {
          'User-Agent': UA,
          Accept: 'text/html',
        },
        redirect: 'follow',
        signal: AbortSignal.timeout(12_000),
      }),
    ]);

    if (repoRes.status === 404) {
      return {
        url,
        ok: false,
        source: 'html',
        rateLimited,
        error: 'GitHub HTML: repository not found',
      };
    }
    if (!repoRes.ok) {
      return {
        url,
        ok: false,
        source: 'html',
        rateLimited,
        error: `GitHub HTML repo status ${repoRes.status}`,
      };
    }

    const repoHtml = (await repoRes.text()).slice(0, 200_000);
    const releasesHtml = releasesRes.ok
      ? (await releasesRes.text()).slice(0, 200_000)
      : undefined;
    const parsed = parseGithubHtmlFallback(owner, repo, repoHtml, releasesHtml);

    if (!parsed.pageLooksPublic) {
      return {
        url,
        ok: false,
        source: 'html',
        rateLimited,
        fullName: parsed.fullName,
        error: parsed.error || 'GitHub HTML: could not confirm public repo',
      };
    }

    return {
      url,
      ok: true,
      source: 'html',
      rateLimited,
      fullName: parsed.fullName,
      htmlUrl: parsed.htmlUrl,
      latestReleaseTag: parsed.latestReleaseTag,
      latestReleaseUrl: parsed.latestReleaseUrl,
      error: rateLimited
        ? 'GitHub API blocked (403/429); used public HTML pages instead'
        : undefined,
    };
  } catch (error) {
    return {
      url,
      ok: false,
      source: 'html',
      rateLimited,
      error: error instanceof Error ? error.message : 'GitHub HTML probe failed',
    };
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
  const headers = apiHeaders();

  try {
    const repoRes = await fetch(apiBase, {
      headers,
      signal: AbortSignal.timeout(12_000),
    });

    if (repoRes.status === 404) {
      return {
        url,
        ok: false,
        source: 'api',
        error: 'GitHub API: repository not found or private',
      };
    }

    if (repoRes.status === 403 || repoRes.status === 429) {
      return probeGithubHtml(url, parsed.owner, parsed.repo, true);
    }

    if (!repoRes.ok) {
      return probeGithubHtml(url, parsed.owner, parsed.repo, false);
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
        source: 'api',
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
      } else if (relRes.status === 403 || relRes.status === 429) {
        const html = await probeGithubHtml(url, parsed.owner, parsed.repo, true);
        return {
          ...html,
          ok: true,
          fullName: repo.full_name || html.fullName,
          description: repo.description ?? null,
          htmlUrl: repo.html_url || html.htmlUrl,
          pushedAt: repo.pushed_at?.slice(0, 10),
          createdAt: repo.created_at?.slice(0, 10),
          defaultBranch: repo.default_branch,
          stars: repo.stargazers_count,
          forks: repo.forks_count,
          latestReleaseTag: html.latestReleaseTag,
          latestReleaseUrl: html.latestReleaseUrl,
        };
      }
    } catch {
      /* release lookup optional */
    }

    return {
      url,
      ok: true,
      source: 'api',
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
    const html = await probeGithubHtml(url, parsed.owner, parsed.repo, false);
    if (html.ok) return html;
    return {
      url,
      ok: false,
      source: 'api',
      error: error instanceof Error ? error.message : 'GitHub probe failed',
    };
  }
}
