'use client';

import { useTranslations } from 'next-intl';

const STEPS = ['select', 'payment', 'done'] as const;

interface TopUpStepsProps {
  currentStatus: string;
}

function getActiveIndex(status: string): number {
  if (status === 'plan-select') return 0;
  if (status === 'payment') return 1;
  return 2; // processing, success, error
}

export function TopUpSteps({ currentStatus }: TopUpStepsProps) {
  const t = useTranslations('dashboard.top_up_steps');
  const activeIndex = getActiveIndex(currentStatus);

  return (
    <div className="flex items-center justify-center gap-2 mb-4">
      {STEPS.map((step, i) => (
        <div key={step} className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <div
              className={`h-2 w-2 rounded-full transition-colors ${
                i <= activeIndex
                  ? 'bg-accent'
                  : 'bg-gray-200 dark:bg-gray-700'
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
              className={`h-px w-6 transition-colors ${
                i < activeIndex
                  ? 'bg-accent'
                  : 'bg-gray-200 dark:bg-gray-700'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}
