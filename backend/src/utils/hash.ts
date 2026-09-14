import crypto from 'crypto';

/**
 * Generate SHA-256 hash of normalized text for deduplication and cache keys.
 */
export function hashText(text: string): string {
  const normalized = text.trim().toLowerCase().replace(/\s+/g, ' ');
  return crypto.createHash('sha256').update(normalized, 'utf8').digest('hex');
}

/**
 * Generate deterministic unique ID with prefix.
 */
export function generateId(prefix: string): string {
  return `${prefix}_${crypto.randomBytes(12).toString('hex')}`;
}
