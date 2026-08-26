'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { X } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { isoToFlag } from '@/lib/i18n/flag';

type ActivityItem =
  | {
      kind: 'purchase';
      destination: string;
      iso: string;
      dataGb: number;
      minutesAgo: number;
      buyerCountry: string | null;
    }
  | { kind: 'viewing_now'; destination: string; iso: string; count: number }
  | { kind: 'viewed_today'; destination: string; iso: string; count: number }
  | { kind: 'bought_this_week'; destination: string; iso: string; count: number };

const VISIBLE_MS = 6000;
const GAP_MS = 9000; // 15s cycle end to end
const FIRST_DELAY_MS = 4000; // let the page settle before the first one
const DISMISS_KEY = 'esim-panda-activity-dismissed';
const CONSENT_KEY = 'esim-panda-consent';

function safeGet(key: string): string | null {
  try {
    return sessionStorage.getItem(key) ?? localStorage.getItem(key);
  } catch {
    return null;
  }
}

function countryName(iso: string, locale: string): string {
  try {
    return new Intl.DisplayNames([locale], { type: 'region' }).of(iso) ?? iso;
  } catch {
    return iso;
  }
}

/**
 * Rotating live-activity toasts.
 *
 * Everything shown is a fact from the database — a real order, or real
 * recorded views (see lib/activity/feed.ts). When the API has nothing that
 * clears its credibility thresholds it returns an empty list and this renders
 * nothing, which is the correct behaviour: an empty corner costs far less than
 * a fabricated purchase a visitor catches repeating.
 */
export function LiveActivity({ destinationId }: { destinationId?: string }) {
  const t = useTranslations('activity');
  const locale = useLocale();
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();

  const [items, setItems] = useState<ActivityItem[]>([]);
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(true); // assume dismissed until checked
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  // Never on checkout. The pay bar is fixed to the bottom of the viewport
  // there, and stacking another fixed element at that edge is precisely the
  // collision that made the Pay button untappable. Distracting someone mid
  // payment would be its own loss even if it fitted.
  const suppressed = (pathname ?? '').includes('/checkout');

  useEffect(() => {
    if (suppressed) return;
    // Hold off while the consent banner is up — they share the same corner on
    // a phone, and stacking two prompts reads as a spammy site.
    if (safeGet(DISMISS_KEY)) return;
    if (safeGet(CONSENT_KEY) === null) return;
    setDismissed(false);
  }, [suppressed]);

  useEffect(() => {
    if (dismissed || suppressed) return;
    let cancelled = false;

    const url = destinationId
      ? `/api/activity/live?destination_id=${encodeURIComponent(destinationId)}`
      : '/api/activity/live';

    fetch(url)
      .then((r) => (r.ok ? r.json() : { items: [] }))
      .then((data) => {
        if (!cancelled) setItems(Array.isArray(data.items) ? data.items : []);
      })
      .catch(() => {
        // A missing feed is not an error worth surfacing — show nothing.
      });

    return () => {
      cancelled = true;
    };
  }, [destinationId, dismissed, suppressed]);

  // Record this visit so the "N people viewing" numbers have something real to
  // count. Pings while the tab is open and visible — a backgrounded tab is not
  // a person looking at the page, and counting it would inflate the number the
  // widget then presents as fact.
  useEffect(() => {
    if (!destinationId || suppressed) return;

    const ping = () => {
      if (document.visibilityState !== 'visible') return;
      fetch('/api/activity/view', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ destination_id: destinationId }),
        keepalive: true,
      }).catch(() => {
        // Best-effort: a dropped ping just means one uncounted minute.
      });
    };

    ping();
    const id = setInterval(ping, 60_000);
    return () => clearInterval(id);
  }, [destinationId, suppressed]);

  const clearTimers = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  }, []);

  // Cycle: wait, show for VISIBLE_MS, hide, advance, repeat.
  useEffect(() => {
    if (dismissed || suppressed || items.length === 0) return;

    const schedule = (delay: number) => {
      timers.current.push(
        setTimeout(() => {
          setVisible(true);
          timers.current.push(
            setTimeout(() => {
              setVisible(false);
              setIndex((i) => (i + 1) % items.length);
              schedule(GAP_MS);
            }, VISIBLE_MS),
          );
        }, delay),
      );
    };

    schedule(FIRST_DELAY_MS);
    return clearTimers;
    // `index` is deliberately not a dependency — it advances inside the loop,
    // and including it would restart the cycle on every rotation.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, dismissed, suppressed, clearTimers]);

  const dismiss = () => {
    clearTimers();
    setVisible(false);
    setDismissed(true);
    try {
      sessionStorage.setItem(DISMISS_KEY, '1');
    } catch {
      // Non-fatal: it just reappears on the next page.
    }
  };

  if (dismissed || suppressed || items.length === 0) return null;

  const item = items[index];
  if (!item) return null;

  let line: string;
  switch (item.kind) {
    case 'purchase':
      line = item.buyerCountry
        ? t('purchaseFrom', {
            country: countryName(item.buyerCountry, locale),
            data: item.dataGb,
            destination: item.destination,
          })
        : t('purchase', { data: item.dataGb, destination: item.destination });
      break;
    case 'viewing_now':
      line = t('viewingNow', { count: item.count, destination: item.destination });
      break;
    case 'viewed_today':
      line = t('viewedToday', { count: item.count, destination: item.destination });
      break;
    case 'bought_this_week':
      line = t('boughtThisWeek', { count: item.count, destination: item.destination });
      break;
  }

  const detail =
    item.kind === 'purchase' ? t('minutesAgo', { minutes: item.minutesAgo }) : t('liveNow');

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          role="status"
          aria-live="polite"
          initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.98 }}
          animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
          exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 8, scale: 0.98 }}
          transition={{ duration: reduceMotion ? 0.15 : 0.28, ease: 'easeOut' }}
          className="fixed left-3 right-3 bottom-[calc(84px+env(safe-area-inset-bottom))] sm:right-auto sm:max-w-[320px] md:bottom-4 md:left-4 z-[55] flex items-center gap-3 rounded-2xl border border-border dark:border-border-dark bg-white/95 dark:bg-surface-dark/95 backdrop-blur-xl shadow-[0_6px_28px_rgba(0,0,0,0.12)] px-3.5 py-3"
        >
          <span aria-hidden="true" className="text-2xl leading-none shrink-0">
            {isoToFlag(item.iso)}
          </span>

          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-medium leading-snug text-gray-900 dark:text-gray-100">
              {line}
            </p>
            <p className="mt-0.5 flex items-center gap-1.5 text-[11px] text-gray-500 dark:text-gray-400">
              {item.kind !== 'purchase' && (
                <span
                  aria-hidden="true"
                  className="inline-block h-1.5 w-1.5 rounded-full bg-success dark:bg-success-dark"
                />
              )}
              {detail}
            </p>
          </div>

          <button
            onClick={dismiss}
            aria-label={t('dismiss')}
            className="shrink-0 -mr-1 p-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
          >
            <X size={15} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
