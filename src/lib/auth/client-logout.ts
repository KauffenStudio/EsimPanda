'use client';

import { signOut } from '@/lib/auth/actions';
import { createClient } from '@/lib/supabase/client';
import { useAuthStore } from '@/stores/auth';

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

/**
 * Robust client-side logout that survives Apple/Google "Sign in with"
 * iframes hanging the supabase signOut() under third-party cookie
 * restrictions. Fire-and-forget the slow calls, do the synchronous
 * cleanup, then hard-reload after a short tick so the catch handlers
 * have time to attach.
 */
export function performLogout(locale: string): void {
  // Slow calls — never await, never block the user-visible flow.
  void createClient()
    .auth.signOut()
    .catch(() => {});
  void signOut().catch(() => {});

  // Fast synchronous cleanup.
  clearSupabaseCookiesClientSide();
  useAuthStore.getState().clear();

  // Hard reload so the [locale] layout re-runs server-side without
  // auth cookies. Tiny delay lets the void-promises attach their
  // catch handlers before we tear the page down.
  setTimeout(() => {
    window.location.href = `/${locale}/login`;
  }, 50);
}
