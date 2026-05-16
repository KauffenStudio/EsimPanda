# Roadmap: eSIM Reseller Platform

## Overview

This roadmap delivers a mobile-first eSIM reseller platform targeting international students and young travelers in Europe. The journey moves from infrastructure and catalog (getting plan data flowing) through the revenue-critical checkout and delivery pipeline, then builds retention features (accounts, eSIM management), and finishes with growth levers (SEO, referrals) and polish (PWA, dark mode, push notifications). The architecture validates the wholesale API integration early (highest-risk dependency) and reaches first sale by end of Phase 4.

Milestone v1.1 (Phases 10-14) closes the live-data gap discovered after v1.0: the backend syncs 226 destinations / 2,812 plans from Celitech, but the UI still reads from `src/lib/mock-data/`. v1.1 cuts the UI over to Supabase and removes the WhatsApp support integration.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

### Milestone v1.0 — Initial Release

- [ ] **Phase 1: Foundation and Design System** - Project skeleton, database schema, provider abstraction layer, i18n framework, and premium design system
- [x] **Phase 2: Catalog and Browsing** - Wholesale API sync, destination pages, plan browsing with filters, comparison, and device compatibility check (completed 2026-04-20)
- [x] **Phase 3: Checkout and Payments** - Guest checkout, Stripe integration (card, Apple Pay, Google Pay, PayPal), coupon application, VAT compliance, and fraud prevention (completed 2026-04-21)
- [ ] **Phase 4: eSIM Delivery** - QR code generation and delivery (web + email), webhook-driven provisioning pipeline, and device-specific setup guides
- [ ] **Phase 5: User Accounts** - Guest-to-account conversion, email/password auth, password reset, persistent sessions
- [ ] **Phase 6: eSIM Management** - Active eSIM dashboard, data usage tracking, top-up flow, purchase history
- [ ] **Phase 7: SEO and Internationalization** - SEO-optimized destination landing pages with structured data, multi-language support (EN, PT, ES, FR)
- [x] **Phase 8: Growth and Acquisition** - Referral program with credit system, WhatsApp support integration (completed 2026-04-25)
- [x] **Phase 9: PWA and Polish** - Installable PWA, dark mode, push notifications for expiry and promotions (completed 2026-04-25)

### 🚧 **v1.1 Live Data Cutover** — Milestone in progress

- [x] **Phase 10: Schema and Curation Backfill** - Additive Supabase migration (`popularity_rank`, `region_bucket`); idempotent backfill of curation metadata from `mock-data/destinations.ts` by ISO code; explicit seed of EU/AS/GL regional rows (completed 2026-05-16)
- [ ] **Phase 11: Read-Layer Module and Browse Cutover** - Typed `server-only` read module at `src/lib/db/destinations.ts`; browse page becomes async RSC + `<BrowseClient>`; destination grid, search filter, comparison sheet, regional plans, plan cards consume live Supabase data with shimmer skeletons, typographic image fallback, and a plain inline error banner with retry (no Bambu poses)
- [ ] **Phase 12: Checkout, Pricing and Coupon Cutover** - `lib/checkout/pricing.ts`, `api/checkout/validate-coupon`, and checkout server component query Supabase by real plan ID; `MockPlan` renamed to `Plan` across cart and checkout stores; Zustand persist `version: 2` migration purges dead v1.0 plan IDs; coupon min-order copy shows `$9.99`
- [ ] **Phase 13: Cleanup, Mock Deletion and WhatsApp Removal** - Delete `mock-data/{destinations,plans,tag-plans}.ts` after pure-compute helpers extracted to `src/lib/plans/pricing-display.ts`; CI grep gate blocks new `mock-data/` imports; delete WhatsApp button + `support.ts` + 6 locale `whatsapp.*` namespaces + 4 error-state strings; ship `/help` route (FAQ + mailto)
- [ ] **Phase 13.1: Remove Bambu mascot pose system app-wide** (INSERTED) - Remove the 8 Bambu *pose* components and their usages across 22 files (auth, checkout, dashboard, PWA, delivery, browse), replacing each with plain text or existing UI primitives; keep `bambu-video.tsx` (the panda hello video) untouched
- [ ] **Phase 14: E2E Verification and Deploy** - Service worker `CACHE_NAME` bumped to `esim-panda-v2` with update prompt; end-to-end test: real Stripe test-card buys a real Celitech plan, real eSIM ICCID provisioned, real Resend email; env vars cleaned in Vercel

