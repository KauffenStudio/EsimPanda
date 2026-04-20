'use client';

import { useTranslations } from 'next-intl';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useComparisonStore } from '@/stores/comparison';

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

function formatPrice(cents: number): string {
  return `${(cents / 100).toFixed(2)}`;
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
  const selectedPlanIds = useComparisonStore((state) => state.selectedPlanIds);
  const togglePlan = useComparisonStore((state) => state.togglePlan);
  const isSelected = selectedPlanIds.includes(id);

  const handleCardClick = () => {
    // TODO: navigate to /checkout?plan={id} when checkout page is built
    console.log(`Navigate to checkout for plan ${id}`);
  };

  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    togglePlan(id);
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
          <span className="text-xl font-bold text-accent">
            &euro;{formatPrice(retail_price_cents)}
          </span>
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
