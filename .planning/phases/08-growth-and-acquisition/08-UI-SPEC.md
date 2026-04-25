---
phase: 8
slug: growth-and-acquisition
status: draft
shadcn_initialized: false
preset: none
created: 2026-04-25
---

# Phase 8 — UI Design Contract

> Visual and interaction contract for Growth and Acquisition: referral program, WhatsApp support button, influencer coupon admin page.

---

## Design System

| Property | Value |
|----------|-------|
| Tool | none |
| Preset | not applicable |
| Component library | Custom primitives (Button, Card, Badge, Input) |
| Icon library | Lucide React |
| Font | Plus Jakarta Sans, Inter fallback |

---

## Spacing Scale

Declared values (must be multiples of 4):

| Token | Value | Usage |
|-------|-------|-------|
| xs | 4px | Icon gaps, inline padding |
| sm | 8px | Compact element spacing, badge padding |
| md | 16px | Default element spacing, card padding |
| lg | 24px | Section padding, form field gaps |
| xl | 32px | Layout gaps, page horizontal padding |
| 2xl | 48px | Major section breaks |
| 3xl | 64px | Page-level vertical spacing |

Exceptions: WhatsApp floating button uses 20px offset from bottom-right viewport edge (viewport edge offset, not a spacing token -- matches common floating action button inset convention). Touch target minimum 44px on all interactive elements (WCAG 2.5.5 minimum touch target size requirement).

---

## Typography

| Role | Size | Weight | Line Height |
|------|------|--------|-------------|
| Body | 16px (text-base) | 400 (normal) | 1.5 |
| Label / Caption | 14px (text-sm) | 400 (normal) | 1.5 |
| Heading | 20px (text-xl) | 700 (bold) | 1.2 |
| Display | 28px (text-2xl) | 700 (bold) | 1.2 |

Phase-specific notes:
- Referral stats numbers: 28px bold (display role)
- Admin table headers: 14px bold (700)
- Admin table body: 14px normal (400)
- Share button labels: 14px bold (700)

---

## Color

| Role | Value | Usage |
|------|-------|-------|
| Dominant (60%) | #FFFFFF (--color-background) | Page backgrounds, admin page background |
| Secondary (30%) | #F5F5F5 (--color-surface) | Referral stats cards, admin table rows (striped), input backgrounds |
| Accent (10%) | #2979FF (--color-accent) | Copy link button, share buttons, referral link text, admin "Create" button |
| Destructive | #E53935 (--color-destructive) | Deactivate coupon button, error states |
| Success | #43A047 (--color-success) | Active coupon badge, reward earned confirmation |
| Warning | #FB8C00 (--color-warning) | Monthly cap approaching indicator |
| WhatsApp Green | #25D366 | WhatsApp floating button background only |

Accent reserved for: Copy referral link button, share CTA buttons, referral link URL text, admin "Create Coupon" button, active tab indicator on admin stats.

---

## Component Inventory

### New Components

