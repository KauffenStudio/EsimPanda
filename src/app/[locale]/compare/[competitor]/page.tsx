import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import {
  COMPARISON_LOCALES,
  DISCLAIMER,
  getComparison,
  isCompareLocale,
  listComparisonSlugs,
} from '@/lib/seo/comparisons';
import { getCatalog } from '@/lib/db/destinations';
import { JsonLd } from '@/components/seo/json-ld';
import { ComparisonTable } from '@/components/compare/comparison-table';
import { CompareFaq } from '@/components/compare/compare-faq';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://esimpanda.co';

type Props = { params: Promise<{ locale: string; competitor: string }> };

export const revalidate = 3600;

export function generateStaticParams() {
  return COMPARISON_LOCALES.flatMap((locale) =>
    listComparisonSlugs().map((competitor) => ({ locale, competitor }))
  );
}

function compareAlternates(slug: string, locale: string): Metadata['alternates'] {
  const languages: Record<string, string> = Object.fromEntries(
    COMPARISON_LOCALES.map((l) => [l, `${SITE_URL}/${l}/compare/${slug}`])
  );
  languages['x-default'] = `${SITE_URL}/en/compare/${slug}`;
  return { canonical: `${SITE_URL}/${locale}/compare/${slug}`, languages };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, competitor } = await params;
  const comparison = getComparison(competitor);
  if (!comparison || !isCompareLocale(locale)) return {};
  const title = comparison.title[locale];
  const description = comparison.description[locale];
  return {
    title: { absolute: title },
    description,
    alternates: compareAlternates(comparison.slug, locale),
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/${locale}/compare/${comparison.slug}`,
      type: 'website',
      locale: locale === 'pt' ? 'pt_PT' : 'en_US',
    },
    twitter: { card: 'summary_large_image', title, description },
  };
}

export default async function ComparePage({ params }: Props) {
  const { locale, competitor } = await params;
  if (!isCompareLocale(locale)) notFound();
  const comparison = getComparison(competitor);
  if (!comparison) notFound();
  setRequestLocale(locale);

  // Real starting price across the live catalog (no fabricated numbers).
  const { destinations, regionalPlans } = await getCatalog();
  const prices = [...destinations, ...regionalPlans]
    .map((d) => d.startingPriceCents)
    .filter((c) => c > 0);
  const minCents = prices.length ? Math.min(...prices) : 0;
  const price = minCents
    ? `$${(minCents / 100).toFixed(2)}`
    : locale === 'pt'
      ? 'preços acessíveis'
      : 'affordable prices';

  const other = listComparisonSlugs().find((s) => s !== comparison.slug);
  const otherComparison = other ? getComparison(other) : undefined;

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/${locale}` },
      { '@type': 'ListItem', position: 2, name: `eSIM Panda vs ${comparison.competitor}` },
    ],
  };

  const ctaLabel = locale === 'pt' ? 'Ver planos eSIM' : 'Browse eSIM plans';
  const seeAlso = locale === 'pt' ? 'Ver também' : 'See also';

  return (
    <div className="max-w-[820px] mx-auto px-4 pt-6 pb-16">
      <JsonLd data={breadcrumbJsonLd} />

      <h1 className="text-3xl md:text-4xl font-bold tracking-tighter text-primary dark:text-gray-100">
        {comparison.title[locale]}
      </h1>
      <p className="mt-4 text-base md:text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
        {comparison.intro[locale]}
      </p>

      <div className="grid sm:grid-cols-2 gap-4 mt-8">
        <div className="rounded-card border border-border dark:border-border-dark p-5">
          <h2 className="font-semibold text-primary dark:text-gray-100">{comparison.competitor}</h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            {comparison.competitorStrength[locale]}
          </p>
        </div>
        <div className="rounded-card border border-accent/40 bg-accent-soft/40 dark:bg-accent-soft-dark/30 p-5">
          <h2 className="font-semibold text-accent">eSIM Panda</h2>
          <p className="mt-2 text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
            {comparison.pandaPitch[locale]}
          </p>
        </div>
      </div>

      <section className="mt-12">
        <h2 className="text-2xl font-bold tracking-tighter mb-5 text-primary dark:text-gray-100">
          eSIM Panda vs {comparison.competitor}
        </h2>
        <ComparisonTable
          locale={locale}
          competitor={comparison.competitor}
          rows={comparison.rows}
          price={price}
        />
        <p className="mt-3 text-xs text-gray-400 dark:text-gray-500">{DISCLAIMER[locale]}</p>
      </section>

      <div className="mt-10 flex flex-wrap items-center gap-4">
        <Link
          href={`/${locale}/browse`}
          className="inline-flex items-center rounded-full bg-accent px-6 py-3 font-semibold text-white"
        >
          {ctaLabel} →
        </Link>
        {otherComparison && (
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {seeAlso}:{' '}
            <Link
              href={`/${locale}/compare/${otherComparison.slug}`}
              className="text-accent font-medium hover:underline"
            >
              eSIM Panda vs {otherComparison.competitor}
            </Link>
          </span>
        )}
      </div>

      <CompareFaq
        title={locale === 'pt' ? 'Perguntas frequentes' : 'Frequently asked questions'}
        items={comparison.faq.map((f) => ({ q: f.q[locale], a: f.a[locale] }))}
      />
    </div>
  );
}
