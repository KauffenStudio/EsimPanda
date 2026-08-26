'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'motion/react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCheckoutStore } from '@/stores/checkout';
import { useCurrencyStore } from '@/stores/currency';
import { formatPrice as fmtPrice } from '@/lib/currency/rates';
import { isoToFlag } from '@/lib/i18n/flag';
import type { Plan } from '@/lib/db/destinations';

interface OrderSummaryProps {
  plan: Plan;
}

// formatUsd kept as local alias — currency-aware version used via fmtPrice
function formatUsd(cents: number, cur: string): string {
  return fmtPrice(cents, cur as import('@/lib/currency/rates').CurrencyCode);
}

export function OrderSummary({ plan }: OrderSummaryProps) {
  const t = useTranslations('checkout.summary');
  const {
    subtotal_cents,
    discount_cents,
    tax_cents,
    tax_rate,
    total_cents,
    coupon_code,
    payment_status,
  } = useCheckoutStore();
  const currency = useCurrencyStore((s) => s.currency);

  const displaySubtotal = subtotal_cents || plan.retail_price_cents;

  // Rate comes from the API, which resolves it from the buyer's country. It
  // used to be hardcoded to 23 here while the server also hardcoded 'PT', so
  // every customer on earth was shown — and charged — Portuguese VAT.
  const taxRate = tax_rate;
  const showVat = taxRate > 0;

  return (
    <Card variant="flat" className="bg-[#F5F5F5] dark:bg-surface-dark shadow-[0_2px_8px_rgba(0,0,0,0.06)] dark:shadow-card-dark p-4">
      <h2 className="text-base font-semibold mb-3 dark:text-gray-100">{t('title')}</h2>

      {/* Plan info — the destination is the part the buyer needs to verify.
          This block previously printed plan.name ("2GB / 30 days") above a
          badge saying the same thing, and never named the country at all. */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-base font-semibold dark:text-gray-100">
            {plan.destination_name ? (
              <>
                <span aria-hidden="true">{isoToFlag(plan.destination_iso)}</span>{' '}
                {plan.destination_name}
              </>
            ) : (
              plan.name
            )}
          </p>
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
            {formatUsd(displaySubtotal, currency)}
          </motion.span>
        </div>

        {/* Discount line (only when coupon applied) */}
        {coupon_code && discount_cents > 0 && (
          <div className="flex justify-between text-base">
            <span>{t('discount')}</span>
            <div className="flex items-center gap-2">
              <span className="text-gray-400 line-through text-sm">
                {formatUsd(displaySubtotal + discount_cents, currency)}
              </span>
              <motion.span
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="text-success text-sm"
              >
                -{formatUsd(discount_cents, currency)}
              </motion.span>
            </div>
          </div>
        )}

        {/* VAT — hidden entirely outside the EU, where none is owed. */}
        {showVat && (
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
              {formatUsd(tax_cents, currency)}
            </motion.span>
          )}
        </div>
        )}

        {/* Total */}
        <div className="flex justify-between border-t border-gray-200 dark:border-border-dark pt-2 mt-1">
          <span className="text-2xl font-bold dark:text-gray-100">{t('total')}</span>
          <motion.span
            key={total_cents}
            layout
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="text-2xl font-bold dark:text-gray-100"
          >
            {formatUsd(total_cents || displaySubtotal, currency)}
          </motion.span>
        </div>
      </div>
    </Card>
  );
}
