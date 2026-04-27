'use client';

import { Lock, Shield, Users } from 'lucide-react';
import { useTranslations } from 'next-intl';

export function TrustSignals() {
  const t = useTranslations('checkout.trust');

  return (
    <div className="flex items-center justify-center gap-4 py-2 flex-wrap">
      <span className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
        <Lock size={14} className="shrink-0" />
        {t('secure')}
      </span>
      <span className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
        <Shield size={14} className="shrink-0" />
        {t('guarantee')}
      </span>
      <span className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
        <Users size={14} className="shrink-0" />
        {t('travelers')}
      </span>
    </div>
  );
}
