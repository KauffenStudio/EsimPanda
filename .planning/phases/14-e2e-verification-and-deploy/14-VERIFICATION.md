---
phase: 14-e2e-verification-and-deploy
verified: 2026-05-17T22:40:00Z
status: human_needed
score: 8/8 must-haves verified (automated); 2 items require human execution
re_verification: false
human_verification:
  - test: "Run `npm run test:e2e` once against an environment with NEXT_PUBLIC_STRIPE_MOCK=false and live keys (Stripe test, Celitech, Supabase, Resend, ESIM_ENCRYPTION_KEY)"
    expected: "Playwright reports 1 test passed; success page shows a QR; Supabase orders row status advanced; esims row has ICCID + encrypted activation columns; Resend delivery email arrives at e2e+ver01@esimpanda.co"
    why_human: "VER-01 makes a real Celitech purchase at real cost and sends a real Resend email — cannot be run in CI or by an automated verifier"
  - test: "After the v1.1 production deploy, open the live site on a returning device that has the old esim-panda-v1 SW cached"
    expected: "The 'New version available' banner appears once; tapping Reload reloads the page once and shows fresh content; tapping Dismiss hides the banner with the old version continuing to serve"
    why_human: "Requires a real returning-user SW state (v1 SW cached in a real browser); cannot be simulated in jsdom or Playwright without a full SW lifecycle"
  - test: "Verify the esim-panda-v2 cache takes effect in the iOS Capacitor app via TestFlight"
    expected: "WKWebView picks up the bumped cache and serves fresh v1.1 content (no stale pre-cutover bundle)"
    why_human: "WKWebView service-worker edge cases require a physical device + TestFlight build — identified as a carried-over STATE.md blocker"
---

# Phase 14: E2E Verification and Deploy — Verification Report

**Phase Goal:** The service worker cache is bumped to `esim-panda-v2` with a user-controlled "new version available" banner; a Playwright E2E test verifies the real purchase pipeline; the deploy is prepared (runbook documented, production push left manual).
**Verified:** 2026-05-17T22:40:00Z
**Status:** human_needed — all automated gates green; 3 items require human execution per the VER-01 manual-run nuance documented in 14-CONTEXT.md and 14-VALIDATION.md
**Re-verification:** No — initial verification

---

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | CACHE_NAME is `esim-panda-v2`; no `esim-panda-v1` references remain | VERIFIED | `public/sw.js` line 2: `const CACHE_NAME = 'esim-panda-v2';`; grep for `esim-panda-v1` returns 0 matches |
| 2 | `QR_CACHE_NAME = 'esim-qr-data'` unchanged — offline QR codes survive the bump | VERIFIED | `public/sw.js` line 3: `const QR_CACHE_NAME = 'esim-qr-data';` present and unmodified |
| 3 | Install handler has no unconditional `self.skipWaiting()`; a `SKIP_WAITING` message branch exists | VERIFIED | Install handler (lines 15-20) has only a comment; message listener line 139: `if (event.data?.type === 'SKIP_WAITING') { self.skipWaiting(); }` |
| 4 | `SwRegister` component registers the SW, detects a waiting worker, renders `UpdateBanner`, posts `SKIP_WAITING` on Reload, reloads on `controllerchange` | VERIFIED | `src/components/pwa/sw-register.tsx` (59 lines): Case A + B waiting detection, `refreshing` guard, `handleReload` posts `SKIP_WAITING`, `controllerchange` handler reloads once |
| 5 | `UpdateBanner` is dismissable, has a Reload button, does not import BambuVideo; mounted in `[locale]/layout.tsx` | VERIFIED | `update-banner.tsx` (51 lines): X + RefreshCw icons, onReload/onDismiss props; no BambuVideo; `[locale]/layout.tsx` line 43: `<SwRegister />` inside NextIntlClientProvider next to `<OfflineIndicator />` |
| 6 | `update_heading`, `update_body`, `update_cta` present in all 6 locale files; inline SW `<script>` removed from root `layout.tsx` | VERIFIED | Node check confirms all 6 locales (en, pt, es, fr, ja, zh); root `layout.tsx` has no `swRegistrationScript`; `darkModeHydrationScript` retained |
| 7 | VER-01 E2E infrastructure is complete: `@playwright/test` installed, `playwright.config.ts` correct, `e2e/purchase.spec.ts` well-formed, `test:e2e` script present, `e2e/**` excluded from Vitest | VERIFIED | `npx playwright --version` → 1.60.0; `npx playwright test --list` → 1 test discovered; `playwright.config.ts`: testDir `./e2e`, workers: 1, retries: 0; `e2e/purchase.spec.ts` 149 lines with frameLocator, 90s timeout, test card 4242; vitest.config.ts has `exclude: ['e2e/**', ...]`; `npm test` output has no `purchase.spec` reference |
| 8 | No production deploy was executed; deploy runbook documents env-var delta, same-deploy SW requirement, manual push, post-deploy checklist | VERIFIED | Last commit is `efff440 docs(14-02)` — no `vercel --prod`; `DEPLOY-RUNBOOK.md` (117 lines) covers all 4 required sections |

