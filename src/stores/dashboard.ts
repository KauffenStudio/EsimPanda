import { create } from 'zustand';
import { useAuthStore } from './auth';
import type { DashboardEsim, PurchaseRecord } from '@/lib/dashboard/types';

type ActiveTab = 'esims' | 'history';
type TopUpStatus = 'idle' | 'plan-select' | 'payment' | 'processing' | 'success' | 'error';

interface DashboardState {
  esims: DashboardEsim[];
  purchases: PurchaseRecord[];
  loading: boolean;
  error: string | null;
  active_tab: ActiveTab;
  last_usage_refresh: string | null;
  usage_refreshing: boolean;
  top_up_esim: DashboardEsim | null;
  top_up_status: TopUpStatus;
  initialize: () => Promise<void>;
  setEsims: (esims: DashboardEsim[]) => void;
  setPurchases: (purchases: PurchaseRecord[]) => void;
  setActiveTab: (tab: ActiveTab) => void;
  openTopUp: (esim: DashboardEsim) => void;
  closeTopUp: () => void;
  setTopUpStatus: (status: TopUpStatus) => void;
  refreshUsage: () => Promise<void>;
  reset: () => void;
}

const initialState = {
  esims: [] as DashboardEsim[],
  purchases: [] as PurchaseRecord[],
  loading: true,
  error: null as string | null,
  active_tab: 'esims' as ActiveTab,
  last_usage_refresh: null as string | null,
  usage_refreshing: false,
  top_up_esim: null as DashboardEsim | null,
  top_up_status: 'idle' as TopUpStatus,
};

export const useDashboardStore = create<DashboardState>((set) => ({
  ...initialState,

  initialize: async () => {
    // Auth gate — never load data without authenticated user
    const user = useAuthStore.getState().user;
    if (!user) {
      set({ loading: false, esims: [], purchases: [] });
      return;
    }

    // Always go through the API: it decides mock vs real based on the
    // server-side IS_MOCK flag, which is fresh per request and not
    // baked into the client bundle.
    try {
      const res = await fetch('/api/dashboard/esims', { cache: 'no-store' });
      if (!res.ok) {
        set({ loading: false, error: 'Could not load eSIMs', esims: [], purchases: [] });
        return;
      }
      const data = (await res.json()) as { esims?: DashboardEsim[]; purchases?: PurchaseRecord[] };
      set({
        esims: data.esims ?? [],
        purchases: data.purchases ?? [],
        loading: false,
        error: null,
      });

      // Kick off a live-usage refresh in the background so the cards swap
      // from cached 0/total to real numbers without the user having to click
      // refresh. Fire-and-forget — the refresh action handles its own state.
      void useDashboardStore.getState().refreshUsage();
    } catch {
      set({ loading: false, error: 'Network error', esims: [], purchases: [] });
    }
  },

  setEsims: (esims) => set({ esims }),
  setPurchases: (purchases) => set({ purchases }),
  setActiveTab: (active_tab) => set({ active_tab }),

  openTopUp: (esim) => set({ top_up_esim: esim, top_up_status: 'plan-select' }),
  closeTopUp: () => set({ top_up_esim: null, top_up_status: 'idle' }),
  setTopUpStatus: (top_up_status) => set({ top_up_status }),

  refreshUsage: async () => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    const { esims } = useDashboardStore.getState();
    set({ usage_refreshing: true });

    if (process.env.NEXT_PUBLIC_STRIPE_MOCK === 'true') {
      await new Promise((resolve) => setTimeout(resolve, 500));
      set({
        usage_refreshing: false,
        last_usage_refresh: new Date().toISOString(),
      });
      return;
    }

    // Production: refresh every active eSIM in parallel. Each call hits
    // Celitech via /api/dashboard/usage which translates iccid → live
    // consumption. Inactive (expired) eSIMs are skipped — their numbers
    // don't change and the provider may not even know them anymore.
    const activeEsims = esims.filter((e) => e.status === 'active' && e.iccid);
    if (activeEsims.length === 0) {
      set({ usage_refreshing: false, last_usage_refresh: new Date().toISOString() });
      return;
    }

    try {
      const results = await Promise.all(
        activeEsims.map(async (esim) => {
          try {
            const res = await fetch(
              `/api/dashboard/usage?iccid=${encodeURIComponent(esim.iccid)}`,
              { cache: 'no-store' },
            );
            if (!res.ok) return null;
            const data = (await res.json()) as {
              data_used_gb: number;
              data_total_gb: number;
              data_remaining_gb: number;
              data_remaining_pct: number;
              last_usage_check: string;
            };
            return { iccid: esim.iccid, data };
          } catch {
            return null;
          }
        }),
      );

      // Merge fresh numbers back onto the in-memory eSIM list. Skip nulls so a
      // single failing call doesn't wipe out the whole table.
      const byIccid = new Map(
        results.filter((r): r is NonNullable<typeof r> => r !== null).map((r) => [r.iccid, r.data]),
      );
      const updated = useDashboardStore.getState().esims.map((e) => {
        const fresh = byIccid.get(e.iccid);
        if (!fresh) return e;
        return {
          ...e,
          data_used_gb: fresh.data_used_gb,
          data_total_gb: fresh.data_total_gb,
          data_remaining_gb: fresh.data_remaining_gb,
          data_remaining_pct: fresh.data_remaining_pct,
          last_usage_check: fresh.last_usage_check,
        };
      });
      set({
        esims: updated,
        usage_refreshing: false,
        last_usage_refresh: new Date().toISOString(),
      });
    } catch {
      set({ usage_refreshing: false, last_usage_refresh: new Date().toISOString() });
    }
  },

  reset: () => set({ ...initialState }),
}));
