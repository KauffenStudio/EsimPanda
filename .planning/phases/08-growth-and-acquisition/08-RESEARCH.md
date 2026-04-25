# Phase 8: Growth and Acquisition - Research

**Researched:** 2026-04-25
**Domain:** Referral system, floating WhatsApp button, influencer coupon admin
**Confidence:** HIGH

## Summary

Phase 8 adds three growth features: (1) a referral program where both referrer and friend earn a free 1GB day pass, implemented via the existing coupon system with 100%-off single-use codes; (2) a floating WhatsApp support button on all pages with context-aware pre-filled messages; (3) a password-protected admin page for managing influencer coupon codes with stats.

The technical complexity is moderate. The referral system is the most complex piece -- it requires a new data layer (referral codes, attribution tracking, reward fulfillment), new pages (/referral, /r/CODE redirect), and integration into multiple existing surfaces (user menu, delivery email, post-purchase page). The WhatsApp button and influencer admin page are straightforward UI work. All three features reuse existing patterns (Zustand stores, Framer Motion, coupon validation, Supabase auth).

**Primary recommendation:** Build referral data layer first (store, API routes, mock data), then referral UI, then WhatsApp button (standalone), then influencer admin page. Referral reward delivery via 100%-off coupon codes reuses the existing coupon system -- no new payment infrastructure needed.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **Reward model:** Both referrer and referred friend get a free 1GB day pass
- **Delivery mechanism:** 100% off single-use coupon code -- referrer goes through normal checkout, picks any country, applies code, pays EUR 0. Reuses existing coupon system
- **Account required:** Referrer must have an account to get a referral link
- **Trigger:** Referrer earns reward after friend activates their eSIM (not on purchase alone)
- **Cap:** Max 5 free plans per month per referrer, resets monthly
- **Self-referral:** Blocked -- if referrer email matches buyer email, no reward awarded
- **Attribution window:** 7 days from referral link click
- **Link format:** `esimpanda.com/r/CODE` with short unique code per user
- **Access points:** Full `/referral` page + quick "Copy link" in account dropdown
- **Share methods:** Copy button + Web Share API + WhatsApp/Instagram/Twitter share buttons with pre-written deal-focused messages
- **Post-purchase CTA:** Share prompt on success/delivery page
- **Delivery email:** Personalized referral link for logged-in users
- **WhatsApp button:** Floating, bottom-right, green circle, all pages. Hides on scroll down (mobile), reappears on scroll up. Context-aware pre-filled messages. Pulse animation on first visit
- **Influencer coupons:** Admin page at `/admin/coupons`, admin auth required, fixed 10% discount, EUR 9.99 min order, no stacking, no expiry by default, unlimited uses per coupon. Fields: code, influencer name, social URL, notes. Detailed stats per coupon

### Claude's Discretion
- Admin page layout and table design
- Referral code generation algorithm (short unique strings)
- WhatsApp button z-index and scroll detection implementation
- Share button icons and styling
- Coupon stats chart/visualization approach
- Error states for referral edge cases
- Notification method when referrer earns a reward (email vs in-app vs both)

### Deferred Ideas (OUT OF SCOPE)
- Affiliate program with cash commission (ADV-04)
- Gamified referral tiers (Gold Panda, milestone badges)
- Admin dashboard for orders/revenue (ADV-01)
- Automated chatbot for WhatsApp (ADV-02)
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| GRW-01 | User can share referral link and earn credit when friends purchase | Referral data layer (codes, attribution, rewards), /referral page, /r/CODE redirect, share UX, post-purchase CTA, delivery email personalization, coupon-based reward fulfillment |
| GRW-04 | User can contact support via WhatsApp button | Floating WhatsApp button component in layout, scroll-aware visibility, context-aware pre-filled messages, localStorage pulse flag |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| zustand | 5.0.12 | Referral state management | Already used for all client stores in project |
| next-intl | 4.9.1 | i18n for all new strings | Already wired for 4 languages |
| motion (Framer Motion) | 12.38.0 | WhatsApp pulse, share button animations | Already used throughout project |
| lucide-react | 1.8.0 | Icons (Copy, Check, Share2, ExternalLink) | Already the project icon library |
| @supabase/supabase-js | 2.103.3 | Auth for admin role check, referral data persistence | Already used for auth |
| zod | 4.3.6 | Form/API input validation | Already used for schema validation |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| nanoid | 5.1.9 | Referral code generation (short, URL-safe) | Generating unique referral codes per user |
| sonner | 2.0.7 | Toast notifications for copy success, reward earned | Already in project, used for user feedback |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| nanoid | crypto.randomUUID().slice(0,8) | nanoid produces shorter, URL-safe strings with configurable alphabet; crypto.randomUUID is built-in but less compact |
| Custom admin auth | NextAuth / iron-session | Overkill -- project already has Supabase auth with user metadata for role checks |

