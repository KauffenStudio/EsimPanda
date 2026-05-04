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

// Price tiers based on Celitech 0–30 day list price with the 20% partner
// discount applied (May 2026 price list). Retail targets a 28–33% margin
// across SKUs so every plan stays inside the 20–35% margin window.
//
// Country tier assignments mirror Celitech's pricing structure, not the
// human "this country feels expensive" intuition. e.g. Japan is in CHEAP
// because Celitech treats it as cheap; UK is in CHEAP for the same reason.
// Conversely, Vietnam and Philippines are in PREMIUM because Celitech's
// 5GB wholesale there ($16-19) is closer to South Korea than Italy.
type PriceTier = [number, number, number, number, number, number, number, number];
//                w1d   r1d   w7d   r7d   w14d  r14d  w30d  r30d
const TIER_CHEAP:    PriceTier = [320, 449, 480, 699, 560, 799, 800, 1149];
//   wholesale ref:  Italy/Japan ($3.20/$4.80/$5.60/$8.00 for 1/3/5/8GB)
//   margins:        29% / 31% / 30% / 30%

const TIER_MID:      PriceTier = [320, 449, 640, 899, 800, 1199, 1120, 1599];
//   wholesale ref:  France ($3.20/$6.40/$8.00/$11.20 for 1/3/5/8GB)
//   margins:        29% / 29% / 33% / 30%

const TIER_HIGHER:   PriceTier = [400, 599, 800, 1199, 1040, 1499, 1440, 1999];
//   wholesale ref:  USA/Brazil ($4.00/$8.00/$10.40/$14.40 for 1/3/5/8GB)
//   margins:        33% / 33% / 31% / 28%

const TIER_PREMIUM:  PriceTier = [480, 699, 1120, 1599, 1600, 2299, 2240, 3199];
//   wholesale ref:  Singapore/Korea ($4.80/$11.20/$16.00/$22.40 for 1/3/5/8GB)
//   margins:        31% / 30% / 30% / 30%

// Plan grid: 1GB/14d, 3GB/20d, 5GB/30d, 8GB/30d. Celitech bills wholesale
// by data + 0-30 day window (not by specific days), so generous durations
// cost us nothing while letting customers stay connected longer than the
// typical 1d/7d competitor SKUs. The four wholesale fields below are
// labelled w1/w7/w14/w30 for historical reasons; they map 1:1 to the new
// durations 14/20/30/30 since Celitech's wholesale doesn't change inside
// the 0-30 day window.
function plansForDest(seq: number, name: string, tier: PriceTier): MockPlan[] {
  const [w1, r1, w7, r7, w14, r14, w30, r30] = tier;
  return [
    makePlan(pid(seq, 1), did(seq), `${name} 1GB 14 Days`, 1, 14, w1, r1),
    makePlan(pid(seq, 2), did(seq), `${name} 3GB 20 Days`, 3, 20, w7, r7),
    makePlan(pid(seq, 3), did(seq), `${name} 5GB 30 Days`, 5, 30, w14, r14),
    makePlan(pid(seq, 4), did(seq), `${name} 8GB 30 Days`, 8, 30, w30, r30),
  ];
}

