---
phase: 11-read-layer-module-and-browse-cutover
plan: 03
subsystem: ui
tags: [zustand, comparison, browse, mock-data-cutover, vitest]

# Dependency graph
requires:
  - phase: 11-read-layer-module-and-browse-cutover
    plan: 01
    provides: "Canonical Plan type exported from src/lib/db/destinations.ts; fixturePlans test fixtures"
provides:
  - "useComparisonStore holding selectedPlans: Plan[] instead of selectedPlanIds: string[]"
  - "togglePlan(plan: Plan) — adds/removes by id, caps the selection at 3"
  - "comparison-sheet / comparison-bar / plan-card consuming stored Plan objects (no mock-data global-array lookup)"
affects: [12-checkout-and-pricing-cutover]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Comparison state carries full Plan objects — the comparison sheet needs no per-id lookup against a global array (which no longer exists post-cutover)"
    - "Phase-11 bridge: PlanCard keeps its flat-props API and reconstructs a minimal Plan inline for togglePlan; the esim/[slug] full prop-shape cutover stays Phase 12"

key-files:
  created: []
  modified:
    - src/stores/comparison.ts
    - src/stores/__tests__/comparison.test.ts
    - src/components/browse/comparison-sheet.tsx
    - src/components/browse/comparison-bar.tsx
    - src/components/browse/plan-card.tsx

key-decisions:
  - "comparison.ts stays plain create() — no storage middleware (confirmed by RESEARCH); comparison selections are intentionally in-memory, so no version/migrate function is needed"
  - "PlanCard keeps its flat-props API (RESEARCH Open Question 3, lower-blast-radius path) — a single plan: Plan prop would ripple into esim/[slug] which stays on mock data until Phase 12; instead PlanCard reconstructs a minimal Plan from its flat props"
  - "plan-card's cart add (handleCardClick) builds a MockPlan inline from the flat props rather than mockPlans.find() — removes the global-array lookup without changing the still-MockPlan-typed cart store (Phase 12/13 territory)"

requirements-completed: [CAT-06]

# Metrics
duration: 4min
completed: 2026-05-17
---

# Phase 11 Plan 03: Comparison Store Plan[] Migration Summary

**`useComparisonStore` migrated from `selectedPlanIds: string[]` to `selectedPlans: Plan[]`, so the comparison sheet and bar render stored `Plan` objects directly — eliminating the `mockPlans.find()` global-array lookup the comparison flow relied on, the last mock-data dependency on the browse comparison path.**

## Performance

- **Duration:** 4 min
- **Started:** 2026-05-17T09:34:00Z
- **Completed:** 2026-05-17T09:38:51Z
- **Tasks:** 2
- **Files modified:** 5 (0 created, 5 modified)

## Accomplishments

- **Store migration (Task 1, TDD):** Rewrote `src/stores/comparison.ts` — `selectedPlans: Plan[]` replaces `selectedPlanIds: string[]`; `togglePlan(plan: Plan)` adds/removes by `plan.id` and caps the selection at 3; `clearSelection`/`openSheet`/`closeSheet` behave identically. `Plan` is imported type-only from `@/lib/db/destinations`. The store stays plain `create()` — no storage middleware (RESEARCH-confirmed), so no version/migrate function.
- **Store test rewrite:** `comparison.test.ts` rewritten for the `Plan[]` shape — 6 reducer tests (initial state, add, toggle-off, cap-at-3, clearSelection, openSheet/closeSheet). Imports `fixturePlans` from the 11-01 catalog fixtures plus one inline 4th `Plan` for the cap-at-3 case. Followed RED→GREEN: the rewritten test failed 3/6 against the old store, then passed 6/6 after the store migration.
- **Comparison sheet (Task 2):** Deleted the `selectedPlanIds.map((id) => mockPlans.find(...))` mapping and the `@/lib/mock-data/plans` import. The sheet now iterates `selectedPlans` directly — they ARE `Plan` objects — reading `plan.name`/`plan.data_gb`/`plan.duration_days`/`plan.retail_price_cents` straight off each. Dropped the now-unnecessary `!` non-null assertions and `.filter(Boolean)`.
- **Comparison bar:** Renamed every `selectedPlanIds` reference to `selectedPlans`; the `.length >= 2` gate and count display read identically.
- **Plan card:** Comparison checkbox checked-state is now `selectedPlans.some((p) => p.id === id)` and the handler calls `togglePlan(plan)` with a reconstructed `Plan` object. `PlanCard` keeps its existing flat-props API; the minimal `Plan` is built inline from the flat props with safe defaults for the fields comparison display does not read.

## Task Commits

