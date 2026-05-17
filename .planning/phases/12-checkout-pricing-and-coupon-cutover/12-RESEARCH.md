# Phase 12: Checkout, Pricing and Coupon Cutover - Research

**Researched:** 2026-05-17
**Domain:** Next.js 15 RSC + Supabase — payment-path cutover from mock data to live reads; currency-aware coupon minimum; Zustand persist migration
**Confidence:** HIGH (every claim verified against the actual source files in this repo)

<user_constraints>
## User Constraints (from 12-CONTEXT.md)

### Locked Decisions

**Pricing + coupon data layer**
- `calculatePrice` in `pricing.ts` resolves the plan via `getPlanById` (Supabase) instead of `mockPlans.find` — it **becomes async**.
- `validate-coupon`, `create-intent`, and `update-intent` routes resolve plans via `getPlanById` — no `mockPlans` import.
- Any plan ID not in Supabase is rejected with a clear error response (reuse the existing `{ error: 'Plan not found' }` 404 path).
- The retail price charged is the Supabase `retail_price_cents` for that exact plan ID (CHK-06).

**Currency-aware coupon minimum (CHK-07)** — decided in the currency the user has selected in the currency switcher (`useCurrencyStore`).
- `USD`/`EUR`/`GBP` → flat `999` cents in that currency.
- `BRL`/`JPY`/`CNY` → converted from a **€9.99 base**: `999 / RATES.EUR * RATES[target]`.
- Eligibility = true per-currency threshold: order total converted into the selected currency must be ≥ that currency's minimum. **Accepted consequence:** a borderline plan may be coupon-eligible in USD but not EUR/GBP. Intended, not a bug.
- The displayed minimum-order label shows `9.99` + symbol for USD/EUR/GBP, converted amount for BRL/JPY/CNY.
- Percentage-discount math is unchanged — only the **minimum-order gate** becomes currency-aware. Min base value stays `9.99`.
- Add `getCouponMinOrderCents(currency)`. The selected currency must flow client → `validate-coupon` route (request body field); `calculatePrice` accepts a `currency` argument.

**`formatPrice` JPY bug** — `formatPrice` in `rates.ts` mis-formats JPY (returns `${symbol}${converted}` with no `/100`). Confirm, fix, and confirm CNY/BRL are correct.

**Stale-cart migration (CHK-08)** — `cart.ts` `persist` config gets `version: 2` + a `migrate` function. On migration from any version `< 2`: return a clean **EMPTY** cart. **Silent** — no toast, no notice. Apply the same to `quick-checkout.ts` if it persists plan data. Clear-all over selective-drop: `migrate` is synchronous and cannot do an async Supabase lookup.

**Invalid plan ID at checkout** — `checkout/page.tsx` becomes an async server component; resolves the plan via `getPlanById`. Missing/unknown plan → `redirect('/{locale}/browse?notice=plan-unavailable')`. The browse page gets a small additive, dismissable notice banner reading `?notice=`. New i18n key across all 6 locale files.

**`MockPlan` → `Plan` rename** — the canonical `Plan` type is in `src/lib/db/destinations.ts` (Phase 11). Do NOT create a second checkout-specific plan type. Rename across `cart.ts` (`CartItem.plan`), `quick-checkout.ts`, and the checkout components. If the canonical `Plan` is missing a field the cart/checkout needs, **extend the canonical `Plan` interface in `db/destinations.ts`** rather than fork. `tsc --noEmit` must be clean — that is the gate proving full propagation.

**Plan file granularity — 2 plans (sequential, 12-02 depends on 12-01):**
- `12-01-PLAN.md` — Pricing + coupon data layer: `pricing.ts`, `validate-coupon`/`create-intent`/`update-intent` Supabase lookups; reject unknown IDs; currency-aware coupon minimum (`getCouponMinOrderCents`, `currency` threaded); fix `formatPrice` JPY bug. Requirements: CHK-06, CHK-07.
- `12-02-PLAN.md` — Checkout page + cart migration + type rename: async `checkout/page.tsx` with invalid-plan redirect+notice; browse-page notice banner + i18n key; `MockPlan`→`Plan` rename; cart `persist` `version: 2`. Requirements: CHK-08 (+ CHK-06 for the checkout-page lookup).

### Claude's Discretion
- Exact error code / response shape for an unknown plan ID (reuse existing checkout error convention).
- Exact `migrate` function shape for the Zustand `persist` config.
- Exact notice-banner styling on the browse page (reuse Phase 11 UI-SPEC tokens — plain inline, dismissable).
- Exact i18n key name for the plan-unavailable notice.
- Whether `update-intent` needs the same treatment as `create-intent` (executor checks — **research confirms: yes, it does**).
- How async `calculatePrice` ripples into its callers (await chains).

