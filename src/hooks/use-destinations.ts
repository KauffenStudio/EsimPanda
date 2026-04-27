import { useMemo } from 'react';
import { mockDestinations, type MockDestination } from '@/lib/mock-data/destinations';
import { useBrowseStore } from '@/stores/browse';

const REGIONAL_TYPES = ['europe-wide', 'asia-wide', 'global'];

interface UseDestinationsResult {
  destinations: MockDestination[];
  isLoading: boolean;
  regionalPlans: MockDestination[];
}

export function useDestinations(): UseDestinationsResult {
  const searchQuery = useBrowseStore((state) => state.searchQuery);

  const { destinations, regionalPlans } = useMemo(() => {
    const query = searchQuery.toLowerCase();

    const regional = mockDestinations.filter((d) => REGIONAL_TYPES.includes(d.region));

    const filtered = mockDestinations
      .filter((d) => !REGIONAL_TYPES.includes(d.region))
      .filter((d) => d.name.toLowerCase().includes(query))
      .sort((a, b) => a.popularity_rank - b.popularity_rank);

    return { destinations: filtered, regionalPlans: regional };
  }, [searchQuery]);

  return { destinations, isLoading: false, regionalPlans };
}
