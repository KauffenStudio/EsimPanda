# Pitfalls Research — v1.1 Live Data Cutover

**Domain:** Mock-data → Supabase cutover for an existing Next.js 15 + Capacitor + PWA eSIM reseller. Also: WhatsApp removal from product surface.
**Researched:** 2026-05-13
**Confidence:** HIGH (grounded in this repo's actual code — RLS policies, mock-data shape, service worker, Capacitor config, existing tests). MEDIUM where claims depend on production Celitech catalog data, which has only been spot-checked.

> **Scope:** This document only covers pitfalls introduced by ADDING live Supabase reads + removing WhatsApp on top of an already-shipped v1.0. General eSIM/Stripe/regulatory pitfalls live in `.planning/research/PITFALLS.md` (v1.0 baseline) and are NOT repeated here.

---

## Critical Pitfalls

---

### Pitfall 1: Anon-Key RLS Returns Zero Rows on Synced Plans (Empty UI Despite Live DB)

**What goes wrong:**
The migration `00001_initial_schema.sql` defines `Public can read active destinations/plans` policies as `USING (is_active = true)`. The Celitech sync job runs with the service-role key and bypasses RLS, so it can insert anything. But when the **browser** (anon key) queries `plans` after cutover, the RLS predicate is re-evaluated. If even a subset of synced plans was inserted with `is_active = false` (e.g., Celitech "discontinued" bundles, regional plans the sync flags as unavailable, or rows where `is_active` defaulted incorrectly during backfill), they will be invisible to the UI even though they exist. Worse — if RLS is enabled but no SELECT policy is added for an authenticated context the developer assumes "covers" it, `select()` returns `{ data: [], error: null }` (success with empty array, no error thrown). The Browse page renders "No destinations found" instead of a 500.

**Why it happens:**
- Supabase RLS silently filters; it does not raise on policy denial. Developers learning RLS expect a 403 and don't notice the empty array
- The catalog sync was written before the live-data cutover and was tested only via service-role (which bypasses RLS) — the anon-key path was never exercised
- `is_active` on `plans` defaults to `true` but a backfill UPDATE that touches every row could accidentally toggle it (e.g., a script that maps mock → live and writes `is_active: row.someField` where `someField` is undefined → false)

**Warning signs:**
- Browse page renders the loading skeleton then "no results" only against production, never against local Supabase
- `select count(*) from plans where is_active = true` (via SQL editor with anon role impersonation) returns far fewer than the 2,812 you expect
- `supabase.from('plans').select('*').limit(1)` from the browser console returns `[]` with no error
- Tests pass (because they mock the Supabase client) but staging is empty

**Prevention:**
- Add a **post-sync invariant check** in the sync job: after inserting/upserting, run `SELECT count(*) FROM plans WHERE is_active = true` with the **anon role** (use `set role anon` or a separate query with the anon client) and assert it matches the inserted count. Fail loud on mismatch
- Add an end-to-end test that uses the browser/anon Supabase client (not mocked) against a seeded local Supabase, asserting `destinations.length > 0` and `plans.length > 0` on first paint
- In `use-destinations` and `use-plans`, distinguish three states explicitly: `loading`, `empty (real)`, `error`. Never collapse `error` into `empty`. Log when `data` is `[]` so the empty case is observable
- Sanity-check the RLS policy: add a comment to the migration that says "if you add new columns like `is_visible` or `is_published`, you MUST update the SELECT policy"

**Phase to address:** Wave 1 — Schema & sync invariants (before any UI cutover). Must be verified in staging before Wave 2 (UI cutover).

---

### Pitfall 2: Service-Role Key Leaked to the Client Bundle

**What goes wrong:**
The cutover requires a backfill script (`scripts/backfill-curation.mjs` or similar) that needs to UPDATE rows in `destinations` and bypass RLS, which means it uses `SUPABASE_SERVICE_ROLE_KEY`. A junior pattern is to put that key in `NEXT_PUBLIC_SUPABASE_SERVICE_KEY` to "make it work everywhere," or to import `service-role` Supabase client from a file that is also imported by a `'use client'` component. Next.js inlines `NEXT_PUBLIC_*` into the client bundle. Result: anyone can run `npm run build && grep -r 'eyJ' .next/static` and extract a key that grants root-level access to your DB.

**Why it happens:**
- `.env.local` already contains both `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` (verified). The naming convention is similar enough that copy-paste mistakes happen
- The dev wants to "test the backfill from a page" and writes a Server Action that imports `createServiceClient`. Server Action code is server-only — fine. But then someone re-uses that helper inside a `'use client'` file and the bundler follows the import, inlining everything
- `@supabase/supabase-js` does not have a guard that refuses to run the service-role key in the browser

**Warning signs:**
- A file in `src/lib/supabase/` named `service.ts` or `admin.ts` is imported by a `.tsx` file that has `'use client'`
- `npm run build` succeeds but `npx next-bundle-analyzer` shows `@supabase/supabase-js` in a client chunk along with a long JWT-looking string
- `grep -r "SERVICE_ROLE" src/` returns hits in any file under `src/components/`, `src/hooks/`, or any file without `'server-only'` at the top

**Prevention:**
- Add `import 'server-only'` as the **first line** of any file that touches `SUPABASE_SERVICE_ROLE_KEY`. This makes the build crash if the file is ever imported by a client component
- Keep service-role usage in two places only: (a) `scripts/*.mjs` run via Node (never bundled), (b) API route handlers / Server Actions explicitly marked `server-only`
- Add a CI grep: `! grep -rE "SERVICE_ROLE|service.*role" src/components src/hooks src/stores src/app/**/*.tsx` — fails the build if a client-bundled file references the service key
- Verify `NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY` does NOT exist in `.env.local`, `.env.production`, or Vercel env vars. Audit before deploy
- The backfill script in `scripts/` should read the key with `process.env.SUPABASE_SERVICE_ROLE_KEY` (no `NEXT_PUBLIC_` prefix) and use `@supabase/supabase-js` directly (not `@supabase/ssr`), so there is no chance Next picks it up

**Phase to address:** Wave 1 (when introducing the backfill script — set up the guardrails before writing the script). Verify once more before Wave 5 (deploy).

---

### Pitfall 3: Mock "EU/AS/GL" Virtual Destinations Don't Match Celitech's Regional SKU Layout

**What goes wrong:**
Mock data has three hand-crafted "regional" destinations: `Europe (iso_code='EU', region='europe-wide')`, `Asia (iso_code='AS', region='asia-wide')`, `Global (iso_code='GL', region='global')`. These three rows carry curated `image_url` and `popularity_rank=0` (used to sort regionals to the top). The backfill script naively joins mock → live on `iso_code`. But Celitech does NOT expose `iso_code='EU'`/`'AS'`/`'GL'` — its regional bundles surface as plans tagged to a synthetic destination (e.g., `region_code='EUR-44'` or similar) or as plans without a country destination at all. The sync may have created the three regional destinations with different iso/slug values (or not at all), so the backfill UPDATE matches zero rows for the three highest-value cards on the home page. End result: home page renders 60 country cards but the three big regional hero cards (`Europe`, `Asia`, `Global`) are missing or have no image.

**Why it happens:**
- ISO 3166-1 alpha-2 has no codes for "Europe" or "Asia." The mock used `EU`, `AS`, `GL` as placeholders that don't actually correspond to anything Celitech returns
- Celitech's catalog API lists per-country and per-region SKUs but uses its own region identifiers, not ISO codes
- The sync code currently in `src/lib/esim/sync.ts` likely uses Celitech-returned destination identifiers, so regional bundles either landed under a different identifier or were skipped entirely
- The `region_bucket` column being added in v1.1 was designed to hold values like `europe-wide`/`asia-wide`/`global`, but unless the backfill explicitly creates the three regional rows OR maps Celitech regional SKUs to them, those values never get populated

**Warning signs:**
- After backfill, `select * from destinations where iso_code in ('EU','AS','GL')` returns 0, 1, or 2 rows (not 3)
- The home page shows the country grid but the regional hero strip at the top is empty or shows broken images
- `getStartingPrice('a1b2c3d4-0001-...')` (the mock id for Europe) now returns 0 because no plans match `destination_id` in live data
- Plans table has rows whose `destination_id` is NULL or whose destination has `iso_code` like `EUR-44`, `ASIA-15`, `R1` (Celitech's region identifiers)

**Prevention:**
- Make the backfill script **idempotent and explicit** about regional destinations: hardcode an UPSERT for `EU`, `AS`, `GL` rows BEFORE running country-level backfill. Use these rows as the parent for any Celitech regional SKU that the sync mapped elsewhere
- During the sync step, **map Celitech regional codes to the three canonical destinations**: anything Celitech labels as a Europe-44 bundle → assign `destination_id` to the `EU` destination row. Document the mapping table in `src/lib/esim/sync.ts` so future provider additions extend it
- Add an invariant test: `expect((await supabase.from('destinations').select().in('iso_code', ['EU','AS','GL'])).data.length).toBe(3)`
- Decide what `region_bucket` is for and document it. Currently the schema has both `region` (e.g., `'europe'`) and the new `region_bucket` (e.g., `'europe-wide'`). The mock conflates these via the single `region` field. The backfill MUST set both correctly OR collapse them into one column before going live
- Run the backfill twice in staging — first run should match second run exactly (idempotent). Catches scripts that mutate state cumulatively (e.g., appending to a JSON column)

**Phase to address:** Wave 1 (schema + sync mapping decisions). Verify in Wave 3 (UI consumes live data) by visually comparing home-page regional strip pre- and post-cutover on staging.

---

### Pitfall 4: Hydration Mismatch from Sync `useMemo` → Async Fetch (Next 15 RSC + Client Boundary)

**What goes wrong:**
Current `useDestinations` returns `mockDestinations` synchronously, so the **first render of the Browse page** (whether server or client) has the destination list ready. Replacing with an async Supabase fetch in a client hook means the first render returns `[]` and the second render (after `await`) returns the data. In Next 15 with App Router, if the page is rendered as an RSC and a client component below it expects data on first paint, you get either: (a) a flash of empty grid → grid pops in 200–800ms later (jarring), (b) a hydration mismatch warning if the server tree diverges from the first client tree (e.g., server fetched server-side but client hook re-fetched and got a different shape), or (c) a hydration error on dark mode because the initial `[]` renders zero cards (no theme-dependent styles applied), then the data arrives and dark-mode classes get re-evaluated.

**Why it happens:**
- Mock data is module-level, so `useMemo(() => mockDestinations.filter(...), [...])` returns synchronously
- Supabase fetches return promises; even with React 19's `use()` or RSC streaming, the boundary between server-fetched and client-re-fetched state is easy to get wrong
- The Browse page is currently a client page (uses `useBrowseStore`, search input, animations). It cannot become a pure RSC, so the fetch happens client-side
- `next/dynamic` with `ssr: false` would mask the mismatch but kills SEO for the destination landing pages

**Warning signs:**
- Browser console shows `Warning: Hydration failed because the initial UI does not match what was rendered on the server`
- The destination grid visibly flashes empty before populating (worse on slow networks)
- Lighthouse CLS score jumps from green to red on the Browse page after cutover
- Dark mode appears to "snap on" 200ms after the page loads
- iOS Capacitor wrap shows white flash before content because the splash screen hides before data arrives (`launchAutoHide: false` is set but the React tree calls `SplashScreen.hide()` based on render, not data readiness)

**Prevention:**
- **Fetch destinations server-side in the Browse page RSC**, pass as initial data prop to the client component: the client `useDestinations` hook accepts `initialData` and only re-fetches if needed (or never, if data is fresh). This keeps the first paint correct AND keeps the destination list searchable client-side
- For per-destination plans (which depend on selected destination, so cannot be server-prefetched for all), show a **skeleton with the right shape** (3–4 placeholder plan cards with the same height) so layout doesn't shift
- Reserve grid height: the destination grid should have `min-h-[80vh]` so the empty → populated transition does not push the viewport
- Move `SplashScreen.hide()` call to fire only after the first useful payload (destinations) has loaded, not on initial mount. Otherwise iOS users see a 500ms white screen
- Add a Playwright test that checks `await page.locator('[data-testid=destination-card]').count() > 0` immediately after `goto('/browse')` with `waitUntil: 'domcontentloaded'` — fails on empty flash

**Phase to address:** Wave 2 (data hooks rewrite). Visual regression check (Playwright + percy or screenshot diff) in Wave 4 verification.

---

### Pitfall 5: PWA Service Worker Serves Stale Pre-Cutover Pages to Returning Users for Hours

**What goes wrong:**
`public/sw.js` uses **cache-first for static assets** (images, scripts, styles) and **network-first with cache fallback for navigations**. After the cutover deploys, returning users with an installed PWA or recently-visited site keep getting the old cached HTML and JS. The cache key is `esim-panda-v1` and the activate handler only deletes caches whose name is NOT `esim-panda-v1` or `esim-qr-data` — meaning the SAME cache name keeps accumulating old assets. Browse page may render with the new JS bundle but cache-first hands back the stale `_chunks/destinations-XXX.js` that still imports from `mockDestinations`. The user sees mock data for hours until the cache expires or they hard-reload.

Worse — `_next/` paths are explicitly passed through (line 50 of `sw.js` excludes them), so JS *should* be fresh, but `image` and `style` are cache-first. Any cached image URLs (Pexels) for destinations that got dropped from Celitech now show a broken card, while new destinations have no cached image and load slow.

The iOS Capacitor app loads `https://esimpanda.co` remotely — it shares the same Service Worker. App users get the same staleness, but without a way to "shift-reload" inside a WKWebView shell.

**Why it happens:**
- `CACHE_NAME = 'esim-panda-v1'` was hardcoded in v1.0 and never versioned. The activate handler depends on the name CHANGING to clear old entries
- The SW's "pass-through" rules for `_next/` are correct only because Next ships JS with content hashes in the filename — but HTML (the navigation request) is cached, and HTML is what bootstraps the new JS chunks
- iOS doesn't expose a "clear cache" UI for WKWebView — users would have to delete + reinstall the app
- The SW lacks a `version` parameter or a build-time injection, so deploys do nothing to invalidate

**Warning signs:**
- Vercel deploy completes, you open the site in your already-logged-in browser, and you still see the old layout
- User reports: "I see destinations I bought yesterday but the prices are different" (old cached prices, new live prices on plan-detail)
- Service Worker dev tools shows `esim-panda-v1` cache with entries dated before the deploy timestamp
- iOS app users on TestFlight report different UI than web

**Prevention:**
- **Bump the cache name to `esim-panda-v2`** as part of this milestone. Better: inject a build hash via a Webpack/Next plugin or a small `npm run build` postscript that rewrites `sw.js`. Simplest: change to `esim-panda-${PACKAGE_VERSION}` and bump package.json version
- Add a **service-worker update prompt**: when the new SW activates, post a message to all clients; show a toast "New version available — tap to refresh" that calls `window.location.reload()`. There is already a `PushManager` component imported in the layout — extend it (or add a sibling) to handle `controllerchange`
- For the navigation request handler, switch the catalog routes (`/browse`, `/esim/[slug]`) from network-first to **stale-while-revalidate with a short max-age**, so users get fast page loads but always re-validate
- Move the `image` cache strategy from cache-first to **cache-with-expiry** (1 hour for destination images) using `cache.match` + `cached.headers['date']` comparison. Or use a versioned image URL (append `?v=${build_hash}`) so a new build forces a new cache key
- For iOS, add `WKWebView` configuration to ignore HTTP cache on the initial nav request (`limitsNavigationsToAppBoundDomains: true` is set but doesn't affect cache). Consider sending `Clear-Site-Data: cache` response header on the next deploy's first response (one-time nuke) — only works for web, but is the cleanest mass-invalidation tool
- Document the **rollback path**: if the cutover ships but breaks something, rolling back the code alone isn't enough — the old SW cache is gone. You'd have to ship a third deploy. Plan accordingly

**Phase to address:** Wave 5 (deploy prep). Cache-name bump + update prompt MUST land in the same deploy as the data cutover, otherwise users keep stale data.

---

### Pitfall 6: Test Cascade — 36 Files Import `mockPlans`/`mockDestinations` Directly

**What goes wrong:**
The grep showed mock data is imported by stores, components, hooks, pricing logic, structured-data, sitemap, and many test files. Renaming or deleting `src/lib/mock-data/` is a thermonuclear refactor. Specifically: `src/stores/quick-checkout.ts`, `src/stores/cart.ts`, `src/lib/seo/structured-data.ts`, `src/app/sitemap.ts`, and 8+ component files import from `@/lib/mock-data/*`. Tests like `pricing.test.ts` rely on **specific plan IDs** (`p001-0001-4000-8000-000000000000`) and **specific prices** (`1699` cents = Europe 5GB) — if you delete the mock module, those tests fail; if you make `mockPlans` an empty array but keep the export, those tests pass with `null` returns and you lose coverage silently.

Test coverage is a moat. The current pricing.test.ts verifies the **STUDENT15 min-order €9.99 rule** — if you migrate it sloppily, you might think "the test passes" while actually the assertion is `result.discount_cents === 0` because `result === null` and the `!.discount_cents` access fails or coerces.

**Why it happens:**
- Mock data was the single source of truth in v1.0. Test fixtures are seductive when "real" data is heavy to set up
- Vitest with `vi.mock('@/lib/supabase/server')` requires a deliberate mock setup that didn't exist before
- Some tests use `result!` non-null assertion (`expect(result!.subtotal_cents).toBe(449)`) — if result becomes null after the refactor, this throws inside the assertion machinery and Vitest may report a confusing error instead of a clean fail
- `sitemap.ts` and `structured-data.ts` are SSR/build-time code that read mocks synchronously. Switching them to async Supabase reads changes the API surface (now returns a Promise)

**Warning signs:**
- `npm test` runs but reports `0 tests passing` instead of failing — because Vitest skipped a suite that had a top-level await error
- A test file imports `mockPlans` and the IDE shows "unused import" after the refactor — the assertion no longer references it but the import lingers
- `next build` succeeds but `next start` 500s on the sitemap because `getDestinations()` is now async and the sitemap handler awaits incorrectly
- Coverage report shows pricing.ts at 100% but the actual branch (min-order rejection) was never exercised because the test data couldn't be loaded

**Prevention:**
- **Inventory before refactoring.** Run `grep -rn "mock-data" src/ | wc -l` and `grep -rn "mockPlans\|mockDestinations" src/ | wc -l` and pin the numbers in the migration plan. After Wave N, the count should be 0 (excluding tests that explicitly test the catalog layer)
- **Migrate tests in two passes:** (1) Create a test fixture layer `src/lib/__test-fixtures__/catalog.ts` that exports the same shape as live data but with stable IDs. (2) Replace `import { mockPlans } from '@/lib/mock-data/plans'` with `import { catalogFixtures } from '@/lib/__test-fixtures__/catalog'` in tests AND mock the Supabase client to return those fixtures. Tests now decouple from the live module
- **Keep mock-data files alive until all tests migrate.** Don't delete `src/lib/mock-data/` until the last test file no longer imports from it. Use `eslint --rule "no-restricted-imports: { paths: ['@/lib/mock-data'] }"` to block NEW imports while the old ones get migrated
- **Replace `!.field` with `expect(result).toMatchObject({ ... })`** in tests — fails cleanly if `result` is null instead of throwing on property access
- For `sitemap.ts` and `structured-data.ts`: these are server-side only — make them async, fetch from Supabase with the service-role client (build-time only), and add a **caching layer** so the build doesn't make 226 round-trips. Use `unstable_cache` from Next 15 or a build-time JSON dump
- Run `npm test 2>&1 | grep -E "(passed|failed|skipped)"` after each migration step and verify the test count does not drop. A dropping test count is the canary

**Phase to address:** Wave 2 (parallel with hook rewrite). Test count regression check in Wave 4 verification: total tests run must be ≥ pre-cutover count.

---

### Pitfall 7: Backfill Script Re-Run Wipes Live Curation (Lost popularity_rank Edits)

**What goes wrong:**
The backfill script copies `image_url` and `popularity_rank` from `mockDestinations` into the live `destinations` table, keyed by `iso_code`. If the team later edits `popularity_rank` directly in the Supabase dashboard (e.g., to bump Portugal up because of a marketing push) and someone re-runs the backfill script (because "let's update the Pexels images"), the script overwrites the production edits with stale mock values. The mock file becomes a hidden god-state that silently undoes manual operator changes.

Alternatively: the backfill is non-idempotent. First run inserts the `EU/AS/GL` regional destinations; second run inserts them AGAIN (duplicate key error on slug, or duplicate rows if the script INSERTs without ON CONFLICT). Either way, re-running is now scary, and "scary" scripts get run with stale data because nobody wants to figure out the right state.

**Why it happens:**
- Backfill scripts are written under deadline pressure and tend to be "INSERT … ; UPDATE …" without `ON CONFLICT DO UPDATE` or `WHERE col IS NULL` guards
- The mental model is "mock-data is the seed" but after cutover, **Supabase is the source of truth** and mock-data is dead. The script must reflect this — write-once for missing fields, never overwrite
- Operator UI for editing destinations doesn't exist yet, so manual edits happen in the Supabase dashboard with no audit trail
- The migration history (`supabase/migrations/`) has 5 files already — adding the v1.1 schema changes inline (not via a migration) makes the backfill a separate execution step that's easy to forget on staging vs prod

**Warning signs:**
- A second run of the backfill prints "updated 226 rows" instead of "updated 0 rows" (idempotent script should be a no-op)
- Operators report "I bumped Portugal's popularity yesterday and now it's back to default"
- `popularity_rank` history (if you log it) shows oscillation between mock value and operator value

**Prevention:**
- Make the backfill **write only when target is NULL/empty**: `UPDATE destinations SET image_url = $1 WHERE iso_code = $2 AND (image_url IS NULL OR image_url = '')`. Same for `popularity_rank`. This makes the script safe to re-run AND respects manual edits
- Add a `--force` flag for the case where you really do want to re-seed everything (e.g., new Pexels image set). Log every overwritten value so the operator can rollback if needed
- Wrap the backfill in a **single transaction** so a partial failure rolls back. Otherwise iso-code mismatches partway through leave the DB inconsistent
- Run the backfill via a **proper Supabase migration** if it's a one-time seed: `supabase/migrations/00006_v1_1_curation_backfill.sql`. This gives you migration history, automatic ordering, and no chance of "forgot to run it on prod"
- **Print a dry-run summary first**: "Would update 5 destinations: [Portugal, Spain, Italy, France, Germany]. Continue? [y/N]" — catches the case where iso_code mismatches mean almost nothing matches
- After backfill, run a verification query: `SELECT count(*) FROM destinations WHERE image_url IS NULL OR image_url = ''` — should be zero (or a known list of regions Celitech doesn't cover that you've decided are fine without images)

**Phase to address:** Wave 1 (schema + backfill). Idempotency test in Wave 1 verification.

---

### Pitfall 8: WhatsApp Removal Leaves Half-Wired Components — Translation Keys, Imports, iOS URL Handler

**What goes wrong:**
The layout already comments out `<WhatsAppButton />`, but the **component file still exists**, the **import is still present (just commented)**, `WHATSAPP_SUPPORT_URL` is still imported by `payment-error.tsx`, `provisioning-error.tsx`, `setup-guide.tsx`, and `share-buttons.tsx`. The `src/lib/config/support.ts` file still exports the URL using `NEXT_PUBLIC_WHATSAPP_NUMBER` env var. Both `messages/en.json` and `messages/pt.json` (and the other four locales) contain a `whatsapp.*` translation namespace AND inline references to WhatsApp in `dashboard.error_body`, `delivery.errors.generic`, `referral.shareWhatsapp`, etc. Just commenting out the button means: **the floating button is gone but every error state still says "contact us on WhatsApp"** with no button to do so. Users hit an error and see "contact us on WhatsApp" with no way to comply → support email gets 3x volume from confused users.

Additionally: `share-buttons.tsx` has a hardcoded `https://wa.me/?text=...` for the **referral share flow** (line 84). This is a different use of WhatsApp (sharing a link via WhatsApp, not getting support). Removing all WhatsApp from the product means making a decision: do we keep referral sharing via WhatsApp (because students use it) or remove all of it?

iOS Capacitor: `limitsNavigationsToAppBoundDomains: true` means external `wa.me` links would fail to open inside the WebView, so they have already been failing in the iOS app for non-https schemes. Removing the link is a UX improvement, not a breaking change for iOS. But the `share-buttons.tsx` `wa.me` link assumes the OS opens it externally — verify on iOS device.

`NEXT_PUBLIC_WHATSAPP_NUMBER` env var lingering in `.env.local` is harmless but adds confusion. CSP and `config.xml` (`<access origin="*" />`) allow everything currently, so no CSP changes needed. But if the product later adds a strict CSP, `wa.me` would need to be removed from the allowlist.

**Why it happens:**
- "Removing a feature" is interpreted as "remove the button" but features have UI, copy, configuration, env vars, tests, share affordances, translation keys, and analytics events — all need pruning
- Translation file edits are tedious across 6 locales (en, pt, es, fr, ja, zh) and "I'll do it later" turns into "forever"
- Tests reference the component (`src/components/layout/__tests__/whatsapp-button.test.tsx`) — deleting the component without deleting the test breaks the test suite

**Warning signs:**
- `grep -rn "whatsapp\|wa.me\|WhatsApp\|WHATSAPP" src/ messages/` returns ANY hits after Wave 6
- A user opens the Dashboard with an error and sees `t('dashboard.error_body')` rendering "contact us on WhatsApp" but no button visible
- `npm test` passes but `whatsapp-button.test.tsx` is testing a deleted component (Vitest collects no tests from the file)
- Bundle analyzer still shows the WhatsApp SVG icon in a chunk

**Prevention:**
- **Make a checklist of every artifact** (this is the actual deletion plan):
  1. Delete `src/components/layout/whatsapp-button.tsx`
  2. Delete `src/components/layout/__tests__/whatsapp-button.test.tsx`
  3. Delete `src/lib/config/support.ts` (or keep it as a generic support URL helper for email)
  4. Remove the commented `WhatsAppButton` import from `src/app/[locale]/layout.tsx`
  5. Remove `WHATSAPP_SUPPORT_URL` import + usage from `payment-error.tsx`, `provisioning-error.tsx`, `setup-guide.tsx`. Replace the "contact us on WhatsApp" CTA with a "Contact support" mailto: or contact-form link
  6. Update `share-buttons.tsx` — decide: remove WhatsApp share button OR keep it (it's user-initiated share, not your support contact). Recommended: keep it for the referral share, it's a feature for the user
  7. Remove `whatsapp` namespace from `messages/{en,pt,es,fr,ja,zh}.json`
  8. Update every `*.error_body` / `*.errors.generic` / `dashboard.help.contact` / `delivery.success.help` / `delivery.failed.contact` translation that says "WhatsApp" → "contact support" or "email us"
  9. Remove `NEXT_PUBLIC_WHATSAPP_NUMBER` from `.env.local` and Vercel env vars
  10. Add a CI grep to prevent regression: `grep -rn "whatsapp\|wa.me\|WhatsApp" src/ messages/ && exit 1`
- For step 8, use a script to find every WhatsApp-mention string across all 6 locales: `for f in messages/*.json; do grep -n -i "whatsapp" $f; done` — the resulting list IS the work item
- After removal, scan with a fresh eye for **dangling references in dashboard error states**. Visit each error path manually (or via Playwright)
- For `share-buttons.tsx`: if keeping referral WhatsApp share, document explicitly that this is "user-shares-via-WhatsApp" (outbound) not "user-contacts-us-via-WhatsApp" (inbound), so the distinction is preserved

**Phase to address:** Wave 6 (WhatsApp removal). CI grep added in Wave 6, blocks merges in future PRs from re-introducing.

---

### Pitfall 9: Coupon `min_order_cents=999` (€9.99) Calibrated for Mock Prices Misfires on Real Celitech Plans

**What goes wrong:**
`STUDENT15` has `min_order_cents: 999` (€9.99) per `src/lib/checkout/coupons.ts`. The pricing test (`pricing.test.ts`) verifies that France 1GB (mock price 449 cents = $4.49) is rejected. But the `validateCoupon` function compares `orderAmountCents` (in **USD cents** from the plan's `retail_price_cents`) against `min_order_cents=999` (in cents of an unspecified currency). Mock data is all in USD. Real Celitech catalog is also USD (confirmed). But the **comment says "€9.99"** while the code compares against USD cents. So today: cents are USD, threshold is "999 USD cents = $9.99", and the test passes because mock prices happen to align.

Risk after cutover: (a) the comment is misleading and someone "fixes" it by converting to EUR (829 cents) → rule changes silently. (b) Real Celitech plans may have prices that fall just under 999 cents for a tier that v1.0 wasn't designed for (e.g., a $9.50 country plan) — `STUDENT15` rejects, customer is confused. (c) Coupon copy in the UI says "Min €9.99" but the customer's displayed price is in their selected currency (EUR/GBP/BRL), so a €9.49 EUR plan (which is more than $9.99 USD) gets rejected with a "minimum €9.99" error → looks like a bug.

Additionally: `getMockInfluencerCoupons()` and `getAllActiveRewardCoupons()` are called inside `validateCoupon` and read from in-memory mock stores (`src/lib/referral/mock`). After cutover, these MUST also move to Supabase or coupons disappear for authenticated users with referral rewards.

**Why it happens:**
- Currencies were never normalized in v1.0 because everything was USD with a display-layer conversion (`formatPrice` converts USD cents to target currency at display time)
- Coupon min_order semantics are implicit — "is this the price you charge or the price the customer sees?"
- Mock plan price grid was hand-tuned to make the test fixture stories work; real data has gaps and edge cases
- The `validateCoupon` function does the comparison in raw cents without recording the currency, so the threshold is always interpreted as USD cents but labelled "€9.99" in copy

**Warning signs:**
- Customer in PT sees a €9.50 plan, applies STUDENT15, gets "min order €9.99 required" → opens a support ticket
- Plan with `retail_price_cents = 949` (a perfectly legal Celitech plan) gets coupon rejected with no clear reason in the response
- The error message returned to the client is `'min_order'` but the UI hardcodes "minimum €9.99" — confusing if the displayed price is in GBP or JPY
- Referral reward coupons no longer apply for any user (because `getAllActiveRewardCoupons` returns empty when its mock store is gone)

**Prevention:**
- **Decide a single rule and document it inline:** "Minimum order is calculated against the plan's `retail_price_cents` value (USD). Display copy translates the threshold to user's currency at render time."
- **Translate min-order copy at display time**: instead of hardcoding "€9.99" in the UI, compute `formatPrice(999, userCurrency)` and render the threshold in the user's currency. This makes the error message accurate regardless of currency selection
- **Migrate coupons to Supabase**: a `coupons` table with `code, discount_percent, min_order_cents, is_active, type, valid_from, valid_until` is a tiny addition. Migrate `STUDENT15`, `WELCOME10`, and referral rewards. Validate-coupon route now hits Supabase
- **Audit real Celitech prices against the min_order threshold**: write a one-shot script that lists plans with `retail_price_cents < 999` and decide policy: lower threshold, accept rejection, or special-case
- **Add a Playwright test** that selects a currency (EUR, GBP), applies STUDENT15 to a borderline plan, asserts the error copy reflects the user's currency
- **Add an integration test** for the validate-coupon route that hits a seeded Supabase, not mocks — proves the coupon table is wired

**Phase to address:** Wave 3 (pricing/checkout cutover). Coupon table migration in Wave 1 if you want it tested early; otherwise Wave 3.

---

### Pitfall 10: Currency-Conversion Drift — Real Plan Prices Display in EUR Using Stale `RATES`

**What goes wrong:**
`src/lib/currency/rates.ts` has a hardcoded `RATES` object: `EUR: 0.92, GBP: 0.79, …`. There's a comment "Update periodically or fetch from API" but no mechanism to do so. Mock plans were USD and the UI converts at display time. Real Celitech plans are also USD (confirmed). So the **conversion chain still works**, BUT:

1. Stale rates (0.92 USD→EUR is reasonable for early 2026 but will drift). A €9.99 customer-facing price corresponds to ~$10.86 USD; if the real rate is 0.95, the price the customer sees is now €10.31 — copy that says "From €9.99" becomes a lie
2. The displayed price doesn't match the price Stripe actually charges. Stripe charges in USD (the plan's `retail_price_cents` × tax) — the customer sees €9.99 but their card statement says $10.86 USD. With a ~$0.10 conversion fee from their bank, they feel deceived
3. After cutover, `formatPrice` is called with `plan.retail_price_cents` from Supabase, which is `INTEGER` and assumed to be `currency='USD'`. If a plan accidentally has `currency: 'EUR'` (some Celitech endpoints surface EUR pricing for European bundles), the math becomes garbage — `formatPrice(900 /* EUR cents */, 'EUR')` does `900 * 0.92` and shows €8.28 instead of €9
4. JPY has no decimal places — `formatPrice` handles this special case. Other no-decimal currencies (HUF, KRW, ISK) are not in `CURRENCIES` so users in those locales fall back to USD silently

**Why it happens:**
- Rates were committed once to the repo and never updated
- The display layer assumes all `retail_price_cents` are USD; this assumption is unchecked anywhere in code
- Coupon copy and marketing copy hardcode "€9.99" rather than computing it dynamically
- Stripe is the source of truth for what was actually charged, but the UI never reconciles its displayed price against the Stripe response

**Warning signs:**
- A customer in Argentina sees an Argentine peso price (would they?), but the rate hasn't been updated since 2024 — wildly off from the real ARS rate
- Stripe receipt amount differs from the order-summary displayed amount by >2%
- A new plan in Supabase has `currency='EUR'` and the UI math goes haywire (price displayed is half of actual)
- Lighthouse / a11y audit flags "minimum order" copy as untranslated for currency

**Prevention:**
- **Pin the source-currency assumption explicitly**: in `formatPrice`, if `plan.currency !== 'USD'`, log a warning. Better: refuse to display and show "Price unavailable" rather than wrong math
- **Schedule a rate refresh**: add a Vercel Cron or a Supabase Edge Function that runs `GET https://api.exchangerate.host/latest?base=USD` daily and updates a `currency_rates` table. The UI reads from that table (or from a cached JSON). Default to hardcoded RATES if fetch fails (graceful fallback)
- **Always display the actual charged amount on the order-summary** — pull it from the Stripe response (`amount` field in the PaymentIntent) and render it as authoritative. The catalog/browse price is a display estimate; the checkout price is final
- **Compute "Min €9.99" dynamically** — when a user has EUR selected, render `formatPrice(999, 'EUR')` everywhere the threshold is shown (this overlaps with Pitfall 9's prevention)
- **Add missing zero-decimal currencies** to `formatPrice` (HUF, KRW, ISK, VND) OR remove the currency switcher's exposure of currencies you can't handle
- **Verify on cutover**: spot-check 10 plans, compute `formatPrice(retail_price_cents, 'EUR')`, compare with the rate from a live FX API. If any is off by >3%, the RATES table is stale

**Phase to address:** Wave 3 (checkout cutover) for the source-currency assertion; Wave 5 (deploy/operations) for the rate refresh cron — rate freshness is operational, not blocking, but should ship within v1.1.

---

### Pitfall 11: `getOrderByPaymentIntent` Type Drift When Plan Joins Get New Columns

**What goes wrong:**
`src/lib/db/orders.ts` defines `OrderRow` with a `plans?: { wholesale_plan_id, name, data_gb, duration_days, destinations?: { name, iso_code } }` joined shape. After v1.1 adds `popularity_rank`, `image_url`, `region_bucket` to `destinations`, the joined select in `getOrderByPaymentIntent` does NOT automatically include them — but a developer using `OrderRow` may assume the new fields are available and call `order.plans.destinations.image_url` → `undefined`, no TypeScript error (because the type doesn't declare it). The order-confirmation page renders with no destination image where one used to exist (because the mock had it).

Worse: the joined select projects only the listed columns. If a different file does `select('*, plans(*)')` and gets ALL columns including the new ones, types diverge across files. The dashboard shows the image; the success page doesn't. Looks like a bug nobody can reproduce.

The `OrderRow` interface is **manually maintained** — it's not generated from the Supabase schema. Adding columns to the DB does not propagate to TypeScript. Drift is the default.

**Why it happens:**
- Hand-typed Supabase row shapes (no codegen)
- `select('column1, column2')` syntax requires manually listing every column you want; easy to forget when adding new fields
- TypeScript is happy with extra-narrow types — `obj.field` where `field` isn't declared is a compile error, but `obj.field?.subfield` with `?:` everywhere silently returns undefined

**Warning signs:**
- The order-confirmation page renders without an image, but the data is in Supabase (verified via SQL editor)
- A grep for the new column names (`image_url`, `popularity_rank`, `region_bucket`) shows them used in browse components but NOT in `src/lib/db/orders.ts`
- Two pages render different data for the same order (e.g., dashboard shows image, success page doesn't)
- `OrderRow.plans?.destinations?.image_url` is accessed somewhere but the type doesn't declare it

**Prevention:**
- **Add the new columns to every joined SELECT that touches `destinations`**: search all `*.from('orders').select(...)` and `*.from('destinations').select(...)` and update column lists. Same for `plans` if you add columns there
- **Generate Supabase types with `supabase gen types typescript`** — produces a `Database` type from the live schema. Use `SupabaseClient<Database>` so TypeScript catches schema-vs-query mismatches at compile time
- **Add an integration test for the order-confirmation page** that asserts `image_url` is non-null in the rendered DOM (Playwright or Vitest+JSDOM with mocked Supabase that returns a known row including the new columns)
- **Document the column-add procedure**: "When adding a column to destinations/plans, also update (a) the SELECT in `src/lib/db/orders.ts`, (b) `OrderRow` interface, (c) any other `select('plans(...)')` in the codebase." Grep checklist
- After Wave 1 schema changes, run `supabase gen types typescript --local > src/lib/db/database.types.ts` and commit it. Re-run on every schema change

**Phase to address:** Wave 2 (when introducing the new columns into orders.ts query) and Wave 4 (verification: visit checkout success page with a real-data order, assert image rendered).

---

### Pitfall 12: Browse Page Latency Regression — 50–200ms Supabase Round-Trip Per Filter Change

**What goes wrong:**
Mock data is in-memory: filter/sort/search on `useMemo(mockDestinations, [searchQuery])` is sub-millisecond. After cutover, if `useDestinations` refetches from Supabase on every search keystroke, you get 50–200ms per query, plus extra cost. Even if you fetch once and filter in-memory, the **first** paint is now async — Time to Interactive on Browse jumps from <100ms (mock) to 300–600ms (Supabase fetch + RSC streaming). On a slow 3G connection or in a far-from-EU Vercel region, it could be 1–2 seconds. Plan-detail pages fetch per destination — naïvely doing this on every navigation costs another round-trip.

For the iOS Capacitor app, this latency stacks with the WebView startup time, making the perceived "first useful frame" much slower than v1.0.

**Why it happens:**
- The default reflex is "useEffect → fetch on mount" which is the slowest possible pattern
- 226 destinations + 2,812 plans is small (probably <500KB JSON gzipped), but a naïve fetch downloads it on every page load
- The Browse page is searchable client-side — the data needs to be in-memory anyway. So a single full-catalog fetch is correct; per-query fetches are wrong
- Per-destination plan-detail pages have a natural cache locality (user views Portugal once, then doesn't go back), but caching is opt-in not default

**Warning signs:**
- Lighthouse Performance score drops by 10–20 points on Browse after cutover
- Web Vitals (LCP, INP) regress on `/browse` and `/esim/[slug]`
- Network tab shows multiple `from('destinations')` requests on a single Browse page session (one per keystroke or filter change)
- iOS app users report a noticeable lag before the destination grid appears
- TestFlight feedback mentions "slower than before"

**Prevention:**
- **Fetch the full catalog ONCE per session**, cache in-memory via a Zustand store or React Query. Search/filter happens in JavaScript, not in SQL. The catalog is small enough (~500KB) that this is fast and free
- **Server-render the Browse page initial state**: in the RSC, call `supabase.from('destinations').select('*').eq('is_active', true)` and pass to the client component as `initialData`. First paint is instant; the client never re-fetches unless data is stale
- **Use Next 15 caching** (`unstable_cache` or `cache()` from React) on the server fetch with a `revalidate: 3600` — catalog changes daily at most, so 1-hour cache is fine. Tag the cache `'destinations'` and revalidate on demand when sync runs
- **For plan-detail pages**: use `generateStaticParams` to pre-render the top 20 destinations at build time (`/esim/portugal`, `/esim/spain`, etc.). The rest can be SSR'd or fetched on demand. Re-export `revalidate = 3600`
- **Edge runtime where possible**: API routes that read the catalog can be `export const runtime = 'edge'` so they're served from Vercel's edge cache, ~10–30ms latency
- **Measure before optimizing**: instrument the catalog fetch with `console.time('fetch-destinations')` and add a `<DebugPanel />` in dev that shows P50/P95 latency. Pick optimizations based on real numbers, not vibes

**Phase to address:** Wave 2 (data hooks) for the in-memory cache. Wave 4 (performance verification) for Lighthouse check. Wave 5 (deploy) for ISR/edge caching decisions.

---

### Pitfall 13: `useBrowseStore` Search Query Hits Supabase With Unsanitized User Input

**What goes wrong:**
Current `useDestinations` filters in-memory: `d.name.toLowerCase().includes(query)`. Safe — `query` never reaches a database. After cutover, if someone implements server-side search ("for performance"), the natural code is:

```ts
supabase.from('destinations').select('*').ilike('name', `%${searchQuery}%`)
```

Supabase client-side queries are protected against SQL injection (parameterization is automatic), so this isn't an injection risk. BUT: `ilike` with leading `%` is a full table scan even on indexed columns; on a 226-row table it's fine, but on the **plans table (2,812 rows)** it costs more. More importantly: an attacker can craft a search query with regex-like patterns (Postgres `LIKE` interprets `%` and `_`) that DoS the search endpoint. Even more: if the search uses `or()` filter chains and the user submits a 10KB search string, the URL exceeds PostgREST's URL length limit and returns 414 errors. Browse breaks.

**Why it happens:**
- "Optimize search by moving to server" is a common premature optimization. The mock layer's in-memory filter was correct for 226 rows
- Supabase's `ilike` is wired directly to Postgres `ILIKE` — `%` and `_` are wildcards. A user typing `%` gets a different query than a user typing `a`
- Form inputs have no max-length validation by default

**Warning signs:**
- A long user search query (paste from clipboard) breaks the Browse page with a 414 or 500
- Browse search feels slower than it used to (was instant, now 200ms per keystroke)
- The Supabase logs show high request rates for `GET /rest/v1/destinations?name=ilike.*` during search

**Prevention:**
- **Keep search in-memory** for the catalog. 226 destinations is trivially filterable client-side, and it's already implemented that way
- If server-side search MUST happen (it should not for this size), **escape `%` and `_`** in user input before passing to `ilike`, and **enforce a max length** (50 chars)
- **Debounce search queries to 300ms** before any server call — current implementation has no debounce because there's no fetch cost. After cutover, debouncing matters
- Don't move to server-side search until the catalog grows past ~10,000 rows. Premature optimization, real cost

**Phase to address:** Wave 2 (data hooks). Decision should be "keep in-memory search" — document it explicitly so a future "optimization" PR is rejected.

---

### Pitfall 14: Quick-Checkout & Cart Stores Pin Plan References by Mock ID — Live Cutover Breaks Persisted State

**What goes wrong:**
`src/stores/quick-checkout.ts` and `src/stores/cart.ts` import from `@/lib/mock-data/plans`. Zustand stores typically use `persist` middleware to keep cart state across reloads (verify if true here). The persisted state contains plan IDs like `p001-0001-4000-8000-000000000000` (from `mockPlans`). After cutover, real plan IDs are random UUIDs from Supabase. Returning users with a persisted cart now hold dead references — their cart shows "1 item" but clicking checkout fails because the plan doesn't exist.

Worse: if the store stores not just the ID but the **full plan object snapshot** (price, name, currency), the user could see stale prices for hours/days until they manually clear cart. Coupon validation on checkout might pass (because the snapshot says €9.99) but Stripe charges the real price → mismatch.

**Why it happens:**
- Persisted state has implicit assumption that the underlying entity IDs are stable
- v1.0 mock-data IDs are deterministic constants; v1.1 Supabase IDs are random UUIDs from `gen_random_uuid()`
- Zustand's `persist` middleware serializes the entire store to localStorage; no schema versioning by default
- The cart/checkout flow was tested with mocked plans and never exercised against real Supabase IDs

**Warning signs:**
- A user with v1.0 cart state opens v1.1 and sees their cart, but checkout button does nothing or 404s
- localStorage has `quick-checkout-storage` with a plan ID that doesn't match any row in Supabase
- A second user reports their cart "doesn't update" — they cleared and re-added but the old snapshot persists

**Prevention:**
- **Add a `version` field to the Zustand persist config** (Zustand supports `persist({ version: 2, migrate: () => ... })`). Bump the version in v1.1 so persisted v1.0 state is invalidated on load
- **On cart hydration, re-validate plan IDs against Supabase** — fetch the plan; if not found, drop the item from cart and toast "Item no longer available"
- **Don't snapshot price/name in the cart**: store ONLY the `plan_id`. Re-fetch live price when rendering the cart. Adds 1 query per cart render; eliminates stale data
- **Migrate the persisted state**: write a `migrate(persistedState, version)` function that either translates old mock IDs to new live IDs (impossible — they're random) OR clears the cart with a notification ("Your cart was reset due to a system update")
- **Test the upgrade path**: pre-populate localStorage with v1.0 cart state, deploy v1.1, open the page, verify graceful behavior (not a crash, not a silent stale cart)

**Phase to address:** Wave 2 (stores migration) — must ship in same release as the data cutover. Verify in Wave 4 by manually setting localStorage to v1.0-format cart and loading the app.

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Keep `mock-data/` files in repo after cutover "just in case" | No risky deletion, easy rollback | New code keeps importing it, defeating the cutover; codebase has two sources of truth indefinitely | Only for ONE sprint; delete in v1.2 with a calendar reminder |
| Hand-write `OrderRow` interface instead of `supabase gen types` | Skip a tooling setup | Every schema change drifts silently; type bugs surface in production | Acceptable for prototype/v0; never beyond v1.1 |
| Hardcode RATES table in `currency/rates.ts` | No external dependency | Rates go stale; displayed prices diverge from charged prices | Acceptable until first user complaint about FX; then must move to dynamic refresh |
| Backfill via one-off script in `scripts/` instead of a migration | Faster to write | Not auditable, easy to skip on prod, can't be replayed | Acceptable for non-data backfills (e.g., regenerating images) — never for column population |
| Fetch full catalog on every page navigation instead of caching | Code is simpler | 50–200ms latency stacks; mobile users feel it | Never — caching is one-line addition with React Query / Zustand |
| Comment out `<WhatsAppButton />` instead of deleting the component | Allows quick re-enable | Component code rots, imports still pull translation strings, env vars linger | Never — comment-out is a code-smell; either revert the decision or delete fully |

---

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| Supabase RLS + anon client | Assuming RLS denial returns 403 (it returns empty array `{ data: [], error: null }`) | Always check `data.length > 0` AND `error` separately; log empty responses |
| Supabase + Next 15 RSC | Re-fetching server-fetched data on the client (waterfall) | Server-fetch in RSC, pass as `initialData` prop to client component, hydrate without re-fetch |
| Supabase + Capacitor WKWebView | Assuming the iOS WebView shares the browser's auth state | Capacitor app has its own Supabase auth cookies; persistence config differs; test login flow on device |
| Celitech catalog + Supabase sync | Trusting Celitech's destination names as ISO codes | Maintain explicit `celitech_code → iso_code` mapping; handle unmappable codes (regional bundles) with explicit decisions |
| Stripe price + Supabase plan price | Storing price in two places, hoping they agree | Source of truth is Supabase `plans.retail_price_cents`; pass to Stripe per-transaction; Stripe should NOT have hardcoded Price IDs |
| Service Worker + Next deploy | Cache name unchanged across deploys → users get stale content | Inject build hash into `CACHE_NAME` at build time; ship update-prompt on `controllerchange` |
| Service-role Supabase client + client bundle | Importing service client from a file that's also imported by `'use client'` | Add `import 'server-only'` at top of every service-role file; CI grep blocks regression |
| next-intl translations + feature removal | Deleting the feature but leaving translation keys | Grep for the feature name across all locale files; remove or repurpose every match |

---

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Per-keystroke Supabase search | INP > 200ms on Browse; visible lag on typing | Filter in-memory; debounce only if server-side search is required | Even at 226 rows in dev; users notice |
| Per-destination round-trip on Browse render | LCP > 2.5s on /browse | Single full-catalog fetch, cache in-memory | First load on slow 3G or far-from-EU region |
| Sitemap/structured-data fetching live from Supabase on every build | `next build` takes >5 min, costs Supabase quota | `unstable_cache` with revalidate, or build-time JSON dump | At 200+ destinations + 6 locales (1200 routes) |
| Client cart hydration re-fetches each plan separately | N+1 query pattern, 5+ requests on cart-drawer open | Single `select('*').in('id', [planIds])` query | Once cart has 3+ items |
| No request deduplication across components | Same Supabase query fires from 3 components on the same page | Use React Query / SWR with stable query keys | Page with >2 components reading the same data |
| Service Worker cache-first for HTML | Returning users see old content for hours after deploy | Network-first or stale-while-revalidate for navigation requests | Every deploy with returning-user base |

---

## Security Mistakes

| Mistake | Risk | Prevention |
|---------|------|------------|
| Service-role key in client bundle | Anyone can extract from `.next/static/*` → full DB write access | `import 'server-only'` guard + CI grep |
| RLS policy assumes `is_active` is the only filter | A column added later (e.g., `is_internal`) without policy update exposes private rows | Document policy intent; review on every column add |
| Coupon validation on the client only | Customer pays €0 by spoofing the response | Always re-validate coupon server-side before creating Stripe PaymentIntent — already done in v1.0; verify cutover preserves it |
| Backfill script logs DB rows to stdout (CI) | Plan prices and IDs in CI logs, harvested by attackers | Log only counts, not row contents, in CI; sensitive output goes to a gitignored file |
| `manual_activation_code` column shape change | Previous v1.0 stored this base64-encoded; v1.1 expects PEM-format — mismatch breaks delivery | Out of scope for v1.1, but verify schema unchanged for `esims` table |
| Public read on `plans` includes wholesale price | Competitor can scrape your wholesale costs and undercut | RLS policy on `plans` should hide `wholesale_price_cents` from anon (use a view, or revoke column-level SELECT) |

---

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Empty grid flash on cutover | User thinks site is broken | Server-fetch initial state + skeleton placeholders with correct heights |
| Stale cart after upgrade | User can't check out, doesn't know why | Versioned Zustand persist + revalidation on hydration |
| "Contact us on WhatsApp" copy with no WhatsApp button | User has nowhere to go | Sweep ALL error/help copy in same PR as WhatsApp removal |
| Min-order error in EUR when actual threshold is USD | User confused, retries with different plan | Translate threshold to user currency in error message |
| New regional plans missing from home page | Loss of high-margin upsell impression | Hardcode EU/AS/GL destination rows in backfill; verify all 3 visible |
| Coupon entered, page silent | User doesn't know if coupon applied | Always show feedback (success/error/min-order) with clear copy |
| Service Worker forces app reload during checkout | User loses in-progress payment state | Don't auto-reload during active checkout; show "update available" toast only |

---

## "Looks Done But Isn't" Checklist

Things that appear complete but are missing critical pieces. Run through each at end of milestone:

- [ ] **Live data cutover:** Browse page renders real destinations — but verify ALL 6 entry points (home page hero, /browse, /esim/[slug], cart, checkout summary, dashboard purchase history) read from Supabase. Grep `mock-data` count must be 0 in production code paths
- [ ] **Backfill complete:** `popularity_rank` set — but verify it for ALL 226 destinations, not just the top 10 you spot-checked. Also `image_url` (zero NULL after backfill), `region_bucket` (matches the three buckets)
- [ ] **Regional plans visible:** Home page shows Europe/Asia/Global cards — but click each and verify there are plans associated and they load
- [ ] **Coupon system:** STUDENT15 works — but also: WELCOME10, any influencer codes, any referral reward codes. Min-order rejection still works for a 1GB plan
- [ ] **WhatsApp removal:** floating button gone — but also: no translation key mentions "WhatsApp," no `WHATSAPP_SUPPORT_URL` imports, no `wa.me` links in support flows, env var removed
- [ ] **Service Worker:** new cache name shipped — but also: returning user with old SW gets prompted to refresh, iOS app users get same behavior
- [ ] **Tests:** all tests pass — but also: test count did not drop (`vitest --reporter=verbose | grep "Tests"`), pricing tests still verify min-order rule, type generation matches schema
- [ ] **Type drift:** new columns added — but also: every joined `select('plans(...)')` query lists the new columns OR explicitly excludes them with documented reasoning
- [ ] **Performance:** Lighthouse passes — but also: tested on throttled 3G, tested in iOS Capacitor wrap, tested with cold cache, P95 < 2.5s LCP
- [ ] **Stale cart:** new users work — but also: a user with v1.0 cart data in localStorage loads v1.1 without crashing or showing zombie items

---

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Anon-key returns empty plans | LOW | Open Supabase SQL editor → check `is_active`; toggle policy or fix sync flag. If policy issue, hotfix migration |
| Service-role key leaked to client | HIGH | Rotate the key in Supabase dashboard IMMEDIATELY; audit logs for malicious activity; redeploy with key removed from client; communicate to security stakeholders if production was exposed |
| Regional destinations missing | LOW | Re-run backfill with hardcoded EU/AS/GL UPSERT block; verify count = 3 |
| Hydration mismatch crashes the app | MEDIUM | Convert affected page to RSC fetch + client component with initialData prop; deploy; verify no Sentry hydration errors |
| Service worker serving stale | MEDIUM | Ship a new deploy with bumped CACHE_NAME and a `Clear-Site-Data: cache` header on root route; users see fresh content on next reload |
| Test cascade breaks all tests | MEDIUM | Roll back the test-affecting commit; introduce fixtures layer incrementally; re-migrate tests file-by-file |
| Backfill overwrites operator edits | LOW | Restore from Supabase point-in-time backup (PITR); add `WHERE col IS NULL` guard to script; communicate to operators |
| WhatsApp copy left in dashboards | LOW | Grep + replace across `messages/*.json` in a hotfix PR; redeploy |
| Coupon min-order rejects valid orders | LOW | Lower `min_order_cents` in Supabase coupons table (after migration) or in `coupons.ts` constant; deploy |
| Currency rates stale | LOW | Update RATES table manually; deploy; in parallel, ship the cron refresh |
| OrderRow type drift causes blank images | LOW | Add columns to the join SELECT; deploy; verify on order-confirmation page |
| Slow Browse after cutover | MEDIUM | Add server-side fetch + initialData prop; add `unstable_cache` wrapper; verify Lighthouse before re-deploy |
| Cart shows dead plan IDs | MEDIUM | Bump Zustand persist version; on hydration, re-validate IDs against Supabase; drop invalid items with toast |

---

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| 1. Anon-key RLS empty rows | Wave 1 (schema + sync) | Post-sync count via anon client matches expected count; E2E test against seeded local Supabase shows non-empty Browse |
| 2. Service-role key leaked | Wave 1 (backfill script setup) + every wave (CI grep) | CI greps `src/components|hooks|stores|app/**/*.tsx` for "SERVICE_ROLE" → must be zero; bundle analyzer shows no service key in client chunks |
| 3. Regional destinations missing | Wave 1 (sync mapping) | `SELECT count(*) FROM destinations WHERE iso_code IN ('EU','AS','GL') = 3`; home page renders 3 regional cards |
| 4. Hydration mismatch | Wave 2 (data hooks) | No hydration warnings in browser console; Playwright check for destination count > 0 immediately on `domcontentloaded` |
| 5. Service worker stale cache | Wave 5 (deploy) | New CACHE_NAME version present in sw.js; tested by visiting site with old SW cached and verifying update prompt appears |
| 6. Test cascade | Wave 2 (parallel with hook rewrite) | Test count before vs after migration: count ≥ baseline; pricing.test.ts still verifies min-order branch |
| 7. Backfill overwrites operator edits | Wave 1 (backfill) | Re-run backfill = "0 rows updated"; `--force` flag exists and is gated |
| 8. WhatsApp removal incomplete | Wave 6 (WhatsApp removal) | Grep returns zero results for `whatsapp\|wa.me\|WhatsApp\|WHATSAPP` across `src/` and `messages/`; manual visit of every error path |
| 9. Coupon min-order misfires | Wave 3 (pricing/checkout cutover) | Real plans audited; min-order copy renders in user's currency; integration test with seeded Supabase coupons |
| 10. Currency rates drift | Wave 3 (display) + Wave 5 (ops cron) | Source-currency assertion in `formatPrice`; rate cron deployed and runs |
| 11. OrderRow type drift | Wave 2 (orders.ts update) + Wave 4 (verification) | `supabase gen types` committed; visit order-confirmation page with real data, image renders |
| 12. Catalog latency regression | Wave 2 (caching) + Wave 4 (perf check) | Lighthouse LCP < 2.5s on /browse; single `from('destinations')` request per session in Network tab |
| 13. Server-side search DoS | Wave 2 (decision documented) | Code review rejects any PR moving search to server-side without explicit threshold justification |
| 14. Stale cart from persisted state | Wave 2 (stores migration) | Manual test: pre-set localStorage to v1.0 format, load v1.1, no crash, graceful cart reset |

---

## Sources

- This repository's actual code (read 2026-05-13):
  - `supabase/migrations/00001_initial_schema.sql` — RLS policy definitions for destinations/plans
  - `src/lib/mock-data/destinations.ts`, `src/lib/mock-data/plans.ts` — current mock shape and ID conventions
  - `src/hooks/use-destinations.ts`, `src/hooks/use-plans.ts` — sync useMemo pattern requiring async cutover
  - `src/lib/checkout/coupons.ts`, `src/lib/checkout/pricing.ts`, `src/app/api/checkout/validate-coupon/route.ts` — coupon + pricing wiring
  - `src/lib/currency/rates.ts` — hardcoded FX rates
  - `src/lib/db/orders.ts` — joined SELECT shape needing extension
  - `src/lib/supabase/client.ts`, `src/lib/supabase/server.ts` — anon-key SSR/CSR clients (no service-role client present, must be added carefully)
  - `public/sw.js` — service worker with stale cache risk
  - `capacitor.config.ts`, `ios/App/App/Info.plist` — iOS WKWebView config; `limitsNavigationsToAppBoundDomains: true`
  - `messages/en.json`, `messages/pt.json` — WhatsApp translation key inventory
  - `src/components/layout/whatsapp-button.tsx`, `src/components/checkout/payment-error.tsx`, `src/components/delivery/setup-guide.tsx`, `src/components/referral/share-buttons.tsx` — WhatsApp coupling points
  - `src/app/[locale]/layout.tsx` — already-commented-out button, evidence of partial removal
  - `src/lib/checkout/__tests__/pricing.test.ts` — test depending on specific mock plan IDs and prices
- Supabase docs (training data, HIGH confidence): RLS evaluation model, anon-vs-service-role behavior, PostgREST URL limits, `supabase gen types`
- Next.js 15 App Router docs (training data, HIGH confidence): RSC + client component data passing, `unstable_cache`, hydration semantics
- React 19 docs (training data, HIGH confidence): hydration warnings, server-component-to-client-component data flow
- Capacitor iOS docs (training data, MEDIUM confidence): WKWebView cache behavior, app-bound domains
- Service Worker spec MDN (training data, HIGH confidence): activate handler cache cleanup, controllerchange event
- Zustand persist middleware docs (training data, HIGH confidence): `version` and `migrate` configuration

**Note:** Confidence is HIGH for repo-grounded claims (RLS policies, mock shape, SW code, i18n keys, etc.). Confidence is MEDIUM for behavioral claims about Celitech's catalog (regional SKU naming, currency field presence) since the live sync output was not directly inspected during this research — verify against the Supabase production data in Wave 1 verification.

---
*Pitfalls research for: eSIM Panda v1.1 Live Data Cutover (mock → Supabase + WhatsApp removal)*
*Researched: 2026-05-13*
