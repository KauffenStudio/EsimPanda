# Phase 6: eSIM Management - Research

**Researched:** 2026-04-24
**Domain:** Dashboard UI, eSIM lifecycle management, Stripe top-up payments, data usage tracking
**Confidence:** HIGH

## Summary

Phase 6 builds the authenticated eSIM management dashboard -- the first protected page in the app. It requires extending existing patterns (Zustand stores, Stripe payment flow, mock data) rather than introducing new libraries. The primary technical challenges are: (1) extending `NormalizedPurchase` with usage data fields that the type currently lacks, (2) creating a top-up payment flow that reuses existing Stripe Elements, (3) implementing the circular SVG gauge component, and (4) adding protected route middleware.

The codebase already has all necessary infrastructure: ESIMProvider with `getStatus()` and `topUp()` methods, Stripe PaymentElement and ExpressCheckout components, QR code display, Resend email delivery, Zustand store patterns, and mock data patterns. The main work is wiring these together into the dashboard UI with new components (EsimCard, CircularGauge, TopUpModal, PurchaseHistoryRow, DashboardTabs, LowDataBanner).

**Primary recommendation:** Extend existing types and patterns rather than introducing new ones. The circular gauge is pure SVG (no library needed). The top-up flow reuses Stripe Elements with a new payment intent endpoint. Mock data must cover all dashboard states since there is no Supabase connection in dev.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Card per eSIM with flag, status badge, circular gauge, expiry, "Top Up" CTA
- Essential info only on cards (no ICCID, no activation codes)
- Empty state with Bambu invite pose and "Browse Plans" CTA
- Dashboard is a protected page -- redirect unauthenticated to /login?next=/dashboard
- Status badges: active (green), expired (gray), pending (amber) as color-coded pills
- Card order: active first, then by expiry date (soonest expiring at top)
- Circular gauge visualization (not linear bar) for data usage
- Refresh on page load + manual refresh button with "Last updated" timestamp
- API failure shows last cached data with amber warning
- Dual low-data warnings: card-level (20%/10%) and dashboard-level banner with "Top Up" CTA
- In-dashboard modal for top-up (not a separate page)
- Same Stripe payment flow (PaymentElement, Apple Pay, Google Pay) for top-ups
- Reuse Bambu poses from checkout for processing/success/error
- No coupons on top-ups (full price only)
- Success: close modal, update card, show toast
- Allow top-up on expired eSIMs (reactivation)
- Quick top-up CTA on low-data warning banner
- Purchase history as tab on dashboard page ("My eSIMs" | "Purchase History")
- Chronological list (newest first), expandable rows
- Expandable row shows: order ID, plan name, payment method, coupon, VAT, ICCID
- "View QR Code" and "Re-send Email" buttons in expanded rows

### Claude's Discretion
- Exact circular gauge implementation (SVG recommended by UI-SPEC)
- Dashboard grid layout (responsive breakpoints, card sizing)
- Modal animation and overlay styling
- Tab component design and switching animation
- Expandable row animation and detail layout
- Loading skeleton design
- Exact refresh polling interval
- Toast notification component and positioning
- Mobile vs desktop layout adaptations

### Deferred Ideas (OUT OF SCOPE)
- User profile page with settings (Phase 7)
- eSIM usage notifications (push/email when data low) -- v2
- Auto top-up (subscribe to automatic refills) -- v2
- Data usage analytics/graphs over time -- v2
- Export purchase history as PDF/CSV -- v2
- eSIM transfer between accounts -- out of scope
- Multi-device eSIM management -- out of scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| MGT-01 | User can view dashboard of active eSIMs (status, expiry, data remaining) | Dashboard page with EsimCard components, CircularGauge, status badges. Requires extending NormalizedPurchase type with usage fields. Mock data for dev mode. Protected route middleware. |
| MGT-02 | User can top-up data on an active eSIM plan | TopUpModal with plan selection + reused Stripe PaymentElement/ExpressCheckout. New API endpoint for top-up payment intent creation. ESIMProvider.topUp() already exists. |
| MGT-03 | User can track data usage in near-real-time (if provider supports) | ESIMProvider.getStatus() fetches usage from Celitech. Cache in Zustand store. Manual refresh button. "Last updated" timestamp. Graceful degradation on API failure. |
| MGT-04 | User can view full purchase history | PurchaseHistoryRow component with expandable details. Tab-based UI on dashboard. Reuse QRCodeDisplay for QR re-access. Reuse sendDeliveryEmail for re-send. |
</phase_requirements>

