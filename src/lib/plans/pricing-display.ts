// src/lib/plans/pricing-display.ts — pure pricing/display helpers. No I/O, no mock arrays.

/** Minimal shape the tag helper needs. Structurally satisfied by the Plan row type. */
interface PlanLike {
  id: string;
  data_gb: number;
  duration_days: number;
  retail_price_cents: number;
}

/**
 * Discount strategy by data tier:
 * 1GB no discount · 3GB ~20% · 5GB ~30% · 10GB ~35% · 20GB+ ~40%
 */
function getMarkupFactor(dataGb: number): number {
  if (dataGb <= 1) return 0;
  if (dataGb <= 3) return 1.25;
  if (dataGb <= 5) return 1.45;
  if (dataGb <= 10) return 1.55;
  return 1.65;
}

/** Inflated "original" price by data tier, rounded to .99. Returns 0 for 1GB. */
export function getOriginalPrice(retailCents: number, dataGb: number): number {
  const factor = getMarkupFactor(dataGb);
  if (factor === 0) return 0;
  return Math.ceil((retailCents * factor) / 100) * 100 - 1;
}

/** Discount percentage. Returns 0 for 1GB plans. */
export function getDiscountPercent(retailCents: number, dataGb: number): number {
  const original = getOriginalPrice(retailCents, dataGb);
  if (original === 0) return 0;
  return Math.round(((original - retailCents) / original) * 100);
}

/**
 * Tags each plan with isBestValue (lowest price-per-GB) and isMostPopular
 * (most common duration_days, only when that duration appears more than once).
 * Never double-badges: if mostPopular collides with bestValue, it reassigns
 * to the next plan with the same duration.
 */
export function tagPlans<T extends PlanLike>(
  plans: T[]
): (T & { isBestValue: boolean; isMostPopular: boolean })[] {
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
