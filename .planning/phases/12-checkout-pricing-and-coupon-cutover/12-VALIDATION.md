---
phase: 12
slug: checkout-pricing-and-coupon-cutover
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-05-17
---

# Phase 12 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.1.4 (already installed; `vitest.config.ts` has the Phase 11 `server-only` test-stub alias) |
| **Config file** | `vitest.config.ts` (root) |
| **Quick run command** | `npx vitest run src/lib/checkout src/lib/currency src/stores` |
| **Full suite command** | `npm test` |
| **Estimated runtime** | ~8s full suite; <1s per touched module |

No framework install needed. Phase 12 adds 3 new test files, migrates 1, and the `MockPlan`→`Plan` rename is gated by `tsc --noEmit`.

---

## Sampling Rate

- **After every task commit:** `npx vitest run src/lib/checkout src/lib/currency src/stores` (touched modules) + `npx tsc --noEmit`
- **After every plan:** `npm test` (full suite green) — test count must not drop below the post-Phase-11 baseline (256)
- **Phase gate:** `npm test` green AND `npx tsc --noEmit` clean (the `MockPlan`→`Plan` rename gate) AND `npm run build` succeeds, before `/gsd:verify-work`
- **Max feedback latency:** ~8 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 12-01-* | 01 | 1 | CHK-06 | unit | `npx vitest run src/lib/checkout/__tests__/pricing.test.ts` — `calculatePrice` returns Supabase `retail_price_cents` for a valid ID, `null` for unknown | ✅ migrate | ⬜ pending |
| 12-01-* | 01 | 1 | CHK-07 | unit | `npx vitest run src/lib/checkout/__tests__/coupons.test.ts` — `getCouponMinOrderCents` returns 999 for USD/EUR/GBP | ❌ W0 | ⬜ pending |
| 12-01-* | 01 | 1 | CHK-07 | unit | `coupons.test.ts` — `getCouponMinOrderCents` returns the €9.99 cross-rate for BRL/JPY/CNY | ❌ W0 | ⬜ pending |
| 12-01-* | 01 | 1 | CHK-07 | unit | `coupons.test.ts` — `validateCoupon` rejects when order total < currency-aware minimum (borderline-in-EUR case) | ❌ W0 | ⬜ pending |
| 12-01-* | 01 | 1 | CHK-07 | unit | `coupons.test.ts` — zero-minimum coupon (`WELCOME10`) is NOT floored by the currency-aware override | ❌ W0 | ⬜ pending |
| 12-01-* | 01 | 1 | CHK-07 | unit | `npx vitest run src/lib/currency/__tests__/rates.test.ts` — `formatPrice(999,'JPY')` renders `¥1553` not `¥155345`; CNY/BRL unaffected | ❌ W0 | ⬜ pending |
| 12-02-* | 02 | 2 | CHK-08 | unit | `npx vitest run src/stores/__tests__/cart.test.ts` — cart `migrate` returns an empty cart for `version < 2`, passes through for `version 2` | ❌ W0 | ⬜ pending |
| 12-02-* | 02 | 2 | CHK-08 | type-check | `npx tsc --noEmit` clean — proves the `MockPlan`→`Plan` rename propagated across all 11 importers | ✅ | ⬜ pending |
| 12-02-* | 02 | 2 | CHK-06 | inspection | `checkout/page.tsx` redirects to `/{locale}/browse?notice=plan-unavailable` on an unknown plan ID — manual (RSC redirect) | n/a | ⬜ pending |
| 12-02-* | 02 | 2 | CHK-08 | inspection | browse notice banner renders + dismisses from `?notice=plan-unavailable` — manual/visual | n/a | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## What is unit-testable vs needs browser verification

**Unit-testable (deterministic — MUST have automated tests):**
- `calculatePrice` resolves Supabase `retail_price_cents`; returns `null`/error for unknown plan IDs (`vi.mock('@/lib/db/destinations')` with fixtures)
- `getCouponMinOrderCents(currency)` — 999 for USD/EUR/GBP; €9.99 cross-rate for BRL/JPY/CNY
- `validateCoupon` currency-aware eligibility gate, incl. the borderline-in-EUR case and the zero-minimum-coupon exemption
- `formatPrice` JPY fix + CNY/BRL regression guard
- cart `migrate` function — empty cart for `version < 2`, passthrough for `version 2`

**Browser / inspection only (note in VERIFICATION.md):**
- `checkout/page.tsx` async RSC redirect to `?notice=plan-unavailable` on an unknown plan
- Browse-page notice banner render + dismiss from the `?notice=` query param
- End-to-end checkout against a real Supabase plan ID (full E2E is Phase 14's VER-01)

---

## Wave 0 Requirements

- [ ] `src/lib/checkout/__tests__/coupons.test.ts` — NEW; CHK-07: `getCouponMinOrderCents` per-currency, `validateCoupon` currency-aware gate, `WELCOME10` zero-minimum behavior
- [ ] `src/lib/currency/__tests__/rates.test.ts` — NEW; CHK-07: `formatPrice` JPY fix + CNY/BRL regression guard
- [ ] `src/stores/__tests__/cart.test.ts` — NEW; CHK-08: the `migrate` function (export `migrate` or test via `persist` rehydration so it is unit-addressable)
- [ ] MIGRATE `src/lib/checkout/__tests__/pricing.test.ts` — CHK-06: replace pinned mock plan IDs with `src/lib/__test-fixtures__/catalog.ts`, `vi.mock('@/lib/db/destinations')`, `await` all `calculatePrice` calls, fix the stale `'€9.99'` test name
- [ ] No framework install — Vitest 4.1.4 already configured

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Checkout with an unknown/stale plan ID redirects to browse with a notice | CHK-06 | RSC `redirect()` is not unit-testable in jsdom | `npm run dev`; open `/en/checkout?plan=00000000-0000-0000-0000-000000000000`; confirm redirect to `/en/browse?notice=plan-unavailable` and a dismissable notice shows |
| Currency-aware coupon minimum behaves correctly per selected currency | CHK-07 | Full client→server currency flow needs a browser | In dev, switch currency to EUR then GBP then JPY; apply a coupon to a borderline-priced plan; confirm the minimum label + eligibility match the selected currency |
| Returning user's v1.0 cart is silently emptied on first v1.1 load | CHK-08 | Needs a pre-seeded v1.0 `localStorage` cart | Seed `localStorage` with a v0 cart payload (mock plan IDs); load the app; confirm the cart is empty with no error/toast |

---

## Validation Sign-Off

- [ ] All tasks have an `<automated>` verify command or a Wave 0 dependency
- [ ] Sampling continuity: no 3 consecutive tasks without an automated verify
- [ ] Wave 0 covers all MISSING test references
- [ ] No watch-mode flags
- [ ] Feedback latency < 10s
- [ ] `tsc --noEmit` (rename gate) + `npm run build` are part of the phase gate
- [ ] `nyquist_compliant: true` set in frontmatter after the executor passes the map

**Approval:** pending
