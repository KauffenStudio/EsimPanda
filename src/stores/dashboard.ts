import { create } from 'zustand';
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
    if (process.env.NEXT_PUBLIC_STRIPE_MOCK === 'true') {
      const { mockDashboardEsims, mockPurchases } = await import(
        '@/lib/mock-data/dashboard'
      );
      set({
        esims: mockDashboardEsims,
        purchases: mockPurchases,
        loading: false,
      });
      return;
    }

    // TODO: Production — fetch from /api/dashboard/esims
    set({ loading: false });
  },

  setEsims: (esims) => set({ esims }),
  setPurchases: (purchases) => set({ purchases }),
  setActiveTab: (active_tab) => set({ active_tab }),

  openTopUp: (esim) => set({ top_up_esim: esim, top_up_status: 'plan-select' }),
  closeTopUp: () => set({ top_up_esim: null, top_up_status: 'idle' }),
  setTopUpStatus: (top_up_status) => set({ top_up_status }),

  refreshUsage: async () => {
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
