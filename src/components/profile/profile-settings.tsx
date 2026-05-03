'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { performLogout } from '@/lib/auth/client-logout';
import { CurrencySwitcher } from '@/components/layout/currency-switcher';
import { LanguageSwitcher } from '@/components/layout/language-switcher';
import { ThemeToggle } from '@/components/layout/theme-toggle';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

export function ProfileSettings() {
  const t = useTranslations();
  const locale = useLocale();
  const [loggingOut, setLoggingOut] = useState(false);

  function handleLogout() {
    if (loggingOut) return;
    setLoggingOut(true);
    performLogout(locale);
  }

  return (
    <section className="w-full max-w-md space-y-4">
      <div className="rounded-xl border border-border dark:border-border-dark bg-white dark:bg-surface-dark p-4">
        <h2 className="text-sm font-semibold text-primary dark:text-gray-100 mb-3">
          {t('profile.preferences')}
        </h2>
        <div className="flex items-center justify-around">
          <CurrencySwitcher />
          <LanguageSwitcher />
          <ThemeToggle />
        </div>
      </div>

      <Button
        variant="secondary"
        size="md"
        onClick={handleLogout}
        disabled={loggingOut}
        className="w-full text-[#E53935] dark:text-[#E53935] disabled:opacity-60"
      >
        <LogOut size={18} className="mr-2" />
        {loggingOut ? '…' : t('auth.menu.logout')}
      </Button>
    </section>
  );
}
