'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'motion/react';
import { AlertTriangle } from 'lucide-react';
import { useDeviceCompatStore } from '@/hooks/use-device-compat';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

export function DeviceCheck() {
  const t = useTranslations('checkout.device');
  const { brand, model, isCompatible } = useDeviceCompatStore();

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
            <Link href="/browse" className="text-xs text-accent underline mt-2 inline-block">
              {t('check_other')}
            </Link>
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
          <Badge variant="success">
            {t('compatible', { brand, model })}
          </Badge>
        </motion.div>
      ) : (
        <Link href="/browse" className="text-sm text-accent underline">
          {t('check')}
        </Link>
      )}
    </div>
  );
}
