---
phase: 13
plan: 01
subsystem: catalog-data-layer
tags: [cleanup, mock-deletion, eslint-gate, supabase-cutover, pure-helpers]
requires:
  - "src/lib/db/destinations.ts read layer (Phase 11): listActiveDestinations, getDestinationBySlug, listPlansForDestination"
provides:
  - "src/lib/plans/pricing-display.ts — pure pricing/display helpers (getOriginalPrice, getDiscountPercent, tagPlans)"
  - "ESLint no-restricted-imports gate banning the 3 deleted mock-data modules"
affects:
  - "src/app/sitemap.ts — now async, reads live Supabase"
  - "src/app/[locale]/esim/[slug]/page.tsx — now a Supabase RSC"
  - "src/lib/db/destinations.ts — pure-helper import repointed"
tech-stack:
  added: []
  patterns:
    - "Pure compute module: zero imports, no I/O — safe to import from RSC/client/anywhere"
    - "ESLint flat-config no-restricted-imports as a permanent regression gate"
key-files:
  created:
    - src/lib/plans/pricing-display.ts
    - src/lib/plans/__tests__/pricing-display.test.ts
  modified:
    - src/app/sitemap.ts
    - src/app/[locale]/esim/[slug]/page.tsx
    - src/components/checkout/quick-checkout-bar.tsx
    - src/components/browse/plan-card.tsx
    - src/lib/db/destinations.ts
    - eslint.config.mjs
  deleted:
    - src/hooks/use-plans.ts
    - src/lib/mock-data/destinations.ts
    - src/lib/mock-data/plans.ts
    - src/lib/mock-data/tag-plans.ts
    - src/lib/mock-data/__tests__/tag-plans.test.ts
decisions:
  - "getBestDiscount dropped, not migrated — reads the mockPlans global, zero live importers, db/destinations.ts already computes bestDiscountPercent inline"
  - "use-plans.ts deleted outright — grep confirmed zero usePlans callers post Phase 11 cutover"
  - "Destination.image_url is string|null; coerced to '' at the buildDestinationMeta call site rather than widening the meta-template param"
metrics:
  duration: ~6min
  tasks: 4
  files: 11
  completed: 2026-05-17
---

# Phase 13 Plan 01: Mock-Data Deletion & Pricing-Helper Extraction Summary

Deleted the three deprecated mock-data modules (`destinations.ts`, `plans.ts`, `tag-plans.ts`) after extracting their pure-compute helpers into a real module `src/lib/plans/pricing-display.ts`, cutting the last two production routes still on mock arrays (`sitemap.ts`, `esim/[slug]/page.tsx`) over to the live Supabase read layer, and adding an ESLint `no-restricted-imports` gate that permanently blocks reintroduction of the deleted modules — completing the v1.1 live-data cutover (INF-11).

## What Was Built

- **`src/lib/plans/pricing-display.ts`** — a pure module (zero imports, no I/O) exporting `getOriginalPrice`, `getDiscountPercent`, and a generic `tagPlans<T extends PlanLike>`. Functions copied verbatim from `mock-data/plans.ts` / `tag-plans.ts`; `tagPlans`'s generic constraint narrowed to a local `PlanLike` interface.
- **`src/lib/plans/__tests__/pricing-display.test.ts`** — 11 cases: the 5 migrated `tagPlans` cases (bestValue, mostPopular, empty, single-plan, no-double-badge) plus 6 new `getOriginalPrice`/`getDiscountPercent` math cases (1GB→0, .99-rounding, ~20%/~30% discount tiers).
- **`sitemap.ts`** — converted to `async`, now reads `listActiveDestinations()` from Supabase instead of filtering `mockDestinations`.
- **`esim/[slug]/page.tsx`** — RSC cut to Supabase: `generateStaticParams` async over `listActiveDestinations()`; `generateMetadata` + `DestinationPage` use `getDestinationBySlug` + `listPlansForDestination`; starting price computed inline as `Math.min(retail_price_cents)` over plan rows.
- **`eslint.config.mjs`** — `no-restricted-imports` rule banning `@/lib/mock-data/{destinations,plans,tag-plans}` (both aliased and relative `**/` glob forms); the 4 kept mock files stay importable.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] `Destination.image_url` nullability mismatch in SEO meta**
- **Found during:** Task 2 (tsc after repointing `esim/[slug]/page.tsx`)
- **Issue:** The live `Destination` type has `image_url: string | null` (NULL for uncurated/typographic-fallback rows), but `buildDestinationMeta` requires `imageUrl: string`. The old mock `Destination` carried a non-null `image_url`, so the mismatch only surfaced after the Supabase cutover.
- **Fix:** Coerced at the call site — `imageUrl: destination.image_url ?? ''` — rather than widening the meta-template param.
- **Files modified:** `src/app/[locale]/esim/[slug]/page.tsx`
- **Commit:** f09f1e6

## Deferred Issues

**Full-suite `npm test` / `tsc` / `npm run build` gate blocked by parallel plan 13-02 (cross-plan race).**
13-01 ran in parallel with 13-02 (WhatsApp removal). The 13-02 agent deleted `src/lib/config/support.ts` but had not yet finished repointing its three error-state components off that import, leaving 3 `TS2307` errors and one failing Vitest suite — all in 13-02-owned files (`payment-error.tsx`, `provisioning-error.tsx`, `setup-guide.tsx`, `delivery-page.test.tsx`). **Zero errors trace to any 13-01 file.** 13-01's own surface is fully green: `pricing-display.test.ts` 11/11, `npm run lint` exits 0 (the new rule fires zero violations), `mock-data/{destinations,plans,tag-plans}` import grep returns 0, `tsc` clean excluding the `config/support` errors. Logged to `deferred-items.md`; the full `npm test` + `npm run build` phase-merge gate must be re-run by the orchestrator once 13-02 is also merged.

## Verification Results

- `npx vitest run src/lib/plans/__tests__/pricing-display.test.ts` — 11/11 pass
- `npx tsc --noEmit` — clean for all 13-01 files (only 13-02's `config/support` errors remain)
- `npm run lint` — exits 0; the new `no-restricted-imports` rule fires zero violations (proves all 8 importers repointed)
- `grep -rn "mock-data/destinations\|mock-data/plans\|mock-data/tag-plans" src/` — 0 hits
- `ls src/lib/mock-data/` — exactly `checkout.ts coupons.ts dashboard.ts delivery.ts` (4 kept files survive)
- `npm run build` — deferred to phase-merge gate (blocked by in-flight 13-02; not a 13-01 defect)

## Self-Check: PASSED

- FOUND: src/lib/plans/pricing-display.ts
- FOUND: src/lib/plans/__tests__/pricing-display.test.ts
- FOUND: eslint.config.mjs (no-restricted-imports rule present)
- DELETED (confirmed absent): src/lib/mock-data/{destinations,plans,tag-plans}.ts, __tests__/tag-plans.test.ts, src/hooks/use-plans.ts
- FOUND commit de87094: feat(13-01) add pure pricing-display module
- FOUND commit f09f1e6: refactor(13-01) repoint 8 mock-data importers
- FOUND commit 59f0740: chore(13-01) delete mock-data modules + ESLint gate