**Installation:**
```bash
npm install nanoid
```

Only nanoid is new. Everything else is already in the project.

## Architecture Patterns

### Recommended Project Structure
```
src/
├── app/[locale]/
│   ├── referral/page.tsx           # Referral page (account required)
│   ├── r/[code]/route.ts           # Referral redirect handler (API route)
│   ├── admin/coupons/page.tsx      # Admin coupon management page
│   └── checkout/success/page.tsx   # Existing -- add PostPurchaseShareCTA
├── components/
│   ├── referral/
│   │   ├── referral-link-card.tsx   # Link display + copy button
│   │   ├── referral-stats.tsx       # Stats cards (invited, earned, remaining)
│   │   ├── share-buttons.tsx        # WhatsApp/Twitter/Copy share buttons
│   │   └── post-purchase-share-cta.tsx # CTA on success page
│   ├── admin/
│   │   ├── coupon-table.tsx         # Sortable coupon table
│   │   ├── coupon-create-form.tsx   # Create/edit coupon form
│   │   └── coupon-stats-card.tsx    # Summary stats at top
│   └── layout/
│       └── whatsapp-button.tsx      # Floating WhatsApp button
├── stores/
│   └── referral.ts                  # Referral state (code, stats, loading)
├── lib/
│   ├── referral/
│   │   ├── types.ts                 # Referral types (ReferralCode, ReferralStats, ReferralReward)
│   │   ├── mock.ts                  # Mock data for dev mode
│   │   └── actions.ts               # Server actions: generateCode, trackClick, checkReward
│   └── checkout/
│       └── coupons.ts               # Extended -- add influencer coupons, 100%-off referral coupons
└── app/api/
    ├── referral/
    │   ├── code/route.ts            # GET: get user's referral code, POST: generate new one
    │   ├── track/route.ts           # POST: track referral click (set cookie)
    │   └── reward/route.ts          # POST: check and fulfill referral reward
    └── admin/
        └── coupons/route.ts         # CRUD for influencer coupons (admin only)
```

### Pattern 1: Referral Attribution via Cookie
**What:** When someone clicks `/r/CODE`, redirect to homepage and set a `ref` cookie with the referral code and timestamp. At checkout, read the cookie and attach referral attribution to the order.
**When to use:** All referral link clicks.
**Example:**
```typescript
// src/app/r/[code]/route.ts
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  const url = new URL('/', request.url);
  const response = NextResponse.redirect(url);

  // Set referral cookie -- 7-day attribution window
  response.cookies.set('ref', code, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60, // 7 days
    path: '/',
  });

  return response;
}
```

### Pattern 2: Referral Reward as 100% Coupon
**What:** When referrer earns a reward, generate a single-use 100%-off coupon code and associate it with their account. They redeem it through normal checkout flow.
**When to use:** When a referred friend activates their eSIM (trigger event).
**Example:**
```typescript
// Reward coupon generation
interface ReferralRewardCoupon extends Coupon {
  type: 'referral_reward';
  referrer_user_id: string;
  single_use: true;
}

function generateRewardCoupon(referrerUserId: string): ReferralRewardCoupon {
  return {
    code: `REF-${nanoid(8).toUpperCase()}`,
    discount_percent: 100,
    min_order_cents: 0,
    max_uses: 1,
    current_uses: 0,
    valid_from: new Date().toISOString(),
    valid_until: null, // no expiry on earned rewards
    is_active: true,
    type: 'referral_reward',
    referrer_user_id: referrerUserId,
    single_use: true,
  };
}
```

### Pattern 3: Mock Mode for Development
**What:** All referral and admin features support `NEXT_PUBLIC_STRIPE_MOCK=true` for development without Supabase.
**When to use:** Development mode, following established project pattern.
**Example:**
```typescript
// src/lib/referral/mock.ts
export const mockReferralData = {
  code: 'ABC123',
  stats: {
    friends_invited: 3,
    free_plans_earned: 1,
    free_plans_remaining: 4,
    monthly_cap: 5,
  },
  rewards: [
    { code: 'REF-XK9M2N4P', redeemed: false, earned_at: '2026-04-20T10:00:00Z' },
  ],
};

export const mockInfluencerCoupons = [
  {
    code: 'MARIA10',
    influencer_name: 'Maria Silva',
    social_url: 'https://instagram.com/mariasilva',
    notes: 'Travel blogger, Portugal focus',
    discount_percent: 10,
    min_order_cents: 999,
    total_uses: 45,
    total_revenue_cents: 58000,
    last_used: '2026-04-24T15:30:00Z',
    is_active: true,
    created_at: '2026-03-01T00:00:00Z',
  },
];
```