## Phase Details

### Phase 1: Foundation and Design System
**Goal**: Project skeleton is running with database schema deployed, wholesale provider abstraction established, i18n framework wired, and the premium design system (Tailwind + Motion) producing animated, mobile-first UI components
**Depends on**: Nothing (first phase)
**Requirements**: INF-01, INF-02, INF-06, UXD-01
**Success Criteria** (what must be TRUE):
  1. Next.js 15 app deploys to Vercel with Supabase connected and database schema migrated
  2. Provider abstraction layer exists with a normalized interface that can swap wholesale providers without changing business logic
  3. Catalog sync job runs on schedule and populates local database with plan data from wholesale API
  4. Design system produces animated, mobile-first components with Motion micro-interactions
  5. i18n framework is wired so all user-facing strings go through translation keys (even if only EN exists)
**Plans**: 3 plans

Plans:
- [ ] 01-01-PLAN.md -- Project skeleton, DB schema, provider abstraction with CELITECH adapter
- [ ] 01-02-PLAN.md -- Design system UI primitives, layout components, Bambu mascot pose system
- [ ] 01-03-PLAN.md -- i18n wiring with next-intl, catalog sync cron endpoint, app shell integration

### Phase 2: Catalog and Browsing
**Goal**: Users can browse eSIM plans by destination, filter by duration/data/price, view regional plans, compare plans side-by-side, and check device compatibility -- all from cached local data (never hitting wholesale API on page load)
**Depends on**: Phase 1
**Requirements**: CAT-01, CAT-02, CAT-03, CAT-04, DEL-04
**Success Criteria** (what must be TRUE):
  1. User can select a European destination country and see available eSIM plans with pricing
  2. User can filter plans by duration (24h, 7d, 14d, 30d, semester), data amount, and price
  3. User can view multi-country/regional plans (e.g., Europe-wide coverage)
  4. User can compare 2-3 plans side by side on a comparison view
  5. User can check whether their device supports eSIM before starting a purchase
**Plans**: 3 plans

Plans:
- [ ] 02-01-PLAN.md — Data layer (mock data, stores, hooks) + destination grid with search, photo cards, regional plan, accordion
- [ ] 02-02-PLAN.md — Plan cards with auto-tagging, duration filter chips, comparison bar and bottom sheet
- [ ] 02-03-PLAN.md — Device eSIM compatibility checker (static JSON, store with localStorage, picker UI)

### Phase 3: Checkout and Payments
**Goal**: Users can purchase an eSIM plan through a fast, secure checkout flow with multiple payment methods, discount coupons, correct EU VAT handling, and chargeback prevention
**Depends on**: Phase 2
**Requirements**: CHK-01, CHK-02, CHK-03, CHK-04, CHK-05, INF-05
**Success Criteria** (what must be TRUE):
  1. User can purchase an eSIM plan as a guest (email only, no account required)
  2. User can pay with Apple Pay, Google Pay, or card via Stripe Checkout
  3. User can pay with PayPal as an alternative payment method
  4. User can apply a student/traveler discount coupon and see the reduced price before confirming
  5. Checkout charges correct EU VAT based on customer location (Stripe Tax) and has 3D Secure + Radar enabled
**Plans**: 2 plans

Plans:
- [ ] 03-01-PLAN.md — Checkout data layer: types, pricing/coupon/tax logic, Zustand store, mock API routes, Stripe config, unit tests
- [ ] 03-02-PLAN.md — Checkout UI: Stripe Elements, all checkout components, coupon UX, Bambu payment status screens, success page, i18n

### Phase 4: eSIM Delivery
**Goal**: After successful payment, the system provisions an eSIM via the wholesale API, generates and stores the QR code securely, and delivers it instantly on-screen and via email backup, alongside device-specific setup instructions
**Depends on**: Phase 3
**Requirements**: DEL-01, DEL-02, DEL-03, INF-03, INF-04
**Success Criteria** (what must be TRUE):
  1. User sees QR code on screen immediately after successful payment (webhook-driven provisioning)
  2. User receives email with QR code backup and purchase receipt
  3. User sees step-by-step setup guide specific to their device model (iOS, Samsung, Pixel, etc.)
  4. QR code data is stored encrypted server-side and can be re-accessed if the user returns
  5. Stripe webhook handlers process payment confirmations idempotently and trigger eSIM provisioning
