import { create } from 'zustand';
import type { Plan } from '@/lib/db/destinations';

interface QuickCheckoutState {
  selectedPlan: Plan | null;
  selectPlan: (plan: Plan) => void;
  clear: () => void;
}

export const useQuickCheckoutStore = create<QuickCheckoutState>((set) => ({
  selectedPlan: null,
  selectPlan: (plan) => set({ selectedPlan: plan }),
  clear: () => set({ selectedPlan: null }),
}));
