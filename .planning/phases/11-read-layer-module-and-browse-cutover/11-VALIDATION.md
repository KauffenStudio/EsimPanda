---
phase: 11
slug: read-layer-module-and-browse-cutover
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-05-16
---

# Phase 11 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.1.4 + `@testing-library/react` + jsdom (all already installed) |
| **Config file** | `vitest.config.ts` (root) — `environment: 'jsdom'`, `globals: true`, `setupFiles: ['./src/test-setup.ts']` |
| **Quick run command** | `npx vitest run <single-file>` |
| **Full suite command** | `npm test` (`vitest run`) |
| **Estimated runtime** | ~7s full suite; <1s per single file |

No framework install needed. Phase 11 adds new test files (Wave 0) and rewrites one existing test.

---

## Sampling Rate

- **After every task commit:** Run the single relevant test file (`npx vitest run <file>`)
- **After every plan:** Run `npm test` (full suite) — must stay green, and the **test count must not drop** below the pre-Phase-11 baseline (Pitfall 6). Record the baseline (`npm test` count) before 11-01 starts.
- **Phase gate:** `npm test` green AND `npm run build` succeeds (proves the browse RSC compiles and `import 'server-only'` is not violated by a client import) before `/gsd:verify-work`
- **Max feedback latency:** ~7 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 11-01-* | 01 | 1 | INF-07 | unit | `npx vitest run src/lib/db/__tests__/destinations.test.ts` | ❌ W0 | ⬜ pending |
| 11-01-* | 01 | 1 | CAT-05 | unit | `npx vitest run src/lib/db/__tests__/destinations.test.ts` (asserts uncurated rows excluded by `getCatalog()`) | ❌ W0 | ⬜ pending |
| 11-01-* | 01 | 1 | INF-08 | inspection + build | `npm run build` succeeds; `grep -n "use client" src/app/[locale]/browse/page.tsx` returns 0 | ✅ | ⬜ pending |
| 11-02-* | 02 | 2 | CAT-06 | component | `npx vitest run src/components/browse/__tests__/browse-client.test.tsx` (search filter + Clear-search) | ❌ W0 | ⬜ pending |
| 11-02-* | 02 | 2 | CAT-07 | component | `npx vitest run src/components/browse/__tests__/destination-card.test.tsx` (typographic fallback when `imageUrl` null) | ❌ W0 | ⬜ pending |
| 11-02-* | 02 | 2 | UXD-05 | component | `npx vitest run src/components/browse/__tests__/destination-card-skeleton.test.tsx` | ❌ W0 | ⬜ pending |
| 11-02-* | 02 | 2 | UXD-06 | component | `npx vitest run src/components/browse/__tests__/browse-client.test.tsx` (error banner renders on `error`, Retry invokes `onRetry`) | ❌ W0 | ⬜ pending |
| 11-02-* | 02 | 2 | CAT-06 | component | `npx vitest run src/components/browse/__tests__/regional-plan-card.test.tsx` (migrated to props fixture) | ✅ migrate | ⬜ pending |
| 11-03-* | 03 | 3 | (comparison) | unit | `npx vitest run src/stores/__tests__/comparison.test.ts` (rewritten for `Plan[]`) | ✅ rewrite | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## What is unit-testable vs needs browser verification

**Unit-testable (deterministic — MUST have automated tests):**
- `getCatalog()` filtering (uncurated excluded), regional vs country partition, `startingPriceCents`/`bestDiscountPercent` enrichment
- `listActiveDestinations` query shape (`eq('is_active',true).order('popularity_rank')`)
- `getDestinationBySlug` / `getPlanById` return `null` (not throw) on 0 rows
- In-memory search filter narrowing; `groupByRegion` bucketing by `region_bucket`
- Search-miss: "No destinations match" + Clear-search button; Clear resets the filter
- Typographic fallback conditional (`imageUrl ? <img> : typographic card`)
- Skeleton placeholder card count
- Error-banner conditional render + Retry callback
- Comparison store reducer: add / remove / cap-at-3 / clear

**Browser / inspection only (no automated test — note in VERIFICATION.md):**
- Shimmer animation smoothness (UXD-05 visual)
- Photo blur-cross-fade timing (UXD-07) — `motion.img` opacity/blur transition
- Error-banner visual placement above the grid
- Dark-mode rendering of the typographic gradient card
- No layout shift when skeleton → real grid swaps
- ISR / `loading.tsx` appearance

---

## Wave 0 Requirements

New test files / fixtures to scaffold before or alongside the implementation tasks:

- [ ] `src/lib/db/__tests__/destinations.test.ts` — INF-07, CAT-05; use the `vi.mock('@/lib/supabase/server')` chain pattern from `src/lib/auth/__tests__/order-linking.test.ts`
- [ ] `src/lib/__test-fixtures__/catalog.ts` (optional shared) — stable `CatalogDestination[]` + `Plan[]` fixtures so component tests don't import `mock-data/` (Pitfall 6 decoupling)
- [ ] `src/components/browse/__tests__/browse-client.test.tsx` — CAT-06 + UXD-06; the migrated/renamed `destination-grid.test.tsx`, now passing `destinations` props instead of relying on a mock import
- [ ] `src/components/browse/__tests__/destination-card.test.tsx` — CAT-07 typographic fallback (does not exist today)
- [ ] `src/components/browse/__tests__/destination-card-skeleton.test.tsx` — UXD-05 (does not exist today)
- [ ] REWRITE `src/stores/__tests__/comparison.test.ts` — migrate `selectedPlanIds: string[]` assertions to `selectedPlans: Plan[]` (11-03)
- [ ] MIGRATE `src/components/browse/__tests__/regional-plan-card.test.tsx` — pass a `regionalPlans` fixture prop instead of relying on a mock import
- [ ] No framework install — Vitest + RTL already configured

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Photo blur-cross-fade plays smoothly over the typographic card | UXD-07 | Animation timing/smoothness is not deterministically assertable in jsdom | Run `npm run dev`, open `/en/browse`, watch a card with `image_url` set — confirm the photo fades in over the bold-name card with a brief blur |
| Shimmer skeleton → real grid swap has no layout shift | UXD-05 | Layout-shift / visual smoothness needs a real browser | Throttle network in dev, load `/en/browse`, confirm skeleton cards match real card height and the grid does not jump when data lands |
| Error banner renders above the grid, chrome intact | UXD-06 | Visual placement | In dev, force a Supabase fetch failure (bad URL), confirm an inline banner appears above the grid with a working Retry, header/nav still visible |
| Dark-mode gradient on the typographic fallback card | CAT-07 | Dark-mode visual | Toggle dark mode on `/en/browse`, confirm the typographic fallback card gradient + text contrast read correctly |

---

## Validation Sign-Off

- [ ] All tasks have an `<automated>` verify command or a Wave 0 dependency
- [ ] Sampling continuity: no 3 consecutive tasks without an automated verify
- [ ] Wave 0 covers all MISSING test references
- [ ] No watch-mode flags (`--watch` / `--watchAll`) in any command
- [ ] Feedback latency < 10s
- [ ] `npm run build` is part of the phase gate (RSC / `server-only` compile check)
- [ ] `nyquist_compliant: true` set in frontmatter after executor passes the map

**Approval:** pending
