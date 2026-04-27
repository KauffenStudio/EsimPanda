'use client';

import { useTranslations, useLocale } from 'next-intl';
import { BambuVideo } from '@/components/bambu/bambu-video';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { LogIn, UserPlus } from 'lucide-react';

export default function ProfilePage() {
  const t = useTranslations();
  const locale = useLocale();

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

        <div className="flex flex-col sm:flex-row gap-3 mt-8">
          <Link href={`/${locale}/login`}>
            <Button variant="primary" size="lg">
              <LogIn size={18} className="mr-2" />
              {t('auth.login.submit')}
            </Button>
          </Link>
          <Link href={`/${locale}/signup`}>
            <Button variant="secondary" size="lg">
              <UserPlus size={18} className="mr-2" />
              {t('auth.signup.submit')}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
