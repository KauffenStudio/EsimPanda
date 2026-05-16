# Requirements: eSIM Reseller Platform

**Defined:** 2026-04-19
**Last milestone added:** 2026-05-13 — v1.1 Live Data Cutover
**Core Value:** A student arriving in a new country gets connected with mobile data in under 2 minutes

## v1.1 Milestone — Live Data Cutover + WhatsApp Removal

The v1.0 backend (Celitech sync, Stripe, webhooks, eSIM delivery) works end-to-end against real data, but every UI read path (browse, plan-card, comparison-sheet, pricing, validate-coupon, checkout server component) still imports from `src/lib/mock-data/`. v1.1 cuts the UI over to Supabase and removes the WhatsApp support integration entirely.

### Catalog (live-data cutover)

- [ ] **CAT-05**: User browsing the destination grid sees real Supabase destinations from the curated set only (uncurated destinations are hidden until manually curated)
- [ ] **CAT-06**: User typing in the destination search sees instant client-side filtering across the live catalog (no server-side debounce)
- [ ] **CAT-07**: User viewing a destination with no `image_url` set sees a country-flag fallback (not a generic placeholder)

### Checkout (live-data cutover)

- [ ] **CHK-06**: User completing checkout is charged the retail price stored in Supabase for the real plan ID they selected (no mock plan IDs accepted)
- [ ] **CHK-07**: User applying a coupon sees the minimum-order amount labelled in the correct currency (`$9.99` instead of `€9.99`)
- [ ] **CHK-08**: User with a saved cart from before the v1.1 deploy starts with a clean cart on first load (Zustand persist migration purges dead plan IDs)

### UX / Design

- [ ] **UXD-05**: User waiting for the catalog fetch sees a skeleton grid (not a blank screen or FOUC)
- [ ] **UXD-06**: User encountering a fetch error sees a Bambu error pose with a Retry button that actually retries the fetch
- [ ] **UXD-07**: User watching a destination card image load sees a smooth blurred cross-fade from the country-flag fallback to the real photo
- [ ] **UXD-08**: User returning after the v1.1 deploy sees a "New version available" prompt and loads fresh content (service worker cache bumped)

### Infrastructure

- [ ] **INF-07**: Catalog reads from the UI go through a shared, typed, `server-only` read module at `src/lib/db/destinations.ts` (no direct Supabase calls inside components)
- [ ] **INF-08**: Browse page renders via an async RSC that fetches the catalog server-side using the anon key + existing RLS policy, passing data to a `<BrowseClient>` for filter/animation
- [x] **INF-09**: Supabase migration adds `popularity_rank INTEGER` and `region_bucket TEXT` columns to `destinations` (additive, no RLS change)
- [ ] **INF-10**: A one-off backfill script copies curation metadata (`popularity_rank`, `image_url`, `region_bucket`) from `src/lib/mock-data/destinations.ts` into Supabase by `iso_code`, idempotently
- [ ] **INF-11**: `src/lib/mock-data/destinations.ts`, `plans.ts`, and `tag-plans.ts` are deleted; pure-compute helpers extracted to `src/lib/plans/pricing-display.ts`; CI grep gate blocks new `mock-data/` imports
- [ ] **INF-12**: Service worker `CACHE_NAME` is bumped to `esim-panda-v2` and the cutover deploy is gated on this change (returning users + iOS Capacitor app see fresh content)
- [ ] **INF-13**: WhatsApp integration is fully removed: `whatsapp-button.tsx`, `support.ts`, layout imports, env vars, all 6 locale `whatsapp.*` namespaces, and all 4 error-state copy strings referencing WhatsApp
- [ ] **INF-14**: `/help` static route ships as the new support entry point (FAQ + `mailto:` contact), linked from the footer

### Verification

- [ ] **VER-01**: End-to-end test executes: a Stripe test-card purchase against a real Supabase plan ID delivers a real eSIM ICCID via Celitech, persists encrypted activation data, and sends a real Resend email

## v1.0 Requirements (shipped)

Requirements for initial release. Each maps to roadmap phases.

### Catalog

- [x] **CAT-01**: User can browse eSIM plans by destination country (Europe-first)
- [x] **CAT-02**: User can filter plans by duration (24h, 7d, 14d, 30d, semester), data amount, and price
- [x] **CAT-03**: User can view multi-country/regional plans (e.g., Europe-wide)
- [x] **CAT-04**: User can compare 2-3 plans side by side

### Checkout

