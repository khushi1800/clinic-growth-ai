const FALLBACK_PATH = '/dashboard';

/**
 * Sanitizes a post-login `returnTo` query parameter to prevent open redirects.
 * Accepts only same-origin relative paths starting with a single `/`.
 */
export function sanitizeReturnTo(raw: string | null): string {
  if (!raw || typeof raw !== 'string') {
    return FALLBACK_PATH;
  }

  // Reject ASCII control characters (newlines, tabs, null bytes, etc.).
  // eslint-disable-next-line no-control-regex -- Intentional security check rejecting ASCII control characters in returnTo URLs.
  if (/[\u0000-\u001F\u007F]/.test(raw)) {
    return FALLBACK_PATH;
  }

  // Must start with a single `/` (rejects empty, relative paths without `/`, and protocol-relative `//`).
  if (!raw.startsWith('/') || raw.startsWith('//')) {
    return FALLBACK_PATH;
  }

  // Reject backslashes (which browsers may normalize to `/`) and embedded scheme delimiters.
  if (raw.includes('\\') || raw.includes('://')) {
    return FALLBACK_PATH;
  }

  // Reject explicit scheme prefixes such as http:, https:, javascript:, data:.
  if (/^(?:https?|javascript|data):/i.test(raw)) {
    return FALLBACK_PATH;
  }

  try {
    const parsed = new URL(raw, 'https://app.local');
    if (parsed.origin !== 'https://app.local') {
      return FALLBACK_PATH;
    }
  } catch {
    return FALLBACK_PATH;
  }

  return raw;
}
