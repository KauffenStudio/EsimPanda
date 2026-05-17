# Phase 14: E2E Verification and Deploy - Research

**Researched:** 2026-05-17
**Domain:** PWA service-worker update lifecycle + Playwright E2E against live integrations
**Confidence:** HIGH

<user_constraints>
## User Constraints (from 14-CONTEXT.md)

### Locked Decisions

**Service worker cache bump (INF-12)**
- `public/sw.js`: `CACHE_NAME` `'esim-panda-v1'` → `'esim-panda-v2'`.
- The existing `activate` handler already deletes caches whose key ≠ `CACHE_NAME`/`QR_CACHE_NAME` — bumping the constant evicts the v1 cache automatically. `QR_CACHE_NAME` (`esim-qr-data`) is unchanged — offline QR codes survive the bump.
- This change MUST ship in the **same deploy** as the v1.1 code cutover.

**"New version available" prompt (UXD-08)**
- A **dismissable banner** with a **Reload** button, shown when the SW registration has a `waiting` worker.
- Lives in `src/components/pwa/` alongside `offline-indicator.tsx`, `install-banner.tsx`. Copy through `next-intl` (6 locales).
- **Reconcile `self.skipWaiting()`:** `sw.js` currently calls `self.skipWaiting()` unconditionally in `install`. Move it to a message-triggered call — the new SW waits; the banner's Reload posts a `SKIP_WAITING` message; the SW calls `skipWaiting()`; the page reloads on `controllerchange`.

**End-to-end test (VER-01)**
- A **Playwright UI test**. Scaffold an `e2e/` directory + `playwright.config.ts`.
- Drives the real flow: `/browse` → select a low-cost plan → checkout → Stripe **test card** `4242 4242 4242 4242` → success page.
- Exercises live integrations: real Stripe (test mode) → webhook → `provisionEsim` → **real Celitech `createPurchaseV2`** → real ICCID → encrypted activation data in Supabase → real Resend email.
- **Real Celitech purchase accepted:** the test buys the cheapest real plan once; the real eSIM is the accepted VER-01 artifact. No sandbox hunt.
- **NOT part of `npm test`.** Real money / real email → a separate `npm run test:e2e` invocation only, never per-push CI.
- Assertions: success page renders the eSIM QR; `orders` row exists with advanced `status`; `esims` row has ICCID + encrypted activation columns; Resend confirmed by the provisioning path running without error (inbox check is a manual companion step).

**Deploy scope**
- Phase 14 **prepares** the release: all code landed, gates green, documented deploy runbook (Vercel env-var changes — remove `NEXT_PUBLIC_WHATSAPP_NUMBER`; confirm Celitech/Stripe/Supabase/Resend/`ESIM_ENCRYPTION_KEY` present).
- The **actual production push** (`vercel --prod` / merge-to-main) is a manual user go/no-go. An agent does not auto-trigger a release.

**Plan granularity — 2 plans**
- `14-01-PLAN.md` — SW `CACHE_NAME` bump + `skipWaiting` reconciliation + update banner (UXD-08) + i18n ×6 + deploy runbook. Requirements: INF-12, UXD-08.
- `14-02-PLAN.md` — Scaffold `e2e/` + `playwright.config.ts` + VER-01 test + `test:e2e` script. Requirement: VER-01.
- Plans are disjoint files — parallel-capable.

### Claude's Discretion
- Exact banner styling (reuse existing PWA-component patterns + design tokens — plain, dismissable, with Reload).
- Exact `playwright.config.ts` shape, the test's target base URL, how it reads credentials.
- Exact assertion list for VER-01 beyond the must-haves.
- Deploy-runbook format (markdown doc in phase dir, or a SUMMARY section).
- Whether the E2E seeds/cleans its own test data or leaves the one verification order (leaving it is acceptable).

### Deferred Ideas (OUT OF SCOPE)
- Celitech sandbox / test-mode integration — user chose one real low-cost eSIM instead.
- E2E in CI on every push — the test does real purchases; stays a manual `test:e2e` run.
- Automated production deploy — production push stays manual.
- v1.2 polish (POL-01..06) — all deferred.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| INF-12 | Service worker `CACHE_NAME` bumped to `esim-panda-v2`; cutover deploy gated on this change | §"SW Cache Bump" — confirms the `activate` handler auto-evicts; one-constant change. §"State of the Art" — verifies `caches.delete` eviction semantics. |
| UXD-08 | Returning user sees a "New version available" prompt and loads fresh content | §"SW Update Flow — Before/After" — the centerpiece. Exact `sw.js` message-listener pattern, the registration `updatefound`/`waiting` detection, the `controllerchange` reload, and the new `update-banner.tsx` skeleton mirroring `install-banner.tsx`. |
| VER-01 | E2E test: Stripe test-card purchase on a real Supabase plan delivers a real Celitech ICCID, persists encrypted activation data, sends a real Resend email | §"Playwright E2E Scaffold" — exact `playwright.config.ts`, `e2e/` layout, `test:e2e` script, Stripe Elements iframe interaction, deterministic vs manual assertions. §"Validation Architecture". |
</phase_requirements>

## Summary

