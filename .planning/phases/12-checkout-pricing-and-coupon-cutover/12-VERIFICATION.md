---
phase: 12-checkout-pricing-and-coupon-cutover
verified: 2026-05-17T12:35:00Z
status: passed
score: 10/10 must-haves verified
re_verification: false
human_verification:
  - test: "Open /en/checkout?plan=00000000-0000-0000-0000-000000000000 in dev"
    expected: "Redirect to /en/browse?notice=plan-unavailable with a dismissable notice banner visible"
    why_human: "RSC redirect() is not unit-testable in jsdom; visual banner requires a browser"
  - test: "Seed localStorage key esim-panda-cart with a v0 payload (version absent, mock plan IDs), then reload the app"
    expected: "Cart is silently empty — no toast, no error — on first load"
    why_human: "Requires a real browser with localStorage pre-seeded before Zustand hydration runs"
  - test: "Switch currency to JPY in the UI, add a plan, attempt to apply STUDENT15 coupon to a borderline-priced plan"
    expected: "Eligibility computed against the JPY-converted minimum (168853 JPY-cents), not the flat 999"
    why_human: "Full client-to-server currency flow needs a browser session"
---

# Phase 12: Checkout, Pricing and Coupon Cutover — Verification Report

**Phase Goal:** The payment path — pricing computation, coupon validation, and the checkout server component — reads from Supabase by real plan ID; the coupon minimum-order is currency-aware; `MockPlan` is renamed to `Plan`; persisted v1.0 cart state is purged on first load via a versioned Zustand migration.

**Verified:** 2026-05-17T12:35:00Z
**Status:** PASSED
**Re-verification:** No — initial verification

---

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | `calculatePrice` is async and resolves plans from Supabase via `getPlanById` — no `mockPlans.find`; returns null for unknown plan IDs | VERIFIED | `pricing.ts` line 20: `export async function calculatePrice`; line 25: `const plan = await getPlanById(planId); if (!plan) return null;` |
| 2 | `validate-coupon`, `create-intent`, `update-intent` routes resolve plans via `getPlanById` or `calculatePrice` — `grep -rn "mockPlans" src/lib/checkout/ src/app/api/checkout/` returns 0 | VERIFIED | grep returned empty; `validate-coupon/route.ts` line 3+24 import and call `getPlanById`; `create-intent` and `update-intent` use `await calculatePrice(...)` which calls `getPlanById` internally |
| 3 | `getCouponMinOrderCents` returns 999 for USD/EUR/GBP, a €9.99 cross-rate for BRL/JPY/CNY; applies only when `coupon.min_order_cents > 0` (zero-minimum coupons like WELCOME10 not floored) | VERIFIED | `coupons.ts` lines 19-23: flat 999 for FLAT_MIN_CURRENCIES, cross-rate formula otherwise; lines 83-85: `staticMin > 0` guard; WELCOME10 has `min_order_cents: 0` |
| 4 | `formatPrice(999, 'JPY')` renders `¥1553` (not `¥155345`) — the JPY bug is fixed in `rates.ts` | VERIFIED | `rates.ts` line 40: `return \`${info.symbol}${Math.round(converted / 100)}\`` with `currency === 'JPY'` branch; `getRate` exported (line 29); `RATES` not exported (grep returned 0 hits for `export const RATES`) |
| 5 | `createIntentRequestSchema` has a `currency` field | VERIFIED | `schemas.ts` line 15: `currency: z.enum(['USD', 'EUR', 'GBP', 'BRL', 'JPY', 'CNY']).optional()` |
| 6 | `checkout/page.tsx` is an async server component; an unknown/missing plan ID redirects to `/{locale}/browse?notice=plan-unavailable` | VERIFIED | `page.tsx` line 10: `export default async function CheckoutRoute`; line 21: `const plan = await getPlanById(planId)`; line 24: `redirect(\`/${locale}/browse?notice=plan-unavailable\`)` |
| 7 | Browse page renders a dismissable notice banner from `?notice=plan-unavailable`; i18n key exists in all 6 locale files | VERIFIED | `browse-client.tsx` lines 102-148: `notice?: string` prop, `showPlanUnavailableNotice` state logic; `browse/page.tsx` line 11+19: reads `searchParams`, extracts `notice`; `grep -ln "planUnavailable" messages/*.json` returns all 6 files |
| 8 | `MockPlan` → `Plan` rename complete: `grep -rln "MockPlan" src/` returns only `mock-data/plans.ts` + a comment in `db/destinations.ts` | VERIFIED | grep returned exactly 2 files; `cart.ts` line 3: `import type { Plan } from '@/lib/db/destinations'` |
| 9 | `src/stores/cart.ts` `persist` config has `version: 2` and a `migrate` function (`migrateCart`) returning empty cart for `version < 2` | VERIFIED | `cart.ts` line 31: `export function migrateCart`; line 32-34: `if (version < 2) return { items: [], coupon_code: null, discount_percent: 0 }`; line 75: `version: 2`; line 76: `migrate: migrateCart` |
| 10 | `npm test` passes (267, above 256 baseline); `npx tsc --noEmit` clean; `npm run build` succeeds | VERIFIED | 267 passed / 46 todo; `tsc --noEmit` produced no output (clean); build completed successfully with all routes rendered |

