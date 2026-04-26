'use client';

import { useTranslations } from 'next-intl';
import { BambuVideo } from '@/components/bambu/bambu-video';

export default function ProfilePage() {
  const t = useTranslations();

  return (
    <div className="flex flex-col items-center px-4 py-8">
      <h1 className="text-3xl font-bold tracking-tighter text-primary dark:text-gray-100 mb-8">
        {t('profile.title')}
      </h1>

      <div className="flex flex-col items-center justify-center py-12">
        <BambuVideo variant="empty" size={120} className="mb-4" />
        <p className="text-gray-600 dark:text-gray-400 text-center max-w-sm">
          {t('profile.empty')}
        </p>
      </div>
    </div>
  );
}
