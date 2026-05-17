---
phase: 12-checkout-pricing-and-coupon-cutover
plan: 02
subsystem: checkout
tags: [supabase, checkout, zustand, persist, migration, i18n, type-rename, vitest]

# Dependency graph
requires:
  - phase: 12-checkout-pricing-and-coupon-cutover
    plan: 01
    provides: getPlanById Supabase cutover pattern + canonical Plan type usage
  - phase: 11-read-layer-module-and-browse-cutover
    provides: canonical Plan type + getPlanById + BrowseClient
provides:
  - async checkout/page.tsx resolving plans via getPlanById, redirecting unknown IDs with a notice
  - browse plan-unavailable dismissable notice banner driven by the ?notice= query param
  - cart persist version: 2 + migrateCart purging pre-v1.1 carts
  - canonical Plan extended with synced_at/created_at/updated_at (optional)
  - MockPlan -> Plan rename fully propagated across all 9 importers
affects: [13-cleanup-whatsapp]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Zustand persist version + migrate: exported migrateCart for direct unit-testability"
    - "Async RSC plan resolution: checkout/page.tsx awaits getPlanById, redirects null with a query-param notice"
    - "RSC searchParams -> client prop: browse page reads ?notice= and forwards it to BrowseClient"

key-files:
  created:
    - src/stores/__tests__/cart.test.ts
  modified:
    - src/stores/cart.ts
    - src/stores/quick-checkout.ts
    - src/lib/db/destinations.ts
    - src/components/checkout/order-summary.tsx
    - src/components/checkout/sticky-order-bar.tsx
    - src/components/checkout/checkout-page.tsx
    - src/components/cart/cart-item.tsx
    - src/components/browse/plan-card.tsx
    - src/components/browse/browse-client.tsx
    - src/hooks/use-plans.ts
    - src/lib/seo/structured-data.ts
    - src/app/[locale]/checkout/page.tsx
    - src/app/[locale]/browse/page.tsx
    - messages/en.json
    - messages/pt.json
    - messages/es.json
    - messages/fr.json
    - messages/ja.json
    - messages/zh.json

key-decisions:
  - "migrateCart exported as a named export (not inlined in persist config) so it is directly unit-addressable"
  - "i18n key chosen: browse.planUnavailableNotice (object with message + dismiss sub-keys)"
  - "Notice banner reuses BrowseErrorBanner layout but neutral-tinted (border/surface tokens), not destructive — a stale link is informational, not an error"
  - "plan-card cart-add drops its now-redundant timestamp spread — the canonical Plan timestamp fields are optional"

patterns-established:
  - "Pattern: exported migrate function for zustand persist — unit-testable without rehydration"
  - "Pattern: RSC ?notice= query param -> dismissable client banner"

requirements-completed: [CHK-06, CHK-08]

# Metrics
duration: 4min
completed: 2026-05-17
---

# Phase 12 Plan 02: Checkout Page, Cart Migration and Type Rename Summary

**Async `checkout/page.tsx` resolving plans from Supabase with an unknown-plan redirect+notice, a dismissable browse notice banner across 6 locales, a versioned cart `persist` migration purging pre-v1.1 carts, and the complete `MockPlan` -> `Plan` type rename.**

## Performance

- **Duration:** ~4 min
- **Started:** 2026-05-17T11:18:02Z
- **Completed:** 2026-05-17T11:22:00Z
- **Tasks:** 3
- **Files modified:** 20 (1 created, 19 modified)

## Accomplishments

- The cart `persist` config now carries `version: 2` + a `migrate` (exported as `migrateCart`) that returns a clean empty cart for any persisted `version < 2` — silently purging dead v1.0 mock plan IDs (CHK-08). Covered by a new `src/stores/__tests__/cart.test.ts` (3 tests).
- The canonical `Plan` interface (`db/destinations.ts`) gained 3 optional timestamp fields (`synced_at?`, `created_at?`, `updated_at?`) so `MockPlan` importers compile against it without forking the type.
- `MockPlan` -> `Plan` rename fully propagated across all 9 importers; `MockPlan` now appears only in `mock-data/plans.ts` (the definition, Phase 13 territory) and a comment in `db/destinations.ts`. `tsc --noEmit` is clean — the rename gate.
- `checkout/page.tsx` is an async server component resolving the selected plan via `getPlanById`; an unknown/stale plan ID redirects to `/{locale}/browse?notice=plan-unavailable` (CHK-06). The no-plan-selected early-redirect stays notice-free.
- The browse RSC reads the `?notice=` search param and forwards it to `BrowseClient`, which renders a dismissable, neutral-tinted notice banner. A new `browse.planUnavailableNotice` i18n key (with `message` + `dismiss` sub-keys) exists in all 6 locale files.

## Task Commits

1. **Task 1: Cart version: 2 migration + cart.test.ts + extend canonical Plan** — `b3dc20e` (feat)
2. **Task 2: MockPlan -> Plan rename across all importers** — `9607652` (refactor)
3. **Task 3: Async checkout/page.tsx + browse notice banner + 6 locale keys** — `b974381` (feat)

