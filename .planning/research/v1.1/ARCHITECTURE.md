# Architecture Research — v1.1 Live Data Cutover

**Domain:** Next.js 15 eSIM reseller — UI cutover from mock data to live Supabase reads
**Researched:** 2026-05-13
**Confidence:** HIGH (all recommendations grounded in existing codebase patterns at `src/lib/db/orders.ts`, `src/lib/esim/sync.ts`, `src/lib/supabase/*`)

---

## 1. The v1.1 Gap, Mapped

The backend write-path (sync, checkout, webhook, provisioning) already talks to Supabase. The catalog **read-path** is the gap. Production code reads from `src/lib/mock-data/destinations.ts` and `plans.ts` in 18 files outside tests:

| Layer | File | Mock-data dependency |
|---|---|---|
| Routes (RSC) | `src/app/sitemap.ts` | `mockDestinations` (loop for routes) |
| Routes (RSC) | `src/app/[locale]/esim/[slug]/page.tsx` | `mockDestinations`, `getPlansForDestination`, `getStartingPrice`, `tagPlans` |
| Routes (RSC) | `src/app/[locale]/checkout/page.tsx` | `mockPlans.find(...)` for plan lookup |
| API route | `src/app/api/checkout/validate-coupon/route.ts` | `mockPlans.find(...)` for min-order check |
| Hook (client) | `src/hooks/use-destinations.ts` | `mockDestinations` (sync, useMemo) |
| Hook (client) | `src/hooks/use-plans.ts` | `getPlansForDestination` (sync, useMemo) |
| Pricing | `src/lib/checkout/pricing.ts` | `mockPlans.find(...)` |
| Component | `src/components/browse/destination-grid.tsx` | `getStartingPrice`, `MockDestination` type |
| Component | `src/components/browse/destination-card.tsx` | `getBestDiscount`, `getPlansForDestination` |
| Component | `src/components/browse/regional-plan-card.tsx` | `getStartingPrice`, `getPlansForDestination`, `getBestDiscount`, `getOriginalPrice`, `getDiscountPercent` |
| Component | `src/components/browse/plan-card.tsx` | `mockPlans.find(...)` for cart add; helpers |
| Component | `src/components/browse/comparison-sheet.tsx` | `mockPlans.find(...)` for selected IDs |
| Component | `src/components/checkout/quick-checkout-bar.tsx` | helpers |
| Types | `src/stores/cart.ts`, `quick-checkout.ts`, several checkout components | `type MockPlan` (type-only, but viral) |

The `MockPlan` / `MockDestination` types are structurally identical to Supabase rows (same column names: `id`, `iso_code`, `region`, `popularity_rank`, `image_url`, `retail_price_cents`, etc.), so renaming them to canonical `Destination` / `Plan` types is a search-and-replace operation, not a refactor.

### Two derived-data buckets matter

