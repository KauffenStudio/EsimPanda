// src/lib/plans/pricing-display.ts — pure pricing/display helpers. No I/O, no mock arrays.

/** Minimal shape the tag helper needs. Structurally satisfied by the Plan row type. */
interface PlanLike {
  id: string;
  data_gb: number;
  duration_days: number;
  retail_price_cents: number;
}

/**
 * Storefront discount: a flat 15% on every plan above 1GB. It used to scale
 * with the data tier (20–40%); one number is easier to trust and lines up with
 * the countdown that sits beside it.
 */
export const DISPLAY_DISCOUNT_PERCENT = 15;

/**
 * Data tier shown as sold out (business decision): every 2GB plan is greyed out
 * and cannot be bought — the card is inert and checkout refuses it server-side.
 */
export const SOLD_OUT_DATA_GB = 2;

export function isSoldOut(dataGb: number): boolean {
  return dataGb === SOLD_OUT_DATA_GB;
}

/** "Original" price the live price is 15% off. Returns 0 for 1GB (no discount). */
export function getOriginalPrice(retailCents: number, dataGb: number): number {
  if (dataGb <= 1) return 0;
  return Math.round(retailCents / (1 - DISPLAY_DISCOUNT_PERCENT / 100));
}

/** Discount percentage. Returns 0 for 1GB plans. */
export function getDiscountPercent(retailCents: number, dataGb: number): number {
  return getOriginalPrice(retailCents, dataGb) === 0 ? 0 : DISPLAY_DISCOUNT_PERCENT;
}

/**
 * Tags each plan with isBestValue (lowest price-per-GB) and isMostPopular
 * (most common duration_days, only when that duration appears more than once).
 * Never double-badges: if mostPopular collides with bestValue, it reassigns
 * to the next plan with the same duration. Sold-out plans never get a badge —
 * "Best value" on a plan you cannot buy points the buyer at a dead end.
 */
export function tagPlans<T extends PlanLike>(
  plans: T[]
): (T & { isBestValue: boolean; isMostPopular: boolean })[] {
  if (plans.length === 0) return [];
  const buyable = plans.filter((p) => !isSoldOut(p.data_gb));

  // Find best value: lowest price per GB
  let bestValueId = '';
  let lowestPricePerGb = Infinity;
  for (const plan of buyable) {
    const pricePerGb = plan.retail_price_cents / plan.data_gb;
    if (pricePerGb < lowestPricePerGb) {
      lowestPricePerGb = pricePerGb;
      bestValueId = plan.id;
    }
  }

  // Find most popular: most common duration_days
  // Only if there are 2+ plans (single plan has no "most common")
  let mostPopularId = '';
  if (buyable.length > 1) {
    const durationCounts = new Map<number, number>();
    for (const plan of buyable) {
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
      const candidate = buyable.find(
        (p) => p.duration_days === mostCommonDuration
      );
      if (candidate) {
        mostPopularId = candidate.id;
      }
    }

    // No double-badge: if mostPopular would be same as bestValue, assign to next plan with that duration
    if (mostPopularId === bestValueId) {
      const alternate = buyable.find(
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
