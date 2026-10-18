// src/lib/promo/deal-cycle.ts — the storefront deal countdown. Pure, no I/O.

/** The countdown resets every 3 days. */
export const DEAL_CYCLE_MS = 3 * 24 * 60 * 60 * 1000;

/**
 * Cycles are anchored to a fixed instant (midnight UTC), not to the visitor's
 * first visit, so every visitor — and every tab, and every reload — sees the
 * same deadline.
 */
const DEAL_CYCLE_ANCHOR_MS = Date.UTC(2026, 0, 1);

/** End of the cycle `nowMs` falls in. */
export function getDealEndsAt(nowMs: number): number {
  const elapsed = nowMs - DEAL_CYCLE_ANCHOR_MS;
  const cyclesDone = Math.floor(elapsed / DEAL_CYCLE_MS);
  return DEAL_CYCLE_ANCHOR_MS + (cyclesDone + 1) * DEAL_CYCLE_MS;
}

export interface DealTimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export function getDealTimeLeft(nowMs: number): DealTimeLeft {
  const totalSeconds = Math.max(0, Math.floor((getDealEndsAt(nowMs) - nowMs) / 1000));
  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  };
}

const pad = (n: number) => String(n).padStart(2, '0');

/** "2d 14:05:09" — compact and locale-neutral, so one format serves all six locales. */
export function formatDealTimeLeft({ days, hours, minutes, seconds }: DealTimeLeft): string {
  const clock = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  return days > 0 ? `${days}d ${clock}` : clock;
}
