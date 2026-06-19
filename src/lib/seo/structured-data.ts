import type { Plan } from '@/lib/db/destinations';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://esimpanda.co';

/**
 * Site-wide Organization schema. Rendered on every page so Google can attach a
 * brand entity (logo in the Knowledge Panel, brand recognition across results).
 */
export function buildOrganizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'eSIM Panda',
    url: SITE_URL,
    logo: `${SITE_URL}/icon-512x512.png`,
    description:
      'Affordable travel eSIM data plans for 190+ destinations worldwide. Instant activation, no SIM swaps, no roaming fees.',
  };
}

/**
 * WebSite schema, localized per request. Helps Google understand the canonical
 * site name and the primary language of each locale tree.
 */
export function buildWebsiteJsonLd(locale: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'eSIM Panda',
    url: `${SITE_URL}/${locale}`,
    inLanguage: locale,
    publisher: { '@type': 'Organization', name: 'eSIM Panda' },
  };
}

export function buildProductJsonLd(plan: Plan, destinationName: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: `eSIM ${destinationName} - ${plan.data_gb}GB ${plan.duration_days} days`,
    brand: { '@type': 'Brand', name: 'eSIM Panda' },
    offers: {
      '@type': 'Offer',
      price: (plan.retail_price_cents / 100).toFixed(2),
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
    },
  };
}

export function buildFaqJsonLd(questions: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: questions.map((q) => ({
      '@type': 'Question',
      name: q.question,
      acceptedAnswer: { '@type': 'Answer', text: q.answer },
    })),
  };
}

export function buildBreadcrumbJsonLd(locale: string, destination?: { name: string; slug: string }) {
  const items: { position: number; name: string; item?: string }[] = [
    { position: 1, name: 'Home', item: `${SITE_URL}/${locale}` },
    { position: 2, name: 'Destinations', item: `${SITE_URL}/${locale}/browse` },
  ];
  if (destination) {
    items.push({ position: 3, name: destination.name });
  }
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item) => ({
      '@type': 'ListItem',
      ...item,
    })),
  };
}