1. **Pure-compute helpers** (`getOriginalPrice`, `getDiscountPercent`, `getBestDiscount`, `tagPlans`) — these take a `Plan` and return numbers/flags. They are **not** mock-specific; they are domain logic that lives in `mock-data/plans.ts` for historical reasons. They must be extracted into a real module (`src/lib/plans/pricing-display.ts`) so they survive the mock-data deletion.
2. **Curation metadata** in `mockDestinations` — `popularity_rank` (drives browse sort), `image_url` (Pexels URLs), and the `region` slug (`europe`, `asia`, `north-america`, etc. — distinct from Celitech's "Europe-wide / country" classification). Celitech does **not** return any of these. They must move into Supabase.

---

## 2. Decisions (with rationale)

### 2.1 RSC vs client-fetch — **Hybrid (server fetches list, client owns interaction)**

**Decision:** Convert `app/[locale]/browse/page.tsx` to an async server component that fetches the destination list and passes it as a prop to a client child (`<DestinationGridClient destinations={...} regionalPlans={...} />`). Keep all interactive logic (search filter, region pills, comparison store) in the client child.

**Why this codebase, not pure RSC or pure client-fetch:**

| Option | Verdict for this codebase |
|---|---|
| (a) Pure RSC, no client | **Rejected.** `destination-grid` uses `useBrowseStore` for search query, `useComparisonStore`, `motion/react` animations, and `useState` for region selection. A pure RSC would force a redesign of the whole browse interaction model — not a v1.1 scope. |
| (b) Client component + async hook with loading state | **Rejected for the browse page.** 226 destinations on every browse hit, fetched client-side, means: (1) loading spinner on first paint, hurting LCP and SEO on `/browse`; (2) bigger client JS bundle; (3) no benefit, because the data doesn't depend on user identity. |
| (c) Hybrid — RSC fetch + client interaction | **Chosen.** Matches the existing pattern at `app/[locale]/esim/[slug]/page.tsx` (RSC fetches destination + plans, passes `plan` prop into the client `PlanCard`) and `app/[locale]/checkout/page.tsx` (RSC fetches plan, passes into client `CheckoutPage`). Zero loading state for the catalog; client owns Zustand stores and animations. |

**Implementation shape:**

```tsx
// app/[locale]/browse/page.tsx — becomes async RSC, no 'use client'
import { getCatalog } from '@/lib/db/destinations';
import { BrowseClient } from '@/components/browse/browse-client';

export const revalidate = 3600; // ISR — same TTL as /esim/[slug]

export default async function BrowsePage() {
  const t = await getTranslations();
  const { destinations, regionalPlans } = await getCatalog();
  return (
    <div className="px-4 pt-6 pb-20 max-w-[1200px] mx-auto">
      <h1>{t('browse.title')}</h1>
      <WelcomeDiscountBanner showCta={false} />
      <BrowseClient destinations={destinations} regionalPlans={regionalPlans} />
    </div>
  );
}
```

`BrowseClient` is the current `DestinationGrid` body with `'use client'`, but `useDestinations()` is replaced by `useDestinationsFilter(destinations)` — a pure-compute hook that takes the server-fetched list and applies the search-query filter from `useBrowseStore`. No fetching, no `isLoading`, no `useEffect`.

**The plan list for plan-card / comparison sheet:** RSC pre-fetches plans for the current page (already happens at `esim/[slug]`), so `usePlans()` is replaced by a synchronous `usePlansFilter(plans)` that applies the duration filter. Comparison-sheet receives selected plan objects via props derived from a Zustand-stored array of full `Plan` objects (not just IDs) — see §2.7.

### 2.2 Catalog read path — **Direct Supabase from RSC, anon key + RLS**

**Decision:** Server components call Supabase directly using the existing `createClient()` from `src/lib/supabase/server.ts`. **Do not** add a Next.js API route layer in front of the catalog. **Do not** use the service-role client for reads.

**Cost / latency / SEO trace:**

| Path | Latency | SEO | Cost | Notes |
|---|---|---|---|---|
| **RSC → Supabase direct (anon key)** | 1 hop, in Vercel function | Excellent: rendered HTML | 1 row read | Already how `getOrdersByUser` works for the dashboard (`src/lib/db/orders.ts:138`). RLS policy `"Public can read active destinations"` already permits this (`00001_initial_schema.sql:106`). |
| RSC → `/api/catalog` route → Supabase | 2 hops (function ↔ function) | Same SEO outcome | 2 invocations | Pure overhead — no auth gate, no business logic to centralize. |
| Client fetch → Supabase | 1 hop, browser ↔ Supabase | Bad: spinner on first paint | 1 read | Anon-key is already public; security is identical. Only loses SSR benefits. |
| Client fetch → `/api/catalog` | 2 hops | Bad: spinner | 2 invocations | Worst of both worlds. |

**Why direct is safe here:** The catalog is intentionally public (`is_active = true` rows, no PII). The RLS policy on `destinations` and `plans` already exists and is correct. The anon key going through `NEXT_PUBLIC_SUPABASE_URL` is the documented Supabase pattern for SSR reads.

**ISR caching:** Add `export const revalidate = 3600;` to `/browse` (matching `/esim/[slug]`). Catalog changes via the daily Celitech sync; one-hour stale tolerance is fine. With Vercel's per-region cache, this means ~zero Supabase reads for the browse page in steady state.

**New module:** `src/lib/db/destinations.ts` — mirrors `src/lib/db/orders.ts` style:

```ts
import { createClient } from '@/lib/supabase/server';

export interface DestinationRow {
  id: string;
  name: string;
  slug: string;
  iso_code: string;
  region: string | null;
  region_bucket: string | null;
  image_url: string | null;
  popularity_rank: number;
  is_active: boolean;
}

export interface PlanRow {
  id: string;
  destination_id: string;
  wholesale_plan_id: string;
  provider: string;
  name: string;
  data_gb: number;
  duration_days: number;
  wholesale_price_cents: number;
  retail_price_cents: number;
  currency: string;
  is_active: boolean;
}

export async function listActiveDestinations(): Promise<DestinationRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('destinations')
    .select('id, name, slug, iso_code, region, region_bucket, image_url, popularity_rank, is_active')
    .eq('is_active', true)
    .order('popularity_rank', { ascending: true });
  if (error) { console.error('listActiveDestinations error:', error); return []; }
  return data ?? [];
}

export async function listPlansForDestination(destinationId: string): Promise<PlanRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('plans')
    .select('*')
    .eq('destination_id', destinationId)
    .eq('is_active', true)
    .order('retail_price_cents', { ascending: true });
  if (error) { console.error('listPlansForDestination error:', error); return []; }
  return data ?? [];
}

export async function getDestinationBySlug(slug: string): Promise<DestinationRow | null> { /* ... */ }
export async function getPlanById(planId: string): Promise<PlanRow | null> { /* ... */ }

// Convenience: split into country vs regional buckets for the browse page
export async function getCatalog() {
  const all = await listActiveDestinations();
  const REGIONAL = new Set(['europe-wide', 'asia-wide', 'global']);
  return {
    destinations: all.filter((d) => !REGIONAL.has(d.region_bucket ?? d.region ?? '')),
    regionalPlans: all.filter((d) => REGIONAL.has(d.region_bucket ?? d.region ?? '')),
  };
}
```

### 2.3 Schema migration — additive, no RLS change needed

**Decision:** New migration `00003_destinations_curation_metadata.sql`. Columns are nullable so the existing Celitech sync (`src/lib/esim/sync.ts:22`) keeps working without modification — the sync upserts `name/slug/iso_code/region/is_active/synced_at`, leaving curation fields untouched. Backfill populates them after.

```sql
-- 00003_destinations_curation_metadata.sql
-- Curation fields Celitech does not return. Populated by scripts/backfill-curation.mjs
-- from src/lib/mock-data/destinations.ts after the migration is applied.

ALTER TABLE destinations
  ADD COLUMN IF NOT EXISTS popularity_rank INTEGER NOT NULL DEFAULT 9999,
  ADD COLUMN IF NOT EXISTS region_bucket   TEXT;
-- image_url already exists from 00001 (line 8). No-op for that column.

-- Make browse-page sorts fast (the only ordered query that matters).
CREATE INDEX IF NOT EXISTS idx_destinations_popularity
  ON destinations (popularity_rank) WHERE is_active = true;

-- Make region pill grouping fast.
CREATE INDEX IF NOT EXISTS idx_destinations_region_bucket
  ON destinations (region_bucket) WHERE is_active = true;

-- NO RLS change required.
-- The existing policy "Public can read active destinations" (00001 line 106) is
-- USING (is_active = true) FOR SELECT — column-agnostic. New columns inherit.
```

**Notes:**
- `popularity_rank` default `9999` means newly-Celitech-synced countries that haven't been hand-curated sink to the bottom of the browse list rather than colliding with `rank = 0` regional plans. Operators can promote them later by editing the row.
- `region_bucket` is nullable on purpose. The existing `region` column already holds Celitech's classification (`region` or `country`). `region_bucket` holds the curation bucket (`europe`, `asia`, `europe-wide`, etc.) used by the browse-page region pills. Two columns, two purposes — don't repurpose `region`.
- `image_url` is **already** in the 00001 schema (line 8 of `00001_initial_schema.sql`). Just backfill it.

### 2.4 Backfill — one-off Node script, idempotent, matches existing pattern

**Decision:** New `scripts/backfill-curation.mjs`. Mirrors the existing `scripts/sync-catalog-once.mjs` style: `node --env-file=.env.local scripts/...`, service-role client, plain ES module. Match on `iso_code` (already `UNIQUE` per `00001_initial_schema.sql:6`).

```js
// scripts/backfill-curation.mjs
// One-off: copy curation metadata (popularity_rank, image_url, region_bucket)
// from src/lib/mock-data/destinations.ts into Supabase by iso_code.
// Idempotent. Run after migration 00003 is applied.
//   node --env-file=.env.local scripts/backfill-curation.mjs

import { createClient } from '@supabase/supabase-js';

// Dynamic import of TS via tsx, OR — easier — temporarily re-export the array as JSON.
// Simplest: just inline the data here as a const array of { iso_code, popularity_rank,
// image_url, region_bucket }. The mock file has ~80 entries; copy/paste is fine for
// a one-off script that gets deleted after Wave 3.

const CURATION = [
  { iso_code: 'EU', popularity_rank: 0, image_url: 'https://images.pexels.com/...', region_bucket: 'europe-wide' },
  { iso_code: 'AS', popularity_rank: 0, image_url: 'https://images.pexels.com/...', region_bucket: 'asia-wide' },
  { iso_code: 'GL', popularity_rank: 0, image_url: 'https://images.pexels.com/...', region_bucket: 'global' },
  { iso_code: 'FR', popularity_rank: 1, image_url: '...', region_bucket: 'europe' },
  // ... ~80 rows from src/lib/mock-data/destinations.ts
];

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY, // service-role bypasses RLS — same pattern as src/lib/esim/sync.ts:8
);

let updated = 0, skipped = 0, missing = 0;
for (const row of CURATION) {
  const { data, error } = await supabase
    .from('destinations')
    .update({
      popularity_rank: row.popularity_rank,
      image_url: row.image_url,
      region_bucket: row.region_bucket,
    })
    .eq('iso_code', row.iso_code)
    .select('id');
  if (error) { console.error(`${row.iso_code}:`, error.message); skipped++; continue; }
  if (!data || data.length === 0) { missing++; continue; } // ISO not synced from Celitech yet
  updated++;
}
console.log(`Updated: ${updated}, Missing in DB: ${missing}, Errors: ${skipped}`);
```

**Idempotency:** Each row is an UPDATE keyed on `iso_code`. Re-running overwrites with the same values — no harm.

**Pattern confirmed** against `scripts/sync-catalog-once.mjs` (service-role client, env via `--env-file=.env.local`, same import shape) and `src/lib/esim/sync.ts:8` (service-role rationale: "bypasses RLS").

**One nuance:** Celitech returns 226 ISO codes; the mock file has ~80 hand-curated ones (Europe-heavy). Countries present in Celitech but missing from the mock will keep `popularity_rank = 9999` and `region_bucket = NULL`. That's correct behavior — the browse page already groups by `region_bucket`, so uncurated countries simply don't appear on the page until someone hand-ranks them. They're still reachable via direct SEO landing (`/esim/[slug]`) once `region_bucket` is null-safe in `getCatalog()`. Confirm this matches product expectation before Wave 0 — if the answer is "show all 226 even if uncurated," then either (a) seed `region_bucket` from `region` (Celitech's continent-ish hint), or (b) include null-bucket destinations in a generic "Other" pill.

