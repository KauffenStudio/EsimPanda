---
phase: 14-e2e-verification-and-deploy
plan: 02
subsystem: testing
tags: [playwright, e2e, stripe, vitest, ci]

# Dependency graph
requires:
  - phase: 11-12-13 (v1.1 live cutover)
    provides: live browse → esim → checkout → delivery flow the E2E drives
provides:
  - "@playwright/test runner installed (the bare playwright lib alone is not the runner)"
  - "playwright.config.ts at repo root (testDir ./e2e, workers 1, retries 0)"
  - "e2e/purchase.spec.ts — the VER-01 real-purchase black-box test"
  - "test:e2e npm script, quarantined from npm test"
  - "vitest e2e/** exclude so npm test never runs the Playwright spec"
affects: [deploy, verification, post-deploy QA]

# Tech tracking
tech-stack:
  added: ["@playwright/test@1.60.0"]
  patterns:
    - "E2E quarantined from the unit suite via a separate test:e2e script + vitest exclude"
    - "Black-box purchase test: drives the real UI, no hard-coded plan IDs, frameLocator for Stripe iframe"

key-files:
  created:
    - playwright.config.ts
    - e2e/purchase.spec.ts
  modified:
    - package.json
    - package-lock.json
    - vitest.config.ts
    - .gitignore

key-decisions:
  - "Cheapest plan chosen at runtime by parsing rendered card prices — no hard-coded plan ID, resilient to catalog changes"
  - "Checkout reached via the cart flow (PlanCard → cart icon → CartDrawer Checkout) since the destination page has no per-plan Buy CTA"
  - "playwright-report/ + test-results/ added to .gitignore — generated output, never committed"

patterns-established:
  - "Pattern 1: Manual-only E2E — real money / real email tests live behind npm run test:e2e, never in npm test or CI"
  - "Pattern 2: VER-01 spec compiles + is discoverable (playwright test --list) as the automated gate; the actual run is the operator's manual verification artifact"

requirements-completed: [VER-01]

# Metrics
duration: 3min
completed: 2026-05-17
---

# Phase 14 Plan 02: E2E Verification Scaffold Summary

**Playwright `@playwright/test@1.60.0` runner installed with a VER-01 black-box purchase spec that drives the live browse → cheapest-plan → cart → Stripe-test-card → success-QR flow, quarantined from `npm test`.**

## Performance

- **Duration:** 3 min
- **Started:** 2026-05-17T21:29:12Z
- **Completed:** 2026-05-17T21:32:40Z
- **Tasks:** 2
- **Files modified:** 5 (2 created, 3 modified + .gitignore)

## Accomplishments
- Installed the actual Playwright test runner (`@playwright/test@1.60.0`) + chromium browser — the repo previously had only the bare `playwright` automation library, which provides no `test()`/`expect()`/config.
- Created `playwright.config.ts` at repo root: `testDir: './e2e'`, `workers: 1`, `retries: 0` (a real purchase must never auto-retry), 150s test timeout, `webServer` build+start with an `E2E_BASE_URL` override.
- Wrote `e2e/purchase.spec.ts` — the VER-01 black-box test driving the real UI: `/en/browse` → first destination → cheapest plan (price parsed at runtime, no hard-coded ID) → cart → checkout → Stripe `PaymentElement` iframe via `frameLocator` with test card `4242 4242 4242 4242` → success page with a 90s timeout on the async-provisioning "ready"/QR assertion.
- Quarantined the E2E from the unit suite: added a `test:e2e` script separate from `test`, and an `exclude: ['e2e/**', ...]` in `vitest.config.ts` so `npm test` never collects the Playwright spec.

## Task Commits

Each task was committed atomically:

1. **Task 1: Install @playwright/test, scaffold playwright.config.ts, add test:e2e, exclude e2e from Vitest** - `a35fefb` (chore)
2. **Task 2: Write the VER-01 purchase E2E spec** - `031b399` (test)

**Plan metadata:** see final docs commit.

