'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { BambuVideo } from '@/components/bambu/bambu-video';
import { ConfettiEffect } from './confetti-effect';
import Link from 'next/link';

interface PaymentSuccessProps {
  orderId: string;
}

export function PaymentSuccess({ orderId }: PaymentSuccessProps) {
  const t = useTranslations('checkout.success');
  const router = useRouter();
  const [countdown, setCountdown] = useState(5);

  // Haptic on mount
  useEffect(() => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([50, 30, 50]);
    }
  }, []);

  // Auto-redirect countdown
  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          router.push('/en/dashboard');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] max-w-[480px] mx-auto px-4 text-center">
      <ConfettiEffect active={true} />

      <BambuVideo variant="success" size={160} />

      <h1 className="text-2xl font-bold mt-6 text-success">
        {t('heading')}
      </h1>

      <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
        {t('order', { id: orderId })}
      </p>

      <p className="text-base mt-4 dark:text-gray-100">
        {t('email')}
      </p>

      <p className="text-sm text-accent mt-6">
        {t('redirect', { seconds: countdown })}
      </p>

      <Link
        href="/en/dashboard"
        className="text-sm text-gray-600 dark:text-gray-400 underline mt-2 hover:text-accent"
      >
        {t('dashboard')}
      </Link>
    </div>
  );
}
