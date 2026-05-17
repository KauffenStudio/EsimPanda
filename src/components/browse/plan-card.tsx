'use client';

import { useTranslations } from 'next-intl';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useComparisonStore } from '@/stores/comparison';
import { useCartStore } from '@/stores/cart';
import { useCurrencyStore } from '@/stores/currency';
import { formatPrice } from '@/lib/currency/rates';
// Pure pricing-display compute helpers — no I/O, no global array lookup.
// Extraction to src/lib/plans/pricing-display.ts is Phase 13 (INF-11), per the
// same boundary note in src/lib/db/destinations.ts — do not extract here.
import { getOriginalPrice, getDiscountPercent } from '@/lib/mock-data/plans';
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
  const selectedPlans = useComparisonStore((state) => state.selectedPlans);
  const togglePlan = useComparisonStore((state) => state.togglePlan);
  const addItem = useCartStore((state) => state.addItem);
  const currency = useCurrencyStore((state) => state.currency);
  const isSelected = selectedPlans.some((p) => p.id === id);

  // Phase-11 bridge: PlanCard keeps its flat-props API (RESEARCH Open Question 3)
  // because esim/[slug] also renders it and stays on mock data until Phase 12.
  // We reconstruct a minimal Plan object here from the flat props. Comparison
  // only reads name/data_gb/duration_days/retail_price_cents; the remaining
  // Plan fields are filled with safe defaults sufficient for comparison display.
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
    // Cart store is Plan-typed (canonical Plan from db/destinations); the flat
    // props already satisfy it — the timestamp fields are optional.
    addItem(plan);
  };

  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    togglePlan(plan);
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

        <div className="flex items-center gap-3">
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
          <input
            type="checkbox"
            checked={isSelected}
            onClick={handleCheckboxClick}
            onChange={() => {}}
            className="h-4 w-4 rounded border-gray-300 text-accent focus:ring-accent cursor-pointer"
            aria-label={t('browse.selectToCompare')}
          />
        </div>
      </div>
    </Card>
  );
}
