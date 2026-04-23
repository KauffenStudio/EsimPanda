# Phase 5: User Accounts - Context

**Gathered:** 2026-04-23
**Status:** Ready for planning

<domain>
## Phase Boundary

Users who purchased as guests can create an account to persist their eSIM history, and returning users can log in with email/password to access their dashboard. Supabase Auth handles authentication. No eSIM management dashboard (Phase 6), no referral program (Phase 8), no social login (v2). Account is fully optional — users can browse, purchase, and receive eSIMs without ever creating one.

</domain>

<decisions>
## Implementation Decisions

### Guest-to-Account Conversion
- **Prompt on delivery page**: after QR code/eSIM appears, show "Create account to save your eSIM" CTA. Highest motivation moment — user just received something valuable
- **Password-only conversion**: email is already known from checkout. Just ask for a password — one field, instant conversion. Supabase creates account with that email
- **Auto-link orders by email**: match guest email to order email — all previous orders automatically appear in account. No manual claim step needed
- **Account is optional**: users can browse, buy, and receive eSIMs without ever creating an account. Account adds persistence and management features (Phase 6)

### Login & Signup Experience
- **Email/password only**: no social login, no magic links. Supabase Auth handles this natively. Social login can be added later without rebuilding
- **Dedicated pages**: `/login` and `/signup` as full pages with Bambu companion. Clean URLs, easy to link to
- **Signup form**: two fields only — email and password. Name is optional, can be added in profile later
- **Bambu welcoming wave**: Bambu waves hello on login page, does a happy bounce on successful signup. Warm, on-brand, not distracting
- **Password minimum 8 characters**: no special character or number requirements. Simple rule, Supabase default
- **Duplicate email handling**: "This email already has an account. Log in instead?" with link to login page
- **Always remember sessions**: no "remember me" checkbox — sessions always persist until explicit logout. Matches what young users expect from mobile-first apps
- **Header login button**: "Log in" text button in header nav bar, visible on all pages. After login, becomes user avatar/initial circle with dropdown menu (My eSIMs, Settings, Log out)

