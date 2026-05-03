'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { User } from '@supabase/supabase-js';
import { useAuthStore } from '@/stores/auth';
import { attachDeepLinkRouter } from '@/lib/native/deep-links';
import { registerNativePush } from '@/lib/native/push';
import { hideNativeSplash } from '@/lib/native/splash';

interface AuthProviderProps {
  initialUser: User | null;
  children: React.ReactNode;
}

export function AuthProvider({ initialUser, children }: AuthProviderProps) {
  const hydrate = useAuthStore((s) => s.hydrate);
  const router = useRouter();

  useEffect(() => {
    hydrate(initialUser);
    // Now that we've made the auth state available to the React tree,
    // it's safe to drop the native splash screen and reveal the app.
    hideNativeSplash();
  }, [hydrate, initialUser]);

  // Universal Links → client navigation. No-op when running in a browser tab.
  useEffect(() => {
    attachDeepLinkRouter((path) => router.push(path));
  }, [router]);

  // Native push registration once an authenticated user is present.
  // No-op when running in a browser tab.
  useEffect(() => {
    if (initialUser) {
      registerNativePush();
    }
  }, [initialUser]);

  return <>{children}</>;
}