### Deferred Ideas (OUT OF SCOPE)
- Selective cart re-resolution (matching dead items to real plans) — rejected for v1.1.
- Mock-data file deletion + pure-helper extraction to `src/lib/plans/pricing-display.ts` — Phase 13 (INF-11). Phase 12 keeps importing pure helpers from `mock-data/plans`.
- Live exchange-rate fetching — `RATES` stays a static table.
- WhatsApp removal (Phase 13); Bambu pose removal (Phase 13.1); E2E + deploy (Phase 14).
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| CHK-06 | User completing checkout is charged the Supabase retail price for the real plan ID they selected (no mock IDs accepted) | §1 (`calculatePrice` async + `getPlanById`), §2 (route cutover), §6 (`checkout/page.tsx` async RSC) |
| CHK-07 | Coupon shows a currency-aware minimum-order requirement (flat 9.99 for USD/EUR/GBP, converted-from-€9.99 for BRL/JPY/CNY); eligibility checked against the order total in that same currency | §3 (`getCouponMinOrderCents` design), §4 (currency data flow), §5 (`formatPrice` JPY fix) |
| CHK-08 | User with a saved cart from before v1.1 starts with a clean cart on first load (Zustand persist migration purges dead plan IDs) | §7 (cart `version: 2` migrate), §8 (`MockPlan`→`Plan` rename) |
</phase_requirements>

## Summary

Phase 12 rewires the four payment-path surfaces — `pricing.ts`, the three `api/checkout/*` routes, and `checkout/page.tsx` — from `mockPlans.find()` to `getPlanById()` (the Supabase read built in Phase 11). This is the smaller, more mechanical half of the phase. The larger half is **CHK-07**: the coupon minimum-order rule becomes currency-aware, which forces the user's selected currency to travel from a client Zustand store into a server API route, makes `calculatePrice` accept a `currency` parameter, and adds a `getCouponMinOrderCents(currency)` helper.

Two pre-existing bugs are confirmed and in scope. **`formatPrice` JPY bug:** the JPY branch returns `${symbol}${converted}` without the `/100` divide — `formatPrice(999, 'JPY')` yields `¥155345` instead of `¥1553`. CNY and BRL are correct (they take the `(converted / 100).toFixed(2)` path). **Stale-cart bug (Pitfall 14):** `cart.ts`'s `persist` config has no `version` key, so it is implicitly version `0`; every persisted v1.0 cart holds dead mock plan IDs. The fix is `version: 2` + a `migrate` that returns an empty cart.

The `MockPlan` → `Plan` rename is a search-and-replace, not a refactor — the two types differ only in 3 timestamp fields (`synced_at`, `created_at`, `updated_at`). The plan accommodates this by **extending the canonical `Plan` interface in `db/destinations.ts`** with those three fields as optional, so cart-add code (`plan-card.tsx`) and the checkout components compile without forking the type. `tsc --noEmit` is the gate.

**Primary recommendation:** 12-01 — make `calculatePrice` async and `currency`-aware, cut the 3 routes + `mockCreateIntent` over to `getPlanById`, add `getCouponMinOrderCents`, fix `formatPrice`. 12-02 — async `checkout/page.tsx` with notice-redirect, browse notice banner + i18n key, `MockPlan`→`Plan` rename, cart `version: 2` migration. 12-02 depends on 12-01.

## Standard Stack

**Zero new dependencies.** Everything needed is already installed and already used in this exact codebase.

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `next` | 15.5.15 | RSC for `checkout/page.tsx`; `redirect()` from `next/navigation` | Already the framework; `checkout/page.tsx` is already an async RSC calling `redirect` |
| `@supabase/ssr` / `supabase-js` | 0.10.2 / 2.103.3 | `getPlanById` reads via `createClient()` from `@/lib/supabase/server` | Already how `db/destinations.ts` works (Phase 11) |
| `zustand` | 5.0.12 | `persist` middleware `version` + `migrate` for the cart migration | `cart.ts` and `currency.ts` already use `persist` |
| `next-intl` | (installed) | New `plan-unavailable` notice key across 6 locale files | All copy already routes through `messages/*.json` |
| `vitest` | 4.1.4 | Unit tests for `getCouponMinOrderCents`, async `calculatePrice`, cart `migrate` | `pricing.test.ts` already exists; `vi.mock` chain pattern in `destinations.test.ts` |

### Supporting (no install — already in repo)
| Module | Purpose | Phase 12 role |
|--------|---------|---------------|
| `src/lib/db/destinations.ts` | `getPlanById(planId): Promise<Plan \| null>` + canonical `Plan` type | The single Supabase lookup all 4 surfaces call; the `Plan` type to rename onto |
| `src/lib/currency/rates.ts` | `RATES`, `convertPrice`, `formatPrice`, `CURRENCIES`, `CurrencyCode` | Source of cross-rate math for the coupon minimum; holds the JPY bug |
| `src/stores/currency.ts` | `useCurrencyStore` — persisted selected currency | The client source of truth for the user's currency |
| `src/lib/checkout/coupons.ts` | `validateCoupon(code, orderAmountCents?)` | Gets the currency-aware minimum-order gate |
| `src/lib/__test-fixtures__/catalog.ts` | Stable `Plan[]` fixtures decoupled from mock-data (Phase 11) | Reuse for migrating `pricing.test.ts` |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Body field for currency on `validate-coupon` | A header / cookie | Body field is consistent with how `plan_id`, `code` already arrive; no new plumbing |
| `migrate` returning a partial state | `migrate` returning the full empty initial state | Returning the full default state is unambiguous and matches the locked "clean empty cart" decision |
| Extending canonical `Plan` with 3 optional fields | A separate `CartPlan` type | CONTEXT explicitly forbids forking; optional fields keep one source of truth |

## Architecture Patterns

### Pattern 1: Async data-resolution in a pure compute function

`calculatePrice` is currently a sync pure function. Making it `async` and `currency`-aware ripples to **every caller**. Verified caller list (`grep calculatePrice src/`):