## Standard Stack

### Core (Already Installed)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| next | 15.5.15 | Framework | Already in use |
| react | 19.1.0 | UI | Already in use |
| motion | 12.38.0 | Animations (import from "motion/react") | Project standard, NOT framer-motion |
| zustand | 5.0.12 | Client state management | Established pattern (auth, checkout, delivery stores) |
| @stripe/react-stripe-js | 6.2.0 | Stripe Elements (PaymentElement, ExpressCheckout) | Reuse from Phase 3 checkout |
| @stripe/stripe-js | 9.2.0 | Stripe client SDK | Reuse from Phase 3 |
| stripe | 22.0.2 | Stripe server SDK | Payment intent creation |
| next-intl | 4.9.1 | i18n | All text through translation keys |
| zod | 4.3.6 | Schema validation | API request/response validation |
| lucide-react | 1.8.0 | Icons | ChevronDown, RefreshCw, X, etc. |
| sonner | 2.0.7 | Toast notifications | Top-up success, email re-send confirmation |
| resend | 6.12.2 | Email delivery | Re-send delivery email |
| qrcode.react | 4.2.0 | QR code rendering | Re-access QR in purchase history |

### No New Dependencies Needed

Phase 6 requires zero new npm packages. Everything is covered by the existing stack. The circular gauge is pure SVG with Motion animation -- no charting library needed.

## Architecture Patterns

### Recommended File Structure
```
src/
├── app/[locale]/dashboard/
│   ├── page.tsx                    # Dashboard page (replace existing placeholder)
│   └── layout.tsx                  # Optional: dashboard-specific layout
├── components/dashboard/
│   ├── esim-card.tsx               # Individual eSIM card with gauge
│   ├── circular-gauge.tsx          # SVG circular progress ring
│   ├── dashboard-tabs.tsx          # "My eSIMs" | "Purchase History" tab switcher
│   ├── esim-grid.tsx               # Grid layout for eSIM cards
│   ├── low-data-banner.tsx         # Warning banner for low-data eSIMs
│   ├── usage-timestamp.tsx         # "Last updated: X min ago" + refresh button
│   ├── dashboard-skeleton.tsx      # Loading skeleton for dashboard
│   ├── top-up-modal.tsx            # Top-up modal with plan selection + payment
│   ├── top-up-plan-card.tsx        # Individual plan option in top-up modal
│   ├── purchase-history-list.tsx   # Purchase history tab content
│   └── purchase-history-row.tsx    # Expandable purchase row
├── stores/
│   └── dashboard.ts                # Zustand store for dashboard state
├── lib/dashboard/
│   ├── types.ts                    # Dashboard-specific types (DashboardEsim, PurchaseRecord)
│   ├── actions.ts                  # Server actions (fetch eSIMs, re-send email)
│   └── schemas.ts                  # Zod schemas for top-up requests
├── lib/mock-data/
│   └── dashboard.ts                # Mock eSIMs, usage data, purchase history
└── app/api/dashboard/
    ├── esims/route.ts              # GET: fetch user's eSIMs with usage data
    ├── usage/route.ts              # GET: refresh usage data for specific eSIM
    └── top-up/
        └── create-intent/route.ts  # POST: create Stripe payment intent for top-up
```

### Pattern 1: NormalizedPurchase Type Extension

**What:** The current `NormalizedPurchase` type lacks usage data fields needed for the dashboard. The type must be extended.

**Current type (src/lib/esim/types.ts):**
```typescript
export interface NormalizedPurchase {
  iccid: string;
  activationQrBase64: string;
  manualActivationCode: string;
  iosActivationLink?: string;
  androidActivationLink?: string;
  status: 'pending' | 'active' | 'expired';
}
```

**Missing fields for dashboard:** `data_total_gb`, `data_used_gb`, `expires_at`, `activated_at`. These exist in the DB schema (esims table) but not in the TypeScript type.

**Recommended approach:** Create a separate `DashboardEsim` type in `src/lib/dashboard/types.ts` that composes data from both the esims table and the provider API, rather than modifying NormalizedPurchase (which is a provider-level type):
```typescript
export interface DashboardEsim {
  id: string;
  iccid: string;
  destination: string;        // country name
  destination_iso: string;    // ISO code for flag
  status: 'pending' | 'active' | 'expired';
  data_total_gb: number;
  data_used_gb: number;
  data_remaining_gb: number;
  data_remaining_pct: number; // 0-100
  expires_at: string | null;
  activated_at: string | null;
  last_usage_check: string | null;
  plan_name: string;
  order_id: string;
  // For top-up: need to know available packages
  wholesale_plan_id: string;
}
```