Phase 14 has two genuine implementation unknowns and two near-mechanical changes. The mechanical part is the **`CACHE_NAME` bump** (`'esim-panda-v1'` → `'esim-panda-v2'`) — the `activate` handler in `public/sw.js` already filters `caches.keys()` against `CACHE_NAME` and `QR_CACHE_NAME` and deletes everything else, so bumping the single constant is sufficient to evict the v1 cache on next activation. `QR_CACHE_NAME` (`'esim-qr-data'`) is untouched, so offline QR codes survive.

The first real unknown is the **service-worker update flow (UXD-08)**. `sw.js` currently calls `self.skipWaiting()` unconditionally inside `install`, which means a freshly-installed SW activates immediately and silently — incompatible with a user-controlled Reload banner. The fix is the canonical "waiting SW + SKIP_WAITING message" pattern: remove the unconditional `skipWaiting()`, add a `message` listener that calls `self.skipWaiting()` on `{type:'SKIP_WAITING'}`, and on the client add registration-level `updatefound` detection that surfaces a banner when `registration.waiting` exists, plus a one-time `controllerchange` listener that reloads the page once the new SW takes control. The registration currently lives as a 3-line inline `<script>` in `src/app/layout.tsx` (the root layout, NOT `[locale]/layout.tsx`) — it must be promoted to a real client component so it can hold the detection logic and render the banner.

The second unknown is the **Playwright E2E scaffold (VER-01)**. A critical finding: `playwright@1.59.1` is installed, but `@playwright/test` — the test *runner* that provides `test()`/`expect()`/`playwright.config.ts` — is **not installed**. The `playwright` package alone only exposes the raw automation library. The scaffold must `npm install -D @playwright/test@1.60.0` (matching the current `playwright` minor) and run `npx playwright install chromium`. The test drives `/browse` → cheapest plan → checkout → Stripe `PaymentElement` (an iframe — needs `frameLocator`) → success page, against a running app with live `.env.local` credentials. It must be quarantined from `npm test` via a separate `npm run test:e2e` script; `vitest.config.ts` needs no change for *picking up* `e2e/` (its default glob already excludes most non-`src` paths) but adding an explicit `exclude` for `e2e/**` is a cheap safety belt.

**Primary recommendation:** Plan 14-01 promotes the SW registration to a `src/components/pwa/sw-register.tsx` client component that owns both registration and update-detection and renders a new `update-banner.tsx`; `sw.js` drops the unconditional `skipWaiting` and gains a `SKIP_WAITING` message branch. Plan 14-02 installs `@playwright/test@1.60.0`, scaffolds `playwright.config.ts` with `testDir: './e2e'`, `webServer` pointed at `npm run build && npm run start`, and a single `e2e/purchase.spec.ts` driving the real flow with `frameLocator` for Stripe Elements.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `@playwright/test` | `1.60.0` | E2E test runner — `test()`, `expect()`, `playwright.config.ts`, fixtures | The official Playwright test runner. The bare `playwright` package is the automation library only; the runner is a separate package. Pin to the same minor as the installed `playwright@1.59.1` browser drivers — `1.60.0` is the current release and 1.59↔1.60 are compatible (Playwright keeps runner/library in lockstep within a minor band). |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `playwright` | `1.59.1` (installed) | Browser drivers — already a devDependency | Already present. `@playwright/test` re-exports from it; keep it. Optionally bump to `1.60.0` to match the runner exactly. |
| `dotenv` | n/a — **do NOT add** | Env loading for the config | Not needed. Playwright's `webServer` inherits the parent process env; run the E2E with `.env.local` already exported (Next.js `next start` reads `.env.local` automatically). If the config itself needs a var, `process.env` is enough. |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `@playwright/test` runner | Bare `playwright` + Vitest | Possible but loses auto-waiting assertions, the HTML reporter, trace viewer, and `frameLocator`. Not worth it — `@playwright/test` is the ecosystem default. |
| `webServer` (build+start) | External URL (Vercel preview) | A Vercel preview deploy is a valid target (CONTEXT allows it). But `webServer` against local `next start` is more deterministic and self-contained for a manual run. Recommend `webServer`; allow a `BASE_URL` env override for the preview-deploy case. |
| `webpush`/Workbox SW tooling | Hand-written `sw.js` | Codebase decision (Phase 09): hand-written SW for full control. UXD-08 stays hand-written — do NOT introduce Workbox. |

**Installation:**
```bash
npm install -D @playwright/test@1.60.0
npx playwright install chromium
```

**Version verification (run before writing the plan):**
```bash
npm view @playwright/test version   # confirmed 1.60.0 on 2026-05-17
npm ls playwright                   # confirmed playwright@1.59.1 installed
```
`@playwright/test` is NOT currently in `node_modules` — the scaffold MUST install it. The bare `playwright@1.59.1` devDependency does not provide `test()`/`expect()`.

## Architecture Patterns

