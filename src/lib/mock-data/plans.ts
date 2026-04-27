export interface MockPlan {
  id: string;
  destination_id: string;
  wholesale_plan_id: string;
  provider: string;
  name: string;
  data_gb: number;
  duration_days: number;
  wholesale_price_cents: number;
  retail_price_cents: number;
  currency: string;
  is_active: boolean;
  synced_at: string;
  created_at: string;
  updated_at: string;
}

const now = '2026-04-01T00:00:00Z';

function makePlan(
  id: string,
  destinationId: string,
  name: string,
  dataGb: number,
  durationDays: number,
  wholesaleCents: number,
  retailCents: number
): MockPlan {
  return {
    id,
    destination_id: destinationId,
    wholesale_plan_id: `cel_${id.slice(0, 8)}`,
    provider: 'celitech',
    name,
    data_gb: dataGb,
    duration_days: durationDays,
    wholesale_price_cents: wholesaleCents,
    retail_price_cents: retailCents,
    currency: 'USD',
    is_active: true,
    synced_at: now,
    created_at: now,
    updated_at: now,
  };
}

// Helper: generate destination ID from sequence number (matches destinations.ts)
const did = (seq: number) => `a1b2c3d4-${String(seq).padStart(4, '0')}-4000-8000-000000000000`;
const pid = (destSeq: number, planNum: number) =>
  `p${String(destSeq).padStart(3, '0')}-${String(planNum).padStart(4, '0')}-4000-8000-000000000000`;

// Price tiers by market cost (wholesale/retail in USD cents)
// Tier 1 (cheap): SE Asia, Africa, South America, Middle East budget
// Tier 2 (mid): Europe, Americas, Oceania
// Tier 3 (premium): Japan, South Korea, Singapore, US, Canada, Australia
type PriceTier = [number, number, number, number, number, number, number, number];
//                w1d   r1d   w7d   r7d   w14d  r14d  w30d  r30d
const TIER_CHEAP:   PriceTier = [249, 399, 449, 699, 699, 999, 1099, 1599];
const TIER_MID:     PriceTier = [349, 499, 599, 899, 899, 1299, 1499, 2199];
const TIER_PREMIUM: PriceTier = [449, 649, 749, 1099, 1099, 1599, 1799, 2599];

function plansForDest(seq: number, name: string, tier: PriceTier): MockPlan[] {
  const [w1, r1, w7, r7, w14, r14, w30, r30] = tier;
  return [
    makePlan(pid(seq, 1), did(seq), `${name} 1GB 1 Day`, 1, 1, w1, r1),
    makePlan(pid(seq, 2), did(seq), `${name} 3GB 7 Days`, 3, 7, w7, r7),
    makePlan(pid(seq, 3), did(seq), `${name} 5GB 14 Days`, 5, 14, w14, r14),
    makePlan(pid(seq, 4), did(seq), `${name} 10GB 30 Days`, 10, 30, w30, r30),
  ];
}

