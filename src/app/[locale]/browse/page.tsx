'use client';

import { useTranslations } from 'next-intl';
import { DestinationGrid } from '@/components/browse/destination-grid';

export default function BrowsePage() {
  const t = useTranslations();

  return (
    <div className="px-4 pt-4 pb-20">
      <h1 className="text-2xl font-bold mb-4">{t('browse.title')}</h1>
      <DestinationGrid />
    </div>
  );
}
