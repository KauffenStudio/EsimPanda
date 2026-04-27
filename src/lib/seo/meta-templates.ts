import { routing } from '@/i18n/routing';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://esimpanda.com';

export function buildDestinationMeta(params: {
  countryName: string;
  slug: string;
  locale: string;
  startingPrice: string;
  imageUrl: string;
  isRegional?: boolean;
}) {
  const { countryName, slug, locale, startingPrice, imageUrl, isRegional } = params;
  const regionSuffix = isRegional ? ' -- Multi-Country Coverage' : '';
  return {
    title: `eSIM ${countryName}${regionSuffix} -- Instant Data Plans | eSIM Panda`,
    description: isRegional
      ? `Get an eSIM for ${countryName} with multi-country coverage. Plans from $${startingPrice}. No SIM swaps, instant activation. Perfect for travelers worldwide.`
      : `Get an eSIM for ${countryName} in under 2 minutes. Plans from $${startingPrice}. No SIM swaps, instant activation. Perfect for travelers worldwide.`,
    openGraph: {
      title: `eSIM ${countryName}${regionSuffix} -- Instant Data Plans`,
      description: `Plans from $${startingPrice}. Instant activation.`,
      images: [imageUrl],
      type: 'website' as const,
    },
    twitter: { card: 'summary_large_image' as const },
    alternates: {
      languages: Object.fromEntries(
        routing.locales.map((l) => [l, `${SITE_URL}/${l}/esim/${slug}`])
      ),
    },
  };
}
