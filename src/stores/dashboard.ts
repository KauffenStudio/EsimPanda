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

    set({ usage_refreshing: true });

    if (process.env.NEXT_PUBLIC_STRIPE_MOCK === 'true') {
      await new Promise((resolve) => setTimeout(resolve, 500));
      set({
        usage_refreshing: false,
        last_usage_refresh: new Date().toISOString(),
      });
      return;
    }

    // TODO: Production — call /api/dashboard/usage for each active eSIM
    set({ usage_refreshing: false, last_usage_refresh: new Date().toISOString() });
  },

  reset: () => set({ ...initialState }),
}));