### Pattern 2: Dashboard Zustand Store

**What:** Follow existing store patterns (auth.ts, delivery.ts, checkout.ts) for dashboard state.
```typescript
import { create } from 'zustand';
import type { DashboardEsim, PurchaseRecord } from '@/lib/dashboard/types';

interface DashboardState {
  esims: DashboardEsim[];
  purchases: PurchaseRecord[];
  loading: boolean;
  error: string | null;
  active_tab: 'esims' | 'history';
  last_usage_refresh: string | null;
  usage_refreshing: boolean;

  // Top-up modal
  top_up_esim: DashboardEsim | null;
  top_up_status: 'idle' | 'plan-select' | 'payment' | 'processing' | 'success' | 'error';

  setEsims: (esims: DashboardEsim[]) => void;
  setPurchases: (purchases: PurchaseRecord[]) => void;
  setActiveTab: (tab: 'esims' | 'history') => void;
  openTopUp: (esim: DashboardEsim) => void;
  closeTopUp: () => void;
  setTopUpStatus: (status: DashboardState['top_up_status']) => void;
  refreshUsage: () => Promise<void>;
  reset: () => void;
}
```

### Pattern 3: Protected Route Middleware

**What:** Extend existing middleware.ts to redirect unauthenticated users from /dashboard to /login?next=/dashboard.

**Current middleware pattern:**
```typescript
// middleware.ts handles i18n routing + Supabase session refresh
// Extend to check auth for /dashboard paths
```

**Approach:** After i18n routing and session refresh, check if the path contains `/dashboard`. If so, verify the user has an active session. If not, redirect to `/{locale}/login?next=/dashboard`.

In mock mode (NEXT_PUBLIC_STRIPE_MOCK=true), skip the auth check and allow access (consistent with mock auth pattern in auth store).

### Pattern 4: Mock Dashboard Data

**What:** No Supabase connection in dev. Must provide realistic mock data for all dashboard states.
```typescript
// src/lib/mock-data/dashboard.ts
export const mockDashboardEsims: DashboardEsim[] = [
  {
    id: 'mock-esim-1',
    iccid: '8901234567890123456',
    destination: 'Portugal',
    destination_iso: 'PT',
    status: 'active',
    data_total_gb: 5,
    data_used_gb: 3.8,       // 76% used = 24% remaining (near warning threshold)
    data_remaining_gb: 1.2,
    data_remaining_pct: 24,
    expires_at: '2026-05-15T00:00:00Z',
    // ...
  },
  // Include: active with plenty of data, active near warning, active near critical, expired, pending
];
```

### Pattern 5: Top-Up Payment Intent

**What:** Create a new API endpoint for top-up that mirrors the checkout create-intent pattern but is simpler (no coupon, metadata includes iccid for provisioning).

```typescript
// POST /api/dashboard/top-up/create-intent
// Body: { iccid: string, package_id: string, email: string }
// Returns: { client_secret: string, amount: number, tax_amount: number }
```

The top-up flow after payment confirmation:
1. Stripe webhook receives payment_intent.succeeded
2. Webhook checks metadata for `top_up: true` and `iccid`
3. Calls ESIMProvider.topUp(iccid, packageId)
4. Updates esims table with new data_total_gb and status

In mock mode: return mock client_secret, simulate success.

### Pattern 6: SVG Circular Gauge (No Library)

**What:** Pure SVG implementation per UI-SPEC. Two `<circle>` elements (track + progress).
```typescript
// Key SVG math:
// circumference = 2 * PI * radius
// strokeDashoffset = circumference * (1 - percentage / 100)
// rotate -90deg to start from top

interface CircularGaugeProps {
  total_gb: number;
  used_gb: number;
  size?: number;           // 96 or 120
  stroke_width?: number;   // 8
}
```

Animate with Motion's `motion.circle` and `animate` prop on `strokeDashoffset`.