| Caller | File | Already async context? | Ripple |
|--------|------|------------------------|--------|
| `create-intent` route | `src/app/api/checkout/create-intent/route.ts:33` | Yes (`POST` is async) | Add `await` + pass `currency` |
| `update-intent` route | `src/app/api/checkout/update-intent/route.ts:30` | Yes (`POST` is async) | Add `await` + pass `currency` |
| `mockCreateIntent` | `src/lib/mock-data/checkout.ts:21` | No — currently sync | Must become `async`; ripples to its callers (see Pattern 2) |
| `pricing.test.ts` | `src/lib/checkout/__tests__/pricing.test.ts` | n/a | Tests must `await` + mock Supabase (see §9) |

**No UI component calls `calculatePrice` directly** — the checkout client computes price via the `/api/checkout/*` routes, not by importing `pricing.ts`. The ripple is contained to server routes + the mock helper + tests.

### Pattern 2: The `IS_MOCK` branch also reads mock plans — handle it

Both `create-intent` and `update-intent` have an `if (IS_MOCK)` early-return calling `mockCreateIntent(plan_id, coupon_code)`. `mockCreateIntent` (in `src/lib/mock-data/checkout.ts`) does `mockPlans.find(...)` **and** calls `calculatePrice`. Two valid approaches — **the planner must pick one explicitly**:

- **(A) Cut `mockCreateIntent` over to `getPlanById` too** (recommended). `mockCreateIntent` becomes `async`, replaces `mockPlans.find` with `await getPlanById(planId)`, and `await`s `calculatePrice`. Its name stays but it no longer reads mock plans — Phase 13 can rename/delete it. This keeps `IS_MOCK` checkout working against real Supabase plans (correct, since the cart now holds real IDs).
- **(B) Leave `mockCreateIntent` on mock data.** Then `IS_MOCK` checkout silently breaks for real plan IDs (cart holds real IDs post-Phase-11). **Not recommended** — it produces a dev-mode dead path.

Recommendation: **(A)**. It is one extra small edit and keeps dev mode honest. `mockCreateIntent` becoming async ripples only to its two callers (both already-async routes).

> Note: `src/lib/mock-data/checkout.ts` is NOT in the Phase 13 deletion list (only `destinations.ts`, `plans.ts`, `tag-plans.ts` are — confirmed in ARCHITECTURE.md §2.5). So editing `mockCreateIntent` is safe and survives Phase 13.

### Pattern 3: Client store → server route data flow for currency

```
useCurrencyStore (client, persisted)  ──s.currency──▶  CouponInput / CheckoutPage
        │
        │  fetch('/api/checkout/validate-coupon', { body: { code, plan_id, currency } })
        ▼
validate-coupon route  ──getPlanById(plan_id)──▶  Supabase  → retail_price_cents (USD)
        │
        │  convertPrice(retail_price_cents, currency)  → order total in selected currency
        │  getCouponMinOrderCents(currency)            → threshold in selected currency
        ▼
validateCoupon(code, orderTotalInCurrency, minOverride)  → eligible / 'min_order'
```

The currency must also reach `create-intent`/`update-intent` if their coupon path needs the currency-aware gate — and it does, because they call `calculatePrice` which calls `validateCoupon`. So `create-intent`/`update-intent` request bodies also need a `currency` field, and `createIntentRequestSchema` (in `src/lib/checkout/schemas.ts`) must add `currency`.

### Pattern 4: Async RSC with redirect — already the precedent

`checkout/page.tsx` is **already** an async server component that calls `redirect()` (lines 14, 21). Phase 12 only swaps the sync `mockPlans.find` for `await getPlanById` and appends `?notice=plan-unavailable` to the redirect target. Zero architectural change — it is a 3-line diff.

### Anti-Patterns to Avoid
- **Snapshotting price in the cart.** Pitfall 14: the cart stores the full `Plan` object (`CartItem.plan`). That is acceptable for v1.1 because the migration *clears* stale carts, and fresh carts hold real plan objects re-derived from Supabase reads. Do NOT add price re-validation logic — out of scope, and the `migrate` clear handles the stale case.
- **Converting `min_order_cents` to EUR in `coupons.ts`.** Pitfall 9: someone may "fix" the misleading `999` comment by hard-converting. Don't. The currency-aware gate is `getCouponMinOrderCents(currency)`, computed at call time — the static `COUPONS[].min_order_cents` field stays `999` and is now overridden by the helper.
- **Making `migrate` do a Supabase lookup.** `migrate` runs synchronously during hydration. It cannot `await`. Clear-all is the only correct option (CONTEXT-locked).
- **`router.refresh()` for the browse notice.** The notice is read from a URL query param on an RSC render — no refresh needed.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Supabase plan lookup | A new query in `pricing.ts` / routes | `getPlanById` from `db/destinations.ts` | Already typed, `server-only`, error-handled, returns `null` on 0 rows |
| Currency conversion | Manual `* RATES[x]` math in `coupons.ts` | `convertPrice(usdCents, currency)` from `rates.ts` | Already rounds correctly; single source for rates |
| Zustand persist versioning | A custom localStorage key bump or manual `JSON.parse` | `persist({ version, migrate })` | Zustand v5 has first-class `version`/`migrate`; manual bumps leak old keys |
| Test plan fixtures | Importing `mockPlans` into tests | `src/lib/__test-fixtures__/catalog.ts` | Phase 11 already built decoupled fixtures; mock-data dies in Phase 13 |

