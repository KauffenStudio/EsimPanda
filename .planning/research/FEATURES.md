# Feature Landscape

**Domain:** eSIM Reseller Platform (Student/Young Traveler Focus)
**Researched:** 2026-04-19
**Confidence:** MEDIUM (based on training data up to May 2025; web verification was unavailable)

## Competitor Feature Audit

Features observed across Airalo, Holafly, Nomad, and aloSIM as of early 2025.

| Feature | Airalo | Holafly | Nomad | aloSIM |
|---------|--------|---------|-------|--------|
| Country-specific plans | Yes | Yes | Yes | Yes |
| Regional/multi-country plans | Yes | Yes | Yes | Yes |
| Global plans | Yes | No | Yes | Yes |
| Unlimited data plans | No (capped) | Yes (core offer) | No | No |
| Top-up / data reload | Yes | Yes (auto) | Yes | Yes |
| QR code activation | Yes | Yes | Yes | Yes |
| Apple Pay | Yes | Yes | Partial | No |
| Google Pay | Yes | Yes | Partial | No |
| PayPal | Yes | Yes | No | Yes |
| Credit/debit card | Yes | Yes | Yes | Yes |
| Referral program | Yes ($3 credit) | Yes (discount codes) | Yes | Yes |
| Coupon/discount system | Yes | Yes (influencer codes) | Yes | Yes |
| Device setup guides | Yes (in-app) | Yes (video + text) | Yes | Basic |
| Mobile app (iOS/Android) | Yes | Yes | Yes | Yes |
| Web purchase flow | Yes | Yes | Yes | Yes |
| Data usage tracking | Yes | Yes | Yes | Basic |
| Push notifications (usage) | Yes (app) | Yes (app) | Yes | No |
| Multi-language | Yes (16+) | Yes (10+) | Limited | Limited |
| Student discount | No | No | No | No |
| Semester-long plans (90-180d) | No | No | No | No |
| eSIM compatibility checker | Yes | Yes | Yes | Yes |
| Email receipt/confirmation | Yes | Yes | Yes | Yes |
| Order history | Yes | Yes | Yes | Yes |
| WhatsApp support | No | Yes | No | No |
| Live chat support | Yes | Yes | Yes | Email only |
| Airmoney/wallet system | Yes (Airmoney) | No | No | No |

## Table Stakes

Features users expect. Missing any of these and the product feels broken or untrustworthy.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Browse plans by destination | Every competitor has this. Users think "I'm going to France" not "I need 5GB" | Low | Search/filter by country, show flag icons, map optional |
| Plan variety (duration + data) | Users need options: 1GB/7d for weekend trips, 10GB/30d for longer stays | Low | Minimum 3-4 tiers per destination |
| Instant QR code delivery | The entire eSIM value prop. Physical SIM alternative breaks if this is slow | Low | Show QR immediately after payment confirmation |
| Secure checkout with card payments | Baseline payment. Stripe handles this | Low | Credit/debit card via Stripe |
| Email confirmation + receipt | Legal requirement in EU, users expect proof of purchase | Low | Transactional email with QR code attached |
| Device compatibility checker | Users will buy then discover their phone doesn't support eSIM -- causes refund nightmare | Low | Simple device model lookup or "check if your phone supports eSIM" guide |
| Device-specific setup guides | eSIM activation is confusing for first-timers. #1 support driver without guides | Medium | Must cover iOS and major Android brands (Samsung, Pixel, Xiaomi). Screenshots per OS version |
| Data usage tracking | Users need to know remaining data to decide on top-up | Medium | Requires API polling from wholesale provider |
| Top-up / data reload | Running out of data mid-trip is the nightmare scenario. Must be seamless | Medium | Buy additional data for active eSIM without new QR |
| Order history / eSIM management | Users need to see active, expired, and pending eSIMs | Low | Dashboard showing status, expiry, data remaining |
| HTTPS + trust signals | Users entering payment info on unknown brand need reassurance | Low | SSL, payment badges, reviews/testimonials |
| Mobile-responsive design | Target demo (students) are 90%+ mobile. Desktop is secondary | Low | Mobile-first, not mobile-adapted |

## Differentiators