### Anti-Patterns to Avoid
- **Modifying NormalizedPurchase for dashboard needs:** This is a provider-level type. Create a separate DashboardEsim type that combines DB data with provider data.
- **Polling for usage updates:** Don't poll automatically. Fetch on page load + manual refresh only (per CONTEXT.md decisions).
- **Direct Supabase queries in components:** Use server actions or API routes. Components fetch through the Zustand store.
- **Building custom modal from scratch:** Use standard overlay pattern with Motion AnimatePresence, focus trap, and Escape handling. Don't reinvent dialog mechanics.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Payment processing | Custom payment form | Stripe PaymentElement (already integrated) | PCI compliance, existing component |
| Toast notifications | Custom notification system | Sonner (already installed) | Already in project, consistent UX |
| QR code rendering | Custom QR generator | qrcode.react (already integrated) | Already in project, tested |
| Email delivery | Custom SMTP | Resend (already integrated) | Already in project, branded templates exist |
| Focus trap in modal | Custom focus management | Native `<dialog>` or manual focus trap with tab key handling | Accessibility requirement, well-known pattern |
| Country flags | Custom flag images | Emoji flags (already used in browse) or existing flag rendering approach | Consistent with Phase 2 approach |
| Date formatting | Custom date formatter | Intl.DateTimeFormat (native) | i18n-aware, no library needed |

## Common Pitfalls

### Pitfall 1: Stripe Elements Provider Scope in Modal
**What goes wrong:** Stripe PaymentElement requires being wrapped in an `<Elements>` provider with a client secret. If you mount the provider on page load, it ties to one payment intent. Top-up needs a NEW payment intent each time.
**Why it happens:** The checkout page creates the Elements provider with a client secret at page load. The modal needs to create a fresh one per top-up.
**How to avoid:** Create the `<Elements>` provider INSIDE the TopUpModal component. Only mount it after the user selects a plan and the API returns a new client_secret. Unmount when modal closes.
**Warning signs:** "No Stripe context" errors, stale payment intents.

### Pitfall 2: Race Conditions on Usage Refresh
**What goes wrong:** User clicks refresh, then navigates to another tab, then comes back. Multiple fetch requests can overlap and resolve out of order.
**Why it happens:** No request cancellation on unmount or navigation.
**How to avoid:** Use AbortController with fetch. Track request ID in the store. Only update state if the response matches the latest request.
**Warning signs:** Flickering data, stale data appearing after fresh data.

### Pitfall 3: Mock Mode Inconsistency
**What goes wrong:** Dashboard works in mock mode but breaks when Supabase is connected because DB schema doesn't match expectations.
**Why it happens:** Mock data shape diverges from actual DB query results.
**How to avoid:** Define types first (DashboardEsim, PurchaseRecord), make mock data conform to the SAME types, and make the real DB query return the same shape.
**Warning signs:** Type errors only appearing in production mode.

### Pitfall 4: Protected Route Redirect Loop
**What goes wrong:** Middleware redirects to /login, which redirects back to /dashboard, creating an infinite loop.
**Why it happens:** The redirect logic doesn't exclude auth pages, or the `next` parameter causes a loop.
**How to avoid:** Only apply the auth check to specific protected paths (/dashboard). Never redirect FROM /login or /signup. Parse `next` parameter carefully.
**Warning signs:** Browser shows "too many redirects" error.

### Pitfall 5: Stale Dashboard After Top-Up
**What goes wrong:** User completes a top-up but the eSIM card still shows old data.
**Why it happens:** The dashboard store isn't updated after the top-up succeeds.
**How to avoid:** On top-up success: optimistically update the eSIM in the store (increment data_total_gb, reset status to 'active' if was expired), then trigger a background usage refresh.
**Warning signs:** User has to manually refresh or reload the page to see updated data.

### Pitfall 6: SVG Gauge Rendering on Different Viewports
**What goes wrong:** Gauge looks distorted or text overflows on certain screen sizes.
**Why it happens:** Fixed pixel values for SVG viewBox don't account for responsive sizing.
**How to avoid:** Use a fixed `viewBox` (e.g., "0 0 120 120") and control actual size with CSS width/height. Text inside SVG should use relative coordinates. Test at both 96px and 120px sizes.
**Warning signs:** Gauge text overlapping the ring, text cut off on mobile.

## Code Examples