### Pattern 4: Scroll-Aware Visibility (WhatsApp Button)
**What:** Track scroll direction using useEffect + scroll event listener. Show/hide button with Framer Motion animate.
**When to use:** WhatsApp floating button on mobile only.
**Example:**
```typescript
// Scroll direction detection pattern
function useScrollDirection() {
  const [visible, setVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const threshold = 10;
    function handleScroll() {
      const currentY = window.scrollY;
      if (Math.abs(currentY - lastScrollY.current) < threshold) return;
      setVisible(currentY < lastScrollY.current || currentY < 50);
      lastScrollY.current = currentY;
    }
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return visible;
}
```

### Pattern 5: Admin Role Check
**What:** Use Supabase user metadata `app_metadata.role === 'admin'` for admin access control. Check both client-side (redirect) and server-side (API routes).
**When to use:** Admin coupon page and admin API routes.
**Example:**
```typescript
// Server-side admin check in API route
import { createClient } from '@/lib/supabase/server';

async function isAdmin(): Promise<boolean> {
  if (process.env.NEXT_PUBLIC_STRIPE_MOCK === 'true') return true;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user?.app_metadata?.role === 'admin';
}
```

### Anti-Patterns to Avoid
- **Storing referral state in URL params:** Use httpOnly cookies for attribution -- URL params get stripped on redirect and are visible to the user
- **Checking reward eligibility on the client:** All reward logic (self-referral check, monthly cap, activation trigger) MUST run server-side to prevent gaming
- **Building a custom table component:** Use native HTML `<table>` with Tailwind styling -- no need for a data grid library for a simple admin table
- **Using window.open for WhatsApp:** Use `<a href="https://wa.me/...">` wrapped in a button component -- window.open gets blocked by popup blockers

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Short unique codes | Custom random string generator | nanoid with custom alphabet | Collision-resistant, URL-safe, configurable length |
| Clipboard API | Manual execCommand('copy') | navigator.clipboard.writeText() | Modern standard, better browser support, returns Promise |
| Native share sheet | Custom share modal | Web Share API (navigator.share) | Native UX on mobile, graceful fallback to individual buttons |
| Toast notifications | Custom notification system | sonner (already installed) | Already in project, consistent UX |
| Form validation | Manual field checks | zod schemas (already used) | Type-safe, consistent with project pattern |
| Scroll detection | IntersectionObserver for scroll direction | Simple scroll event with lastScrollY ref | IntersectionObserver is for element visibility, not scroll direction |

**Key insight:** The referral reward system cleverly reuses the existing coupon infrastructure. A "reward" is just a 100%-off single-use coupon generated server-side. No new payment logic, no credit balance system, no wallet. The checkout flow already handles coupon application and EUR 0 orders.

## Common Pitfalls

### Pitfall 1: Race Condition on Referral Reward Fulfillment
**What goes wrong:** Two concurrent eSIM activations from the same referrer could both trigger reward generation, exceeding the monthly cap.
**Why it happens:** Checking cap and inserting reward are separate operations without transaction isolation.
**How to avoid:** Use a Supabase RPC function or database transaction that atomically checks the monthly count and inserts the reward. In mock mode, use a simple in-memory counter.
**Warning signs:** Monthly cap exceeded for a user, duplicate reward coupons.

### Pitfall 2: Self-Referral via Different Email
**What goes wrong:** User creates referral link, opens in incognito, uses a different email to buy -- earns a free plan.
**Why it happens:** Self-referral check only compares emails, not browser fingerprints or IP.
**How to avoid:** Accept this as a known limitation for v1. The 5/month cap limits abuse. Document that IP-based detection is a v2 enhancement. Email matching is the primary guard.
**Warning signs:** Same user consistently redeeming referral rewards.

### Pitfall 3: WhatsApp Button Overlapping Bottom Nav
**What goes wrong:** On mobile, the floating WhatsApp button sits directly on top of the bottom navigation bar.
**Why it happens:** Both use `position: fixed` with `bottom` offsets.
**How to avoid:** WhatsApp button uses `bottom: 80px` on mobile (above the 64px bottom nav + 16px gap). On desktop (no bottom nav), uses `bottom: 20px`. The UI spec already addresses this.
**Warning signs:** Button visually overlaps navigation on small screens.