**Plans**: 3 plans

Plans:
- [ ] 04-01-PLAN.md — Delivery data layer: provisioning pipeline, webhook handler, encryption, mock mode, DB migration
- [ ] 04-02-PLAN.md — Delivery UI: success page transformation, smart device detection, QR/install display, setup guides, Bambu animations
- [ ] 04-03-PLAN.md — Email delivery: branded React Email template via Resend, QR code generation, receipt, referral footer

### Phase 5: User Accounts
**Goal**: Users who purchased as guests can create an account to persist their eSIM history, and returning users can log in with email/password to access their dashboard
**Depends on**: Phase 4
**Requirements**: ACC-01, ACC-02, ACC-03, ACC-04
**Success Criteria** (what must be TRUE):
  1. User who purchased as guest can create an account post-purchase and see their order linked
  2. User can log in with email and password
  3. User can reset a forgotten password via email link
  4. User session persists across browser refresh and tab close
**Plans**: 3 plans

Plans:
- [ ] 05-01-PLAN.md — Auth foundation: types, server actions, mock mode, middleware extension, PKCE callback, Zustand auth store, i18n keys, tests
- [ ] 05-02-PLAN.md — Auth pages: login/signup pages, Bambu welcome pose, auth forms, header user menu, AuthProvider
- [ ] 05-03-PLAN.md — Password reset flow and guest conversion: forgot/reset pages, branded reset email, delivery page conversion CTA

### Phase 6: eSIM Management
**Goal**: Logged-in users can manage their active eSIMs from a dashboard -- viewing status, tracking data usage, topping up data, and reviewing purchase history
**Depends on**: Phase 5
**Requirements**: MGT-01, MGT-02, MGT-03, MGT-04
**Success Criteria** (what must be TRUE):
  1. User can view a dashboard showing all active eSIMs with status, expiry date, and data remaining
  2. User can top up data on an active eSIM plan from the dashboard
  3. User can see near-real-time data usage (polled/cached, not live) for active eSIMs
  4. User can view full purchase history with order details
**Plans**: 3 plans

Plans:
- [ ] 06-01-PLAN.md — Data layer: types, Zustand store, mock data, API routes, middleware extension, i18n keys
- [ ] 06-02-PLAN.md — Dashboard UI: CircularGauge, EsimCard, tabs, low-data banner, skeleton, dashboard page
- [ ] 06-03-PLAN.md — Top-up modal with Stripe payment, purchase history with expandable rows, QR re-access

### Phase 7: SEO and Internationalization
**Goal**: Destination pages are optimized for organic search (structured data, meta tags, content) and the platform supports multiple languages to reach the pan-European student audience
**Depends on**: Phase 2
**Requirements**: GRW-02, GRW-03
**Success Criteria** (what must be TRUE):
  1. Each destination has an SEO-optimized landing page with structured data, unique content, and proper meta tags
  2. Platform supports EN, PT, ES, and FR languages with user language selection
  3. SEO pages render server-side (SSR/ISR) and are indexable by search engines
**Plans**: 3 plans

Plans:
- [ ] 07-01-PLAN.md — i18n infrastructure: expand locales to EN/PT/ES/FR, navigation module, middleware matcher, translation files
- [ ] 07-02-PLAN.md — SEO data layer and destination landing pages: structured data, FAQ templates, breadcrumb/hero/FAQ components, /esim/[slug] page
- [ ] 07-03-PLAN.md — Sitemap/robots, language switcher, browse page rewire to link destination pages

### Phase 8: Growth and Acquisition
**Goal**: Growth levers are active -- users can refer friends for credit, and support is accessible via WhatsApp
**Depends on**: Phase 5
**Requirements**: GRW-01, GRW-04
**Success Criteria** (what must be TRUE):
  1. User can share a unique referral link and earn credit when a referred friend completes a purchase
  2. Referral credits are tracked and can be applied to future purchases
  3. User can reach support via a WhatsApp button visible on all pages
**Plans**: 3 plans

