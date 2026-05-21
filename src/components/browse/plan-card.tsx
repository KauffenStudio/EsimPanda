'use client';

import { useTranslations } from 'next-intl';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCartStore } from '@/stores/cart';
import { useCurrencyStore } from '@/stores/currency';
import { formatPrice } from '@/lib/currency/rates';
import { getOriginalPrice, getDiscountPercent } from '@/lib/plans/pricing-display';
import type { Plan } from '@/lib/db/destinations';

interface PlanCardProps {
  id: string;
  data_gb: number;
  duration_days: number;
  retail_price_cents: number;
  isBestValue: boolean;
  isMostPopular: boolean;
}

function formatDuration(days: number): string {
  if (days === 1) return '24h';
  if (days >= 90) return `${Math.floor(days / 30)} months`;
  return `${days} days`;
}

export function PlanCard({
  id,
  data_gb,
  duration_days,
  retail_price_cents,
  isBestValue,
  isMostPopular,
}: PlanCardProps) {
  const t = useTranslations();
  const addItem = useCartStore((state) => state.addItem);
  const currency = useCurrencyStore((state) => state.currency);

  // PlanCard keeps its flat-props API and reconstructs a minimal Plan object
  // here from the flat props for the cart store, which is Plan-typed.
  const plan: Plan = {
    id,
    destination_id: '',
    wholesale_plan_id: '',
    provider: 'celitech',
    name: `${data_gb}GB · ${formatDuration(duration_days)}`,
    data_gb,
    duration_days,
    wholesale_price_cents: 0,
    retail_price_cents,
    currency: 'USD',
    is_active: true,
  };

  const handleCardClick = () => {
    addItem(plan);
  };

  return (
    <Card variant="flat" onClick={handleCardClick} className="relative p-4">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold">{data_gb}GB</span>
            <span className="text-gray-400">&middot;</span>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {formatDuration(duration_days)}
            </span>
          </div>
          <div className="flex gap-1.5">
            {isBestValue && (
              <Badge variant="success">{t('browse.bestValue')}</Badge>
            )}
            {isMostPopular && (
              <Badge variant="accent">{t('browse.mostPopular')}</Badge>
            )}
          </div>
        </div>

        <div className="flex flex-col items-end">
          {data_gb > 1 && (
            <span className="text-xs text-gray-400 line-through">
              {formatPrice(getOriginalPrice(retail_price_cents, data_gb), currency)}
            </span>
          )}
          <div className="flex items-center gap-1.5">
            {data_gb > 1 && (
              <span className="text-[10px] font-bold text-white bg-[#E53935] px-1.5 py-0.5 rounded">
                -{getDiscountPercent(retail_price_cents, data_gb)}%
              </span>
            )}
            <span className="text-xl font-bold text-accent">
              {formatPrice(retail_price_cents, currency)}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}
