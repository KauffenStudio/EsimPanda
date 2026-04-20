export interface TaggedPlan {
  id: string;
  data_gb: number;
  duration_days: number;
  retail_price_cents: number;
  isBestValue: boolean;
  isMostPopular: boolean;
}

export function tagPlans<
  T extends {
    id: string;
    data_gb: number;
    duration_days: number;
    retail_price_cents: number;
  },
>(plans: T[]): (T & { isBestValue: boolean; isMostPopular: boolean })[] {
  if (plans.length === 0) return [];

  // Find best value: lowest price per GB
  let bestValueId = '';
  let lowestPricePerGb = Infinity;
  for (const plan of plans) {
    const pricePerGb = plan.retail_price_cents / plan.data_gb;
    if (pricePerGb < lowestPricePerGb) {
      lowestPricePerGb = pricePerGb;
      bestValueId = plan.id;
    }
  }

  // Find most popular: most common duration_days
  // Only if there are 2+ plans (single plan has no "most common")
  let mostPopularId = '';
  if (plans.length > 1) {
    const durationCounts = new Map<number, number>();
    for (const plan of plans) {
      durationCounts.set(
        plan.duration_days,
        (durationCounts.get(plan.duration_days) || 0) + 1
      );
    }

    let maxCount = 0;
    let mostCommonDuration = 0;
    for (const [duration, count] of durationCounts) {
      if (count > maxCount) {
        maxCount = count;
        mostCommonDuration = duration;
      }
    }

    // Only tag if the most common duration actually appears more than once
    // (otherwise all durations tie at count 1 and there's no "popular" one)
    if (maxCount > 1) {
      // First plan with that duration gets the badge
      const candidate = plans.find(
        (p) => p.duration_days === mostCommonDuration
      );
      if (candidate) {
        mostPopularId = candidate.id;
      }
    }

    // No double-badge: if mostPopular would be same as bestValue, assign to next plan with that duration
    if (mostPopularId === bestValueId) {
      const alternate = plans.find(
        (p) =>
          p.duration_days === mostCommonDuration && p.id !== bestValueId
      );
      mostPopularId = alternate ? alternate.id : '';
    }
  }

  return plans.map((plan) => ({
    ...plan,
    isBestValue: plan.id === bestValueId,
    isMostPopular: plan.id === mostPopularId,
  }));
}
