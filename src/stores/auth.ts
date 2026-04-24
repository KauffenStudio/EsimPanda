import { create } from 'zustand';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  loading: boolean;
  initialized: boolean;
  initialize: () => Promise<void>;
  setUser: (user: User | null) => void;
  clear: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  loading: true,
  initialized: false,

  initialize: async () => {
    if (get().initialized) return;

    // Mock mode: skip Supabase calls
    if (process.env.NEXT_PUBLIC_STRIPE_MOCK === 'true') {
      set({ user: null, loading: false, initialized: true });
      return;
    }

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    set({ user, loading: false, initialized: true });

    // Listen for auth state changes
    supabase.auth.onAuthStateChange((_event, session) => {
      set({ user: session?.user ?? null });
    });
  },

  setUser: (user) => set({ user }),
  clear: () => set({ user: null, loading: false }),
}));
