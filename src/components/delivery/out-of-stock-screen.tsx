'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import { useLocale, useTranslations } from 'next-intl';

export function OutOfStockScreen() {
  const t = useTranslations('delivery.outOfStock');
  const locale = useLocale();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="flex flex-col items-center space-y-4 text-center"
    >
      <div className="space-y-2">
        <h3 className="text-lg font-bold text-primary dark:text-gray-100">
          {t('heading')}
        </h3>
        <p className="text-base text-gray-600 dark:text-gray-400 max-w-md">
          {t('body')}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-500 max-w-md">
          {t('refundNote')}
        </p>
      </div>

      <Link
        href={`/${locale}/help`}
        className="text-base text-accent underline transition-colors duration-150 hover:text-accent-hover"
      >
        {t('contact')}
      </Link>
    </motion.div>
  );
}