Plans:
- [ ] 08-01-PLAN.md — Referral data layer, coupon extension, WhatsApp button, Wave 0 tests
- [ ] 08-02-PLAN.md — Referral UI: page, share buttons, post-purchase CTA, menu and email integration
- [ ] 08-03-PLAN.md — Admin influencer coupons page with CRUD, sortable table, stats

### Phase 9: PWA and Polish
**Goal**: The platform is installable as a PWA for offline QR access, supports dark mode, and sends push notifications for eSIM expiry and promotions
**Depends on**: Phase 6
**Requirements**: UXD-02, UXD-03, UXD-04
**Success Criteria** (what must be TRUE):
  1. User can install the app to their home screen (PWA manifest, service worker)
  2. User can access their QR codes offline after installation
  3. App supports dark mode with manual toggle (always starts in light mode)
  4. User receives push notifications for eSIM expiry warnings and promotions
**Plans**: 3 plans

Plans:
- [ ] 09-01-PLAN.md — PWA foundation: manifest, service worker, SW registration, install banner, offline indicator, i18n keys
- [ ] 09-02-PLAN.md — Dark mode completion: CSS tokens, hydration fix, dark: classes across all 60 components
- [ ] 09-03-PLAN.md — Push notifications: web-push, VAPID, server actions, notification store, permission modal, prefs UI, offline QR caching

---

**Milestone v1.1 — Live Data Cutover** (Phases 10-14)

The v1.0 backend (Celitech sync, Stripe, webhooks, eSIM delivery) works end-to-end against real data, but every UI read path still imports from `src/lib/mock-data/`. v1.1 is a surgical, dependency-ordered cutover from mock to live Supabase reads, plus the complete removal of the WhatsApp support integration that was already commented out of the layout but left half-wired across translation files and error copy.

**Five phases, dependency-driven:**

1. Schema before code — any consumer reading `popularity_rank` crashes without the column
2. Read-layer before consumers — `src/lib/db/destinations.ts` is shared by browse and checkout, build once
3. Browse before checkout — browse dogfoods the RSC/client hybrid pattern before the payment path uses it
4. Type rename before deletion — `MockPlan` to `Plan` must propagate across all stores before mock files can be deleted
5. SW cache bump in the same deploy as the cutover — different deploys create a window where code is new but cache is old
6. E2E last — partial-cutover verification gives false confidence

### Phase 10: Schema and Curation Backfill
**Goal**: Supabase `destinations` table holds the curation metadata Celitech does not return (`popularity_rank`, `region_bucket`), populated for the 80 curated destinations and explicitly seeded for the 3 regional hero rows (EU, AS, GL), so the UI's planned reads will return data instead of empty arrays
**Depends on**: Phase 9 (v1.0 complete) — no v1.1 phase precedes this
**Requirements**: INF-09, INF-10
**Success Criteria** (what must be TRUE):
  1. Migration `00003_destinations_curation_metadata.sql` is applied to production Supabase, adding `popularity_rank INTEGER NOT NULL DEFAULT 9999` and `region_bucket TEXT` plus their two partial indexes; existing RLS policy `"Public can read active destinations"` is unchanged
  2. `select count(*) from destinations where popularity_rank < 9999` returns at least 80 (curated set populated from `src/lib/mock-data/destinations.ts`)
  3. `select count(*) from destinations where iso_code in ('EU','AS','GL')` returns exactly 3 with `popularity_rank = 0` and `region_bucket` set to `europe-wide` / `asia-wide` / `global` (regional hero rows seeded by explicit UPSERT before the country-level loop)
  4. `scripts/backfill-curation.mjs` is idempotent: a second invocation against an already-populated DB reports zero updates (uses `WHERE col IS NULL OR col = ''` guards) and never overwrites operator edits
  5. An anon-key Supabase client query (`select * from destinations where is_active = true limit 1`) returns at least one row — proving RLS does not silently swallow the new columns
**Plans**: 2 plans

Plans:
- [ ] 10-01-PLAN.md — Schema migration: create `supabase/migrations/00003_destinations_curation_metadata.sql` (ALTER TABLE + 2 partial indexes), apply via `supabase db push`, verify columns + indexes via SQL
- [ ] 10-02-PLAN.md — Backfill curation metadata: defensive sync.ts allowlist patch, `scripts/backfill-curation.mjs` (regional UPSERT + guarded country UPDATE), `scripts/verify-anon-read.mjs` probe, run + verify idempotency + RLS