**Score:** 10/10 truths verified

---

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/lib/checkout/pricing.ts` | async calculatePrice backed by getPlanById | VERIFIED | async, calls getPlanById, returns null for unknown IDs |
| `src/lib/checkout/coupons.ts` | getCouponMinOrderCents + minOrderOverride in validateCoupon | VERIFIED | both exported; effectiveMin logic with > 0 guard |
| `src/lib/currency/rates.ts` | getRate accessor + JPY fix (Math.round(converted/100)) | VERIFIED | both present; RATES stays private |
| `src/lib/checkout/schemas.ts` | currency field on createIntentRequestSchema | VERIFIED | z.enum(['USD','EUR','GBP','BRL','JPY','CNY']).optional() |
| `src/app/[locale]/checkout/page.tsx` | async RSC with getPlanById + notice redirect | VERIFIED | async function, awaits getPlanById, redirects with ?notice=plan-unavailable |
| `src/stores/cart.ts` | persist version: 2 + exported migrateCart | VERIFIED | version: 2, migrateCart defined and referenced in persist config |
| `src/lib/db/destinations.ts` | canonical Plan extended with synced_at?/created_at?/updated_at? | VERIFIED | synced_at? on line 39 confirmed |
| `src/components/browse/browse-client.tsx` | dismissable plan-unavailable notice banner | VERIFIED | notice prop, noticeDismissed state, showPlanUnavailableNotice logic |
| `src/lib/currency/__tests__/rates.test.ts` | formatPrice JPY-fix + regression tests | VERIFIED | file exists, 8 formatPrice references |
| `src/lib/checkout/__tests__/coupons.test.ts` | getCouponMinOrderCents tests (12 references) | VERIFIED | 12 getCouponMinOrderCents references |
| `src/stores/__tests__/cart.test.ts` | migrate function unit tests (9 references) | VERIFIED | 9 migrate references |
| `messages/{en,pt,es,fr,ja,zh}.json` | planUnavailableNotice key in all 6 locales | VERIFIED | all 6 files returned by grep |

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `pricing.ts` | `db/destinations.ts (getPlanById)` | `await getPlanById(planId)` | WIRED | line 25 |
| `coupons.ts (getCouponMinOrderCents)` | `currency/rates.ts (getRate)` | cross-rate conversion | WIRED | lines 21-22 |
| `create-intent/route.ts` | `pricing.ts (calculatePrice)` | `await calculatePrice(plan_id, coupon_code, currency)` | WIRED | line 33 |
| `update-intent/route.ts` | `pricing.ts (calculatePrice)` | `await calculatePrice(plan_id, coupon_code, currency)` | WIRED | line 32 |
| `validate-coupon/route.ts` | `db/destinations.ts (getPlanById)` | `await getPlanById(plan_id)` | WIRED | lines 3 and 24 |
| `checkout/page.tsx` | `db/destinations.ts (getPlanById)` | `await getPlanById(planId)` | WIRED | lines 2 and 21 |
| `checkout/page.tsx` | `/{locale}/browse?notice=plan-unavailable` | `redirect()` on null plan | WIRED | line 24 |
| `browse/page.tsx` | `browse-client.tsx` | `notice` prop from searchParams | WIRED | line 38 |
| `cart.ts (migrateCart)` | empty cart state | version < 2 → clean return | WIRED | lines 32-34 |

---

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|-------------|--------|----------|
| CHK-06 | 12-01, 12-02 | User completing checkout is charged the real Supabase retail price; no mock plan IDs accepted | SATISFIED | `calculatePrice` calls `getPlanById`; all 3 routes reject null (unknown ID); `checkout/page.tsx` redirects on null plan; `mockPlans` grep returns 0 in checkout/ and api/checkout/ |
| CHK-07 | 12-01 | Currency-aware minimum-order requirement; eligibility against order total in selected currency | SATISFIED | `getCouponMinOrderCents` provides per-currency minimums; validateCoupon `effectiveMin` logic; formatPrice JPY fix; 267 tests pass |
| CHK-08 | 12-02 | Stale cart purged on first v1.1 load; MockPlan renamed to Plan | SATISFIED | `version: 2` + `migrateCart` in persist config; `grep -rln "MockPlan" src/` returns only 2 files; tsc clean |

No orphaned requirements — all 3 phase-12 requirements (CHK-06, CHK-07, CHK-08) are claimed by the plans and verified in the codebase.

---

### Anti-Patterns Found

No blockers or warnings detected.

| File | Pattern | Severity | Verdict |
|------|---------|----------|---------|
| `coupons.ts` | `getMockInfluencerCoupons` import from `@/lib/referral/mock` | Info | Expected — referral mock remains until Phase 13 cleanup; does not affect CHK-07 |
| `mock-data/plans.ts` | `MockPlan` definition retained | Info | Deliberate — Phase 13 deletes this file; no production code imports `MockPlan` type |

---

### Human Verification Required

The following items are flagged for manual verification. Code paths confirmed to exist; runtime/visual behavior cannot be verified programmatically.

**1. Unknown Plan Redirect Flow**

**Test:** In `npm run dev`, navigate to `/en/checkout?plan=00000000-0000-0000-0000-000000000000`
**Expected:** Browser redirects to `/en/browse?notice=plan-unavailable`; a dismissable neutral-tinted notice banner is visible above the catalog; clicking "Dismiss" removes it
**Why human:** RSC `redirect()` is not exercisable in jsdom; visual banner appearance requires a browser

**2. Stale Cart Purge**

**Test:** Open DevTools, set `localStorage['esim-panda-cart']` to a JSON payload with `version` absent (or `< 2`) and mock plan IDs in `items`, then reload the page
**Expected:** Cart drawer shows as empty with no toast or error message; `localStorage['esim-panda-cart']` is rewritten with `version: 2` and empty items
**Why human:** Requires real browser localStorage pre-seeding before Zustand's persist hydration

**3. Currency-Aware Coupon Eligibility (Borderline)**

**Test:** Switch to EUR or JPY currency; select a plan priced around $9.99 USD; attempt to apply STUDENT15 coupon
**Expected:** Coupon rejected in JPY (minimum is 168853 JPY-cents) if plan total converts below that threshold; coupon accepted in USD at 999 cents threshold
**Why human:** Full client→server currency selection flow requires a running browser session

---

### Gaps Summary

None. All 10 must-haves are verified. Phase gate (267 tests, tsc clean, build success) passed without exception.

---

_Verified: 2026-05-17T12:35:00Z_
_Verifier: Claude (gsd-verifier)_
