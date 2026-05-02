'use client';

import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';

export function CallbackErrorBanner() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');
  const t = useTranslations('auth.error');

  if (!error) return null;

  return (
    <p className="text-sm text-[#E53935] text-center mb-4" role="alert">
      {t('oauthFailed')}
    </p>
  );
}
