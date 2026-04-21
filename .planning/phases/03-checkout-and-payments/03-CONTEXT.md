# Phase 3: Checkout and Payments - Context

**Gathered:** 2026-04-20
**Status:** Ready for planning

<domain>
## Phase Boundary

Users can purchase an eSIM plan through a fast, secure checkout flow with multiple payment methods (Stripe card, Apple Pay, Google Pay, PayPal), discount coupons (30% student/traveler), correct EU VAT handling (Stripe Tax), and chargeback prevention (3D Secure + Radar). Guest checkout only (email, no account required). No eSIM delivery/provisioning (Phase 4), no accounts (Phase 5).

</domain>

<decisions>
## Implementation Decisions

### Checkout Flow
- **Single-page checkout**: all steps on one page, no multi-step wizard — plan summary at top, email field, device check, payment methods, pay button
- **Guest checkout (email only)**: no account creation, no password — just email for receipt and QR delivery
- **Device compatibility check inline**: auto-populated from localStorage if user already checked during browse; if not, show brand/model picker inline after email field
- **Plan + VAT breakdown visible**: show plan price, VAT line item (calculated by Stripe Tax based on IP geolocation), and total — always visible before payment
- **EUR currency only**: all prices in euros, no currency switching for v1
- **"Under 2 minutes" target**: entire flow from tapping a plan card to payment confirmation must feel fast — minimal fields, no unnecessary steps

### Coupon UX
- **Collapsible "Have a code?" link**: not a prominent field — small text link that expands to reveal input field when tapped
- **Two entry methods**: URL parameter (`?coupon=STUDENT30`) auto-applies + manual text entry in the collapsible field
- **Visual feedback on apply**: strikethrough on original price + green text showing savings amount (e.g., "You save €2.70")
- **Single coupon type for v1**: 30% student/traveler discount — hardcoded coupon logic (Stripe Coupons API), not a full promo engine
- **Invalid coupon handling**: inline red error "Invalid code" below input, field stays open for retry

### Payment Methods
- **Express payment buttons at top**: Apple Pay / Google Pay buttons rendered via Stripe Payment Request API — shown first since they're fastest (one-tap)
- **Auto-detect and hide unsupported**: if device doesn't support Apple Pay, don't show the button (Payment Request API handles this)
- **Inline Stripe Elements card form below express buttons**: embedded card number, expiry, CVC fields — not a Stripe Checkout redirect
- **PayPal as separate button**: below card form, opens PayPal flow (Stripe PayPal integration or direct PayPal SDK — researcher to determine best approach)
- **3D Secure enabled**: Stripe handles 3DS challenges automatically for SCA compliance
- **Stripe Radar enabled**: fraud scoring on all transactions, block high-risk automatically
- **Bambu loading state during processing**: Bambu eating bamboo animation while payment processes
- **Bambu error on failure**: Bambu apologetic pose + clear error message + "Try again" button

### Post-Payment Success
- **Bambu celebration screen**: Bambu dance pose + confetti animation on successful payment
- **Auto-redirect to dashboard after 5 seconds**: countdown visible, user can also tap to go immediately
- **Success screen shows**: "Your eSIM is ready!" + order confirmation number + "Check your email" reminder
- **No QR code on this screen**: QR delivery is Phase 4 — success screen just confirms payment went through

### eSIM Delivery Method (Phase 4 prep decision)
- **Primary: direct eSIM install link on mobile** — iOS 17.4+ and Android 14+ support activating eSIMs via deep link, no QR scanning needed. User taps "Install eSIM" and OS handles it
- **Fallback: manual code copy** — SM-DP+ address and activation code for copy-paste into device settings
- **Optional: email QR code** — for users who want to install on a different device or set up later
- **Locked decision**: This is noted here for Phase 4 to implement. Phase 3 only handles payment confirmation.

### Claude's Discretion
- Stripe Elements styling to match eSIM Panda design system
- Exact card form field layout (single line vs stacked)
- Loading skeleton during Stripe initialization
- Error message copy for specific payment failure types
- PayPal integration approach (Stripe PayPal vs direct SDK)
- Mobile keyboard optimization for email and card inputs
- Exact confetti animation parameters

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project Context
- `.planning/PROJECT.md` — Full project vision, brand identity with Bambu persona, core value ("under 2 minutes"), constraints
- `.planning/REQUIREMENTS.md` — Phase 3 requirements: CHK-01, CHK-02, CHK-03, CHK-04, CHK-05, INF-05

