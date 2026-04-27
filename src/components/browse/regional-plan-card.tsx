'use client';

import Image from 'next/image';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { useDestinations } from '@/hooks/use-destinations';
import { getStartingPrice, getPlansForDestination, getBestDiscount, getOriginalPrice, getDiscountPercent } from '@/lib/mock-data/plans';
import type { MockDestination } from '@/lib/mock-data/destinations';

const regionMeta: Record<string, { badge: string; countryCount: string }> = {
  'europe-wide': { badge: '30+ countries', countryCount: '30+' },
  'asia-wide': { badge: '15+ countries', countryCount: '15+' },
  global: { badge: '100+ countries', countryCount: '100+' },
};

function RegionalCard({ plan }: { plan: MockDestination }) {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();

  const priceCents = getStartingPrice(plan.id);
  const price = (priceCents / 100).toFixed(2);
  const cheapestPlan = getPlansForDestination(plan.id).sort((a, b) => a.retail_price_cents - b.retail_price_cents)[0];
  const dataGb = cheapestPlan?.data_gb ?? 5;
  const originalPrice = (getOriginalPrice(priceCents, dataGb) / 100).toFixed(2);
  const discount = getDiscountPercent(priceCents, dataGb);
  const meta = regionMeta[plan.region] || { badge: 'Multi-country', countryCount: '' };

  return (
    <div
      className="relative w-full h-40 md:h-48 rounded-[var(--radius-card)] overflow-hidden cursor-pointer shadow-card dark:shadow-card-dark hover:shadow-card-hover dark:hover:shadow-card-hover-dark transition-shadow duration-200"
      onClick={() => router.push(`/${locale}/esim/${plan.slug}`)}
      role="button"
      tabIndex={0}
    >
      <Image
        src={plan.image_url}
        alt={`${plan.name} Coverage`}
        fill
        className="object-cover"
        sizes="(min-width: 768px) 33vw, 100vw"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-4 flex flex-col gap-1">
        <h3 className="text-white font-bold text-lg">{plan.name}-Wide Coverage</h3>
        <p className="text-white/80 text-sm">One plan, {meta.countryCount} countries</p>
        <div className="flex items-center gap-2 mt-1">
          <Badge variant="accent">{meta.badge}</Badge>
          <span className="text-white/50 text-sm line-through">${originalPrice}</span>
          <span className="text-white/90 text-sm font-bold">
            {t('browse.from')} ${price}
          </span>
          <span className="text-[10px] font-bold text-white bg-[#E53935] px-1.5 py-0.5 rounded">
            -{discount}%
          </span>
        </div>
      </div>
    </div>
  );
}

export function RegionalPlanCard() {
  const { regionalPlans } = useDestinations();

  if (regionalPlans.length === 0) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {regionalPlans.map((plan) => (
        <RegionalCard key={plan.slug} plan={plan} />
      ))}
    </div>
  );
}
