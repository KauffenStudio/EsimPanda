---
phase: 11-read-layer-module-and-browse-cutover
plan: 02
subsystem: ui
tags: [browse, next-intl, motion, skeleton, error-boundary, rsc-loading, a11y]

# Dependency graph
requires:
  - phase: 11-read-layer-module-and-browse-cutover
    plan: 01
    provides: "CatalogDestination/Catalog types, async browse RSC, prop-driven BrowseClient with error prop + 11-02 placeholders"
provides:
  - "DestinationGridSkeleton / DestinationCardSkeleton — shimmer placeholder grid matching real card dimensions"
  - "browse/loading.tsx — route-level skeleton during the RSC/ISR-miss window"
  - "BrowseErrorBanner — inline role=alert error banner with accent Retry button"
  - "browse/actions.ts — refetchCatalogAction server action wrapping getCatalog"
  - "TypographicFallbackCard — shared brand-gradient image-fallback primitive"
  - "DestinationCard / RegionalPlanCard — CatalogDestination-driven cards with motion.img photo cross-fade + typographic fallback"
  - "BrowseClient — fully wired four-state grid (loading / error / search-miss / populated)"
  - "3 new browse i18n keys across all 6 locales + reworded browse.noResults"
affects: [11-03, 12-checkout-and-pricing-cutover]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Typographic image-fallback: shared primitive rendered as the always-on base layer, photo cross-fades over it (no flicker on 404)"
    - "motion.img blur cross-fade gated by useReducedMotion() — reduced-motion renders the photo instantly"
    - "Retry recovery via a server action (refetchCatalogAction) re-running getCatalog, not router.refresh()"
    - "forwardRef on DestinationSearch so the search-miss Clear button can return focus to the input"

key-files:
  created:
    - src/components/browse/destination-card-skeleton.tsx
    - src/components/browse/browse-error-banner.tsx
    - src/components/browse/typographic-fallback-card.tsx
    - src/app/[locale]/browse/loading.tsx
    - src/app/[locale]/browse/actions.ts
    - src/components/browse/__tests__/destination-card-skeleton.test.tsx
    - src/components/browse/__tests__/destination-card.test.tsx
    - src/components/browse/__tests__/browse-client.test.tsx
    - src/components/browse/__tests__/regional-plan-card.test.tsx
  modified:
    - src/components/browse/destination-card.tsx
    - src/components/browse/regional-plan-card.tsx
    - src/components/browse/browse-client.tsx
    - src/components/browse/destination-search.tsx
    - messages/en.json
    - messages/pt.json
    - messages/es.json
    - messages/fr.json
    - messages/ja.json
    - messages/zh.json

key-decisions:
  - "Typographic fallback built as a dedicated shared component (typographic-fallback-card.tsx) so DestinationCard + RegionalPlanCard never duplicate the gradient JSX — UI-SPEC mandate 'build it once'"
  - "Typographic card is the always-mounted base layer; the photo motion.img cross-fades OVER it — eliminates flicker if a photo URL 404s"
  - "RegionalPlanCard now reads startingPriceCents/bestDiscountPercent straight off the CatalogDestination prop, dropping all mock-data pricing helper calls (getStartingPrice/getOriginalPrice/getDiscountPercent/getPlansForDestination)"

requirements-completed: [CAT-07, UXD-05, UXD-06, UXD-07, CAT-06]

# Metrics
duration: 30min
completed: 2026-05-17
---

# Phase 11 Plan 02: Browse Card Adaptation and Grid States Summary

**The four browse-grid UX states — shimmer skeleton, inline `role="alert"` error banner with a working `getCatalog()` Retry, search-miss empty state with a focus-returning Clear-search, and the typographic image-fallback card with a reduced-motion-safe `motion.img` blur cross-fade — all built per the APPROVED 11-UI-SPEC.**

## Performance

- **Duration:** 30 min
- **Started:** 2026-05-17T09:01:54Z
- **Completed:** 2026-05-17T09:32:22Z
- **Tasks:** 2
- **Files modified:** 19 (9 created, 10 modified)

## Accomplishments

- **Shimmer skeleton (UXD-05):** `DestinationCardSkeleton` / `DestinationGridSkeleton` reuse the exact `animate-[pulse_1.5s_ease-in-out_infinite] bg-gray-200 dark:bg-gray-700` pulse string from `checkout-skeleton.tsx`. The placeholder card matches the real `DestinationCard` footprint (`rounded-card` + `aspect-[4/3]` + same border) and the grid uses the verbatim country-grid class string, so the data-swap causes zero layout shift. `browse/loading.tsx` renders a 12-card skeleton + a title placeholder during the RSC/ISR-miss window. The skeleton container carries `aria-hidden="true"`.
- **Inline error banner (UXD-06):** `BrowseErrorBanner` is a `role="alert"` destructive-tinted banner with an accent-fill Retry button (Retry is a constructive recovery action — accent, not destructive). `refetchCatalogAction` (`'use server'`) re-runs the full `getCatalog()` fetch; `BrowseClient` holds the catalog in local state and swaps in the fresh result on Retry — never `router.refresh()`. Page chrome stays mounted in the error state.
- **Typographic fallback card (CAT-07):** A shared `TypographicFallbackCard` primitive — bold white destination name on the `bg-gradient-to-br from-accent to-primary` brand gradient — rendered once and consumed by both `DestinationCard` and `RegionalPlanCard` for their null-`image_url` paths. No `<img>`, no flag, no placeholder graphic when an image is missing.
- **Photo cross-fade (UXD-07):** When `image_url` is present, a `motion.img` blur-cross-fades in (`opacity 0→1`, `blur(12px)→blur(0)`, 400ms `easeOut`) over the always-mounted typographic base layer. Gated by `useReducedMotion()` — reduced-motion renders the photo instantly. The `group-hover:scale-105` zoom is preserved.
- **Search-miss state (CAT-06):** Non-empty query with zero matches shows a centered plain-text message + an accent Clear-search button that resets the filter and returns focus to the search input (via a forwarded ref on `DestinationSearch`). The old `noResultsSuggestion` row was removed.
- **i18n:** Added `browse.error.{retry,message}`, `browse.clearSearch`, `browse.noPlans` to all 6 locale files and reworded `browse.noResults` to `No destinations match "{query}"` across all 6.
- **Tests:** Added `destination-card-skeleton.test.tsx` (4), `destination-card.test.tsx` (3), `browse-client.test.tsx` (3) and migrated `regional-plan-card.test.tsx` (4) to prop-driven fixtures — +14 tests total.
- **Card behavior:** Dropped the auto-add-to-cart-on-click (RESEARCH Open Question 2) — `DestinationCard.handleClick` is now navigation-only.

