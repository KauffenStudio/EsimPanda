'use client';

import { useSyncExternalStore } from 'react';
import { formatDealTimeLeft, getDealTimeLeft } from '@/lib/promo/deal-cycle';

// One shared 1s ticker for every countdown on the page. A destination page
// renders a countdown per plan card; without sharing, that is one interval each.
let label = '';
const listeners = new Set<() => void>();
let timer: ReturnType<typeof setInterval> | null = null;

function tick() {
  label = formatDealTimeLeft(getDealTimeLeft(Date.now()));
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (!timer) {
    tick();
    timer = setInterval(tick, 1000);
  }
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0 && timer) {
      clearInterval(timer);
      timer = null;
    }
  };
}

function getSnapshot() {
  return label || formatDealTimeLeft(getDealTimeLeft(Date.now()));
}

/**
 * Time left on the current deal cycle, e.g. "2d 14:05:09". Returns '' during
 * SSR and the hydration pass — the server cannot know the visitor's clock, and
 * a mismatched string would throw a hydration error.
 */
export function useDealCountdown(): string {
  return useSyncExternalStore(subscribe, getSnapshot, () => '');
}
