---
phase: 11-read-layer-module-and-browse-cutover
plan: 01
subsystem: database
tags: [next-rsc, supabase, server-only, vitest, catalog, isr]

# Dependency graph
requires:
  - phase: 10-schema-and-curation-backfill
    provides: "destinations table with popularity_rank + region_bucket columns (69 curated rows); fully populated plans table"
provides:
  - "src/lib/db/destinations.ts — typed server-only catalog read module (listActiveDestinations, listPlansForDestination, getDestinationBySlug, getPlanById, getCatalog)"
  - "Canonical Destination / Plan / CatalogDestination / Catalog TypeScript interfaces"
  - "browse/page.tsx as an async RSC fetching the catalog via getCatalog()"
  - "src/components/browse/browse-client.tsx — prop-driven client boundary owning search + region grouping + comparison"
  - "src/lib/__test-fixtures__/catalog.ts — stable catalog fixtures decoupled from mock-data"
affects: [11-02, 11-03, 12-checkout-and-pricing-cutover]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Hybrid RSC: server component fetches data, passes props to a 'use client' child"
    - "server-only read module mirroring src/lib/db/orders.ts (named async fns, [] / null on error, never throw)"
    - "getCatalog runs the destinations query inline to surface a precise error flag"

key-files:
  created:
    - src/lib/db/destinations.ts
    - src/lib/db/__tests__/destinations.test.ts
    - src/lib/__test-fixtures__/catalog.ts
    - src/components/browse/browse-client.tsx
    - src/test-stubs/server-only.ts
  modified:
    - src/app/[locale]/browse/page.tsx
    - src/components/browse/regional-plan-card.tsx
    - src/components/browse/destination-card.tsx
    - vitest.config.ts

key-decisions:
  - "getCatalog runs its destinations query inline (not via listActiveDestinations) so Catalog.error reflects a precise destinations-query failure"
  - "Aliased the server-only package to a test stub in vitest.config.ts — Vite cannot resolve Next's bundled server-only package"
  - "Deleted the stale destination-grid/regional-plan-card test files rather than leaving a broken suite; 11-02 recreates them as Wave 0 prop-driven tests"
  - "Widened DestinationCard/RegionalCard imageUrl to string|null with a guarded next/image to unblock the build; the typographic fallback card is 11-02's job"

patterns-established:
  - "Hybrid RSC + <BrowseClient>: page.tsx is async, fetches getCatalog(), renders a 'use client' child with data as props — no client-side catalog fetch"
  - "In-memory search via useMemo over props (no Supabase round-trip per keystroke)"
  - "Region grouping keys off region_bucket, not the Celitech region classifier"

requirements-completed: [INF-07, INF-08, CAT-05, CAT-06]

# Metrics
duration: 6min
completed: 2026-05-17
---

# Phase 11 Plan 01: Read-Layer Module and Browse RSC Cutover Summary

**Typed server-only catalog read module (`getCatalog`) with curation filtering + pricing enrichment, and the browse page converted from a `'use client'` page into an async RSC feeding a prop-driven `<BrowseClient>`.**

## Performance

- **Duration:** 6 min
- **Started:** 2026-05-17T08:47:38Z
- **Completed:** 2026-05-17T08:53:16Z
- **Tasks:** 2
- **Files modified:** 9 (5 created, 4 modified; 4 deleted)

## Accomplishments

- Created `src/lib/db/destinations.ts` — a `server-only` read module mirroring `orders.ts`: 5 typed async functions + 4 canonical interfaces (`Destination`, `Plan`, `CatalogDestination`, `Catalog`). `getCatalog()` filters uncurated Celitech rows (CAT-05), partitions regional heroes vs country cards, batches one plans query to enrich per-destination `startingPriceCents` / `bestDiscountPercent`, and surfaces an `error` flag for the future UXD-06 banner.
- Converted `browse/page.tsx` into an async RSC with `export const revalidate = 3600` — fetches the catalog server-side via `getCatalog()` and renders `<BrowseClient>` with `{ destinations, regionalPlans, error }` props.
- Created `browse-client.tsx` — the `'use client'` boundary: a prop-driven port of the old `destination-grid` body with in-memory `useMemo` search, region grouping by `region_bucket`, region pills, Framer Motion, and comparison. No Supabase call, no `useDestinations()`, no `BambuVideo`.
- Added a 7-test Wave 0 suite (`destinations.test.ts`) covering INF-07 query shapes, null-on-empty behavior, CAT-05 filtering, regional/country partition, pricing enrichment, and the error flag — plus shared catalog fixtures decoupled from `mock-data/`.
- Deleted `use-destinations.ts` and `destination-grid.tsx` (both replaced).

## Task Commits

1. **Task 1: Create server-only catalog read module + Wave 0 tests** — `561e397` (feat)
2. **Task 2: Convert browse page to async RSC + create BrowseClient boundary** — `82f968e` (feat)

_Note: Task 1 was TDD — the module and the 7-test suite landed in a single commit since the implementation was authored from the verbatim RESEARCH §Pattern 1 sketch and the tests went green on the first full run after the server-only alias fix._

## Files Created/Modified

