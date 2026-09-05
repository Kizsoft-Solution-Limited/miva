export function isBlockedHostname(host: string): boolean {
  const h = host.toLowerCase();
  if (
    h === 'localhost' ||
    h === '127.0.0.1' ||
    h === '0.0.0.0' ||
    h === '::1' ||
    h.endsWith('.local') ||
    h.endsWith('.internal')
  ) {
    return true;
  }
  if (h.startsWith('10.') || h.startsWith('192.168.') || h.startsWith('169.254.')) {
    return true;
  }
  // 172.16.0.0 – 172.31.255.255
  const m = /^172\.(\d+)\./.exec(h);
  if (m) {
    const second = Number(m[1]);
    if (second >= 16 && second <= 31) return true;
  }
  return false;
}

/** Returns a normalized public http(s) URL, or null if unsafe/invalid. */
export function sanitizePublicUrl(raw?: string | null): string | null {
  if (!raw?.trim()) return null;
  let url: URL;
  try {
    url = new URL(raw.trim());
  } catch {
    return null;
  }
  if (!['http:', 'https:'].includes(url.protocol)) return null;
  if (isBlockedHostname(url.hostname)) return null;
  if (url.username || url.password) return null;
  return url.toString();
}

export function assertPublicHttpUrl(raw: string): boolean {
  return sanitizePublicUrl(raw) !== null;
}

export function redactSecrets(text: string): string {
  return text
    .replace(/sk-or-v1-[A-Za-z0-9_-]+/g, '[redacted-key]')
    .replace(/Bearer\s+[A-Za-z0-9._-]+/gi, 'Bearer [redacted]');
}