- [x] **CHK-01**: User can purchase an eSIM without creating an account (guest checkout, email only)
- [x] **CHK-02**: User can pay with Apple Pay or Google Pay via Stripe
- [x] **CHK-03**: User can pay with PayPal
- [x] **CHK-04**: User can apply a student/traveler discount coupon (30% off)
- [x] **CHK-05**: System processes EU VAT correctly via Stripe Tax (OSS compliance)

### Delivery

- [x] **DEL-01**: User receives QR code on-screen immediately after successful payment
- [ ] **DEL-02**: User receives QR code backup via email
- [x] **DEL-03**: User sees device-specific setup guide (step-by-step for their device model)
- [x] **DEL-04**: User can check device eSIM compatibility before purchasing

### Management

- [x] **MGT-01**: User can view dashboard of active eSIMs (status, expiry, data remaining)
- [x] **MGT-02**: User can top-up data on an active eSIM plan
- [x] **MGT-03**: User can track data usage in near-real-time (if provider supports)
- [x] **MGT-04**: User can view full purchase history

### Account

- [x] **ACC-01**: User can create account after purchase (guest-to-account conversion)
- [x] **ACC-02**: User can log in with email/password
- [x] **ACC-03**: User can reset password via email link
- [x] **ACC-04**: User session persists across browser refresh

### Growth

- [x] **GRW-01**: User can share referral link and earn credit when friends purchase
- [x] **GRW-02**: Destination pages are SEO-optimized with structured data
- [x] **GRW-03**: Platform supports multiple languages (EN, PT, ES, FR minimum)
- ~~**GRW-04**: User can contact support via WhatsApp button~~ — **removed in v1.1, superseded by INF-13 + INF-14**

### UX/Design

- [x] **UXD-01**: App has premium animations and micro-interactions (Framer Motion)
- [x] **UXD-02**: App is installable as PWA (add to home screen)
- [x] **UXD-03**: App supports dark mode (auto-detect + manual toggle)
- [x] **UXD-04**: User receives push notifications for eSIM expiry and promotions

### Infrastructure

- [x] **INF-01**: Wholesale provider abstraction layer (swap providers without rewriting business logic)
- [x] **INF-02**: Catalog sync from wholesale API on schedule (never call wholesale API on page load)
- [x] **INF-03**: Stripe webhook handlers for payment confirmation and eSIM provisioning
- [x] **INF-04**: QR codes stored encrypted with on-demand generation
- [x] **INF-05**: Stripe Radar + 3D Secure enabled for chargeback prevention
- [ ] **INF-06**: i18n framework wired from the start (even if translations come later)

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Expansion

- **EXP-01**: Global destination coverage (beyond Europe)
- **EXP-02**: Native mobile app (iOS/Android)
- **EXP-03**: Student verification via UNiDAYS/Student Beans integration
- **EXP-04**: Semester auto-renewal plans (auto top-up at end of period)

### Advanced

- **ADV-01**: Admin dashboard for managing orders, revenue, analytics
- **ADV-02**: Automated customer support chatbot
- **ADV-03**: A/B testing framework for pricing and conversion
- **ADV-04**: Affiliate program for travel bloggers/influencers

### Polish (deferred from v1.1)

- **POL-01**: Bambu loading pose triggers when catalog fetch exceeds 300 ms (wait for production p50 telemetry first)
- **POL-02**: ISR hard-pin for the top-12 destinations via `generateStaticParams` (depends on popularity telemetry)
- **POL-03**: Optimistic destination-card render from URL slug before Supabase fetch resolves
- **POL-04**: Refetch-on-tab-focus for catalog freshness (wait for telemetry showing staleness matters)
- **POL-05**: Notify-me email capture on "plans coming soon" empty state (needs new table + double-opt-in)
- **POL-06**: Dynamic EUR conversion of the coupon minimum-order threshold (v1.1 fixes only the copy)

## Out of Scope