**Automated Score:** 8/8 truths verified

---

## Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `public/sw.js` | CACHE_NAME v2; no install skipWaiting; SKIP_WAITING message branch | VERIFIED | 176 lines; all three conditions confirmed |
| `src/components/pwa/sw-register.tsx` | 'use client'; SW registration + update detection + controllerchange reload | VERIFIED | 59 lines (min 35 required); wired into `[locale]/layout.tsx` |
| `src/components/pwa/update-banner.tsx` | Dismissable banner; Reload + Dismiss; no BambuVideo | VERIFIED | 51 lines (min 30 required); correct props and design tokens |
| `src/components/pwa/__tests__/update-banner.test.ts` | 3 unit tests: render, Reload, Dismiss | VERIFIED | 45 lines (min 20 required); 3/3 pass in `npm test` (276 total) |
| `.planning/phases/14-e2e-verification-and-deploy/DEPLOY-RUNBOOK.md` | 4 sections: env delta, same-deploy gate, manual push, post-deploy checklist | VERIFIED | 117 lines (min 30 required); all 4 sections present |
| `playwright.config.ts` | testDir ./e2e; workers 1; retries 0; generous timeouts | VERIFIED | Matches plan spec exactly; `testDir: './e2e'`, `workers: 1`, `retries: 0`, `timeout: 150_000`, `expect.timeout: 15_000` |
| `e2e/purchase.spec.ts` | VER-01 real purchase: browse → cheapest plan → Stripe test card → success QR | VERIFIED | 149 lines (min 30 required); runtime cheapest-plan selection; frameLocator for Stripe iframe; 90s QR/ready timeout; manual-only header comment |
| `package.json` | @playwright/test devDependency + test:e2e script | VERIFIED | `"@playwright/test": "^1.60.0"` in devDependencies; `"test:e2e": "playwright test"` in scripts |
| `vitest.config.ts` | `exclude: ['e2e/**']` | VERIFIED | `exclude: ['e2e/**', 'node_modules/**', 'dist/**', '.next/**']` present |

---

## Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `update-banner.tsx` | `sw-register.tsx` | `onReload` prop posts `SKIP_WAITING` | VERIFIED | `sw-register.tsx` line 48: `waitingWorker?.postMessage({ type: 'SKIP_WAITING' })`; `update-banner.tsx` renders the button with `onClick={onReload}` |
| `sw-register.tsx` | `public/sw.js` | `postMessage({type:'SKIP_WAITING'})` → message listener calls `self.skipWaiting()` | VERIFIED | `sw-register.tsx` posts the message; `sw.js` line 139-141: SKIP_WAITING branch calls `self.skipWaiting()` |
| `src/app/[locale]/layout.tsx` | `sw-register.tsx` | `<SwRegister />` inside NextIntlClientProvider | VERIFIED | `[locale]/layout.tsx` lines 11 + 43: imports and mounts `<SwRegister />` inside `<NextIntlClientProvider>` |
| `package.json test:e2e` | `playwright.config.ts` | `playwright test` reads `testDir: './e2e'` | VERIFIED | `npx playwright test --list` discovers 1 test in `purchase.spec.ts` |
| `vitest.config.ts exclude` | `e2e/purchase.spec.ts` | `e2e/**` glob keeps spec out of Vitest run | VERIFIED | `npx vitest run` output contains no `purchase.spec` reference; 276 passed / 43 todo |

---

## Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|-------------|--------|----------|
| INF-12 | 14-01-PLAN.md | Service worker CACHE_NAME bumped to esim-panda-v2; cutover deploy gated on this change | SATISFIED | `public/sw.js` line 2: `const CACHE_NAME = 'esim-panda-v2'`; no v1 references; DEPLOY-RUNBOOK.md §2 documents the same-deploy requirement |
| UXD-08 | 14-01-PLAN.md | User returning after the v1.1 deploy sees a "New version available" prompt and loads fresh content | SATISFIED (automated); HUMAN for real-device test | Infrastructure fully wired: UpdateBanner + SwRegister + SKIP_WAITING handshake; actual banner appearance on a returning device requires human post-deploy verification |
| VER-01 | 14-02-PLAN.md | End-to-end test: Stripe test-card purchase → real eSIM ICCID via Celitech → encrypted activation data → real Resend email | SATISFIED (infrastructure); HUMAN for actual run | All E2E infrastructure is complete and correct; the actual `npm run test:e2e` run is a documented manual operator step per 14-CONTEXT.md and 14-VALIDATION.md |

All 3 Phase 14 requirements have complete implementation evidence. VER-01 infrastructure verification is automated-green; the actual pipeline run is the manual artifact.

---

## Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| None found | — | — | — | — |

No TODO/FIXME/placeholder comments, no empty implementations, no return null stubs, no console.log-only handlers in any phase 14 file. The `update-banner.tsx`, `sw-register.tsx`, and `e2e/purchase.spec.ts` are all substantive implementations.

---

## Automated Phase Gates

All required automated gates confirmed green:

| Gate | Result |
|------|--------|
| `npm test` | 276 passed / 43 todo — no regression (baseline was 273) |
| `npx tsc --noEmit` | Clean — no output |
| `npm run build` | Succeeds — static pages rendered, no missing i18n key errors |
| `npx playwright --version` | 1.60.0 |
| `npx playwright test --list` | 1 test discovered: `purchase.spec.ts:30 > completes a real purchase and provisions an eSIM` |
| `grep esim-panda-v2 public/sw.js` | Match found |
| `grep esim-panda-v1 public/sw.js` | 0 matches |
| `grep SKIP_WAITING public/sw.js` | Match at line 139 |
| `grep -q swRegistrationScript src/app/layout.tsx` | Not found (correct — inline script removed) |
| `grep -q SwRegister src/app/[locale]/layout.tsx` | Found at line 43 |
| `grep -q BambuVideo src/components/pwa/update-banner.tsx` | Not found (correct) |
| All 6 locale `pwa.update_*` keys | Present in en, pt, es, fr, ja, zh |
| `npm test` output — purchase.spec reference | None (e2e/** exclude works) |

---

## Human Verification Required

### 1. VER-01 Real Purchase E2E Run

**Test:** Run `npm run test:e2e` against a live-integrations environment:
- App running with `NEXT_PUBLIC_STRIPE_MOCK=false`
- Live keys: Stripe test mode, Celitech, Supabase, Resend, `ESIM_ENCRYPTION_KEY`
- Either: `E2E_BASE_URL=<vercel-preview-url>` or local dev with `.env.local`

**Expected:**
- Playwright reports 1 test passed (green report)
- Success page shows the eSIM QR code
- Supabase: `orders` row status advanced; `esims` row has ICCID + encrypted activation columns
- Resend delivery email arrives at `e2e+ver01@esimpanda.co`

**Why human:** This test makes a real Celitech purchase at real cost and sends a real Resend email. It must never run in CI or be triggered by an automated verifier. The resulting green Playwright report + provisioned eSIM ICCID is the accepted VER-01 verification artifact.

---

### 2. "New Version Available" Banner — Returning Device Test

**Test:** After the v1.1 production deploy, open the live site on a device or browser that has the old `esim-panda-v1` SW cached.

**Expected:**
- The "New version available" banner appears once (not on first install, only on update)
- Tapping Reload reloads the page exactly once and shows fresh v1.1 content (no reload loop)
- Tapping Dismiss hides the banner; the current version keeps serving; the new SW activates naturally on next app close/reopen

**Why human:** Requires a real returning-user SW state — a browser that previously cached the v1 SW. Cannot be simulated in jsdom (no real SW lifecycle) or by Playwright without a complex multi-page-load SW state setup.

---

### 3. iOS Capacitor App — TestFlight Cache Verification

**Test:** Verify via TestFlight that the bumped `esim-panda-v2` cache takes effect in the iOS Capacitor app (WKWebView).

**Expected:** The app serves fresh v1.1 content; no stale pre-cutover bundle is served.

**Why human:** WKWebView has documented service-worker edge cases that differ from desktop Chrome. Requires a physical iOS device + TestFlight build. Identified as a carried-over blocker in STATE.md.

---

## Summary

Phase 14 has achieved its goal. All implementation is substantive and fully wired:

- **INF-12 (SW cache bump):** `public/sw.js` has `CACHE_NAME = 'esim-panda-v2'`, no v1 references, no install-time `skipWaiting()`, and a working `SKIP_WAITING` message branch. The activate handler auto-evicts the v1 cache. `QR_CACHE_NAME` is unchanged.

- **UXD-08 (update banner):** The complete SW update handshake is implemented and wired — `SwRegister` detects waiting workers (both Case A and Case B), `UpdateBanner` renders a dismissable prompt, Reload posts `SKIP_WAITING`, `controllerchange` reloads the page once. The component is mounted inside `NextIntlClientProvider` in `[locale]/layout.tsx`. The inline SW registration script is removed from root `layout.tsx`. All 6 locales have `update_heading`, `update_body`, `update_cta`. The 3 unit tests pass. The build succeeds.

- **VER-01 (E2E infrastructure):** `@playwright/test@1.60.0` is installed, `playwright.config.ts` is correct at repo root, `e2e/purchase.spec.ts` is a well-formed 149-line real-purchase black-box test (runtime cheapest-plan selection, frameLocator for Stripe iframe, 90s timeout on QR assertion), `test:e2e` script is separate from `test`, and `vitest.config.ts` correctly excludes `e2e/**`. The spec is discoverable via `npx playwright test --list`. The actual real-purchase run is intentionally a manual operator step.

- **Deploy runbook:** `DEPLOY-RUNBOOK.md` covers all 4 required sections: env-var delta (remove `NEXT_PUBLIC_WHATSAPP_NUMBER`, confirm all v1.1 vars, `NEXT_PUBLIC_STRIPE_MOCK=false`), same-deploy SW requirement, manual `vercel --prod` step (documented, not executed), and a post-deploy verification checklist.

The phase is ready to hand off to the operator for the 3 human verification steps listed above.

---

_Verified: 2026-05-17T22:40:00Z_
_Verifier: Claude (gsd-verifier)_
