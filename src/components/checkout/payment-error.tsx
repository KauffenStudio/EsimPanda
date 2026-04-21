'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { BambuError } from '@/components/bambu/bambu-error';
import { Button } from '@/components/ui/button';

interface PaymentErrorProps {
  errorType: 'declined' | 'generic' | 'network';
  onRetry: () => void;
}

export function PaymentError({ errorType, onRetry }: PaymentErrorProps) {
  const t = useTranslations('checkout.error');

  // Haptic warning on mount
  useEffect(() => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(100);
    }
  }, []);

  const errorMessage = t(errorType);

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <BambuError size={120} />

      <h2 className="text-2xl font-bold text-destructive mt-6">
        {t('heading')}
      </h2>

      <p className="text-base text-gray-600 mt-3 max-w-sm">
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

      <a
        href="https://wa.me/351000000000"
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm text-gray-600 underline mt-4 hover:text-accent"
      >
        {t('contact')}
      </a>
    </div>
  );
}
