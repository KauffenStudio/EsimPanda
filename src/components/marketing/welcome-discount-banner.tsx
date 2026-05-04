'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import { motion } from 'motion/react';
import { Percent, Check, Copy } from 'lucide-react';
import { WELCOME_COUPON_CODE } from '@/lib/checkout/coupons';
import { useFirstPurchaseStatus } from '@/lib/hooks/use-first-purchase-status';

interface Props {
  showCta?: boolean;
}

export function WelcomeDiscountBanner({ showCta = true }: Props) {
  const t = useTranslations('welcomeDiscount');
  const locale = useLocale();
  const status = useFirstPurchaseStatus();
  const [copied, setCopied] = useState(false);

  if (status !== 'eligible') return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(WELCOME_COUPON_CODE);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard unavailable; user can still read the code
    }
  };

  return (
    <motion.div
      role="status"
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="mb-4 rounded-[var(--radius-card)] border border-accent/30 dark:border-accent/40 bg-accent/5 dark:bg-accent/10 p-4 flex flex-col sm:flex-row sm:items-center gap-3"
    >
      <div className="flex items-start gap-3 flex-1 min-w-0">
        <div className="w-10 h-10 rounded-full bg-accent/15 dark:bg-accent/20 flex items-center justify-center shrink-0">
          <Percent size={20} className="text-accent" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-primary dark:text-gray-100">
            {t('heading')}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
            {t('body')}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-accent/40 bg-white dark:bg-surface-dark text-accent text-xs font-mono font-semibold hover:bg-accent/5 transition-colors"
          aria-label={t('copyAria')}
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
          {WELCOME_COUPON_CODE}
        </button>
        {showCta && (
          <Link
            href={`/${locale}/browse`}
            className="text-sm font-semibold text-accent hover:underline whitespace-nowrap"
          >
            {t('cta')}
          </Link>
        )}
      </div>
    </motion.div>
  );
}
