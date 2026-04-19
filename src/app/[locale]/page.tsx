'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { BambuEmpty } from '@/components/bambu/bambu-empty';
import Link from 'next/link';

export default function LandingPage() {
  const t = useTranslations();

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-3.5rem)] px-4 text-center">
      <BambuEmpty size={160} className="mb-8" />

      <h1 className="text-4xl md:text-5xl font-bold text-primary dark:text-gray-100 mb-6">
        {t('landing.headline')}
      </h1>

      <div className="flex flex-col sm:flex-row gap-4">
        <Link href="/browse">
          <Button variant="primary" size="lg">
            {t('landing.cta_primary')}
          </Button>
        </Link>
        <Link href="/browse">
          <Button variant="secondary" size="lg">
            {t('landing.cta_secondary')}
          </Button>
        </Link>
      </div>
    </div>
  );
}
