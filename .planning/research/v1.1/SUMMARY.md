# Research Summary — v1.1 Live Data Cutover

**Project:** eSIM Panda
**Domain:** Next.js 15 RSC + Supabase — mock-to-live catalog cutover + WhatsApp removal
**Researched:** 2026-05-13
**Confidence:** HIGH

---

## Executive Summary

eSIM Panda v1.1 is a surgical correctness fix, not a new-feature milestone. The backend (Celitech sync, Stripe, webhooks, eSIM delivery) already runs end-to-end against real data. The gap is that every UI read path — browse page, plan-card, comparison-sheet, pricing, coupon validation, checkout server component — still imports from `src/lib/mock-data/`. The 226 destinations and 2,812 plans are in Supabase; no UI surface is reading them. This milestone closes that gap and simultaneously removes the WhatsApp support integration that was already commented out of the layout but left half-wired across translation files, config modules, and error states.

The recommended approach is a five-wave, dependency-ordered cutover. Wave 0 applies the additive schema migration (`popularity_rank`, `region_bucket` curation columns) and runs the backfill script to copy curation metadata from mock data into Supabase. Wave 1 introduces `src/lib/db/destinations.ts` and cuts the browse page over to a hybrid RSC/client architecture — server fetches the catalog, client owns search/filter/animation via Zustand. Wave 2 cuts checkout, pricing, and coupon validation. Wave 3 deletes `src/lib/mock-data/destinations.ts`, `plans.ts`, `tag-plans.ts`, and all WhatsApp artifacts in a single cleanup commit. Wave 4 runs E2E verification against real Stripe test-card + real Celitech plan. Zero new runtime dependencies are required at any wave.

The key risks are not architectural — they are execution traps. RLS silently returns empty arrays (not errors) on policy failures, so an incorrectly configured anon-key read looks like "no data" instead of an error. The service worker's cache name was never versioned, meaning returning users and iOS app users will serve stale pre-cutover content until manually evicted. Persisted Zustand cart state holds v1.0 mock plan IDs that don't exist in Supabase; the cart must be version-migrated or cleared on upgrade. The WhatsApp removal is a 10-artifact deletion — the floating button is already hidden, but error copy, env vars, translation keys, and test files all still reference it. Each trap is predictable and has a clear prevention strategy documented at file-level specificity.

---

## Key Findings

### Recommended Stack

No new dependencies. The existing stack — `next@15.5.15`, `@supabase/ssr@0.10.2`, `@supabase/supabase-js@2.103.3`, `vitest@4.1.4`, `zustand@5.0.12` — covers every v1.1 requirement. Wrapping Supabase calls in `unstable_cache` from `next/cache` with `revalidate: 3600` and tag-based invalidation handles catalog caching without TanStack Query or SWR. Client-side filtering on 226 destinations is objectively faster than any server-side search alternative. The `vi.mock('@/lib/supabase/server', ...)` chained-mock pattern already exists in `src/lib/auth/__tests__/order-linking.test.ts` and is the correct test boundary for catalog functions.

**Core technologies:**
- `next@15.5.15` + RSC + `unstable_cache`: hybrid RSC/client page pattern; ISR `revalidate: 3600` for browse and destination-detail pages
- `@supabase/ssr@0.10.2`: server-component catalog reads using anon key through RLS; service-role key restricted to scripts and server-only API routes
- `vitest@4.1.4` + `vi.mock`: existing mock pattern reused for new `lib/db/destinations.ts` module; extract shared factory once 3+ catalog tests accumulate
- `zustand@5.0.12`: `useBrowseStore` retains client-side search-filter state; comparison store migrated from `string[]` IDs to full `Plan[]` objects

**What NOT to add:** TanStack Query, SWR, msw, `pg_trgm`, Supabase Storage SDK, Prisma, or any third-party Supabase mock helper.

### Expected Features