export const mockPlans: MockPlan[] = [
  // ── Regional plans ──────────────────────────────────────────────
  // Europe-wide
  makePlan(pid(1, 1), did(1), 'Europe 5GB 7 Days', 5, 7, 1099, 1599),
  makePlan(pid(1, 2), did(1), 'Europe 10GB 14 Days', 10, 14, 1799, 2699),
  makePlan(pid(1, 3), did(1), 'Europe 20GB 30 Days', 20, 30, 2899, 4299),

  // Asia-wide
  makePlan(pid(2, 1), did(2), 'Asia 5GB 7 Days', 5, 7, 999, 1499),
  makePlan(pid(2, 2), did(2), 'Asia 10GB 14 Days', 10, 14, 1699, 2499),
  makePlan(pid(2, 3), did(2), 'Asia 20GB 30 Days', 20, 30, 2699, 3999),

  // Global
  makePlan(pid(3, 1), did(3), 'Global 3GB 7 Days', 3, 7, 1299, 1999),
  makePlan(pid(3, 2), did(3), 'Global 5GB 14 Days', 5, 14, 1999, 2999),
  makePlan(pid(3, 3), did(3), 'Global 10GB 30 Days', 10, 30, 3299, 4999),

  // ── Europe ──────────────────────────────────────────────────────
  ...plansForDest(10, 'France', TIER_MID),
  ...plansForDest(11, 'Spain', TIER_MID),
  ...plansForDest(12, 'Italy', TIER_MID),
  ...plansForDest(13, 'Germany', TIER_MID),
  ...plansForDest(14, 'Portugal', TIER_CHEAP),
  ...plansForDest(15, 'Netherlands', TIER_MID),
  ...plansForDest(16, 'UK', TIER_PREMIUM),
  ...plansForDest(17, 'Greece', TIER_MID),
  ...plansForDest(18, 'Turkey', TIER_CHEAP),
  ...plansForDest(19, 'Poland', TIER_CHEAP),
  ...plansForDest(20, 'Czech Republic', TIER_CHEAP),
  ...plansForDest(21, 'Austria', TIER_MID),

  // ── Asia ────────────────────────────────────────────────────────
  ...plansForDest(30, 'Japan', TIER_PREMIUM),
  ...plansForDest(31, 'South Korea', TIER_PREMIUM),
  ...plansForDest(32, 'Thailand', TIER_CHEAP),
  ...plansForDest(33, 'Indonesia', TIER_CHEAP),
  ...plansForDest(34, 'Vietnam', TIER_CHEAP),
  ...plansForDest(35, 'Malaysia', TIER_CHEAP),
  ...plansForDest(36, 'Singapore', TIER_PREMIUM),
  ...plansForDest(37, 'India', TIER_CHEAP),
  ...plansForDest(38, 'Philippines', TIER_CHEAP),
  ...plansForDest(39, 'China', TIER_PREMIUM),

  // ── North America ────────────────────────────────────────────────
  ...plansForDest(50, 'United States', TIER_PREMIUM),
  ...plansForDest(51, 'Canada', TIER_PREMIUM),
  ...plansForDest(52, 'Mexico', TIER_CHEAP),

  // ── South America ──────────────────────────────────────────────
  ...plansForDest(53, 'Brazil', TIER_MID),
  ...plansForDest(54, 'Colombia', TIER_CHEAP),
  ...plansForDest(55, 'Argentina', TIER_CHEAP),

  // ── Middle East ─────────────────────────────────────────────────
  ...plansForDest(60, 'UAE', TIER_MID),
  ...plansForDest(61, 'Saudi Arabia', TIER_MID),
  ...plansForDest(62, 'Qatar', TIER_MID),
  ...plansForDest(63, 'Egypt', TIER_CHEAP),

  // ── Oceania ─────────────────────────────────────────────────────
  ...plansForDest(70, 'Australia', TIER_PREMIUM),
  ...plansForDest(71, 'New Zealand', TIER_PREMIUM),

  // ── Africa ──────────────────────────────────────────────────────
  ...plansForDest(80, 'South Africa', TIER_MID),
  ...plansForDest(81, 'Morocco', TIER_CHEAP),
  ...plansForDest(82, 'Kenya', TIER_CHEAP),
];

export function getPlansForDestination(destinationId: string): MockPlan[] {
  return mockPlans.filter((plan) => plan.destination_id === destinationId);
}

export function getStartingPrice(destinationId: string): number {
  const plans = getPlansForDestination(destinationId);
  if (plans.length === 0) return 0;
  return Math.min(...plans.map((p) => p.retail_price_cents));
}

/**
 * Discount strategy by data tier:
 * - 1GB: no discount (entry plan, full price)
 * - 3GB: 20% off
 * - 5GB: 30% off
 * - 10GB: 35% off
 * - 20GB+: 40% off
 */
function getMarkupFactor(dataGb: number): number {
  if (dataGb <= 1) return 0;
  if (dataGb <= 3) return 1.25;   // original is 25% higher → ~20% discount shown
  if (dataGb <= 5) return 1.45;   // → ~30% discount shown
  if (dataGb <= 10) return 1.55;  // → ~35% discount shown
  return 1.65;                     // → ~40% discount shown
}

/** Returns inflated "original" price based on data tier, rounded to .99. Returns 0 for 1GB (no discount). */
export function getOriginalPrice(retailCents: number, dataGb: number): number {
  const factor = getMarkupFactor(dataGb);
  if (factor === 0) return 0;
  return Math.ceil((retailCents * factor) / 100) * 100 - 1;
}

/** Returns the discount percentage. Returns 0 for 1GB plans. */
export function getDiscountPercent(retailCents: number, dataGb: number): number {
  const original = getOriginalPrice(retailCents, dataGb);
  if (original === 0) return 0;
  return Math.round(((original - retailCents) / original) * 100);
}

/** Returns the best discount % available for a destination (from highest data plan). */
export function getBestDiscount(destinationId: string): number {
  const plans = getPlansForDestination(destinationId);
  if (plans.length === 0) return 0;
  return Math.max(...plans.map((p) => getDiscountPercent(p.retail_price_cents, p.data_gb)));
}

/** Returns original price of cheapest non-1GB plan for strikethrough on cards. */
export function getStartingOriginalPrice(destinationId: string): number {
  const plans = getPlansForDestination(destinationId)
    .filter((p) => p.data_gb > 1)
    .sort((a, b) => a.retail_price_cents - b.retail_price_cents);
  if (plans.length === 0) return 0;
  return getOriginalPrice(plans[0].retail_price_cents, plans[0].data_gb);
}
