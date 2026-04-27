import { create } from 'zustand';
import type { MockPlan } from '@/lib/mock-data/plans';

interface QuickCheckoutState {
  selectedPlan: MockPlan | null;
  selectPlan: (plan: MockPlan) => void;
  clear: () => void;
}

export const useQuickCheckoutStore = create<QuickCheckoutState>((set) => ({
  selectedPlan: null,
  selectPlan: (plan) => set({ selectedPlan: plan }),
  clear: () => set({ selectedPlan: null }),
}));
