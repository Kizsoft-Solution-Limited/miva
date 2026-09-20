import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
} from 'node:crypto';
import { authSecret } from './session.js';

function keyBytes(): Buffer {
  return createHash('sha256').update(`miva-orbio-key:${authSecret()}`).digest();
}

export function sealSecret(plain: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', keyBytes(), iv);
  const enc = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `v1$${iv.toString('hex')}$${tag.toString('hex')}$${enc.toString('hex')}`;
}

export function openSecret(stored: string): string | null {
  const parts = stored.split('$');
  if (parts.length !== 4 || parts[0] !== 'v1') return null;
  try {
    const iv = Buffer.from(parts[1], 'hex');
    const tag = Buffer.from(parts[2], 'hex');
    const data = Buffer.from(parts[3], 'hex');
    const decipher = createDecipheriv('aes-256-gcm', keyBytes(), iv);
    decipher.setAuthTag(tag);
    return Buffer.concat([decipher.update(data), decipher.final()]).toString(
      'utf8',
    );
  } catch {
    return null;
  }
}

export function maskOrbioKey(key: string): string {
  const k = key.trim();
  if (k.length < 12) return '••••';
  return `${k.slice(0, 8)}…${k.slice(-4)}`;
}
