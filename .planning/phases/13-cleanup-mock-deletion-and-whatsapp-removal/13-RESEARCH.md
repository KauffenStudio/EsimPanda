# Phase 13: Cleanup, Mock Deletion and WhatsApp Removal - Research

**Researched:** 2026-05-17
**Domain:** Codebase cleanup — mock-data deletion, pure-helper extraction, ESLint flat-config gate, WhatsApp removal, static localized route
**Confidence:** HIGH (every claim grounded in greps + file reads of the actual codebase as of 2026-05-17)

## Summary

Phase 13 is pure removal plus one new static page. Two independent workstreams: (1) delete three mock-data files after extracting their pure-compute helpers into a real module and adding an ESLint import-ban; (2) fully strip the WhatsApp support integration and ship a `/help` route as the replacement support surface.

The inventory work is done and is **smaller than feared**. Only **8 importers** reference the three deleted modules (not the 18+ the v1.1 SUMMARY mentioned — Phases 11-12 already cut the big consumers over). Of those 8: one is a still-mock-array consumer (`sitemap.ts`), one is a route still on mock arrays (`esim/[slug]/page.tsx`), and the rest are pure-helper importers. **Critically: `src/lib/db/destinations.ts` — production read-layer code — still imports `getDiscountPercent` from `mock-data/plans`.** That import MUST be repointed or the ESLint gate fails on the read layer itself. Mock-array importers in production code are NOT yet zero — `sitemap.ts` and `esim/[slug]/page.tsx` still use `mockDestinations`/`getPlansForDestination`/`getStartingPrice`. The planner must cut these to `@/lib/db/destinations` as part of 13-01, or the deletion breaks `tsc`/`build`.

WhatsApp is a clean **12-artifact** removal: 2 files to delete (button + test), 1 config file to delete (`support.ts`), 1 layout comment-pair to remove, 6 locale files (`whatsapp.*` namespace + 4 copy strings each), `.env.example` (already has NO `WHATSAPP` var — flag noted), and 4 error-state components repointed from `WHATSAPP_SUPPORT_URL` to `/help`. The `wa.me` link in `referral/share-buttons.tsx:84` is a referral SHARE action and is explicitly KEPT.

**Primary recommendation:** Run 13-01 (mock deletion) and 13-02 (WhatsApp) as two parallel-capable plans — they share zero files. 13-01 must repoint `sitemap.ts`, `esim/[slug]/page.tsx`, AND `lib/db/destinations.ts` before deleting; `tsc --noEmit` + `next build` are the proof gate.

<user_constraints>
## User Constraints (from 13-CONTEXT.md)

### Locked Decisions

**Mock-data deletion scope:**
- Delete exactly three files: `src/lib/mock-data/destinations.ts`, `plans.ts`, `tag-plans.ts` (+ their `__tests__` entries).
- **KEEP** the other four mock-data files — `checkout.ts`, `coupons.ts`, `dashboard.ts`, `delivery.ts` — they back still-mocked dev flows (`IS_MOCK` paths in checkout/dashboard/delivery), NOT in scope for v1.1 deletion.
- Before deleting, extract pure-compute helpers (`getOriginalPrice`, `getDiscountPercent`, `getBestDiscount`, `tagPlans`) into a new real module `src/lib/plans/pricing-display.ts` (no Supabase imports, no I/O — pure functions). Update every importer to point at the new module.
- After deletion: `grep -rn "mock-data/destinations\|mock-data/plans\|mock-data/tag-plans" src/` must return 0.

**CI gate:**
- Add an ESLint `no-restricted-imports` rule blocking imports from `@/lib/mock-data/destinations`, `@/lib/mock-data/plans`, `@/lib/mock-data/tag-plans` — fails `npm run lint` / CI on regression (INF-11).
- The rule targets ONLY those three deleted modules — the four kept mock-data files stay importable.
- **NO dedicated WhatsApp CI guard.** WhatsApp removal is verified ONCE at phase-end with a grep; no permanent CI grep step.

**WhatsApp removal — full inventory:**
- Delete `src/components/layout/whatsapp-button.tsx` and `src/components/layout/__tests__/whatsapp-button.test.tsx`.
- Delete `src/lib/config/support.ts` entirely (100% WhatsApp).
- Remove the commented WhatsApp-button import from `src/app/[locale]/layout.tsx`.
- Remove `NEXT_PUBLIC_WHATSAPP_NUMBER` from `.env.example` (and note for Vercel removal — actual Vercel cleanup is Phase 14).
- Remove the `whatsapp.*` i18n namespace from all 6 locale files (`messages/{en,pt,es,fr,ja,zh}.json`).
- Replace the 4 "contact us on WhatsApp" error-state copy strings (`payment-error.tsx`, `provisioning-error.tsx`, `setup-guide.tsx`, dashboard error state) — link to `/help`.
- **KEEP** the `wa.me` link in `src/components/referral/share-buttons.tsx` — user-initiated referral *share*, NOT support. Intentionally retained.

**Error-state copy replacement:**
- Each of the 4 error states replaces its "contact us on WhatsApp" reference with a **link to `/help`** — copy like "Need help? Visit our Help page" pointing at `/{locale}/help`.
- `/help` is the single support entry point; it carries the `mailto:` so error states route there rather than to a raw mailto.

**/help route:**
- New static route `src/app/[locale]/help/page.tsx` — server component, statically rendered, localized via `next-intl`.
- ~8 concise FAQ entries (topics: what an eSIM is, device compatibility, install/scan QR, activation timing, topping up, refunds/cancellation, troubleshooting "no connection", contact support).
- Support contact: a `mailto:` link to `geral@kauffen.com`.
- Linked from the site footer AND reachable from the 4 error states.
- All `/help` copy goes through `next-intl` translation keys across all 6 locales.

