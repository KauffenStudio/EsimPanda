import { create } from 'zustand';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  loading: boolean;
  initialized: boolean;
  hydrate: (user: User | null) => void;
  initialize: () => Promise<void>;
  setUser: (user: User | null) => void;
  clear: () => void;
}

let listenerAttached = false;

function attachListener(set: (partial: Partial<AuthState>) => void) {
  if (listenerAttached) return;
  if (process.env.NEXT_PUBLIC_STRIPE_MOCK === 'true') return;
  listenerAttached = true;
  const supabase = createClient();
  supabase.auth.onAuthStateChange((_event, session) => {
    set({ user: session?.user ?? null });
  });
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  loading: true,
  initialized: false,

  // Server-resolved user passed in from the root layout. Sets the store
  // immediately, no network round-trip from the browser. Used as the
  // primary path now that auth cookies are httpOnly.
  hydrate: (user) => {
    set({ user, loading: false, initialized: true });
    attachListener(set);
  },

  // Legacy path: ask the browser supabase client who the user is.
  // Fails silently when cookies are httpOnly (they currently are) and
  // returns null. Kept for callers that still rely on it; new code
  // should prefer hydrate() via the server-rendered AuthProvider prop.
  initialize: async () => {
    if (get().initialized) return;
    if (process.env.NEXT_PUBLIC_STRIPE_MOCK === 'true') {
      set({ user: null, loading: false, initialized: true });
      return;
    }
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    set({ user, loading: false, initialized: true });
    attachListener(set);
  },

  setUser: (user) => set({ user }),
  clear: () => set({ user: null, loading: false }),
}));
