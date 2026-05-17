# Phase 12: Checkout, Pricing and Coupon Cutover - Context

**Gathered:** 2026-05-17
**Status:** Ready for planning

<domain>
## Phase Boundary

Rewire the payment path from `src/lib/mock-data/` to live Supabase reads. Pricing computation (`lib/checkout/pricing.ts`), coupon validation (`api/checkout/validate-coupon`), the payment-intent creation route, and the checkout server component (`app/[locale]/checkout/page.tsx`) all resolve plans from Supabase by real plan ID via `getPlanById` from `src/lib/db/destinations.ts` (built in Phase 11). The `MockPlan` type is renamed to `Plan` across the cart and quick-checkout Zustand stores and the checkout components. The persisted v1.0 cart is purged on first load via a Zustand `persist` `version: 2` migration. The coupon minimum-order copy is corrected from `€9.99` to `$9.99`.

Out of scope (later phases): deletion of `src/lib/mock-data/` files and extraction of pure pricing-display helpers (Phase 13, INF-11); WhatsApp removal (Phase 13); Bambu pose removal (Phase 13.1); E2E + deploy (Phase 14).
</domain>

<decisions>
## Implementation Decisions

### Pricing + coupon data layer
- `lib/checkout/pricing.ts` `calculatePrice` resolves the plan via `getPlanById` (Supabase) instead of `mockPlans.find` — it becomes async
- `api/checkout/validate-coupon/route.ts` resolves the plan via `getPlanById` — no `mockPlans` import
- `api/checkout/create-intent/route.ts` (and `update-intent` if it also resolves plans) uses the same Supabase lookup
- Any plan ID not present in Supabase is rejected with a clear error response (the route returns a 4xx with an error code; the existing 404/"Plan not found" path is reused)
- The retail price charged is the Supabase `retail_price_cents` for that exact plan ID (CHK-06)

### Coupon behavior
- Coupon math is UNCHANGED — percentage discount + minimum-order threshold logic already operates on whatever price is passed in; real Celitech prices flow through it untouched
- ONLY the copy changes: the minimum-order label renders `$9.99` (USD — the actual currency of `retail_price_cents`) instead of the misleading `€9.99` (CHK-07)
- The min-order threshold value stays `999` cents; no threshold/percentage re-audit in this phase (that would be a pricing-strategy task, not a cutover)

### Stale-cart migration
- The cart Zustand store (`src/stores/cart.ts`) uses `persist` middleware — bump its config to `version: 2` with a `migrate` function
- On migration from any version `< 2`: **empty the cart entirely**. Every v1.0 persisted cart is mock-backed and its plan IDs do not exist in Supabase — there is nothing safely recoverable. The `migrate` function returns a clean empty cart state.
- **Silent** — no toast, no notice. The cart simply appears empty. (A returning user with a months-old cart does not expect it preserved.)
- `quick-checkout` store: apply the same `version: 2` purge if it also persists plan data
- Rationale for clear-all vs selective-drop: the `migrate` function runs synchronously on hydration and cannot do an async Supabase lookup to validate individual IDs; and v1.0 mock IDs are structurally stale regardless. Clear-all is correct and simple.

### Invalid plan ID at checkout
- `app/[locale]/checkout/page.tsx` becomes an async server component; it resolves the plan via `getPlanById`
- If the plan ID is missing or not found in Supabase: `redirect()` to `/{locale}/browse` **with a notice** — append a query param (e.g. `?notice=plan-unavailable`)
- The browse page reads that query param and shows a brief, dismissable notice ("That plan is no longer available — here's the current catalog"). New i18n key required across all 6 locale files.
- This is a small, additive change to the Phase 11 browse page — acceptable Phase 12 scope because it is the other half of the invalid-plan checkout flow.

### MockPlan → Plan rename
- The canonical `Plan` type is the one defined in `src/lib/db/destinations.ts` (Phase 11) — do NOT create a second checkout-specific plan type
- Rename `MockPlan` → `Plan` across: `src/stores/cart.ts` (`CartItem.plan`), `src/stores/quick-checkout.ts`, and the ~5 checkout components that import the type
- Verify field compatibility: the cart/order-summary components read fields like `name`, `data_gb`, `duration_days`, `retail_price_cents`, `currency`. Confirm the Phase 11 `Plan` interface exposes all of these; if a field is missing, extend the canonical `Plan` interface (in `db/destinations.ts`) rather than forking the type.
- `tsc --noEmit` must be clean after the rename — this is the gate that proves the rename propagated fully

### Plan file granularity — 2 plans
- `12-01-PLAN.md` — Pricing + coupon data layer: `pricing.ts`, `validate-coupon` route, `create-intent`/`update-intent` routes query Supabase via `getPlanById`; reject unknown plan IDs; coupon `$9.99` copy fix. Requirements: CHK-06, CHK-07.
- `12-02-PLAN.md` — Checkout page + cart migration + type rename: `checkout/page.tsx` async server component with invalid-plan redirect+notice; browse-page notice banner + i18n key; `MockPlan`→`Plan` rename across cart/quick-checkout stores + checkout components; cart `persist` `version: 2` migration. Requirements: CHK-08 (+ CHK-06 for the checkout-page lookup).
- 12-02 depends on 12-01 (shares the Supabase plan-lookup pattern + the canonical `Plan` type usage). Sequential.