**Must ship to close v1.1 (table stakes — no regression):**
- Destination grid renders skeleton then real Supabase data with no FOUC
- Plan-card list renders skeleton then real Supabase data with no FOUC
- Country-flag fallback when `image_url` is null (affects ~146 of 226 Celitech destinations)
- Three distinct empty/error states using existing Bambu poses (`empty`, `error`, `preparing`)
- Client-side destination search preserved — no server-side debounce
- Network-error state with a Retry that actually retries
- WhatsApp button + `support.ts` + `whatsapp.*` i18n keys deleted from codebase (all 6 locale files)
- `/help` static route with FAQ + `mailto:` contact, linked from footer
- Zero `mock-data/` imports in any component under `src/` (verified by grep)

**Should ship (makes live version better than mock):**
- Bambu `loading` pose for catalog fetches exceeding 300ms
- Blurred-image cross-fade from flag fallback to real Pexels photo
- Optimistic destination-card render from URL slug param (before Supabase fetch resolves)
- ISR hard-pin for top-12 destinations via `generateStaticParams`

**Defer to v1.2+:**
- Bambu `success` micro-celebration on plan-list mount (taste call; validate in QA first)
- Notify-me on "plans coming soon" empty state (needs email-capture table + double-opt-in)
- Refetch-on-tab-focus for catalog freshness (wait for telemetry showing staleness matters)

**Anti-features to avoid:**
- Per-card Suspense streaming (hurts TTFB; worse visual than skeleton to bulk swap)
- Server-side debounced search (226 rows is 25 KB; round-trip per keystroke is strictly worse)
- Generic stock-photo placeholder for missing `image_url` (country flag is correct and honest)
- Toast notification on fetch error (disappears; leaves user with no recovery path)
- Live chat widget to replace WhatsApp (breaks PWA, costs money, needs staffing)
- Mock-data as silent fallback when Supabase is down (creates two-source-of-truth chaos)

### Architecture Approach

The cutover follows a hybrid RSC/client pattern already established in `app/[locale]/esim/[slug]/page.tsx` and `app/[locale]/checkout/page.tsx`. Browse becomes an async RSC that calls `getCatalog()` from `src/lib/db/destinations.ts` (new module, mirroring `src/lib/db/orders.ts`), passes `{ destinations, regionalPlans }` as props to a `<BrowseClient>` client component, which owns Zustand stores, Framer Motion, and the search filter. All 18 mock-data import sites are mapped and assigned to a specific wave.

**Major components introduced by v1.1:**
1. `src/lib/db/destinations.ts` — typed Supabase query module; `listActiveDestinations`, `listPlansForDestination`, `getDestinationBySlug`, `getPlanById`, `getCatalog`; mirrors `orders.ts` style; marked `server-only`
2. `src/lib/plans/pricing-display.ts` — extracted pure-compute helpers (`getOriginalPrice`, `getDiscountPercent`, `getBestDiscount`, `tagPlans`) currently embedded in mock-data files; survives mock-data deletion
3. `scripts/backfill-curation.mjs` — one-off Node script; copies `popularity_rank`, `image_url`, `region_bucket` from mock data into Supabase by `iso_code`; idempotent (writes only where target is NULL); deleted after Wave 3
4. `supabase/migrations/00003_destinations_curation_metadata.sql` — adds `popularity_rank INTEGER NOT NULL DEFAULT 9999` and `region_bucket TEXT`; adds two indexes; no RLS change

**Comparison store fix required:** `useComparisonStore.selectedPlanIds: string[]` must become `selectedPlans: Plan[]`. The current pattern does `mockPlans.find(id)` which has no post-cutover equivalent.

### Critical Pitfalls

1. **RLS silently returns empty arrays, not errors (Pitfall 1)** — Anon-key queries denied by RLS return `{ data: [], error: null }`. Browse page shows "No destinations" with no error logged. Prevention: post-sync invariant check with anon-role client; distinguish `loading`/`empty`/`error` states explicitly; staging E2E asserting `destinations.length > 0` against real Supabase.

2. **PWA service worker serves stale pre-cutover content (Pitfall 5)** — `CACHE_NAME = 'esim-panda-v1'` was never versioned. Returning users and iOS Capacitor app users keep serving old HTML/JS for hours post-deploy. Prevention: bump to `esim-panda-v2` (or inject build hash); ship an update-prompt on `controllerchange`; must land in the same deploy as the data cutover.

