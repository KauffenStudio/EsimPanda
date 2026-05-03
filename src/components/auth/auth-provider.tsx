'use client';

import { useEffect } from 'react';
import type { User } from '@supabase/supabase-js';
import { useAuthStore } from '@/stores/auth';

interface AuthProviderProps {
  initialUser: User | null;
  children: React.ReactNode;
}

export function AuthProvider({ initialUser, children }: AuthProviderProps) {
  const hydrate = useAuthStore((s) => s.hydrate);

  useEffect(() => {
    hydrate(initialUser);
  }, [hydrate, initialUser]);

  return <>{children}</>;
}
