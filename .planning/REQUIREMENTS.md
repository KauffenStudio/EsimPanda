# Requirements: eSIM Reseller Platform

**Defined:** 2026-04-19
**Core Value:** A student arriving in a new country gets connected with mobile data in under 2 minutes

## v1 Requirements

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
- [x] **GRW-04**: User can contact support via WhatsApp button

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

## Out of Scope

| Feature | Reason |
|---------|--------|
| Native mobile app | Web-first PWA covers mobile; native adds cost and app store friction |
| Unlimited data plans | Margin-killer, hard to sustain at wholesale level |
| Cryptocurrency payments | Adds complexity, negligible demand from student audience |
| Live chat support | WhatsApp handles this more naturally for the target audience |
| IoT/enterprise eSIMs | Consumer focus only — different market entirely |
| Own MVNO infrastructure | Pure reseller model — zero telecom infrastructure investment |
| Real-time chat between users | Not a social platform |

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

**Coverage:**
- v1 requirements: 35 total
- Mapped to phases: 35
- Unmapped: 0

---
*Requirements defined: 2026-04-19*
*Last updated: 2026-04-19 after roadmap creation*