| Feature | Reason |
|---------|--------|
| Native mobile app | Web-first PWA covers mobile; native adds cost and app store friction |
| Unlimited data plans | Margin-killer, hard to sustain at wholesale level |
| Cryptocurrency payments | Adds complexity, negligible demand from student audience |
| WhatsApp support integration | Dropped in v1.1 — async `/help` route + `mailto:` covers support; reduces external dependency |
| Live chat support | Out of scope — async email/contact form sufficient |
| IoT/enterprise eSIMs | Consumer focus only — different market entirely |
| Own MVNO infrastructure | Pure reseller model — zero telecom infrastructure investment |
| Real-time chat between users | Not a social platform |
| Per-card Suspense streaming on the catalog | Anti-feature — worse TTFB and pop-in than a bulk skeleton swap |
| Server-side debounced destination search | Anti-feature — 226 rows / ~25 KB client filter strictly beats round-trip per keystroke |
| Generic stock-photo placeholder for missing destination images | Anti-feature — country flag is the honest, recognizable fallback |
| Mock data as silent fallback when Supabase is down | Anti-feature — creates two-source-of-truth drift bugs |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| CAT-01 | Phase 2 | Complete |
| CAT-02 | Phase 2 | Complete |
| CAT-03 | Phase 2 | Complete |
| CAT-04 | Phase 2 | Complete |
| CHK-01 | Phase 3 | Complete |
| CHK-02 | Phase 3 | Complete |
| CHK-03 | Phase 3 | Complete |
| CHK-04 | Phase 3 | Complete |
| CHK-05 | Phase 3 | Complete |
| DEL-01 | Phase 4 | Complete |
| DEL-02 | Phase 4 | Pending |
| DEL-03 | Phase 4 | Complete |
| DEL-04 | Phase 2 | Complete |
| MGT-01 | Phase 6 | Complete |
| MGT-02 | Phase 6 | Complete |
| MGT-03 | Phase 6 | Complete |
| MGT-04 | Phase 6 | Complete |
| ACC-01 | Phase 5 | Complete |
| ACC-02 | Phase 5 | Complete |
| ACC-03 | Phase 5 | Complete |
| ACC-04 | Phase 5 | Complete |
| GRW-01 | Phase 8 | Complete |
| GRW-02 | Phase 7 | Complete |
| GRW-03 | Phase 7 | Complete |
| GRW-04 | Phase 8 | Complete |
| UXD-01 | Phase 1 | Complete |
| UXD-02 | Phase 9 | Complete |
| UXD-03 | Phase 9 | Complete |
| UXD-04 | Phase 9 | Complete |
| INF-01 | Phase 1 | Complete |
| INF-02 | Phase 1 | Complete |
| INF-03 | Phase 4 | Complete |
| INF-04 | Phase 4 | Complete |
| INF-05 | Phase 3 | Complete |
| INF-06 | Phase 1 | Pending |
| CAT-05 | Phase 11 | Pending |
| CAT-06 | Phase 11 | Pending |
| CAT-07 | Phase 11 | Pending |
| CHK-06 | Phase 12 | Pending |
| CHK-07 | Phase 12 | Pending |
| CHK-08 | Phase 12 | Pending |
| UXD-05 | Phase 11 | Pending |
| UXD-06 | Phase 11 | Pending |
| UXD-07 | Phase 11 | Pending |
| UXD-08 | Phase 14 | Pending |
| INF-07 | Phase 11 | Pending |
| INF-08 | Phase 11 | Pending |
| INF-09 | Phase 10 | Complete |
| INF-10 | Phase 10 | Pending |
| INF-11 | Phase 13 | Pending |
| INF-12 | Phase 14 | Pending |
| INF-13 | Phase 13 | Pending |
| INF-14 | Phase 13 | Pending |
| VER-01 | Phase 14 | Pending |

**Coverage:**
- v1.0 requirements: 35 total — all complete (except DEL-02, INF-06 noted)
- v1.1 requirements: 19 total — all mapped to Phases 10-14 (Phase 10: 2 | Phase 11: 8 | Phase 12: 3 | Phase 13: 4 | Phase 14: 3 → reconciles to 19 with 1 cross-phase boundary; see ROADMAP.md for per-requirement detail)

**v1.1 phase distribution:**
- Phase 10 (Schema + Backfill): INF-09, INF-10 (2 reqs)
- Phase 11 (Read-Layer + Browse): INF-07, INF-08, CAT-05, CAT-06, CAT-07, UXD-05, UXD-06, UXD-07 (8 reqs)
- Phase 12 (Checkout/Pricing/Coupon): CHK-06, CHK-07, CHK-08 (3 reqs)
- Phase 13 (Cleanup + WhatsApp): INF-11, INF-13, INF-14 (3 reqs)
- Phase 14 (E2E + Deploy): INF-12, UXD-08, VER-01 (3 reqs)
- **Total: 2 + 8 + 3 + 3 + 3 = 19** ✓

---
*Requirements defined: 2026-04-19*
*Last updated: 2026-05-13 — v1.1 requirements mapped to Phases 10-14 by roadmapper*
