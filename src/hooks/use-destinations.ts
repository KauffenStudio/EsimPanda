import { useMemo } from 'react';
import { mockDestinations, type MockDestination } from '@/lib/mock-data/destinations';
import { useBrowseStore } from '@/stores/browse';

interface UseDestinationsResult {
  destinations: MockDestination[];
  isLoading: boolean;
  regionalPlan: MockDestination | null;
}

export function useDestinations(): UseDestinationsResult {
  const searchQuery = useBrowseStore((state) => state.searchQuery);

  const { destinations, regionalPlan } = useMemo(() => {
    const query = searchQuery.toLowerCase();

    const regional = mockDestinations.find((d) => d.region === 'europe-wide') || null;

    const filtered = mockDestinations
      .filter((d) => d.region !== 'europe-wide')
      .filter((d) => d.name.toLowerCase().includes(query))
      .sort((a, b) => a.popularity_rank - b.popularity_rank);

    return { destinations: filtered, regionalPlan: regional };
  }, [searchQuery]);

  return { destinations, isLoading: false, regionalPlan };
}