## Task Commits

1. **Task 1: i18n keys + skeleton + loading.tsx + error banner + Retry server action** — `facc7f2` (feat)
2. **Task 2: Typographic fallback card + photo cross-fade; wire error/search-miss states into BrowseClient** — `e5b0e88` (feat)

## Decisions Made

- **Typographic fallback is its own shared component** (`typographic-fallback-card.tsx`) rather than an inline JSX block — UI-SPEC explicitly mandates "build it once; both `DestinationCard` and `RegionalPlanCard` consume it." This makes the plan's per-file `grep "from-accent to-primary" destination-card.tsx` acceptance heuristic technically miss, but the gradient is unambiguously in `DestinationCard`'s render path via the imported component (see Deviations).
- **Photo over an always-mounted typographic base layer** — the typographic card never unmounts; the `motion.img` is layered on top. This is the no-flicker guarantee if a photo URL 404s.
- **RegionalPlanCard fully dropped mock-data pricing helpers** — it now reads `startingPriceCents` / `bestDiscountPercent` directly off its `CatalogDestination` prop. The `getOriginalPrice` / strikethrough-price treatment was removed since `CatalogDestination` does not carry an original price; the regional card shows `from {price}` + the discount badge, consistent with the country cards.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] `DestinationSearch` could not return focus / sync after an external clear**
- **Found during:** Task 2 (wiring the search-miss Clear-search button)
- **Issue:** `DestinationSearch` exposed no ref to its `<input>`, so the UI-SPEC accessibility requirement "after Clear-search resets the filter, focus returns to the search input" was unsatisfiable. Additionally its `localValue` is component-local state decoupled from the store, so resetting only the store query would leave a stale value in the input box.
- **Fix:** Converted `DestinationSearch` to `forwardRef<HTMLInputElement>` and forwarded the ref to the `<input>`; added a `useEffect` that syncs `localValue` to `''` when the store `searchQuery` is cleared externally. `BrowseClient` holds a `searchInputRef` and calls `.focus()` after `setSearch('')`.
- **Files modified:** `src/components/browse/destination-search.tsx`, `src/components/browse/browse-client.tsx`
- **Verification:** `browse-client.test.tsx` Clear-search test passes; full suite green.
- **Committed in:** `e5b0e88` (Task 2 commit)

### Acceptance-criterion heuristic mismatch (not a code defect)

- The Task 2 acceptance check `grep -n "from-accent to-primary" src/components/browse/destination-card.tsx` expects ≥1 line in `destination-card.tsx` itself. The gradient lives in the shared `TypographicFallbackCard` component (which `destination-card.tsx` imports and renders) — this is the UI-SPEC's explicit "build it once, do not duplicate the gradient JSX" mandate. The grep heuristic and the shared-primitive mandate are in direct tension; the shared primitive was kept (architecture-correct) and the gradient is verifiably present in `DestinationCard`'s render path. All other Task 2 greps (`motion.img`, `useReducedMotion`, `refetchCatalogAction`, no `noResultsSuggestion`, no `destination-grid.test.tsx`, no `ilike/textSearch`) pass.

## Issues Encountered

- **Pre-existing `BambuVideo` usage outside scope:** `grep` for mascot poses in `src/components/browse/` finds two `BambuVideo` references in `device-compatibility/device-checker.tsx` — a pre-existing device-compatibility feature unrelated to the browse grid. The UI-SPEC verification scope is specifically the browse grid (`browse-client.tsx` / the former `destination-grid.tsx`), which carries no mascot. App-wide Bambu pose removal is owned by Phase 13.1 (UXD-09). Left untouched per the scope boundary; logged here, not fixed.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- All four browse-grid states ship per the APPROVED 11-UI-SPEC; the visible UX of the live-data cutover is complete.
- `getPlanById` / `CatalogDestination` types remain ready for 11-03 (comparison store `Plan[]` migration) and Phase 12 (checkout cutover).
- Phase gate met: full suite green at **255 passed** (241 after 11-01, +14 new browse tests; well above the 239 pre-Phase-11 baseline) and `npm run build` succeeds.
- Manual verification items for `11-VERIFICATION.md`: photo blur-cross-fade smoothness (UXD-07), skeleton→grid no-layout-shift (UXD-05), error banner placement above the grid (UXD-06), dark-mode gradient-card contrast (CAT-07).

## Self-Check: PASSED

All 9 created files verified on disk. Old `destination-grid.test.tsx` confirmed absent. Both task commits (`facc7f2`, `e5b0e88`) verified in git history.

---
*Phase: 11-read-layer-module-and-browse-cutover*
*Completed: 2026-05-17*
