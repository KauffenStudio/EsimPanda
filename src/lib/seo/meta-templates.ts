import type { Metadata } from 'next';
import { routing } from '@/i18n/routing';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://esimpanda.co';

// Map our routing locales to BCP-47 / OG locale codes.
const OG_LOCALE: Record<string, string> = {
  en: 'en_US',
  pt: 'pt_PT',
  es: 'es_ES',
  fr: 'fr_FR',
  zh: 'zh_CN',
  ja: 'ja_JP',
};

export function ogLocale(locale: string): string {
  return OG_LOCALE[locale] ?? 'en_US';
}

/**
 * Self-referencing canonical + hreflang alternates (including x-default) for a
 * given locale and path. `path` is the locale-less suffix, e.g. '' for the home
 * page, '/browse', or '/esim/france'.
 */
export function buildAlternates(locale: string, path: string): Metadata['alternates'] {
  const languages: Record<string, string> = Object.fromEntries(
    routing.locales.map((l) => [l, `${SITE_URL}/${l}${path}`])
  );
  languages['x-default'] = `${SITE_URL}/${routing.defaultLocale}${path}`;
  return {
    canonical: `${SITE_URL}/${locale}${path}`,
    languages,
  };
}

type Copy = { title: string; description: string };

const HOME_COPY: Record<string, Copy> = {
  en: {
    title: 'eSIM Panda — Affordable Travel eSIM Data Plans Worldwide',
    description:
      'Buy a travel eSIM and get online in under 2 minutes. Affordable data plans for 190+ destinations, instant activation, no SIM swaps and no roaming fees.',
  },
  pt: {
    title: 'eSIM Panda — Planos de Dados eSIM para Viagens em Todo o Mundo',
    description:
      'Compra um eSIM de viagem e fica online em menos de 2 minutos. Planos de dados acessíveis para mais de 190 destinos, ativação instantânea, sem trocar de SIM e sem roaming.',
  },
  es: {
    title: 'eSIM Panda — Planes de Datos eSIM para Viajes en Todo el Mundo',
    description:
      'Compra una eSIM de viaje y conéctate en menos de 2 minutos. Planes de datos económicos para más de 190 destinos, activación instantánea, sin cambiar de SIM ni tarifas de roaming.',
  },
  fr: {
    title: 'eSIM Panda — Forfaits Data eSIM pour Voyager dans le Monde Entier',
    description:
      'Achetez une eSIM de voyage et connectez-vous en moins de 2 minutes. Forfaits data abordables pour plus de 190 destinations, activation instantanée, sans changer de SIM ni frais d’itinérance.',
  },
  zh: {
    title: 'eSIM Panda — 全球旅行 eSIM 数据套餐',
    description:
      '购买旅行 eSIM，2 分钟内即可联网。覆盖 190 多个目的地的实惠数据套餐，即时激活，无需换卡，无漫游费。',
  },
  ja: {
    title: 'eSIM Panda — 世界中で使える旅行用 eSIM データプラン',
    description:
      '旅行用 eSIM を購入して2分以内にオンラインに。190以上の国と地域に対応した手頃なデータプラン。即時開通、SIM入れ替え不要、ローミング料金なし。',
  },
};

const BROWSE_COPY: Record<string, Copy> = {
  en: {
    title: 'Browse eSIM Plans by Destination',
    description:
      'Compare and buy eSIM data plans for 190+ countries and regions. Instant activation, transparent pricing and worldwide coverage with eSIM Panda.',
  },
  pt: {
    title: 'Explorar Planos eSIM por Destino',
    description:
      'Compara e compra planos de dados eSIM para mais de 190 países e regiões. Ativação instantânea, preços transparentes e cobertura mundial com a eSIM Panda.',
  },
  es: {
    title: 'Explora Planes eSIM por Destino',
    description:
      'Compara y compra planes de datos eSIM para más de 190 países y regiones. Activación instantánea, precios transparentes y cobertura mundial con eSIM Panda.',
  },
  fr: {
    title: 'Parcourir les Forfaits eSIM par Destination',
    description:
      'Comparez et achetez des forfaits data eSIM pour plus de 190 pays et régions. Activation instantanée, tarifs transparents et couverture mondiale avec eSIM Panda.',
  },
  zh: {
    title: '按目的地浏览 eSIM 套餐',
    description:
      '比较并购买覆盖 190 多个国家和地区的 eSIM 数据套餐。eSIM Panda 提供即时激活、透明定价和全球覆盖。',
  },
  ja: {
    title: '目的地から eSIM プランを探す',
    description:
      '190以上の国と地域の eSIM データプランを比較・購入。eSIM Panda なら即時開通、明朗な料金、世界中で使えます。',
  },
};

/** Home page metadata. Brand-led title (absolute, so the layout template is not appended). */
export function buildHomeMeta(locale: string): Metadata {
  const copy = HOME_COPY[locale] ?? HOME_COPY.en;
  return {
    title: { absolute: copy.title },
    description: copy.description,
    alternates: buildAlternates(locale, ''),
    openGraph: {
      title: copy.title,
      description: copy.description,
      url: `${SITE_URL}/${locale}`,
      type: 'website',
      locale: ogLocale(locale),
    },
    twitter: { card: 'summary_large_image', title: copy.title, description: copy.description },
  };
}

/** Browse hub metadata. Plain title string — the layout appends "| eSIM Panda". */
export function buildBrowseMeta(locale: string): Metadata {
  const copy = BROWSE_COPY[locale] ?? BROWSE_COPY.en;
  return {
    title: copy.title,
    description: copy.description,
    alternates: buildAlternates(locale, '/browse'),
    openGraph: {
      title: copy.title,
      description: copy.description,
      url: `${SITE_URL}/${locale}/browse`,
      type: 'website',
      locale: ogLocale(locale),
    },
    twitter: { card: 'summary_large_image', title: copy.title, description: copy.description },
  };
}

export function buildDestinationMeta(params: {
  countryName: string;
  slug: string;
  locale: string;
  startingPrice: string;
  imageUrl: string;
  isRegional?: boolean;
}): Metadata {
  const { countryName, slug, locale, startingPrice, imageUrl, isRegional } = params;
  const regionSuffix = isRegional ? ' — Multi-Country Coverage' : '';
  // Plain title string so the root layout's "%s | eSIM Panda" template is
  // appended exactly once (the previous version hard-coded the brand suffix,
  // which would now duplicate it).
  const title = `eSIM ${countryName}${regionSuffix} — Instant Data Plans`;
  const description = isRegional
    ? `Get an eSIM for ${countryName} with multi-country coverage. Plans from $${startingPrice}. No SIM swaps, instant activation. Perfect for travelers worldwide.`
    : `Get an eSIM for ${countryName} in under 2 minutes. Plans from $${startingPrice}. No SIM swaps, instant activation. Perfect for travelers worldwide.`;
  return {
    title,
    description,
    alternates: buildAlternates(locale, `/esim/${slug}`),
    openGraph: {
      title,
      description: `Plans from $${startingPrice}. Instant activation.`,
      url: `${SITE_URL}/${locale}/esim/${slug}`,
      images: imageUrl ? [imageUrl] : undefined,
      type: 'website',
      locale: ogLocale(locale),
    },
    twitter: { card: 'summary_large_image' },
  };
}
