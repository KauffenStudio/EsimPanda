# Phase 6: eSIM Management - Context

**Gathered:** 2026-04-24
**Status:** Ready for planning

<domain>
## Phase Boundary

Logged-in users can manage their active eSIMs from a dashboard — viewing status, tracking data usage, topping up data, and reviewing purchase history. This is the first phase with protected pages (login required). No profile/settings page (Phase 7), no referral program (Phase 8), no admin panel.

</domain>

<decisions>
## Implementation Decisions

### Dashboard Layout & eSIM Cards
- **Card per eSIM**: each card shows destination flag + name, status badge (active/expired/pending), data remaining circular gauge, expiry date, and "Top Up" button
- **Essential info only**: no ICCID, no activation codes on cards — keep it clean. Details available in purchase history
- **Empty state**: Bambu invite pose ("No eSIMs yet? Let's get you connected!") with prominent "Browse Plans" CTA button
- **Login required**: dashboard is a protected page — unauthenticated users redirect to /login with `?next=/dashboard`. This is the first protected route in the app
- **Status badges**: active (green), expired (gray), pending (amber). Simple color-coded pills
- **Card order**: active eSIMs first, then by expiry date (soonest expiring at top)

### Data Usage Tracking
- **Circular gauge visualization**: not a linear bar — circular progress ring showing data used vs total, with percentage and GB remaining as text inside the ring
- **Refresh strategy**: fetch usage on page load + manual refresh button with "Last updated: X minutes ago" timestamp
- **API failure handling**: show last cached data with amber "Usage data may be outdated" warning. Don't break the dashboard if the provider API is slow/down
- **Low-data warnings**: dual notification system:
  - Card-level: amber warning at 20% remaining, red warning at 10% remaining (color change on the gauge + text)
  - Dashboard-level: persistent amber/red banner at top of dashboard when any eSIM is low on data, with quick "Top Up" CTA

### Top-Up Flow
- **In-dashboard modal**: top-up opens a modal overlay on the dashboard page, not a separate page. Keeps context — user can see the eSIM card behind the modal
- **Same plan durations**: show available top-up packages from the provider (same durations as original purchase options)
- **Same Stripe payment flow**: reuse existing Stripe Elements integration (PaymentElement, Apple Pay, Google Pay). Create new payment intent for the top-up amount
- **Reuse payment Bambu poses**: same Bambu processing/success/error poses from checkout flow
- **No coupons on top-ups**: student discount applies only to first purchase. Top-ups are full price — simpler flow, better margins
- **Success behavior**: close modal, update the eSIM card with new data total + success toast notification ("Data added to your [destination] eSIM!")
- **Expired eSIM reactivation**: allow top-up on expired eSIMs — provider reactivates the eSIM. Same flow, card status changes from expired back to active
- **Quick top-up CTA**: low-data warning banner includes a direct "Top Up" button that opens the modal pre-selected for that eSIM

### Purchase History
- **Chronological list**: reverse chronological (newest first)
- **Tab on dashboard page**: two tabs — "My eSIMs" (default) | "Purchase History". Same page, tab switches content
- **Expandable row**: each row shows date, destination, amount paid. Tap/click expands to show full details: order ID, plan name + duration, payment method, coupon applied (if any), VAT breakdown, ICCID
- **Re-access QR code + re-send email**: expandable row includes "View QR Code" button (opens QR display inline) and "Re-send Email" button (triggers delivery email re-send). Useful when user gets a new phone or lost the original email

### Claude's Discretion
- Exact circular gauge component implementation (SVG vs canvas vs library)
- Dashboard grid layout (responsive breakpoints, card sizing)
- Modal animation and overlay styling for top-up
- Tab component design and switching animation
- Expandable row animation and detail layout
- Loading skeleton design for dashboard
- Exact refresh polling interval for usage data
- Toast notification component and positioning
- Mobile vs desktop layout adaptations for dashboard

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project Context
- `.planning/PROJECT.md` — Full project vision, brand identity with Bambu persona, core value ("under 2 minutes"), constraints
- `.planning/REQUIREMENTS.md` — Phase 6 requirements: MGT-01, MGT-02, MGT-03, MGT-04

### Prior Phase Context
- `.planning/phases/01-foundation-and-design-system/01-CONTEXT.md` — Design decisions: brand colors, typography, Bambu poses, animation contracts
- `.planning/phases/01-foundation-and-design-system/01-UI-SPEC.md` — UI design contract: spacing tokens, color system, component primitives
- `.planning/phases/03-checkout-and-payments/03-CONTEXT.md` — Checkout decisions: Stripe integration, payment flow, coupon system
- `.planning/phases/04-esim-delivery/04-CONTEXT.md` — Delivery decisions: QR code display, email delivery via Resend, provisioning flow
- `.planning/phases/05-user-accounts/05-CONTEXT.md` — Auth decisions: login/signup, session persistence, protected routes approach

### Prior Phase Implementation
- `.planning/phases/01-foundation-and-design-system/01-02-SUMMARY.md` — Design system components, Bambu poses, layout components
- `.planning/phases/03-checkout-and-payments/03-02-SUMMARY.md` — Stripe Elements integration, payment flow implementation
- `.planning/phases/04-esim-delivery/04-03-SUMMARY.md` — Email delivery via Resend + React Email, QR code display

