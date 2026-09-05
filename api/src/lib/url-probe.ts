import { sanitizePublicUrl } from './public-url.js';

export interface UrlProbe {
  url: string;
  ok: boolean;
  status?: number;
  contentType?: string;
  title?: string;
  finalUrl?: string;
  error?: string;
}

/** Quick public fetch so the agent grounds on real reachability, not vibes. */
export async function probePublicUrl(
  raw?: string | null,
): Promise<UrlProbe | null> {
  const url = sanitizePublicUrl(raw);
  if (!url) return null;

  try {
    const response = await fetch(url, {
      method: 'GET',
      redirect: 'follow',
      headers: {
        'User-Agent':
          'MIVA-Verify/1.0 (+https://github.com/Kizsoft-Solution-Limited/miva)',
        Accept: 'text/html,application/xhtml+xml,application/pdf,*/*;q=0.8',
      },
      signal: AbortSignal.timeout(12_000),
    });

    const contentType = response.headers.get('content-type') || undefined;
    let title: string | undefined;

    if (contentType?.includes('text/html')) {
      const text = (await response.text()).slice(0, 80_000);
      const match = /<title[^>]*>([^<]{1,200})<\/title>/i.exec(text);
      title = match?.[1]?.replace(/\s+/g, ' ').trim() || undefined;
    } else {
      // Don't buffer large PDFs/binaries in memory.
      try {
        await response.body?.cancel();
      } catch {
        /* ignore */
      }
    }

    return {
      url,
      ok: response.ok,
      status: response.status,
      contentType,
      title,
      finalUrl: response.url || url,
    };
  } catch (error) {
    return {
      url,
      ok: false,
      error: error instanceof Error ? error.message : 'Fetch failed',
    };
  }
}
