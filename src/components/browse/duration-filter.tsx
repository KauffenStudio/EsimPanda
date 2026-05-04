'use client';

import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'motion/react';
import { useBrowseStore, type DurationFilter as DurationFilterType } from '@/stores/browse';

const chips: { key: DurationFilterType; labelKey: string }[] = [
  { key: 'all', labelKey: 'browse.filterAll' },
  { key: '14', labelKey: 'browse.filter14d' },
  { key: '20', labelKey: 'browse.filter20d' },
  { key: '30', labelKey: 'browse.filter30d' },
  { key: '90', labelKey: 'browse.filterSemester' },
];

export function DurationFilter() {
  const t = useTranslations();
  const durationFilter = useBrowseStore((state) => state.durationFilter);
  const setDurationFilter = useBrowseStore((state) => state.setDurationFilter);

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {chips.map((chip) => {
        const isActive = durationFilter === chip.key;
        return (
          <button
            key={chip.key}
            onClick={() => setDurationFilter(chip.key)}
            className={`relative px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
              isActive
                ? 'text-white'
                : 'text-gray-600 dark:text-gray-400 bg-surface'
            }`}
          >
            <AnimatePresence>
              {isActive && (
                <motion.div
                  layoutId="active-chip"
                  className="absolute inset-0 bg-accent rounded-full"
                  initial={false}
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
                />
              )}
            </AnimatePresence>
            <span className="relative z-10">{t(chip.labelKey)}</span>
          </button>
        );
      })}
    </div>
  );
}
