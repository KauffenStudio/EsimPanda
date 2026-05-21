'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle } from 'lucide-react';
import { useDeviceCompatStore } from '@/hooks/use-device-compat';
import { Badge } from '@/components/ui/badge';
import { DeviceChecker } from '@/components/browse/device-compatibility/device-checker';

export function DeviceCheck() {
  const t = useTranslations('checkout.device');
  const { brand, model, isCompatible, reset } = useDeviceCompatStore();
  const [pickerOpen, setPickerOpen] = useState(false);

  const hasChecked = brand && model && isCompatible !== null;

  if (hasChecked && !isCompatible) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border-2 border-warning bg-warning/10 p-4"
      >
        <div className="flex items-start gap-3">
          <AlertTriangle size={20} className="text-warning shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-warning">{t('incompatible')}</p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              {t('incompatible_detail', { brand, model })}
            </p>
            <button
              type="button"
              onClick={() => {
                reset();
                setPickerOpen(true);
              }}
              className="text-xs text-accent underline mt-2 inline-block"
            >
              {t('check_other')}
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="bg-[#F5F5F5] dark:bg-surface-dark rounded-xl p-3">
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{t('label')}</p>

      {hasChecked && isCompatible ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
          <Badge variant="success">{t('compatible', { brand, model })}</Badge>
        </motion.div>
      ) : (
        <>
          <button
            type="button"
            onClick={() => setPickerOpen((open) => !open)}
            className="text-sm text-accent underline"
          >
            {t('check')}
          </button>
          <AnimatePresence>
            {pickerOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <DeviceChecker onDismiss={() => setPickerOpen(false)} />
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  );
}