### Existing Code
- `src/lib/esim/provider.ts` — ESIMProvider interface with `getStatus(iccid)` and `topUp(iccid, packageId)` methods
- `src/lib/esim/celitech-adapter.ts` — CelitechAdapter implementing ESIMProvider (purchase, getStatus, topUp)
- `src/lib/esim/types.ts` — NormalizedPurchase, NormalizedPackage types
- `supabase/migrations/00001_initial_schema.sql` — esims table: data_total_gb, data_used_gb, last_usage_check, status, expires_at
- `src/stores/auth.ts` — Zustand auth store pattern (user, loading, initialize)
- `src/stores/delivery.ts` — Zustand store pattern reference for new dashboard store
- `src/components/checkout/card-payment.tsx` — Stripe PaymentElement component (reuse for top-up)
- `src/components/checkout/express-checkout.tsx` — Apple Pay/Google Pay component (reuse for top-up)
- `src/components/delivery/qr-code-display.tsx` — QR code rendering component (reuse for re-access)
- `src/lib/email/send-delivery.ts` — Resend email pattern (reuse for re-send)
- `src/components/bambu/bambu-empty.tsx` — Empty state Bambu (already used in dashboard placeholder)
- `src/app/[locale]/dashboard/page.tsx` — Existing dashboard page (currently empty state placeholder)
- `src/middleware.ts` — Combined i18n + auth middleware (extend for protected route redirect)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/components/checkout/card-payment.tsx`: Stripe PaymentElement — reuse for top-up payment modal
- `src/components/checkout/express-checkout.tsx`: Apple Pay/Google Pay — reuse for top-up
- `src/components/delivery/qr-code-display.tsx`: QR code renderer — reuse for purchase history QR re-access
- `src/lib/email/send-delivery.ts`: Resend email sender — reuse for email re-send
- `src/components/bambu/bambu-empty.tsx`: Empty state Bambu — already in dashboard placeholder
- `src/components/bambu/bambu-success.tsx`: Success celebration — use for top-up success
- `src/components/bambu/bambu-loading.tsx`: Loading animation — use for data fetch loading
- `src/components/ui/card.tsx`: Card component — base for eSIM cards
- `src/components/ui/button.tsx`: Button with whileTap — use throughout dashboard
- `src/components/ui/input.tsx`: Form input — not heavily needed in Phase 6

### Established Patterns
- Motion library: import from "motion/react" (not framer-motion)
- Tailwind v4: CSS-first config with @theme directive in globals.css
- i18n: next-intl with [locale] route segments, all text through translation keys
- State: Zustand stores for client state (checkout.ts, delivery.ts, browse.ts, auth.ts)
- Mock data: NEXT_PUBLIC_STRIPE_MOCK pattern — dashboard should show mock eSIMs in dev mode
- Snake_case fields: all data types use snake_case matching DB schema
- No Supabase connection in dev: use mock/stub data for dashboard eSIMs and usage
- Server actions for mutations: follow auth actions pattern for top-up and email re-send
- ESIMProvider interface: `getStatus(iccid)` returns NormalizedPurchase with usage data, `topUp(iccid, packageId)` handles reactivation

### Integration Points
- `src/middleware.ts`: Extend with protected route check — redirect unauthenticated to /login?next=/dashboard
- `src/app/[locale]/dashboard/page.tsx`: Replace empty placeholder with full dashboard
- `src/components/layout/header.tsx`: Dashboard link already exists in nav
- `src/stores/auth.ts`: Read user state to gate dashboard access on client side
- `POST /api/checkout/create-intent`: Adapt or create new endpoint for top-up payment intents
- `POST /api/delivery/provision`: May need a "top-up provision" variant or the topUp provider method handles it directly
- `messages/en.json`: Add dashboard, usage, top-up, and purchase history i18n keys

</code_context>

<specifics>
## Specific Ideas

- Circular gauge for data usage creates a distinctive, premium feel — differentiates from basic progress bars
- Dual low-data notification (card + banner) ensures users never miss a warning, with the banner providing an immediate action path
- In-dashboard modal for top-up keeps context visible — user sees their eSIM card behind the modal, understands what they're topping up
- Re-access QR + re-send email in purchase history is a real user need — phone migration, lost emails. Reduces support burden
- Allowing top-up on expired eSIMs (reactivation) is a revenue opportunity and reduces churn — user doesn't need to buy a new eSIM
- Tab-based dashboard ("My eSIMs" | "Purchase History") keeps everything on one page — no extra navigation

</specifics>

<deferred>
## Deferred Ideas

- User profile page with settings — Phase 7
- eSIM usage notifications (push/email when data low) — v2 enhancement
- Auto top-up (subscribe to automatic refills) — v2 enhancement
- Data usage analytics/graphs over time — v2 enhancement
- Export purchase history as PDF/CSV — v2 enhancement
- eSIM transfer between accounts — out of scope
- Multi-device eSIM management — out of scope

</deferred>

---

*Phase: 06-esim-management*
*Context gathered: 2026-04-24*
