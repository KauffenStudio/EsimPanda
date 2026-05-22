'use client';

import Image from 'next/image';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { useCurrencyStore } from '@/stores/currency';
import { formatPrice } from '@/lib/currency/rates';
import { localizedDestinationName } from '@/lib/i18n/destination-name';
import type { CatalogDestination } from '@/lib/db/destinations';
import { TypographicFallbackCard } from './typographic-fallback-card';

const regionMeta: Record<string, { badge: string; countryCount: string }> = {
  'europe-wide': { badge: '30+ countries', countryCount: '30+' },
  'asia-wide': { badge: '15+ countries', countryCount: '15+' },
  global: { badge: '100+ countries', countryCount: '100+' },
};

function RegionalCard({ plan }: { plan: CatalogDestination }) {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const currency = useCurrencyStore((s) => s.currency);

  const meta = regionMeta[plan.region_bucket ?? ''] || { badge: 'Multi-country', countryCount: '' };
  const displayName = localizedDestinationName(plan.iso_code, plan.name, locale);

  return (
    <div
      className="relative w-full h-40 md:h-48 rounded-[var(--radius-card)] overflow-hidden cursor-pointer shadow-card dark:shadow-card-dark hover:shadow-card-hover dark:hover:shadow-card-hover-dark transition-shadow duration-200"
      onClick={() => router.push(`/${locale}/esim/${plan.slug}`)}
      role="button"
      tabIndex={0}
    >
      {plan.image_url ? (
        // Existing regional-plan-card photo treatment — unchanged.
        <Image
          src={plan.image_url}
          alt={`${displayName} Coverage`}
          fill
          className="object-cover"
          sizes="(min-width: 768px) 33vw, 100vw"
        />
      ) : (
        // Missing image — falls back to the SAME shared typographic primitive
        // as country cards (New Pitfall: regional cards must fall back identically).
        <TypographicFallbackCard name={displayName} />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-4 flex flex-col gap-1">
        <h3 className="text-white font-bold text-lg">
          {plan.region_bucket === 'global'
            ? t('browse.coverageGlobal')
            : t('browse.coverageRegion', { name: displayName })}
        </h3>
        <p className="text-white/80 text-sm">One plan, {meta.countryCount} countries</p>
        <div className="flex items-center gap-2 mt-1">
          <Badge variant="accent">{meta.badge}</Badge>
          {plan.startingPriceCents > 0 ? (
            <span className="text-white/90 text-sm font-bold">
              {t('browse.from')} {formatPrice(plan.startingPriceCents, currency)}
            </span>
          ) : (
            <span className="text-white/90 text-sm font-bold">{t('browse.noPlans')}</span>
          )}
          {plan.bestDiscountPercent > 0 && (
            <span className="text-[10px] font-bold text-white bg-[#E53935] px-1.5 py-0.5 rounded">
              -{plan.bestDiscountPercent}%
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

interface RegionalPlanCardProps {
  regionalPlans: CatalogDestination[];
}

export function RegionalPlanCard({ regionalPlans }: RegionalPlanCardProps) {
  if (regionalPlans.length === 0) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {regionalPlans.map((plan) => (
        <RegionalCard key={plan.slug} plan={plan} />
      ))}
    </div>
  );
}