### 2.5 Mock-data file fate — **Delete entirely (don't keep as fallback)**

**Decision:** Delete `src/lib/mock-data/destinations.ts` and `src/lib/mock-data/plans.ts` in Wave 3 (after all reads are cut over). Move the four pure-compute helpers (`getOriginalPrice`, `getDiscountPercent`, `getBestDiscount`, plus `tagPlans` from `mock-data/tag-plans.ts`) into `src/lib/plans/pricing-display.ts` first.

**Why not keep as fallback:**
- The mock data drifts. It will never again match real Celitech output (226 destinations vs ~80 curated) and the prices are hand-calculated from a tier model that doesn't reflect Celitech's actual wholesale. Keeping it invites future bugs where a developer imports it thinking it's a safe local default and ships wrong prices.
- Tests don't need it. Tests should use Supabase test fixtures or mock the `@/lib/db/destinations` module — that's the boundary they actually depend on. Existing tests under `src/lib/mock-data/__tests__/` are mostly schema-validation of the mock data itself, which becomes meaningless.
- Other mock-data files (`checkout.ts`, `dashboard.ts`, `coupons.ts`, `delivery.ts`) are out of v1.1 scope — they back features already wired up. Don't touch them. The v1.1 deletion is surgical: `destinations.ts`, `plans.ts`, `tag-plans.ts`, plus their test files.

