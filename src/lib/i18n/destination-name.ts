/**
 * Translate a destination row's name into the user's locale.
 *
 * The destinations table stores `name` in English ("France", "Spain", "Japan",
 * "Europe"). When the user switches the storefront to PT / ES / FR / ZH / JA
 * we want the cards, hero, breadcrumb, and meta tags to follow.
 *
 * Strategy
 *  - Real ISO-3166-1 alpha-2 country codes (length === 2): delegate to the
 *    browser/Node built-in `Intl.DisplayNames` with `type: 'region'`. CLDR
 *    backs this with translations for every supported country in every
 *    supported language — no maintenance burden.
 *  - The three curated synthetic regional ISOs (EUW / ASW / GLW): no CLDR
 *    coverage. Use a small hand-maintained table.
 *  - Anything else: fall back to the stored English `name` so we never blank
 *    a card.
 */
const REGIONAL_NAMES: Readonly<Record<string, Readonly<Record<string, string>>>> = {
  EUW: { en: 'Europe', pt: 'Europa', es: 'Europa', fr: 'Europe', zh: '欧洲', ja: 'ヨーロッパ' },
  ASW: { en: 'Asia', pt: 'Ásia', es: 'Asia', fr: 'Asie', zh: '亚洲', ja: 'アジア' },
  GLW: { en: 'Global', pt: 'Global', es: 'Global', fr: 'Mondial', zh: '全球', ja: 'グローバル' },
};

// Intl.DisplayNames instances are not free to construct. Cache them per locale
// so the browse grid (~226 rows) doesn't pay the cost on every cell.
const displayNamesCache = new Map<string, Intl.DisplayNames>();

function getDisplayNames(locale: string): Intl.DisplayNames | null {
  const cached = displayNamesCache.get(locale);
  if (cached) return cached;
  try {
    const instance = new Intl.DisplayNames([locale], { type: 'region' });
    displayNamesCache.set(locale, instance);
    return instance;
  } catch {
    return null;
  }
}

export function localizedDestinationName(
  isoCode: string,
  fallbackName: string,
  locale: string,
): string {
  const regional = REGIONAL_NAMES[isoCode];
  if (regional) return regional[locale] ?? regional.en ?? fallbackName;

  if (isoCode.length === 2) {
    try {
      const translated = getDisplayNames(locale)?.of(isoCode.toUpperCase());
      if (translated && translated !== isoCode.toUpperCase()) return translated;
    } catch {
      // fall through to English fallback
    }
  }

  return fallbackName;
}
