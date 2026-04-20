import { create } from 'zustand';

interface ComparisonState {
  selectedPlanIds: string[];
  isSheetOpen: boolean;
  togglePlan: (id: string) => void;
  clearSelection: () => void;
  openSheet: () => void;
  closeSheet: () => void;
}

export const useComparisonStore = create<ComparisonState>((set) => ({
  selectedPlanIds: [],
  isSheetOpen: false,
  togglePlan: (id) =>
    set((state) => {
      if (state.selectedPlanIds.includes(id)) {
        return {
          selectedPlanIds: state.selectedPlanIds.filter((p) => p !== id),
        };
      }
      if (state.selectedPlanIds.length >= 3) return state;
      return { selectedPlanIds: [...state.selectedPlanIds, id] };
    }),
  clearSelection: () => set({ selectedPlanIds: [], isSheetOpen: false }),
  openSheet: () => set({ isSheetOpen: true }),
  closeSheet: () => set({ isSheetOpen: false }),
}));
