import { create } from 'zustand';
import type { ReferralStats, ReferralReward } from '@/lib/referral/types';

interface ReferralState {
  code: string | null;
  stats: ReferralStats | null;
  rewards: ReferralReward[];
  loading: boolean;
  fetchReferralData: () => Promise<void>;
  copyLink: () => Promise<boolean>;
}

export const useReferralStore = create<ReferralState>((set, get) => ({
  code: null,
  stats: null,
  rewards: [],
  loading: false,

  fetchReferralData: async () => {
    set({ loading: true });

    try {
      // Mock mode: use hardcoded mock values
      if (process.env.NEXT_PUBLIC_STRIPE_MOCK === 'true') {
        set({
          code: 'ABC123',
          stats: {
            friends_invited: 3,
            free_plans_earned: 2,
            free_plans_remaining: 3,
            monthly_cap: 5,
            cap_resets_at: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).toISOString(),
          },
          rewards: [],
          loading: false,
        });
        return;
      }

      const res = await fetch('/api/referral/code');
      if (!res.ok) throw new Error('Failed to fetch referral data');

      const data = await res.json();
      set({
        code: data.code?.code || null,
        stats: data.stats || null,
        rewards: data.rewards || [],
        loading: false,
      });
    } catch (error) {
      console.error('Failed to fetch referral data:', error);
      set({ loading: false });
    }
  },

  copyLink: async () => {
    const { code } = get();
    if (!code) return false;

    try {
      const url = `${window.location.origin}/r/${code}`;
      await navigator.clipboard.writeText(url);
      return true;
    } catch {
      return false;
    }
  },
}));
