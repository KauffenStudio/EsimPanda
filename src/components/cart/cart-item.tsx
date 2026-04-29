'use client';

import { Trash2 } from 'lucide-react';
import { useCartStore } from '@/stores/cart';
import { useCurrencyStore } from '@/stores/currency';
import { formatPrice } from '@/lib/currency/rates';
import type { MockPlan } from '@/lib/mock-data/plans';

interface CartItemProps {
  plan: MockPlan;
}

function formatDuration(days: number): string {
  if (days === 1) return '24h';
  if (days >= 90) return `${Math.floor(days / 30)} months`;
  return `${days} days`;
}

export function CartItemRow({ plan }: CartItemProps) {
  const removeItem = useCartStore((s) => s.removeItem);
  const currency = useCurrencyStore((s) => s.currency);

  return (
    <div className="flex items-center gap-3 py-3 border-b border-gray-100 dark:border-border-dark last:border-0">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
          {plan.name}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
          {plan.data_gb}GB &middot; {formatDuration(plan.duration_days)}
        </p>
      </div>
      <span className="text-sm font-bold text-gray-900 dark:text-gray-100 whitespace-nowrap">
        {formatPrice(plan.retail_price_cents, currency)}
      </span>
      <button
        onClick={() => removeItem(plan.id)}
        className="p-1.5 text-gray-400 hover:text-destructive transition-colors shrink-0"
        aria-label="Remove"
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
}
