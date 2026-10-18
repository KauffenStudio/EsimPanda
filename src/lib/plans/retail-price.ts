// src/lib/plans/retail-price.ts — retail price from Celitech wholesale. Pure.

/** Target markup on wholesale. 1.6× = 37.5% gross margin before rounding. */
export const RETAIL_MARKUP = 1.6;

/**
 * Ceiling on gross margin, (retail − wholesale) / retail, before VAT. The .99
 * round-up used to push cheap plans to 41–42%; nothing may sell above 40%.
 */
export const MAX_GROSS_MARGIN = 0.4;

/**
 * 1.6× wholesale rounded up to the next .99 — unless that crosses the 40%
 * margin ceiling, in which case the highest price ending in 9 cents that stays
 * at or under 40% (e.g. $7 wholesale → $11.59, not $11.99).
 */
export function retailPriceFromWholesale(wholesaleCents: number): number {
  const rounded = Math.ceil((wholesaleCents * RETAIL_MARKUP) / 100) * 100 - 1;
  const cap = Math.floor(wholesaleCents / (1 - MAX_GROSS_MARGIN));
  if (rounded <= cap) return rounded;
  return Math.floor((cap + 1) / 10) * 10 - 1;
}

/**
 * Plans sold below the standard margin, keyed `ISO:dataGB:days`. Canada 50GB
 * costs $112 wholesale while competitors retail at ~$54–84, so it runs thinner
 * than the 1.6× default.
 */
export const MARGIN_OVERRIDES: Readonly<Record<string, number>> = {
  'CA:50:30': 0.3,
};

/** Highest .99 price at or under `margin` gross margin. */
function priceAtMargin(wholesaleCents: number, margin: number): number {
  const cap = Math.floor(wholesaleCents / (1 - margin));
  return Math.floor((cap + 1) / 100) * 100 - 1;
}

/** Retail for a specific plan: its override when one exists, else the default rule. */
export function retailPriceForPlan(plan: {
  iso: string;
  dataGb: number;
  durationDays: number;
  wholesaleCents: number;
}): number {
  const override = MARGIN_OVERRIDES[`${plan.iso}:${plan.dataGb}:${plan.durationDays}`];
  return override === undefined
    ? retailPriceFromWholesale(plan.wholesaleCents)
    : priceAtMargin(plan.wholesaleCents, override);
}