**Key insight:** Phase 11 already built the read layer and the test-fixture layer. Phase 12 is almost entirely *consuming* those — the only genuinely new code is `getCouponMinOrderCents` and the cart `migrate` function.

## Common Pitfalls

### Pitfall 1: `formatPrice` JPY bug (CONFIRMED — fix in 12-01)
**What goes wrong:** `rates.ts:34-36` — the JPY branch is `return ${info.symbol}${converted}`. `converted` is already in cents (`convertPrice` returns cents). For `formatPrice(999, 'JPY')`: `convertPrice(999, 'JPY')` = `Math.round(999 * 155.5)` = `155345`, rendered as `¥155345`. Correct value is `¥1553` (155345 cents ≈ ¥1553).
**Why it happens:** The author special-cased JPY for "no decimal places" but dropped the `/100` cents→units divide that the non-JPY branch applies via `(converted / 100).toFixed(2)`.
**The fix:** JPY branch should be `return ${info.symbol}${Math.round(converted / 100)};` — divide by 100, round (no decimals), no `.toFixed`. CNY and BRL are **correct** — they fall through to `(converted / 100).toFixed(2)` which is right (CNY/BRL have decimal subunits). Verified: only JPY is wrong.
**Callers affected by the fix:** `formatPrice` is imported by `order-summary.tsx`, `cart-item.tsx`, `cart-drawer.tsx`, `regional-plan-card.tsx`, `destination-card.tsx`, `plan-card.tsx`. The fix only changes output *when currency === JPY* — all six benefit, none break for USD/EUR/GBP/BRL/CNY. The two browse test files importing `formatPrice` (`regional-plan-card.test.tsx`, `destination-card.test.tsx`) should be checked for any JPY assertion (unlikely — they test display, not currency).
**Warning sign:** A JPY-currency user sees a 6-digit yen price on any card or the order summary.

### Pitfall 2: Test cascade — `pricing.test.ts` pins mock IDs/prices (PITFALLS.md Pitfall 6)
**What goes wrong:** `pricing.test.ts` hardcodes `VALID_PLAN_ID = 'p001-0001-...'`, `VALID_RETAIL_CENTS = 1699`, `SMALL_PLAN_ID = 'p010-0001-...'`. After `calculatePrice` becomes async + Supabase-backed, these IDs resolve to `null` → `result` is `null` → `result!.discount_cents` throws *inside* the assertion, or the test silently passes a wrong branch.
**The fix:** Migrate `pricing.test.ts` to (1) mock `@/lib/db/destinations` `getPlanById` (the `vi.mock` pattern from `destinations.test.ts`), (2) return fixtures from `src/lib/__test-fixtures__/catalog.ts` instead of mock IDs, (3) `await` every `calculatePrice` call, (4) replace `result!.field` with `expect(result).toMatchObject({...})` so a `null` fails cleanly. See §9.
**Warning sign:** `npm test` reports a *dropped* test count, or a suite errors at top-level instead of failing a test.

### Pitfall 3: Stale persisted cart holds dead mock IDs (PITFALLS.md Pitfall 14)
**What goes wrong:** `cart.ts` `persist` config (lines 58-65) has **no `version` key** → implicitly version `0`. Every returning user's `esim-panda-cart` localStorage entry holds `CartItem.plan` objects with mock IDs (`p001-...`). Post-cutover those IDs 404 in Supabase; checkout silently fails.
**The fix:** `version: 2` + `migrate` returning a clean empty cart for any `version < 2`. Silent (no toast). See §7.
**Warning sign:** A returning user's cart shows an item but checkout `getPlanById` returns `null` → redirect to browse.

### Pitfall 4: `update-intent` is easy to forget
**What goes wrong:** CONTEXT marks "whether `update-intent` needs the same treatment" as Claude's discretion. It **does** — `update-intent/route.ts:30` calls `calculatePrice`, which becomes async and currency-aware. Missing it leaves a half-cutover route that throws (calling an async fn without `await` yields a `Promise`, and `pricing` is then truthy-but-wrong).
**The fix:** Treat `create-intent` and `update-intent` identically. Both add `await` + `currency` body field.

### Pitfall 5: `quick-checkout.ts` does NOT persist — no migration needed
**What goes wrong:** A planner may add `version: 2` to `quick-checkout.ts` by analogy with `cart.ts`.
**Verified:** `quick-checkout.ts` is a **plain `create()`** — no `persist` middleware (confirmed: line 10 `create<QuickCheckoutState>((set) => ...)`, no `persist` import). Its `selectedPlan` is in-memory only and resets on reload. **No migration needed.** It only needs the `MockPlan` → `Plan` type rename. CONTEXT's "apply the same `version: 2` purge if it also persists plan data" — the answer is *it doesn't persist*, so skip.

### Pitfall 6: `currency` not in `createIntentRequestSchema`
**What goes wrong:** `createIntentRequestSchema` (`schemas.ts`) zod-validates the `create-intent` body. Adding a `currency` field to the request body without adding it to the schema means zod strips it (or `.safeParse` ignores it) and `calculatePrice` gets `undefined` currency → defaults to USD → wrong gate for EUR/GBP users.
**The fix:** Add `currency: z.enum([...]).optional()` (or `.default('USD')`) to `createIntentRequestSchema`. `validate-coupon` and `update-intent` parse their bodies ad-hoc (no zod) — add the `currency` field there directly.

