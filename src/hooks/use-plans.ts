import { useMemo } from 'react';
import { getPlansForDestination } from '@/lib/mock-data/plans';
import type { Plan } from '@/lib/db/destinations';
import { useBrowseStore } from '@/stores/browse';

interface UsePlansResult {
  plans: Plan[];
  isLoading: boolean;
}

export function usePlans(destinationId: string | null): UsePlansResult {
  const durationFilter = useBrowseStore((state) => state.durationFilter);

  const plans = useMemo(() => {
    if (!destinationId) return [];

    let results = getPlansForDestination(destinationId);

    if (durationFilter !== 'all') {
      const days = Number(durationFilter);
      results = results.filter((plan) => plan.duration_days === days);
    }

    return results.sort((a, b) => a.retail_price_cents - b.retail_price_cents);
  }, [destinationId, durationFilter]);

  return { plans, isLoading: false };
}
