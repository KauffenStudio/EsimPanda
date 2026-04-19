# Project Research Summary

**Project:** eSIM Reseller Platform
**Domain:** Digital goods marketplace with API-backed fulfillment (telecom reselling)
**Researched:** 2026-04-19
**Confidence:** MEDIUM

## Executive Summary

This is a digital goods marketplace that resells eSIM data plans sourced from wholesale providers via API integration. The platform targets a completely unserved niche -- students and young travelers in Europe, particularly Erasmus exchange students. No competitor (Airalo, Holafly, Nomad, aloSIM) offers student pricing, semester-length plans, or markets to this demographic. The technical pattern is well-established: a Next.js monolith syncs plan catalogs from a wholesale API, processes payments through Stripe, provisions eSIMs via the wholesale API on payment confirmation, and delivers QR codes for activation. The architecture is a standard e-commerce flow with one critical twist -- fulfillment is instantaneous and digital, which means the payment-to-delivery pipeline must be bulletproof.

The recommended approach is a modular monolith on Next.js 15 (App Router) with Supabase for database/auth, Stripe for payments, and CELITECH as the initial wholesale provider (zero minimum commitment, pay-as-you-go). The platform should launch as a PWA rather than native apps, use guest checkout to maximize conversions, and implement a provider abstraction layer from day one to avoid wholesale vendor lock-in. The student discount (the core differentiator) should use university email domain validation rather than static coupon codes, which will leak within hours. The entire stack can run on free tiers at launch, scaling to approximately $65-85/month as volume grows.

The three highest risks are: (1) QR code delivery failures leaving students stranded without internet in foreign countries, causing chargebacks and reputation damage -- mitigated by multi-channel delivery (web + email + WhatsApp backup) and never relying on email alone; (2) chargeback rates on digital goods running 2-4x higher than physical goods, especially with international student transactions on parents' cards -- mitigated by mandatory 3D Secure, Stripe Radar rules, and a proactive tiered refund policy; (3) EU regulatory compliance (VAT OSS across 27 countries, consumer protection, GDPR, and the ambiguous telecom reseller licensing question) -- mitigated by using Stripe Tax for automated VAT handling and getting written confirmation of wholesale provider licensing before launch.

## Key Findings

### Recommended Stack

The stack centers on Next.js 15 with App Router for the full application -- SSR pages for SEO-critical destination landing pages, client components for the checkout/dashboard SPA experience, and API routes for the backend. Supabase provides PostgreSQL, authentication (magic links + Google OAuth), and storage in one service with a generous free tier. Stripe handles all payment methods (cards, Apple Pay, Google Pay, PayPal) through Stripe Checkout, which eliminates PCI compliance burden. CELITECH is the recommended initial wholesale provider due to zero upfront commitment, though this choice carries MEDIUM confidence and requires live verification.

**Core technologies:**
- **Next.js 15 (App Router):** Full-stack framework -- SSR for SEO landing pages, API routes for backend, single deployment unit
- **Supabase (PostgreSQL):** Database + auth + storage -- relational model fits orders/users/plans, RLS for security, free tier for launch
- **Stripe (Checkout):** Payment processing -- Apple Pay/Google Pay/PayPal built-in, PCI handled, webhook-based fulfillment
- **CELITECH:** Wholesale eSIM API -- zero minimum commitment, pay-as-you-go, developer-friendly (needs live verification)
- **Tailwind CSS + Framer Motion:** Styling + animation -- mobile-first design with premium feel for design-conscious young users
- **TypeScript + Zod:** Type safety -- eSIM API responses are complex nested objects; runtime validation at API boundaries prevents integration bugs

### Expected Features

**Must have (table stakes):**
- Browse plans by destination (country-based search with flags)
- Instant QR code delivery after payment
- Secure checkout with card/Apple Pay/Google Pay
- Device compatibility checker (prevents post-purchase support disasters)
- Device-specific setup guides (iOS, Samsung, Pixel -- reduces support by 60%+)
- Email confirmation with QR code and receipt
- Mobile-first responsive design (90%+ of target users are mobile)
- Data usage tracking and top-up capability

**Should have (differentiators):**
- Student discount (30% off via university email validation, NOT static coupons)
- Guest checkout (no account required to purchase)
- Brutally fast checkout (under 60 seconds, 3 steps max)
- WhatsApp support button
- Referral program with credit (viral growth via student WhatsApp groups)
- SEO landing pages per destination ("eSIM for Erasmus in Lisbon" -- zero keyword competition)
- Multi-language support (EN, PT, ES, FR, DE minimum)
- Semester-long plans (90-180 days -- no competitor offers this)

**Defer (v2+):**
- Native mobile apps (PWA sufficient, native adds 3-6 month delay)
- In-app live chat (use WhatsApp instead)
- Unlimited data plans (margin killer without scale)
- Phone number / voice calling (telecom regulation nightmare)
- Crypto payments, complex loyalty systems, user reviews on-site

### Architecture Approach