## Code Examples

> These are *sketches for the planner*, not production code. Signatures and shapes are load-bearing; the planner turns them into tasks.

### `getCouponMinOrderCents` — new helper (in `coupons.ts` or `rates.ts`)

Recommended location: `src/lib/checkout/coupons.ts` (it is coupon-domain logic), importing `RATES`/`convertPrice` from `rates.ts`.

```typescript
// Base minimum order: 999 cents. USD/EUR/GBP use it flat in their own currency.
// BRL/JPY/CNY convert from a €9.99 base via USD cross-rate.
//   999 EUR-cents → USD: 999 / RATES.EUR
//   USD → target:        * RATES[target]
import { type CurrencyCode } from '@/lib/currency/rates';
// RATES is currently module-private in rates.ts — EXPORT it (or add a getRate()).

const FLAT_MIN_CURRENCIES: ReadonlySet<CurrencyCode> = new Set(['USD', 'EUR', 'GBP']);
const COUPON_MIN_BASE_CENTS = 999;

export function getCouponMinOrderCents(currency: CurrencyCode): number {
  if (FLAT_MIN_CURRENCIES.has(currency)) return COUPON_MIN_BASE_CENTS;
  // €9.99 base → USD → target currency
  const usdCents = COUPON_MIN_BASE_CENTS / RATES.EUR;        // 999 / 0.92 ≈ 1086
  return Math.round(usdCents * RATES[currency]);             // BRL ≈ 5560, JPY ≈ 168862, CNY ≈ 7862
}
```

> **Decision point for the planner:** `RATES` is currently `const RATES` (module-private) in `rates.ts`. `getCouponMinOrderCents` needs it. Either (a) `export const RATES`, or (b) add `export function getRate(c: CurrencyCode): number` to `rates.ts`. Option (b) is cleaner encapsulation. Either is a one-line change to `rates.ts`.

> **JPY note:** `getCouponMinOrderCents('JPY')` returns *cents* (≈168862). The display label runs it through the (now-fixed) `formatPrice` which divides by 100 → `¥1689`. Eligibility math compares cents-to-cents, so it is consistent.

### `calculatePrice` — before / after

```typescript
// BEFORE (src/lib/checkout/pricing.ts)
import { mockPlans } from '@/lib/mock-data/plans';
import { validateCoupon } from './coupons';

export function calculatePrice(planId: string, couponCode?: string): PriceResult | null {
  const plan = mockPlans.find((p) => p.id === planId);
  if (!plan) return null;
  const retail_price_cents = plan.retail_price_cents;
  if (couponCode) {
    const coupon = validateCoupon(couponCode, retail_price_cents);
    ...
  }
  ...
}

// AFTER
import { getPlanById } from '@/lib/db/destinations';
import { validateCoupon } from './coupons';
import { type CurrencyCode } from '@/lib/currency/rates';
import { convertPrice } from '@/lib/currency/rates';
import { getCouponMinOrderCents } from './coupons';

export async function calculatePrice(
  planId: string,
  couponCode?: string,
  currency: CurrencyCode = 'USD',
): Promise<PriceResult | null> {
  const plan = await getPlanById(planId);
  if (!plan) return null;                            // unknown plan ID → null (CHK-06)
  const retail_price_cents = plan.retail_price_cents;  // USD cents from Supabase

  if (couponCode) {
    // currency-aware gate: convert order total into the selected currency,
    // compare against that currency's minimum.
    const orderTotalInCurrency = convertPrice(retail_price_cents, currency);
    const minOrder = getCouponMinOrderCents(currency);
    const coupon = validateCoupon(couponCode, orderTotalInCurrency, minOrder);
    if (coupon) {
      const discount_cents = Math.round(retail_price_cents * coupon.discount_percent / 100);
      return { retail_price_cents, discount_cents, subtotal_cents: retail_price_cents - discount_cents };
    }
  }
  return { retail_price_cents, discount_cents: 0, subtotal_cents: retail_price_cents };
}
```

> The discount amount stays in **USD cents** (`retail_price_cents` is USD; Stripe charges USD). Only the *eligibility gate* is currency-aware. This matches the locked decision "percentage-discount math is unchanged".

### `validateCoupon` — minimum-order gate change

The current gate (`coupons.ts:62`) compares `orderAmountCents` against the coupon's static `min_order_cents`. Add a 3rd parameter that, when supplied, **overrides** the static field:

```typescript
// BEFORE
export function validateCoupon(code: string, orderAmountCents?: number): Coupon | null {
  ...
  if (coupon.min_order_cents && orderAmountCents !== undefined && orderAmountCents < coupon.min_order_cents) {
    return null;
  }
  ...
}

// AFTER — minOrderOverride is the currency-aware threshold from getCouponMinOrderCents
export function validateCoupon(
  code: string,
  orderAmountCents?: number,
  minOrderOverride?: number,
): Coupon | null {
  ...
  const effectiveMin = minOrderOverride ?? coupon.min_order_cents;
  if (effectiveMin && orderAmountCents !== undefined && orderAmountCents < effectiveMin) {
    return null;
  }
  ...
}
```

> Backward-compatible: callers passing only `(code, orderAmountCents)` keep the old behavior. `WELCOME10` has `min_order_cents: 0` — with the override it would now get a `999`-ish floor; **the planner must decide** whether the override applies to all coupons or only those with a non-zero `min_order_cents`. Recommended: only override when `coupon.min_order_cents > 0`, i.e. `const effectiveMin = coupon.min_order_cents > 0 ? (minOrderOverride ?? coupon.min_order_cents) : 0;` — keeps `WELCOME10` a no-minimum coupon.

