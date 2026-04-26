'use client';

import { useTranslations } from 'next-intl';
import { DestinationGrid } from '@/components/browse/destination-grid';

export default function BrowsePage() {
  const t = useTranslations();

  return (
    <div className="px-4 pt-6 pb-20 max-w-[1200px] mx-auto">
      <h1 className="text-3xl md:text-4xl font-bold tracking-tighter text-primary dark:text-gray-100 mb-6">{t('browse.title')}</h1>
      <DestinationGrid />
    </div>
  );
}
