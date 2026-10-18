'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
import { X } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useQuickCheckoutStore } from '@/stores/quick-checkout';
import { useComparisonStore } from '@/stores/comparison';
import { CONSENT_DECIDED_EVENT } from '@/components/analytics/consent-banner';
import { readCountryCookie } from '@/lib/geo/use-vat-rate';
import { requiresConsent } from '@/lib/geo/country';

const WHATSAPP_NUMBER = '351928380478';
const DISMISS_KEY = 'whatsapp_bubble_dismissed';
const BUBBLE_DELAY_MS = 2500;
const CONSENT_KEY = 'esim-panda-consent';

function consentPending(): boolean {
  if (!requiresConsent(readCountryCookie())) return false;
  try {
    return localStorage.getItem(CONSENT_KEY) === null;
  } catch {
    return true;
  }
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="currentColor" aria-hidden="true" focusable="false">
      <path d="M16.04 3C8.86 3 3.03 8.82 3.03 15.99c0 2.29.6 4.53 1.74 6.5L3 29l6.68-1.75a12.97 12.97 0 0 0 6.36 1.62h.01c7.17 0 13-5.82 13-12.99C29.05 8.82 23.21 3 16.04 3Zm0 23.68h-.01a10.8 10.8 0 0 1-5.5-1.5l-.4-.24-3.96 1.04 1.06-3.86-.26-.4a10.76 10.76 0 0 1-1.65-5.73c0-5.96 4.85-10.8 10.82-10.8 2.89 0 5.6 1.13 7.64 3.17a10.73 10.73 0 0 1 3.16 7.64c0 5.96-4.85 10.8-10.9 10.8Zm5.93-8.09c-.33-.16-1.93-.95-2.23-1.06-.3-.11-.52-.16-.73.16-.22.33-.84 1.06-1.03 1.27-.19.22-.38.24-.71.08-.33-.16-1.38-.51-2.62-1.62-.97-.86-1.62-1.93-1.81-2.25-.19-.33-.02-.5.14-.66.15-.15.33-.38.49-.57.16-.19.22-.33.33-.54.11-.22.05-.41-.03-.57-.08-.16-.73-1.76-1-2.41-.26-.63-.53-.55-.73-.56h-.62c-.22 0-.57.08-.87.41-.3.33-1.14 1.11-1.14 2.71s1.17 3.14 1.33 3.36c.16.22 2.3 3.51 5.57 4.92.78.34 1.39.54 1.86.69.78.25 1.5.21 2.06.13.63-.09 1.93-.79 2.2-1.55.27-.76.27-1.41.19-1.55-.08-.14-.3-.22-.62-.38Z" />
    </svg>
  );
}

export function WhatsAppWidget() {
  const t = useTranslations('whatsapp');
  const pathname = usePathname() ?? '';
  const quickCheckoutOpen = useQuickCheckoutStore((s) => s.selectedPlan !== null);
  const comparisonOpen = useComparisonStore((s) => s.selectedPlans.length >= 2);
  const [bubbleVisible, setBubbleVisible] = useState(false);
  // Assume the consent banner is up until checked: it sits in the same corner
  // on a phone and covers the button anyway, and two prompts at once read as spam.
  const [waitingForConsent, setWaitingForConsent] = useState(true);
  const reduceMotion = useReducedMotion();

  // Checkout owns the bottom of the viewport (pay bar), and nobody should be
  // pulled into a chat mid-payment. Admin is internal. The quick-checkout and
  // comparison bars take the same corner, so the button steps aside for them.
  const hidden =
    waitingForConsent ||
    pathname.includes('/checkout') ||
    pathname.includes('/admin') ||
    quickCheckoutOpen ||
    comparisonOpen;

  useEffect(() => {
    if (!consentPending()) {
      setWaitingForConsent(false);
      return;
    }
    const onDecided = () => setWaitingForConsent(false);
    window.addEventListener(CONSENT_DECIDED_EVENT, onDecided);
    return () => window.removeEventListener(CONSENT_DECIDED_EVENT, onDecided);
  }, []);

  useEffect(() => {
    if (hidden) return;
    try {
      if (sessionStorage.getItem(DISMISS_KEY)) return;
    } catch {
      // storage blocked: still show the bubble
    }
    const timer = setTimeout(() => setBubbleVisible(true), BUBBLE_DELAY_MS);
    return () => clearTimeout(timer);
  }, [hidden]);

  if (hidden) return null;

  const href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(t('prefill'))}`;

  const dismiss = () => {
    setBubbleVisible(false);
    try {
      sessionStorage.setItem(DISMISS_KEY, '1');
    } catch {
      // ignore
    }
  };

  return (
    <div className="fixed right-3 bottom-[calc(84px+env(safe-area-inset-bottom))] md:right-6 md:bottom-6 z-50 flex items-center gap-3 print:hidden">
      <AnimatePresence>
        {bubbleVisible && (
          <motion.div
            className="relative"
            initial={reduceMotion ? false : { opacity: 0, x: 8, scale: 0.96 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={reduceMotion ? undefined : { opacity: 0, x: 8 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            <button
              type="button"
              onClick={dismiss}
              aria-label={t('close')}
              className="absolute -top-2 -left-2 z-10 flex h-6 w-6 items-center justify-center rounded-full border border-border dark:border-border-dark bg-white dark:bg-surface-dark text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white shadow-sm"
            >
              <X className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              tabIndex={-1}
              aria-hidden="true"
              className="block whitespace-nowrap rounded-2xl rounded-br-md border border-border dark:border-border-dark bg-white/95 dark:bg-surface-dark/95 backdrop-blur-xl px-4 py-2.5 shadow-[0_6px_28px_rgba(0,0,0,0.12)]"
            >
              <span className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white">
                <span className="h-2 w-2 flex-none rounded-full bg-[#25d366] ring-[3px] ring-[#25d366]/20" />
                {t('bubbleTitle')}
              </span>
              <span className="mt-0.5 block text-xs text-gray-500 dark:text-gray-400">{t('bubbleText')}</span>
            </a>
          </motion.div>
        )}
      </AnimatePresence>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={t('ariaLabel')}
        title="WhatsApp"
        className="flex h-14 w-14 flex-none items-center justify-center rounded-full bg-[#25d366] text-white shadow-[0_6px_20px_rgba(0,0,0,0.18)] transition hover:-translate-y-0.5 hover:bg-[#1ebe5b] focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-[3px] focus-visible:outline-accent"
      >
        <WhatsAppIcon className="h-7 w-7" />
      </a>
    </div>
  );
}
