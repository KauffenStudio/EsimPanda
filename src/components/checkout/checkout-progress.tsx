'use client';

import { useTranslations } from 'next-intl';

const STEPS = ['review', 'details', 'pay'] as const;

interface CheckoutProgressProps {
  activeIndex?: number;
}

export function CheckoutProgress({ activeIndex = 0 }: CheckoutProgressProps) {
  const t = useTranslations('checkout.progress');

  return (
    <div className="flex items-center justify-center gap-1.5 mb-4">
      {STEPS.map((step, i) => (
        <div key={step} className="flex items-center gap-1.5">
          <div className="flex items-center gap-1">
            <div
              className={`h-1.5 w-1.5 rounded-full transition-colors ${
                i <= activeIndex ? 'bg-accent' : 'bg-gray-200 dark:bg-gray-700'
              }`}
            />
            <span
              className={`text-xs font-medium transition-colors ${
                i <= activeIndex
                  ? 'text-gray-900 dark:text-gray-100'
                  : 'text-gray-400 dark:text-gray-600'
              }`}
            >
              {t(step)}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div
              className={`h-px w-4 transition-colors ${
                i < activeIndex ? 'bg-accent' : 'bg-gray-200 dark:bg-gray-700'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}
