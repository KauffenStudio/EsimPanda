'use client';

import { CurrencySwitcher } from '@/components/layout/currency-switcher';

/** Inline currency bar for pages where the currency selector is contextually relevant (browse, destination, checkout). Only shows on mobile — desktop has it in the header. Language is always in the header at every breakpoint. */
export function PageCurrencyBar() {
  return (
    <div className="flex items-center gap-1 md:hidden">
      <CurrencySwitcher />
    </div>
  );
}
