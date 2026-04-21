# Phase 4: eSIM Delivery - Context

**Gathered:** 2026-04-21
**Status:** Ready for planning

<domain>
## Phase Boundary

After successful payment, the system provisions an eSIM via the wholesale API (synchronous on success page, webhook safety net), delivers activation credentials on-screen (smart device detection: install link on mobile, QR code on desktop), sends a branded email backup with QR code + receipt + setup link, and provides device-specific setup guides (iOS, Samsung, Pixel). No account system (Phase 5), no eSIM management dashboard (Phase 6), no referral program (Phase 8 — but subtle footer link in email).

</domain>

<decisions>
## Implementation Decisions

### Delivery Page Experience
- **Transform success page**: same `/checkout/success` URL — celebration animation morphs into delivery content once provisioning completes. No separate route.
- **Smart default by device**: detect mobile vs desktop. Mobile: big "Install eSIM" button (direct link via `iosActivationLink`/`androidActivationLink`) front and center, manual SM-DP+ code collapsed below. Desktop: show QR code prominently (scan from phone), manual code below.
- **Bambu preparing animation**: Bambu "wrapping/preparing" the eSIM with progress message ("Setting up your eSIM...") while provisioning runs. Transitions to delivery content when ready.
- **Session-only re-access + email backup**: delivery page works during browser session. After that, user relies on email with QR code + install link. Accounts (Phase 5) add permanent access later.

### Device Setup Guides
- **Three device families**: iOS, Samsung, Pixel/stock Android. Covers ~90% of eSIM-capable devices.
- **Text steps with icons**: numbered text instructions with small icons for each action (Settings > Mobile Data > Add eSIM). Clean, maintainable, survives OS updates.
- **Expandable section**: "Need help setting up?" collapsible below the install button. Opens with auto-detected device family steps.
- **Fallback for unknown devices**: generic Android steps + "Need help? Contact us on WhatsApp" link.

