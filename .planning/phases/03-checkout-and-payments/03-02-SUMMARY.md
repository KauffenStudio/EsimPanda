---
phase: 03-checkout-and-payments
plan: 02
subsystem: payments
tags: [stripe, react, framer-motion, next.js, i18n, zustand]

# Dependency graph
requires:
  - phase: 03-01
    provides: Checkout store, Stripe config, API routes (create-intent, validate-coupon, update-intent), checkout types and pricing logic

provides:
  - Full single-page checkout UI at /[locale]/checkout with 13 components
  - Success page at /[locale]/checkout/success with Bambu celebration + confetti + auto-redirect
  - Payment processing overlay (Bambu eating bamboo)
  - Payment error screen (Bambu apologetic + retry)
  - 40-particle CSS confetti effect
  - Checkout skeleton for loading states
  - Complete checkout i18n keys in messages/en.json

affects:
  - phase-04-esim-delivery (success page links to dashboard; order ID pattern established)
  - phase-05-analytics (checkout funnel events fire from checkout-page.tsx)

# Tech tracking
tech-stack:
  added:
    - "@stripe/stripe-js — Stripe.js + ExpressCheckoutElement"
    - "@stripe/react-stripe-js — Elements provider + PaymentElement"
    - "stripe — server-side SDK (already present from plan 01)"
  patterns:
    - "Stripe Elements wrapped in client component, server component handles route/params"
    - "Zustand store (useCheckoutStore) as single source of truth for checkout state"
    - "CSS @keyframes confetti without external library (40 particles, random trajectories)"
    - "payment_status state machine: idle -> creating -> processing -> succeeded | failed"
    - "Mock mode for Stripe: NEXT_PUBLIC_STRIPE_MOCK=true bypasses live Elements rendering in dev"
    - "Success page redirect guard: payment_intent searchParam required, redirects to /checkout otherwise"

key-files:
  created:
    - src/app/[locale]/checkout/page.tsx
    - src/app/[locale]/checkout/success/page.tsx
    - src/components/checkout/checkout-page.tsx
    - src/components/checkout/order-summary.tsx
    - src/components/checkout/email-field.tsx
    - src/components/checkout/device-check.tsx
    - src/components/checkout/coupon-input.tsx
    - src/components/checkout/express-checkout.tsx
    - src/components/checkout/payment-divider.tsx
    - src/components/checkout/card-payment.tsx
    - src/components/checkout/pay-button.tsx
    - src/components/checkout/payment-processing.tsx
    - src/components/checkout/payment-success.tsx
    - src/components/checkout/payment-error.tsx
    - src/components/checkout/checkout-skeleton.tsx
    - src/components/checkout/confetti-effect.tsx
  modified:
    - messages/en.json
    - src/lib/checkout/schemas.ts
    - src/lib/stripe/client.ts
    - src/lib/mock-data/destinations.ts
    - src/styles/globals.css

key-decisions:
  - "Mock mode (NEXT_PUBLIC_STRIPE_MOCK=true) added so checkout UI renders fully in dev without real Stripe keys"
  - "plan_id schema relaxed from uuid() to min(1) to accommodate mock string IDs (carried forward from 03-01)"
  - "Success page redirect guard: payment_intent searchParam required to prevent spurious success display on refresh"
  - "Stable order ID derived from payment_intent suffix (ORD-{last8}) so it does not regenerate on page refresh"
  - "Confetti implemented with pure CSS @keyframes — no external library needed for 40-particle effect"
  - "Pay button is sticky on mobile (fixed bottom + safe-area-inset-bottom) but static on md: and above"

patterns-established:
  - "Checkout payment_status machine: all status transitions flow through useCheckoutStore.setPaymentStatus"
  - "Overlay pattern for processing: fixed inset-0 with backdrop-blur, z-40, prevents body scroll"
  - "Bambu mascot drives all status screens: loading=eating, success=bounce+sparkles, error=wobble+sweat"
  - "i18n keys prefixed checkout.* with nested sub-namespaces (checkout.summary.*, checkout.coupon.*, etc.)"

