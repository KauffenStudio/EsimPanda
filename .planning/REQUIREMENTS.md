# Requirements: eSIM Reseller Platform

**Defined:** 2026-04-19
**Core Value:** A student arriving in a new country gets connected with mobile data in under 2 minutes

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Catalog

- [ ] **CAT-01**: User can browse eSIM plans by destination country (Europe-first)
- [ ] **CAT-02**: User can filter plans by duration (24h, 7d, 14d, 30d, semester), data amount, and price
- [ ] **CAT-03**: User can view multi-country/regional plans (e.g., Europe-wide)
- [ ] **CAT-04**: User can compare 2-3 plans side by side

### Checkout

- [ ] **CHK-01**: User can purchase an eSIM without creating an account (guest checkout, email only)
- [ ] **CHK-02**: User can pay with Apple Pay or Google Pay via Stripe
- [ ] **CHK-03**: User can pay with PayPal
- [ ] **CHK-04**: User can apply a student/traveler discount coupon (30% off)
- [ ] **CHK-05**: System processes EU VAT correctly via Stripe Tax (OSS compliance)

### Delivery

- [ ] **DEL-01**: User receives QR code on-screen immediately after successful payment
- [ ] **DEL-02**: User receives QR code backup via email
- [ ] **DEL-03**: User sees device-specific setup guide (step-by-step for their device model)
- [ ] **DEL-04**: User can check device eSIM compatibility before purchasing

### Management

- [ ] **MGT-01**: User can view dashboard of active eSIMs (status, expiry, data remaining)
- [ ] **MGT-02**: User can top-up data on an active eSIM plan
- [ ] **MGT-03**: User can track data usage in near-real-time (if provider supports)
- [ ] **MGT-04**: User can view full purchase history

### Account

- [ ] **ACC-01**: User can create account after purchase (guest-to-account conversion)
- [ ] **ACC-02**: User can log in with email/password
- [ ] **ACC-03**: User can reset password via email link
- [ ] **ACC-04**: User session persists across browser refresh

### Growth

- [ ] **GRW-01**: User can share referral link and earn credit when friends purchase
- [ ] **GRW-02**: Destination pages are SEO-optimized with structured data
- [ ] **GRW-03**: Platform supports multiple languages (EN, PT, ES, FR minimum)
- [ ] **GRW-04**: User can contact support via WhatsApp button

### UX/Design

- [ ] **UXD-01**: App has premium animations and micro-interactions (Framer Motion)
- [ ] **UXD-02**: App is installable as PWA (add to home screen)
- [ ] **UXD-03**: App supports dark mode (auto-detect + manual toggle)
- [ ] **UXD-04**: User receives push notifications for eSIM expiry and promotions

### Infrastructure

- [ ] **INF-01**: Wholesale provider abstraction layer (swap providers without rewriting business logic)
- [ ] **INF-02**: Catalog sync from wholesale API on schedule (never call wholesale API on page load)
- [ ] **INF-03**: Stripe webhook handlers for payment confirmation and eSIM provisioning
- [ ] **INF-04**: QR codes stored encrypted with on-demand generation
- [ ] **INF-05**: Stripe Radar + 3D Secure enabled for chargeback prevention
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
| *(populated during roadmap creation)* | | |

**Coverage:**
- v1 requirements: 29 total
- Mapped to phases: 0
- Unmapped: 29 ⚠️

---
*Requirements defined: 2026-04-19*
*Last updated: 2026-04-19 after initial definition*