### `validate-coupon` route — before / after

```typescript
// BEFORE
import { mockPlans } from '@/lib/mock-data/plans';
const { code, plan_id } = body as { code: string; plan_id?: string };
let orderAmountCents: number | undefined;
if (plan_id) {
  const plan = mockPlans.find((p) => p.id === plan_id);
  if (plan) orderAmountCents = plan.retail_price_cents;
}
const coupon = validateCoupon(code, orderAmountCents);
...
const rawCoupon = validateCoupon(code);
if (rawCoupon && rawCoupon.min_order_cents && orderAmountCents !== undefined && orderAmountCents < rawCoupon.min_order_cents) {
  return NextResponse.json({ valid: false, error: 'min_order' });
}

// AFTER
import { getPlanById } from '@/lib/db/destinations';
import { getCouponMinOrderCents } from '@/lib/checkout/coupons';
import { convertPrice, type CurrencyCode } from '@/lib/currency/rates';

const { code, plan_id, currency = 'USD' } = body as {
  code: string; plan_id?: string; currency?: CurrencyCode;
};
let orderTotalInCurrency: number | undefined;
let minOrder: number | undefined;
if (plan_id) {
  const plan = await getPlanById(plan_id);
  if (!plan) {
    return NextResponse.json({ valid: false, error: 'Plan not found' }, { status: 404 });
  }
  orderTotalInCurrency = convertPrice(plan.retail_price_cents, currency);
  minOrder = getCouponMinOrderCents(currency);
}
const coupon = validateCoupon(code, orderTotalInCurrency, minOrder);
...
// min_order failure branch — compare against the currency-aware minOrder
const rawCoupon = validateCoupon(code);
if (rawCoupon && minOrder !== undefined && orderTotalInCurrency !== undefined && orderTotalInCurrency < minOrder) {
  return NextResponse.json({ valid: false, error: 'min_order' });
}
```

> Note the unknown-plan-ID handling: CONTEXT says reject unknown IDs with the existing convention. For `validate-coupon`, `plan_id` is *optional* today (auto-apply `WELCOME10` calls it with no `plan_id`). Recommendation: if `plan_id` is *provided* but resolves to `null`, return the 404; if `plan_id` is *absent*, behave as today (no min-order gate, used by the `WELCOME10` auto-apply path which has no order context).

### `create-intent` / `update-intent` — the change

Both: add `currency` to the destructured body, pass it through to `calculatePrice`, `await` the call.

```typescript
// create-intent — parsed via createIntentRequestSchema (ADD currency to the schema)
const { plan_id, email, coupon_code, currency } = parsed.data;
...
const pricing = await calculatePrice(plan_id, coupon_code, currency ?? 'USD');
if (!pricing) {
  return NextResponse.json({ error: 'Plan not found' }, { status: 404 }); // unchanged convention
}
// IS_MOCK branch:
const result = await mockCreateIntent(plan_id, coupon_code, 'PT', currency ?? 'USD'); // see Pattern 2

// update-intent — body parsed ad-hoc, add currency to the cast
const { payment_intent_id, coupon_code, plan_id, currency } = body as {
  payment_intent_id?: string; coupon_code?: string; plan_id: string; currency?: CurrencyCode;
};
...
const pricing = await calculatePrice(plan_id, coupon_code, currency ?? 'USD');
```

### Cart `persist` `version: 2` + `migrate` — before / after

```typescript
// BEFORE (cart.ts persist config) — no version → implicitly version 0
{
  name: 'esim-panda-cart',
  partialize: (state) => ({
    items: state.items,
    coupon_code: state.coupon_code,
    discount_percent: state.discount_percent,
  }),
}

// AFTER
{
  name: 'esim-panda-cart',
  version: 2,
  // Any persisted state from version < 2 holds dead v1.0 mock plan IDs.
  // Nothing is safely recoverable → return a clean empty cart. Silent (no toast).
  migrate: (persistedState, version) => {
    if (version < 2) {
      return { items: [], coupon_code: null, discount_percent: 0 };
    }
    return persistedState as CartState;
  },
  partialize: (state) => ({
    items: state.items,
    coupon_code: state.coupon_code,
    discount_percent: state.discount_percent,
  }),
}
```

> The `migrate` return shape must match what `partialize` persists (`items`, `coupon_code`, `discount_percent`) — Zustand merges it over the store's initial state, so non-persisted fields (`isOpen`) are filled from the initializer. Returning exactly the partialized empty shape is correct.

### `checkout/page.tsx` — before / after

```typescript
// BEFORE
import { mockPlans } from '@/lib/mock-data/plans';
const plan = mockPlans.find((p) => p.id === planId);
if (!plan) {
  redirect(`/${locale}/browse`);
}
return <CheckoutPage plan={plan} couponFromUrl={coupon} />;

// AFTER
import { getPlanById } from '@/lib/db/destinations';
const plan = await getPlanById(planId);
if (!plan) {
  redirect(`/${locale}/browse?notice=plan-unavailable`);
}
return <CheckoutPage plan={plan} couponFromUrl={coupon} />;
```