The architecture is a modular monolith deployed as a single Next.js application on Vercel. The critical architectural insight is to never call the wholesale API on page loads -- instead, sync the plan catalog to your own Supabase database on a cron schedule (every 1-6 hours) and serve from local data. This provides resilience, speed, and pricing control. The order fulfillment pipeline is webhook-driven: Stripe confirms payment via webhook, the server provisions the eSIM via the wholesale API, stores QR data encrypted, and delivers through multiple channels. A provider abstraction layer normalizes different wholesale API interfaces behind a single internal contract.

**Major components:**
1. **Catalog Service** -- syncs wholesale plans to local DB on cron, serves browsable catalog with ISR caching
2. **Pricing Engine** -- server-side only price calculation with markup, discount application, and floor price enforcement (never sell below cost + 5%)
3. **Checkout + Payment Service** -- Stripe Checkout sessions with metadata, coupon validation, price verification
4. **Order Service + eSIM Provisioning** -- the critical path: state machine (PENDING -> PAYMENT_CONFIRMED -> PROVISIONING -> PROVISIONED -> DELIVERED -> ACTIVE -> EXPIRED) with failure/retry/refund handling
5. **Webhook Handler System** -- idempotent processing of Stripe and wholesale API events with signature verification
6. **QR Code Storage + Delivery** -- store activation data (not images), generate QR on demand, deliver via web dashboard + email + WhatsApp backup
7. **Usage Tracking** -- poll-and-cache pattern (not real-time), background cron updates every 30 minutes

### Critical Pitfalls

1. **Wholesale provider lock-in** -- Build a provider abstraction layer from day one with normalized interface. Costs ~2 days upfront; retrofitting later costs weeks.

2. **QR code delivery failures** -- Never rely on email alone. Display QR in web app on a persistent page, implement webhook + polling fallback, store QR data server-side for re-access.

3. **Chargeback hemorrhaging on digital goods** -- Mandate 3D Secure (SCA), use Stripe Radar with custom rules, collect compelling evidence, add explicit non-refundable-once-activated checkbox.

4. **EU VAT compliance (OSS)** -- Must charge VAT at customer's country rate. Use Stripe Tax to automate. Must be solved before first sale.

5. **Student discount abuse** -- Never use static coupon codes. Use university email domain validation as minimum, upgrade to UNiDAYS for scale.

## Implications for Roadmap

Based on research, suggested phase structure:

### Phase 1: Foundation + Catalog
**Rationale:** Everything depends on the database schema, auth system, and having plan data to display. The provider abstraction layer must be established here to avoid technical debt. Catalog sync validates the wholesale API integration early, which is the highest-risk technology dependency.
**Delivers:** Project skeleton, database schema, Supabase auth (magic link + Google OAuth), provider abstraction layer, wholesale API integration (read-only), catalog sync cron job, destination pages with SSR/ISR, plan browsing UI, basic design system (Tailwind + Framer Motion setup).
**Addresses:** Browse plans by destination, mobile-first design, device compatibility checker.
**Avoids:** Pitfall 1 (provider lock-in), Pitfall 7 (API rate limits via caching).

### Phase 2: Checkout + Payment + Provisioning
**Rationale:** This is the revenue path and the most complex phase. Cannot be built without catalog data (Phase 1). Payment integration, webhook handling, eSIM provisioning, and QR delivery are tightly coupled and must be built together. VAT compliance must be in place before first sale.
**Delivers:** Stripe Checkout integration (card + Apple Pay + Google Pay), webhook handler with idempotency, order state machine, eSIM provisioning pipeline with retry/refund logic, QR code delivery (web + email), order confirmation emails, Stripe Tax / VAT OSS setup, refund policy implementation, device setup guides.
**Addresses:** Instant QR code delivery, secure checkout, email confirmation, setup guides.
**Avoids:** Pitfall 2 (QR delivery failures), Pitfall 3 (chargebacks), Pitfall 4 (EU regulatory), Pitfall 8 (refund policy), Pitfall 10 (VAT compliance).

### Phase 3: User Accounts + eSIM Management
**Rationale:** Depends on orders existing (Phase 2). Required for retention -- users need to manage active eSIMs, check usage, and top up. Guest-to-account conversion flow goes here.
**Delivers:** Optional user accounts (post-purchase creation), eSIM management dashboard, data usage tracking (poll-and-cache), top-up flow, order history, PayPal as secondary payment.
**Addresses:** Data usage tracking, top-up, order history, eSIM management dashboard.
**Avoids:** Pitfall 14 (top-up confusion), Pitfall 9 (support volume -- self-service reduces contact rate).

### Phase 4: Growth + Acquisition
**Rationale:** With core product working, shift to growth levers. Student discount needs proper email domain validation (not static codes). SEO pages and referral program drive organic acquisition. Multi-language support reaches pan-European audience.
**Delivers:** Student discount with email domain validation, SEO landing pages per destination, referral program with wallet/credit system, multi-language support (EN, PT, ES, FR, DE), WhatsApp support integration, coupon/discount system.
**Addresses:** Student discount, referral program, SEO pages, multi-language, WhatsApp support.
**Avoids:** Pitfall 5 (discount abuse), Pitfall 12 (SEO cannibalization), Pitfall 13 (referral gaming).

