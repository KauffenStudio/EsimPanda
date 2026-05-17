# Phase 14: E2E Verification and Deploy - Context

**Gathered:** 2026-05-17
**Status:** Ready for planning

<domain>
## Phase Boundary

The v1.1 milestone finale. Three pieces:

1. **Service worker cache bump (INF-12)** — `public/sw.js` `CACHE_NAME` goes `esim-panda-v1` → `esim-panda-v2` so returning users and the iOS Capacitor app stop serving the stale pre-cutover bundle.
2. **"New version available" prompt (UXD-08)** — a dismissable banner with a Reload button, shown when the service worker detects a new version.
3. **End-to-end verification (VER-01)** — a Playwright UI test that drives the real purchase flow against live integrations: browse → pick a plan → Stripe test-card checkout → real Celitech eSIM provisioning → Resend delivery email.

Plus deploy preparation — Phase 14 lands all code and documents the production deploy steps, but the actual production push stays a manual user decision.

Out of scope: no new milestone features; v1.2 polish items (POL-*) stay deferred.
</domain>

<decisions>
## Implementation Decisions

### Service worker cache bump (INF-12)
- `public/sw.js`: `CACHE_NAME` `'esim-panda-v1'` → `'esim-panda-v2'`
- The existing `activate` handler already deletes caches whose key ≠ `CACHE_NAME`/`QR_CACHE_NAME` — bumping the constant makes it evict the v1 cache automatically. `QR_CACHE_NAME` (`esim-qr-data`) is unchanged — offline QR codes survive the bump.
- This change MUST ship in the same deploy as the v1.1 code cutover (a separate deploy creates a window where code is new but cache is old).

### "New version available" prompt (UXD-08)
- A **dismissable banner** with a **Reload** button — shown when the service worker registration has a `waiting` worker (a new SW version is ready). User taps Reload to activate + reload; can dismiss to keep using the current version.
- Lives with the other PWA UI in `src/components/pwa/` (alongside `offline-indicator.tsx`, `install-banner.tsx`). Copy goes through `next-intl` (6 locales).
- **Reconcile the existing `self.skipWaiting()`:** `sw.js` currently calls `self.skipWaiting()` unconditionally in `install` — that auto-activates the new SW immediately, which conflicts with a user-controlled Reload banner. Move `skipWaiting` to a message-triggered call: the new SW waits; the banner's Reload button posts a `SKIP_WAITING` message; the SW then calls `skipWaiting()` and the page reloads on `controllerchange`. Research/planning must handle this reconciliation — it is the non-obvious part of UXD-08.

### End-to-end test (VER-01)
- A **Playwright UI test**. Scaffold an `e2e/` directory + `playwright.config.ts` (Playwright `^1.59.1` is already a devDependency; no e2e setup exists yet).
- The test drives a real browser through the real flow: `/browse` → select a (low-cost) plan → checkout → Stripe **test card** `4242 4242 4242 4242` → success page.
- It exercises live integrations end to end: real Stripe (test mode), the real Stripe webhook → `provisionEsim` → a **real Celitech `createPurchaseV2`** call → a real eSIM ICCID → encrypted activation data persisted in Supabase → a real Resend delivery email.
- **Real Celitech purchase accepted:** the test buys the cheapest real Celitech plan once — a real eSIM is provisioned at a small real cost. That eSIM is the accepted VER-01 verification artifact. No Celitech sandbox hunt; the real purchase is the proof.
- **The E2E is NOT part of `npm test`.** It does a real purchase / real email / real money — it must be a separately-invoked Playwright run (its own script, e.g. `npm run test:e2e`), never wired into the unit-test suite or per-push CI.
- Assertions: success page renders the eSIM QR; an `orders` row exists with `status` advanced; the `esims` row has an ICCID + encrypted activation columns; (Resend email delivery is confirmed by the provisioning code path running without error — inbox check is a manual companion step).
- The test runs against an environment with the real integrations wired (a Vercel preview deploy or local dev with `.env.local`) — research determines the cleanest target.

### Deploy scope
- Phase 14 **prepares** the release: all code landed (SW bump, update banner, E2E), all gates green, and a documented deploy runbook — including the Vercel env-var changes (remove `NEXT_PUBLIC_WHATSAPP_NUMBER`; confirm all v1.1 env vars present: Celitech, Stripe, Supabase, Resend, `ESIM_ENCRYPTION_KEY`).
- The **actual production push** (`vercel --prod` / merge-to-main) is a manual user go/no-go decision — an agent does not auto-trigger a real user-visible release.

### Plan file granularity — 2 plans
- `14-01-PLAN.md` — Deploy-readiness: SW `CACHE_NAME` bump + the `skipWaiting` reconciliation + the "new version available" banner component (UXD-08) + i18n × 6 + the Vercel env-var deploy runbook. Requirements: INF-12, UXD-08.
- `14-02-PLAN.md` — E2E verification: scaffold `e2e/` + `playwright.config.ts` + the VER-01 Playwright purchase test + the `test:e2e` script. Requirement: VER-01.
- The two plans are independent (disjoint files) — parallel-capable, unless the planner finds a conflict.

