/**
 * ISO 3166-1 alpha-2 code → regional-indicator flag emoji.
 * Falls back to a globe for regional plans and malformed codes.
 */
export function isoToFlag(isoCode: string | null | undefined): string {
  if (!isoCode || isoCode.length !== 2) return '🌍';
  return isoCode
    .toUpperCase()
    .split('')
    .map((c) => String.fromCodePoint(127397 + c.charCodeAt(0)))
    .join('');
}