**Risk to flag:** `MockPlan` and `MockDestination` are imported as *types* in `src/stores/cart.ts`, `src/stores/quick-checkout.ts`, `src/components/checkout/checkout-page.tsx`, `order-summary.tsx`, `sticky-order-bar.tsx`, `cart-item.tsx`. These are type-only imports — they break the moment the file is deleted. Wave 2 must rename `MockPlan` → `Plan` (alias from `src/lib/db/destinations.ts`) across these files before Wave 3's deletion.

### 2.6 Phase build order — five waves, dependency-driven

| Wave | Scope | Depends on |
|---|---|---|
| **Wave 0 — Schema + Backfill** | Migration `00003`; backfill script; verify rows in Supabase | nothing — pure DB work |
| **Wave 1 — Read-layer module + browse cutover** | New `src/lib/db/destinations.ts`; new `src/lib/plans/pricing-display.ts` (extract helpers); convert `/browse` to RSC + `BrowseClient`; rewrite `useDestinations`/`usePlans` as pure-compute filters; cut `destination-card`, `destination-grid`, `regional-plan-card`, `plan-card`, `comparison-sheet` over to real types | Wave 0 (needs curation columns) |
| **Wave 2 — Pricing, checkout, coupon cutover** | Rewrite `src/lib/checkout/pricing.ts` to query Supabase; rewrite `api/checkout/validate-coupon` (Supabase plan lookup); update `app/[locale]/checkout/page.tsx` to fetch plan by ID from Supabase; rename `MockPlan` → `Plan` in cart/checkout stores + components | Wave 1 (uses same `getPlanById`) |
| **Wave 3 — Cleanup** | Delete `src/lib/mock-data/destinations.ts`, `plans.ts`, `tag-plans.ts`; delete their tests; delete `scripts/backfill-curation.mjs` (its job is done); delete WhatsApp components (pure removal, no dependencies) | Wave 2 (last `MockPlan` import gone) |
| **Wave 4 — E2E verification** | Real Stripe test-card purchases a real Celitech plan via the live flow; confirm webhook → provisioning → email delivers a real eSIM; sitemap reflects live destinations; ISR cache verified | Wave 3 |