## Files Created/Modified
- `playwright.config.ts` - NEW. Playwright runner config: `testDir ./e2e`, single worker, no retries, generous timeouts, `webServer`-or-`E2E_BASE_URL`.
- `e2e/purchase.spec.ts` - NEW. VER-01 black-box purchase test (149 lines): browse → cheapest plan → cart → checkout → Stripe iframe → success-page QR.
- `package.json` - Added `@playwright/test` devDependency + `test:e2e` script.
- `package-lock.json` - Lockfile updated for the new devDependency.
- `vitest.config.ts` - Added `exclude: ['e2e/**', 'node_modules/**', 'dist/**', '.next/**']`.
- `.gitignore` - Added `/playwright-report`, `/test-results`, `/blob-report`, `/.cache/playwright`.

## Decisions Made
- **Runtime cheapest-plan selection:** the spec reads every PlanCard's rendered price text and clicks the lowest, rather than hard-coding a plan ID — keeps the test a true black-box flow resilient to catalog changes (RESEARCH Open Question 3).
- **Cart-mediated checkout navigation:** the `esim/[slug]` page has no per-plan "Buy" CTA — clicking a `PlanCard` adds to the cart store. The spec therefore opens the cart (`aria-label="Cart"` button) and clicks the `CartDrawer` "Checkout" button to reach `/checkout?plan=<id>`. This was discovered by reading the live components, not assumed.
- **`.gitignore` for Playwright output:** `playwright test --list` materialized a `playwright-report/` dir (HTML reporter scaffold). Added it plus `test-results/` to `.gitignore` as generated output.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Added Playwright output dirs to .gitignore**
- **Found during:** Post-Task-2 untracked-file check
- **Issue:** `npx playwright test --list` generates a `playwright-report/` directory; `playwright test` runs also produce `test-results/`. These are build artifacts that would otherwise be left untracked / accidentally committed.
- **Fix:** Added `/playwright-report`, `/test-results`, `/blob-report`, `/.cache/playwright` to `.gitignore`.
- **Files modified:** `.gitignore`
- **Verification:** `git status --short` no longer lists `playwright-report/`.
- **Committed in:** final docs commit (`.gitignore` was untracked pre-phase).

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** The `.gitignore` entry is hygiene for the new tooling — no scope creep. The plan's `files_modified` did not list `.gitignore` only because the runner's report output was not anticipated.

## Issues Encountered
- The `package.json` `test:e2e` edit initially failed because `npm install` had already rewritten the file between the Read and the Edit. Re-read and re-applied — no impact.
- The `vitest.config.ts` file was modified by a linter between Read and Edit; the exclude edit still applied cleanly on the second attempt.

## Verification Results
- `npx playwright --version` → `1.60.0` (runner installed).
- `npx tsc --noEmit` → clean (config + spec type-check).
- `npx playwright test --list` → discovers 1 test (`purchase.spec.ts:30 › completes a real purchase and provisions an eSIM`).
- `npx vitest run` → 276 passed / 43 todo, 52 files passed — **no `purchase.spec` reference** in output (the `e2e/**` exclude works). 276 > the 273 pre-phase baseline — no regression.
- The actual `npm run test:e2e` run was deliberately NOT executed — it does a real Celitech purchase + real Resend email + real cost. It is the operator's manual VER-01 verification artifact.

## User Setup Required
None for this plan's scope. The manual VER-01 run requires the app running with `NEXT_PUBLIC_STRIPE_MOCK=false` and live keys (Stripe test, Celitech, Supabase, Resend, `ESIM_ENCRYPTION_KEY`) — documented in the spec's file header and the Phase 14 deploy runbook (plan 14-01).

## Next Phase Readiness
- VER-01 E2E infrastructure complete and type-clean; the spec is discoverable via `playwright test --list`.
- Phase gate (this plan's slice): `npm test` green (276 passing, no regression), `npx tsc --noEmit` clean, e2e spec excluded from the unit run — all satisfied.
- Remaining for the phase: the operator runs `npm run test:e2e` once against a live-integrations environment as the VER-01 verification artifact (real eSIM + green Playwright report), per 14-VALIDATION.md.

## Self-Check: PASSED

- FOUND: playwright.config.ts
- FOUND: e2e/purchase.spec.ts
- FOUND: .planning/phases/14-e2e-verification-and-deploy/14-02-SUMMARY.md
- FOUND: commit a35fefb (Task 1)
- FOUND: commit 031b399 (Task 2)

---
*Phase: 14-e2e-verification-and-deploy*
*Completed: 2026-05-17*
