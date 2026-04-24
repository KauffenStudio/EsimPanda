import { routing } from '@/i18n/routing';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://esimpanda.com';

export function buildDestinationMeta(params: {
  countryName: string;
  slug: string;
  locale: string;
  startingPriceEur: string;
  imageUrl: string;
  isRegional?: boolean;
}) {
  const { countryName, slug, locale, startingPriceEur, imageUrl, isRegional } = params;
  const regionSuffix = isRegional ? ' -- 30+ Countries' : '';
  return {
    title: `eSIM ${countryName}${regionSuffix} -- Instant Data Plans for Students | eSIM Panda`,
    description: isRegional
      ? `Get an eSIM for ${countryName} covering 30+ countries. Plans from EUR${startingPriceEur}. No SIM swaps, instant activation. Perfect for Erasmus and international students.`
      : `Get an eSIM for ${countryName} in under 2 minutes. Plans from EUR${startingPriceEur}. No SIM swaps, instant activation. Perfect for Erasmus and international students.`,
    openGraph: {
      title: `eSIM ${countryName}${regionSuffix} -- Instant Data Plans for Students`,
      description: `Plans from EUR${startingPriceEur}. Instant activation.`,
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