### Phase 11: Read-Layer Module and Browse Cutover
**Goal**: Browse page and all its child components render real Supabase destinations and plans through a shared, typed, `server-only` read module, with shimmer skeletons during fetch, typographic name-card fallbacks for missing images, and a plain inline error banner with a working Retry button (no Bambu mascot poses) — no `mock-data/` imports remain in any browse-path component
**Depends on**: Phase 10
**Requirements**: INF-07, INF-08, CAT-05, CAT-06, CAT-07, UXD-05, UXD-06, UXD-07
**Success Criteria** (what must be TRUE):
  1. `src/lib/db/destinations.ts` exists with `import 'server-only'` at the top and exports typed `listActiveDestinations`, `listPlansForDestination`, `getDestinationBySlug`, `getPlanById`, `getCatalog`; mirrors the style of `src/lib/db/orders.ts`
  2. `app/[locale]/browse/page.tsx` is an async RSC with `export const revalidate = 3600` that calls `getCatalog()` via the anon-key client and passes `{ destinations, regionalPlans }` as props to a `<BrowseClient>` client child — `grep -n "use client" src/app/\[locale\]/browse/page.tsx` returns 0
  3. User browsing the destination grid sees only curated rows (rows with `popularity_rank < 9999` or `region_bucket IS NOT NULL`); uncurated Celitech destinations are hidden until manually curated (CAT-05)
  4. User typing in the destination search filters the already-fetched catalog in-memory with no network round-trip per keystroke; `grep -n "ilike\|textSearch" src/components/browse/` returns 0 (CAT-06)
  5. User viewing a destination card whose `image_url` is null sees a typographic name card (destination name in bold type on a brand-gradient — not a flag, not a generic stock photo, not a broken image icon); the photo, when present, blur-cross-fades in over the typographic card using a `motion.img` opacity transition (CAT-07, UXD-07)
  6. User waiting for the first paint of a catalog refetch sees a shimmer destination-card skeleton grid that matches the real card height, and on Supabase error sees a plain inline error banner with a Retry button that re-runs the full catalog fetch — no Bambu mascot poses (UXD-05, UXD-06)
  7. `useComparisonStore` stores full `Plan[]` objects instead of `string[]` plan IDs; comparison sheet renders selected plans without any `mock-data` lookup
**Plans**: 3 plans

Plans:
- [ ] 11-01-PLAN.md — Server-only catalog read module (`src/lib/db/destinations.ts`) + browse page as async RSC + `<BrowseClient>` boundary
- [ ] 11-02-PLAN.md — Card components + four browse-grid states: shimmer skeleton, inline error banner with Retry, search-miss empty state, typographic image-fallback card with photo cross-fade
- [ ] 11-03-PLAN.md — Comparison store migration (`string[]` → `Plan[]`); comparison-sheet/bar/plan-card consume stored `Plan` objects

### Phase 12: Checkout, Pricing and Coupon Cutover
**Goal**: The payment path — pricing computation, coupon validation, and the checkout server component — reads from Supabase by real plan ID, the `MockPlan` type is renamed to `Plan` across all cart and checkout stores, and persisted Zustand cart state from v1.0 is purged on first load via a versioned migration
**Depends on**: Phase 11 (reuses `getPlanById` from the read-layer module; `MockPlan` rename depends on the canonical `Plan` type from `db/destinations.ts`)
**Requirements**: CHK-06, CHK-07, CHK-08
**Success Criteria** (what must be TRUE):
  1. User completing checkout against a real Celitech plan ID (UUID from Supabase) gets a Stripe PaymentIntent created at the `retail_price_cents` stored in Supabase for that exact plan; `grep -rn "mockPlans\|MockPlan" src/lib/checkout/ src/app/api/checkout/ src/app/\[locale\]/checkout/` returns 0 (CHK-06)
  2. `src/lib/checkout/pricing.ts` and `src/app/api/checkout/validate-coupon/route.ts` query Supabase via `getPlanById` (no mock-data imports) and reject any plan ID not present in Supabase with a clear error code
  3. User applying STUDENT15 to a plan under the min-order threshold sees the threshold rendered as `$9.99` (USD, the actual currency of `retail_price_cents`) instead of the misleading `€9.99` copy v1.0 used (CHK-07)
  4. User with a persisted cart from before the v1.1 deploy starts with a clean cart on first load: `useCartStore` and `useQuickCheckoutStore` use `persist({ version: 2, migrate: ... })` that drops items whose `plan_id` is not a valid UUID matching a Supabase row (CHK-08)
  5. `MockPlan` is renamed to `Plan` (re-exported from `src/lib/db/destinations.ts`) across `src/stores/cart.ts`, `src/stores/quick-checkout.ts`, and the 5 checkout components that imported the type; `tsc --noEmit` passes with zero errors
