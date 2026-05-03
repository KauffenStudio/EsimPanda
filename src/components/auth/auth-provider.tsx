'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { User } from '@supabase/supabase-js';
import { useAuthStore } from '@/stores/auth';
import { attachDeepLinkRouter } from '@/lib/native/deep-links';
import { registerNativePush } from '@/lib/native/push';

interface AuthProviderProps {
  initialUser: User | null;
  children: React.ReactNode;
}

export function AuthProvider({ initialUser, children }: AuthProviderProps) {
  const hydrate = useAuthStore((s) => s.hydrate);
  const router = useRouter();

  useEffect(() => {
    hydrate(initialUser);
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
