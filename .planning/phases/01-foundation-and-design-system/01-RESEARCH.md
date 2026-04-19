# Phase 1: Foundation and Design System - Research

**Researched:** 2026-04-19
**Domain:** Next.js 15 project setup, Supabase schema, CELITECH provider abstraction, i18n, Tailwind + Motion design system
**Confidence:** HIGH

## Summary

Phase 1 is a greenfield setup phase that establishes the entire project skeleton: Next.js 15 App Router with Tailwind CSS v4, Supabase database with migration-managed schema, a CELITECH wholesale provider abstraction layer with catalog sync, next-intl for i18n wiring, and the eSIM Panda design system featuring Bambu the animated panda mascot with Motion (formerly Framer Motion) micro-interactions.

The key technical finding is that Framer Motion has been renamed to **Motion** (package: `motion`, import: `motion/react`) as of mid-2025. The API is identical -- it is a find-and-replace migration. The CELITECH SDK (`celitech-sdk` v1.3.63) provides a TypeScript SDK with OAuth2 client credentials, and the purchase response returns a base64-encoded QR PNG plus manual activation codes and platform-specific activation links. No webhook support was found in CELITECH docs -- usage monitoring will require polling.

**Primary recommendation:** Use `motion` (not `framer-motion`), Tailwind CSS v4 with CSS-first config, next-intl with `[locale]` route segment from day one, and the `celitech-sdk` npm package for the provider adapter. Supabase migrations via CLI for schema version control.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **Brand:** eSIM Panda, domain esimpanda.co
- **Mascot:** Bambu -- flat illustration 2D panda (Duolingo-style, SVG animated with multiple poses/expressions)
- **Colors:** Black (#000000) / White (#FFFFFF) + Electric Blue (#2979FF) accent; dark mode background #111111
- **Typography:** Geometric modern (Inter or Plus Jakarta Sans)
- **Component style:** Border radius 8-12px, subtle shadows, clean spacing
- **Bambu poses:** Success (happy dance), Error (apologetic sweat drop), Browse (binoculars), Loading (eating bamboo), Empty (curious inviting), QR delivery (celebrates), Setup guide (walks alongside)
- **Animations:** Smooth UI (ease-in-out) + Playful Bambu (spring physics), slide/morph page transitions, parallax + reveal on scroll on landing page
- **Loading states:** Bambu eating bamboo animation -- NOT skeleton screens or spinners
- **Navigation:** Mobile = bottom tab bar (Home, Destinations, My eSIMs, Profile) + header with logo; dark mode = manual toggle only
- **Routes:** `/` (landing), `/browse` (destinations), `/dashboard` (eSIM management)
- **Provider:** CELITECH first, single provider, abstraction layer for future swapping
- **i18n:** Wire from start with next-intl, EN only in Phase 1
- **No deferred ideas** -- discussion stayed in scope

### Claude's Discretion
- Exact font choice within geometric modern family
- Desktop navigation pattern (sidebar vs top nav)
- Dark mode color palette details
- Database schema design
- Catalog sync scheduling strategy (cron interval)
- Supabase RLS policies structure
- Loading animation specifics for Bambu (exact poses/keyframes)

### Deferred Ideas (OUT OF SCOPE)
None
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| INF-01 | Wholesale provider abstraction layer (swap providers without rewriting business logic) | CELITECH SDK researched, TypeScript interface pattern documented, adapter pattern with normalized types |
| INF-02 | Catalog sync from wholesale API on schedule (never call wholesale API on page load) | Vercel cron jobs config researched, CELITECH destinations/packages endpoints confirmed, sync-to-DB pattern documented |
| INF-06 | i18n framework wired from the start (even if translations come later) | next-intl v4.9.1 setup with App Router researched, `[locale]` segment pattern, middleware config documented |
| UXD-01 | App has premium animations and micro-interactions (Motion) | Motion v12.38.0 (formerly Framer Motion) researched, AnimatePresence page transitions, spring physics for Bambu, CSS-first Tailwind v4 |
</phase_requirements>

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js | 16.2.4 (latest) / 15.x (App Router) | Full-stack framework | SSR for SEO, API routes for backend, App Router for layouts. Note: v16 is latest on npm but project spec says 15.x -- use `next@15` to pin |
| TypeScript | 5.x | Type safety | Non-negotiable for provider abstraction types |
| React | 19.x | UI library | Ships with Next.js 15 |
| Tailwind CSS | 4.2.2 | Utility-first CSS | CSS-first config (v4), automatic content detection, smaller bundles |
| Motion | 12.38.0 | Animations & gestures | Renamed from framer-motion in mid-2025. Import from `motion/react`. Same API. Spring physics, AnimatePresence, layout animations |
| next-intl | 4.9.1 | Internationalization | App Router native, server + client component support, `[locale]` routing |
| @supabase/supabase-js | 2.103.3 | Database client | PostgreSQL with auth, RLS, real-time |
| @supabase/ssr | 0.10.2 | Supabase SSR helpers | Cookie-based auth for Next.js server components |
| celitech-sdk | 1.3.63 | CELITECH API client | Official TypeScript SDK, handles OAuth2 auth |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Zustand | 5.0.12 | Client state | Theme toggle, mobile nav state, UI state |
| Zod | 4.3.6 | Schema validation | Validate CELITECH API responses, form inputs |
| Lucide React | 1.8.0 | Icons | Tree-shakeable icon set for nav, UI |
| Sonner | 2.0.7 | Toast notifications | Success/error feedback |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Motion (v12) | framer-motion (v11) | framer-motion still works but is no longer actively developed. Use `motion` for new projects |
| next-intl | next-i18next | next-i18next is Pages Router focused; next-intl is App Router native |
| Tailwind v4 | Tailwind v3 | v3 uses JS config, v4 uses CSS-first `@theme`. v4 is recommended for new projects |
| celitech-sdk | Raw fetch calls | SDK handles OAuth2 token management automatically. Use the SDK. |

**Installation:**
```bash
# Create Next.js project (pins to v15)
npx create-next-app@15 esim-panda --typescript --tailwind --eslint --app --src-dir

# Animation & Design
npm install motion lucide-react sonner

# i18n
npm install next-intl

# Database
npm install @supabase/supabase-js @supabase/ssr

# Wholesale Provider
npm install celitech-sdk

# State & Validation
npm install zustand zod

# Dev dependencies
npm install -D vitest @playwright/test
```

**Version verification (2026-04-19):**
- next: 16.2.4 (latest), use `next@15` to pin to v15.x
- motion: 12.38.0
- next-intl: 4.9.1
- tailwindcss: 4.2.2
- @supabase/supabase-js: 2.103.3
- celitech-sdk: 1.3.63
- zustand: 5.0.12
- zod: 4.3.6

## Architecture Patterns

### Recommended Project Structure
```
src/
├── app/
│   ├── [locale]/
│   │   ├── layout.tsx          # Root layout with providers, nav, theme
│   │   ├── page.tsx            # Landing page (/)
│   │   ├── browse/
│   │   │   └── page.tsx        # Destination browsing
│   │   └── dashboard/
│   │       └── page.tsx        # eSIM management
│   └── api/
│       └── cron/
│           └── sync-catalog/
│               └── route.ts    # Vercel cron: catalog sync
├── components/
│   ├── ui/                     # Design system primitives
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   └── ...
│   ├── bambu/                  # Bambu mascot components
│   │   ├── bambu-loading.tsx   # Eating bamboo animation
│   │   ├── bambu-success.tsx   # Happy dance
│   │   ├── bambu-error.tsx     # Apologetic expression
│   │   └── bambu-base.tsx      # Base SVG with pose system
│   ├── layout/                 # Navigation, header, footer
│   │   ├── bottom-nav.tsx      # Mobile bottom tab bar
│   │   ├── header.tsx          # Logo + nav
│   │   └── page-transition.tsx # AnimatePresence wrapper
│   └── shared/                 # Shared composite components
├── lib/
│   ├── esim/
│   │   ├── types.ts            # Normalized provider types
│   │   ├── provider.ts         # Provider interface (abstraction)
│   │   ├── celitech-adapter.ts # CELITECH implementation
│   │   └── sync.ts             # Catalog sync logic
│   ├── supabase/
│   │   ├── client.ts           # Browser client
│   │   ├── server.ts           # Server client
│   │   └── middleware.ts       # Auth middleware helper
│   └── utils/                  # Shared utilities
├── i18n/
│   ├── request.ts              # next-intl request config
│   └── routing.ts              # Locale routing config
├── messages/
│   └── en.json                 # English translations
├── styles/
│   └── globals.css             # Tailwind imports + @theme config
├── stores/
│   └── theme.ts                # Dark mode toggle store (Zustand)
└── types/
    └── index.ts                # Shared TypeScript types
supabase/
├── migrations/
│   └── 00001_initial_schema.sql  # Core tables
└── seed.sql                      # Dev seed data
```

### Pattern 1: Provider Abstraction Layer (INF-01)
**What:** TypeScript interface that normalizes wholesale eSIM API calls behind a common contract
**When to use:** All interactions with CELITECH (or future providers)

```typescript
// src/lib/esim/types.ts
export interface NormalizedDestination {
  name: string;
  iso: string;
  region: string;
}

export interface NormalizedPackage {
  id: string;                    // Internal ID
  wholesaleId: string;           // Provider's package ID
  destination: string;           // ISO code
  dataGB: number;
  durationDays: number;
  wholesalePriceCents: number;   // Always store cents
  currency: string;
}

export interface NormalizedPurchase {
  iccid: string;
  activationQrBase64: string;    // Base64 PNG from CELITECH
  manualActivationCode: string;
  iosActivationLink?: string;
  androidActivationLink?: string;
  status: 'pending' | 'active' | 'expired';
}

// src/lib/esim/provider.ts
export interface ESIMProvider {
  listDestinations(): Promise<NormalizedDestination[]>;
  listPackages(destinationIso: string): Promise<NormalizedPackage[]>;
  purchase(packageId: string, quantity: number): Promise<NormalizedPurchase>;
  getStatus(iccid: string): Promise<NormalizedPurchase>;
  topUp(iccid: string, packageId: string): Promise<NormalizedPurchase>;
}
```

### Pattern 2: CELITECH Adapter
**What:** Concrete implementation wrapping `celitech-sdk`
**When to use:** Single adapter for Phase 1

```typescript
// src/lib/esim/celitech-adapter.ts
import { Celitech } from 'celitech-sdk';
import type { ESIMProvider, NormalizedDestination } from './types';

export class CelitechAdapter implements ESIMProvider {
  private client: Celitech;

  constructor() {
    this.client = new Celitech({
      clientId: process.env.CELITECH_CLIENT_ID!,
      clientSecret: process.env.CELITECH_CLIENT_SECRET!,
    });
  }

  async listDestinations(): Promise<NormalizedDestination[]> {
    const response = await this.client.destinations.list();
    return response.destinations.map(d => ({
      name: d.name,
      iso: d.isoCode,
      region: d.region ?? 'unknown',
    }));
  }

  // ... other methods following same normalize pattern
}
```

### Pattern 3: Catalog Sync via Vercel Cron (INF-02)
**What:** Scheduled job that pulls CELITECH catalog into Supabase
**When to use:** Never call wholesale API on page load

```typescript
// src/app/api/cron/sync-catalog/route.ts
import { NextResponse } from 'next/server';
import { createProvider } from '@/lib/esim/provider';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  // Verify Vercel cron secret
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const provider = createProvider();
  const supabase = await createClient();

  const destinations = await provider.listDestinations();
  // Upsert destinations and packages into Supabase...

  return NextResponse.json({ synced: destinations.length });
}
```

```json
// vercel.json
{
  "crons": [
    {
      "path": "/api/cron/sync-catalog",
      "schedule": "0 */6 * * *"
    }
  ]
}
```

### Pattern 4: next-intl Setup (INF-06)
**What:** i18n wiring with `[locale]` route segment from day one
**When to use:** All user-facing strings

```typescript
// src/i18n/routing.ts
import { defineRouting } from 'next-intl/routing';
export const routing = defineRouting({
  locales: ['en'],
  defaultLocale: 'en',
});

// src/i18n/request.ts
import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';
export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;
  if (!locale || !routing.locales.includes(locale as any)) {
    locale = routing.defaultLocale;
  }
  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});

// next.config.ts
import createNextIntlPlugin from 'next-intl/plugin';
const withNextIntl = createNextIntlPlugin();
export default withNextIntl({});
```

### Pattern 5: Motion Page Transitions (UXD-01)
**What:** Slide/morph transitions between routes using AnimatePresence
**When to use:** All page navigations for native-app feel

```typescript
// src/components/layout/page-transition.tsx
'use client';
import { motion } from 'motion/react';
import { usePathname } from 'next/navigation';

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <motion.div
      key={pathname}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
    >
      {children}
    </motion.div>
  );
}
```

### Pattern 6: Bambu Pose System
**What:** SVG-based mascot with multiple animated poses driven by Motion spring physics
**When to use:** Loading states, success/error feedback, empty states

```typescript
// src/components/bambu/bambu-base.tsx
'use client';
import { motion } from 'motion/react';

type BambuPose = 'idle' | 'loading' | 'success' | 'error' | 'browse' | 'empty';

interface BambuProps {
  pose: BambuPose;
  size?: number;
}

export function Bambu({ pose, size = 120 }: BambuProps) {
  // Spring physics for Bambu (playful, bouncy)
  const springTransition = {
    type: 'spring' as const,
    stiffness: 300,
    damping: 15,
  };

  return (
    <motion.div
      animate={poseVariants[pose]}
      transition={springTransition}
      style={{ width: size, height: size }}
    >
      {/* SVG content switches based on pose */}
    </motion.div>
  );
}
```

### Anti-Patterns to Avoid
- **Importing from `framer-motion`:** Use `motion/react` -- framer-motion is deprecated
- **Tailwind v3 config style:** Do NOT create `tailwind.config.js` -- Tailwind v4 uses CSS-first `@theme` in globals.css
- **Hardcoded strings in JSX:** Every user-facing string must go through `useTranslations()` or `getTranslations()` even if EN-only
- **Calling CELITECH API from components:** All provider calls go through the abstraction layer, never direct SDK usage in components
- **Storing provider-specific types in components:** Components use normalized types only

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| OAuth2 token management for CELITECH | Custom token refresh logic | `celitech-sdk` (handles automatically) | Token expiry, refresh races, error handling |
| i18n message loading | Custom JSON loader + context | `next-intl` with `getRequestConfig` | SSR/client hydration, pluralization, rich text |
| SVG animation orchestration | CSS keyframes or manual JS | Motion spring/variants system | Coordinated multi-element animations, spring physics |
| Dark mode state + CSS variables | Manual localStorage + CSS | Zustand store + Tailwind `dark:` classes | SSR flash prevention, system preference detection |
| Database migrations | Manual SQL execution | Supabase CLI `supabase migration` | Version control, rollback, team sync |
| Cron job auth verification | Custom auth middleware | Vercel CRON_SECRET env var | Built-in, auto-injected Authorization header |

## Common Pitfalls

### Pitfall 1: Using `framer-motion` Instead of `motion`
**What goes wrong:** Installing the deprecated `framer-motion` package instead of the current `motion` package
**Why it happens:** Most tutorials and blog posts still reference `framer-motion`
**How to avoid:** Install `motion`, import from `motion/react`. The API is identical.
**Warning signs:** Import autocomplete suggesting `framer-motion`

### Pitfall 2: Tailwind v4 Config Confusion
**What goes wrong:** Creating `tailwind.config.js` or `tailwind.config.ts` which is v3 pattern
**Why it happens:** Most existing tutorials show v3 config
**How to avoid:** Tailwind v4 uses CSS-first configuration via `@theme` directive in globals.css. No JS config file needed. Content detection is automatic.
**Warning signs:** Presence of a `tailwind.config.*` file in the project

### Pitfall 3: next-intl Missing Middleware
**What goes wrong:** i18n routing breaks, locale not detected, translations fail to load
**Why it happens:** Forgetting to set up the next-intl middleware for locale detection
**How to avoid:** Create `middleware.ts` at project root with `createMiddleware` from `next-intl/middleware`
**Warning signs:** `useTranslations()` returning key names instead of translated strings

### Pitfall 4: AnimatePresence Without Unique Keys
**What goes wrong:** Exit animations don't play, components just disappear
**Why it happens:** Motion's AnimatePresence needs unique keys on direct children to track mount/unmount
**How to avoid:** Use `pathname` as key for page transition wrapper
**Warning signs:** Components mount without enter animation

### Pitfall 5: Calling CELITECH API on Page Load
**What goes wrong:** Slow pages, API rate limits hit, single point of failure for browsing
**Why it happens:** Developers fetch "fresh" data per request
**How to avoid:** Sync catalog to Supabase via cron job. Serve from your own DB. Never call wholesale API from page renders.
**Warning signs:** API calls in `page.tsx` or component `useEffect`

### Pitfall 6: Supabase Client in Wrong Context
**What goes wrong:** Auth cookies not sent, RLS fails silently returning empty results
**Why it happens:** Using browser client in server components or vice versa
**How to avoid:** Use `@supabase/ssr` -- separate `createClient` functions for browser vs server vs middleware
**Warning signs:** Queries returning empty when data exists in DB

### Pitfall 7: Next.js 15/16 `create-next-app` Version
**What goes wrong:** Getting Next.js 16 instead of 15 because `npx create-next-app@latest` pulls the latest
**Why it happens:** Next.js 16 is now latest on npm (16.2.4)
**How to avoid:** Pin explicitly: `npx create-next-app@15`
**Warning signs:** `package.json` showing `next: "^16.x"`

## Code Examples

### Tailwind v4 Theme Configuration
```css
/* src/styles/globals.css */
@import 'tailwindcss';

@theme {
  /* eSIM Panda brand colors */
  --color-primary: #000000;
  --color-accent: #2979FF;
  --color-background: #FFFFFF;
  --color-background-dark: #111111;
  --color-gray-100: #F5F5F5;
  --color-gray-200: #E5E5E5;
  --color-gray-400: #9E9E9E;
  --color-gray-600: #616161;
  --color-gray-800: #212121;

  /* Typography */
  --font-sans: 'Plus Jakarta Sans', 'Inter', system-ui, sans-serif;

  /* Spacing / Radius */
  --radius-card: 10px;
  --radius-button: 8px;
  --radius-input: 8px;

  /* Shadows */
  --shadow-card: 0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.06);
  --shadow-card-hover: 0 4px 12px rgba(0, 0, 0, 0.1);
}
```

### Database Schema (Core Tables for Phase 1)
```sql
-- supabase/migrations/00001_initial_schema.sql

-- Destinations synced from CELITECH
CREATE TABLE destinations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  iso_code TEXT NOT NULL UNIQUE,
  region TEXT,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  synced_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Plans/packages synced from CELITECH
CREATE TABLE plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  destination_id UUID REFERENCES destinations(id) ON DELETE CASCADE,
  wholesale_plan_id TEXT NOT NULL,          -- CELITECH's package ID
  provider TEXT NOT NULL DEFAULT 'celitech', -- For future multi-provider
  name TEXT NOT NULL,
  data_gb NUMERIC NOT NULL,
  duration_days INTEGER NOT NULL,
  wholesale_price_cents INTEGER NOT NULL,
  retail_price_cents INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  is_active BOOLEAN DEFAULT true,
  synced_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(wholesale_plan_id, provider)
);

-- User profiles extending Supabase Auth
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  referral_code TEXT UNIQUE,
  referral_credits_cents INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Orders (guest + authenticated)
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),    -- NULL for guest checkout
  email TEXT NOT NULL,
  plan_id UUID REFERENCES plans(id),
  stripe_session_id TEXT UNIQUE,
  stripe_payment_intent_id TEXT,
  amount_paid_cents INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  coupon_code TEXT,
  discount_cents INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'payment_confirmed', 'provisioning',
                      'provisioned', 'delivered', 'active', 'expired',
                      'provision_failed', 'refund_initiated', 'refunded')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- eSIMs provisioned from wholesale
CREATE TABLE esims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  iccid TEXT UNIQUE,
  wholesale_esim_id TEXT,
  activation_code_encrypted TEXT,           -- Encrypted base64 QR data
  manual_activation_code TEXT,
  smdp_address TEXT,
  ios_activation_link TEXT,
  android_activation_link TEXT,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'active', 'expired', 'deactivated')),
  data_total_gb NUMERIC,
  data_used_gb NUMERIC DEFAULT 0,
  activated_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  last_usage_check TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for common queries
CREATE INDEX idx_destinations_iso ON destinations(iso_code);
CREATE INDEX idx_destinations_slug ON destinations(slug);
CREATE INDEX idx_plans_destination ON plans(destination_id);
CREATE INDEX idx_plans_active ON plans(is_active) WHERE is_active = true;
CREATE INDEX idx_orders_email ON orders(email);
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_esims_iccid ON esims(iccid);
CREATE INDEX idx_esims_order ON esims(order_id);

-- Enable RLS on all tables
ALTER TABLE destinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE esims ENABLE ROW LEVEL SECURITY;

-- Public read access for catalog (destinations + plans)
CREATE POLICY "Public can read active destinations"
  ON destinations FOR SELECT
  USING (is_active = true);

CREATE POLICY "Public can read active plans"
  ON plans FOR SELECT
  USING (is_active = true);

-- Profile access (own data only)
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Service role needed for writes to catalog tables (cron sync)
-- Orders and eSIMs policies will be refined in later phases
```

### Supabase Client Setup
```typescript
// src/lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}

// src/lib/supabase/server.ts
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        },
      },
    },
  );
}
```

### Bottom Navigation Component
```typescript
// src/components/layout/bottom-nav.tsx
'use client';
import { motion } from 'motion/react';
import { Home, Globe, Smartphone, User } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { Link } from 'next-intl';

const tabs = [
  { href: '/', icon: Home, label: 'nav.home' },
  { href: '/browse', icon: Globe, label: 'nav.destinations' },
  { href: '/dashboard', icon: Smartphone, label: 'nav.esims' },
  { href: '/profile', icon: User, label: 'nav.profile' },
];

export function BottomNav() {
  const pathname = usePathname();
  // ... render tab bar with motion.div for active indicator
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `framer-motion` package | `motion` package, import `motion/react` | Mid-2025 | Must use new package name |
| Tailwind v3 JS config | Tailwind v4 CSS-first `@theme` | Early 2025 | No tailwind.config.js needed |
| `next-i18next` | `next-intl` for App Router | 2024 | Different setup, better DX |
| `@supabase/auth-helpers-nextjs` | `@supabase/ssr` | Late 2024 | New cookie-based auth pattern |
| Next.js 14 | Next.js 15 (pinned) / 16 (latest) | 2025 | Pin to 15 per project spec |

**Deprecated/outdated:**
- `framer-motion`: Renamed to `motion`, no longer actively developed under old name
- `tailwind.config.js`: v4 uses CSS-first configuration
- `@supabase/auth-helpers-nextjs`: Replaced by `@supabase/ssr`
- `@next/font`: Built into Next.js as `next/font` since Next.js 13.2

## Open Questions

1. **CELITECH Sandbox vs Production URLs**
   - What we know: SDK uses client_id/client_secret, docs show a dashboard for credentials
   - What's unclear: Whether there are separate sandbox endpoints or if sandbox is controlled via credential type
   - Recommendation: Sign up at celitech.com, get sandbox credentials, test before implementation

2. **CELITECH Webhook Support**
   - What we know: No webhook documentation found in public docs
   - What's unclear: Whether CELITECH supports webhooks for status changes (activation, usage thresholds, expiry)
   - Recommendation: Assume no webhooks -- implement polling for usage data in later phases

3. **Next.js 15 vs 16 Compatibility**
   - What we know: Project spec says Next.js 15, but latest is 16.2.4 on npm
   - What's unclear: Whether all dependencies (next-intl, motion, etc.) are tested with Next.js 16
   - Recommendation: Pin to Next.js 15 as specified. Upgrade later if needed.

4. **Font Choice: Inter vs Plus Jakarta Sans**
   - What we know: Both are geometric modern, excellent legibility
   - Recommendation: Use Plus Jakarta Sans -- slightly more distinctive/premium feel, excellent weight range. Inter as fallback. Both available via `next/font/google`.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest (latest) + Playwright |
| Config file | None -- Wave 0 |
| Quick run command | `npx vitest run --reporter=verbose` |
| Full suite command | `npx vitest run && npx playwright test` |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| INF-01 | Provider abstraction returns normalized types | unit | `npx vitest run src/lib/esim/__tests__/provider.test.ts -x` | Wave 0 |
| INF-01 | CELITECH adapter maps SDK responses correctly | unit | `npx vitest run src/lib/esim/__tests__/celitech-adapter.test.ts -x` | Wave 0 |
| INF-02 | Catalog sync endpoint writes to DB | integration | `npx vitest run src/app/api/cron/__tests__/sync-catalog.test.ts -x` | Wave 0 |
| INF-02 | Cron auth rejects unauthorized requests | unit | `npx vitest run src/app/api/cron/__tests__/sync-catalog.test.ts -x` | Wave 0 |
| INF-06 | Translation keys resolve in server components | integration | `npx vitest run src/__tests__/i18n.test.ts -x` | Wave 0 |
| UXD-01 | Design system components render without errors | unit | `npx vitest run src/components/ui/__tests__/ -x` | Wave 0 |
| UXD-01 | Page transitions animate on route change | e2e | `npx playwright test tests/e2e/transitions.spec.ts` | Wave 0 |

### Sampling Rate
- **Per task commit:** `npx vitest run --reporter=verbose`
- **Per wave merge:** `npx vitest run && npx playwright test`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `vitest.config.ts` -- Vitest configuration for Next.js + TypeScript
- [ ] `playwright.config.ts` -- Playwright configuration
- [ ] `src/lib/esim/__tests__/provider.test.ts` -- Provider abstraction tests
- [ ] `src/lib/esim/__tests__/celitech-adapter.test.ts` -- Adapter mapping tests
- [ ] `src/app/api/cron/__tests__/sync-catalog.test.ts` -- Cron endpoint tests
- [ ] `src/__tests__/i18n.test.ts` -- i18n integration tests
- [ ] `src/components/ui/__tests__/` -- UI component tests directory

## Sources

### Primary (HIGH confidence)
- npm registry -- verified all package versions on 2026-04-19
- [CELITECH Documentation](https://docs.celitech.com/) -- quickstart, main concepts, SDK info
- [next-intl App Router docs](https://next-intl.dev/docs/getting-started/app-router) -- setup and configuration
- [Motion docs](https://motion.dev/docs/react) -- formerly Framer Motion, animation API
- [Tailwind CSS v4 setup](https://tailwindcss.com/docs/guides/nextjs) -- CSS-first configuration
- [Vercel Cron Jobs](https://vercel.com/docs/cron-jobs) -- configuration and security

### Secondary (MEDIUM confidence)
- [Supabase migration docs](https://supabase.com/docs/guides/deployment/database-migrations) -- CLI workflow
- [Supabase Next.js quickstart](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs) -- SSR setup

### Tertiary (LOW confidence)
- CELITECH webhook support -- no documentation found, assumed not available
- CELITECH sandbox endpoint separation -- unclear from public docs

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- all versions verified against npm registry
- Architecture: HIGH -- patterns well-established for Next.js + Supabase + provider abstraction
- CELITECH specifics: MEDIUM -- SDK exists and is documented, but sandbox/webhook details unclear
- Pitfalls: HIGH -- based on verified version changes (Motion rename, Tailwind v4 config)

**Research date:** 2026-04-19
**Valid until:** 2026-05-19 (stable stack, 30-day validity)
