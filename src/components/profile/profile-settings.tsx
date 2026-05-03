'use client';

import { useTranslations } from 'next-intl';
import { signOut } from '@/lib/auth/actions';
import { CurrencySwitcher } from '@/components/layout/currency-switcher';
import { LanguageSwitcher } from '@/components/layout/language-switcher';
import { ThemeToggle } from '@/components/layout/theme-toggle';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

export function ProfileSettings() {
  const t = useTranslations();

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
        onClick={async () => {
          await signOut();
        }}
        className="w-full text-[#E53935] dark:text-[#E53935]"
      >
        <LogOut size={18} className="mr-2" />
        {t('auth.menu.logout')}
      </Button>
    </section>
  );
}
