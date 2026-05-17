---
phase: 14
plan: 01
subsystem: pwa-deploy-readiness
tags: [service-worker, pwa, i18n, deploy]
requires:
  - "public/sw.js (existing hand-written SW)"
  - "src/components/pwa/install-banner.tsx (banner pattern to mirror)"
  - "next-intl provider in [locale]/layout.tsx"
provides:
  - "esim-panda-v2 SW cache (auto-evicts v1 on next activation)"
  - "user-controlled SW update flow (waiting worker + SKIP_WAITING handshake)"
  - "UpdateBanner component (dismissable new-version prompt)"
  - "SwRegister client component (SW registration + update detection)"
  - "update_* i18n keys in all 6 locales"
  - "DEPLOY-RUNBOOK.md (v1.1 production deploy procedure)"
affects:
  - "public/sw.js"
  - "src/app/layout.tsx"
  - "src/app/[locale]/layout.tsx"
  - "messages/*.json"
tech-stack:
  added: []
  patterns:
    - "waiting-SW + SKIP_WAITING message + controllerchange reload (canonical web.dev pattern)"
    - "SW registration promoted from inline <script> to a 'use client' component"
key-files:
  created:
    - "src/components/pwa/sw-register.tsx"
    - "src/components/pwa/update-banner.tsx"
    - "src/components/pwa/__tests__/update-banner.test.ts"
    - ".planning/phases/14-e2e-verification-and-deploy/DEPLOY-RUNBOOK.md"
  modified:
    - "public/sw.js"
    - "src/app/layout.tsx"
    - "src/app/[locale]/layout.tsx"
    - "messages/en.json"
    - "messages/pt.json"
    - "messages/es.json"
    - "messages/fr.json"
    - "messages/ja.json"
    - "messages/zh.json"
decisions:
  - "TDD test + implementation committed together as the GREEN commit (RED verified failing first, then GREEN)"
  - "Inline SW-registration script fully replaced by SwRegister component; dark-mode hydration script left untouched"
metrics:
  duration: "~6min"
  completed: "2026-05-17"
  tasks: 3
  files: 13
---

# Phase 14 Plan 01: PWA Deploy Readiness Summary

User-controlled service-worker update flow plus the v1.1 deploy runbook: the SW cache is bumped to `esim-panda-v2` so returning users stop serving stale pre-cutover bundles, and a dismissable "New version available" banner replaces the old surprise auto-reload.

## What Was Built

**Task 1 — `public/sw.js` reconciliation (INF-12 + UXD-08)**
- `CACHE_NAME` bumped `esim-panda-v1` → `esim-panda-v2`. The existing `activate` handler already filters `caches.keys()` against `CACHE_NAME`/`QR_CACHE_NAME`, so the bump auto-evicts the v1 cache on next activation — no new code needed there.
- `QR_CACHE_NAME` (`esim-qr-data`) left unchanged — offline QR codes survive the bump.
- The unconditional `self.skipWaiting()` was removed from the `install` handler. The new SW now enters the `waiting` state instead of silently auto-activating.
- A `SKIP_WAITING` branch was added to the existing `message` listener (alongside `CACHE_QR` / `REFRESH_CACHE`) — `self.skipWaiting()` now fires only on explicit user request.

**Task 2 — UpdateBanner + SwRegister + i18n (UXD-08)**
- `update-banner.tsx`: a dismissable banner mirroring `install-banner.tsx` design tokens (`bg-accent-soft`, `rounded-card`, `rounded-button`, `h-11`). Uses `lucide-react` `X` + `RefreshCw`. Notably does NOT import `BambuVideo` — the Bambu pose system was removed in Phase 13.1.
- `sw-register.tsx`: a `'use client'` component that registers `/sw.js`, detects a waiting worker (both Case A — already waiting at load — and Case B — `updatefound` while the page is open), posts `SKIP_WAITING` on Reload, and reloads the page once on `controllerchange` (with a `refreshing` guard against double reload).
- The inline `swRegistrationScript` was deleted from root `layout.tsx`; the `darkModeHydrationScript` was left untouched. `<SwRegister />` is mounted inside `NextIntlClientProvider` in `[locale]/layout.tsx` next to `<OfflineIndicator />` so `useTranslations` resolves.
- `update_heading` / `update_body` / `update_cta` keys added to the `pwa` namespace in all 6 locale files (en, pt, es, fr, ja, zh).
- `update-banner.test.ts`: 3 unit tests (renders heading/body, Reload calls `onReload`, Dismiss calls `onDismiss`).

**Task 3 — DEPLOY-RUNBOOK.md**
- A markdown runbook in the phase dir covering: the Vercel env-var delta (remove `NEXT_PUBLIC_WHATSAPP_NUMBER`, confirm all v1.1 vars + `NEXT_PUBLIC_STRIPE_MOCK=false`), the same-deploy SW requirement, the manual production-push step (documented, not executed), and a post-deploy verification checklist.

## How It Works

The canonical web.dev SW-update handshake:
1. A new `sw.js` deploys → the browser installs it; with `skipWaiting()` gone, it enters `waiting` (old SW still controls the page).
2. `SwRegister` detects the waiting worker (`registration.waiting` at load, or `updatefound` → `statechange === 'installed'` with a live `navigator.serviceWorker.controller` — the controller check distinguishes an update from a first install).
3. `UpdateBanner` renders. User taps Reload → `waitingWorker.postMessage({type:'SKIP_WAITING'})`.
4. `sw.js`'s `message` listener calls `self.skipWaiting()` → the waiting SW activates → `controllerchange` fires.
5. `SwRegister`'s one-time `controllerchange` handler reloads the page → fresh content.
6. Dismiss instead → banner hides; old SW keeps serving; the new SW activates naturally on the next app close/reopen.

## Verification

- `npx tsc --noEmit` — clean
- `npm run build` — succeeds
- `npm test` — 276 passed (≥273 baseline), 43 todo
- `npx vitest run src/components/pwa/__tests__/update-banner.test.ts` — 3/3 green
- CACHE_NAME grep gate: `esim-panda-v2` present, `esim-panda-v1` absent, `esim-qr-data` preserved, `SKIP_WAITING` present, install handler has no `skipWaiting`
- i18n: `update_heading`/`update_body`/`update_cta` present in all 6 locales
- `swRegistrationScript` absent from `layout.tsx`; `darkModeHydrationScript` kept; `SwRegister` mounted in `[locale]/layout.tsx`; no `BambuVideo` in `update-banner.tsx`

## Deviations from Plan

None — plan executed exactly as written.

## Notes for Downstream

- The "banner appears once on a returning device" and "iOS Capacitor WKWebView picks up the bumped cache" behaviors are manual-only verifications (no automated test possible) — they are post-deploy checklist items in DEPLOY-RUNBOOK.md.
- The `esim-panda-v2` bump MUST ship in the same deploy as the v1.1 code cutover (documented in the runbook §2).

## Self-Check: PASSED

All created files exist on disk; all 3 task commits (6c46acc, 2f26449, 641b41d) present in git history.