### SVG Circular Gauge
```typescript
// Pure SVG approach with Motion animation
// Source: Standard SVG circular progress pattern

const radius = (size - strokeWidth) / 2;
const circumference = 2 * Math.PI * radius;
const offset = circumference * (1 - percentage / 100);

<svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
  {/* Track (background ring) */}
  <circle
    cx={size / 2}
    cy={size / 2}
    r={radius}
    fill="none"
    stroke="#E5E5E5"
    strokeWidth={strokeWidth}
  />
  {/* Progress ring */}
  <motion.circle
    cx={size / 2}
    cy={size / 2}
    r={radius}
    fill="none"
    stroke={gaugeColor}
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeDasharray={circumference}
    initial={{ strokeDashoffset: circumference }}
    animate={{ strokeDashoffset: offset }}
    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    transform={`rotate(-90 ${size / 2} ${size / 2})`}
  />
  {/* Center text */}
  <text x="50%" y="45%" textAnchor="middle" dominantBaseline="middle"
    className="text-2xl font-bold fill-current">
    {remainingGb.toFixed(1)}
  </text>
  <text x="50%" y="62%" textAnchor="middle" dominantBaseline="middle"
    className="text-sm fill-gray-600">
    GB left
  </text>
</svg>
```

### Zustand Store Pattern (Following Project Convention)
```typescript
// Follows auth.ts and delivery.ts patterns
import { create } from 'zustand';

export const useDashboardStore = create<DashboardState>((set, get) => ({
  esims: [],
  loading: true,
  error: null,
  active_tab: 'esims',
  // ... initial state

  initialize: async () => {
    if (process.env.NEXT_PUBLIC_STRIPE_MOCK === 'true') {
      // Mock mode: use mock data
      const { mockDashboardEsims, mockPurchases } = await import('@/lib/mock-data/dashboard');
      set({ esims: mockDashboardEsims, purchases: mockPurchases, loading: false });
      return;
    }
    // Real mode: fetch from API
    // ...
  },
}));
```

### Protected Route Check in Middleware
```typescript
// Extend existing middleware.ts
const protectedPaths = ['/dashboard'];

function isProtectedPath(pathname: string): boolean {
  return protectedPaths.some(p => pathname.includes(p));
}

// After i18n + session refresh:
if (isProtectedPath(request.nextUrl.pathname)) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user && process.env.NEXT_PUBLIC_STRIPE_MOCK !== 'true') {
    const locale = request.nextUrl.pathname.split('/')[1] || 'en';
    return NextResponse.redirect(new URL(`/${locale}/login?next=/dashboard`, request.url));
  }
}
```

