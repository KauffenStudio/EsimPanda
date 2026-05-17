---
phase: 12-checkout-pricing-and-coupon-cutover
plan: 01
subsystem: payments
tags: [supabase, checkout, pricing, coupons, currency, vitest, zod]

# Dependency graph
requires:
  - phase: 11-read-layer-module-and-browse-cutover
    provides: getPlanById Supabase read + canonical Plan type in db/destinations.ts
provides:
  - async currency-aware calculatePrice backed by getPlanById (no mock IDs accepted)
  - getCouponMinOrderCents helper — per-currency coupon minimum order
  - getRate accessor on rates.ts (RATES stays module-private)
  - fixed formatPrice JPY branch (¥1553 not ¥155345)
  - currency field on createIntentRequestSchema
  - validateCoupon minOrderOverride param (currency-aware, zero-minimum safe)
  - 3 api/checkout routes + mockCreateIntent cut to getPlanById
affects: [12-02-checkout-page-cart-migration, 13-cleanup-whatsapp]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Async data-resolution in a pure compute fn — calculatePrice awaits getPlanById, ripples await into routes"
    - "Currency-aware gate: convert order total into selected currency, compare against per-currency minimum"
    - "Test cutover: vi.mock('@/lib/db/destinations') with __test-fixtures__/catalog.ts fixtures"

key-files:
  created:
    - src/lib/currency/__tests__/rates.test.ts
  modified:
    - src/lib/currency/rates.ts
    - src/lib/checkout/coupons.ts
    - src/lib/checkout/pricing.ts
    - src/lib/checkout/schemas.ts
    - src/lib/mock-data/checkout.ts
    - src/app/api/checkout/create-intent/route.ts
    - src/app/api/checkout/update-intent/route.ts
    - src/app/api/checkout/validate-coupon/route.ts
    - src/lib/checkout/__tests__/coupons.test.ts
    - src/lib/checkout/__tests__/pricing.test.ts
    - src/app/api/checkout/__tests__/create-intent.test.ts

key-decisions:
  - "calculatePrice discount math stays in USD cents; only the eligibility gate is currency-aware"
  - "minOrderOverride applies only when coupon.min_order_cents > 0 — WELCOME10 stays no-minimum"
  - "RATES stays module-private; getRate() accessor added instead of exporting the table"
  - "create-intent.test.ts migrated (deviation) — it pinned dead mock plan IDs the cutover breaks"

patterns-established:
  - "Pattern: getCouponMinOrderCents — flat 999 for USD/EUR/GBP, €9.99 USD cross-rate for BRL/JPY/CNY"
  - "Pattern: route bodies thread a currency field into calculatePrice (zod-validated for create-intent)"

requirements-completed: [CHK-06, CHK-07]

# Metrics
duration: 18min
completed: 2026-05-17
---

# Phase 12 Plan 01: Checkout Pricing and Coupon Cutover Summary

**Async currency-aware `calculatePrice` backed by Supabase `getPlanById`, a per-currency `getCouponMinOrderCents` helper, a fixed `formatPrice` JPY bug, and three rewired `api/checkout` routes.**

## Performance

- **Duration:** ~18 min
- **Started:** 2026-05-17T12:05:00Z
- **Completed:** 2026-05-17T12:30:00Z
- **Tasks:** 4
- **Files modified:** 11 (1 created, 10 modified)

## Accomplishments

- `calculatePrice` is now `async`, currency-aware, and resolves plans from Supabase via `getPlanById` — unknown plan IDs return `null` (CHK-06; no mock IDs accepted).
- `getCouponMinOrderCents(currency)` provides a per-currency coupon minimum: flat `999` for USD/EUR/GBP, a €9.99 USD cross-rate for BRL/JPY/CNY. `validateCoupon` gained a `minOrderOverride` param that floors only coupons with a non-zero static minimum — `WELCOME10` is never floored (CHK-07).
- Fixed the pre-existing `formatPrice` JPY bug — `formatPrice(999,'JPY')` now renders `¥1553` instead of `¥155345`; CNY/BRL unchanged.
- The three `api/checkout/*` routes and `mockCreateIntent` cut over to `getPlanById`; `createIntentRequestSchema` carries an optional `currency` field so zod no longer strips it.
- Test files: `rates.test.ts` (new), `coupons.test.ts` (extended), `pricing.test.ts` (migrated), plus `create-intent.test.ts` (migrated as a deviation).

## Task Commits

1. **Task 1: Wave 0 tests — rates.test.ts (new) + coupons.test.ts (extend)** — `1c7d700` (test)
2. **Task 2: Fix formatPrice JPY bug + getRate accessor** — `6ba1287` (fix)
3. **Task 3: getCouponMinOrderCents + currency-aware validateCoupon override** — `a5deb54` (feat)
4. **Task 4: Async/currency-aware calculatePrice + route + schema + mockCreateIntent cutover** — `9e686a3` (feat)

## getCouponMinOrderCents computed values

Confirmed against the static `RATES` table (USD:1, EUR:0.92, GBP:0.79, BRL:5.12, JPY:155.5, CNY:7.24):

| Currency | Minimum order (cents) | Basis |
| -------- | --------------------- | ----- |
| USD / EUR / GBP | 999 | flat |
| BRL | 5560 | `round(999 / 0.92 * 5.12)` |
| JPY | 168853 | `round(999 / 0.92 * 155.5)` |
| CNY | 7862 | `round(999 / 0.92 * 7.24)` |

## Files Created/Modified

