'use client';

import { useTranslations, useLocale } from 'next-intl';
import { signOut } from '@/lib/auth/actions';
import { createClient } from '@/lib/supabase/client';
import { CurrencySwitcher } from '@/components/layout/currency-switcher';
import { LanguageSwitcher } from '@/components/layout/language-switcher';
import { ThemeToggle } from '@/components/layout/theme-toggle';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

export function ProfileSettings() {
  const t = useTranslations();
  const locale = useLocale();

  async function handleLogout() {
    // 1. Clear the session in the browser supabase client. WKWebView and
    //    iOS Safari sometimes keep an in-memory session even after the
    //    server clears cookies, which leaves the AuthProvider's hydrate
    //    listener firing with the old user on the next render.
    try {
      await createClient().auth.signOut();
    } catch {
      // ignore — server-side signOut below will still run
    }

    // 2. Server action: clears cookies + revalidatePath + redirect.
    //    redirect() throws NEXT_REDIRECT which Next.js handles, but if
    //    the redirect ever no-ops in a WebView we still want to navigate.
    try {
      await signOut();
    } catch {
      // expected: NEXT_REDIRECT propagates here on success
    }

    // 3. Belt-and-suspenders: force a hard reload to /login so the
    //    layout re-runs with no user, regardless of any stale React
    //    state. iOS Safari and WKWebView both honour this.
    window.location.href = `/${locale}/login`;
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
        className="w-full text-[#E53935] dark:text-[#E53935]"
      >
        <LogOut size={18} className="mr-2" />
        {t('auth.menu.logout')}
      </Button>
    </section>
  );
}
