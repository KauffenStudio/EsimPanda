import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { localizedDestinationName } from '@/lib/i18n/destination-name';

function isoToFlag(isoCode: string): string {
  if (isoCode.length !== 2) return '🌍';
  return isoCode
    .toUpperCase()
    .split('')
    .map((c) => String.fromCodePoint(127397 + c.charCodeAt(0)))
    .join('');
}

export type PopularDestination = {
  slug: string;
  iso_code: string;
  name: string;
  startingPriceCents: number;
};

export async function PopularDestinations({
  locale,
  destinations,
}: {
  locale: string;
  destinations: PopularDestination[];
}) {
  if (destinations.length === 0) return null;
  const t = await getTranslations('landing.popular');

  return (
    <section className="w-full max-w-[1100px] mx-auto px-4 mt-16 md:mt-28">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tighter text-primary dark:text-gray-100">
          {t('title')}
        </h2>
        <Link
          href={`/${locale}/browse`}
          className="text-sm font-semibold text-accent whitespace-nowrap hover:underline"
        >
          {t('viewAll')} →
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
        {destinations.map((dest) => {
          const name = localizedDestinationName(dest.iso_code, dest.name, locale);
          const price =
            dest.startingPriceCents > 0
              ? `${t('from')} $${(dest.startingPriceCents / 100).toFixed(2)}`
              : null;
          return (
            <Link
              key={dest.slug}
              href={`/${locale}/esim/${dest.slug}`}
              className="flex items-center gap-3 rounded-card bg-white dark:bg-surface-dark border border-border dark:border-border-dark p-4 shadow-card transition-all duration-300 hover:shadow-card-hover hover:-translate-y-0.5"
            >
              <span className="text-2xl shrink-0" role="img" aria-label={`${name} flag`}>
                {isoToFlag(dest.iso_code)}
              </span>
              <span className="min-w-0">
                <span className="block font-semibold text-primary dark:text-gray-100 truncate">
                  {name}
                </span>
                {price && (
                  <span className="block text-xs text-gray-500 dark:text-gray-400">{price}</span>
                )}
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