> `getPlanById` returns the canonical `Plan` (no timestamp fields). `CheckoutPage` currently types its `plan` prop as `MockPlan`. After the rename (§8) `CheckoutPage` accepts `Plan` — and `getPlanById`'s return is exactly `Plan`, so this composes cleanly. The `!planId` early-redirect (no notice) stays as-is — that is a no-plan-selected case, not a plan-unavailable case.

### Browse notice banner — approach

The browse page is an RSC (`browse/page.tsx`). It already does `await searchParams`-style work via `params`. Add `searchParams` to its props and read `?notice=`:

```typescript
// browse/page.tsx
type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ notice?: string }>;
};
export default async function BrowsePage({ params, searchParams }: Props) {
  const { locale } = await params;
  const { notice } = await searchParams;
  ...
  // pass `notice` down to BrowseClient, OR render a server-side banner before <BrowseClient>
}
```

Two valid placements (planner picks):
- **(A) Server-rendered banner in `browse/page.tsx`** above `<WelcomeDiscountBanner>` — simplest, but not dismissable without a client component.
- **(B) Pass `notice` as a prop to `BrowseClient`** (a client component) which renders a dismissable inline banner with `useState` — matches the locked "dismissable" requirement. Recommended. `BrowseClient` already owns client state; add `notice?: string` to `BrowseClientProps`, render a small dismissable banner at the top of its returned JSX (next to the existing `BrowseErrorBanner` slot). Reuse the `BrowseErrorBanner` styling tokens for visual consistency.

The banner copy is a new i18n key — see §I18n below.

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `mockPlans.find()` synchronous lookup | `await getPlanById()` Supabase read | Phase 12 | `calculatePrice` + 3 routes become async |
| Coupon min-order: flat `999` USD cents, labelled "€9.99" | `getCouponMinOrderCents(currency)` — per-currency threshold | Phase 12 (CHK-07) | Borderline plans now currency-dependent for eligibility |
| `MockPlan` type from `mock-data/plans` | canonical `Plan` from `db/destinations` | Phase 12 → finalized Phase 13 | Type rename; 3 timestamp fields become optional on `Plan` |
| Zustand `persist` with no `version` | `persist` with `version: 2` + `migrate` | Phase 12 (CHK-08) | Stale v1.0 carts auto-cleared on hydration |

**Deprecated/outdated (in Phase 12 scope):**
- The `€9.99` label and the `min_order_cents: 999` "€9.99" comment — both lie about currency. CHK-07 replaces the label with a currency-aware computed value.
- `formatPrice` JPY branch — buggy since written; never caught because no JPY-currency test exists.

## Open Questions

1. **`RATES` export from `rates.ts`**
   - What we know: `getCouponMinOrderCents` needs the raw rate table; `RATES` is currently module-private.
   - What's unclear: whether to `export const RATES` or add `export function getRate()`.
   - Recommendation: add `export function getRate(c: CurrencyCode): number` — keeps the table encapsulated. One-line addition to `rates.ts`.

2. **Does the min-order override apply to zero-minimum coupons (`WELCOME10`)?**
   - What we know: `WELCOME10` has `min_order_cents: 0` (intentionally no minimum). A blanket override would impose a ~999 floor on it.
   - Recommendation: only apply the currency-aware override when `coupon.min_order_cents > 0`. Keeps `WELCOME10` a no-minimum coupon. (Sketch in §`validateCoupon` above.)

3. **`mockCreateIntent` in `IS_MOCK` mode**
   - What we know: `mockCreateIntent` reads `mockPlans` AND calls `calculatePrice`. `IS_MOCK` is the dev default.
   - Recommendation: cut it over to `getPlanById` too (Pattern 2, option A) so dev-mode checkout works against real plan IDs. It is not deleted in Phase 13.

4. **Celitech plan currency assumption**
   - What we know: STATE.md Pending Todos flags "spot-check Celitech plan currencies — research assumed all USD." `Plan.currency` is `string`, assumed `'USD'`.
   - What's unclear: whether any live plan has `currency != 'USD'`.
   - Recommendation: 12-01 verification should run `select count(*) from plans where currency != 'USD'` once. If non-zero, the discount math (`retail_price_cents` assumed USD) needs revisiting — but per CONTEXT this is out of the locked scope; flag it, don't fix it speculatively.

## Validation Architecture

