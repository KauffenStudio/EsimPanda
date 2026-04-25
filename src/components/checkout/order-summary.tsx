'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'motion/react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCheckoutStore } from '@/stores/checkout';
import type { MockPlan } from '@/lib/mock-data/plans';

interface OrderSummaryProps {
  plan: MockPlan;
}

function formatEur(cents: number): string {
  return `EUR ${(cents / 100).toFixed(2)}`;
}

export function OrderSummary({ plan }: OrderSummaryProps) {
  const t = useTranslations('checkout.summary');
  const { subtotal_cents, discount_cents, tax_cents, total_cents, coupon_code, payment_status } =
    useCheckoutStore();

  const displaySubtotal = subtotal_cents || plan.retail_price_cents;
  const taxRate = 23; // Default EU VAT rate, updated by API

  return (
    <Card variant="flat" className="bg-[#F5F5F5] dark:bg-surface-dark shadow-[0_2px_8px_rgba(0,0,0,0.06)] dark:shadow-card-dark p-4">
      <h2 className="text-base font-semibold mb-3 dark:text-gray-100">{t('title')}</h2>

      {/* Plan info */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-base font-medium dark:text-gray-100">{plan.name}</p>
          <Badge variant="default" className="mt-1">
            {plan.data_gb}GB / {plan.duration_days} days
          </Badge>
        </div>
      </div>

      {/* Price breakdown */}
      <div className="flex flex-col gap-2 border-t border-gray-200 dark:border-border-dark pt-3">
        {/* Subtotal */}
        <div className="flex justify-between text-base">
          <span>{t('subtotal')}</span>
          <motion.span
            key={displaySubtotal}
            layout
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          >
            {formatEur(displaySubtotal)}
          </motion.span>
        </div>

        {/* Discount line (only when coupon applied) */}
        {coupon_code && discount_cents > 0 && (
          <div className="flex justify-between text-base">
            <span>{t('discount')}</span>
            <div className="flex items-center gap-2">
              <span className="text-gray-400 line-through text-sm">
                {formatEur(displaySubtotal + discount_cents)}
              </span>
              <motion.span
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="text-success text-sm"
              >
                -{formatEur(discount_cents)}
              </motion.span>
            </div>
          </div>
        )}

        {/* VAT */}
        <div className="flex justify-between text-base">
          <span>{t('vat', { rate: taxRate })}</span>
          {tax_cents === 0 && payment_status === 'creating' ? (
            <span className="animate-[pulse_1.5s_ease-in-out_infinite] text-gray-400">
              {t('vatCalculating')}
            </span>
          ) : (
            <motion.span
              key={tax_cents}
              layout
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            >
              {formatEur(tax_cents)}
            </motion.span>
          )}
        </div>

        {/* Total */}
        <div className="flex justify-between border-t border-gray-200 dark:border-border-dark pt-2 mt-1">
          <span className="text-2xl font-bold dark:text-gray-100">{t('total')}</span>
          <motion.span
            key={total_cents}
            layout
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="text-2xl font-bold dark:text-gray-100"
          >
            {formatEur(total_cents || displaySubtotal)}
          </motion.span>
        </div>
      </div>
    </Card>
  );
}
