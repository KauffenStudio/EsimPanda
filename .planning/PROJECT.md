# eSIM Panda

## What This Is

A mobile-first eSIM reseller platform called **eSIM Panda**, targeting international students (Erasmus, exchange) and young travelers in Europe. Users can browse destinations, purchase data plans (24h to semester-long), receive instant QR code activation, top-up data, and manage active eSIMs — all in a few taps with Apple Pay, PayPal, or Google Pay. The platform differentiates through student-focused pricing (30% discount), brutally good UX with animations, guided device-specific setup, and long-duration plans nobody else offers.

## Brand Identity

**Name:** eSIM Panda
**Mascot:** A panda character that appears throughout the app as an interactive companion:
- **Idle/Browse:** Panda sits relaxed, occasionally blinks or waves — subtle ambient animation
- **Searching:** Panda peers through binoculars or holds a magnifying glass while user browses destinations
- **Checkout:** Panda gives a thumbs up or does a happy bounce when payment succeeds
- **QR Delivery:** Panda "hands" the QR code to the user with a celebratory animation
- **Loading states:** Panda munches bamboo or does a little dance instead of boring spinners
- **Empty states:** Panda looks curious/inviting ("No eSIMs yet? Let's fix that!")
- **Errors:** Panda looks apologetic with a sweat drop
- **Setup guide:** Panda walks alongside the user, pointing at each step

The panda creates emotional connection with the young audience, makes the brand instantly recognizable, and turns utility moments (loading, errors) into delightful micro-interactions.

## Core Value

A student arriving in a new country gets connected with mobile data in under 2 minutes — browse, tap, pay, scan QR, done.

## Requirements

### Validated

- [x] Browse eSIM plans by destination (Europe-first) — Validated in Phase 2: Catalog and Browsing
- [x] Purchase plans: 24h, 7-day, 14-day, 30-day, semester (90-180 day) — Validated in Phase 2
- [x] Instant checkout with Apple Pay, Google Pay, PayPal — Validated in Phase 3: Checkout and Payments
- [x] Student/traveler discount system (30% off with coupon) — Validated in Phase 3
- [x] Receive QR code for eSIM activation after purchase — Validated in Phase 4: eSIM Delivery
- [x] Device-specific setup guides (step-by-step with screenshots per device model) — Validated in Phase 4
- [x] Mobile-first responsive web app with premium design and animations — Validated in Phase 1
- [x] Guest-to-account conversion with order auto-linking — Validated in Phase 5: User Accounts
- [x] Email/password login with persistent sessions — Validated in Phase 5
- [x] Password reset via branded email link — Validated in Phase 5
- [x] Top-up data on active eSIM plans — Validated in Phase 6: eSIM Management
- [x] Manage active eSIMs (view usage, expiry, status) — Validated in Phase 6
- [x] View full purchase history with order details — Validated in Phase 6
- [x] Track near-real-time data usage for active eSIMs — Validated in Phase 6

### Active

- [ ] SEO-optimized landing pages per destination
- [ ] WhatsApp support integration
- [ ] Referral program (share link, earn credit)

### Out of Scope

- Native mobile app (iOS/Android) — web-first, PWA later
- Real-time chat support — WhatsApp handles this
- eSIM for IoT/enterprise — consumer focus only
- Building own MVNO infrastructure — pure reseller model
- Non-European destinations at launch — expand after traction

## Context

- **Business model:** Reseller with markup over wholesale. No inventory — pay-per-sale via wholesale API. Estimated ~60% margin per sale.
- **Revenue:** Markup on wholesale prices. Student discount (30%) still profitable due to wholesale margins.
- **Target audience:** International students (Erasmus, exchange programs) arriving in Europe, and young budget-conscious travelers.
- **Competitive landscape:** Airalo (largest, general), Holafly (unlimited data focus), Nomad (budget). None specifically target students or offer semester-long plans.
- **Wholesale providers:** Need research — CELITECH, eSIM Go, Airalo Partner API, MobiMatter are candidates. Must evaluate: pricing, coverage, API quality, minimum commitments.
- **Budget:** Flexible — invest what makes sense. Initial costs: domain, hosting (Vercel/similar), wholesale API access.
- **Market entry:** Europe-first, aligned with Erasmus/student demographic. Expand to global top destinations after validation.

## Constraints

- **API dependency**: Platform is only as good as the wholesale provider — API reliability, coverage, and pricing are critical
- **Payment processing**: Must support Apple Pay, Google Pay, PayPal — Stripe handles all three
- **Regulatory**: eSIM reselling may have telecom regulatory requirements per country — needs research
- **Student verification**: Need a lightweight way to verify student status without friction (email domain, student ID upload, or honor system with coupon)

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Europe-first launch | Aligns with Erasmus/student target, focused coverage | — Pending |
| Reseller model (not MVNO) | Zero infrastructure investment, pay-per-sale, fast to market | — Pending |
| Web app (not native) | Faster to build, no app store approval, instant access via link | — Pending |
| Markup pricing model | Simple, proven (Airalo model), healthy margins ~60% | — Pending |
| Student discount 30% | Key differentiator, still profitable at wholesale margins | — Pending |
| Brand: eSIM Panda | Panda mascot with interactive animations throughout UX — emotional connection with young audience | — Pending |

---
*Last updated: 2026-04-24 — Phase 6 (eSIM Management) complete*
