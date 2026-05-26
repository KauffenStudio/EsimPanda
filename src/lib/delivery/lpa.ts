/**
 * Parses an LPA-format activation URI (the value Celitech returns as
 * `manualActivationCode`) into its component parts:
 *
 *   LPA:1$smdp.celitech.com$MATCH123ABC
 *   └────┘ └──────────────┘ └─────────┘
 *    scheme   SM-DP+ address  matching id
 *
 * iOS Settings (Cellular → Add eSIM → Enter Details Manually) expects the
 * SM-DP+ Address and the Activation Code as two separate fields, and the
 * Activation Code field wants ONLY the matching id — not the full LPA URI.
 * Likewise, when generating a QR ourselves we re-assemble `LPA:1$smdp$id`;
 * if `id` already starts with `LPA:1$`, the result is a malformed
 * double-prefixed URI that iOS silently rejects.
 *
 * Always normalize at the data boundary (DB read / Celitech response) and
 * pass clean parts to UI/email code. This helper is also tolerant of
 * already-clean input — if the value doesn't start with `LPA:1$`, it's
 * returned untouched as the matching id.
 */
export function parseLpaUri(value: string): {
  smdpAddress: string;
  matchingId: string;
} {
  if (!value) {
    return { smdpAddress: '', matchingId: '' };
  }
  if (!value.startsWith('LPA:1$')) {
    return { smdpAddress: '', matchingId: value };
  }
  const parts = value.split('$');
  // parts[0] = 'LPA:1', parts[1] = smdp host, parts[2..] = matching id.
  // Matching ids can contain `$` (rare but spec-allowed), so re-join the
  // tail rather than take parts[2] alone.
  return {
    smdpAddress: parts[1] ?? '',
    matchingId: parts.slice(2).join('$'),
  };
}