### Claude's Discretion
- Exact banner styling (reuse existing PWA-component + design tokens — plain, dismissable, with a Reload action)
- Exact `playwright.config.ts` shape, the test's target base URL, and how it reads credentials
- Exact assertion list for VER-01 beyond the must-haves above
- The deploy-runbook format (a markdown doc in the phase dir, or a section in the SUMMARY)
- Whether the E2E seeds/cleans its own test data or leaves the one verification order in place (leaving it is acceptable)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### v1.1 milestone research
- `.planning/research/v1.1/SUMMARY.md` — Phase 14 = Wave 4-5; the "SW cache bump in the same deploy as the cutover" rationale
- `.planning/research/v1.1/PITFALLS.md` — Pitfall 5 (PWA stale cache / never-versioned `CACHE_NAME`), Pitfall 12

### Code to modify / create
- `public/sw.js` — `CACHE_NAME` bump + the `skipWaiting` → message-triggered reconciliation
- `src/components/pwa/` — existing PWA UI (`offline-indicator.tsx`, `install-banner.tsx`, `splash-screen.tsx`, `push-permission-modal.tsx`) — the new update banner joins these; check how the SW is registered (likely a `ServiceWorkerRegistration`/provider in this dir or `app/[locale]/layout.tsx`)
- `messages/{en,pt,es,fr,ja,zh}.json` — i18n keys for the update banner
- NEW: `e2e/` directory, `playwright.config.ts`, the VER-01 test, a `test:e2e` script in `package.json`
- `.env.example` — confirm it lists every v1.1 env var; `NEXT_PUBLIC_WHATSAPP_NUMBER` should already be absent (Phase 13)

### Backend the E2E exercises (already built, do not modify)
- `src/app/api/webhooks/stripe/route.ts` — Stripe webhook → `provisionEsim`
- `src/lib/delivery/provision.ts` — eSIM provisioning pipeline
- `src/lib/esim/celitech-adapter.ts` — real Celitech `createPurchaseV2`
- `src/lib/email/send-delivery.ts` — Resend delivery email

### Requirements
- `.planning/REQUIREMENTS.md` — Phase 14 owns INF-12, UXD-08, VER-01

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `public/sw.js` `activate` handler already evicts non-current caches — the `CACHE_NAME` bump is a one-constant change that triggers eviction automatically
- `src/components/pwa/install-banner.tsx` — a dismissable PWA banner already exists; the update banner mirrors its pattern
- `playwright@^1.59.1` already in devDependencies — no install needed, just scaffold config + tests
- `next-intl` for the banner copy

### Established Patterns
- PWA components grouped in `src/components/pwa/`; SW registration wired in the app shell
- The v1.0 SW uses `self.skipWaiting()` in `install` — Phase 14 changes this to a message-triggered skip
- `.env.local` carries the real Celitech / Stripe(test) / Supabase / Resend / `ESIM_ENCRYPTION_KEY` credentials

### Integration Points
- The update banner ↔ `sw.js`: the banner posts `SKIP_WAITING`, the SW listens and calls `skipWaiting()`, the page reloads on `controllerchange`
- The E2E test ↔ the entire live stack: it is a black-box test — it does not modify backend code, only drives the UI and asserts DB/side-effects
- The E2E creates one real `orders` + `esims` row in production Supabase and one real Celitech eSIM — accepted as the verification artifact

</code_context>

<specifics>
## Specific Ideas

- "Prepare everything, I do the final deploy" — Phase 14 must not auto-push to production. It lands code, goes green, and writes the deploy runbook; the human pulls the trigger.
- "Accept one real low-cost eSIM" — the VER-01 test does a genuine Celitech purchase; the real eSIM + small cost is the accepted proof that the live pipeline works.
- The E2E must be quarantined from `npm test` — real money / real email means it is a separate `npm run test:e2e` invocation only.
- The SW update banner is user-controlled (dismissable + Reload), never a surprise auto-reload mid-task.

</specifics>

<deferred>
## Deferred Ideas

- **Celitech sandbox / test-mode integration** — considered; the user chose to accept one real low-cost eSIM instead. If Celitech later exposes a sandbox, a future milestone could route the E2E through it.
- **E2E in CI on every push** — explicitly out: the test does real purchases. It stays a manual `test:e2e` run. A future milestone could add a mocked-integration smoke test for CI.
- **Automated production deploy** — the user keeps the production push manual. Auto-deploy is not in scope.
- **v1.2 polish (POL-01..06)** — Bambu loading-pose threshold, ISR top-12, optimistic render, tab-focus refetch, notify-me, dynamic EUR conversion — all remain deferred to a future milestone.

</deferred>

---

*Phase: 14-e2e-verification-and-deploy*
*Context gathered: 2026-05-17*