### Pitfall 4: Web Share API Availability
**What goes wrong:** Web Share API call fails silently or throws on desktop browsers / older mobile browsers.
**Why it happens:** Web Share API is not universally available. Chrome desktop does not support it. Firefox does not support it.
**How to avoid:** Always feature-detect with `if (navigator.share)`. Show individual share buttons as fallback. Never rely solely on Web Share API.
**Warning signs:** Share button does nothing on desktop.

### Pitfall 5: Cookie Not Set on Redirect
**What goes wrong:** Referral attribution cookie is not present when user completes checkout.
**Why it happens:** Some browsers strip cookies on cross-origin redirects. SameSite=Lax means cookie is sent on top-level navigation but not on POST requests from third-party origins.
**How to avoid:** Use SameSite=Lax (not Strict), set cookie on the redirect response from the same domain. The `/r/CODE` route is same-origin, so this should work. Read cookie server-side in the checkout API route.
**Warning signs:** Referral clicks tracked but no attributions recorded.

### Pitfall 6: Influencer Coupon Code Conflicts with Existing Codes
**What goes wrong:** Admin creates influencer coupon with code "STUDENT15" which already exists as the student discount.
**Why it happens:** No uniqueness check across coupon types.
**How to avoid:** Validate new coupon codes against ALL existing codes (student, referral, influencer) before creation. Return clear error message.
**Warning signs:** Wrong discount applied at checkout.

## Code Examples

### Referral Store (Zustand Pattern)
```typescript
// src/stores/referral.ts
import { create } from 'zustand';

interface ReferralState {
  code: string | null;
  stats: {
    friends_invited: number;
    free_plans_earned: number;
    free_plans_remaining: number;
  } | null;
  rewards: Array<{
    code: string;
    redeemed: boolean;
    earned_at: string;
  }>;
  loading: boolean;
  fetchReferralData: () => Promise<void>;
  copyLink: () => Promise<boolean>;
}

export const useReferralStore = create<ReferralState>((set, get) => ({
  code: null,
  stats: null,
  rewards: [],
  loading: true,

  fetchReferralData: async () => {
    if (process.env.NEXT_PUBLIC_STRIPE_MOCK === 'true') {
      // Use mock data
      set({
        code: 'ABC123',
        stats: { friends_invited: 3, free_plans_earned: 1, free_plans_remaining: 4 },
        rewards: [],
        loading: false,
      });
      return;
    }
    // Fetch from API
    const res = await fetch('/api/referral/code');
    const data = await res.json();
    set({ code: data.code, stats: data.stats, rewards: data.rewards, loading: false });
  },

  copyLink: async () => {
    const { code } = get();
    if (!code) return false;
    const url = `${window.location.origin}/r/${code}`;
    try {
      await navigator.clipboard.writeText(url);
      return true;
    } catch {
      return false;
    }
  },
}));
```

### WhatsApp Button Component
```typescript
// src/components/layout/whatsapp-button.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { usePathname } from 'next/navigation';

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '';

function getContextMessage(pathname: string): string {
  if (pathname.includes('/browse')) return 'Hi! I need help choosing an eSIM plan';
  if (pathname.includes('/checkout')) return 'Hi! I need help with my checkout';
  if (pathname.includes('/delivery') || pathname.includes('/success'))
    return 'Hi! I need help with my order';
  if (pathname.includes('/dashboard')) return 'Hi! I need help with my eSIM';
  return 'Hi!';
}

export function WhatsAppButton() {
  // ... scroll direction, first-visit pulse, render
}
```

### Extending Coupon System for Influencers
```typescript
// Extended Coupon type
interface InfluencerCoupon extends Coupon {
  type: 'influencer';
  influencer_name: string;
  social_url: string;
  notes: string;
  total_uses: number;
  total_revenue_cents: number;
  last_used: string | null;
  created_at: string;
}

// Validation: single coupon per order (no stacking)
// Already handled by existing checkout flow -- only one coupon_code field
```