3. **Persisted Zustand cart holds dead v1.0 mock plan IDs (Pitfall 14)** — Users with an existing cart hold IDs like `p001-0001-4000-8000-000000000000` that do not exist in Supabase. Checkout silently fails or 404s. Prevention: add `version: 2` to Zustand persist config with migrate function; re-validate plan IDs against Supabase on cart hydration.

4. **WhatsApp removal leaves half-wired error copy (Pitfall 8)** — The button is commented out of the layout, but `payment-error.tsx`, `provisioning-error.tsx`, `setup-guide.tsx`, and all 6 locale JSON files still say "contact us on WhatsApp." Prevention: treat removal as a 10-artifact checklist; component + test + `support.ts` + layout import + 6 locale files + env var + error copy in 4 components — all in one PR.

5. **Regional EU/AS/GL destinations have no Celitech ISO equivalent (Pitfall 3)** — The mock uses synthetic `iso_code='EU'`, `'AS'`, `'GL'`. Celitech does not return these. The backfill script's ISO-code join matches zero rows for the three regional hero cards. Prevention: hardcode explicit UPSERT for the three regional rows before the country-level backfill loop; explicitly map Celitech regional SKU codes to those rows in `sync.ts`.

**Additional high-severity pitfalls:**
- **Pitfall 6:** 36 files import mock data; migrating tests in the wrong order silently drops coverage. Use ESLint `no-restricted-imports` to block new imports during migration.
- **Pitfall 2:** Service-role key leak via client bundle. Add `import 'server-only'` to every file touching `SUPABASE_SERVICE_ROLE_KEY`; add CI grep.
- **Pitfall 9:** Coupon min-order threshold is in USD cents but labelled "EUR 9.99"; display copy and referral reward coupons must migrate to Supabase.
- **Pitfall 12:** Browse page latency regression if fetch is done per-interaction. Enforce single-fetch + in-memory filter pattern.

---

## Implications for Roadmap

The architecture research prescribes five waves with explicit dependency gates. These map directly to roadmap phases.

### Phase 1: Schema and Backfill (Wave 0)

**Rationale:** All UI code reading `popularity_rank` and `region_bucket` will fail until these columns exist. The migration is additive and zero-risk (nullable defaults, no RLS change). The backfill is the prerequisite for Wave 1 verification. Pure DB work with no UI surface area — isolated risk.
**Delivers:** Supabase schema ready; `popularity_rank` set for ~80 curated destinations; regional EU/AS/GL rows explicitly seeded; `region_bucket` populated; all 226 destinations queryable by anon key through existing RLS.
**Addresses:** Pitfall 1 (RLS verification), Pitfall 3 (regional destinations), Pitfall 7 (idempotent backfill design).
**Verification gate:** `select count(*) from destinations where popularity_rank < 9999` returns at least 80; EU/AS/GL rows present; anon-key query returns data.length > 0.

### Phase 2: Read-Layer Module and Browse Cutover (Wave 1)

**Rationale:** `src/lib/db/destinations.ts` is the shared read boundary for all subsequent waves. Build it once here to prevent copy-paste Supabase queries. Browse is the highest-traffic surface and riskiest visual change — validate the RSC/client hybrid pattern before touching the payment path.
**Delivers:** `src/lib/db/destinations.ts` (typed queries, `server-only`); `src/lib/plans/pricing-display.ts` (extracted helpers); browse page RSC + `<BrowseClient>`; `useDestinations` replaced by `useDestinationsFilter(props)`; `useComparisonStore` migrated to store full `Plan[]`; skeleton states for destination grid.
**Addresses:** Pitfall 4 (hydration mismatch prevention via RSC initial data), Pitfall 12 (single catalog fetch + in-memory filter), Pitfall 13 (no server-side search), Pitfall 11 (`supabase gen types` baseline).
**Research flag:** None — the existing `app/[locale]/esim/[slug]/page.tsx` is the exact pattern precedent. Standard implementation.

### Phase 3: Checkout, Pricing, and Coupon Cutover (Wave 2)

