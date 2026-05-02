/**
 * Server-side validator for user-controlled redirect targets.
 *
 * Prevents open-redirect vulnerabilities by rejecting any path that
 * could navigate the user off esimpanda.co. The accepted shape is a
 * relative path whose first segment is one of our supported locales:
 *
 *   /en
 *   /pt/dashboard
 *   /es/checkout?cart=abc
 *
 * Anything else falls back to '/en'. The callers should pass the
 * raw user-provided value (e.g., searchParams.get('next')) and
 * trust only the returned string.
 */

export const SUPPORTED_LOCALES = ['en', 'pt', 'es', 'fr', 'zh', 'ja'] as const;
type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

const FALLBACK = '/en';

export function safeNext(raw: string | null | undefined): string {
  if (!raw) return FALLBACK;

  // Must be a relative path (single leading slash).
  if (!raw.startsWith('/')) return FALLBACK;

  // Reject protocol-relative ('//evil.com') and backslash-tricks
  // that some browsers normalise into a host change.
  if (/^\/[\\/]/.test(raw)) return FALLBACK;

  // Reject anything that contains a scheme separator. A relative path
  // never has one; an absolute URL like 'javascript:foo' or
  // 'https://evil.com' (without leading slashes) is rejected by the
  // earlier check, but a malformed input like '/x:y' is harmless and
  // allowed. We only block when the colon would let a parser treat
  // the rest as a host: i.e., immediately after the first slash.
  if (/^\/[^/]*:/.test(raw)) return FALLBACK;

  // First path segment must be a known locale, otherwise the URL
  // can't be a legitimate destination on this site.
  const firstSegment = raw.split('/').filter(Boolean)[0];
  if (
    !firstSegment ||
    !SUPPORTED_LOCALES.includes(firstSegment as SupportedLocale)
  ) {
    return FALLBACK;
  }

  return raw;
}
