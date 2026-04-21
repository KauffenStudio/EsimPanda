'use client';

import { useTranslations } from 'next-intl';

export function PaymentDivider() {
  const t = useTranslations('checkout');

  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 border-t border-gray-200" />
      <span className="text-sm text-gray-400 uppercase tracking-[0.05em]">
        {t('divider')}
      </span>
      <div className="flex-1 border-t border-gray-200" />
    </div>
  );
}