### Top-Up Modal with Fresh Stripe Elements
```typescript
// Key pattern: Elements provider created per top-up session
function TopUpModal({ esim, onClose }: TopUpModalProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);

  // Create new payment intent when package is selected
  async function handleSelectPackage(packageId: string) {
    setSelectedPackage(packageId);
    const res = await fetch('/api/dashboard/top-up/create-intent', {
      method: 'POST',
      body: JSON.stringify({ iccid: esim.iccid, package_id: packageId }),
    });
    const data = await res.json();
    setClientSecret(data.client_secret);
  }

  return (
    <AnimatePresence>
      {/* modal overlay + content */}
      {clientSecret && (
        <Elements stripe={stripePromise} options={{ clientSecret }}>
          <CardPayment />
          <ExpressCheckout />
          {/* Pay button */}
        </Elements>
      )}
    </AnimatePresence>
  );
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `framer-motion` import | `motion/react` import | motion v12+ | Project already uses correct import |
| useFormState (React 18) | useActionState (React 19) | React 19 | Already adopted in Phase 5 auth forms |
| Manual focus trap libraries | Native `<dialog>` element or manual implementation | Ongoing | Can use HTML dialog for modal accessibility base |

## Open Questions

1. **Celitech getStatus() response shape**
   - What we know: `getStatus(iccid)` is implemented in celitech-adapter.ts, returns NormalizedPurchase
   - What's unclear: Does the actual Celitech API return data usage (data_used_gb, data_total_gb) in the eSIM status response? The current adapter doesn't map these fields.
   - Recommendation: The DB schema has `data_total_gb` and `data_used_gb` columns. Assume the Celitech API provides usage data in the eSIM status response. If not available, calculate from DB-stored plan data and mark usage as "unavailable" in the UI.

2. **Top-up available packages**
   - What we know: ESIMProvider.topUp(iccid, packageId) exists
   - What's unclear: How to get the list of available top-up packages for a specific ICCID. Is it the same as listPackages(destination)?
   - Recommendation: Use listPackages() for the original destination ISO to show available top-up options. The provider handles compatibility.

3. **Purchase history data source**
   - What we know: Orders table has all purchase data. No Supabase in dev.
   - What's unclear: In mock mode, purchase history data needs to be fabricated.
   - Recommendation: Create comprehensive mock purchase history covering various states (with/without coupon, different destinations, different statuses).

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.4 + @testing-library/react 16.3.2 |
| Config file | vitest.config.ts |
| Quick run command | `npx vitest run --reporter=verbose` |
| Full suite command | `npx vitest run` |

### Phase Requirements to Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| MGT-01 | Dashboard renders eSIM cards with status, expiry, data | unit | `npx vitest run src/components/dashboard/__tests__/esim-card.test.tsx -x` | Wave 0 |
| MGT-01 | Dashboard skeleton + empty state + error state | unit | `npx vitest run src/components/dashboard/__tests__/dashboard-page.test.tsx -x` | Wave 0 |
| MGT-01 | Protected route redirects unauthenticated users | unit | `npx vitest run src/middleware.test.ts -x` | Wave 0 |
| MGT-02 | Top-up modal opens, selects plan, shows payment | unit | `npx vitest run src/components/dashboard/__tests__/top-up-modal.test.tsx -x` | Wave 0 |
| MGT-02 | Top-up create-intent API validates and returns client_secret | unit | `npx vitest run src/app/api/dashboard/__tests__/top-up-create-intent.test.ts -x` | Wave 0 |
| MGT-03 | Circular gauge renders correct percentage and color | unit | `npx vitest run src/components/dashboard/__tests__/circular-gauge.test.tsx -x` | Wave 0 |
| MGT-03 | Usage refresh updates store and timestamp | unit | `npx vitest run src/stores/__tests__/dashboard.test.ts -x` | Wave 0 |
| MGT-04 | Purchase history rows render and expand | unit | `npx vitest run src/components/dashboard/__tests__/purchase-history-row.test.tsx -x` | Wave 0 |
| MGT-04 | Tab switching between eSIMs and purchase history | unit | `npx vitest run src/components/dashboard/__tests__/dashboard-tabs.test.tsx -x` | Wave 0 |

### Sampling Rate
- **Per task commit:** `npx vitest run --reporter=verbose`
- **Per wave merge:** `npx vitest run`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `src/components/dashboard/__tests__/esim-card.test.tsx` -- covers MGT-01
- [ ] `src/components/dashboard/__tests__/dashboard-page.test.tsx` -- covers MGT-01
- [ ] `src/components/dashboard/__tests__/circular-gauge.test.tsx` -- covers MGT-03
- [ ] `src/components/dashboard/__tests__/top-up-modal.test.tsx` -- covers MGT-02
- [ ] `src/components/dashboard/__tests__/purchase-history-row.test.tsx` -- covers MGT-04
- [ ] `src/components/dashboard/__tests__/dashboard-tabs.test.tsx` -- covers MGT-04
- [ ] `src/stores/__tests__/dashboard.test.ts` -- covers MGT-03
- [ ] `src/app/api/dashboard/__tests__/top-up-create-intent.test.ts` -- covers MGT-02
- [ ] `src/lib/mock-data/dashboard.ts` -- mock data for all tests

## Sources

### Primary (HIGH confidence)
- Project codebase direct inspection: src/lib/esim/provider.ts, src/lib/esim/types.ts, src/lib/esim/celitech-adapter.ts
- Project codebase direct inspection: src/stores/auth.ts, src/stores/checkout.ts, src/stores/delivery.ts
- Project codebase direct inspection: src/middleware.ts, src/app/[locale]/dashboard/page.tsx
- Project codebase direct inspection: src/components/checkout/card-payment.tsx, src/components/checkout/express-checkout.tsx
- Project codebase direct inspection: supabase/migrations/00001_initial_schema.sql (esims table schema)
- Project codebase direct inspection: src/lib/mock-data/checkout.ts, src/lib/mock-data/delivery.ts
- Project codebase direct inspection: src/lib/auth/actions.ts (server actions pattern)
- Phase 6 CONTEXT.md and UI-SPEC.md (locked decisions, component specs)
- package.json (all dependency versions verified from project file)

### Secondary (MEDIUM confidence)
- SVG circular progress ring pattern (well-established standard web technique)
- Stripe PaymentElement reuse pattern (documented in Stripe docs, proven in Phase 3)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - all libraries already installed and in use, zero new dependencies
- Architecture: HIGH - extends proven patterns from prior phases (stores, mock data, API routes, server actions)
- Pitfalls: HIGH - based on direct codebase inspection and known Stripe Elements behavior

**Research date:** 2026-04-24
**Valid until:** 2026-05-24 (stable -- no fast-moving dependencies)