### Affected / New Files
```
public/
└── sw.js                          # MODIFY — CACHE_NAME bump + skipWaiting reconciliation
src/
├── app/
│   └── layout.tsx                 # MODIFY — replace inline swRegistrationScript with <SwRegister/>
└── components/pwa/
    ├── sw-register.tsx            # NEW — client component: registers SW + detects update
    ├── update-banner.tsx          # NEW — dismissable "new version" banner (mirrors install-banner.tsx)
    └── __tests__/
        └── update-banner.test.ts  # NEW — unit test (replace it.todo stubs pattern)
messages/
└── {en,pt,es,fr,ja,zh}.json       # MODIFY — add pwa.update_* keys (6 locales)
e2e/                               # NEW directory
└── purchase.spec.ts               # NEW — VER-01 Playwright test
playwright.config.ts               # NEW — Playwright runner config (repo root)
package.json                       # MODIFY — add @playwright/test devDep + test:e2e script
vitest.config.ts                   # MODIFY (optional safety) — exclude e2e/**
```

### Pattern 1: SW registration as a client component, not an inline script
**What:** `src/app/layout.tsx` currently registers the SW via a 3-line inline `<script dangerouslySetInnerHTML>`. An inline script cannot react to `updatefound` events nor render React UI.
**When to use:** Whenever SW lifecycle must drive React state (the update banner).
**Approach:** Create `SwRegister` — a `'use client'` component that, in a `useEffect`, registers `/sw.js`, attaches the `updatefound`/`waiting`/`controllerchange` listeners, holds an `updateAvailable` state, and renders `<UpdateBanner />`. Mount it once in the root `layout.tsx` (or in `[locale]/layout.tsx` next to `OfflineIndicator` — either works; root layout matches where registration lives today). Note: `next-intl`'s `useTranslations` is only available *inside* the `NextIntlClientProvider`, so the **banner** (which needs i18n copy) must render within `[locale]/layout.tsx`'s provider tree. Cleanest split: `SwRegister` (no i18n) stays in root `layout.tsx` doing registration + detection and writes `updateAvailable` to a tiny store or a custom event; `UpdateBanner` (uses `useTranslations('pwa')`) mounts in `[locale]/layout.tsx`. Simpler alternative the planner may prefer: put BOTH registration and banner in one client component mounted in `[locale]/layout.tsx` — registration in a `useEffect` does not need to be SSR'd, so locale-scoped mounting is fine and keeps i18n trivially available. **Recommended: the single-component-in-`[locale]/layout.tsx` approach** — one file, i18n works directly, mirrors how `OfflineIndicator` already lives there.

### Pattern 2: The waiting-SW / SKIP_WAITING handshake (the UXD-08 core)
**What:** Standard MDN/web.dev pattern for a user-controlled SW update.
**Flow:**
1. New `sw.js` deploys. Browser installs it; because the unconditional `skipWaiting()` is removed, it enters the **waiting** state (old SW still controls the page).
2. Client `updatefound` fires → the new worker's `statechange` reaches `installed` while `navigator.serviceWorker.controller` exists → there is a waiting worker → show the banner.
3. User taps Reload → `registration.waiting.postMessage({type:'SKIP_WAITING'})`.
4. `sw.js` `message` listener calls `self.skipWaiting()` → the waiting SW activates → `controllerchange` fires on the client.
5. The one-time `controllerchange` handler calls `window.location.reload()` → page loads fresh content.
6. User dismisses instead → banner hides; old SW keeps serving; the waiting SW activates naturally on the next full app close/reopen.
**Anti-pattern avoided:** Unconditional `install`-time `skipWaiting()` + auto-reload — surprises the user mid-task (CONTEXT explicitly forbids).

### Pattern 3: Stripe Elements in Playwright — iframe handling
**What:** `<PaymentElement>` (from `@stripe/react-stripe-js`, used in `card-payment.tsx`) renders its inputs inside a **cross-origin iframe** served by `js.stripe.com`. Playwright cannot type into iframe fields with a normal `page.locator` — it needs `page.frameLocator`.
**When to use:** Any E2E that fills a Stripe card field.
**Key detail:** With `PaymentElement` (`options={{ layout: 'tabs' }}` in this codebase), Stripe renders **one combined iframe** containing all card fields. The card-number, expiry, and CVC inputs are addressed by Stripe's stable `name`/`placeholder` attributes (`name="number"`, `name="expiry"`, `name="cvc"`). The exact selector resolution is non-trivial because Stripe occasionally nests a second iframe per field — the test must be written defensively (try the combined frame first; the planner should expect 1-2 iterations of selector tuning during implementation, which is acceptable for a manual E2E). See §Code Examples.

### Anti-Patterns to Avoid
- **Wiring the E2E into `npm test` or CI** — it spends real money and sends real email. Separate `npm run test:e2e` only.
- **Mocking Stripe in the E2E** — CONTEXT requires the *real* test-mode Stripe + real Celitech. `NEXT_PUBLIC_STRIPE_MOCK` must be `false` for the E2E run (mock mode skips the webhook → no real Celitech call). The runbook/test docs must state this.
- **Asserting on the Resend inbox in the automated test** — email delivery is verified by the provisioning code path completing without error; the inbox check is a documented manual companion step.
- **Bumping `QR_CACHE_NAME`** — it must stay `'esim-qr-data'` so offline QR codes survive.
- **Adding a build-hash injection to `CACHE_NAME`** — out of scope; the locked decision is a literal `v2` bump.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Detecting a new SW version | A polling `setInterval` that re-fetches `sw.js` | `registration.addEventListener('updatefound', ...)` + `registration.waiting` check on registration | The browser already fires `updatefound`; polling is redundant and racy. |
| Reloading after update | A manual reload button that just `location.reload()` immediately | `controllerchange` one-time listener → `reload()` | Reloading before the new SW controls the page serves the *old* cache again. `controllerchange` is the correct trigger. |
| Old-cache eviction | Manual `caches.delete('esim-panda-v1')` call | The existing `activate` handler's `keys().filter(...).map(delete)` | Already implemented and correct; the `CACHE_NAME` bump activates it. |
| Cross-origin iframe input | `page.locator` + manual `iframe.contentDocument` | `page.frameLocator(...)` | Playwright's `frameLocator` is the supported, auto-waiting iframe API. |
| Browser/app lifecycle in tests | Bare `playwright` scripting | `@playwright/test` runner | Auto-waiting `expect`, retries, traces, reporter — all free with the runner. |