export const mockPlans: MockPlan[] = [
  // ── Regional plans ──────────────────────────────────────────────
  // Europe-wide  (Celitech "Europe" 44-country bundle, 0-30d, 20% off)
  makePlan(pid(1, 1), did(1), 'Europe 5GB 30 Days',  5, 30, 1200, 1699),  // 29%
  makePlan(pid(1, 2), did(1), 'Europe 8GB 30 Days',  8, 30, 1760, 2499),  // 30%
  makePlan(pid(1, 3), did(1), 'Europe 20GB 30 Days', 20, 30, 3520, 4999), // 30%

  // Asia-wide  (Celitech "Asia" 15-country bundle)
  makePlan(pid(2, 1), did(2), 'Asia 5GB 30 Days',  5, 30, 1520, 2199),    // 31%
  makePlan(pid(2, 2), did(2), 'Asia 8GB 30 Days',  8, 30, 2080, 2999),    // 31%
  makePlan(pid(2, 3), did(2), 'Asia 20GB 30 Days', 20, 30, 4160, 5999),   // 31%

  // Global  (Celitech "Region-1" 77-country bundle)
  makePlan(pid(3, 1), did(3), 'Global 3GB 20 Days',  3, 20, 1040, 1499),  // 31%
  makePlan(pid(3, 2), did(3), 'Global 5GB 30 Days',  5, 30, 1520, 2199),  // 31%
  makePlan(pid(3, 3), did(3), 'Global 8GB 30 Days',  8, 30, 2160, 3099),  // 30%

  // ── Europe ──────────────────────────────────────────────────────
  ...plansForDest(10, 'France',          TIER_MID),
  ...plansForDest(11, 'Spain',           TIER_CHEAP),
  ...plansForDest(12, 'Italy',           TIER_CHEAP),
  ...plansForDest(13, 'Germany',         TIER_CHEAP),
  ...plansForDest(14, 'Portugal',        TIER_CHEAP),
  ...plansForDest(15, 'Netherlands',     TIER_CHEAP),
  ...plansForDest(16, 'UK',              TIER_CHEAP),
  ...plansForDest(17, 'Greece',          TIER_CHEAP),
  ...plansForDest(18, 'Turkey',          TIER_MID),       // moved from HIGHER, was 52% margin → now 40%
  ...plansForDest(19, 'Poland',          TIER_CHEAP),
  ...plansForDest(20, 'Czech Republic',  TIER_CHEAP),
  ...plansForDest(21, 'Austria',         TIER_MID),
  ...plansForDest(22, 'Albania',         TIER_HIGHER),
  ...plansForDest(23, 'Andorra',         TIER_PREMIUM),
  ...plansForDest(24, 'Armenia',         TIER_PREMIUM),
  ...plansForDest(25, 'Azerbaijan',      TIER_PREMIUM),
  ...plansForDest(26, 'Belgium',         TIER_MID),
  ...plansForDest(27, 'Bulgaria',        TIER_MID),
  ...plansForDest(28, 'Croatia',         TIER_CHEAP),
  ...plansForDest(29, 'Cyprus',          TIER_CHEAP),
  ...plansForDest(100, 'Denmark',        TIER_CHEAP),
  ...plansForDest(101, 'Estonia',        TIER_CHEAP),
  ...plansForDest(102, 'Finland',        TIER_CHEAP),
  ...plansForDest(103, 'Georgia',        TIER_MID),
  ...plansForDest(104, 'Hungary',        TIER_CHEAP),
  ...plansForDest(105, 'Iceland',        TIER_CHEAP),
  ...plansForDest(106, 'Ireland',        TIER_CHEAP),
  ...plansForDest(107, 'Latvia',         TIER_CHEAP),
  ...plansForDest(108, 'Liechtenstein',  TIER_CHEAP),
  ...plansForDest(109, 'Lithuania',      TIER_CHEAP),
  ...plansForDest(110, 'Luxembourg',     TIER_CHEAP),
  ...plansForDest(111, 'Malta',          TIER_CHEAP),
  ...plansForDest(112, 'Moldova',        TIER_CHEAP),
  ...plansForDest(113, 'Montenegro',     TIER_HIGHER),
  ...plansForDest(114, 'North Macedonia', TIER_PREMIUM),
  ...plansForDest(115, 'Norway',         TIER_CHEAP),
  ...plansForDest(116, 'Romania',        TIER_CHEAP),
  ...plansForDest(117, 'San Marino',     TIER_CHEAP),
  ...plansForDest(118, 'Serbia',         TIER_PREMIUM),
  ...plansForDest(119, 'Slovakia',       TIER_CHEAP),
  ...plansForDest(120, 'Slovenia',       TIER_CHEAP),
  ...plansForDest(121, 'Sweden',         TIER_CHEAP),
  ...plansForDest(122, 'Switzerland',    TIER_MID),
  ...plansForDest(123, 'Ukraine',        TIER_CHEAP),
  ...plansForDest(124, 'Vatican City',   TIER_CHEAP),

  // ── Asia ────────────────────────────────────────────────────────
  ...plansForDest(30, 'Japan',       TIER_CHEAP),
  ...plansForDest(31, 'South Korea', TIER_PREMIUM),
  ...plansForDest(32, 'Thailand',    TIER_HIGHER),
  ...plansForDest(33, 'Indonesia',   TIER_HIGHER),
  ...plansForDest(34, 'Vietnam',     TIER_PREMIUM),
  ...plansForDest(35, 'Malaysia',    TIER_HIGHER),
  ...plansForDest(36, 'Singapore',   TIER_PREMIUM),
  ...plansForDest(37, 'India',       TIER_PREMIUM),
  ...plansForDest(38, 'Philippines', TIER_PREMIUM),
  ...plansForDest(39, 'China',       TIER_PREMIUM),

  // ── North America ────────────────────────────────────────────────
  ...plansForDest(50, 'United States', TIER_HIGHER),
  ...plansForDest(51, 'Canada',        TIER_PREMIUM),
  ...plansForDest(52, 'Mexico',        TIER_HIGHER),

  // ── South America ──────────────────────────────────────────────
  ...plansForDest(53, 'Brazil',    TIER_HIGHER),
  ...plansForDest(55, 'Argentina', TIER_HIGHER),

  // ── Middle East ─────────────────────────────────────────────────
  ...plansForDest(61, 'Saudi Arabia', TIER_PREMIUM),
  ...plansForDest(62, 'Qatar',        TIER_HIGHER),
  ...plansForDest(63, 'Egypt',        TIER_PREMIUM),

  // ── Oceania ─────────────────────────────────────────────────────
  ...plansForDest(70, 'Australia',   TIER_PREMIUM),
  ...plansForDest(71, 'New Zealand', TIER_HIGHER),

  // ── Africa ──────────────────────────────────────────────────────
  ...plansForDest(81, 'Morocco', TIER_PREMIUM),
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
