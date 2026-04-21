# Roadmap: eSIM Reseller Platform

## Overview

This roadmap delivers a mobile-first eSIM reseller platform targeting international students and young travelers in Europe. The journey moves from infrastructure and catalog (getting plan data flowing) through the revenue-critical checkout and delivery pipeline, then builds retention features (accounts, eSIM management), and finishes with growth levers (SEO, referrals) and polish (PWA, dark mode, push notifications). The architecture validates the wholesale API integration early (highest-risk dependency) and reaches first sale by end of Phase 4.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Foundation and Design System** - Project skeleton, database schema, provider abstraction layer, i18n framework, and premium design system
- [x] **Phase 2: Catalog and Browsing** - Wholesale API sync, destination pages, plan browsing with filters, comparison, and device compatibility check (completed 2026-04-20)
- [ ] **Phase 3: Checkout and Payments** - Guest checkout, Stripe integration (card, Apple Pay, Google Pay, PayPal), coupon application, VAT compliance, and fraud prevention
- [ ] **Phase 4: eSIM Delivery** - QR code generation and delivery (web + email), webhook-driven provisioning pipeline, and device-specific setup guides
- [ ] **Phase 5: User Accounts** - Guest-to-account conversion, email/password auth, password reset, persistent sessions
- [ ] **Phase 6: eSIM Management** - Active eSIM dashboard, data usage tracking, top-up flow, purchase history
- [ ] **Phase 7: SEO and Internationalization** - SEO-optimized destination landing pages with structured data, multi-language support (EN, PT, ES, FR)
- [ ] **Phase 8: Growth and Acquisition** - Referral program with credit system, WhatsApp support integration
- [ ] **Phase 9: PWA and Polish** - Installable PWA, dark mode, push notifications for expiry and promotions

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
**Plans**: TBD

Plans:
- [ ] 04-01: TBD
- [ ] 04-02: TBD

### Phase 5: User Accounts
**Goal**: Users who purchased as guests can create an account to persist their eSIM history, and returning users can log in with email/password to access their dashboard
**Depends on**: Phase 4
**Requirements**: ACC-01, ACC-02, ACC-03, ACC-04
**Success Criteria** (what must be TRUE):
  1. User who purchased as guest can create an account post-purchase and see their order linked
  2. User can log in with email and password
  3. User can reset a forgotten password via email link
  4. User session persists across browser refresh and tab close
**Plans**: TBD

Plans:
- [ ] 05-01: TBD

### Phase 6: eSIM Management
**Goal**: Logged-in users can manage their active eSIMs from a dashboard -- viewing status, tracking data usage, topping up data, and reviewing purchase history
**Depends on**: Phase 5
**Requirements**: MGT-01, MGT-02, MGT-03, MGT-04
**Success Criteria** (what must be TRUE):
  1. User can view a dashboard showing all active eSIMs with status, expiry date, and data remaining
  2. User can top up data on an active eSIM plan from the dashboard
  3. User can see near-real-time data usage (polled/cached, not live) for active eSIMs
  4. User can view full purchase history with order details
**Plans**: TBD

Plans:
- [ ] 06-01: TBD
- [ ] 06-02: TBD

### Phase 7: SEO and Internationalization
**Goal**: Destination pages are optimized for organic search (structured data, meta tags, content) and the platform supports multiple languages to reach the pan-European student audience
**Depends on**: Phase 2
**Requirements**: GRW-02, GRW-03
**Success Criteria** (what must be TRUE):
  1. Each destination has an SEO-optimized landing page with structured data, unique content, and proper meta tags
  2. Platform supports EN, PT, ES, and FR languages with user language selection
  3. SEO pages render server-side (SSR/ISR) and are indexable by search engines
**Plans**: TBD

Plans:
- [ ] 07-01: TBD

### Phase 8: Growth and Acquisition
**Goal**: Growth levers are active -- users can refer friends for credit, and support is accessible via WhatsApp
**Depends on**: Phase 5
**Requirements**: GRW-01, GRW-04
**Success Criteria** (what must be TRUE):
  1. User can share a unique referral link and earn credit when a referred friend completes a purchase
  2. Referral credits are tracked and can be applied to future purchases
  3. User can reach support via a WhatsApp button visible on all pages
**Plans**: TBD

Plans:
- [ ] 08-01: TBD
- [ ] 08-02: TBD

### Phase 9: PWA and Polish
**Goal**: The platform is installable as a PWA for offline QR access, supports dark mode, and sends push notifications for eSIM expiry and promotions
**Depends on**: Phase 6
**Requirements**: UXD-02, UXD-03, UXD-04
**Success Criteria** (what must be TRUE):
  1. User can install the app to their home screen (PWA manifest, service worker)
  2. User can access their QR codes offline after installation
  3. App supports dark mode with auto-detection and manual toggle
  4. User receives push notifications for eSIM expiry warnings and promotions
**Plans**: TBD

Plans:
- [ ] 09-01: TBD
- [ ] 09-02: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 -> 2 -> 3 -> 4 -> 5 -> 6 -> 7 -> 8 -> 9
Note: Phase 7 depends on Phase 2 (not Phase 6), so it could run in parallel with Phases 3-6 if desired.
Note: Phase 8 depends on Phase 5 (not Phase 7), so it could run in parallel with Phase 6-7.

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation and Design System | 0/3 | Planning complete | - |
| 2. Catalog and Browsing | 3/3 | Complete   | 2026-04-20 |
| 3. Checkout and Payments | 0/2 | Planning complete | - |
| 4. eSIM Delivery | 0/2 | Not started | - |
| 5. User Accounts | 0/1 | Not started | - |
| 6. eSIM Management | 0/2 | Not started | - |
| 7. SEO and Internationalization | 0/1 | Not started | - |
| 8. Growth and Acquisition | 0/2 | Not started | - |
| 9. PWA and Polish | 0/2 | Not started | - |
