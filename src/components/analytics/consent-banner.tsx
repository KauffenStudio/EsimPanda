'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import Link from 'next/link';
import { updateConsent } from '@/lib/analytics/events';
import { readCountryCookie } from '@/lib/geo/use-vat-rate';
import { requiresConsent } from '@/lib/geo/country';

const STORAGE_KEY = 'esim-panda-consent';

type Choice = 'granted' | 'denied';

function read(): Choice | null {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    return v === 'granted' || v === 'denied' ? v : null;
  } catch {
    // Private mode / storage blocked — behave as "not yet answered".
    return null;
  }
}

function write(choice: Choice): void {
  try {
    localStorage.setItem(STORAGE_KEY, choice);
  } catch {
    // Non-fatal: the banner reappears next visit, consent still applies now.
  }
}

/**
 * Storage-consent banner for EEA/UK visitors.
 *
 * Consent Mode defaults advertising and analytics storage to `denied` for
 * these regions (see google-tag.tsx). Nothing previously granted it, so every
 * conversion from the campaign's core market was modelled rather than
 * observed. This is the missing half of that setup.
 *
 * Deliberately not rendered on /checkout: the pay bar is fixed to the bottom
 * of the viewport there, and a second fixed element at the same edge is
 * exactly the collision that made the Pay button untappable. A consent prompt
 * interrupting a payment would also be its own conversion loss.
 */
export function ConsentBanner() {
  const t = useTranslations('consent');
  const locale = useLocale();
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);

  // The region is read from the cookie the edge middleware writes, not from
  // headers() in the layout: calling headers() in the root layout opts every
  // page in the app out of static rendering, and these pages are already slow
  // enough to be losing paid clicks.
  useEffect(() => {
    if (!requiresConsent(readCountryCookie())) return;

    const stored = read();
    if (stored) {
      // Replay a stored grant on every load — Consent Mode resets to the
      // denied default on each page, so a visitor who accepted last week
      // would otherwise be measured as denied for the rest of time.
      updateConsent(stored === 'granted');
      return;
    }
    setVisible(true);
  }, []);

  const decide = (choice: Choice) => {
    write(choice);
    updateConsent(choice === 'granted');
    setVisible(false);
  };

  if (!visible) return null;
  if ((pathname ?? '').includes('/checkout')) return null;

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label={t('title')}
      className="fixed inset-x-3 bottom-[calc(84px+env(safe-area-inset-bottom))] md:bottom-4 md:left-auto md:right-4 md:max-w-sm z-[60] rounded-2xl border border-border dark:border-border-dark bg-white/95 dark:bg-surface-dark/95 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.16)] p-4"
    >
      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{t('title')}</p>
      <p className="mt-1 text-xs leading-relaxed text-gray-600 dark:text-gray-400">
        {t('body')}{' '}
        <Link href={`/${locale}/privacy`} className="underline hover:text-accent">
          {t('privacy')}
        </Link>
      </p>
      <div className="mt-3 flex gap-2">
        <button
          onClick={() => decide('granted')}
          className="flex-1 min-h-[44px] rounded-full bg-accent px-4 text-sm font-semibold text-white transition-opacity hover:opacity-90"
        >
          {t('accept')}
        </button>
        <button
          onClick={() => decide('denied')}
          className="flex-1 min-h-[44px] rounded-full border border-border dark:border-border-dark px-4 text-sm font-semibold text-gray-700 dark:text-gray-300 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
        >
          {t('decline')}
        </button>
      </div>
    </div>
  );
}