**Key insight:** Every piece of the SW update flow is a documented browser primitive. The only "code" is wiring four event listeners in the right order. Custom version-polling is the classic mistake.

## Common Pitfalls

### Pitfall 1: `@playwright/test` is not installed (only `playwright` is)
**What goes wrong:** The plan writes `import { test, expect } from '@playwright/test'` and `playwright.config.ts`, then `npx playwright test` fails — `@playwright/test` is absent from `node_modules`.
**Why it happens:** `package.json` lists `playwright@^1.59.1` (the bare automation library). The test runner is a *separate* package, `@playwright/test`.
**How to avoid:** Plan 14-02's first task is `npm install -D @playwright/test@1.60.0` + `npx playwright install chromium`. Verify with `npx playwright --version`.
**Warning signs:** `Cannot find module '@playwright/test'`.

### Pitfall 2: Inline SW registration script can't drive the banner
**What goes wrong:** Trying to add update-detection to the existing `swRegistrationScript` string in `layout.tsx` — a plain inline script has no React state and can't render the banner.
**Why it happens:** The current registration is a `dangerouslySetInnerHTML` string, not a component.
**How to avoid:** Promote registration to a `'use client'` component (`sw-register.tsx`) and delete the inline `<script>`. Keep the `darkModeHydrationScript` inline script — only the SW one moves.
**Warning signs:** Banner state never updates; `updatefound` listener never has a place to live.

### Pitfall 3: `controllerchange` fires once — guard against double reload
**What goes wrong:** Without a guard, edge cases (or a re-registered SW) can fire `controllerchange` twice → reload loop.
**How to avoid:** Use a module-level/`useRef` boolean `refreshing` — set it before `reload()`, ignore subsequent `controllerchange` events.
**Warning signs:** Page reloads twice on update; flicker.

### Pitfall 4: Stripe `STRIPE_MOCK` mode silently skips the real pipeline
**What goes wrong:** The E2E runs with `NEXT_PUBLIC_STRIPE_MOCK=true` (the default in `.env.example` and `vitest.config.ts`). `pay-button.tsx`'s `MockPayButton` then just `setTimeout(2000)` and redirects to `success?payment_intent=pi_mock_...` — **no Stripe charge, no webhook, no Celitech call, no email.** VER-01 would pass against nothing.
**Why it happens:** Mock mode is the dev default.
**How to avoid:** The E2E run requires `NEXT_PUBLIC_STRIPE_MOCK=false` with real Stripe test keys. The `webServer` command or the `test:e2e` invocation must set/inherit `.env.local` with mock OFF. Document this loudly in the test file header and the runbook. Also: the success page accepts `mock_` prefixed `payment_intent` only when `NEXT_PUBLIC_STRIPE_MOCK==='true'` — with mock off, only real `pi_...` IDs pass the format guard, which is correct.
**Warning signs:** Test passes in seconds; no `orders` row appears in Supabase; no Celitech eSIM.

### Pitfall 5: Stripe Elements iframe not awaited before typing
**What goes wrong:** `card-payment.tsx` shows a skeleton until `PaymentElement`'s `onReady` fires. Typing into the iframe before it mounts → flaky failure.
**How to avoid:** `await expect(frameLocator(...).locator('[name="number"]')).toBeVisible()` before `.fill()`. Playwright `frameLocator` auto-waits, but assert visibility first for a clear failure message.
**Warning signs:** Intermittent "element not found" on the card field.

### Pitfall 6: Provisioning is async — the success page polls
**What goes wrong:** `delivery-page.tsx` triggers `/api/delivery/provision` then **polls** `/api/delivery/status` every 2s up to a 60s timeout. The QR appears only after the real Celitech `createPurchaseV2` round-trip completes. A test that asserts the QR immediately after landing on `/success` fails.
**How to avoid:** Use Playwright's auto-waiting `expect(...).toBeVisible({ timeout: 90_000 })` on the QR element. Set the test's overall timeout generously (≥120s) — a real Celitech call plus polling can take 30-60s.
**Warning signs:** Test times out at the default 30s on the success page.

### Pitfall 7: SW update banner doesn't appear in local dev / first visit
**What goes wrong:** On a brand-new install (no prior SW) there is no "update" — `updatefound` fires but `navigator.serviceWorker.controller` is `null`, so it's a first install, not an update. Showing the banner then is wrong.
**How to avoid:** Only show the banner when `registration.waiting` exists OR (`updatefound` → new worker reaches `installed` AND `navigator.serviceWorker.controller` is truthy). The `controller` check distinguishes update from first install.
**Warning signs:** Banner appears on the very first visit.