| Component | Location | Description |
|-----------|----------|-------------|
| WhatsAppButton | `src/components/layout/whatsapp-button.tsx` | Floating green circle, 56px diameter, bottom-right fixed. WhatsApp icon from Lucide (MessageCircle) or inline SVG of WhatsApp logo. Pulse animation on first visit via localStorage flag. Hides on scroll-down, shows on scroll-up (mobile only). z-index: 40 (below modals at 50). |
| ReferralPage | `src/app/[locale]/referral/page.tsx` | Full referral page with link display, copy button, share buttons, stats cards. Clean utility layout, no mascot. |
| ReferralLinkCard | `src/components/referral/referral-link-card.tsx` | Card showing referral URL with copy button and Web Share API trigger. URL displayed in mono font, truncated on mobile. |
| ReferralStats | `src/components/referral/referral-stats.tsx` | Three stat cards in a row: "Friends Invited" / "Free Plans Earned" / "Free Plans Remaining". Numbers in display size (28px bold). |
| ShareButtons | `src/components/referral/share-buttons.tsx` | Row of share buttons: Copy Link, WhatsApp, Instagram, Twitter/X. Each is an icon button with label below. Uses Web Share API as primary on mobile. |
| PostPurchaseShareCTA | `src/components/referral/post-purchase-share-cta.tsx` | Banner on success/delivery page: "Share with a friend -- you both get a free 1GB plan" with inline share buttons. Surface background, 16px padding. |
| AdminCouponsPage | `src/app/[locale]/admin/coupons/page.tsx` | Password-protected admin page. Table of influencer coupons with create/edit/deactivate. Stats per coupon. |
| CouponTable | `src/components/admin/coupon-table.tsx` | Responsive table: Code, Influencer Name, Profile URL, Total Uses, Revenue Generated, Last Used, Status, Actions. Sortable columns. |
| CouponCreateForm | `src/components/admin/coupon-create-form.tsx` | Modal or inline form: Code input, influencer name, social URL, notes textarea. Validates code uniqueness. |
| CouponStatsCard | `src/components/admin/coupon-stats-card.tsx` | Summary card at top of admin page: Total Active Coupons, Total Uses, Total Revenue. |

### Existing Components Reused

| Component | Modification |
|-----------|-------------|
| Button | No changes -- use primary variant for CTAs, secondary for share buttons, destructive for deactivate |
| Card | No changes -- use for referral stats and admin summary |
| Badge | No changes -- use for coupon status (active/inactive) |
| Input | No changes -- use in coupon create form |
| Header / user-menu | Add "Invite Friends" menu item linking to /referral |
| Bottom Nav | Coordinate WhatsApp button visibility (hide WhatsApp when bottom nav scroll-hides) |
| Delivery email template | Replace generic share link with personalized referral link for logged-in users |

---

## Interaction Contracts

### WhatsApp Floating Button

| State | Behavior |
|-------|----------|
| First visit | Subtle pulse animation (3 pulses over 2s, then static). Set localStorage `whatsapp_pulse_shown=true`. |
| Default (desktop) | Static green circle, bottom-right, always visible |
| Scroll down (mobile) | Fade out over 200ms, translateY(20px) |
| Scroll up (mobile) | Fade in over 200ms, translateY(0) |
| Tap/click | Opens `https://wa.me/{WHATSAPP_NUMBER}?text={encoded_message}` in new tab |
| Hover (desktop) | Scale to 1.05, box-shadow increase |

Context-aware pre-filled messages:
- Browse page: "Hi! I need help choosing an eSIM plan"
- Checkout page: "Hi! I need help with my checkout"
- Delivery/success page: "Hi! I need help with my order"
- Dashboard page: "Hi! I need help with my eSIM"
- All other pages: "Hi!"

### Referral Link Copy

| State | Behavior |
|-------|----------|
| Default | Blue accent "Copy Link" button with clipboard icon |
| Click | Copy to clipboard, button text changes to "Copied!" with checkmark icon, success green color, reverts after 2s |
| Error (clipboard API unavailable) | Show referral URL in a selectable input field as fallback |

### Share Buttons

| State | Behavior |
|-------|----------|
| Mobile (Web Share API available) | Single "Share" button triggers native share sheet with pre-written text |
| Mobile (no Web Share API) | Show individual WhatsApp/Twitter/Copy buttons |
| Desktop | Always show individual buttons: Copy, WhatsApp, Twitter/X |
| WhatsApp share | Opens `https://wa.me/?text={encoded_share_text}` |
| Twitter/X share | Opens `https://twitter.com/intent/tweet?text={encoded_share_text}` |

Share text: "Get a free 1GB eSIM for your next trip! Use my link: {referral_url}"

### Coupon Admin Table

| State | Behavior |
|-------|----------|
| Loading | Skeleton rows (3 rows, shimmer animation) |
| Empty | "No coupons yet" message with "Create First Coupon" button |
| Row hover | Background shifts to --color-surface |
| Deactivate click | Inline confirmation: row highlights destructive-soft, "Confirm deactivate?" with Confirm/Cancel buttons appear in actions column |
| Sort click | Column header toggles asc/desc, active sort column shows arrow indicator |

