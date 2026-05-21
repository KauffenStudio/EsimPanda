/**
 * The destinations table uses 3-letter synthetic ISOs (EUW / ASW / GLW) for the
 * three curated regional hero rows so they cannot collide with real
 * ISO-3166-1 alpha-2 country codes (an earlier 'EU' / 'AS' / 'GL' version did —
 * 'AS' is American Samoa, 'GL' is Greenland, and Celitech's country sync
 * overwrote our curated rows on every run).
 *
 * Celitech's API does NOT know about our synthetic codes. Purchase calls (and
 * any other path that sends a destination identifier to Celitech) must
 * translate back to Celitech's own regional identifier. Country ISOs pass
 * through unchanged.
 *
 * The Celitech regional identifiers are inferred from the adapter test fixture
 * (`Africa (16 countries)` → `AFRICA`) plus the storefront's observed regional
 * coverage. If Celitech ever uses different strings for these three buckets,
 * update this map in one place and everything that talks to Celitech follows.
 */
const CURATED_TO_WHOLESALE_ISO: Readonly<Record<string, string>> = {
  EUW: 'EUROPE',
  ASW: 'ASIA',
  GLW: 'GLOBAL',
};

/**
 * Translate one of our destination ISOs into the identifier Celitech expects
 * for `purchase()` and similar API calls. Returns the input unchanged when no
 * translation is needed (i.e. for every real country code).
 */
export function toWholesaleIso(ourIso: string): string {
  return CURATED_TO_WHOLESALE_ISO[ourIso] ?? ourIso;
}