## i18n key chosen

`browse.planUnavailableNotice` — an object under the existing `browse` namespace:

```json
"planUnavailableNotice": {
  "message": "That plan is no longer available — here is the current catalog.",
  "dismiss": "Dismiss"
}
```

Present in all 6 locale files (`en`, `pt`, `es`, `fr`, `ja`, `zh`) with translated copy.

## MockPlan -> Plan rename — final file list

All 9 importer files renamed (definition file `mock-data/plans.ts` deliberately untouched — Phase 13 deletes it):

- `src/stores/cart.ts` — `CartItem.plan: Plan`, `addItem(plan: Plan)`
- `src/stores/quick-checkout.ts` — `selectedPlan: Plan | null` (type-rename only, no persist/migration — Pitfall 5)
- `src/components/checkout/order-summary.tsx`
- `src/components/checkout/sticky-order-bar.tsx`
- `src/components/checkout/checkout-page.tsx`
- `src/components/cart/cart-item.tsx`
- `src/components/browse/plan-card.tsx` — comment updated; the cart-add timestamp spread removed (now redundant)
- `src/hooks/use-plans.ts` — split the mixed value+type import (`getPlansForDestination` stays from `mock-data/plans`, `Plan` type from `db/destinations`)
- `src/lib/seo/structured-data.ts`

## Canonical Plan extension

Only the 3 timestamp fields were needed — `synced_at?`, `created_at?`, `updated_at?`. These are exactly the diff between `MockPlan` (which carries them as required) and the pre-Task-1 canonical `Plan` (which lacked them). All three added as optional. No field beyond these three had to be added — `tsc --noEmit` was clean after Task 1's extension; Task 2 surfaced no further missing field.

## Decisions Made

- `migrateCart` exported as a named function rather than inlined into the `persist` config — keeps the migration directly unit-addressable without rehydration plumbing.
- The notice banner reuses the `BrowseErrorBanner` layout (`rounded-card`, flex row, min-h-40px button) but with neutral `border`/`surface` tokens instead of destructive tints — a stale checkout link is informational, not an error, and `role="status"` (not `role="alert"`) matches.
- `plan-card.tsx`'s cart-add previously spread 3 empty-string timestamp fields onto the plan to satisfy the `MockPlan`-typed cart; after the rename the cart accepts `Plan` (timestamps optional), so the spread was removed and the comment updated.

## Deviations from Plan

None — plan executed exactly as written. The locale-file edits were briefly applied via a JSON re-serialization script that reformatted unrelated compact objects; that was reverted and replaced with targeted text inserts so the diff stays minimal (no behavior or content change, just diff hygiene).

## Verification

- `npx vitest run src/stores/__tests__/cart.test.ts` — 3/3 green (Task 1)
- `npx tsc --noEmit` — clean (the CONTEXT-locked `MockPlan`->`Plan` rename gate)
- `npx vitest run src/lib/checkout src/lib/currency src/stores` — 68/68 green
- `npm test` — 267 passed | 46 todo (up from the 264 baseline; the 3 new cart tests)
- `npm run build` — succeeds
- `grep -rln "MockPlan" src/` — only `src/lib/mock-data/plans.ts` + `src/lib/db/destinations.ts` (comment)

### Manual-only (record in VERIFICATION.md)

- `npm run dev`; open `/en/checkout?plan=00000000-0000-0000-0000-000000000000` — confirm redirect to `/en/browse?notice=plan-unavailable` with a dismissable notice.
- Seed a v0 `esim-panda-cart` localStorage payload, reload — confirm the cart is silently empty.

## Self-Check: PASSED

- `src/stores/__tests__/cart.test.ts` — FOUND
- `src/stores/cart.ts` (`version: 2` + `migrateCart`) — FOUND
- `src/lib/db/destinations.ts` (`synced_at?` on `Plan`) — FOUND
- `src/app/[locale]/checkout/page.tsx` (`getPlanById`, `notice=plan-unavailable`) — FOUND
- `src/components/browse/browse-client.tsx` (`notice` prop + banner) — FOUND
- `browse.planUnavailableNotice` key — FOUND in all 6 locale files
- Commits `b3dc20e`, `9607652`, `b974381` — all FOUND

## Next Phase Readiness

- Phase 12 is complete (both plans done). The payment path — `pricing.ts`, the 3 `api/checkout` routes, and `checkout/page.tsx` — is fully cut to Supabase reads; the cart is versioned and self-purging; the `MockPlan` type rename is finished.
- Phase 13 can now delete `src/lib/mock-data/plans.ts` (and the other mock-data files) — no production code references `MockPlan` as a type any longer; only `mock-data/plans.ts` itself and the pure helper `getDiscountPercent` (imported by `db/destinations.ts`) still depend on that file.

---
*Phase: 12-checkout-pricing-and-coupon-cutover*
*Completed: 2026-05-17*
