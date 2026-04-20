'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'motion/react';
import { useComparisonStore } from '@/stores/comparison';
import { mockPlans } from '@/lib/mock-data/plans';

export function ComparisonSheet() {
  const t = useTranslations();
  const isSheetOpen = useComparisonStore((state) => state.isSheetOpen);
  const selectedPlanIds = useComparisonStore((state) => state.selectedPlanIds);
  const closeSheet = useComparisonStore((state) => state.closeSheet);

  // Lock body scroll when open
  useEffect(() => {
    if (isSheetOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [isSheetOpen]);

  const selectedPlans = selectedPlanIds
    .map((id) => mockPlans.find((p) => p.id === id))
    .filter(Boolean);

  return (
    <AnimatePresence>
      {isSheetOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50"
            onClick={closeSheet}
          />

          {/* Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', bounce: 0.1, duration: 0.5 }}
            drag="y"
            dragConstraints={{ top: 0 }}
            onDragEnd={(_, info) => {
              if (info.offset.y > 100) {
                closeSheet();
              }
            }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-surface-dark rounded-t-2xl max-h-[70vh] overflow-y-auto"
          >
            {/* Pull indicator */}
            <div className="pt-3 pb-2">
              <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-4 pb-3">
              <h3 className="text-lg font-bold">
                {t('browse.compare')} ({selectedPlans.length})
              </h3>
              <button
                onClick={closeSheet}
                className="w-8 h-8 flex items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
                aria-label="Close"
              >
                &times;
              </button>
            </div>

            {/* Comparison table */}
            <div className="px-4 pb-6">
              {/* Plan names header */}
              <div
                className="grid gap-3 mb-4"
                style={{
                  gridTemplateColumns: `repeat(${selectedPlans.length}, 1fr)`,
                }}
              >
                {selectedPlans.map((plan) => (
                  <div
                    key={plan!.id}
                    className="text-center font-bold text-sm"
                  >
                    {plan!.name}
                  </div>
                ))}
              </div>

              {/* Attributes */}
              {[
                {
                  label: 'Data',
                  getValue: (p: (typeof selectedPlans)[0]) =>
                    `${p!.data_gb} GB`,
                },
                {
                  label: 'Duration',
                  getValue: (p: (typeof selectedPlans)[0]) =>
                    p!.duration_days === 1
                      ? '24h'
                      : `${p!.duration_days} days`,
                },
                {
                  label: 'Price',
                  getValue: (p: (typeof selectedPlans)[0]) =>
                    `\u20AC${(p!.retail_price_cents / 100).toFixed(2)}`,
                },
                {
                  label: 'Price/GB',
                  getValue: (p: (typeof selectedPlans)[0]) =>
                    `\u20AC${(p!.retail_price_cents / 100 / p!.data_gb).toFixed(2)}/GB`,
                },
              ].map((attr) => (
                <div
                  key={attr.label}
                  className="grid gap-3 py-2 border-t border-gray-100 dark:border-gray-800"
                  style={{
                    gridTemplateColumns: `repeat(${selectedPlans.length}, 1fr)`,
                  }}
                >
                  {selectedPlans.map((plan) => (
                    <div key={plan!.id} className="text-center text-sm">
                      <div className="text-gray-400 text-xs mb-0.5">
                        {attr.label}
                      </div>
                      <div className="font-medium">
                        {attr.getValue(plan)}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
