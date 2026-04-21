---
phase: 03-checkout-and-payments
plan: 01
subsystem: payments
tags: [stripe, zustand, zod, vat, coupon, checkout, api-routes]

requires:
  - phase: 01-foundation
    provides: mock data patterns (mockPlans, MockPlan interface)
  - phase: 02-browse-and-compare
    provides: Zustand store pattern (browse.ts, comparison.ts)
provides:
  - Server-side pricing with coupon/tax calculation
  - Checkout Zustand store for payment flow state management
  - Mock API routes (create-intent, update-intent, validate-coupon)
  - Stripe appearance config matching design system
  - Stripe client/server singletons
  - Commented production Stripe Tax + 3DS code path
affects: [03-02-checkout-ui, 04-delivery, 06-admin]

tech-stack:
  added: ["@stripe/stripe-js"]
  patterns: [server-side-pricing, mock-api-routes, eu-vat-rates, coupon-validation]

key-files:
  created:
    - src/lib/checkout/types.ts
    - src/lib/checkout/pricing.ts
    - src/lib/checkout/coupons.ts
    - src/lib/checkout/tax.ts
    - src/lib/checkout/schemas.ts
    - src/stores/checkout.ts
    - src/lib/stripe/config.ts
    - src/lib/stripe/client.ts
    - src/lib/stripe/server.ts
    - src/app/api/checkout/create-intent/route.ts
    - src/app/api/checkout/update-intent/route.ts
    - src/app/api/checkout/validate-coupon/route.ts
    - src/lib/mock-data/checkout.ts
    - src/lib/mock-data/coupons.ts
  modified:
    - package.json
    - package-lock.json

key-decisions:
  - "Relaxed plan_id schema from uuid() to min(1) since mock plan IDs are not UUID format"
  - "Installed @stripe/stripe-js for type-safe Stripe Elements config (needed by checkout UI in Plan 02)"
  - "EU VAT rates for all 27 member states hardcoded for dev; production will use Stripe Tax API"

patterns-established:
  - "Server-side pricing: client never determines charge amount, calculatePrice always runs on server"
  - "Coupon validation: case-insensitive, checks active/expiry/usage limits"
  - "Mock API routes: return Stripe-shaped responses during dev, commented production code inline"
  - "Checkout store: Zustand with explicit state transitions for payment flow"

requirements-completed: [CHK-01, CHK-04, CHK-05, INF-05]

duration: 8min
completed: 2026-04-21
---

# Phase 03 Plan 01: Checkout Data Layer Summary

**Server-side pricing with coupon/tax logic, Zustand checkout store, mock Stripe API routes with commented 3DS/Tax production code**

## Performance

- **Duration:** 8 min
- **Started:** 2026-04-21T08:45:07Z
- **Completed:** 2026-04-21T08:53:00Z
- **Tasks:** 2
- **Files modified:** 22

## Accomplishments
- Complete checkout type system (PaymentStatus, CheckoutPricing, Coupon, CreateIntentRequest/Response)
- Server-side pricing with STUDENT30 coupon (30% discount) and EU VAT for all 27 member states
- Zustand checkout store managing plan, email, coupon, payment status with full state transitions
- 3 mock API routes (create-intent, update-intent, validate-coupon) returning Stripe Payment Intent shape
- Commented production code path in create-intent showing Stripe Tax API + 3D Secure configuration
- 23 new tests passing (74 total project tests)

## Task Commits

Each task was committed atomically:

1. **Task 1: Checkout types, pricing/coupon/tax logic, mock data, and unit tests** - `6f81f93` (feat)
2. **Task 2: Checkout Zustand store, Stripe config, API routes, create-intent tests** - `6f16a2d` (feat)

## Files Created/Modified
- `src/lib/checkout/types.ts` - PaymentStatus, CheckoutPricing, Coupon, CreateIntentRequest/Response types
- `src/lib/checkout/pricing.ts` - Server-side price calculation with coupon application
- `src/lib/checkout/coupons.ts` - STUDENT30 coupon definition and case-insensitive validation
- `src/lib/checkout/tax.ts` - EU VAT rates (27 countries) and tax calculation
- `src/lib/checkout/schemas.ts` - Zod v4 schemas for checkout form and API validation
- `src/stores/checkout.ts` - Zustand store for checkout flow state management
- `src/lib/stripe/config.ts` - Stripe Elements appearance matching design system
- `src/lib/stripe/client.ts` - Singleton loadStripe with fallback to mock key
- `src/lib/stripe/server.ts` - Server-side Stripe instance (lazy import, mock-safe)
- `src/app/api/checkout/create-intent/route.ts` - Payment Intent creation with mock + production 3DS path
- `src/app/api/checkout/update-intent/route.ts` - Payment Intent update for coupon changes
- `src/app/api/checkout/validate-coupon/route.ts` - Coupon validation endpoint
- `src/lib/mock-data/checkout.ts` - Mock checkout responses using calculatePrice + calculateTax
- `src/lib/mock-data/coupons.ts` - Re-exports COUPONS for mock-data pattern consistency

## Decisions Made
- Relaxed plan_id schema from `uuid()` to `min(1)` because mock plan IDs use a custom format (not UUIDs)
- Installed `@stripe/stripe-js` to provide proper TypeScript types for Stripe Elements appearance config
- EU VAT rates hardcoded for all 27 member states; production path uses Stripe Tax Calculations API

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Relaxed plan_id Zod schema from uuid() to min(1)**
- **Found during:** Task 2 (create-intent API route tests)
- **Issue:** Schema used `z.string().uuid()` but mock plan IDs are not UUID format, causing all API requests to fail with 400
- **Fix:** Changed to `z.string().min(1)` in both checkoutFormSchema and createIntentRequestSchema
- **Files modified:** src/lib/checkout/schemas.ts
- **Verification:** All create-intent tests pass
- **Committed in:** 6f16a2d (Task 2 commit)

**2. [Rule 3 - Blocking] Installed @stripe/stripe-js dependency**
- **Found during:** Task 2 (Stripe config/client TypeScript check)
- **Issue:** `import type { Appearance } from '@stripe/stripe-js'` failed -- package not installed
- **Fix:** `npm install @stripe/stripe-js`
- **Files modified:** package.json, package-lock.json
- **Verification:** `npx tsc --noEmit` passes clean
- **Committed in:** 6f16a2d (Task 2 commit)

---

**Total deviations:** 2 auto-fixed (1 bug, 1 blocking)
**Impact on plan:** Both auto-fixes necessary for correctness. No scope creep.

## Issues Encountered
None beyond the auto-fixed deviations above.

## User Setup Required
None - no external service configuration required. All development uses mock data.

## Next Phase Readiness
- All checkout business logic ready for UI consumption (Plan 02)
- Zustand checkout store provides full state management for payment flow
- Mock API routes return Stripe-shaped responses enabling full UI development
- Stripe appearance config ready for Elements integration
- Production Stripe code path documented inline for when real keys are configured

## Self-Check: PASSED

All 15 created files verified present. Both task commits (6f81f93, 6f16a2d) verified in git log.

---
*Phase: 03-checkout-and-payments*
*Completed: 2026-04-21*
