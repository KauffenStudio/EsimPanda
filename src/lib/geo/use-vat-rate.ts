'use client';

import { useEffect, useState } from 'react';
import { vatRateFor } from './country';

export const COUNTRY_COOKIE = 'esim-country';

export function readCountryCookie(): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(
    new RegExp(`(?:^|;\\s*)${COUNTRY_COOKIE}=([A-Za-z]{2})(?:;|$)`),
  );
  return match ? match[1].toUpperCase() : null;
}

/**
 * VAT percentage owed by this visitor, resolved from the cookie the edge
 * middleware writes.
 *
 * Starts at 0 so the server-rendered markup and the first client render agree
 * — reading the cookie during render would mismatch and throw a hydration
 * error. Non-EU visitors (most of the traffic) are already at the final number
 * on first paint; EU visitors see it settle in the same tick the persisted
 * currency preference applies, so prices resolve once, together.
 */
export function useVatRate(): number {
  const [rate, setRate] = useState(0);

  useEffect(() => {
    setRate(vatRateFor(readCountryCookie()));
  }, []);

  return rate;
}