`workflow.nyquist_validation` is `true` in `.planning/config.json` — this section applies.

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.4 |
| Config file | `vitest.config.ts` (exists; has the `server-only` → test-stub alias from Phase 11) |
| Quick run command | `npx vitest run src/lib/checkout` |
| Full suite command | `npm test` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|--------------|
| CHK-06 | `calculatePrice` returns Supabase `retail_price_cents` for a valid plan ID | unit | `npx vitest run src/lib/checkout/__tests__/pricing.test.ts` | ✅ exists — must migrate (mock IDs → fixtures + `vi.mock` getPlanById + `await`) |
| CHK-06 | `calculatePrice` returns `null` for an unknown plan ID | unit | same file | ✅ exists — migrate |
| CHK-07 | `getCouponMinOrderCents` returns `999` for USD/EUR/GBP | unit | `npx vitest run src/lib/checkout/__tests__/coupons.test.ts` | ❌ Wave 0 — new file |
| CHK-07 | `getCouponMinOrderCents` returns the €9.99-cross-rate for BRL/JPY/CNY | unit | same file | ❌ Wave 0 |
| CHK-07 | `validateCoupon` rejects when order total < currency-aware minimum (borderline-in-EUR case) | unit | `coupons.test.ts` | ❌ Wave 0 |
| CHK-07 | `validateCoupon` `minOrderOverride` does not floor `WELCOME10` (zero-minimum coupon) | unit | `coupons.test.ts` | ❌ Wave 0 |
| CHK-07 | `formatPrice(999, 'JPY')` renders `¥1553` not `¥155345`; CNY/BRL unaffected | unit | `npx vitest run src/lib/currency/__tests__/rates.test.ts` | ❌ Wave 0 — new file (verify no existing rates test) |
| CHK-08 | cart `migrate` returns an empty cart for `version < 2` | unit | `npx vitest run src/stores/__tests__/cart.test.ts` | ❌ Wave 0 — new file (test the exported `migrate` fn directly) |
| CHK-06 | `checkout/page.tsx` redirects to `?notice=plan-unavailable` on unknown plan | inspection | manual — RSC redirect, not unit-tested | n/a |
| CHK-08 | browse notice banner renders + dismisses from `?notice=` | inspection | manual / visual | n/a |
| CHK-08 | `MockPlan`→`Plan` rename propagated | type-check | `npx tsc --noEmit` | n/a — the CONTEXT-locked gate |

### Sampling Rate
- **Per task commit:** `npx vitest run src/lib/checkout src/lib/currency src/stores` (the touched modules) + `npx tsc --noEmit`.
- **Per wave merge:** `npm test` (full suite green).
- **Phase gate:** Full suite green + `npx tsc --noEmit` clean before `/gsd:verify-work`.

### Wave 0 Gaps
- [ ] `src/lib/checkout/__tests__/coupons.test.ts` — covers CHK-07: `getCouponMinOrderCents` per-currency values, `validateCoupon` currency-aware gate, `WELCOME10` zero-minimum behavior. (No coupons test exists today.)
- [ ] `src/lib/currency/__tests__/rates.test.ts` — covers CHK-07: `formatPrice` JPY fix + CNY/BRL regression guard. (Verify none exists; `grep` showed no `rates.test`.)
- [ ] `src/stores/__tests__/cart.test.ts` — covers CHK-08: the `migrate` function returns an empty cart for `version 0/1`, passes through for `version 2`. Export `migrate` (or test via `persist` rehydration) so it is unit-addressable.
- [ ] Migrate `src/lib/checkout/__tests__/pricing.test.ts` — covers CHK-06: replace mock IDs with `__test-fixtures__/catalog.ts`, `vi.mock('@/lib/db/destinations')` returning fixtures, `await` all calls, swap `result!.field` → `expect(result).toMatchObject(...)`. Also update the `'€9.99'` test name (line 27) — the rule is now currency-aware.
- [ ] No framework install needed — Vitest 4.1.4 is present and configured.

## Sources

### Primary (HIGH confidence)
- Codebase (read directly): `src/lib/db/destinations.ts`, `src/lib/checkout/pricing.ts`, `src/lib/checkout/coupons.ts`, `src/lib/currency/rates.ts`, `src/lib/checkout/schemas.ts`, `src/lib/mock-data/checkout.ts`, all three `src/app/api/checkout/*/route.ts`, `src/app/[locale]/checkout/page.tsx`, `src/app/[locale]/browse/page.tsx`, `src/stores/cart.ts`, `src/stores/quick-checkout.ts`, `src/stores/currency.ts`, `src/stores/comparison.ts`, `src/components/checkout/{order-summary,coupon-input,checkout-page,sticky-order-bar,quick-checkout-bar}.tsx`, `src/components/cart/cart-item.tsx`, `src/components/browse/{plan-card,browse-client}.tsx`, `src/lib/checkout/__tests__/pricing.test.ts`, `messages/en.json`
- `grep` inventories: `MockPlan` importers (11 files), `calculatePrice` callers (5), `formatPrice` callers (9), `mock-data/plans` importers (16)
- `.planning/phases/12-checkout-pricing-and-coupon-cutover/12-CONTEXT.md` — locked decisions
- `.planning/REQUIREMENTS.md` — CHK-06/07/08 definitions
- `.planning/phases/11-read-layer-module-and-browse-cutover/11-01-SUMMARY.md` — `getPlanById` + canonical `Plan` interface as built

### Secondary (MEDIUM confidence)
- `.planning/research/v1.1/{SUMMARY,ARCHITECTURE,PITFALLS}.md` — Pitfalls 6/9/10/14, wave structure, mock-data file fate (verified consistent with the actual code)

### Tertiary (LOW confidence — needs live confirmation)
- Celitech plan currency: `Plan.currency` assumed `'USD'` across all live rows — not exhaustively verified (STATE.md flags this; see Open Question 4)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — zero new deps; every module verified present and already used.
- Architecture: HIGH — `checkout/page.tsx` is already an async RSC with `redirect`; `getPlanById` already exported; the cutover is mechanical.
- Pitfalls: HIGH — `formatPrice` JPY bug confirmed by reading `rates.ts:34-36`; cart-no-version confirmed by reading `cart.ts:58-65`; `quick-checkout.ts` no-persist confirmed.

**Research date:** 2026-05-17
**Valid until:** ~30 days (stable internal codebase; no fast-moving external dependency). Re-check only if Phase 11 read-layer signatures change.

---
*Phase: 12-checkout-pricing-and-coupon-cutover*
