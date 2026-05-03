'use client';

import { useTranslations, useLocale } from 'next-intl';
import { signOut } from '@/lib/auth/actions';
import { createClient } from '@/lib/supabase/client';
import { useAuthStore } from '@/stores/auth';
import { CurrencySwitcher } from '@/components/layout/currency-switcher';
import { LanguageSwitcher } from '@/components/layout/language-switcher';
import { ThemeToggle } from '@/components/layout/theme-toggle';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

function clearSupabaseCookiesClientSide(): void {
  if (typeof document === 'undefined') return;
  const host = window.location.hostname;
  const parts = host.split('.');
  const candidates = new Set<string>([host]);
  // Add parent domain (e.g. ".esimpanda.co" if cookies were set with leading dot)
  if (parts.length >= 2) {
    candidates.add(`.${parts.slice(-2).join('.')}`);
  }
  for (const cookieStr of document.cookie.split(';')) {
    const name = cookieStr.split('=')[0]?.trim();
    if (!name || !name.startsWith('sb-')) continue;
    for (const domain of candidates) {
      document.cookie = `${name}=; max-age=0; path=/; domain=${domain}`;
    }
    document.cookie = `${name}=; max-age=0; path=/`;
  }
}

export function ProfileSettings() {
  const t = useTranslations();
  const locale = useLocale();

  async function handleLogout() {
    // 1. Browser supabase: clear in-memory session + storage.
    try {
      await createClient().auth.signOut();
    } catch {
      // ignore
    }

    // 2. Brute-force cookie cleanup at every plausible domain scope.
    clearSupabaseCookiesClientSide();

    // 3. Wipe the Zustand auth store so any still-mounted component
    //    immediately sees user = null instead of the cached object.
    useAuthStore.getState().clear();

    // 4. Server action: clears server-side cookies + revalidatePath.
    //    The redirect throws NEXT_REDIRECT which we catch silently —
    //    we rely on the hard navigation below to land on /login fresh.
    try {
      await signOut();
    } catch {
      // expected: redirect propagates as a throw
    }

    // 5. Hard reload, regardless of any prior step's outcome. Forces the
    //    [locale] layout to run server-side with no auth cookies, so
    //    AuthProvider hydrates with initialUser = null.
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
