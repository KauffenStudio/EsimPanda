import { create } from 'zustand';

export type DurationFilter = 'all' | '14' | '20' | '30' | '90';

interface BrowseState {
  searchQuery: string;
  expandedDestination: string | null;
  durationFilter: DurationFilter;
  setSearch: (query: string) => void;
  toggleDestination: (slug: string) => void;
  setDurationFilter: (filter: DurationFilter) => void;
  clearFilters: () => void;
}

export const useBrowseStore = create<BrowseState>((set) => ({
  searchQuery: '',
  expandedDestination: null,
  durationFilter: 'all',
  setSearch: (query) => set({ searchQuery: query }),
  toggleDestination: (slug) =>
    set((state) => ({
      expandedDestination: state.expandedDestination === slug ? null : slug,
    })),
  setDurationFilter: (filter) => set({ durationFilter: filter }),
  clearFilters: () => set({ searchQuery: '', durationFilter: 'all' }),
}));
