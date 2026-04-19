# eSIM Reseller Platform

## What This Is

A mobile-first eSIM reseller platform targeting international students (Erasmus, exchange) and young travelers in Europe. Users can browse destinations, purchase data plans (24h to semester-long), receive instant QR code activation, top-up data, and manage active eSIMs — all in a few taps with Apple Pay, PayPal, or Google Pay. The platform differentiates through student-focused pricing (30% discount), brutally good UX with animations, guided device-specific setup, and long-duration plans nobody else offers.

## Core Value

A student arriving in a new country gets connected with mobile data in under 2 minutes — browse, tap, pay, scan QR, done.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Browse eSIM plans by destination (Europe-first)
- [ ] Purchase plans: 24h, 7-day, 14-day, 30-day, semester (90-180 day)
- [ ] Instant checkout with Apple Pay, Google Pay, PayPal
- [ ] Receive QR code for eSIM activation after purchase
- [ ] Top-up data on active eSIM plans
- [ ] Manage active eSIMs (view usage, expiry, status)
- [ ] Student/traveler discount system (30% off with coupon)
- [ ] Device-specific setup guides (step-by-step with screenshots per device model)
- [ ] Mobile-first responsive web app with premium design and animations
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

---
*Last updated: 2026-04-19 after initialization*
