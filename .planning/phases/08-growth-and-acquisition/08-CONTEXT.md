# Phase 8: Growth and Acquisition - Context

**Gathered:** 2026-04-25
**Status:** Ready for planning

<domain>
## Phase Boundary

Growth levers are active — users can refer friends and both earn a free 1GB day pass, and support is accessible via a floating WhatsApp button on all pages. Includes an admin page for managing influencer coupon codes. No admin dashboard for orders/revenue (v2), no affiliate program beyond coupons (v2), no automated chatbot (v2).

</domain>

<decisions>
## Implementation Decisions

### Referral Mechanics
- **Reward model:** Both referrer and referred friend get a free 1GB day pass
- **Delivery mechanism:** 100% off single-use coupon code — referrer goes through normal checkout, picks any country, applies code, pays €0. Reuses existing coupon system
- **Account required:** Referrer must have an account to get a referral link
- **Trigger:** Referrer earns reward after friend activates their eSIM (not on purchase alone — prevents buy+refund gaming)
- **Cap:** Max 5 free plans per month per referrer, resets monthly
- **Destination:** Referrer picks any country when redeeming their free plan (not locked to friend's destination)
- **Self-referral:** Blocked — if referrer email matches buyer email, no reward awarded
- **Attribution window:** 7 days — friend must purchase within 7 days of clicking referral link

### Referral Sharing UX
- **Access points:** Full `/referral` page (from account menu) + quick "Copy link" in account dropdown
- **Link format:** `esimpanda.com/r/CODE` — dedicated path with short unique code per user
- **Share methods:** Copy button + Web Share API (native share sheet) + dedicated WhatsApp/Instagram/Twitter share buttons with pre-written messages
- **Pre-written share text:** Deal-focused — "Get a free 1GB eSIM for your next trip! Use my link" (emphasis on the free offer)
- **Referral page stats:** Minimal — total friends invited, free plans earned, free plans remaining
- **Post-purchase CTA:** Share prompt on success/delivery page — "Share with a friend — you both get a free 1GB plan" with share buttons
- **Delivery email:** Personalized referral link for logged-in users (replaces generic "Share eSIM Panda" link)
- **Mascot:** No Bambu on referral page — clean utility page focused on link and stats

### WhatsApp Support Button
- **Placement:** Floating button, bottom-right corner, visible on all pages. Green circle with WhatsApp icon
- **Mobile behavior:** Hides on scroll down, reappears on scroll up — avoids cluttering with bottom nav
- **Pre-filled message:** Context-aware per page — "Help with plan selection" on browse, "Help with my order [ID]" on delivery, generic "Hi!" elsewhere
- **Availability:** No status indicator — just the green icon. Users expect async WhatsApp responses
- **First visit:** Subtle pulse/bounce animation on first visit, then static
- **Number:** Environment variable for WhatsApp number (to be set up as WhatsApp Business account)

### Influencer Coupons
- **Admin page:** Password-protected `/admin/coupons` page for creating and managing influencer codes
- **Admin auth:** Requires login with admin credentials (Supabase auth with admin role check)
- **Discount:** Fixed 10% for all influencer coupons
- **Min order:** Same €9.99 minimum as student discount
- **Stacking:** No stacking — one coupon per order (influencer OR student, not both)
- **Expiry:** No expiry by default — coupons stay active until manually deactivated
- **Max uses:** Unlimited per coupon — no usage cap
- **Coupon fields:** Code (e.g., MARIA10), influencer name, social media profile URL, free-text notes
- **Admin stats:** Detailed — total uses, total revenue generated, usage over time, last used date per coupon

### Claude's Discretion
- Admin page layout and table design
- Referral code generation algorithm (short unique strings)
- WhatsApp button z-index and scroll detection implementation
- Share button icons and styling
- Coupon stats chart/visualization approach
- Error states for referral edge cases
- Notification method when referrer earns a reward (email vs in-app vs both)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Coupon system (existing)
- `src/lib/checkout/coupons.ts` — Current coupon definitions and validateCoupon() logic. Influencer coupons extend this.
- `src/lib/checkout/types.ts` — Coupon interface with min_order_cents, discount_percent, is_active fields
- `src/lib/checkout/pricing.ts` — calculatePrice() passes retail_price_cents to validateCoupon for min order check
- `src/app/api/checkout/validate-coupon/route.ts` — Coupon validation API, returns specific error types

### Account system (existing)
- `src/lib/auth/` — Supabase auth integration, session management
- `src/stores/` — Zustand store pattern (browse.ts, checkout.ts, delivery.ts) — referral store should follow same pattern

### Email templates (existing)
- `src/lib/email/templates/delivery-email.tsx` — Has "Share eSIM Panda" footer link that should become personalized referral link

### Requirements
- `.planning/REQUIREMENTS.md` — GRW-01 (referral program), GRW-04 (WhatsApp support)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- **Coupon system** (`src/lib/checkout/coupons.ts`): COUPONS array + validateCoupon() — influencer coupons can be added to same array or a separate data source
- **Delivery email template** (`src/lib/email/templates/delivery-email.tsx`): Already has referral footer — needs personalization with user's referral code
- **Zustand stores** (`src/stores/`): Established pattern for client state — referral store follows same create() pattern
- **UI components** (`src/components/ui/`): Button, Card, and other primitives available for admin and referral pages
- **i18n** (`messages/*.json`): 4-language translation files — new keys needed for referral, WhatsApp, and admin strings

### Established Patterns
- **Mock mode**: All features support NEXT_PUBLIC_*_MOCK=true for development without external services
- **API routes**: Next.js App Router API routes in `src/app/api/`
- **Supabase auth**: Session management via Supabase + Zustand auth store wrapper
- **Motion animations**: Framer Motion for micro-interactions (pulse animation for WhatsApp button)

### Integration Points
- **Account dropdown menu**: Add "Invite Friends" + "Copy referral link" items
- **Success/delivery page**: Add share CTA after purchase
- **Delivery email**: Personalize share link for logged-in users
- **Checkout flow**: Enforce single-coupon rule (no stacking)
- **Layout component**: Add floating WhatsApp button
- **Bottom nav**: Coordinate WhatsApp button visibility with scroll

</code_context>

<specifics>
## Specific Ideas

- Influencer coupons are the influencer's "payment" — the discount they offer followers IS the deal, no cash commission
- Share text is deal-focused: "Get a free 1GB eSIM for your next trip! Use my link" — emphasis on what the friend gets
- Admin page should show detailed stats with timeline so the owner can evaluate which influencers actually convert over time
- Referral page is clean utility — no mascot, no gamification, just link + stats

</specifics>

<deferred>
## Deferred Ideas

- Affiliate program with cash commission — v2 (ADV-04 in REQUIREMENTS.md)
- Gamified referral tiers (Gold Panda, milestone badges) — future enhancement
- Admin dashboard for orders/revenue — v2 (ADV-01)
- Automated chatbot for WhatsApp — v2 (ADV-02)

</deferred>

---

*Phase: 08-growth-and-acquisition*
*Context gathered: 2026-04-25*