1. **Task 1: Migrate comparison store to Plan[] + rewrite store test** — `633c498` (feat)
2. **Task 2: Consume stored Plan objects in comparison-sheet/bar/plan-card** — `d1b87df` (feat)

## Files Created/Modified

- `src/stores/comparison.ts` — `selectedPlans: Plan[]` store; `togglePlan(plan: Plan)` add/remove-by-id, cap at 3
- `src/stores/__tests__/comparison.test.ts` — Rewritten 6-test suite for the `Plan[]` shape
- `src/components/browse/comparison-sheet.tsx` — Renders `selectedPlans` directly; `mockPlans.find()` mapping + mock-data import removed
- `src/components/browse/comparison-bar.tsx` — Reads `selectedPlans.length`
- `src/components/browse/plan-card.tsx` — Comparison checkbox toggles with a reconstructed `Plan`; cart add builds a `MockPlan` inline

## Decisions Made

- **No storage middleware in `comparison.ts`** — the store stays a plain `create()`. RESEARCH confirmed comparison selections are intentionally in-memory and reset on reload, so no version bump / migrate function is needed (unlike the persisted cart store).
- **`PlanCard` keeps its flat-props API** — RESEARCH Open Question 3's lower-blast-radius path. Converting `PlanCard` to a single `plan: Plan` prop would ripple a shape change into `esim/[slug]/page.tsx`, which stays on mock data until Phase 12. Instead `PlanCard` reconstructs a minimal `Plan` inline from the flat props it already receives. A code comment flags this as a Phase-11 bridge.
- **`plan-card`'s cart add builds a `MockPlan` inline** — the cart store (`cart.ts`) is still `MockPlan`-typed (Phase 12/13 cutover). Rather than a `mockPlans.find()` global-array lookup, `handleCardClick` spreads the reconstructed `Plan` plus the three `MockPlan`-only timestamp fields. This removes the global-array dependency without changing the cart store's type — staying inside the Phase 11 scope boundary.

## Deviations from Plan

### Acceptance-criterion heuristic mismatch (not a code defect)

- The Task 2 acceptance check `grep -rn "mockPlans\|mock-data/plans\|mock-data/destinations" ... plan-card.tsx returns 0` expects zero matches in `plan-card.tsx`. One match remains: the import of the **pure pricing-display helpers** `getOriginalPrice` / `getDiscountPercent` from `@/lib/mock-data/plans`. These are no-I/O compute functions, not a data lookup. Their extraction to `src/lib/plans/pricing-display.ts` is explicitly **Phase 13 (INF-11)** — `src/lib/db/destinations.ts` (created in 11-01) carries the identical import with the identical "do not extract here, Phase 13" boundary comment, so a peer component keeping it is consistent with the established phase boundary. The substantive intent of the criterion — removing the `mockPlans` **global-array lookup** from the comparison flow — is fully satisfied: no `mockPlans.find()` remains in any of the three files, and `comparison-sheet.tsx` / `comparison-bar.tsx` have zero `mock-data` references. The pricing-helper import is flagged with a clear Phase-13 boundary comment in `plan-card.tsx`.

**No code defects.** All other Task 2 greps pass: `selectedPlanIds` returns 0 across all three files, `selectedPlans` is present in `comparison-bar.tsx`, `togglePlan` is present in `plan-card.tsx`.

## Issues Encountered

- None. RED→GREEN went exactly as planned; the build and full suite were green on the first run after Task 2.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- The browse comparison path no longer performs any `mockPlans` global-array lookup — `comparison-sheet` and `comparison-bar` are fully mock-data-free. With the browse RSC cutover (11-01/11-02) this means the entire browse path is off the global mock array.
- Two known Phase-12/13 follow-ups are flagged in-code: (1) the hardcoded `€` symbol in the comparison-sheet Price/Price-GB rows — currency correction is Phase 12 (CHK-07); (2) `plan-card`'s reconstructed-`MockPlan` cart bridge and the `mock-data/plans` pricing-helper import — both resolve when the cart store and pricing helpers move off mock data in Phase 12/13 (INF-11).
- Phase gate met: `npm test` green at **256 passed** (above the 255 post-11-02 / 239 pre-Phase-11 baselines) and `npm run build` succeeds.

## Self-Check: PASSED

All 5 modified files verified present on disk. Both task commits (`633c498`, `d1b87df`) verified in git history. `grep` checks: `selectedPlanIds` returns 0 across the store, test, and three components; no `mockPlans.find()` lookup remains; `selectedPlans` present in `comparison.ts`/`comparison-bar.tsx`; `togglePlan` present in `plan-card.tsx`.

---
*Phase: 11-read-layer-module-and-browse-cutover*
*Completed: 2026-05-17*