requirements-completed: [CHK-01, CHK-02, CHK-03, CHK-04, CHK-05, INF-05]

# Metrics
duration: ~35min
completed: 2026-04-21
---

# Phase 3 Plan 02: Checkout UI and Payment Screens Summary

**Single-page checkout with Stripe Elements, collapsible coupon UX, Bambu status screens (processing/success/error), 40-particle CSS confetti, and success page redirect guard — all 13 components wired to the data layer from Plan 01**

## Performance

- **Duration:** ~35 min
- **Started:** 2026-04-21T08:56:35Z
- **Completed:** 2026-04-21T09:31:00Z
- **Tasks:** 3 (2 auto + 1 human-verify checkpoint)
- **Files modified:** 30

## Accomplishments

- 13 checkout components built and wired to Zustand store and Stripe Elements
- Payment status machine (idle -> creating -> processing -> succeeded | failed) drives all screen transitions
- Success page redirect guard implemented: direct URL access or refresh without payment_intent param redirects to /checkout
- Mock mode added for Stripe so the full checkout UI renders in dev without real API keys
- Stable order ID derived from payment_intent suffix so it does not regenerate on refresh
- Complete checkout i18n namespace added to messages/en.json without overwriting existing keys
- Dark mode fix and Unsplash destination photos applied as part of fix commit

## Task Commits

1. **Task 1: Checkout UI components, route, Stripe Elements, coupon UX, i18n keys** - `bb57f89` (feat)
2. **Task 2: Success page, payment status screens, confetti celebration** - `55e7b84` (feat)
3. **Fix: Mock mode for Stripe, schema fix, dark mode fix, Unsplash photos, locale links** - `37a56f2` (fix)
4. **Task 3: Visual verification** — Approved by user (no commit — checkpoint only)

## Files Created/Modified

- `src/app/[locale]/checkout/page.tsx` — Checkout route, reads searchParams.plan and searchParams.coupon
- `src/app/[locale]/checkout/success/page.tsx` — Success route with payment_intent guard + stable ORD-* order ID
- `src/components/checkout/checkout-page.tsx` — Main orchestrator: Stripe Elements wrapper, mount intent, status machine
- `src/components/checkout/order-summary.tsx` — Price breakdown card (subtotal, discount, VAT, total) with motion animations
- `src/components/checkout/email-field.tsx` — Email input with iOS zoom prevention (font-size 16px), blur validation
- `src/components/checkout/device-check.tsx` — Shows device compat badge from localStorage or check link
- `src/components/checkout/coupon-input.tsx` — Collapsible "Have a code?" with STUDENT30 apply/remove flow
- `src/components/checkout/express-checkout.tsx` — Stripe ExpressCheckoutElement (Apple Pay / Google Pay / PayPal)
- `src/components/checkout/payment-divider.tsx` — "or pay with card" horizontal rule
- `src/components/checkout/card-payment.tsx` — Stripe PaymentElement wrapper with skeleton fallback
- `src/components/checkout/pay-button.tsx` — Dynamic "Pay EUR X.XX" button, sticky on mobile
- `src/components/checkout/payment-processing.tsx` — Full-viewport overlay with BambuLoading
- `src/components/checkout/payment-success.tsx` — Bambu celebration + confetti + 5s countdown redirect
- `src/components/checkout/payment-error.tsx` — Bambu error + error-type message + retry button
- `src/components/checkout/checkout-skeleton.tsx` — Pulsing placeholder matching full checkout shape
- `src/components/checkout/confetti-effect.tsx` — 40-particle CSS @keyframes confetti, no external library
- `messages/en.json` — checkout.* namespace added (40+ keys across 8 sub-namespaces)
- `src/lib/stripe/client.ts` — Mock mode support added
- `src/lib/checkout/schemas.ts` — plan_id schema relaxed from uuid() to min(1)
- `src/lib/mock-data/destinations.ts` — Unsplash photos, updated structure
- `src/styles/globals.css` — Dark mode fix