### Password Reset Flow
- **Branded reset email**: same eSIM Panda branded template with Bambu graphic, blue accent (#2979FF), consistent with delivery email. Uses Resend + React Email (already set up in Phase 4)
- **New password page**: `/reset-password` page with "New password" field + confirm field. Bambu encouraging pose. Clean, focused
- **1 hour link expiry**: standard — long enough for email delays, short enough for security. Supabase default
- **No email enumeration**: "If an account exists, we sent a reset link." Same message regardless of whether email is registered

### Session & Persistence
- **Avatar/initial in header**: header "Log in" button becomes a circle with first letter of email when logged in. Tapping opens dropdown menu
- **No protected pages in Phase 5**: all current pages stay public. Account-required pages (/my-esims, /profile) come in Phase 6. Phase 5 just adds the auth system + conversion flow
- **Supabase session + Zustand store**: Supabase handles the real session (cookies, refresh tokens). A Zustand auth store wraps it for easy component access. Matches existing store pattern (browse.ts, checkout.ts, delivery.ts)
- **Silent token refresh**: Supabase auto-refreshes tokens in the background. User never notices session management. Only force logout on actual token invalidation

### Claude's Discretion
- Exact Bambu poses for auth pages (welcoming wave, happy bounce — implementation details)
- Form field layout and spacing on login/signup pages
- Dropdown menu styling and animation for logged-in user
- Password reset email template layout
- Error message copy for specific auth failures
- Loading states during auth operations
- Middleware approach for extending existing i18n middleware with auth

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project Context
- `.planning/PROJECT.md` — Full project vision, brand identity with Bambu persona, core value ("under 2 minutes"), constraints
- `.planning/REQUIREMENTS.md` — Phase 5 requirements: ACC-01, ACC-02, ACC-03, ACC-04

### Prior Phase Context
- `.planning/phases/01-foundation-and-design-system/01-CONTEXT.md` — Design decisions: brand colors, typography, Bambu poses, animation contracts
- `.planning/phases/01-foundation-and-design-system/01-UI-SPEC.md` — UI design contract: spacing tokens, color system, component primitives
- `.planning/phases/03-checkout-and-payments/03-CONTEXT.md` — Checkout decisions: guest checkout, email capture, single-page flow
- `.planning/phases/04-esim-delivery/04-CONTEXT.md` — Delivery decisions: success page transformation, email delivery via Resend

### Prior Phase Implementation
- `.planning/phases/01-foundation-and-design-system/01-02-SUMMARY.md` — Design system components, Bambu poses, layout components
- `.planning/phases/04-esim-delivery/04-03-SUMMARY.md` — Email delivery via Resend + React Email (reuse for password reset email)

### Existing Code
- `src/lib/supabase/client.ts` — Browser Supabase client (no auth methods called yet)
- `src/lib/supabase/server.ts` — Server Supabase client with cookie handling
- `src/lib/email/send-delivery.ts` — Resend email sending pattern (reuse for password reset)
- `src/lib/email/templates/delivery-email.tsx` — React Email template pattern (reference for reset email)
- `src/stores/checkout.ts` — Zustand store pattern with email state
- `src/middleware.ts` — Currently i18n only (next-intl), needs auth extension

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/components/ui/input.tsx`: Form input with error state — use for email/password fields
- `src/components/ui/button.tsx`: 4-variant button with whileTap scale — use for auth CTAs
- `src/components/ui/card.tsx`: Card component — use for auth form container
- `src/components/bambu/bambu-*.tsx`: Bambu pose components — create new welcoming wave pose
- `src/components/layout/page-transition.tsx`: AnimatePresence transitions — use for auth pages
- `src/lib/email/send-delivery.ts`: Resend lazy init pattern — reuse for password reset email
- `src/lib/email/templates/delivery-email.tsx`: React Email branded template — reference for reset email template

### Established Patterns
- Motion library: import from "motion/react" (not framer-motion)
- Tailwind v4: CSS-first config with @theme directive in globals.css
- i18n: next-intl with [locale] route segments, all text through translation keys
- State: Zustand stores for client state (checkout.ts, delivery.ts, browse.ts)
- Mock data: NEXT_PUBLIC_STRIPE_MOCK pattern — Supabase mock may follow similar pattern
- Snake_case fields: all data types use snake_case matching DB schema
- No Supabase connection in dev: project uses mock/stub data (per project memory)

### Integration Points
- `src/middleware.ts`: Currently handles i18n only — needs to be extended with Supabase auth session refresh
- `src/app/[locale]/checkout/success/page.tsx`: Renders DeliveryPage — add account conversion CTA here
- `src/components/delivery/delivery-page.tsx`: After QR/eSIM render — add "Create account to save your eSIM" prompt
- `src/components/layout/header.tsx` or equivalent: Add login button / user avatar dropdown
- `messages/en.json`: Add auth-related i18n keys (login, signup, reset, errors)
- `supabase/migrations/`: May need RLS policies for user data access

</code_context>

<specifics>
## Specific Ideas

- Guest-to-account conversion on the delivery page leverages the moment of highest motivation — user just received their eSIM and wants to keep it safe
- Password-only conversion (one field) because email is already captured from checkout — zero redundancy
- Auto-linking by email keeps it seamless — no "claim your order" friction
- Always-remember sessions match the mobile-first, young audience expectation — no one expects to re-login on their phone
- Branded reset email with Bambu stays consistent with the delivery email they already received

</specifics>

<deferred>
## Deferred Ideas

- Social login (Google, Apple) — v2 enhancement
- Magic link authentication — v2 alternative
- User profile page with settings — Phase 6
- eSIM management dashboard — Phase 6
- Order history page — Phase 6
- Account deletion/GDPR — Phase 9 or separate

</deferred>

---

*Phase: 05-user-accounts*
*Context gathered: 2026-04-23*