### Claude's Discretion
- Exact error code / response shape for an unknown plan ID (reuse the existing checkout error convention)
- Exact `migrate` function shape for the Zustand `persist` config
- Exact notice-banner styling on the browse page (reuse Phase 11 UI-SPEC tokens — plain inline notice, dismissable)
- Exact i18n key name for the plan-unavailable notice
- Whether `update-intent` needs the same treatment as `create-intent` (depends on whether it resolves plans — executor checks)
- How async `calculatePrice` ripples into its callers (await chains)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### v1.1 milestone research
- `.planning/research/v1.1/SUMMARY.md` — Phase 12 = Wave 2; the `MockPlan`→`Plan` rename + cart version migration rationale
- `.planning/research/v1.1/ARCHITECTURE.md` — checkout cutover, comparison store / cart store migration notes
- `.planning/research/v1.1/PITFALLS.md` — Pitfall 9 (coupon min-order currency), Pitfall 14 (persisted cart holds dead v1.0 plan IDs), Pitfall 10 (source-currency assertion)

### Prior phase context
- `.planning/phases/11-read-layer-module-and-browse-cutover/11-CONTEXT.md` — the canonical `Plan` type decision, `db/destinations.ts` read module
- `.planning/phases/11-read-layer-module-and-browse-cutover/11-01-SUMMARY.md` — `getPlanById` signature + the `Plan`/`CatalogDestination` interfaces as built

### Code to modify / reuse
- `src/lib/db/destinations.ts` — `getPlanById` (the Supabase plan lookup to reuse) + the canonical `Plan` type
- `src/lib/checkout/pricing.ts` — `calculatePrice` (currently `mockPlans.find`) — being rewired
- `src/lib/checkout/coupons.ts` — coupon validation logic — unchanged except where copy lives
- `src/app/api/checkout/validate-coupon/route.ts`, `create-intent/route.ts`, `update-intent/route.ts` — plan-resolution routes
- `src/app/[locale]/checkout/page.tsx` — checkout server component (currently `mockPlans.find` + `redirect`)
- `src/stores/cart.ts` — `persist` middleware, `MockPlan` type, needs `version: 2`
- `src/stores/quick-checkout.ts` — quick-checkout store
- `src/components/checkout/` — the ~5 components importing `MockPlan`
- `messages/{en,pt,es,fr,ja,zh}.json` — new i18n key for the plan-unavailable notice

### Requirements
- `.planning/REQUIREMENTS.md` — Phase 12 owns CHK-06, CHK-07, CHK-08

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `getPlanById` from `src/lib/db/destinations.ts` (Phase 11) — the single Supabase plan-lookup function; pricing, coupon, create-intent, and checkout-page all call it
- The Phase 11 canonical `Plan` interface — reused verbatim; extend it in place if a checkout field is missing
- The existing checkout error/404 convention in the checkout API routes — reuse for unknown plan IDs

### Established Patterns
- `checkout/page.tsx` already does `redirect('/{locale}/browse')` when a plan is missing — Phase 12 makes the lookup async and adds the `?notice=` param
- Zustand `persist` with `version` + `migrate` is a standard middleware pattern — `cart.ts` currently has `persist` without a version migration
- `next-intl` for all copy — the `$9.99` fix and the plan-unavailable notice go through translation keys in all 6 locales

### Integration Points
- `calculatePrice` becoming async ripples into every caller — the create-intent route and any component computing a price preview
- The cart store `CartItem.plan` type change (`MockPlan`→`Plan`) ripples into order-summary, sticky-order-bar, cart-item, checkout-page components
- The browse page (Phase 11) gets a small additive notice-banner for the `?notice=plan-unavailable` redirect target

</code_context>

<specifics>
## Specific Ideas

- "Silent cart clear" — a returning user's stale v1.0 cart is just emptied; no apologetic toast. Simplicity over hand-holding.
- "Redirect with a message" — an invalid checkout link sends the user to browse WITH a short notice, never a silent dump.
- Coupon logic is correct as-is; the only bug is the `€9.99` label lying about currency. Fix the lie, touch nothing else.
- The canonical `Plan` type is single-source — `db/destinations.ts`. No parallel checkout plan type.

</specifics>

<deferred>
## Deferred Ideas

- **Coupon threshold / discount re-audit against real Celitech prices** — considered; deferred. It is a pricing-strategy decision, not a cutover task. Revisit post-v1.1 if real-price data shows the thresholds are off.
- **Selective cart re-resolution** (matching dead items to real plans by destination+data+duration) — considered; rejected for v1.1 in favor of silent clear-all. Could revisit if cart-abandonment telemetry warrants it.
- **Mock-data file deletion + pure-helper extraction to `src/lib/plans/pricing-display.ts`** — Phase 13 (INF-11). Phase 12 keeps importing pure helpers from `mock-data/plans` as Phase 11 does.

</deferred>

---

*Phase: 12-checkout-pricing-and-coupon-cutover*
*Context gathered: 2026-05-17*
