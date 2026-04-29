'use client';

import { CurrencySwitcher } from '@/components/layout/currency-switcher';
import { LanguageSwitcher } from '@/components/layout/language-switcher';

/** Inline currency + language bar for pages where these options are contextually relevant (browse, destination, checkout). Only shows on mobile — desktop has them in the header. */
export function PageCurrencyBar() {
  return (
    <div className="flex items-center gap-1 md:hidden">
      <CurrencySwitcher />
      <LanguageSwitcher />
    </div>
  );
}
