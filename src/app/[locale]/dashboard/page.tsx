'use client';

import { useTranslations } from 'next-intl';
import { BambuEmpty } from '@/components/bambu/bambu-empty';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function DashboardPage() {
  const t = useTranslations();

  return (
    <div className="flex flex-col items-center px-4 py-8">
      <h1 className="text-2xl font-bold text-primary dark:text-gray-100 mb-8">
        {t('dashboard.title')}
      </h1>

      <Card className="max-w-sm w-full p-6">
        <div className="flex flex-col items-center text-center">
          <BambuEmpty size={100} className="mb-4" />
          <h2 className="text-lg font-bold text-primary dark:text-gray-100 mb-2">
            {t('dashboard.empty_title')}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {t('dashboard.empty_body')}
          </p>
          <Link href="/browse">
            <Button variant="primary">{t('dashboard.empty_cta')}</Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