Features that set this platform apart. Not expected by users, but create competitive advantage with the student/young traveler segment.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Student discount (30% off) | NO competitor targets students. Erasmus students are price-sensitive and share deals virally in WhatsApp groups | Low | Coupon-based initially. Student email domain validation (*.edu, *.ac.uk, etc.) later. Honor system with coupon code is fine for launch |
| Semester-long plans (90-180 days) | Nobody offers this. Exchange students need 4-6 months of data, currently forced to buy monthly and hope top-up works | Medium | Requires wholesale provider that supports long-validity plans or auto-renewal logic |
| Apple Pay + Google Pay checkout | Reduces purchase to 2 taps. Airalo has this but smaller competitors don't. Critical for "connected in 2 minutes" promise | Low | Stripe Payment Request API handles both |
| PayPal support | Popular with younger Europeans who may not have credit cards. Common student payment method | Low | Stripe supports PayPal as payment method |
| Brutally fast checkout (under 60s) | Most competitors have 4-5 step checkout. Compress to: select plan > pay > QR. Three steps max | Medium | No mandatory account creation. Guest checkout with optional account after purchase |
| WhatsApp support button | Holafly does this. Students already live in WhatsApp. Zero friction to ask for help | Low | wa.me link with pre-filled message. No chatbot needed |
| Referral program with credit | Airalo gives $3 Airmoney. Students share everything -- make referral dead simple: share link, friend gets 10% off, you get $3 credit | Medium | Requires wallet/credit system, unique referral links, tracking |
| Multi-country / Europe-wide plans | Student does Erasmus in Portugal but weekends in Spain. Regional plan covers this without buying per-country | Low | Depends on wholesale provider offering regional plans |
| Animated, premium UI/UX | Competitors look like utility apps. A polished, animated experience (like Revolut/Wise) builds trust with design-conscious young users | High | Framer Motion animations, micro-interactions, smooth transitions |
| SEO landing pages per destination | "eSIM for Erasmus in Lisbon", "eSIM for students in Barcelona" -- zero competition for these long-tail keywords | Medium | Templated but with unique content per city/country. Target Erasmus destination cities |
| Pre-arrival purchase + scheduling | Student can buy eSIM before flying, set activation date for arrival day | Medium | Deferred activation via API if wholesale supports it |
| Multi-language (PT, ES, FR, DE, EN) | Erasmus students are pan-European. English is baseline but native language builds trust | Medium | i18n framework from day one, prioritize top 5 Erasmus languages |

## Anti-Features

Features to explicitly NOT build. These waste time, add complexity, or actively hurt the product for this audience.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| Native mobile app (iOS/Android) | 3-6 month delay, app store approval, maintenance burden. Web handles everything eSIM needs | PWA with "Add to Home Screen" prompt. Revisit native only after 10K+ monthly users |
| In-app live chat | Expensive to staff, students prefer async messaging, creates support expectations you can't meet early | WhatsApp support link + FAQ page. Scales better with small team |
| Unlimited data plans | Margin killer. Holafly's model requires massive scale to profit. You'd need to negotiate special wholesale rates | Offer generous caps (20GB, 50GB) at good prices. "More data than you'll use" messaging |
| Phone number / voice calling | Complicates the product massively (telecom regulation), students use WhatsApp/FaceTime for calls | Data-only plans. Explicitly market as "data for your apps" |
| Crypto payments | Tiny demand, regulatory complexity, payment processor headaches | Stick with Stripe (card, Apple Pay, Google Pay, PayPal). Covers 99% of student payment methods |
| Complex loyalty/points system | Over-engineering for early stage. Students want simple discounts, not gamification | Simple referral credit + student coupon. That's it |
| User-generated reviews on-site | Moderation burden, fake review risk, slow to accumulate | Collect reviews on Trustpilot/Google. Display aggregate rating badge |
| eSIM for IoT/enterprise | Completely different buyer, different sales cycle, different support needs | Consumer-only. Specifically students and young travelers |
| Physical SIM shipping | Defeats the entire value prop of instant digital delivery | eSIM only. If phone doesn't support eSIM, recommend competitor (builds goodwill) |
| Account required before purchase | Conversion killer. Students won't create account to browse prices | Guest checkout. Optional account creation AFTER purchase (to manage eSIMs) |

## Feature Dependencies

