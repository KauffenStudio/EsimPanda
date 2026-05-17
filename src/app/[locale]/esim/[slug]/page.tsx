import { setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { getDestinationBySlug, listActiveDestinations, listPlansForDestination } from '@/lib/db/destinations';
import { tagPlans } from '@/lib/plans/pricing-display';
import { buildProductJsonLd, buildBreadcrumbJsonLd } from '@/lib/seo/structured-data';
import { buildDestinationMeta } from '@/lib/seo/meta-templates';
import { JsonLd } from '@/components/seo/json-ld';
import { Breadcrumb } from '@/components/seo/breadcrumb';
import { DestinationHero } from '@/components/seo/destination-hero';
import { FAQSection } from '@/components/seo/faq-section';
import { PlanCard } from '@/components/browse/plan-card';
import { PageCurrencyBar } from '@/components/layout/page-currency-bar';

const REGIONAL_TYPES = ['europe-wide', 'asia-wide', 'global'];

type Props = { params: Promise<{ locale: string; slug: string }> };

export async function generateStaticParams() {
  const destinations = await listActiveDestinations();
  return routing.locales.flatMap((locale) =>
    destinations.map((d) => ({ locale, slug: d.slug }))
  );
}

export async function generateMetadata({ params }: Props) {
  const { locale, slug } = await params;
  const destination = await getDestinationBySlug(slug);
  if (!destination) return {};
  const isRegional = REGIONAL_TYPES.includes(destination.region ?? '');
  const plans = await listPlansForDestination(destination.id);
  const startingPriceCents = plans.length
    ? Math.min(...plans.map((p) => p.retail_price_cents))
    : 0;
  const startingPrice = (startingPriceCents / 100).toFixed(2);
  return buildDestinationMeta({
    countryName: destination.name,
    slug: destination.slug,
    locale,
    startingPrice,
    imageUrl: destination.image_url ?? '',
    isRegional,
  });
}

export const revalidate = 3600; // ISR: 1 hour

export default async function DestinationPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const destination = await getDestinationBySlug(slug);
  if (!destination) notFound();

  const isRegional = REGIONAL_TYPES.includes(destination.region ?? '');
  const plans = await listPlansForDestination(destination.id);
  const taggedPlans = tagPlans(plans);

  return (
    <>
      {/* Breadcrumb JSON-LD */}
      <JsonLd data={buildBreadcrumbJsonLd(locale, { name: destination.name, slug: destination.slug })} />

      {/* Product JSON-LD for each plan */}
      {taggedPlans.map((plan) => (
        <JsonLd key={plan.id} data={buildProductJsonLd(plan, destination.name)} />
      ))}

      <Breadcrumb locale={locale} destinationName={destination.name} />

      <div className="max-w-[1200px] mx-auto px-4">
        <DestinationHero
          countryName={destination.name}
          isoCode={destination.iso_code}
          isRegional={isRegional}
        />

        {/* Plan cards section */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold dark:text-gray-100">
              {isRegional ? `${destination.name} Plans` : 'Available Plans'}
            </h2>
            <PageCurrencyBar />
          </div>
          {taggedPlans.length === 0 ? (
            <div className="text-center py-8">
              <p className="font-bold text-gray-600 dark:text-gray-400">No plans available</p>
              <p className="text-gray-400 text-sm mt-1">
                We&apos;re working on adding eSIM plans for this destination. Browse our Global plan for worldwide coverage.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {taggedPlans.map((plan) => (
                <PlanCard
                  key={plan.id}
                  id={plan.id}
                  data_gb={plan.data_gb}
                  duration_days={plan.duration_days}
                  retail_price_cents={plan.retail_price_cents}
                  isBestValue={plan.isBestValue}
                  isMostPopular={plan.isMostPopular}
                />
              ))}
            </div>
          )}
        </section>

        {/* FAQ section */}
        <div className="mt-12 mb-16">
          <FAQSection countryName={destination.name} />
        </div>
      </div>
    </>
  );
}
