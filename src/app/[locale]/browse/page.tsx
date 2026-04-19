'use client';

import { useTranslations } from 'next-intl';
import { BambuEmpty } from '@/components/bambu/bambu-empty';

export default function BrowsePage() {
  const t = useTranslations();

  return (
    <div className="flex flex-col items-center px-4 py-8">
      <h1 className="text-2xl font-bold text-primary dark:text-gray-100 mb-8">
        {t('browse.title')}
      </h1>

      <div className="flex flex-col items-center justify-center py-12">
        <BambuEmpty size={120} className="mb-4" />
        <p className="text-gray-600 dark:text-gray-400 text-center max-w-sm">
          {t('browse.empty')}
        </p>
      </div>
    </div>
  );
}