### Research
- `.planning/research/STACK.md` — Technology stack (Next.js 15, Supabase, Motion, Tailwind)
- `.planning/research/ARCHITECTURE.md` — System architecture, payment flow, data model
- `.planning/research/FEATURES.md` — Feature landscape, checkout best practices from competitors

### Prior Phase Context
- `.planning/phases/01-foundation-and-design-system/01-CONTEXT.md` — Design decisions: brand colors, typography, Bambu poses, animation contracts
- `.planning/phases/01-foundation-and-design-system/01-UI-SPEC.md` — UI design contract: spacing tokens, color system, component primitives
- `.planning/phases/02-catalog-and-browsing/02-CONTEXT.md` — Browse decisions: plan card design, device compat checker (saves to localStorage)

### Phase 1 Implementation
- `.planning/phases/01-foundation-and-design-system/01-01-SUMMARY.md` — DB schema, provider abstraction, Supabase clients
- `.planning/phases/01-foundation-and-design-system/01-02-SUMMARY.md` — Design system components, Bambu poses, layout components

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/components/ui/card.tsx`: Card component with elevated/flat variants — use for checkout summary card
- `src/components/ui/button.tsx`: 4-variant button with whileTap scale — use for payment buttons and CTAs
- `src/components/ui/input.tsx`: Form input with error state — use for email field and coupon input
- `src/components/ui/badge.tsx`: Semantic badge — use for discount badge on price
- `src/components/bambu/bambu-loading.tsx`: Eating bamboo animation — use during payment processing
- `src/components/bambu/bambu-error.tsx`: Apologetic sweat-drop — use on payment failure
- `src/components/bambu/bambu-empty.tsx`: Curious pose — potential use for empty/waiting states
- `src/components/layout/page-transition.tsx`: AnimatePresence transitions — use for checkout page entry

### Established Patterns
- Motion library: import from "motion/react" (not framer-motion)
- Tailwind v4: CSS-first config with @theme directive in globals.css
- i18n: next-intl with [locale] route segments, all text through translation keys
- State: Zustand stores for client state (see `src/stores/browse.ts`, `src/stores/comparison.ts`)
- Mock data: `src/lib/mock-data/` pattern for development without Supabase connection
- Snake_case fields: all data types use snake_case matching DB schema

### Integration Points
- `src/app/[locale]/checkout/page.tsx`: Does not exist yet — create as new route
- `src/components/browse/plan-card.tsx`: Currently has "Coming soon" toast on tap — will link to checkout
- `src/hooks/use-device-compat.ts`: Device compatibility hook with localStorage persistence — reuse in checkout
- `src/stores/browse.ts`: Has expandedDestination state — checkout needs selected plan state
- `src/lib/esim/types.ts`: NormalizedPurchase type already has `iosActivationLink` and `androidActivationLink` fields
- `messages/en.json`: Translation keys — add checkout-related keys
- `supabase/migrations/00001_initial_schema.sql`: Orders table schema for storing purchases

</code_context>

<specifics>
## Specific Ideas

- Express payment (Apple/Google Pay) at the top because one-tap checkout is the fastest path — embodies "under 2 minutes"
- Coupon as collapsible link keeps the flow clean for the 90% who don't have a code
- URL parameter coupons (`?coupon=STUDENT30`) enable marketing links that auto-apply discounts
- Bambu celebration with confetti makes the purchase feel rewarding, not transactional
- Device check auto-populated from localStorage means returning browsers skip an entire step
- No QR code delivery in this phase — Phase 4 handles delivery with direct install links (not QR scanning) as primary method for mobile users

</specifics>

<deferred>
## Deferred Ideas

- eSIM delivery (QR/install link) — Phase 4
- Account creation after purchase — Phase 5
- Purchase history — Phase 6
- Multiple currency support — v2

</deferred>

---

*Phase: 03-checkout-and-payments*
*Context gathered: 2026-04-20*