- `src/lib/currency/__tests__/rates.test.ts` — NEW; `formatPrice` JPY-fix + USD/CNY/BRL regression guards.
- `src/lib/currency/rates.ts` — fixed JPY branch (`Math.round(converted / 100)`); added `getRate()` accessor (RATES stays private).
- `src/lib/checkout/coupons.ts` — added `getCouponMinOrderCents`; `validateCoupon` gained the `minOrderOverride` param.
- `src/lib/checkout/pricing.ts` — `calculatePrice` rewritten async + currency-aware on `getPlanById`.
- `src/lib/checkout/schemas.ts` — `currency` enum field added to `createIntentRequestSchema`.
- `src/lib/mock-data/checkout.ts` — `mockCreateIntent` async, cut to `getPlanById`, accepts `currency` (file kept — Phase 13 territory).
- `src/app/api/checkout/{create-intent,update-intent,validate-coupon}/route.ts` — resolve plans via Supabase, thread `currency`, reject unknown IDs with the existing 404 convention.
- `src/lib/checkout/__tests__/{coupons,pricing}.test.ts` — extended / migrated to fixtures + `vi.mock`.
- `src/app/api/checkout/__tests__/create-intent.test.ts` — migrated (deviation, see below).

## Decisions Made

- The coupon discount amount stays in USD cents (`retail_price_cents` is USD, Stripe charges USD); only the eligibility gate converts into the selected currency — matches the locked "percentage-discount math unchanged" decision.
- `minOrderOverride` applies only when `coupon.min_order_cents > 0`, keeping `WELCOME10` a no-minimum coupon (RESEARCH Open Question 2).
- `RATES` kept module-private; added `getRate()` rather than `export const RATES` (RESEARCH Open Question 1, option b).
- `update-intent` received the identical async + `currency` treatment as `create-intent` — RESEARCH confirmed it resolves plans and the answer is yes.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Migrated `create-intent.test.ts` — it pinned dead mock plan IDs**
- **Found during:** Task 4 (route cutover)
- **Issue:** `src/app/api/checkout/__tests__/create-intent.test.ts` hardcoded `VALID_PLAN_ID = 'p001-0001-4000-8000-000000000000'` (a mock ID). After the route cutover to `getPlanById`, that ID resolves to `null` → 3 tests failed (`returns mock response`, `applies coupon discount`, and the previously-passing valid path). This is the same test-cascade class as the planned `pricing.test.ts` migration but the plan did not list this file.
- **Fix:** Migrated the test to `vi.mock('@/lib/db/destinations')` returning `fixturePlans` from `src/lib/__test-fixtures__/catalog.ts`, switched `VALID_PLAN_ID` to `plan-france-5gb`, and used a zero-UUID for the invalid-ID case.
- **Files modified:** `src/app/api/checkout/__tests__/create-intent.test.ts`
- **Verification:** Full suite green (264 passed) after migration.
- **Committed in:** `9e686a3` (Task 4 commit)

**2. [Rule 3 - Blocking] `coupon.min_order_cents` typed as possibly-undefined**
- **Found during:** Task 3 (`validateCoupon` override)
- **Issue:** The `Coupon` type marks `min_order_cents` optional; the `> 0` comparison tripped `tsc` (`TS18048`).
- **Fix:** Introduced a `staticMin = coupon.min_order_cents ?? 0` local before the comparison. The zero-minimum exemption logic is unchanged.
- **Files modified:** `src/lib/checkout/coupons.ts`
- **Verification:** `npx tsc --noEmit` clean.
- **Committed in:** `a5deb54` (Task 3 commit)

---

**Total deviations:** 2 auto-fixed (1 bug, 1 blocking)
**Impact on plan:** Both necessary — the test migration keeps the suite above the 256 baseline; the type fix is required for `tsc` clean. No scope creep.

## Issues Encountered

- Initial `rates.test.ts` pinned the CNY display literal as `¥72.32`; the actual `convertPrice(999,'CNY')` is `7233` cents → `¥72.33` (round of `999*7.24=7232.76`). Corrected the literal; the dynamic assertion against `convertPrice` was always right.

## Spot-check — Celitech plan currencies (RESEARCH Open Question 4)

Ran a live Supabase query: `select id, currency from plans where currency != 'USD'` → **count = 0**. No non-USD plan rows exist, so the discount math's USD assumption holds. No action needed; flag cleared.

## Acceptance Criteria Note

The plan's Task 4 grep criterion expected `getPlanById` in ≥4 files. It appears directly in 2 (`pricing.ts`, `validate-coupon/route.ts`); `create-intent`/`update-intent` resolve plans through `await calculatePrice(...)` which calls `getPlanById` internally — the correct architecture per RESEARCH §1 (the async ripple). All routes reject unknown plan IDs via the `null` return → 404. CHK-06 is satisfied.

## Self-Check: PASSED

- `src/lib/currency/__tests__/rates.test.ts` — FOUND
- `src/lib/currency/rates.ts` (getRate + JPY fix) — FOUND
- `src/lib/checkout/coupons.ts` (getCouponMinOrderCents) — FOUND
- `src/lib/checkout/pricing.ts` (async calculatePrice) — FOUND
- Commits `1c7d700`, `6ba1287`, `a5deb54`, `9e686a3` — all FOUND
- `npm test` 264 passed (≥256 baseline); `npx tsc --noEmit` clean; `npm run build` succeeds

## Next Phase Readiness

- Plan 12-02 can proceed: the Supabase plan-lookup pattern and the canonical `Plan` type usage are established. 12-02 covers async `checkout/page.tsx`, the browse notice banner, the `MockPlan`→`Plan` rename, and the cart `version: 2` migration.
- No blockers. `src/lib/mock-data/checkout.ts` deliberately kept (not in the Phase 13 deletion list).

---
*Phase: 12-checkout-pricing-and-coupon-cutover*
*Completed: 2026-05-17*
