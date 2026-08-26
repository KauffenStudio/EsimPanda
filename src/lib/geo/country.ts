import { EU_VAT_RATES } from '@/lib/checkout/tax';

/**
 * Countries where storage consent must be collected before any advertising or
 * analytics cookie is set: the EEA, plus the UK and Switzerland which hold
 * equivalent expectations under PECR / revFADP.
 */
const CONSENT_REQUIRED = new Set([
  'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR',
  'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 'PL', 'PT', 'RO', 'SK',
  'SI', 'ES', 'SE',
  'IS', 'LI', 'NO',
  'GB', 'CH',
]);

/** Vercel's edge geo header. Absent locally and on non-Vercel hosts. */
export const COUNTRY_HEADER = 'x-vercel-ip-country';

/**
 * Resolve the visitor's country from request headers.
 *
 * Returns null rather than guessing when the header is missing (local dev, a
 * non-Vercel host, some proxies). Callers decide what null means for them —
 * for tax it means "charge no VAT", which is the safe direction: over-charging
 * a customer VAT they do not owe is both a conversion killer and a refund.
 */
export function getCountry(headers: Headers): string | null {
  const raw = headers.get(COUNTRY_HEADER);
  if (!raw) return null;
  const code = raw.trim().toUpperCase();
  return /^[A-Z]{2}$/.test(code) ? code : null;
}

/** True when this visitor must opt in before advertising storage is used. */
export function requiresConsent(country: string | null): boolean {
  // Unknown location is treated as consent-required. Showing a banner to a
  // visitor who did not need one costs a tap; skipping one for a visitor who
  // did is a compliance breach.
  if (!country) return true;
  return CONSENT_REQUIRED.has(country);
}

/** VAT percentage owed by a consumer in this country. 0 outside the EU. */
export function vatRateFor(country: string | null): number {
  if (!country) return 0;
  return EU_VAT_RATES[country] ?? 0;
}
