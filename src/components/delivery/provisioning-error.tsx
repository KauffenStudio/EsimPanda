'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import { useLocale, useTranslations } from 'next-intl';

interface ProvisioningErrorProps {
  retryCount: number;
  error?: string;
}

export function ProvisioningError({ retryCount }: ProvisioningErrorProps) {
  const t = useTranslations('delivery');
  const locale = useLocale();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="flex flex-col items-center space-y-4 text-center"
    >
      {retryCount < 3 ? (
        <motion.p
          key={retryCount}
          initial={{ opacity: 0.5 }}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="text-base text-gray-600 dark:text-gray-400"
        >
          {t('error.retry', { count: retryCount })}
        </motion.p>
      ) : (
        <div className="space-y-2">
          <h3 className="text-lg font-bold text-primary dark:text-gray-100">
            {t('error.heading')}
          </h3>
          <p className="text-base text-gray-600 dark:text-gray-400">
            {t('error.final')}
          </p>
        </div>
      )}

      <Link
        href={`/${locale}/help`}
        className="text-base text-accent underline transition-colors duration-150 hover:text-accent-hover"
      >
        {t('error.contact')}
      </Link>
    </motion.div>
  );
}