**Rationale:** Browse cutover dogfoods `getPlanById` via destination-card cart-add, which checkout then reuses. `MockPlan` must be renamed to `Plan` across all stores before deletion is possible. Pricing and coupon validation are the highest-stakes correctness requirements — they affect what users pay.
**Delivers:** `src/lib/checkout/pricing.ts` reads from Supabase; `api/checkout/validate-coupon` hits Supabase; `app/[locale]/checkout/page.tsx` fetches plan by ID; `MockPlan` to `Plan` rename across `cart.ts`, `quick-checkout.ts`, and 5 checkout components; Zustand persist `version: 2` with cart migration; skeleton for plan-card list.
**Addresses:** Pitfall 6 (test migration), Pitfall 9 (coupon min-order currency semantics), Pitfall 14 (persisted cart version migration), Pitfall 10 (source-currency assertion).
**Verification gate:** Real Celitech plan ID survives checkout session; coupon min-order rejection still works; price displayed equals price sent to Stripe.

### Phase 4: Cleanup and WhatsApp Removal (Wave 3)

**Rationale:** Deletion is last because TypeScript breaks everywhere there is an unresolved import. After Wave 2, the last `MockPlan` import is gone; deletion is safe. WhatsApp removal belongs here because it is independent of the data cutover and bundling it with cleanup prevents merge-conflict noise during Waves 1-2.
**Delivers:** `src/lib/mock-data/destinations.ts`, `plans.ts`, `tag-plans.ts` deleted; backfill script deleted; WhatsApp button component + test + `support.ts` + layout imports + 6 locale JSON namespaces + 4 error-state copy strings + env vars all removed; `/help` static FAQ route shipped; CI grep blocks future WhatsApp re-introduction.
**Addresses:** Pitfall 8 (WhatsApp half-wired removal).
**Verification gate:** `grep -r "mock-data/destinations\|mock-data/plans" src/` returns zero hits. `grep -rn "whatsapp\|wa.me\|WhatsApp\|WHATSAPP" src/ messages/` returns zero hits outside of `share-buttons.tsx` referral share (intentional keep).

### Phase 5: E2E Verification and Deploy (Waves 4-5)

**Rationale:** No point running E2E against a partially-cutover system. Service worker cache bump and env var cleanup must be a coordinated release action in the same deploy.
**Delivers:** Real Stripe test-card purchase of a real Celitech plan delivers a real eSIM QR code; sitemap reflects 226 live destinations; ISR cache verified; Lighthouse LCP on /browse within target; service worker bumped to `esim-panda-v2` with update-prompt; `NEXT_PUBLIC_WHATSAPP_NUMBER` removed from Vercel env vars; test count at or above pre-cutover baseline.
**Addresses:** Pitfall 5 (service worker stale content); Pitfall 14 (localStorage v1.0-format cart tested manually).

### Phase Ordering Rationale

- Schema before code: any component reading `popularity_rank` crashes without the column. Migration is zero-downtime.
- Read layer before consumers: `src/lib/db/destinations.ts` is shared by browse and checkout. Build once.
- Browse before checkout: highest visual risk, lower stakes (no money path). Validates RSC/client hybrid before applying it to the payment flow.
- Type rename before deletion: `MockPlan to Plan` must propagate across all stores before the file can be deleted without TypeScript errors.
- Cleanup last: deletion is the milestone's definition-of-done.
- WhatsApp in cleanup wave: independent of data cutover; keeps PRs focused during Waves 1-2.
- E2E after all code: partial-cutover verification gives false confidence.
- SW cache bump in same deploy as code: different deploys create a window where code is new but cache is old.

### Research Flags

Phases needing deeper research: none. Every wave has a direct codebase precedent.

Phases with standard patterns (skip `/gsd:research-phase`): all waves. The codebase already contains the exact patterns needed — `src/lib/db/orders.ts` (query module style), `app/[locale]/esim/[slug]/page.tsx` (RSC/client hybrid), `src/lib/auth/__tests__/order-linking.test.ts` (vi.mock chain pattern), `src/lib/esim/sync.ts` (service-role script style).

