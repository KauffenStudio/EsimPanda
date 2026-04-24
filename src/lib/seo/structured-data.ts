import type { MockPlan } from '@/lib/mock-data/plans';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://esimpanda.com';

export function buildProductJsonLd(plan: MockPlan, destinationName: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: `eSIM ${destinationName} - ${plan.data_gb}GB ${plan.duration_days} days`,
    offers: {
      '@type': 'Offer',
      price: (plan.retail_price_cents / 100).toFixed(2),
      priceCurrency: 'EUR',
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