**Plans**: TBD

### Phase 13: Cleanup, Mock Deletion and WhatsApp Removal
**Goal**: The mock-data layer is gone, pure-compute pricing helpers survive in a real module, WhatsApp is fully removed from the codebase (component, config, env vars, 6 locales, 4 error-state strings, 1 test file), and a static `/help` route ships as the support entry point — both deletions in one cleanup commit because they are independent of the data cutover and bundling them prevents merge-conflict noise during Phases 11-12
**Depends on**: Phase 12 (last `MockPlan` import gone before files can be deleted; TypeScript would red-wall otherwise)
**Requirements**: INF-11, INF-13, INF-14
**Success Criteria** (what must be TRUE):
  1. `src/lib/mock-data/destinations.ts`, `src/lib/mock-data/plans.ts`, `src/lib/mock-data/tag-plans.ts` and their `__tests__/` files are deleted; `scripts/backfill-curation.mjs` is also deleted (its job is done); `grep -rn "mock-data/destinations\|mock-data/plans\|mock-data/tag-plans" src/` returns 0 (INF-11)
  2. Pure-compute helpers (`getOriginalPrice`, `getDiscountPercent`, `getBestDiscount`, `tagPlans`) live in `src/lib/plans/pricing-display.ts` with unit tests; no Supabase imports, no I/O
  3. ESLint `no-restricted-imports` rule blocks any new import from `@/lib/mock-data/destinations`, `@/lib/mock-data/plans`, or `@/lib/mock-data/tag-plans`; CI fails on regression
  4. WhatsApp removal is complete: `src/components/layout/whatsapp-button.tsx`, its test, and `src/lib/config/support.ts` are deleted; the commented import in `src/app/[locale]/layout.tsx` is removed; the `whatsapp.*` namespace is gone from all 6 locale files (`messages/{en,pt,es,fr,ja,zh}.json`); the 4 "contact us on WhatsApp" error-copy strings in `payment-error.tsx`, `provisioning-error.tsx`, `setup-guide.tsx`, and dashboard error states are replaced with "Contact support" linking to `/help`; `NEXT_PUBLIC_WHATSAPP_NUMBER` is removed from `.env.example` (INF-13)
  5. `src/app/[locale]/help/page.tsx` ships as a static route with 6-10 FAQ entries plus a `mailto:` contact link; footer in `src/app/[locale]/layout.tsx` links to `/help`; user can navigate from any error state to `/help` (INF-14)
  6. CI grep gate: `grep -rn "whatsapp\|wa.me\|WhatsApp\|WHATSAPP" src/ messages/` returns zero hits outside `src/components/referral/share-buttons.tsx` (intentional keep — user-initiated referral share, not support)
**Plans**: TBD

### Phase 13.1: Remove Bambu mascot pose system app-wide (INSERTED)
**Goal**: The Bambu mascot *pose* system is fully removed from the codebase — the 8 pose components (`bambu-base`, `bambu-empty`, `bambu-error`, `bambu-loading`, `bambu-preparing`, `bambu-success`, `bambu-travel`, `bambu-welcome`) are deleted and their usages across 22 files (auth, checkout, dashboard, PWA, delivery, browse) are replaced with plain text or existing UI primitives. The panda hello video (`bambu-video.tsx`) is kept and untouched. Inserted before Phase 14 so the E2E + deploy phase tests the final poseless UI.
**Depends on**: Phase 13
**Requirements**: UXD-09
**Success Criteria** (what must be TRUE):
  1. The 8 Bambu pose component files under `src/components/bambu/` are deleted; `bambu-video.tsx` remains
  2. `grep -rn "bambu-base\|bambu-empty\|bambu-error\|bambu-loading\|bambu-preparing\|bambu-success\|bambu-travel\|bambu-welcome\|BambuEmpty\|BambuError\|BambuLoading\|BambuPreparing\|BambuSuccess\|BambuTravel\|BambuWelcome" src/ --include=*.tsx --include=*.ts` returns 0 hits
  3. Every one of the 22 consuming files renders correctly with the pose replaced by plain text or an existing primitive — no broken imports, no empty render holes
  4. `bambu-video.tsx` and its usages are unchanged — the panda hello video still plays where it did before
  5. `npm test` passes with no regression; `tsc --noEmit` is clean
