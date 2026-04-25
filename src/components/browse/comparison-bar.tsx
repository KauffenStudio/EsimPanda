'use client';

import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'motion/react';
import { useComparisonStore } from '@/stores/comparison';

export function ComparisonBar() {
  const t = useTranslations();
  const selectedPlanIds = useComparisonStore((state) => state.selectedPlanIds);
  const openSheet = useComparisonStore((state) => state.openSheet);
  const clearSelection = useComparisonStore((state) => state.clearSelection);

  return (
    <AnimatePresence>
      {selectedPlanIds.length >= 2 && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
          className="fixed bottom-16 left-0 right-0 z-40"
        >
          <div className="mx-4 p-3 bg-accent rounded-[var(--radius-card)] shadow-lg dark:shadow-card-dark flex items-center justify-between">
            <span className="text-white font-bold">
              {t('browse.compare')} ({selectedPlanIds.length})
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={openSheet}
                className="px-3 py-1 bg-white/20 rounded-full text-white text-sm font-medium"
              >
                {t('browse.compare')}
              </button>
              <button
                onClick={clearSelection}
                className="w-7 h-7 flex items-center justify-center rounded-full bg-white/20 text-white text-sm"
                aria-label="Clear selection"
              >
                &times;
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