### Referral Redirect Route
```typescript
// src/app/r/[code]/route.ts
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  // Redirect to homepage with locale
  const url = new URL('/en', request.url);
  const response = NextResponse.redirect(url);

  response.cookies.set('ref', code, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60,
    path: '/',
  });

  return response;
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Credit/wallet systems for referrals | Coupon-based rewards (simpler, no balance tracking) | Current best practice for small platforms | Eliminates need for wallet/payout infrastructure |
| Custom share modals | Web Share API + fallback buttons | 2023+ | Native UX on supported devices, reduces code |
| Server-rendered admin tables | Client-side sortable tables with API data | Standard | Simpler for small datasets like coupon lists |
| WhatsApp web widget (third-party) | Direct wa.me link in floating button | Standard | Zero dependency, faster, no third-party script loading |

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | vitest 3.x with jsdom |
| Config file | vitest.config.ts |
| Quick run command | `npx vitest run --reporter=verbose` |
| Full suite command | `npx vitest run` |

### Phase Requirements to Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| GRW-01a | Referral code generation returns unique short code | unit | `npx vitest run src/lib/referral/__tests__/actions.test.ts -t "generate"` | Wave 0 |
| GRW-01b | Referral attribution cookie set on /r/CODE visit | unit | `npx vitest run src/app/r/__tests__/redirect.test.ts` | Wave 0 |
| GRW-01c | Self-referral blocked (same email) | unit | `npx vitest run src/lib/referral/__tests__/actions.test.ts -t "self-referral"` | Wave 0 |
| GRW-01d | Monthly cap enforced (max 5) | unit | `npx vitest run src/lib/referral/__tests__/actions.test.ts -t "cap"` | Wave 0 |
| GRW-01e | Referral reward coupon is 100% off, single use | unit | `npx vitest run src/lib/referral/__tests__/actions.test.ts -t "reward coupon"` | Wave 0 |
| GRW-01f | validateCoupon works for influencer coupons | unit | `npx vitest run src/lib/checkout/__tests__/coupons.test.ts` | Wave 0 |
| GRW-04a | WhatsApp URL built correctly with context message | unit | `npx vitest run src/components/layout/__tests__/whatsapp-button.test.tsx` | Wave 0 |

### Sampling Rate
- **Per task commit:** `npx vitest run --reporter=verbose`
- **Per wave merge:** `npx vitest run`
- **Phase gate:** Full suite green before /gsd:verify-work

### Wave 0 Gaps
- [ ] `src/lib/referral/__tests__/actions.test.ts` -- covers GRW-01a, GRW-01c, GRW-01d, GRW-01e
- [ ] `src/app/r/__tests__/redirect.test.ts` -- covers GRW-01b
- [ ] `src/lib/checkout/__tests__/coupons.test.ts` -- covers GRW-01f (extend existing)
- [ ] `src/components/layout/__tests__/whatsapp-button.test.tsx` -- covers GRW-04a

## Open Questions

1. **Referral reward notification method**
   - What we know: User context says Claude's discretion. Options: email notification, in-app toast on next login, or both.
   - Recommendation: Email notification via Resend (already in stack) -- user may not visit the site for days after friend activates. Toast on next login as supplementary.

2. **Referral data persistence in mock mode**
   - What we know: Project uses in-memory Maps for dev mode (e.g., Phase 4 provisioning state). No Supabase in dev.
   - Recommendation: Use in-memory Map for referral data in mock mode, consistent with existing patterns. Data resets on server restart (acceptable for dev).

3. **Influencer coupon storage**
   - What we know: Current coupons are hardcoded in `COUPONS` array. Influencer coupons need CRUD (admin creates/deactivates).
   - Recommendation: In mock mode, use in-memory array initialized from mock data. In production, Supabase table `influencer_coupons`. The `validateCoupon` function should check both the static COUPONS array and the dynamic influencer coupons source.

4. **Referral code format**
   - What we know: Must be short, URL-safe, unique per user. User gets one permanent code.
   - Recommendation: nanoid with uppercase alphanumeric alphabet, 6 characters (e.g., `A3KM9X`). 36^6 = 2.18 billion combinations -- more than enough. Generate once per user, store permanently.

## Sources

### Primary (HIGH confidence)
- Project codebase direct inspection: coupon system (`src/lib/checkout/coupons.ts`), auth store (`src/stores/auth.ts`), layout (`src/app/[locale]/layout.tsx`), middleware (`src/middleware.ts`), user menu (`src/components/auth/user-menu.tsx`), delivery email template
- Phase 8 CONTEXT.md and UI-SPEC.md -- locked decisions and design contract
- Web Share API: standard browser API, feature-detected with `navigator.share`
- WhatsApp deep linking: `https://wa.me/{number}?text={encoded}` -- standard format

### Secondary (MEDIUM confidence)
- nanoid npm registry: version 5.1.9, verified via `npm view`
- Supabase app_metadata for role-based access -- standard Supabase pattern

### Tertiary (LOW confidence)
- None -- all findings verified against codebase or official APIs

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- all libraries already in project except nanoid (verified on npm)
- Architecture: HIGH -- follows established project patterns (stores, API routes, mock mode)
- Pitfalls: HIGH -- derived from direct codebase analysis and standard web development knowledge

**Research date:** 2026-04-25
**Valid until:** 2026-05-25 (stable domain, no fast-moving dependencies)
