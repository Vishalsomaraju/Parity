/**
 * Text sanitization and prompt-injection defense utilities
 */

const INJECTION_PATTERNS = [
  /ignore\s+(all\s+)?(previous|prior)\s+instructions/gi,
  /you\s+are\s+now\s+a/gi,
  /system\s+prompt\s*:/gi,
  /<\/?system>/gi,
  /jailbreak/gi,
  /act\s+as\s+an\s+unrestricted/gi,
  /bypass\s+all\s+rules/gi,
];

/**
 * Sanitize text before sending to LLM to mitigate prompt injection.
 */
export function sanitizeForPrompt(text: string, maxLength = 8000): string {
  if (!text) return '';

  let sanitized = text;

  // Neutralize common injection phrases
  for (const pattern of INJECTION_PATTERNS) {
    sanitized = sanitized.replace(pattern, '[filtered]');
  }

  // Strip non-printable ASCII / weird control characters (keep newlines and tabs)
  sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength) + '... [truncated]';
  }

  return sanitized.trim();
}

/**
 * Truncate long strings for logs
 */
export function truncateForLog(text: string, maxLen = 60): string {
  if (!text) return '';
  const singleLine = text.replace(/\s+/g, ' ').trim();
  return singleLine.length <= maxLen ? singleLine : `${singleLine.slice(0, maxLen)}...`;
}
