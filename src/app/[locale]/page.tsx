import type { Metadata } from 'next';
import Link from 'next/link';
import { setRequestLocale } from 'next-intl/server';
import { buildHomeMeta } from '@/lib/seo/meta-templates';
import { getCatalog } from '@/lib/db/destinations';
import { getComparison, isCompareLocale, listComparisonSlugs } from '@/lib/seo/comparisons';
import { LandingClient } from '@/components/home/landing-client';
import { ValueProps } from '@/components/home/value-props';
import { HowItWorks } from '@/components/home/how-it-works';
import { PopularDestinations } from '@/components/home/popular-destinations';
import { WhyPanda } from '@/components/home/why-panda';
import { HomeFaq } from '@/components/home/home-faq';

type Props = { params: Promise<{ locale: string }> };

// ISR — the popular-destinations grid reads the catalog; match the browse/esim
// revalidation cadence so it stays static and cheap to serve.
export const revalidate = 3600;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return buildHomeMeta(locale);
}

export default async function LandingPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const { destinations } = await getCatalog();
  const popular = destinations.slice(0, 12).map((d) => ({
    slug: d.slug,
    iso_code: d.iso_code,
    name: d.name,
    startingPriceCents: d.startingPriceCents,
  }));

  return (
    <>
      <LandingClient />
      <ValueProps />
      <HowItWorks />
      <PopularDestinations locale={locale} destinations={popular} />
      <WhyPanda />
      {isCompareLocale(locale) && (
        <section className="w-full max-w-[760px] mx-auto px-4 mt-10 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {locale === 'pt' ? 'Comparar: ' : 'Compare: '}
            {listComparisonSlugs().map((slug, i) => {
              const c = getComparison(slug);
              if (!c) return null;
              return (
                <span key={slug}>
                  {i > 0 && <span className="mx-1">·</span>}
                  <Link
                    href={`/${locale}/compare/${slug}`}
                    className="text-accent font-medium hover:underline"
                  >
                    eSIM Panda vs {c.competitor}
                  </Link>
                </span>
              );
            })}
          </p>
        </section>
      )}
      <HomeFaq />
    </>
  );
}
