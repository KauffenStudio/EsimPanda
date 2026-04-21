'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'motion/react';
import { useDeviceCompatStore } from '@/hooks/use-device-compat';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

export function DeviceCheck() {
  const t = useTranslations('checkout.device');
  const { brand, model, isCompatible } = useDeviceCompatStore();

  const hasChecked = brand && model && isCompatible !== null;

  return (
    <div className="bg-[#F5F5F5] rounded-xl p-3">
      <p className="text-sm text-gray-500 mb-1">{t('label')}</p>

      {hasChecked && isCompatible ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
          <Badge variant="success">
            {t('compatible', { brand, model })}
          </Badge>
        </motion.div>
      ) : hasChecked && !isCompatible ? (
        <p className="text-sm text-warning">{t('incompatible')}</p>
      ) : (
        <Link href="/browse" className="text-sm text-accent underline">
          {t('check')}
        </Link>
      )}
    </div>
  );
}