## Decisions Made

- **Mock mode for Stripe:** `NEXT_PUBLIC_STRIPE_MOCK=true` makes `getStripe()` return null so Stripe Elements skip rendering in dev without real keys. Allows full UI testing without Stripe credentials.
- **Redirect guard on success page:** Explicitly redirect to /checkout when `payment_intent` searchParam is absent to prevent accidentally rendering the success screen on direct access or browser refresh. Matches UI-SPEC Warning noted in plan.
- **Stable order ID:** `"ORD-" + payment_intent.slice(-8).toUpperCase()` derived deterministically from the Stripe payment_intent ID — no randomness so refresh does not change the order number shown.
- **Pure CSS confetti:** 40 particles using `Array.from` with randomized `style` properties (left position, rotation, animation-delay, animation-duration) — no canvas or external library.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Mock mode added to Stripe client for dev rendering**
- **Found during:** Task 1 (checkout page render in dev)
- **Issue:** `getStripe()` calls `loadStripe()` with publishable key even when running without real Stripe keys; Stripe Elements would error or hang in dev
- **Fix:** Added `NEXT_PUBLIC_STRIPE_MOCK` env check in `src/lib/stripe/client.ts`; when true, returns null so Elements provider skips loading
- **Files modified:** src/lib/stripe/client.ts
- **Verification:** Checkout page renders fully in dev with `NEXT_PUBLIC_STRIPE_MOCK=true`
- **Committed in:** 37a56f2

**2. [Rule 1 - Bug] Dark mode styling fix**
- **Found during:** Visual verification (Task 3)
- **Issue:** Dark mode class conflicts caused white-on-white text in certain checkout sections
- **Fix:** Added targeted CSS overrides in globals.css
- **Files modified:** src/styles/globals.css
- **Committed in:** 37a56f2

**3. [Rule 1 - Bug] Destination photo updates and locale link fixes**
- **Found during:** Visual verification (Task 3)
- **Issue:** Placeholder destination images and broken locale-prefixed links degraded visual review
- **Fix:** Updated src/lib/mock-data/destinations.ts with Unsplash photos; fixed locale link generation
- **Files modified:** src/lib/mock-data/destinations.ts
- **Committed in:** 37a56f2

---

**Total deviations:** 3 auto-fixed (all Rule 1 - Bug)
**Impact on plan:** All fixes required for correct dev-mode rendering and visual verification. No scope creep.

## Issues Encountered

- Stripe Elements cannot render in dev without a real publishable key — mock mode resolved this without requiring actual Stripe credentials at dev time.
- plan_id schema (uuid validation) rejected mock string IDs carried from Phase 2 mock data — relaxed in 03-01, confirmed working here.

## User Setup Required

Stripe publishable key required for live Elements rendering (not needed for mock mode):

- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` — Stripe Dashboard -> Developers -> API keys -> Publishable key (test mode `pk_test_...`)
- `STRIPE_SECRET_KEY` — Stripe Dashboard -> Developers -> API keys -> Secret key (test mode `sk_test_...`)

Set `NEXT_PUBLIC_STRIPE_MOCK=true` in `.env.local` to run checkout UI in dev without these keys.

## Next Phase Readiness

- Complete checkout UI ready for Phase 4 (eSIM delivery): success page links to `/dashboard`, order ID format established (`ORD-{pi_suffix}`)
- Phase 4 must replace mock payment_intent with real Stripe payment intent verification (`stripe.paymentIntents.retrieve`) before showing success — see TODO comment in success/page.tsx
- All 13 checkout components tested visually and user-approved at checkpoint

---
*Phase: 03-checkout-and-payments*
*Completed: 2026-04-21*