### Post-Purchase Share CTA

| State | Behavior |
|-------|----------|
| User logged in | Shows personalized share CTA with their referral link |
| User not logged in (guest) | Shows "Create account to start referring friends" with signup CTA |
| Dismissed | Hides with fade-out. Does not persist dismissal (shows again on next purchase). |

---

## Copywriting Contract

| Element | Copy |
|---------|------|
| Primary CTA (referral page) | "Copy Referral Link" |
| Share CTA (post-purchase) | "Share with a Friend" |
| Share subtitle | "You both get a free 1GB day pass" |
| Share text (pre-written) | "Get a free 1GB eSIM for your next trip! Use my link: {url}" |
| Empty state heading (referral, no account) | "Start Earning Free Data" |
| Empty state body (referral, no account) | "Create an account to get your referral link and earn free 1GB plans when friends sign up." |
| Empty state heading (admin, no coupons) | "No Coupons Yet" |
| Empty state body (admin, no coupons) | "Create your first influencer coupon code to start tracking performance." |
| Empty state CTA (admin) | "Create First Coupon" |
| Error state (referral link generation failed) | "Could not generate your referral link. Please try again or contact support." |
| Error state (coupon code already exists) | "This code is already taken. Choose a different code." |
| Error state (admin auth failed) | "You do not have admin access. Please log in with an admin account." |
| Destructive: deactivate coupon | "Deactivate Coupon": "This will prevent new uses of code {CODE}. Existing discounts already applied are not affected. Deactivate?" |
| Monthly cap reached | "You have reached your monthly limit of 5 free plans. Your limit resets on {date}." |
| Reward earned notification | "Your friend activated their eSIM! You earned a free 1GB day pass." |
| Stat label: friends invited | "Friends Invited" |
| Stat label: plans earned | "Free Plans Earned" |
| Stat label: plans remaining | "Free Plans Left This Month" |
| WhatsApp button aria-label | "Contact support on WhatsApp" |
| Account menu item | "Invite Friends" |

---

## Layout Specifications

### Referral Page (`/referral`)

```
+--------------------------------------------------+
|  Header (existing)                                |
+--------------------------------------------------+
|                                                    |
|  [h1] Invite Friends, Get Free Data     (20px bold)|
|  [subtitle] Share your link...          (16px)     |
|                                                    |
|  +----------------------------------------------+ |
|  | Your Referral Link                            | |
|  | esimpanda.com/r/ABC123     [Copy Link]        | |
|  +----------------------------------------------+ |
|                                                    |
|  [Share via]                                       |
|  [ WhatsApp ] [ Twitter/X ] [ Copy ]              |
|                                                    |
|  +------------+ +------------+ +------------+     |
|  | Friends    | | Free Plans | | Plans Left |     |
|  | Invited    | | Earned     | | This Month |     |
|  |    12      | |     3      | |     2      |     |
|  +------------+ +------------+ +------------+     |
|                                                    |
+--------------------------------------------------+
|  Bottom Nav (existing)                             |
+--------------------------------------------------+
```

Mobile: Stats cards stack to single column below 480px. Share buttons wrap to 2x2 grid.
Desktop: Max content width 640px, centered.

### Admin Coupons Page (`/admin/coupons`)

```
+--------------------------------------------------+
|  Header (existing, admin indicator)               |
+--------------------------------------------------+
|                                                    |
|  [h1] Influencer Coupons        [+ Create Coupon] |
|                                                    |
|  +--------+ +--------+ +--------+                |
|  | Active | | Total  | | Total  |                |
|  | Coupons| | Uses   | | Revenue|                |
|  |   8    | |  342   | | 4,280  |                |
|  +--------+ +--------+ +--------+                |
|                                                    |
|  +----------------------------------------------+ |
|  | Code  | Name   | Uses | Revenue | Status | . | |
|  |-------|--------|------|---------|--------|---| |
|  |MARIA10| Maria  | 45   | 580    | Active | . | |
|  |JOAO15 | Joao   | 128  | 1,640  | Active | . | |
|  +----------------------------------------------+ |
|                                                    |
+--------------------------------------------------+
```

