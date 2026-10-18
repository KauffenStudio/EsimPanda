'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import { Check, Copy, Ticket, ArrowRight } from 'lucide-react';
import {
  PANDA5_COUPON_CODE,
  PANDA5_AMOUNT_EUR_CENTS,
  PANDA5_MIN_TOTAL_EUR_CENTS,
} from '@/lib/checkout/coupons';
import { DISPLAY_DISCOUNT_PERCENT } from '@/lib/plans/pricing-display';
import { DealCountdown } from './deal-countdown';

/**
 * Homepage promo: the PANDA5 code (€2 off from €20) the buyer copies and pastes
 * into the checkout coupon field, plus the storefront discount countdown.
 */
export function Panda5Banner() {
  const t = useTranslations('promo');
  const locale = useLocale();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(PANDA5_COUPON_CODE);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard unavailable; the code is on screen to type by hand
    }
  };

  return (
    <section
      aria-label={t('panda5.heading', { amount: PANDA5_AMOUNT_EUR_CENTS / 100 })}
      className="w-full max-w-[760px] mx-auto px-4 mt-8"
    >
      <div className="rounded-[var(--radius-card)] border border-accent/30 dark:border-accent/40 bg-accent/5 dark:bg-accent/10 p-4 md:p-5 flex flex-col md:flex-row md:items-center gap-4">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="w-10 h-10 rounded-full bg-accent/15 dark:bg-accent/20 flex items-center justify-center shrink-0">
            <Ticket size={20} className="text-accent" aria-hidden="true" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-base font-bold text-primary dark:text-gray-100">
              {t('panda5.heading', { amount: PANDA5_AMOUNT_EUR_CENTS / 100 })}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
              {t('panda5.body', { min: PANDA5_MIN_TOTAL_EUR_CENTS / 100 })}
            </p>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-2">
              <span className="text-[10px] font-bold text-white bg-destructive px-1.5 py-0.5 rounded">
                -{DISPLAY_DISCOUNT_PERCENT}%
              </span>
              <span className="text-xs text-gray-600 dark:text-gray-400">
                {t('allPlans', { percent: DISPLAY_DISCOUNT_PERCENT })}
              </span>
              <DealCountdown />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={handleCopy}
            aria-label={t('panda5.copyAria', { code: PANDA5_COUPON_CODE })}
            className="inline-flex items-center gap-2 min-h-[44px] px-4 rounded-lg border-2 border-dashed border-accent/60 bg-white dark:bg-surface-dark text-accent font-mono text-base font-bold tracking-wider hover:bg-accent/5 transition-colors"
          >
            {PANDA5_COUPON_CODE}
            {copied ? <Check size={16} aria-hidden="true" /> : <Copy size={16} aria-hidden="true" />}
          </button>
          <span role="status" className="sr-only">
            {copied ? t('panda5.copied') : ''}
          </span>
          <Link
            href={`/${locale}/browse`}
            className="inline-flex items-center gap-1 text-sm font-semibold text-accent hover:underline whitespace-nowrap"
          >
            {copied ? t('panda5.copied') : t('panda5.cta')}
            <ArrowRight size={14} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}
