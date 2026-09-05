import net from 'node:net';
import { sanitizePublicUrl } from './public-url.js';

export interface DomainWhois {
  host: string;
  created?: string;
  expires?: string;
  registrar?: string;
  error?: string;
}

export interface UrlProbe {
  url: string;
  ok: boolean;
  status?: number;
  contentType?: string;
  title?: string;
  finalUrl?: string;
  error?: string;
  /** Domain registration date ≠ company founding year. */
  whois?: DomainWhois;
}

export async function probePublicUrl(
  raw?: string | null,
): Promise<UrlProbe | null> {
  const url = sanitizePublicUrl(raw);
  if (!url) return null;

  const host = hostnameOf(url);
  const [page, whois] = await Promise.all([
    fetchPageProbe(url),
    host ? lookupDomainWhois(host) : Promise.resolve(undefined),
  ]);

  return {
    ...page,
    whois,
  };
}

function hostnameOf(url: string): string | null {
  try {
    const host = new URL(url).hostname.toLowerCase();
    if (!host || /^\d{1,3}(\.\d{1,3}){3}$/.test(host) || host.includes(':')) {
      return null;
    }
    return host;
  } catch {
    return null;
  }
}

async function fetchPageProbe(url: string): Promise<UrlProbe> {
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

/**
 * Domain registration via WHOIS TCP 43 (RDAP is spotty on some TLDs like .co).
 */
export async function lookupDomainWhois(
  host: string,
): Promise<DomainWhois | undefined> {
  try {
    const servers = whoisServersFor(host);
    let text = '';
    let lastError = '';

    for (const server of servers) {
      try {
        text = await whoisQuery(server, host);
        if (/creat|regist/i.test(text)) break;
        const referral = text.match(
          /Registrar WHOIS Server:\s*(\S+)/i,
        )?.[1];
        if (referral && !servers.includes(referral.toLowerCase())) {
          const referred = await whoisQuery(referral.toLowerCase(), host);
          if (/creat|regist/i.test(referred)) {
            text = referred;
            break;
          }
        }
      } catch (error) {
        lastError = error instanceof Error ? error.message : 'WHOIS failed';
      }
    }

    if (!text) {
      return { host, error: lastError || 'WHOIS returned empty' };
    }

    return parseWhoisText(host, text);
  } catch (error) {
    return {
      host,
      error: error instanceof Error ? error.message : 'WHOIS failed',
    };
  }
}

export function parseWhoisText(host: string, text: string): DomainWhois {
  const created = pickDate(text, [
    /Creation Date:\s*([^\s]+)/i,
    /Created On:\s*([^\s]+)/i,
    /Created:\s*([^\s]+)/i,
    /Domain Registration Date:\s*([^\s]+)/i,
    /Registered on:\s*([^\n]+)/i,
  ]);
  const expires = pickDate(text, [
    /Registry Expiry Date:\s*([^\s]+)/i,
    /Registrar Registration Expiration Date:\s*([^\s]+)/i,
    /Expir(?:y|ation) Date:\s*([^\s]+)/i,
    /Expires On:\s*([^\s]+)/i,
    /Expires:\s*([^\s]+)/i,
  ]);
  const registrar =
    text.match(/Registrar:\s*([^\n]+)/i)?.[1]?.trim() || undefined;

  if (!created && !expires && !registrar) {
    return { host, error: 'WHOIS parsed but no dates found' };
  }

  return { host, created, expires, registrar };
}

function whoisServersFor(host: string): string[] {
  const labels = host.split('.');
  const tld = labels.at(-1) || '';
  const sld = labels.length >= 2 ? labels.slice(-2).join('.') : tld;

  const map: Record<string, string[]> = {
    com: ['whois.verisign-grs.com'],
    net: ['whois.verisign-grs.com'],
    org: ['whois.pir.org'],
    io: ['whois.nic.io'],
    co: ['whois.registry.co', 'whois.nic.co'],
    ai: ['whois.nic.ai'],
    app: ['whois.nic.google'],
    dev: ['whois.nic.google'],
    ng: ['whois.nic.net.ng'],
    uk: ['whois.nic.uk'],
    'co.uk': ['whois.nic.uk'],
  };

  return map[sld] || map[tld] || ['whois.iana.org'];
}

function whoisQuery(server: string, query: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const socket = net.connect({ host: server, port: 43 }, () => {
      socket.write(`${query}\r\n`);
    });

    const chunks: Buffer[] = [];
    const timer = setTimeout(() => {
      socket.destroy();
      reject(new Error(`WHOIS timeout (${server})`));
    }, 8_000);

    socket.on('data', (chunk) => chunks.push(chunk));
    socket.on('end', () => {
      clearTimeout(timer);
      resolve(Buffer.concat(chunks).toString('utf8'));
    });
    socket.on('error', (err) => {
      clearTimeout(timer);
      reject(err);
    });
  });
}

function pickDate(text: string, patterns: RegExp[]): string | undefined {
  for (const pattern of patterns) {
    const raw = text.match(pattern)?.[1]?.trim();
    if (!raw) continue;
    const iso = Date.parse(raw);
    if (!Number.isNaN(iso)) {
      return new Date(iso).toISOString().slice(0, 10);
    }
    const day = raw.match(/(\d{4}-\d{2}-\d{2})/)?.[1];
    if (day) return day;
  }
  return undefined;
}