**Plans**: TBD

Plans:
- [ ] TBD (run /gsd:plan-phase 13.1 to break down)

### Phase 14: E2E Verification and Deploy
**Goal**: A real Stripe test-card purchase against a real Celitech plan UUID in Supabase completes the entire pipeline end-to-end (checkout → webhook → provisioning → encrypted activation data → Resend email with QR), the service worker cache is bumped in the same deploy as the code cutover with an update prompt for returning users, and Vercel env vars are cleaned
**Depends on**: Phase 13 (no point E2E-testing a partially-cutover system)
**Requirements**: INF-12, UXD-08, VER-01
**Success Criteria** (what must be TRUE):
  1. `public/sw.js` has `CACHE_NAME = 'esim-panda-v2'` (bumped from `v1`); the activate handler deletes the old `esim-panda-v1` cache entries; this change ships in the SAME deploy as the data cutover (INF-12)
  2. User who had v1.0 cached in their service worker (returning user OR iOS Capacitor app) loads the v1.1 site and sees a "New version available" prompt that calls `window.location.reload()` on tap — verified by manual test with a pre-seeded SW cache (UXD-08)
  3. E2E test executes against staging: a Stripe test-card payment for a real Celitech plan UUID from Supabase creates an `orders` row, triggers the webhook, provisions a real eSIM via Celitech `createPurchase`, persists encrypted activation data (AES-256-GCM) in the `esims` table, and sends a real Resend email containing the activation QR code (VER-01)
  4. `NEXT_PUBLIC_WHATSAPP_NUMBER` is removed from Vercel production env vars; total test count in `npm test --reporter=verbose` is at or above the pre-cutover baseline (no silently-skipped tests)
  5. Sitemap (`src/app/sitemap.ts`) reflects the 226 live Supabase destinations (not the 67 mock ones); structured data on `/esim/[slug]` renders from live data; Lighthouse LCP on `/browse` is within target (P95 < 2.5s)
**Plans**: TBD

## Progress

**Execution Order:**
- v1.0 phases execute in numeric order: 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9
  - Note: Phase 7 depends on Phase 2 (not Phase 6), so it could run in parallel with Phases 3-6 if desired.
  - Note: Phase 8 depends on Phase 5 (not Phase 7), so it could run in parallel with Phase 6-7.
- v1.1 phases execute strictly sequentially: 10 → 11 → 12 → 13 → 14 (each phase has a hard dependency on its predecessor — see "Phase Ordering Rationale" in research/v1.1/SUMMARY.md)

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation and Design System | 0/3 | Planning complete | - |
| 2. Catalog and Browsing | 3/3 | Complete   | 2026-04-20 |
| 3. Checkout and Payments | 2/2 | Complete   | 2026-04-21 |
| 4. eSIM Delivery | 2/3 | In Progress|  |
| 5. User Accounts | 0/3 | Planning complete | - |
| 6. eSIM Management | 2/3 | In Progress|  |
| 7. SEO and Internationalization | 3/4 | In Progress|  |
| 8. Growth and Acquisition | 3/3 | Complete   | 2026-04-25 |
| 9. PWA and Polish | 3/3 | Complete   | 2026-04-25 |
| 10. Schema and Curation Backfill | 2/2 | Complete    | 2026-05-16 |
| 11. Read-Layer Module and Browse Cutover | 0/3 | Planning complete | - |
| 12. Checkout, Pricing and Coupon Cutover | 0/0 | Not started | - |
| 13. Cleanup, Mock Deletion and WhatsApp Removal | 0/0 | Not started | - |
| 14. E2E Verification and Deploy | 0/0 | Not started | - |