- `src/lib/db/destinations.ts` — Typed server-only catalog read module (5 functions, 4 interfaces)
- `src/lib/db/__tests__/destinations.test.ts` — 7 Wave 0 unit tests (INF-07, CAT-05, UXD-06 support)
- `src/lib/__test-fixtures__/catalog.ts` — Stable `CatalogDestination[]` / `Plan[]` fixtures decoupled from mock-data
- `src/components/browse/browse-client.tsx` — `'use client'` boundary: search, region grouping, comparison (prop-driven)
- `src/test-stubs/server-only.ts` — Empty stub aliased for `server-only` in tests
- `src/app/[locale]/browse/page.tsx` — Now an async RSC with `revalidate`, calls `getCatalog()`, renders `<BrowseClient>`
- `src/components/browse/regional-plan-card.tsx` — Takes a `regionalPlans` prop instead of `useDestinations()`; `CatalogDestination` typed
- `src/components/browse/destination-card.tsx` — `imageUrl` widened to `string | null` with guarded `next/image`
- `vitest.config.ts` — Added a `server-only` → test-stub resolve alias
- **Deleted:** `src/hooks/use-destinations.ts`, `src/components/browse/destination-grid.tsx`, `src/components/browse/__tests__/destination-grid.test.tsx`, `src/components/browse/__tests__/regional-plan-card.test.tsx`

## Decisions Made

- **`getCatalog` runs its destinations query inline** rather than delegating to `listActiveDestinations`, so `Catalog.error` can distinguish a destinations-query failure from a genuinely empty catalog (RESEARCH recommended this; needed for the 11-02 UXD-06 banner).
- **`server-only` aliased to a test stub** — Next's `server-only` package is bundled at build time and is not resolvable by Vite/Vitest. The real `npm run build` still enforces the client-import guard.
- **`revalidate = 3600`** — matched `esim/[slug]/page.tsx` (RESEARCH default).

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] `server-only` import unresolvable in Vitest**
- **Found during:** Task 1 (running `destinations.test.ts`)
- **Issue:** `import 'server-only'` at the top of `destinations.ts` failed Vite's import analysis — the `server-only` package ships with Next.js as a build-time guard and is not installed/resolvable for unit tests, so all 7 tests errored.
- **Fix:** Added `src/test-stubs/server-only.ts` (empty module) and a `'server-only'` → stub resolve alias in `vitest.config.ts`. The genuine build-time guard is unaffected — `npm run build` resolves the real package.
- **Files modified:** `src/test-stubs/server-only.ts` (created), `vitest.config.ts`
- **Verification:** All 7 `destinations.test.ts` tests pass; `npm run build` still succeeds.
- **Committed in:** `561e397` (Task 1 commit)

**2. [Rule 3 - Blocking] `DestinationCard.imageUrl` typed `string` rejects `CatalogDestination.image_url`**
- **Found during:** Task 2 (`npm run build`)
- **Issue:** `CatalogDestination.image_url` is `string | null`, but `DestinationCard`/`RegionalCard` typed `imageUrl` as `string` and passed it directly to `next/image` `src` — a TypeScript build error.
- **Fix:** Widened the prop to `string | null` in both cards and guarded the `next/image` render with `{imageUrl && (...)}`. The full typographic-fallback card is explicitly 11-02's scope — a clearly-marked `11-02` comment flags the placeholder.
- **Files modified:** `src/components/browse/destination-card.tsx`, `src/components/browse/regional-plan-card.tsx`
- **Verification:** `npm run build` succeeds.
- **Committed in:** `82f968e` (Task 2 commit)

**3. [Rule 3 - Blocking] Stale browse test files import deleted/changed components**
- **Found during:** Task 2 (after deleting `destination-grid.tsx` and `use-destinations.ts`)
- **Issue:** `destination-grid.test.tsx` imports `../destination-grid` (deleted) and `regional-plan-card.test.tsx` renders `<RegionalPlanCard />` with no props (now requires a `regionalPlans` prop) — both would fail the suite.
- **Fix:** Deleted both stale test files. The plan (Pitfall 6 / Open Question Pattern 2) explicitly schedules their replacements — `browse-client.test.tsx` and a migrated prop-driven `regional-plan-card.test.tsx` — as Wave 0 work in 11-02.
- **Files modified:** deleted `destination-grid.test.tsx`, `regional-plan-card.test.tsx`
- **Verification:** `npm test` green — 241 passed (above the 239 pre-Phase-11 baseline).
- **Committed in:** `82f968e` (Task 2 commit)

---

**Total deviations:** 3 auto-fixed (3 blocking)
**Impact on plan:** All three were anticipated by the plan/RESEARCH (server-only test handling, the null-image build ripple, and the Pitfall 6 test cascade). No scope creep — the typographic fallback and the recreated tests remain 11-02 work.

## Issues Encountered

- The pre-Phase-11 baseline was recorded as 239 passing tests. After this plan: 241 passing (+7 new `destinations.test.ts`, −5 from the two deleted stale test files). The full suite stays green and the count did not drop below baseline.

## User Setup Required

None - no external service configuration required. `.env.local` already has working Supabase credentials.

## Next Phase Readiness

- The canonical `Destination` / `Plan` / `CatalogDestination` / `Catalog` types are exported and ready for 11-02 (card components + states) and 11-03 (comparison store `Plan[]` migration).
- `<BrowseClient>` carries an `error` prop and a clearly-marked `{/* 11-02: error banner renders here when error === true */}` placeholder for 11-02 to wire the UXD-06 banner + Retry server action.
- `destination-card.tsx` and `regional-plan-card.tsx` have guarded `null`-image paths flagged for 11-02 to replace with the shared typographic fallback card.
- `getPlanById` is exported and ready for Phase 12 checkout reuse.
- Phase gate met: `npm test` green (241 passed) + `npm run build` succeeds.

## Self-Check: PASSED

All created files verified on disk (`destinations.ts`, `destinations.test.ts`, `catalog.ts`, `browse-client.tsx`, `server-only.ts`). Both deleted files confirmed gone (`use-destinations.ts`, `destination-grid.tsx`). Both task commits verified in git history (`561e397`, `82f968e`).

---
*Phase: 11-read-layer-module-and-browse-cutover*
*Completed: 2026-05-17*
