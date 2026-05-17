import { create } from 'zustand';
import type { Plan } from '@/lib/db/destinations';

// NOTE: plain create() — no storage middleware. Comparison selections are
// intentionally in-memory and reset on reload, so no version/migrate is needed.
interface ComparisonState {
  selectedPlans: Plan[];
  isSheetOpen: boolean;
  togglePlan: (plan: Plan) => void;
  clearSelection: () => void;
  openSheet: () => void;
  closeSheet: () => void;
}

export const useComparisonStore = create<ComparisonState>((set) => ({
  selectedPlans: [],
  isSheetOpen: false,
  togglePlan: (plan) =>
    set((state) => {
      if (state.selectedPlans.some((p) => p.id === plan.id)) {
        return { selectedPlans: state.selectedPlans.filter((p) => p.id !== plan.id) };
      }
      if (state.selectedPlans.length >= 3) return state;
      return { selectedPlans: [...state.selectedPlans, plan] };
    }),
  clearSelection: () => set({ selectedPlans: [], isSheetOpen: false }),
  openSheet: () => set({ isSheetOpen: true }),
  closeSheet: () => set({ isSheetOpen: false }),
}));
