'use client';

import { motion } from 'motion/react';
import { useTranslations } from 'next-intl';
import { X, RefreshCw } from 'lucide-react';

interface UpdateBannerProps {
  onReload: () => void;
  onDismiss: () => void;
}

export function UpdateBanner({ onReload, onDismiss }: UpdateBannerProps) {
  const t = useTranslations('pwa');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="fixed bottom-20 md:bottom-4 left-4 right-4 z-40 mx-auto max-w-md"
      role="status"
    >
      <div className="bg-accent-soft dark:bg-[#1A2744] rounded-card p-4 relative flex items-center gap-4">
        <button
          onClick={onDismiss}
          className="absolute top-2 right-2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          aria-label="Dismiss"
        >
          <X size={16} />
        </button>

        <div className="flex-1 text-left">
          <h3 className="text-base font-semibold dark:text-gray-100">
            {t('update_heading')}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {t('update_body')}
          </p>
        </div>

        <button
          onClick={onReload}
          className="bg-accent hover:bg-accent-hover text-white px-4 py-2 rounded-button text-sm font-semibold whitespace-nowrap h-11 min-w-[44px] flex items-center gap-1.5"
        >
          <RefreshCw size={14} />
          {t('update_cta')}
        </button>
      </div>
    </motion.div>
  );
}
