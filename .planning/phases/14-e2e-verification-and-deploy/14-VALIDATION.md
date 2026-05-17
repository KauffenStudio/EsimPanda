---
phase: 14
slug: e2e-verification-and-deploy
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-05-17
---

# Phase 14 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Unit framework** | Vitest 4.1.4 (jsdom) — existing |
| **E2E framework** | `@playwright/test@1.60.0` — NEW, must be installed (only the bare `playwright` lib is present) |
| **Unit config** | `vitest.config.ts` — add `exclude: ['e2e/**', ...]` so `npm test` never runs the E2E |
| **E2E config** | `playwright.config.ts` — NEW, repo root |
| **Quick run command** | `npm test` (unit only — fast, no real money) |
| **E2E command** | `npm run test:e2e` — MANUAL only, never in `npm test` or CI |
| **Type/build gate** | `npx tsc --noEmit` + `npm run build` |

---

## Sampling Rate

- **After every task commit:** `npm test` (unit) + `npx tsc --noEmit`
- **After every plan:** `npm run build` + `npm test` + `npm run lint`
- **Phase gate:** full unit suite green + `npm run build` green + the `CACHE_NAME` grep gate passes; THEN one manual `npm run test:e2e` run is the VER-01 verification artifact
- **Max feedback latency:** ~30s (the build) for automated gates; the E2E is a separate manual run

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 14-01-* | 01 | 1 | INF-12 | grep gate | `grep -q "esim-panda-v2" public/sw.js && grep -q "esim-qr-data" public/sw.js` | ✅ (sw.js modified) | ⬜ pending |
| 14-01-* | 01 | 1 | INF-12 | build/tsc | `npm run build && npx tsc --noEmit` succeed after the SW change | ✅ | ⬜ pending |
| 14-01-* | 01 | 1 | UXD-08 | unit | `npx vitest run src/components/pwa/__tests__/update-banner.test.ts` — banner renders, Reload posts `SKIP_WAITING`, dismiss hides it | ❌ W0 | ⬜ pending |
| 14-01-* | 01 | 1 | UXD-08 | unit/build | `update_*` i18n keys present in all 6 locales — a missing key fails `npm run build`'s static render | ✅ | ⬜ pending |
| 14-01-* | 01 | 1 | UXD-08 | unit | `npm test` — no regression in existing PWA component tests (`install-banner`, `offline-indicator`) | ✅ | ⬜ pending |
| 14-02-* | 02 | 1 | VER-01 | E2E (manual) | `npm run test:e2e` — real purchase → real Celitech eSIM → success page renders the QR | ❌ W0 | ⬜ pending |
| 14-02-* | 02 | 1 | VER-01 | unit-glob check | `npm test` does NOT pick up `e2e/*.spec.ts` (`vitest.config.ts` excludes `e2e/**`) | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## What is automated vs the E2E itself

**Automated (every commit / CI-safe):**
- `CACHE_NAME` grep (`esim-panda-v2` present, `esim-qr-data` preserved)
- `npx tsc --noEmit` clean; `npm run build` succeeds; `npm run lint` clean
- `update-banner.test.ts` unit test (render / Reload-posts-SKIP_WAITING / dismiss)
- `npm test` no-regression vs the pre-phase baseline (273)
- `e2e/**` excluded from the Vitest glob

**The VER-01 E2E — manual, NOT in `npm test` / CI:**
- `npm run test:e2e` is run once by hand. It spends real money (a real Celitech eSIM) and sends a real Resend email — it must never be wired into `npm test` or per-push CI.
- The run itself — producing a real eSIM ICCID + a green Playwright report — IS the accepted VER-01 proof. There is no test-of-the-test.
- Must run with `NEXT_PUBLIC_STRIPE_MOCK=false` — mock mode skips the webhook/Celitech/email entirely. Provisioning is async (the delivery page polls up to ~60s) → the QR assertion needs a ≥90s timeout.

---

## Wave 0 Requirements

- [ ] `npm install -D @playwright/test@1.60.0` + `npx playwright install chromium` — the test runner is NOT installed (only the bare `playwright` lib)
- [ ] `playwright.config.ts` — NEW at repo root (`testDir: './e2e'`, baseURL, webServer-or-external-URL)
- [ ] `e2e/purchase.spec.ts` — NEW; the VER-01 purchase test
- [ ] `package.json` `test:e2e` script — NEW
- [ ] `vitest.config.ts` — add `exclude: ['e2e/**']` so `npm test` ignores the Playwright spec
- [ ] `src/components/pwa/__tests__/update-banner.test.ts` — NEW unit test for the update banner
- [ ] Confirm a 6-locale `update_*` i18n key set is added; build catches a missing key

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Real purchase pipeline end-to-end | VER-01 | Spends real money + sends real email — cannot be CI-automated | Run `npm run test:e2e` once against a real-integrations environment (`NEXT_PUBLIC_STRIPE_MOCK=false`); confirm the Playwright report is green and the success page shows a QR |
| `orders` + `esims` rows correct | VER-01 | DB side-effect check | After the E2E, query Supabase: the `orders` row status advanced, the `esims` row has an ICCID + encrypted activation columns |
| Resend delivery email received | VER-01 | Inbox check | Confirm the delivery email arrived at the test inbox used by the E2E |
| "New version available" banner appears once on a returning device | UXD-08 | Needs a real returning-user SW state | After deploy, load the site on a device with the old SW cached; confirm the banner shows once, Reload loads fresh content, dismiss works |
| iOS Capacitor WKWebView picks up the bumped cache | INF-12 | WKWebView SW edge cases need a device | Verify via TestFlight that the `esim-panda-v2` cache takes effect (STATE.md carried-over blocker) |

---

## Validation Sign-Off

- [ ] All automated tasks have an `<automated>` verify command or a Wave 0 dependency
- [ ] The VER-01 E2E is correctly quarantined from `npm test` / CI (`vitest.config.ts` excludes `e2e/**`)
- [ ] No watch-mode flags
- [ ] `npm run build` + the `CACHE_NAME` grep gate are part of the phase gate
- [ ] Deploy runbook produced (Vercel env delta, same-deploy SW requirement, manual push step, post-deploy checklist)
- [ ] `nyquist_compliant: true` set after the executor passes the automated map + the one manual E2E run

**Approval:** pending
