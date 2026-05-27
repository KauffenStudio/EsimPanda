'use client';

import { useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { detectDeviceFamily } from './device-detection';

interface AddToWalletButtonProps {
  orderId: string | null | undefined;
}

export function AddToWalletButton({ orderId }: AddToWalletButtonProps) {
  const t = useTranslations('delivery.wallet');
  const [available, setAvailable] = useState<boolean | null>(null);

  const isApplePlatform = useMemo(() => {
    if (typeof navigator === 'undefined') return false;
    const ua = navigator.userAgent;
    return detectDeviceFamily(ua) === 'ios' || /Macintosh/.test(ua);
  }, []);

  useEffect(() => {
    if (!isApplePlatform || !orderId) {
      setAvailable(false);
      return;
    }
    let cancelled = false;
    fetch('/api/wallet/availability')
      .then((r) => (r.ok ? r.json() : { available: false }))
      .then((j) => {
        if (!cancelled) setAvailable(Boolean(j.available));
      })
      .catch(() => {
        if (!cancelled) setAvailable(false);
      });
    return () => {
      cancelled = true;
    };
  }, [isApplePlatform, orderId]);

  if (!orderId || !isApplePlatform || !available) return null;

  return (
    <a
      href={`/api/wallet/${orderId}/pass`}
      className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-black px-4 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90 dark:bg-white dark:text-black"
      aria-label={t('addToWallet')}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
      </svg>
      <span>{t('addToWallet')}</span>
    </a>
  );
}