### Phase 5: Polish + Scale
**Rationale:** Optimization after product-market fit is validated. PWA for offline QR access. Performance tuning. Monitoring and analytics for data-driven decisions.
**Delivers:** PWA support (offline QR access, add-to-home-screen), push notifications (usage alerts, expiry warnings), performance optimization, error monitoring (Sentry), analytics (PostHog / Vercel Analytics), semester-long plans (if wholesale supports it), automated WhatsApp responses.
**Addresses:** PWA, push notifications, semester-long plans, automated support.
**Avoids:** Pitfall 9 (support volume at scale).

### Phase Ordering Rationale

- **Dependency chain is clear:** Schema -> Catalog -> Checkout -> Dashboard -> Growth. Each phase depends on the previous.
- **Revenue-critical path prioritized:** Phases 1-2 get to first sale. Nothing else matters until you can take payment and deliver an eSIM.
- **Wholesale API risk front-loaded:** Phase 1 validates the API integration. If CELITECH does not work, you discover this before building checkout, not after.
- **Student discount deliberately in Phase 4, not Phase 1:** A hardcoded Stripe coupon code can ship with Phase 2 for early testing, but the proper email-validated system with abuse prevention belongs in Phase 4. The coupon code risk is acceptable at low volume.
- **SEO pages in Phase 4:** ISR destination pages from Phase 1 already exist for browsing. Phase 4 adds the SEO-optimized content, meta tags, and structured data that drive organic traffic.

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 1:** Wholesale API integration -- CELITECH API docs, sandbox access, actual endpoint behavior, QR code format. This is the single biggest unknown.
- **Phase 2:** EU regulatory compliance -- telecom reseller licensing status, VAT OSS registration process, consumer protection withdrawal right implementation. Recommend legal counsel.
- **Phase 4:** Student verification services -- UNiDAYS/Student Beans API capabilities, pricing, and integration complexity.

Phases with standard patterns (skip research-phase):
- **Phase 3:** User accounts, dashboards, and CRUD operations are well-documented Next.js + Supabase patterns.
- **Phase 5:** PWA setup, push notifications, and analytics are standard and well-documented.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Next.js, Supabase, Stripe, Tailwind are mainstream with excellent documentation. Only CELITECH choice is MEDIUM. |
| Features | MEDIUM | Competitor audit based on training data (May 2025). Feature sets and pricing may have changed. Core feature list is sound. |
| Architecture | HIGH | Standard e-commerce + API integration pattern. Provider abstraction is the key non-obvious insight. |
| Pitfalls | MEDIUM | Domain pitfalls well-identified. EU regulatory details need verification with current sources and legal counsel. |

**Overall confidence:** MEDIUM -- the application architecture and technology choices are high-confidence, but the wholesale provider specifics and EU regulatory details introduce meaningful uncertainty that must be resolved before development begins.

### Gaps to Address

- **Wholesale provider verification:** CELITECH API access, sandbox quality, actual European coverage, wholesale pricing, QR code delivery method, top-up support. Must be verified before Phase 1 development.
- **EU telecom reseller licensing:** Ambiguous regulatory status varies by country. Need legal opinion on whether data-only eSIM reselling requires telecom registration in Portugal/target markets.
- **VAT OSS registration:** Process, timeline, and which EU member state to register in. Needed before first sale.
- **Competitor feature updates:** All competitor data is from training data (May 2025). Verify current Airalo/Holafly features and pricing.
- **Wholesale pricing validation:** Margin estimates (60% gross) are based on publicly available data. Actual wholesale costs need confirmation.
- **Semester-long plan feasibility:** Depends on whether wholesale providers offer plans with 90-180 day validity.

## Sources

### Primary (HIGH confidence)
- Next.js documentation (nextjs.org) -- framework capabilities, App Router, ISR, API routes
- Supabase documentation (supabase.com) -- database, auth, storage, RLS, edge functions
- Stripe documentation (stripe.com) -- Checkout, webhooks, Radar, Tax, Payment Request API
- Framer Motion documentation (framer.com/motion) -- animation capabilities

### Secondary (MEDIUM confidence)
- Airalo, Holafly, Nomad, aloSIM feature sets and pricing (training data, May 2025)
- EU Consumer Rights Directive (2011/83/EU) -- digital content withdrawal provisions
- EU VAT One-Stop Shop (OSS) regulations -- digital services B2C rules
- GSMA eSIM specifications -- LPA activation string format
- PSD2 Strong Customer Authentication requirements

### Tertiary (LOW confidence)
- CELITECH API capabilities and pricing -- needs live verification
- eSIM Go API and wholesale pricing -- needs live verification
- MobiMatter aggregator model details -- needs live verification
- Specific EU member state telecom licensing requirements -- needs legal verification

---
*Research completed: 2026-04-19*
*Ready for roadmap: yes*
