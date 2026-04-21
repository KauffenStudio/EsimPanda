---
phase: 3
slug: checkout-and-payments
status: draft
nyquist_compliant: true
wave_0_complete: false
created: 2026-04-21
---

# Phase 3 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest + @testing-library/react + jsdom |
| **Config file** | `vitest.config.ts` (exists from Phase 1) |
| **Quick run command** | `npx vitest run --reporter=verbose` |
| **Full suite command** | `npx vitest run --coverage` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run --reporter=verbose`
- **After every plan wave:** Run `npx vitest run --coverage`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 3-01-01 | 01 | 1 | CHK-01 | unit | `npx vitest run src/lib/checkout/__tests__/pricing.test.ts` | No - W0 | pending |
| 3-01-02 | 01 | 1 | CHK-04 | unit | `npx vitest run src/lib/checkout/__tests__/coupons.test.ts` | No - W0 | pending |
| 3-01-03 | 01 | 1 | CHK-05 | unit | `npx vitest run src/lib/checkout/__tests__/tax.test.ts` | No - W0 | pending |
| 3-02-01 | 02 | 2 | CHK-02 | unit | `npx vitest run src/components/checkout/__tests__/express-checkout.test.ts` | No - W0 | pending |
| 3-02-02 | 02 | 2 | CHK-03 | unit | `npx vitest run src/components/checkout/__tests__/express-checkout.test.ts -t "paypal"` | No - W0 | pending |
| 3-02-03 | 02 | 2 | INF-05 | unit | `npx vitest run src/app/api/checkout/__tests__/create-intent.test.ts` | No - W0 | pending |

*Status: pending / green / red / flaky*

---

## Wave 0 Requirements

- [ ] `src/lib/checkout/__tests__/pricing.test.ts` — stubs for price calculation and guest order (CHK-01)
- [ ] `src/lib/checkout/__tests__/coupons.test.ts` — stubs for coupon validation and discount math (CHK-04)
- [ ] `src/lib/checkout/__tests__/tax.test.ts` — stubs for mock tax calculation (CHK-05)
- [ ] `src/components/checkout/__tests__/express-checkout.test.ts` — stubs for express checkout element (CHK-02, CHK-03)
- [ ] `src/app/api/checkout/__tests__/create-intent.test.ts` — stubs for payment intent creation with 3DS/Radar (INF-05)
- [ ] `src/stores/__tests__/checkout.test.ts` — stubs for checkout store state transitions

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Express checkout buttons render correctly (Apple/Google Pay) | CHK-02 | Visual verification + device-dependent | Open /checkout with plan, verify express buttons appear on supported devices |
| Stripe Elements card form styling matches design system | CHK-02 | Visual verification | Open /checkout, verify card form uses eSIM Panda colors and typography |
| Coupon collapsible "Have a code?" interaction | CHK-04 | Animation/UX quality | Tap "Have a code?", verify smooth expand, enter STUDENT30, verify strikethrough + green savings |
| Post-payment Bambu celebration with confetti | CHK-01 | Visual/animation | Complete mock payment, verify Bambu dance pose + confetti animation + 5s auto-redirect |
| PayPal redirect and return flow | CHK-03 | External service interaction | Click PayPal button, verify redirect behavior (mock in dev) |

---

## Sampling Continuity Check

Task sequence by automated verify type:
1. 3-01-01: unit (pricing tests)
2. 3-01-02: unit (coupon tests)
3. 3-01-03: unit (tax tests)
4. 3-02-01: unit (express checkout tests)
5. 3-02-02: unit (paypal tests)
6. 3-02-03: unit (payment intent tests)

Max consecutive build-only: 0. All tasks have unit tests. Compliant with max 3 rule.

---

## Validation Sign-Off

- [x] All tasks have automated verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 15s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** approved