## Code Examples

### `public/sw.js` — Before / After (INF-12 + UXD-08)

**BEFORE (current — lines 1-2, 15-20):**
```js
const CACHE_NAME = 'esim-panda-v1';
const QR_CACHE_NAME = 'esim-qr-data';
// ...
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL_URLS))
  );
  self.skipWaiting();          // <-- unconditional auto-activate
});
```

**AFTER:**
```js
const CACHE_NAME = 'esim-panda-v2';   // INF-12: bump — activate handler auto-evicts v1
const QR_CACHE_NAME = 'esim-qr-data'; // UNCHANGED — offline QR codes survive
// ...
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL_URLS))
  );
  // NO skipWaiting() here — the new SW enters `waiting`; the user controls activation.
});
```
The `activate` handler (lines 25-36) is **unchanged** — it already deletes every cache key that is neither `CACHE_NAME` nor `QR_CACHE_NAME`, so the `v2` bump evicts `esim-panda-v1` automatically.

**ADD a `SKIP_WAITING` branch to the existing `message` listener** (the listener at line 138 already handles `CACHE_QR` and `REFRESH_CACHE` — add one more `if`):
```js
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();        // UXD-08: activate on user request
  }
  // ... existing CACHE_QR and REFRESH_CACHE branches stay
});
```

### `src/components/pwa/sw-register.tsx` — NEW client component (registration + detection + banner)