Mobile: Table scrolls horizontally. Priority columns (Code, Name, Status, Actions) stay visible; Uses/Revenue accessible via scroll.
Desktop: Full table visible, max width 960px centered.

### WhatsApp Button Positioning

```
Position: fixed
Bottom: 20px (mobile: 80px when bottom nav visible)
Right: 20px
Width: 56px
Height: 56px
Border-radius: 50%
Background: #25D366
Box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15)
z-index: 40
```

---

## Motion / Animation

| Element | Animation | Duration | Easing |
|---------|-----------|----------|--------|
| WhatsApp button pulse (first visit) | scale 1.0 -> 1.15 -> 1.0, 3 cycles | 600ms per cycle | ease-in-out |
| WhatsApp button scroll hide (mobile) | opacity 1->0, translateY(0->20px) | 200ms | ease-out |
| WhatsApp button scroll show (mobile) | opacity 0->1, translateY(20px->0) | 200ms | ease-out |
| WhatsApp button hover (desktop) | scale 1.0 -> 1.05 | 150ms | ease-in-out |
| Copy button success state | Text crossfade "Copy" -> "Copied!" | 150ms | ease-in-out |
| Share CTA (post-purchase) entrance | opacity 0->1, translateY(8px->0) | 300ms | ease-out |
| Coupon table row deactivate | Background fade to destructive-soft | 200ms | ease-in-out |
| Stats cards (referral page) | Staggered fade-in, 100ms delay between cards | 300ms each | ease-out |

All animations use Framer Motion (motion/react) consistent with existing project patterns. WhatsApp button tap uses whileTap={{ scale: 0.95 }} matching Button component pattern.

---

## Responsive Breakpoints

| Breakpoint | Behavior |
|------------|----------|
| < 480px (mobile) | Referral stats stack vertically. Share buttons 2x2 grid. Admin table horizontal scroll. WhatsApp button bottom: 80px (above bottom nav). |
| 480-768px (tablet) | Referral stats in 3-column row. Share buttons inline row. Admin table full width with scroll. WhatsApp button bottom: 20px. |
| > 768px (desktop) | Referral page max-w 640px centered. Admin page max-w 960px centered. WhatsApp button bottom: 20px. No scroll-hide behavior on WhatsApp button. |

---

## Accessibility

| Requirement | Implementation |
|-------------|----------------|
| WhatsApp button | aria-label="Contact support on WhatsApp", role="link" |
| Copy button | aria-live="polite" region for "Copied!" feedback |
| Admin table | Proper `<table>` semantics with `<thead>`, `<th scope="col">`, `<tbody>` |
| Deactivate confirmation | Focus trap on confirmation buttons, Escape to cancel |
| Share buttons | Each button has descriptive aria-label: "Share via WhatsApp", "Share via Twitter" |
| Color contrast | All text meets WCAG 2.1 AA. White text on #25D366 (WhatsApp green) meets 3.17:1 -- use white WhatsApp icon (large, passes AA for large text at 24px icon size) |
| Referral stats | Use `<dl>` / `<dt>` / `<dd>` for stat label/value pairs |

---

## Registry Safety

| Registry | Blocks Used | Safety Gate |
|----------|-------------|-------------|
| shadcn official | none | not applicable |

No third-party registries used. All components are custom-built following existing project patterns.

---

## Checker Sign-Off

- [ ] Dimension 1 Copywriting: PASS
- [ ] Dimension 2 Visuals: PASS
- [ ] Dimension 3 Color: PASS
- [ ] Dimension 4 Typography: PASS
- [ ] Dimension 5 Spacing: PASS
- [ ] Dimension 6 Registry Safety: PASS

**Approval:** pending
