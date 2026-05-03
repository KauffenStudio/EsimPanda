'use client';

import { useTranslations } from 'next-intl';
import { DestinationGrid } from '@/components/browse/destination-grid';
import { CurrencySwitcher } from '@/components/layout/currency-switcher';

export default function BrowsePage() {
  const t = useTranslations();

  return (
    <div className="px-4 pt-6 pb-20 max-w-[1200px] mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tighter text-primary dark:text-gray-100">{t('browse.title')}</h1>
        <div className="flex items-center gap-1 md:hidden">
          <CurrencySwitcher />
        </div>
      </div>
      <DestinationGrid />
    </div>
  );
}
