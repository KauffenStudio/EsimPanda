'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/badge';
import { useBrowseStore } from '@/stores/browse';
import { useDestinations } from '@/hooks/use-destinations';
import { getStartingPrice } from '@/lib/mock-data/plans';

export function RegionalPlanCard() {
  const t = useTranslations();
  const { regionalPlan } = useDestinations();
  const toggleDestination = useBrowseStore((state) => state.toggleDestination);

  if (!regionalPlan) return null;

  const priceCents = getStartingPrice(regionalPlan.id);
  const price = (priceCents / 100).toFixed(2);

  const flag = regionalPlan.iso_code
    .toUpperCase()
    .split('')
    .map((c) => String.fromCodePoint(127397 + c.charCodeAt(0)))
    .join('');

  return (
    <div
      className="relative w-full h-40 md:h-48 rounded-[var(--radius-card)] overflow-hidden cursor-pointer shadow-card hover:shadow-card-hover transition-shadow duration-200"
      onClick={() => toggleDestination(regionalPlan.slug)}
      role="button"
      tabIndex={0}
    >
      <Image
        src={regionalPlan.image_url}
        alt={t('browse.europePlan')}
        fill
        className="object-cover"
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-4 flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <span className="text-lg">{flag}</span>
          <h3 className="text-white font-bold text-lg">{t('browse.europePlan')}</h3>
        </div>
        <p className="text-white/80 text-sm">{t('browse.europeDescription')}</p>
        <div className="flex items-center gap-2 mt-1">
          <Badge variant="accent">30+ countries</Badge>
          <span className="text-white/90 text-sm font-bold">
            {t('browse.from')} &euro;{price}
          </span>
        </div>
      </div>
    </div>
  );
}