**Why this order:**

1. **Schema before code.** Code that reads `popularity_rank` would break without the column. Migration is a no-op risk (additive, indexed, RLS untouched).
2. **Read layer before consumers.** `src/lib/db/destinations.ts` is shared by Waves 1 and 2 — build it once at the top of Wave 1.
3. **Browse before checkout.** Browse touches 5+ components and is the riskiest visual change. Checkout is a smaller surface but a higher-stakes path — do it after the type rename has settled. Also: the browse cutover dogfoods `getPlanById` (via `destination-card`'s `addItem(sorted[0])` cart-add), which checkout then reuses.
4. **Delete last.** Mock data is the blast radius — deleting before all imports are gone produces TypeScript red walls. Final deletion is a satisfying single commit ("rm -rf mock-data" minus the dashboard/coupon files).
5. **WhatsApp removal in Wave 3.** Independent of data cutover, zero risk, satisfying to bundle with the cleanup commit. No earlier — keeping it in Wave 3 prevents merge-conflict noise during Waves 1–2.
6. **E2E last.** No point E2E-testing a partially-cutover system.

**Suggested verification gate per wave:**
- W0: `select count(*) from destinations where popularity_rank < 9999;` ≥ 80; `select count(*) from destinations where region_bucket is not null;` ≥ 80.
- W1: `/browse` renders 226 destinations, region pills work, comparison sheet pulls real plans, lighthouse LCP under target.
- W2: real Celitech plan ID survives a checkout session creation; coupon validate-coupon returns correct min-order behavior; price displayed = price charged.
- W3: `grep -r "mock-data/destinations\|mock-data/plans\|mock-data/tag-plans" src/` returns zero hits. WhatsApp grep returns zero hits.
- W4: real Stripe test-card → real eSIM → real activation QR in real email. Existing v1.0 phase verification doc template applies.

---

## 3. Data flow (post-cutover)

```
Browse page request
       │
       ▼
RSC: app/[locale]/browse/page.tsx
       │  await getCatalog()
       ▼
src/lib/db/destinations.ts  ──(anon key, RLS)──▶  Supabase destinations table
       │
       │  { destinations, regionalPlans }
       ▼
<BrowseClient destinations={...} regionalPlans={...} />   ('use client')
       │  useDestinationsFilter(destinations)  — pure useMemo, reads useBrowseStore.searchQuery
       │  useState(selectedRegion)
       │  useComparisonStore  (Zustand: full Plan objects, not just IDs)
       ▼
DestinationCard  →  click  →  cart store.addItem(plan)
                                       │
                                       ▼
                              router.push('/[locale]/esim/[slug]')
                                       │
                                       ▼
                       RSC: app/[locale]/esim/[slug]/page.tsx
                              await getDestinationBySlug(slug)
                              await listPlansForDestination(dest.id)
                                       │
                                       ▼
                              <PlanCard plan={plan} />  ('use client')
                                       │
                                       │  cart store
                                       ▼
                              router.push('/[locale]/checkout?plan=' + planId)
                                       │
                                       ▼
                       RSC: app/[locale]/checkout/page.tsx
                              await getPlanById(planId)  ──▶  Supabase
                                       │
                                       ▼
                              <CheckoutPage plan={plan} />  (existing client component, untouched API)
                                       │
                                       ▼
                              POST /api/checkout/create-intent  (already Supabase-backed)
```

---

## 4. Patterns to follow

### Pattern: typed DB module per table

`src/lib/db/destinations.ts` mirrors `src/lib/db/orders.ts` exactly:
- Exported row types match Supabase columns 1:1
- Functions are `async function ...(): Promise<Row[] | null>`
- All use `await createClient()` from `@/lib/supabase/server`
- All errors logged with `console.error('<fn> error:', error)` and return `[]` / `null` (never throw to the RSC — surfaces as empty state)

### Pattern: server fetch, client interact

Server component owns: data fetching, `generateStaticParams`, `generateMetadata`, ISR `revalidate`.
Client component owns: Zustand stores, Framer Motion, search input, region selection, comparison toggle.
Boundary: RSC passes plain serializable data as props. Already the established pattern in `app/[locale]/esim/[slug]/page.tsx` → `<PlanCard>`.

### Pattern: comparison-sheet stores objects, not IDs

Current bug-in-waiting: `useComparisonStore.selectedPlanIds` is `string[]`. The sheet currently does `selectedPlanIds.map(id => mockPlans.find(p => p.id === id))` — a synchronous lookup against a globally-imported array. Post-cutover, the sheet has no global plan array. Two options:

1. **Store plan objects** in the comparison store, not IDs. `togglePlan(plan: Plan)` instead of `togglePlan(id: string)`. Cleanest, no extra fetch.
2. Fetch selected plans by ID from Supabase. Adds a query per render — wasteful for at-most-4 items already in memory.

Recommendation: **option 1**. Update `src/stores/comparison.ts` signature in Wave 1.

---

## 5. Anti-patterns to avoid (specific to this cutover)

### Anti-pattern: parallel fetches inside a component

`destination-card.tsx` currently calls `getPlansForDestination(destinationId)` synchronously inside `handleClick` (to auto-select the highest-GB plan into cart). Tempting post-cutover to make `handleClick` async and fetch from Supabase. **Don't.** That's 226 components, each one click away from a separate Supabase round-trip. Instead: the parent `DestinationGrid` (RSC) should pass `defaultPlan` (the highest-GB plan for that destination, pre-computed) as a prop to `DestinationCard`. One join, zero client fetches. The same applies to `regional-plan-card` and its starting-price computation.

### Anti-pattern: leaving `is_active=false` rows visible

Celitech sometimes flips packages off. The current `getPlansForDestination` does no `is_active` check; mock data is all true. Post-cutover `listPlansForDestination` **must** filter `eq('is_active', true)` (already shown above) and **must** rely on the RLS policy `USING (is_active = true)` as a belt-and-braces. Both layers — RLS is the security boundary; the explicit filter is for index hits via `idx_plans_active`.

### Anti-pattern: client component reading service-role key

The new `src/lib/db/destinations.ts` uses the **server** client (anon key, RLS-enforced). Service-role is only for writes (`src/lib/esim/sync.ts`, webhook). Reviewers will see a `createClient` import and may ask — be explicit in comments which client is used and why.

### Anti-pattern: blocking the browse page on the slowest destination

`getCatalog()` fetches all destinations in a single query (one round-trip, ~226 rows, ~10KB payload). Don't be tempted to "optimize" by parallel-fetching per region. The bottleneck is not Supabase round-trip latency; it's hydration. Single query, ISR-cached, done.

### Anti-pattern: deleting mock-data tests as if they don't matter

The tests under `src/lib/mock-data/__tests__/` mostly assert shape of the mock arrays themselves (e.g., "every destination has an image_url"). After deletion they're meaningless. **But** their replacement is valuable: add equivalent assertions to `src/lib/db/__tests__/destinations.test.ts` that hit a test Supabase project or stub the client and verify the row shape parser. Don't drop the coverage on the floor.

---

## 6. Integration points

### External services touched (no behavior change, just confirming)

| Service | What changes in v1.1 |
|---|---|
| Supabase | New columns, new index, new read module. No auth or write-path change. |
| Celitech | Untouched. `sync-catalog-once.mjs` and the scheduled sync keep working — they don't touch the new curation columns. |
| Stripe | Untouched. `/api/checkout/create-intent` already pulls plan from Supabase; `validate-coupon` is the only API route still on mock data. |
| Resend / email | Untouched. |
| Pexels (image URLs) | Pexels image URLs survive intact via the backfill. Long-term, consider Supabase Storage upload — out of v1.1 scope. |

### Internal boundaries

| Boundary | Direction | Notes |
|---|---|---|
| RSC → `src/lib/db/destinations.ts` | Server-only | `import 'server-only'` directive recommended at top of `db/destinations.ts` to prevent accidental client import (currently `db/orders.ts` doesn't have it — consider adding to both as a Wave 1 hardening). |
| Client component ← props from RSC | Plain serializable | `DestinationRow` and `PlanRow` are pure data — no methods, no Date objects (timestamps as ISO strings). Already true. |
| Zustand stores ← `Plan` type | Type-only | Rename `MockPlan` to `Plan` in `src/stores/cart.ts`, `quick-checkout.ts`. Import from `@/lib/db/destinations` (re-export the type as `Plan`). |
| `src/lib/plans/pricing-display.ts` ← any layer | Pure functions | Extracted helpers (`getOriginalPrice`, `getDiscountPercent`, `getBestDiscount`, `tagPlans`). No I/O. Safe to import anywhere. |

---

## 7. Scaling considerations (briefly — this isn't a v2 scale exercise)

| Scale | Behavior |
|---|---|
| Today (0 → 1k browse/day) | ISR cache on `/browse` and `/esim/[slug]`; one Supabase query per cache miss; trivial. |
| 1k → 100k browse/day | Same architecture. ISR amortizes to ~1 Supabase read per hour per region. Free-tier comfortable. |
| 100k+ | Consider edge-caching the catalog JSON as a Vercel KV blob and serving from the edge runtime. Out of scope for v1.1. |

Scaling break-point won't be reads — it'll be the Celitech webhook + Stripe write-path under purchase load, which v1.0 already validated.

---

## 8. Open questions for the roadmapper

1. **Uncurated destinations**: should countries Celitech returns but the curation backfill doesn't cover (146 of 226) appear on the browse page, hidden, or treated as "Other"? Affects whether `getCatalog()` filters out `region_bucket IS NULL`. *Default: hide until curated.*
2. **Comparison-sheet store shape**: rename Zustand state `selectedPlanIds: string[]` → `selectedPlans: Plan[]`. Small breaking change to the store API. *Recommended.*
3. **`server-only` directive**: add `import 'server-only'` to `src/lib/db/destinations.ts` and (separately) `src/lib/db/orders.ts`? Catches accidental client-side imports at build time. *Recommended — Wave 1.*
4. **Pexels → Supabase Storage**: defer? Image URLs work as-is, but external hotlinks have an availability risk. *Defer to post-v1.1.*

---

## Sources

- **Codebase (HIGH confidence):**
  - `src/lib/db/orders.ts` — typed query pattern, error handling, joined-table selects
  - `src/lib/esim/sync.ts` — service-role write-path pattern (used by backfill script)
  - `src/lib/supabase/server.ts` / `client.ts` — anon-key client factories
  - `supabase/migrations/00001_initial_schema.sql` — destinations/plans schema + RLS policies
  - `scripts/sync-catalog-once.mjs` — node script style with `--env-file=.env.local`
  - `src/app/[locale]/esim/[slug]/page.tsx` — RSC fetches data, passes to client child (precedent for §2.1)
  - `src/components/browse/destination-grid.tsx` — current client-component shape being converted

- **v1.0 architecture research (MEDIUM confidence):** `.planning/research/ARCHITECTURE.md` — established the catalog/pricing/order boundaries that v1.1 preserves

- **Next.js 15 App Router patterns** (HIGH confidence, training data + matches codebase): RSC for data fetching with async server components, `revalidate` for ISR, client boundary marked by `'use client'` on consumers of state hooks / Framer Motion

- **Supabase RLS + `@supabase/ssr`** (HIGH confidence): anon-key client honors RLS; service-role bypasses. Already validated in this codebase by the working write-path.