```tsx
'use client';

import { useEffect, useState } from 'react';
import { UpdateBanner } from './update-banner';

export function SwRegister() {
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;
    let refreshing = false;

    // Reload once the new SW takes control (after SKIP_WAITING).
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (refreshing) return;
      refreshing = true;
      window.location.reload();
    });

    navigator.serviceWorker
      .register('/sw.js', { scope: '/' })
      .then((registration) => {
        // Case A: a worker is already waiting at page load.
        if (registration.waiting && navigator.serviceWorker.controller) {
          setWaitingWorker(registration.waiting);
        }
        // Case B: a new worker is found while the page is open.
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (!newWorker) return;
          newWorker.addEventListener('statechange', () => {
            if (
              newWorker.state === 'installed' &&
              navigator.serviceWorker.controller   // distinguishes update vs first install
            ) {
              setWaitingWorker(newWorker);
            }
          });
        });
      })
      .catch(() => { /* registration failure is non-fatal */ });
  }, []);

  const handleReload = () => {
    waitingWorker?.postMessage({ type: 'SKIP_WAITING' });
    // controllerchange handler reloads the page once the SW activates.
  };

  if (!waitingWorker) return null;
  return <UpdateBanner onReload={handleReload} onDismiss={() => setWaitingWorker(null)} />;
}
```
Mount `<SwRegister />` in `src/app/[locale]/layout.tsx` next to `<OfflineIndicator />` (inside `NextIntlClientProvider` so the banner's `useTranslations` works). **Delete** the `swRegistrationScript` constant and its `<script>` tag from `src/app/layout.tsx`; keep `darkModeHydrationScript`.

### `src/components/pwa/update-banner.tsx` — NEW (mirrors `install-banner.tsx`)

```tsx
'use client';

import { motion } from 'motion/react';
import { useTranslations } from 'next-intl';
import { X, RefreshCw } from 'lucide-react';

interface UpdateBannerProps {
  onReload: () => void;
  onDismiss: () => void;
}

export function UpdateBanner({ onReload, onDismiss }: UpdateBannerProps) {
  const t = useTranslations('pwa');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="fixed bottom-20 md:bottom-4 left-4 right-4 z-40 mx-auto max-w-md"
      role="status"
    >
      <div className="bg-accent-soft dark:bg-[#1A2744] rounded-card p-4 relative flex items-center gap-4">
        <button
          onClick={onDismiss}
          className="absolute top-2 right-2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          aria-label="Dismiss"
        >
          <X size={16} />
        </button>
        <div className="flex-1 text-left">
          <h3 className="text-base font-semibold dark:text-gray-100">
            {t('update_heading')}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {t('update_body')}
          </p>
        </div>
        <button
          onClick={onReload}
          className="bg-accent hover:bg-accent-hover text-white px-4 py-2 rounded-button text-sm font-semibold whitespace-nowrap h-11 min-w-[44px] flex items-center gap-1.5"
        >
          <RefreshCw size={14} />
          {t('update_cta')}
        </button>
      </div>
    </motion.div>
  );
}
```
Styling tokens (`bg-accent-soft`, `rounded-card`, `rounded-button`, `h-11`) are copied from `install-banner.tsx` — consistent with existing PWA UI.

### i18n keys — add to all 6 `messages/*.json` under the existing `pwa` namespace
```jsonc
// messages/en.json — "pwa" object already has install_*, offline_*, sync_complete, sw_error
"update_heading": "New version available",
"update_body": "A fresh version of eSIM Panda is ready. Reload to update.",
"update_cta": "Reload"
```
Translate for `pt`, `es`, `fr`, `ja`, `zh`. The `pwa` namespace already exists in every locale file (confirmed in `en.json`).

### `playwright.config.ts` — NEW (repo root)

```ts
import { defineConfig, devices } from '@playwright/test';

// VER-01 E2E config. This run does a REAL Stripe test-mode purchase that
// triggers a REAL Celitech eSIM provisioning and a REAL Resend email.
// Run it manually with `npm run test:e2e` — NEVER in CI / npm test.
// Requires .env.local with NEXT_PUBLIC_STRIPE_MOCK=false and live keys.

export default defineConfig({
  testDir: './e2e',
  timeout: 150_000,            // real Celitech provisioning + polling can take ~60s
  expect: { timeout: 15_000 },
  fullyParallel: false,        // one real purchase — no parallelism
  workers: 1,
  retries: 0,                  // a real purchase must not auto-retry (would double-charge)
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: process.env.E2E_BASE_URL ?? 'http://localhost:3000',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
  // Local target: build + start the app. Skipped if E2E_BASE_URL points elsewhere
  // (e.g. a Vercel preview deploy).
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : {
        command: 'npm run build && npm run start',
        url: 'http://localhost:3000',
        timeout: 180_000,
        reuseExistingServer: true,
      },
});
```

### `e2e/purchase.spec.ts` — NEW (VER-01 test skeleton)

```ts
import { test, expect } from '@playwright/test';

// VER-01 — real end-to-end purchase. REAL MONEY (Stripe test card is free,
// but Celitech provisions a real low-cost eSIM). Manual run only.
test('completes a real purchase and provisions an eSIM', async ({ page }) => {
  // 1. Browse — land on the catalog.
  await page.goto('/en/browse');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

  // 2. Pick a destination, then the cheapest plan, then go to checkout.
  //    Selectors to confirm during implementation against destination-card.tsx
  //    (router.push to /[locale]/esim/[slug]) and the plan-card "Buy" CTA.
  await page.getByRole('link', { name: /.../ }).first().click();   // a destination
  // ... select cheapest plan -> navigates to /en/checkout?plan=<realPlanId>

  // 3. Fill the email field (type="email", placeholder from checkout.email.placeholder).
  await page.getByRole('textbox', { name: /email/i }).fill('e2e+ver01@esimpanda.co');

  // 4. Stripe PaymentElement is a cross-origin iframe — use frameLocator.
  const stripeFrame = page.frameLocator('iframe[title*="payment" i], iframe[name^="__privateStripeFrame"]');
  await expect(stripeFrame.locator('[name="number"]')).toBeVisible();
  await stripeFrame.locator('[name="number"]').fill('4242 4242 4242 4242');
  await stripeFrame.locator('[name="expiry"]').fill('12 / 30');
  await stripeFrame.locator('[name="cvc"]').fill('123');
  // PaymentElement may also need a postal code / country depending on Stripe config.

  // 5. Pay.
  await page.getByRole('button', { name: /pay/i }).click();

  // 6. Success page — provisioning is async (polls up to 60s). Wait generously.
  await expect(page).toHaveURL(/\/checkout\/success\?payment_intent=pi_/, { timeout: 30_000 });
  await expect(page.getByRole('heading', { name: /your esim is ready/i }))
    .toBeVisible({ timeout: 90_000 });

  // 7. QR present — qr-code-display.tsx renders a <QRCodeSVG> (an <svg>).
  await expect(page.locator('svg').first()).toBeVisible();
});
```
**Selector note:** the destination/plan/pay selectors above are placeholders — the implementer confirms them against `destination-card.tsx`, the `esim/[slug]` plan list, and `pay-button.tsx`. The `frameLocator` selector for Stripe may need 1-2 tuning passes; that is expected and acceptable for a manual E2E.

### `package.json` script
```jsonc
"scripts": {
  "test": "vitest run",
  "test:e2e": "playwright test"   // NEW — separate from `npm test`
}
```

### `vitest.config.ts` — optional safety exclude
Vitest's default include glob is `**/*.{test,spec}.?(c|m)[jt]s?(x)` which **would** match `e2e/purchase.spec.ts`. Add an explicit exclude:
```ts
test: {
  // ...existing...
  exclude: ['e2e/**', 'node_modules/**', 'dist/**', '.next/**'],
}
```
This is REQUIRED — without it `npm test` would try to run the E2E spec under jsdom and fail. (Vitest's default `exclude` covers `node_modules` etc. but NOT a custom `e2e/` dir.)

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Unconditional `install`-time `skipWaiting()` + auto-reload | Waiting SW + `SKIP_WAITING` message + user-controlled reload | web.dev guidance, stable since ~2019 | The codebase's v1.0 SW used the old approach; UXD-08 moves to the modern user-controlled pattern. |
| Bare `playwright` package for tests | `@playwright/test` runner | Playwright 1.12+ (2021) | The runner is now the default. The bare package alone is automation-only. |
| Manual `caches.delete` per old version | Filtered `caches.keys()` eviction in `activate` | Standard since SW spec maturity | Already correctly implemented in `sw.js` — the `CACHE_NAME` bump is all that's needed. |

**Deprecated/outdated:**
- Inline `<script>` SW registration: still works, but cannot drive UI — superseded here by a client component.
- `playwright-core` direct use for E2E: superseded by `@playwright/test`.

## Open Questions

1. **Exact Stripe `PaymentElement` iframe selector**
   - What we know: `card-payment.tsx` uses `<PaymentElement options={{ layout: 'tabs' }}>`. Stripe renders card fields inside `js.stripe.com` iframes named `__privateStripeFrame*`, with inner inputs `name="number"`, `name="expiry"`, `name="cvc"`.
   - What's unclear: whether `layout: 'tabs'` yields one combined iframe or per-field iframes — Stripe's DOM varies by version of `@stripe/stripe-js` (`^9.2.0` here).
   - Recommendation: implementer runs the test once with Playwright's `--debug` / trace viewer to read the actual iframe structure, then locks the `frameLocator`. Budget 1-2 selector iterations.

2. **Postal code / billing field in `PaymentElement`**
   - What we know: Stripe Tax (CHK-05) is enabled; `PaymentElement` may require a billing postal code / country depending on the account's Element config.
   - What's unclear: whether the test must fill those fields.
   - Recommendation: implementer inspects the rendered Element; fill any required field. The test card `4242` works with any valid future expiry and any postal code.

3. **Where the E2E gets its real plan ID**
   - What we know: checkout requires a real Supabase `plan` ID; CONTEXT says "select the cheapest plan" via the UI.
   - What's unclear: whether to hard-code a known cheap plan ID or navigate the UI to find it.
   - Recommendation: drive the UI (browse → destination → cheapest plan) so the test is a true black-box flow and is resilient to catalog changes. No hard-coded IDs.

4. **`reuseExistingServer` vs fresh build**
   - What we know: `webServer.command` does `npm run build && npm run start`.
   - What's unclear: whether the operator already has a dev server up.
   - Recommendation: `reuseExistingServer: true` so a developer running `npm run dev` separately is reused — but note dev mode must still have `STRIPE_MOCK=false`. Document that the cleanest run is a fresh `next start` of a production build.

## Validation Architecture

Phase 14 is itself the verification phase. The split between automated gates and the manual E2E:

### Test Framework
| Property | Value |
|----------|-------|
| Unit framework | `vitest@4.1.4` (jsdom) — existing |
| E2E framework | `@playwright/test@1.60.0` — NEW, must be installed (Pitfall 1) |
| Unit config | `vitest.config.ts` (add `exclude: ['e2e/**', ...]`) |
| E2E config | `playwright.config.ts` (NEW, repo root) |
| Quick run command | `npm test` (unit) — must NOT include the E2E |
| E2E command | `npm run test:e2e` — manual only |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|--------------|
| INF-12 | `CACHE_NAME` is `esim-panda-v2`, `QR_CACHE_NAME` unchanged | grep gate | `grep -q "esim-panda-v2" public/sw.js && grep -q "esim-qr-data" public/sw.js` | ✅ existing file, modified |
| INF-12 | App still builds & type-checks after SW change | build/tsc | `npm run build` + `npx tsc --noEmit` | ✅ |
| UXD-08 | `UpdateBanner` renders, Reload posts `SKIP_WAITING`, dismiss hides it | unit | `npx vitest run src/components/pwa/__tests__/update-banner.test.ts` | ❌ Wave 0 — new test file |
| UXD-08 | i18n keys present in all 6 locales (no missing-key crash) | unit/lint | covered by existing i18n key tests if any; else a `node` key-presence check | ❌ Wave 0 — verify or add |
| UXD-08 | No regression in existing PWA component tests | unit | `npm test` (covers `install-banner`, `offline-indicator`) | ✅ existing |
| VER-01 | Real purchase → real Celitech eSIM → success page renders QR | E2E (manual) | `npm run test:e2e` | ❌ Wave 0 — new `e2e/purchase.spec.ts` |
| VER-01 | `orders` row advanced + `esims` row has ICCID + encrypted columns | manual DB check | Supabase query, run by operator after the E2E | manual companion step |
| VER-01 | Resend delivery email received | manual inbox check | operator checks the `e2e+ver01@esimpanda.co` inbox | manual companion step |
| (all) | No unit-test regression vs pre-phase baseline | unit | `npm test` — pass count ≥ baseline | ✅ |

### Sampling Rate
- **Per task commit:** `npm test` (unit only — fast, no real money) + `npx tsc --noEmit`.
- **Per wave merge:** `npm run build` + `npm test` + `npm run lint`.
- **Phase gate:** Full unit suite green; `npm run build` green; the `CACHE_NAME` grep gate passes; then **one** manual `npm run test:e2e` run is the VER-01 verification artifact (the real eSIM). The E2E itself IS the verification — it is not unit-tested.

### What is automated vs the E2E itself
- **Automated (every commit / CI-safe):** `CACHE_NAME` grep, `tsc`, `npm run build`, `npm run lint`, the `update-banner.test.ts` unit test, `npm test` no-regression.
- **The VER-01 E2E:** a *manual* `npm run test:e2e` run. It spends real money and sends real email — it is explicitly NOT in `npm test` or CI. The run itself, producing a real eSIM + a green Playwright report, is the accepted VER-01 proof. There is no test-of-the-test.

### Wave 0 Gaps
- [ ] `npm install -D @playwright/test@1.60.0` + `npx playwright install chromium` — runner not installed.
- [ ] `playwright.config.ts` — does not exist.
- [ ] `e2e/purchase.spec.ts` — does not exist.
- [ ] `package.json` `test:e2e` script — does not exist.
- [ ] `vitest.config.ts` `exclude: ['e2e/**']` — must be added so `npm test` ignores the spec.
- [ ] `src/components/pwa/__tests__/update-banner.test.ts` — new unit test for the banner.
- [ ] Confirm an i18n key-presence test exists; if not, the 6-locale `update_*` keys rely on the build.

## Deploy Runbook — required contents (deploy prep)

Phase 14 lands a deploy runbook (a markdown doc in the phase dir, or a SUMMARY section — Claude's discretion). It MUST contain:

**1. Vercel environment-variable delta**
- **Remove:** `NEXT_PUBLIC_WHATSAPP_NUMBER` from the Vercel project env (Phase 13 removed it from code and `.env.example`; the Vercel dashboard value is now dead — confirmed `.env.example` has no WhatsApp var).
- **Confirm present (all already required by v1.1 code):** `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `CELITECH_CLIENT_ID`, `CELITECH_CLIENT_SECRET`, `CELITECH_WEBHOOK_SECRET`, `CRON_SECRET`, `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`, `ESIM_ENCRYPTION_KEY`, `RESEND_API_KEY`.
- **Confirm `NEXT_PUBLIC_STRIPE_MOCK`:** must be `false` (or unset) in the **production** Vercel env — `true` would route real users through the mock pay button.
- Push-notification vars (`NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`) and APN vars: confirm present if push is live.

**2. Same-deploy requirement**
- The `CACHE_NAME` → `esim-panda-v2` bump MUST ship in the SAME deploy as the v1.1 code. A separate SW-only deploy, or a code deploy without the bump, creates a window where new code is served against the old cache (Pitfall 5).

**3. The manual production-push step (user-performed)**
- The runbook documents — but Phase 14 does NOT execute — the final step: merge to `main` and/or `vercel --prod`. The runbook states this is a human go/no-go.

**4. Post-deploy verification checklist (for the operator)**
- After production deploy: open the live site, confirm fresh content; on a returning device, confirm the "New version available" banner appears once and Reload loads fresh content.
- iOS Capacitor app: WKWebView SW behavior differs in edge cases (STATE.md blocker) — verify via TestFlight that the bumped cache takes effect.
- Run `npm run test:e2e` against production (or accept the preview-deploy run) as the VER-01 artifact.

## Sources

### Primary (HIGH confidence)
- Codebase: `public/sw.js` — current `CACHE_NAME`, `install`/`activate`/`message` handlers; confirmed the `activate` filter auto-evicts non-current caches.
- Codebase: `src/app/layout.tsx` — the inline `swRegistrationScript`; `src/app/[locale]/layout.tsx` — where PWA components mount.
- Codebase: `src/components/pwa/install-banner.tsx`, `offline-indicator.tsx` — banner pattern, design tokens, `useTranslations('pwa')`, dismiss pattern.
- Codebase: `src/components/checkout/card-payment.tsx` (`<PaymentElement>`), `pay-button.tsx` (mock vs real branch, `STRIPE_MOCK_MODE`), `checkout-page.tsx`, `delivery-page.tsx` (async polling), `qr-code-display.tsx` (`<QRCodeSVG>`).
- Codebase: `src/app/[locale]/checkout/page.tsx`, `success/page.tsx`, `browse/page.tsx`, `src/app/api/webhooks/stripe/route.ts`.
- Codebase: `package.json` (`playwright@^1.59.1` present; `@playwright/test` ABSENT), `vitest.config.ts`, `.env.example`, `next.config.ts`.
- `npm view @playwright/test version` → `1.60.0` (verified 2026-05-17). `npm ls playwright` → `1.59.1`.
- `.planning/research/v1.1/SUMMARY.md`, `.planning/REQUIREMENTS.md`, `14-CONTEXT.md`.

### Secondary (MEDIUM confidence)
- MDN / web.dev SW update pattern (`skipWaiting` + `SKIP_WAITING` message + `controllerchange`) — well-established, consistent across multiple authoritative sources; matches the `sw.js` primitives directly.
- Playwright `frameLocator` for cross-origin iframes — standard documented API.

### Tertiary (LOW confidence — needs validation during implementation)
- Exact Stripe `PaymentElement` iframe DOM structure for `@stripe/stripe-js@9.2.0` with `layout: 'tabs'` — varies by Stripe version; the implementer must inspect the live DOM (Open Question 1).
- Whether `PaymentElement` requires a billing postal/country field for this Stripe account config (Open Question 2).
- iOS Capacitor WKWebView SW update behavior — requires TestFlight verification (STATE.md blocker).

## Metadata

**Confidence breakdown:**
- SW cache bump (INF-12): HIGH — `sw.js` read in full; the `activate` handler verifiably auto-evicts; one-constant change confirmed.
- SW update flow (UXD-08): HIGH — canonical browser pattern; all four event primitives map directly onto the existing `sw.js`.
- Playwright scaffold (VER-01): HIGH for config/structure; MEDIUM for the Stripe iframe selectors (Stripe DOM is version-sensitive — flagged as Open Question).
- Deploy runbook: HIGH — env vars cross-checked against `.env.example` and code.

**Research date:** 2026-05-17
**Valid until:** ~2026-06-17 (stable domain; Playwright minor releases monthly — re-verify `@playwright/test` version at install time).