### Email Delivery
- **Single email after provisioning**: one email with everything — no separate "payment confirmed" email. User already sees on-screen confirmation.
- **Content**: QR code image + SM-DP+ address and activation code as copyable text + order receipt (plan, destination, price, date) + link to setup guide on website.
- **Resend as email service**: modern API, React Email for branded templates, generous free tier.
- **Branded with Bambu**: eSIM Panda header, brand colors (#2979FF accent), Bambu mascot graphic, styled receipt layout.
- **From name**: "eSIM Panda" <noreply@esimpanda.com>
- **Subtle referral footer**: small "Know someone traveling? Share eSIM Panda" link in email footer. Seeds Phase 8 referral program early.

### Webhook Provisioning Pipeline
- **Synchronous provisioning on success page**: when success page loads with `payment_intent`, calls API that provisions eSIM in real-time. User waits 3-10s with Bambu animation.
- **Polling for status**: success page polls API every 2-3 seconds to check provisioning status. Simple, no special infra.
- **Stripe webhook safety net**: webhook listens for `payment_intent.succeeded`. If no eSIM provisioned within 60s, webhook triggers provisioning. Prevents lost orders if user closes browser.
- **Auto-retry on failure**: retry provisioning 3 times. If still fails, show Bambu error with "We're working on it" message + WhatsApp support link. Store failed order for manual resolution.
- **Encrypted QR storage**: activation data stored encrypted in orders table (AES-256). Decrypt on-demand when displaying. Meets INF-04 requirement.
- **Orders table update**: add `esim_iccid`, `esim_qr_encrypted`, `esim_status`, `esim_activation_code`, `esim_smdp_address` columns to existing orders table. Single table for full purchase lifecycle.
- **Mock mode**: simulate 3-5 second provisioning delay, return mock QR code base64, fake activation codes, and mock install links. Matches existing `STRIPE_MOCK_MODE` pattern.

### Claude's Discretion
- Exact Bambu "preparing" animation design (wrapping, dancing, etc.)
- QR code generation library choice
- Polling interval fine-tuning (2s vs 3s)
- Exact email template layout and spacing
- Setup guide icon selection
- Encryption key management approach
- Mock data content (fake QR codes, activation codes)
- Mobile vs desktop detection method (user-agent, screen size, or feature detection)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project Context
- `.planning/PROJECT.md` — Full project vision, brand identity with Bambu persona, core value ("under 2 minutes"), constraints
- `.planning/REQUIREMENTS.md` — Phase 4 requirements: DEL-01, DEL-02, DEL-03, INF-03, INF-04

### Research
- `.planning/research/STACK.md` — Technology stack (Next.js 15, Supabase, Motion, Tailwind)
- `.planning/research/ARCHITECTURE.md` — System architecture, payment flow, data model, webhook patterns

### Prior Phase Context
- `.planning/phases/01-foundation-and-design-system/01-CONTEXT.md` — Design decisions: brand colors, typography, Bambu poses, animation contracts
- `.planning/phases/01-foundation-and-design-system/01-UI-SPEC.md` — UI design contract: spacing tokens, color system, component primitives
- `.planning/phases/02-catalog-and-browsing/02-CONTEXT.md` — Browse decisions: plan card design, device compat checker (saves to localStorage)
- `.planning/phases/03-checkout-and-payments/03-CONTEXT.md` — Checkout decisions: success page with Bambu celebration, eSIM delivery method prep decision (direct link primary, fallback manual code, optional email QR)

### Phase Implementation References
- `.planning/phases/01-foundation-and-design-system/01-01-SUMMARY.md` — DB schema, provider abstraction, Supabase clients
- `.planning/phases/01-foundation-and-design-system/01-02-SUMMARY.md` — Design system components, Bambu poses, layout components
- `.planning/phases/03-checkout-and-payments/03-UI-SPEC.md` — Checkout UI design contract (success page design)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/lib/esim/provider.ts`: ESIMProvider interface with `purchase()` method — triggers wholesale API provisioning
- `src/lib/esim/celitech-adapter.ts`: CELITECH adapter implementing provider interface — real provisioning logic
- `src/lib/esim/types.ts`: NormalizedPurchase type with `iccid`, `activationQrBase64`, `manualActivationCode`, `iosActivationLink?`, `androidActivationLink?`, `status`
- `src/components/checkout/payment-success.tsx`: Existing success screen with BambuSuccess, confetti animation — transform into delivery page
- `src/components/bambu/bambu-success.tsx`: Celebration pose — reuse for initial success, transition to delivery
- `src/components/bambu/bambu-loading.tsx`: Eating bamboo animation — adapt for "preparing eSIM" state
- `src/components/bambu/bambu-error.tsx`: Apologetic sweat-drop — use for provisioning failure
- `src/components/ui/button.tsx`: 4-variant button — use for "Install eSIM" CTA
- `src/components/ui/card.tsx`: Card with elevated/flat variants — use for delivery content container
- `src/hooks/use-device-compat.ts`: Device compatibility hook with localStorage — reuse for device family detection in setup guides

### Established Patterns
- Motion library: import from "motion/react" (not framer-motion)
- Tailwind v4: CSS-first config with @theme directive in globals.css
- i18n: next-intl with [locale] route segments, all text through translation keys
- State: Zustand stores for client state
- Mock data: `src/lib/mock-data/` pattern with `STRIPE_MOCK_MODE` flag for dev without real APIs
- Snake_case fields: all data types use snake_case matching DB schema
- API routes: `src/app/api/` pattern for server-side logic

### Integration Points
- `src/app/[locale]/checkout/success/page.tsx`: Current success page — transform into delivery page
- `src/app/api/`: Add provisioning and webhook endpoints
- `src/lib/stripe/client.ts`: STRIPE_MOCK_MODE flag — extend pattern for provisioning mock mode
- `supabase/migrations/00001_initial_schema.sql`: Orders table — add esim_* columns
- `messages/en.json`: Translation keys — add delivery, setup guide, and email-related keys
- No email infrastructure exists — Resend + React Email to be set up from scratch

</code_context>

<specifics>
## Specific Ideas

- Success page transformation (celebration → Bambu preparing → delivery) creates a seamless emotional journey — payment joy flows into "your eSIM is ready" excitement
- Smart device detection means mobile users (the primary audience) get the fastest possible path: one tap to install
- Desktop users see QR code prominently — natural "scan with your phone" flow
- Expandable setup guide keeps the delivery page clean for confident users while helping those who need it
- Single branded email is the complete backup: QR, codes, receipt, and setup link all in one place
- Subtle referral footer in email plants the growth seed early without cluttering the delivery experience
- Webhook safety net ensures no paid customer ever loses their eSIM, even if they close the browser

</specifics>

<deferred>
## Deferred Ideas

- Permanent eSIM page with account access — Phase 5 (accounts) + Phase 6 (management)
- Full referral program in email — Phase 8 (subtle footer link included now)
- Push notification when eSIM is ready — Phase 9 (PWA)
- Multiple email templates (confirmation, delivery, expiry warning) — Phase 6+

</deferred>

---

*Phase: 04-esim-delivery*
*Context gathered: 2026-04-21*