**Pre-Phase-1 decision gate required:** What to do with the 146 Celitech destinations that have no curation metadata (not in the 80 mock destinations). Options: (a) hide from browse page until manually curated — default assumption in this research; (b) show in an "Other" region bucket; (c) seed `region_bucket` from Celitech's `region` field. Product owner must decide before Wave 0 executes.

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All decisions verified against installed package.json, existing codebase patterns, and Next.js 15.5 docs. Zero new dependencies — conservative and safe. |
| Features | HIGH | Scoped to UX behaviors introduced by the cutover; verified against actual source files (destination-grid.tsx, use-destinations.ts, bambu/ component tree). Anti-features are grounded in specific architectural trade-offs at 226-row scale. |
| Architecture | HIGH | All patterns derived from existing codebase equivalents (orders.ts, sync.ts, esim/[slug]/page.tsx). Wave order is dependency-driven. The 18-file mock import map was verified by grep. |
| Pitfalls | HIGH (code) / MEDIUM (live Celitech data) | Code-specific pitfalls (RLS behavior, SW cache, Zustand persist, WhatsApp artifacts) verified against actual files. Claims about Celitech's catalog (which ISO codes for regional bundles, plan currency fields) are spot-checked, not exhaustively confirmed. |

**Overall confidence:** HIGH

### Gaps to Address

- **Regional SKU mapping:** Celitech's regional bundle identifiers for EU/AS/GL destinations are not fully documented. The backfill script must handle the mismatch explicitly, but the exact Celitech region codes need to be confirmed by querying live sync data in Supabase before Wave 0 runs.
- **Celitech plan currencies:** Research assumes all `retail_price_cents` are USD. Wave 2 verification should include a query checking for any plans where `currency != 'USD'`.
- **iOS Capacitor SW behavior:** WKWebView's interaction with service workers differs in edge cases. Pitfall 5 prevention requires TestFlight verification post-deploy.
- **Uncurated destinations product decision:** 146 destinations in Celitech have no `region_bucket`. Whether they appear on the browse page must be decided before Wave 0.

---

## Sources

### Primary (HIGH confidence)

- Codebase: `src/lib/db/orders.ts` — typed query module pattern; error handling; joined selects
- Codebase: `src/lib/esim/sync.ts` — service-role write-path; script structure
- Codebase: `src/lib/supabase/server.ts`, `client.ts` — anon/service client factories
- Codebase: `supabase/migrations/00001_initial_schema.sql` — destinations/plans schema, RLS policies
- Codebase: `src/lib/auth/__tests__/order-linking.test.ts` — existing `vi.mock('@/lib/supabase/server')` chain pattern
- Codebase: `src/app/[locale]/esim/[slug]/page.tsx` — RSC/client hybrid precedent
- Codebase: `src/components/bambu/` — 8 mascot variants already shipped
- Codebase: `src/components/layout/whatsapp-button.tsx`, `src/lib/config/support.ts` — WhatsApp artifact scope
- Codebase: `scripts/sync-catalog-once.mjs` — backfill script style reference
- Codebase: `public/sw.js` — service worker cache strategy and versioning gap
- Next.js 15.5 docs: `unstable_cache`, `revalidateTag`, `remotePatterns`, App Router ISR (verified 2026-05-13)
- Supabase docs: `@supabase/ssr` 0.10.x + anon-key RLS behavior (verified 2026-05-13)

### Secondary (MEDIUM confidence)

- Next.js 15 App Router patterns: RSC + Suspense vs skeleton trade-offs; per-card streaming anti-patterns (training data, matches codebase behavior)
- Service worker stale-cache post-mortems: `CACHE_NAME` versioning requirement (training data, consistent across multiple sources)
- Supabase `gen types typescript` codegen workflow (training data; verified tooling exists)

### Tertiary (LOW confidence — needs live confirmation)

- Celitech regional bundle ISO codes in live Supabase: assumed to differ from mock EU/AS/GL — spot-checked, not exhaustive
- Celitech plan currency field values: assumed all USD — not verified across all 2,812 rows
- iOS WKWebView service worker edge-case behavior: inferred from web SW spec; requires TestFlight verification

---
*Research completed: 2026-05-13*
*Milestone: v1.1 Live Data Cutover + WhatsApp Removal*
*Ready for roadmap: yes*