```
Device Compatibility Checker --> Purchase Flow (must check before user pays)
Payment Integration (Stripe) --> Purchase Flow (no payment = no product)
Wholesale API Integration --> QR Code Delivery (QR comes from provider)
Wholesale API Integration --> Data Usage Tracking (usage data from provider)
Wholesale API Integration --> Top-up Mechanism (top-up via provider API)
Purchase Flow --> Order History (need orders to display)
Purchase Flow --> Email Confirmation (triggered by purchase)
User Accounts (optional) --> Referral Program (need identity to track referrals)
User Accounts (optional) --> eSIM Management Dashboard (need to persist across sessions)
User Accounts (optional) --> Wallet/Credit System (need to store balance)
Referral Program --> Wallet/Credit System (referral rewards stored as credit)
i18n Framework --> Multi-language Support (must be baked in early, painful to retrofit)
SEO Landing Pages --> Content per Destination (need city/country specific content)
Device Setup Guides --> Device Model Database (need to know which instructions to show)
```

## MVP Recommendation

### Phase 1: Launch (must ship)
1. **Browse plans by destination** -- the core experience
2. **Stripe checkout (card + Apple Pay + Google Pay)** -- fast payment
3. **QR code delivery** -- the product itself
4. **Device compatibility checker** -- prevents support disasters
5. **Device setup guides** (iOS + Samsung + Pixel) -- reduces support load by 60%+
6. **Email confirmation with QR** -- legal requirement + backup delivery
7. **Mobile-first responsive design** -- the audience demands it
8. **Student discount coupon** -- the differentiator, dead simple to implement

### Phase 2: Retention
9. **User accounts** (optional, post-purchase) -- enables management features
10. **eSIM management dashboard** -- view active eSIMs, usage, expiry
11. **Top-up mechanism** -- retain users who run out of data
12. **Data usage tracking** -- users need to see remaining data
13. **Order history** -- users want to see past purchases
14. **PayPal payment option** -- expands payment coverage

### Phase 3: Growth
15. **Referral program** -- viral growth in student WhatsApp groups
16. **Wallet/credit system** -- store referral credits, enable quick repurchase
17. **SEO landing pages per destination** -- organic acquisition
18. **Multi-language** (EN, ES, PT, FR, DE) -- pan-European reach
19. **WhatsApp support integration** -- low-effort support channel
20. **Semester-long plans** -- unique offering if wholesale supports it

### Defer Indefinitely
- Native app, live chat, unlimited plans, crypto, voice/SMS, IoT

## Competitive Gap Analysis

The single biggest gap in the eSIM reseller market for this project to exploit:

**Nobody targets students.** Airalo is "everyone everywhere." Holafly is "unlimited data travelers." Nomad is "budget travelers." aloSIM is "simple and cheap." None of them:
- Offer student pricing
- Have semester-long plans
- Market to Erasmus/exchange communities
- Have SEO content for "eSIM + student + [city]"
- Integrate with student communities (WhatsApp groups, university forums)

The distribution advantage is also massive: one student tells their Erasmus WhatsApp group (50-200 people) and you get organic growth with zero CAC.

## Pricing Feature Considerations

| Plan Type | Market Rate (Airalo/Nomad) | Student Price (30% off) | Still Profitable? |
|-----------|---------------------------|------------------------|-------------------|
| 1GB / 7 days | $4-6 | $3-4 | Yes (wholesale ~$1-2) |
| 3GB / 30 days | $9-13 | $6-9 | Yes (wholesale ~$3-5) |
| 5GB / 30 days | $14-18 | $10-13 | Yes (wholesale ~$5-7) |
| 10GB / 30 days | $20-30 | $14-21 | Yes (wholesale ~$8-12) |
| 20GB / 30 days | $30-45 | $21-32 | Yes (wholesale ~$12-18) |

Note: Wholesale pricing needs validation with actual providers. Estimates based on publicly available reseller margin data.

## Sources

- Airalo.com feature set and pricing (training data, MEDIUM confidence)
- Holafly.com unlimited data model and features (training data, MEDIUM confidence)
- Nomad / getnomad.app features and referral program (training data, MEDIUM confidence)
- aloSIM.com features and pricing (training data, LOW confidence -- less documented)
- Stripe Payment Request API capabilities (training data, HIGH confidence)
- eSIM market reports and competitive analyses from 2024-2025 (training data, MEDIUM confidence)

**Confidence note:** Web search and fetch tools were unavailable during this research session. All competitor feature data is based on training data (up to May 2025). Recommend verifying current competitor features, especially pricing and any new features launched in late 2025 or 2026.
