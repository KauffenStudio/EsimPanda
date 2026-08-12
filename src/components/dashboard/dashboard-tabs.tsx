'use client';

import { motion } from 'motion/react';
import { useTranslations } from 'next-intl';

type TabValue = 'esims' | 'history';

interface DashboardTabsProps {
  active_tab: TabValue;
  onTabChange: (tab: TabValue) => void;
}

const tabs: { value: TabValue; i18nKey: string }[] = [
  { value: 'esims', i18nKey: 'dashboard.tab_esims' },
  { value: 'history', i18nKey: 'dashboard.tab_history' },
];

export function DashboardTabs({ active_tab, onTabChange }: DashboardTabsProps) {
  const t = useTranslations();

  return (
    <div role="tablist" className="flex w-full h-12 border-b border-gray-200 dark:border-border-dark relative">
      {tabs.map((tab) => {
        const isActive = active_tab === tab.value;
        return (
          <button
            key={tab.value}
            role="tab"
            aria-selected={isActive}
            onClick={() => onTabChange(tab.value)}
            className={`relative flex-1 flex items-center justify-center text-base transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-inset ${
              isActive
                ? 'font-bold text-primary dark:text-gray-100 bg-accent-soft dark:bg-accent-soft-dark rounded-t-lg'
                : 'font-normal text-gray-600 dark:text-gray-400'
            }`}
          >
            {t(tab.i18nKey)}
            {isActive && (
              <motion.div
                layoutId="tab-indicator"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent"
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
