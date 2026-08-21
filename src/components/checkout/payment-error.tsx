'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';

interface PaymentErrorProps {
  errorType: 'declined' | 'generic' | 'network';
  onRetry: () => void;
}

export function PaymentError({ errorType, onRetry }: PaymentErrorProps) {
  const t = useTranslations('checkout.error');
  const locale = useLocale();

  // Haptic warning on mount
  useEffect(() => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(100);
    }
  }, []);

  const errorMessage = t(errorType);

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <h2 className="text-2xl font-bold text-destructive mt-6">
        {t('heading')}
      </h2>

      <p className="text-base text-gray-600 dark:text-gray-400 mt-3 max-w-sm">
        {errorMessage}
      </p>

      <Button
        variant="primary"
        size="lg"
        onClick={onRetry}
        className="mt-6 w-full max-w-xs"
      >
        {t('retry')}
      </Button>

      <Link
        href={`/${locale}/help`}
        className="text-sm text-gray-600 dark:text-gray-400 underline mt-4 hover:text-accent"
      >
        {t('contact')}
      </Link>
    </div>
  );
}