**Plan file granularity — 2 plans:**
- `13-01-PLAN.md` — Mock-data deletion (INF-11).
- `13-02-PLAN.md` — WhatsApp removal + /help route (INF-13, INF-14).
- The two plans are independent (no shared files) — same-wave-parallel-capable unless a shared-file conflict is found.

### Claude's Discretion
- Exact FAQ copy + question wording (concise, brand-voiced, 8 entries).
- Exact ESLint `no-restricted-imports` rule config shape in `eslint.config.mjs`.
- `/help` page layout/styling (reuse existing design tokens + primitives; no UI-SPEC needed).
- Exact error-state link copy/placement within each of the 4 components.
- Whether `pricing-display.ts` also needs a co-located test (recommended if helpers have non-trivial math).

### Deferred Ideas (OUT OF SCOPE)
- Permanent WhatsApp CI grep guard — user declined.
- Deleting the remaining 4 mock-data files (`checkout`, `coupons`, `dashboard`, `delivery`) — they back still-mocked dev flows.
- Vercel env var cleanup (`NEXT_PUBLIC_WHATSAPP_NUMBER` on the hosting platform) — Phase 14's deploy step.
- A full help-center (search, categories, articles) — `/help` ships as a simple static FAQ.
- Bambu mascot pose removal — Phase 13.1.
- E2E + service-worker bump + deploy — Phase 14.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| INF-11 | `mock-data/destinations.ts`, `plans.ts`, `tag-plans.ts` deleted; pure helpers extracted to `src/lib/plans/pricing-display.ts`; CI gate blocks new `mock-data/` imports | §1 Importer Inventory (8 importers, exact lines); §2 Helper Extraction (exact signatures, what's pure vs coupled); §3 ESLint Rule (exact flat-config block) |
| INF-13 | WhatsApp integration fully removed: button, `support.ts`, layout imports, env vars, 6 locale `whatsapp.*` namespaces, 4 error-state copy strings | §4 WhatsApp Inventory (exact file+line table, 6-locale key map, 4 error states, env-var flag, referral KEEP) |
| INF-14 | `/help` static route ships as new support entry point (FAQ + `mailto:`), linked from footer | §5 /help Route (route structure, next-intl wiring, footer integration, metadata) |
</phase_requirements>

## 1. Mock-Data Importer Inventory (INF-11)

### 1.1 Complete importer list — the 3 deleted modules

`grep -rn "mock-data/destinations\|mock-data/plans\|mock-data/tag-plans" src/` returned exactly **8 importers** (verified 2026-05-17). Zero relative-path (`../mock-data/...`) imports exist.

| # | File | Line | Imports | Kind | Prod / Test | Action |
|---|------|------|---------|------|-------------|--------|
| 1 | `src/app/sitemap.ts` | 3 | `mockDestinations` | **Mock ARRAY** | Production (RSC) | **Cut to `@/lib/db/destinations`** — use `listActiveDestinations()` or `getCatalog()` |
| 2 | `src/app/[locale]/esim/[slug]/page.tsx` | 4 | `mockDestinations` | **Mock ARRAY** | Production (RSC) | **Cut to `@/lib/db/destinations`** — `getDestinationBySlug` / `listActiveDestinations` |
| 3 | `src/app/[locale]/esim/[slug]/page.tsx` | 5 | `getPlansForDestination`, `getStartingPrice` | **Mock-array-coupled helpers** | Production (RSC) | **Cut to `@/lib/db/destinations`** — `listPlansForDestination`; compute starting price from rows |
| 4 | `src/app/[locale]/esim/[slug]/page.tsx` | 6 | `tagPlans` | **Pure helper** | Production (RSC) | Repoint to `@/lib/plans/pricing-display` |
| 5 | `src/components/checkout/quick-checkout-bar.tsx` | 10 | `getOriginalPrice`, `getDiscountPercent` | **Pure helpers** | Production (client) | Repoint to `@/lib/plans/pricing-display` |
| 6 | `src/components/browse/plan-card.tsx` | 13 | `getOriginalPrice`, `getDiscountPercent` | **Pure helpers** | Production (client) | Repoint to `@/lib/plans/pricing-display` |
| 7 | `src/hooks/use-plans.ts` | 2 | `getPlansForDestination` | **Mock-array-coupled helper** | Production (client hook) | See §1.3 — likely dead code; verify usage, repoint or delete |
| 8 | `src/lib/db/destinations.ts` | 4 | `getDiscountPercent` | **Pure helper** | **Production read-layer** | Repoint to `@/lib/plans/pricing-display` — **HIGH PRIORITY**, this is the live read module |

**Note:** `src/lib/esim/__tests__/celitech-adapter.test.ts` matched the helper-name grep (`mockDestinationsList` local `vi.fn()`) but is a FALSE POSITIVE — it does not import any `mock-data/` module. Do NOT touch it.

### 1.2 Mock-ARRAY importers in production — NOT yet zero (CONTEXT assumption to flag)

13-CONTEXT.md / v1.1 SUMMARY assumed "after Phases 11-12 there should be no mock-array importers in production." **This is FALSE.** Two production RSC routes still consume mock arrays:

- `src/app/sitemap.ts:8` — `mockDestinations.filter((d) => d.is_active)` to build the sitemap URL loop.
- `src/app/[locale]/esim/[slug]/page.tsx` — `mockDestinations.find()` (lines 22, 30, 50), `getPlansForDestination()` (line 54), `getStartingPrice()` (line 33), `tagPlans()` (line 55).

**Implication for the planner:** 13-01 is NOT a pure "extract helpers + delete" task. It must ALSO cut `sitemap.ts` and `esim/[slug]/page.tsx` over to the live Supabase read layer (`src/lib/db/destinations.ts` already exists from Phase 11 with `listActiveDestinations`, `getDestinationBySlug`, `listPlansForDestination`, `getPlanById`, `getCatalog`). This is the largest piece of risk in the phase. `esim/[slug]/page.tsx` becomes an async RSC reading Supabase (mirror the browse-page pattern from Phase 11). Without this cutover, deleting `destinations.ts`/`plans.ts` produces a `tsc`/`build` red wall.

### 1.3 `src/hooks/use-plans.ts` — verify if dead code

`use-plans.ts:2` imports `getPlansForDestination` and `use-plans.ts:17` calls it. Phase 11/12 cut `usePlans` consumers to props-based filters (`usePlansFilter`). The planner MUST `grep -rn "use-plans\|usePlans" src/` to confirm whether `use-plans.ts` still has live callers. **If no callers → delete the file** (cleanest). **If callers remain → repoint** to a Supabase-backed path or props. Recommendation: delete if orphaned; the hook's whole reason for existing (sync mock-array filter) is obsolete post-cutover.

### 1.4 Test files importing the 3 deleted modules

Only **one** test imports a deleted module (Pitfall 6 cascade is small here):

| Test file | Imports | Recommendation |
|-----------|---------|----------------|
| `src/lib/mock-data/__tests__/tag-plans.test.ts` | `tagPlans` from `../tag-plans` (5 test cases: bestValue, mostPopular, empty input, single plan, no double-badge) | **MIGRATE, do not delete.** `tagPlans` is a pure helper moving to `pricing-display.ts`. Move this test to `src/lib/plans/__tests__/pricing-display.test.ts`, update the import to `../pricing-display`. The 5 cases are genuine coverage of non-trivial logic (price-per-GB, duration-mode, double-badge avoidance) — losing them is a real coverage drop. |

No other test under `src/lib/mock-data/__tests__/` exists (`ls` confirmed: only `tag-plans.test.ts`). No test imports `mock-data/destinations` or `mock-data/plans`. `whatsapp-button.test.tsx` is `it.todo()` stubs only (see §4).

### 1.5 The 4 KEPT mock files — confirmed clean

`grep` of imports in `checkout.ts`, `coupons.ts`, `dashboard.ts`, `delivery.ts`:

| Kept file | Imports | References a deleted module? |
|-----------|---------|------------------------------|
| `checkout.ts` | `getPlanById` from `@/lib/db/destinations`; `calculatePrice`, `calculateTax`, `CurrencyCode` | **NO** — already on the live read layer |
| `coupons.ts` | (none) | **NO** |
| `dashboard.ts` | `DashboardEsim`, `PurchaseRecord`, `TopUpPackage` types from `@/lib/dashboard/types` | **NO** |
| `delivery.ts` | `NormalizedPurchase` type from `@/lib/esim/types` | **NO** |

**Result: no problem to flag.** None of the 4 kept files import any of the 3 deleted modules. They survive deletion untouched. `checkout.ts` notably already imports `getPlanById` from the live `db/destinations.ts` — confirms the kept files are not a regression source.

## 2. Pure-Helper Extraction (INF-11)

### 2.1 What moves to `src/lib/plans/pricing-display.ts`

`src/lib/plans/` does NOT exist yet — must be created. Source of helpers: `mock-data/plans.ts` (lines 198-248) and `mock-data/tag-plans.ts` (whole file).

`mock-data/plans.ts` contains **two buckets** of functions:

**Bucket A — PURE compute (no I/O, no mock-array dependency) — MOVE to `pricing-display.ts`:**

```ts
// getMarkupFactor — private helper inside plans.ts (line 212). Pure. Move as private.
function getMarkupFactor(dataGb: number): number

// Pure: takes retailCents + dataGb, returns number. Move.
export function getOriginalPrice(retailCents: number, dataGb: number): number

// Pure: calls getOriginalPrice internally only. Move.
export function getDiscountPercent(retailCents: number, dataGb: number): number
```

From `tag-plans.ts` (entire file is pure):

```ts
export interface TaggedPlan { ... }   // move (or keep — see note)
export function tagPlans<T extends { id: string; data_gb: number; duration_days: number; retail_price_cents: number }>(
  plans: T[]
): (T & { isBestValue: boolean; isMostPopular: boolean })[]
```

**Bucket B — MOCK-ARRAY-COUPLED (read `mockPlans` global) — these CANNOT move as-is:**

```ts
// COUPLED: filters the mockPlans global array. Has no pure form.
export function getPlansForDestination(destinationId: string): MockPlan[]   // → replaced by listPlansForDestination (Supabase)

// COUPLED: calls getPlansForDestination(mockPlans). Has no pure form.
export function getStartingPrice(destinationId: string): number            // → compute Math.min(retail_price_cents) over Supabase rows

// COUPLED: calls getPlansForDestination internally.
export function getBestDiscount(destinationId: string): number             // see §2.2 — needs decoupling

// COUPLED: calls getPlansForDestination internally.
export function getStartingOriginalPrice(destinationId: string): number    // see §2.3 — check if used
```

### 2.2 `getBestDiscount` — must be DECOUPLED before it can move

CONTEXT lists `getBestDiscount` among the "pure helpers" to extract — but as written in `plans.ts:235-239` it is **NOT pure**: it calls `getPlansForDestination(destinationId)` which reads the `mockPlans` global. Two paths:

- **Option A (recommended): the live read layer already replaced it.** `src/lib/db/destinations.ts:48,189` already computes `bestDiscountPercent: Math.max(...ps.map((p) => getDiscountPercent(p.retail_price_cents, p.data_gb)))` on the destination row. So `getBestDiscount(destinationId)` is functionally **already superseded**. The planner should: (a) verify no production importer of `getBestDiscount` remains (the grep in §1.1 shows NONE in the 8-importer list — so it has no live callers); (b) simply NOT move it — drop it with `plans.ts`.
- **Option B (if a caller is found): move a pure variant** `getBestDiscount(plans: PlanLike[]): number` that takes the plan array as an argument instead of fetching it. But §1.1 shows no live importer, so Option A applies.

**Decoupled signature for `pricing-display.ts` IF a pure best-discount helper is wanted** (optional, recommend skip — `db/destinations.ts` already does it):
```ts
export function getBestDiscount(plans: { retail_price_cents: number; data_gb: number }[]): number
```

### 2.3 `getStartingPrice` / `getStartingOriginalPrice` — verify before dropping

- `getStartingPrice` IS imported (`esim/[slug]/page.tsx:5`, used line 33). Replace its use with a Supabase-row computation: `Math.min(...plans.map(p => p.retail_price_cents))` over `listPlansForDestination()` results — exactly what `db/destinations.ts` already does internally. Do NOT move `getStartingPrice` as a function; inline the `Math.min` at the call site, or add a tiny pure helper `getStartingPrice(plans)` taking an array.
- `getStartingOriginalPrice` (`plans.ts:242`) — grep showed **zero importers**. Confirmed dead. Drop with `plans.ts`, do not migrate.

### 2.4 Recommended final shape of `src/lib/plans/pricing-display.ts`

A pure module, no `import`s except types. Confirmed pure — safe to import from RSC, client, or anywhere:

```ts
// src/lib/plans/pricing-display.ts — pure pricing/display helpers. No I/O, no mock arrays.

/** Minimal shape the tag/discount helpers need. Structurally satisfied by PlanRow. */
interface PlanLike {
  id: string;
  data_gb: number;
  duration_days: number;
  retail_price_cents: number;
}

function getMarkupFactor(dataGb: number): number          // private — copy verbatim from plans.ts:212-218
export function getOriginalPrice(retailCents: number, dataGb: number): number   // copy verbatim from plans.ts:221-225
export function getDiscountPercent(retailCents: number, dataGb: number): number // copy verbatim from plans.ts:228-232
export function tagPlans<T extends PlanLike>(plans: T[]): (T & { isBestValue: boolean; isMostPopular: boolean })[]  // copy verbatim from tag-plans.ts:10-79
export interface TaggedPlan { ... }   // optional — move only if imported elsewhere; grep showed no importer, can drop
```

`TaggedPlan` interface (`tag-plans.ts:1-8`): grep showed **no importer** of the `TaggedPlan` type. Safe to drop, or move for completeness. Recommend dropping — `tagPlans`'s return type is inferred.

### 2.5 Co-located test (Claude's discretion — RECOMMENDED)

`getOriginalPrice`/`getDiscountPercent` have non-trivial math (`getMarkupFactor` tiering, `Math.ceil(... / 100) * 100 - 1` rounding-to-.99) and `tagPlans` has the double-badge edge case. Recommendation: create `src/lib/plans/__tests__/pricing-display.test.ts` by **migrating `tag-plans.test.ts`** (rename import to `../pricing-display`, 5 cases) and **adding** ~3-4 cases for `getOriginalPrice`/`getDiscountPercent` (1GB → 0, 3GB → ~20%, .99 rounding). This preserves Pitfall-6 coverage and is cheap.

## 3. ESLint `no-restricted-imports` Gate (INF-11)

### 3.1 Current config — flat config, `FlatCompat` bridge

`eslint.config.mjs` is ESLint 9 flat config (`eslint@^9`, `eslint-config-next@15.5.15`, `@eslint/eslintrc@^3`). It currently has only `compat.extends(...)` and an `ignores` block. `package.json` `lint` script is bare `eslint`. There is NO existing custom `rules` block — one must be added.

### 3.2 Exact rule block to add

Append a new config object to the `eslintConfig` array. `no-restricted-imports` is a core ESLint rule (no plugin needed). Use the `patterns` form so both the `@/`-aliased path AND any relative path are blocked:

```js
const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
  },
  {
    // INF-11: the three v1.1-deleted mock-data modules must never be re-imported.
    // The four KEPT mock-data files (checkout/coupons/dashboard/delivery) stay importable.
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: [
                "@/lib/mock-data/destinations",
                "@/lib/mock-data/plans",
                "@/lib/mock-data/tag-plans",
                "**/mock-data/destinations",
                "**/mock-data/plans",
                "**/mock-data/tag-plans",
              ],
              message:
                "mock-data/{destinations,plans,tag-plans} were deleted in v1.1 (INF-11). Use @/lib/db/destinations for catalog data and @/lib/plans/pricing-display for pure pricing helpers.",
            },
          ],
        },
      ],
    },
  },
];
```

**Flat-config syntax confirmed (HIGH):**
- `no-restricted-imports` is a core rule — available without any plugin under flat config. ✓
- The `patterns` array with `group` (glob array) + `message` is the documented shape for ESLint 9. ✓
- `**/mock-data/destinations` glob catches relative imports (`../mock-data/destinations`, `./destinations` from within `mock-data/`). The deep-import suffix matters: `next/typescript` does not pre-configure `no-restricted-imports`, so there is no merge conflict.
- A config object with only a `rules` key (no `files`) applies globally — correct, since the ban is codebase-wide.

**Verification the gate works:** After adding the rule and deleting the files, `npm run lint` must pass (zero importers remain). To prove the gate FIRES, a task can temporarily add `import { tagPlans } from '@/lib/mock-data/tag-plans'` to a scratch file, run `eslint`, confirm an error, then revert — or simply trust the rule + the fact that lint passes only because §1 repointing is complete.

### 3.3 Gotcha — order of operations

The rule must be added **AFTER** all 8 importers in §1.1 are repointed. If added before, `npm run lint` fails on the still-present imports. Sequence within 13-01: (1) create `pricing-display.ts`; (2) repoint all 8 importers + cut `sitemap.ts`/`esim/[slug]` to Supabase; (3) delete the 3 files + migrate the test; (4) add the ESLint rule; (5) `tsc --noEmit` + `npm run lint` + `next build` all green.

## 4. WhatsApp Removal Inventory (INF-13)

### 4.1 Complete artifact inventory — verified by `grep -rni "whatsapp\|wa.me" src/ messages/`

| # | Artifact | File / Line | Action |
|---|----------|-------------|--------|
| 1 | Button component | `src/components/layout/whatsapp-button.tsx` (whole file, 124 lines) | **DELETE file** |
| 2 | Button test | `src/components/layout/__tests__/whatsapp-button.test.tsx` (3 lines, 2 `it.todo()` stubs — no real assertions, no prod import) | **DELETE file** |
| 3 | Config module | `src/lib/config/support.ts` (whole file — `WHATSAPP_NUMBER`, `WHATSAPP_SUPPORT_URL`, `getWhatsAppUrl`; 100% WhatsApp) | **DELETE file** |
| 4 | Layout import (commented) | `src/app/[locale]/layout.tsx:9` — `// import { WhatsAppButton } ...` | **DELETE line** |
| 5 | Layout render (commented) | `src/app/[locale]/layout.tsx:49` — `{/* <WhatsAppButton /> */}` | **DELETE line** |
| 6 | Env var | `.env.example` | **NO `WHATSAPP` var present** — see §4.4 flag. Nothing to remove from `.env.example`. `.env.vercel` / `.env.local` also have none. |
| 7 | i18n `whatsapp.*` namespace | All 6 locale files, line 327 (`en` confirmed: `whatsapp` object with `ariaLabel`, `browsePage`, `checkoutPage`, `deliveryPage`, `dashboardPage`, `defaultMessage`) | **DELETE the whole `whatsapp` object** from all 6 files |
| 8 | Error copy — checkout | `messages/*.json` `checkout.error.contact` (en:208) "Need help? Contact us on WhatsApp" | **REWRITE** copy → /help link text (see §4.3) |
| 9 | Error copy — delivery error | `messages/*.json` `delivery.error.contact` (en:398) "Need help? Contact us on WhatsApp" | **REWRITE** copy |
| 10 | Error copy — setup guide | `messages/*.json` `delivery.setup.help` (en:381) "Need help? Chat with us on WhatsApp" | **REWRITE** copy |
| 11 | Error copy — dashboard | `messages/*.json` `dashboard.error_body` (en:64) "...Try again or contact us on WhatsApp for help." | **REWRITE** copy |
| 12 | Error copy — generic errors | `messages/*.json` `errors.generic` (en:144) "Something went wrong. Try again or contact us on WhatsApp for help." | **REWRITE** copy — *extra one beyond CONTEXT's named 4; see §4.5* |
| — | Component import | `src/components/checkout/payment-error.tsx:7` + usage `:48` (`WHATSAPP_SUPPORT_URL`) | **REPOINT to `/help`** (see §4.2) |
| — | Component import | `src/components/delivery/provisioning-error.tsx:6` + usage `:47` | **REPOINT to `/help`** |
| — | Component import | `src/components/delivery/setup-guide.tsx:10` + usage `:83` | **REPOINT to `/help`** |
| — | Dashboard error state | `src/app/[locale]/dashboard/page.tsx:104` (`t('dashboard.error_body')`) | Copy already routes via i18n; optionally add a `/help` link (see §4.3) |
| KEEP | Referral share | `src/components/referral/share-buttons.tsx:82,84,88,91` | **DO NOT TOUCH** — see §4.6 |

### 4.2 The 3 components importing `support.ts` — repoint to `/help`

After `support.ts` is deleted, these 3 break unless repointed. Current shape — each renders an `<a href={WHATSAPP_SUPPORT_URL} target="_blank" rel="noopener noreferrer">`:

| Component | Import line | `<a>` block | New behavior |
|-----------|-------------|-------------|--------------|
| `src/components/checkout/payment-error.tsx` | `:7` `import { WHATSAPP_SUPPORT_URL }` | `:46-52` | Remove import; replace `<a>` with a localized `next-intl` `Link` to `/{locale}/help` (drop `target="_blank"`/`rel` — internal link). Component uses `useTranslations('checkout.error')`, so the copy key is `checkout.error.contact`. |
| `src/components/delivery/provisioning-error.tsx` | `:6` | `:45-52` | Same. Uses `useTranslations('delivery')`, copy key `delivery.error.contact`. |
| `src/components/delivery/setup-guide.tsx` | `:10` | `:81-89` | Same. Uses `useTranslations('delivery')`, copy key `delivery.setup.help`. |

Use the locale-aware `Link` from the project's i18n nav (the footer uses `next/link` + `useLocale()` building `/${locale}/help` — see §5.3; mirror that pattern, or use `@/i18n/routing`'s `createNavigation` `Link` if that's the established convention — planner: check `src/i18n/routing.ts`).

### 4.3 Error-state copy rewrite — all 6 locales

CONTEXT decision: "Need help? Visit our Help page" pointing at `/{locale}/help`. The copy keys to REWRITE (not delete — the keys stay, the WhatsApp wording is replaced):

| Key | en current (line) | Rewrite to (en; translate for pt/es/fr/ja/zh) |
|-----|-------------------|-----------------------------------------------|
| `checkout.error.contact` | "Need help? Contact us on WhatsApp" (208) | "Need help? Visit our Help page" |
| `delivery.error.contact` | "Need help? Contact us on WhatsApp" (398) | "Need help? Visit our Help page" |
| `delivery.setup.help` | "Need help? Chat with us on WhatsApp" (381) | "Need help setting up? Visit our Help page" |
| `dashboard.error_body` | "Something went wrong loading your eSIMs. Try again or contact us on WhatsApp for help." (64) | "Something went wrong loading your eSIMs. Try again or visit our Help page." |
| `errors.generic` | "Something went wrong. Try again or contact us on WhatsApp for help." (144) | "Something went wrong. Try again or visit our Help page." |

Translations needed in pt/es/fr/ja/zh — the existing WhatsApp strings in those files (confirmed at the same line numbers) give the per-language baseline phrasing to adapt.

### 4.4 FLAG — `NEXT_PUBLIC_WHATSAPP_NUMBER` is NOT in `.env.example`

CONTEXT instructs "remove `NEXT_PUBLIC_WHATSAPP_NUMBER` from `.env.example`." **Verified: `.env.example` contains NO `WHATSAPP` line** (`grep` returned nothing across `.env.example`, `.env.local`, `.env.vercel`). The var is referenced only as a code default in `whatsapp-button.tsx:8` and `support.ts:1` (`process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '351000000000'`), both of which are being deleted. **Action: no `.env.example` edit needed.** The planner should note this and not create a task that edits a non-existent line. Vercel-env cleanup remains a Phase 14 note (the var may still be set on Vercel).

### 4.5 FLAG — a 5th error-copy string (`errors.generic`)

CONTEXT names "4 error-state copy strings." The grep found **5** WhatsApp-mentioning copy strings (the four named ones + `errors.generic` at en:144). `errors.generic` is a generic catch-all error message also saying "contact us on WhatsApp." It must be rewritten too (§4.3) or a WhatsApp reference survives the removal and `grep -rni whatsapp messages/` will not return zero. The planner should treat it as a 5th string in the same task. (`messages/*.json` line 301 `shareWhatsapp` is the referral-share label — KEEP, see §4.6.)

### 4.6 KEEP — `referral/share-buttons.tsx` (referral share, NOT support)

`src/components/referral/share-buttons.tsx` — exact lines (verified):
- `:82` — `{/* WhatsApp */}` comment
- `:84` — `href={`https://wa.me/?text=${encodedText}`}` — a `wa.me/?text=` SHARE link (no phone number — opens WhatsApp share sheet)
- `:88` — `aria-label="Share via WhatsApp"`
- `:91` — `{t('shareWhatsapp')}` — renders the `shareWhatsapp` i18n label

This is a user-initiated **referral share** ("share your referral link to a friend on WhatsApp"), not support contact. **The `wa.me/?text=` form (no number) vs `support.ts`'s `wa.me/{NUMBER}` form is the tell.** DO NOT delete these lines and DO NOT delete the `shareWhatsapp` key in the 6 locale files (en:301 etc.). The phase-end verification grep must EXCLUDE these — see §6.

## 5. /help Static Route (INF-14)

### 5.1 Precedent — `privacy/page.tsx` and `terms/page.tsx`

`src/app/[locale]/privacy/page.tsx` (read in full) is the static-localized-route precedent: an `async` server component, `params: Promise<{ locale: string }>`, calls `setRequestLocale(locale)` from `next-intl/server`, then renders content. Privacy/terms render imported MDX-ish content components (`PrivacyEN`/`PrivacyPT`) and only branch EN/PT — that's a 2-language pattern. `/help` differs: it must be **all 6 locales via `next-intl` translation keys** (CONTEXT decision), so it does NOT use the `content/legal/*` component-per-language pattern. It uses `getTranslations()`.

### 5.2 Recommended route structure

```
src/app/[locale]/help/page.tsx   (NEW — async RSC, statically rendered)
```

```tsx
// src/app/[locale]/help/page.tsx
import { setRequestLocale, getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'help' });
  return { title: t('metaTitle'), description: t('metaDescription') };
}

export default async function HelpPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);                         // enables static rendering
  const t = await getTranslations('help');
  // render <h1>{t('title')}</h1>, 8 FAQ entries from t(`faq.q1.question`) / t(`faq.q1.answer`) ...,
  // and a mailto contact: <a href="mailto:geral@kauffen.com">{t('contactCta')}</a>
}
```

Key points (HIGH — all verified against the privacy precedent + Next 15.5 / next-intl 4.9 conventions):
- `setRequestLocale(locale)` is required for static rendering of a localized route (same call privacy/terms make). The route is statically rendered per-locale at build time via the existing `generateStaticParams` in `layout.tsx`.
- Server component — no `'use client'`. FAQ is static content; no interactivity needed (a simple `<details>`/`<summary>` accordion is pure HTML, no JS — recommended for the 8 entries).
- `getTranslations('help')` (async, server) — NOT the client `useTranslations`.

### 5.3 `next-intl` wiring — 8 FAQ entries as translation keys

Add a `help` namespace to all 6 locale files (`messages/{en,pt,es,fr,ja,zh}.json`). Suggested key shape:

```jsonc
"help": {
  "metaTitle": "Help & FAQ — eSIM Panda",
  "metaDescription": "Answers to common questions about eSIMs, installation, activation and support.",
  "title": "Help & FAQ",
  "contactHeading": "Still need help?",
  "contactCta": "Email us at geral@kauffen.com",
  "faq": {
    "q1": { "question": "What is an eSIM?",            "answer": "..." },
    "q2": { "question": "Is my device eSIM-compatible?", "answer": "..." },
    "q3": { "question": "How do I install my eSIM?",   "answer": "..." },
    "q4": { "question": "When does my data start?",     "answer": "..." },
    "q5": { "question": "How do I top up my data?",     "answer": "..." },
    "q6": { "question": "Can I get a refund?",          "answer": "..." },
    "q7": { "question": "My eSIM has no connection — what now?", "answer": "..." },
    "q8": { "question": "How do I contact support?",    "answer": "..." }
  }
}
```

The 8 topics are fixed by CONTEXT; exact wording is Claude's discretion (concise, brand-voiced). All 6 locales need the full namespace — missing keys throw at render in `next-intl` strict mode. Plan a translation task per locale (or one task covering all 6).

### 5.4 Contact `mailto:` link

CONTEXT: `mailto:geral@kauffen.com`. Render as a plain `<a href="mailto:geral@kauffen.com">{t('help.contactCta')}</a>` inside the help page. This is the single support entry point; the 4 error states link to `/help` (not to a raw mailto) and `/help` carries the mailto.

### 5.5 Footer link — `src/components/layout/legal-footer.tsx`

The footer is `src/components/layout/legal-footer.tsx` (NOT the layout file — CONTEXT said "in `layout.tsx` or the footer component"; it's the footer component). Current structure: a `<nav>` with `Link` to `/privacy`, a `·` separator, `Link` to `/terms`, a `·`, and `{t('copyright')}`. It uses `useTranslations('footer')` + `useLocale()`, building `/${locale}/...` paths with `next/link`.

**Add a `/help` link** following the exact existing pattern:
```tsx
<Link href={`/${locale}/help`} className="hover:underline">
  {t('help')}            {/* new key: footer.help */}
</Link>
<span aria-hidden="true">·</span>
```
Insert before or after the privacy/terms links. Add a `footer.help` key (e.g. "Help") to all 6 locale files' existing `footer` namespace.

### 5.6 Metadata / SEO

`generateMetadata` with `title` + `description` from the `help` namespace (§5.2). No structured data needed for a simple FAQ (CONTEXT defers a full help-center). Optional nicety: `FAQPage` JSON-LD — but CONTEXT scopes `/help` as "simple static FAQ," so recommend SKIP JSON-LD to keep the phase tight. The route is statically rendered (good for SEO by default via SSG).

## 6. Phase-End Verification Greps

INF-11 / INF-13 are verified once at phase-end (no permanent CI guard for WhatsApp per CONTEXT). The exact assertions:

```bash
# INF-11 — zero mock-data deleted-module imports remain:
grep -rn "mock-data/destinations\|mock-data/plans\|mock-data/tag-plans" src/    # → must be 0

# INF-13 — zero WhatsApp references remain, EXCLUDING the intentional referral share:
grep -rni "whatsapp\|wa\.me" src/ messages/ | grep -v "referral/share-buttons" | grep -v "shareWhatsapp"
# → must be 0  (share-buttons.tsx + the shareWhatsapp i18n key are the ONLY allowed survivors)

# The 3 deleted mock files gone:
ls src/lib/mock-data/   # → only checkout.ts coupons.ts dashboard.ts delivery.ts (+ __tests__/ now empty or removed)

# WhatsApp files gone:
ls src/components/layout/whatsapp-button.tsx src/lib/config/support.ts   # → No such file
```

Note: after migrating `tag-plans.test.ts`, `src/lib/mock-data/__tests__/` is empty — delete the empty directory too.

## Validation Architecture

Phase 13 is deletion + a static page. `.planning/config.json` was not found at the expected path during research — treat `nyquist_validation` as enabled (absent key = enabled).

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.4 (`vitest@^4.1.4`, `@vitest/coverage-v8@^4.1.4`) |
| Config file | `vitest.config.ts` (exists — Phase 11 aliased `server-only` to a stub there) |
| Quick run command | `npx vitest run src/lib/plans/` |
| Full suite command | `npm test` (`vitest run`) |
| Lint gate | `npm run lint` (`eslint`) |
| Type/build gate | `npx tsc --noEmit` and `npm run build` (`next build`) |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|--------------|
| INF-11 | Pure helpers (`getOriginalPrice`, `getDiscountPercent`, `tagPlans`) compute correctly after extraction | unit | `npx vitest run src/lib/plans/__tests__/pricing-display.test.ts` | ❌ Wave 0 — migrate from `tag-plans.test.ts` + add discount-math cases |
| INF-11 | ESLint `no-restricted-imports` rule blocks the 3 deleted modules | lint (smoke) | `npm run lint` (passes only because zero importers remain) | ✅ rule added in 13-01 |
| INF-11 | No deleted-module import survives; codebase compiles | type/build | `grep -rn "mock-data/destinations\|mock-data/plans\|mock-data/tag-plans" src/` → 0; `npx tsc --noEmit`; `npm run build` | ✅ existing tooling |
| INF-13 | Zero WhatsApp references outside the referral share | grep (smoke) | `grep -rni "whatsapp\|wa\.me" src/ messages/ \| grep -v "share-buttons" \| grep -v "shareWhatsapp"` → 0 | ✅ existing tooling |
| INF-13 | WhatsApp files deleted; 3 error components compile after repoint | type/build | `npx tsc --noEmit`; `npm run build` | ✅ existing tooling |
| INF-14 | `/help` route renders for all 6 locales with no missing-key throw | build (smoke) | `npm run build` (static render of `/[locale]/help` fails build on a missing `next-intl` key) | ✅ existing tooling |
| INF-14 | `/help` page renders FAQ + mailto; footer link navigates | inspection | manual: visit `/{locale}/help`, click footer link, click an error-state Help link | manual-only — static content + nav, low-value to automate |

### Sampling Rate
- **Per task commit:** `npx tsc --noEmit` + `npx vitest run src/lib/plans/` (fast; under 30s).
- **Per plan merge:** `npm run lint` + `npm test` + `npm run build`.
- **Phase gate:** full suite green + both verification greps (§6) return 0 before `/gsd:verify-work`.

### Wave 0 Gaps
- [ ] `src/lib/plans/pricing-display.ts` — NEW module (the helpers). Created in 13-01 Task 1.
- [ ] `src/lib/plans/__tests__/pricing-display.test.ts` — migrate `src/lib/mock-data/__tests__/tag-plans.test.ts` (5 cases, update import to `../pricing-display`) + add ~3-4 `getOriginalPrice`/`getDiscountPercent` cases. Covers INF-11.
- [ ] `src/app/[locale]/help/page.tsx` — NEW route. Created in 13-02.
- [ ] No new framework install needed — Vitest is already configured.

### Tests that BREAK from the deletions (Pitfall 6)
| Test | Why it breaks | Migrate vs Delete |
|------|---------------|-------------------|
| `src/lib/mock-data/__tests__/tag-plans.test.ts` | Imports `tagPlans` from `../tag-plans` (deleted) | **MIGRATE** to `src/lib/plans/__tests__/pricing-display.test.ts`, import `../pricing-display`. 5 genuine cases — do not drop. |
| `src/components/layout/__tests__/whatsapp-button.test.tsx` | Tests the deleted button | **DELETE** — only 2 `it.todo()` stubs, no real assertions, no coverage to lose. |

No other test imports any of the 3 deleted mock modules — the Pitfall 6 cascade is minimal here (1 migrate, 1 delete).

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Mock-data arrays as the catalog source | Supabase via `src/lib/db/destinations.ts` read layer | Phases 10-12 (v1.1) | Phase 13 finishes it — `sitemap.ts` + `esim/[slug]` still on mock arrays must cut over |
| WhatsApp floating button for support | Static `/help` FAQ + `mailto:` | Phase 13 (this phase) | External-dependency-free support surface |
| `.eslintrc` legacy config | ESLint 9 flat config (`eslint.config.mjs`) | Already migrated | `no-restricted-imports` slots into flat config with no plugin |

**Deprecated/outdated:**
- The v1.1 SUMMARY's "18 mock-data import sites" / "no mock-array importers in production after Phases 11-12" — outdated; current grep shows 8 importers, 2 still on mock arrays in production routes.

## Open Questions

1. **Is `src/hooks/use-plans.ts` still live?**
   - What we know: it imports `getPlansForDestination` (a deleted-module helper) and will break on deletion.
   - What's unclear: whether any component still calls `usePlans`.
   - Recommendation: planner runs `grep -rn "use-plans\|usePlans" src/`. If orphaned → delete the file (cleanest). If live → repoint to a Supabase path. Likely orphaned post Phase 11.

2. **`esim/[slug]/page.tsx` Supabase cutover depth.**
   - What we know: it uses `mockDestinations`, `getPlansForDestination`, `getStartingPrice`, `tagPlans` and has `generateStaticParams`/`generateMetadata`.
   - What's unclear: how much rework the RSC needs — `db/destinations.ts` has `getDestinationBySlug`/`listPlansForDestination`/`listActiveDestinations` ready, so it's a mechanical repoint mirroring the Phase 11 browse cutover.
   - Recommendation: 13-01 must scope this explicitly as a task; `tsc`/`build` is the proof. This is the phase's main risk surface.

3. **`.planning/config.json` location.**
   - What we know: it was not found at the path the research init expected.
   - Recommendation: planner confirms; absent/`true` → keep the Validation Architecture section (default).

## Sources

### Primary (HIGH confidence — direct file reads / greps, 2026-05-17)
- `grep -rn "mock-data/..."` across `src/` — the 8-importer inventory
- `grep -rni "whatsapp|wa.me"` across `src/` + `messages/` — the WhatsApp artifact inventory
- `src/lib/mock-data/{destinations,plans,tag-plans}.ts` — helper purity analysis
- `src/lib/mock-data/{checkout,coupons,dashboard,delivery}.ts` import lines — kept-files clean confirmation
- `src/lib/config/support.ts`, `src/components/layout/whatsapp-button.tsx`, `src/app/[locale]/layout.tsx`
- `src/components/checkout/payment-error.tsx`, `src/components/delivery/{provisioning-error,setup-guide}.tsx`, `src/app/[locale]/dashboard/page.tsx` — error-state line refs
- `src/components/referral/share-buttons.tsx` — referral-share KEEP confirmation
- `src/components/layout/legal-footer.tsx` — footer integration point
- `src/app/[locale]/privacy/page.tsx` — static-route precedent
- `eslint.config.mjs` + `package.json` — flat-config + version confirmation (eslint ^9, next 15.5.15, next-intl ^4.9.1)
- `messages/en.json` (+ 5 locale greps) — i18n namespace + copy-string line refs
- `13-CONTEXT.md`, `REQUIREMENTS.md`, `STATE.md` — phase scope

### Secondary (MEDIUM confidence)
- `.planning/research/v1.1/{SUMMARY,ARCHITECTURE,PITFALLS-referenced}` — v1.1 wave context (note: SUMMARY's import-count figures are stale vs current grep)
- ESLint 9 flat-config `no-restricted-imports` `patterns`/`group` shape — core-rule, no plugin (training data, consistent with `@eslint/eslintrc@^3` setup)
- `next-intl` 4.9 `getTranslations`/`setRequestLocale` for static localized routes (training data, matches the privacy/terms precedent)

## Metadata

**Confidence breakdown:**
- Mock-data importer inventory: HIGH — exhaustive grep, every line verified.
- Helper extraction: HIGH — full source read of `plans.ts`/`tag-plans.ts`; pure vs coupled is unambiguous.
- ESLint rule: HIGH — flat config read directly; `no-restricted-imports` is a core rule.
- WhatsApp inventory: HIGH — exhaustive grep across `src/` + `messages/`; the 5th copy string and the `.env.example` non-issue are flagged.
- /help route: HIGH — precedent file read; next-intl wiring is the established codebase pattern.

**Research date:** 2026-05-17
**Valid until:** ~2026-06-16 (stable — codebase inventory; only invalidated by further commits to `src/`)
