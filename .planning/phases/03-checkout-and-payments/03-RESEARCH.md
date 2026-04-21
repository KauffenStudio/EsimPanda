# Phase 3: Checkout and Payments - Research

**Researched:** 2026-04-21
**Domain:** Stripe Payment Element + Express Checkout, EU VAT (Stripe Tax), coupon/discount system, fraud prevention
**Confidence:** HIGH

## Summary

Phase 3 implements a single-page embedded checkout using Stripe's Payment Element and Express Checkout Element (Apple Pay, Google Pay, PayPal) with inline card form. The key architectural decision is using **Payment Intents with embedded Elements** (not Stripe Checkout redirect), which aligns with the CONTEXT.md requirement for a fully branded inline experience. This means coupons must be calculated server-side (Stripe coupons only work with Checkout Sessions, not Payment Intents), and Stripe Tax integrates via the Tax Calculations API linked to Payment Intents.

The checkout flow creates a Zustand store for checkout state, a server-side API route for creating Payment Intents with tax calculation, and client-side Stripe Elements for payment collection. All development uses mock patterns -- mock API routes returning fake client secrets and simulated payment confirmations -- matching the project's established mock-data pattern in `src/lib/mock-data/`.

**Primary recommendation:** Use Express Checkout Element for Apple Pay/Google Pay/PayPal at top, Payment Element for card form below, server-side coupon validation with price adjustment on the Payment Intent, and Stripe Tax Calculations API for EU VAT.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Single-page checkout: all steps on one page, no multi-step wizard
- Guest checkout (email only): no account creation
- Device compatibility check inline: auto-populated from localStorage
- Plan + VAT breakdown visible before payment
- EUR currency only
- "Under 2 minutes" target for entire flow
- Collapsible "Have a code?" link for coupons (not prominent field)
- Two coupon entry methods: URL parameter + manual text input
- Visual feedback: strikethrough original price + green savings text
- Single coupon type: 30% student/traveler discount (hardcoded)
- Express payment buttons at top (Apple Pay / Google Pay)
- Auto-detect and hide unsupported payment methods
- Inline Stripe Elements card form (NOT Stripe Checkout redirect)
- PayPal as separate button below card form
- 3D Secure enabled, Stripe Radar enabled
- Bambu loading state during processing
- Bambu error on failure
- Bambu celebration screen with confetti on success
- Auto-redirect to dashboard after 5 seconds
- No QR code on success screen (Phase 4)

### Claude's Discretion
- Stripe Elements styling to match design system
- Card form field layout (single line vs stacked)
- Loading skeleton during Stripe initialization
- Error message copy for payment failure types
- PayPal integration approach (Stripe PayPal vs direct SDK)
- Mobile keyboard optimization for inputs
- Exact confetti animation parameters

### Deferred Ideas (OUT OF SCOPE)
- eSIM delivery (QR/install link) -- Phase 4
- Account creation after purchase -- Phase 5
- Purchase history -- Phase 6
- Multiple currency support -- v2
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| CHK-01 | Guest checkout (email only, no account) | Stripe Payment Intents work without customer objects; email captured in metadata and receipt_email field |
| CHK-02 | Apple Pay / Google Pay via Stripe | Express Checkout Element auto-detects wallet availability; `card` payment method type enables both |
| CHK-03 | PayPal payment | PayPal supported as Stripe payment method via Express Checkout Element or direct `confirmPayPalPayment`; EUR supported |
| CHK-04 | Student/traveler discount coupon (30% off) | Server-side coupon validation + Payment Intent amount adjustment (Stripe coupons don't work with Payment Intents) |
| CHK-05 | EU VAT via Stripe Tax (OSS compliance) | Stripe Tax Calculations API with `hooks.inputs.tax.calculation` parameter on Payment Intent; IP geolocation for customer address |
| INF-05 | Stripe Radar + 3D Secure for chargeback prevention | Radar enabled by default on all Payment Intents; 3DS triggered automatically for SCA compliance via `payment_method_options.card.request_three_d_secure` |
</phase_requirements>

## Standard Stack

### Core (new packages for Phase 3)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `@stripe/stripe-js` | 9.2.0 | Stripe.js loader (client) | Required for Elements, Payment Element, Express Checkout Element |
| `@stripe/react-stripe-js` | 6.2.0 | React bindings for Stripe Elements | Provides `<Elements>`, `<PaymentElement>`, `<ExpressCheckoutElement>` components |
| `stripe` | 22.0.2 | Stripe Node.js SDK (server) | Payment Intent creation, Tax Calculations, webhook verification |

### Already Installed (reuse)
| Library | Purpose | How Used in Phase 3 |
|---------|---------|---------------------|
| `zustand` 5.x | Client state | Checkout store (selected plan, email, coupon, payment status) |
| `zod` 4.x | Validation | Checkout form validation, API response schemas |
| `motion` 12.x | Animations | Bambu celebration, confetti, page transitions, price strikethrough |
| `sonner` 2.x | Toasts | Payment errors, coupon feedback (if not inline) |
| `next-intl` 4.x | i18n | All checkout text through translation keys |
| `lucide-react` | Icons | Payment method icons, success/error icons |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Payment Element (embedded) | Stripe Checkout (redirect) | Checkout is simpler but user LOCKED inline Elements for brand control |
| Server-side coupon math | Stripe Promotion Codes | Stripe coupons don't work with Payment Intents -- only Checkout Sessions |
| Express Checkout Element | Payment Request Button | Payment Request Button is legacy; Express Checkout Element is the replacement |

**Installation:**
```bash
npm install @stripe/stripe-js @stripe/react-stripe-js stripe
```

**Version verification:** Verified against npm registry 2026-04-21:
- `@stripe/stripe-js`: 9.2.0
- `@stripe/react-stripe-js`: 6.2.0
- `stripe`: 22.0.2

## Architecture Patterns

### Recommended Project Structure
```
src/
├── app/[locale]/checkout/
│   ├── page.tsx               # Server component: loads plan data, renders CheckoutPage
│   └── success/
│       └── page.tsx           # Success page with Bambu celebration
├── components/checkout/
│   ├── checkout-page.tsx      # Client component: orchestrates entire checkout
│   ├── order-summary.tsx      # Plan name, price, VAT breakdown, coupon display
│   ├── email-field.tsx        # Email input with validation
│   ├── device-check.tsx       # Inline device compatibility (from localStorage)
│   ├── coupon-input.tsx       # Collapsible "Have a code?" with apply logic
│   ├── express-checkout.tsx   # Express Checkout Element (Apple Pay, Google Pay, PayPal)
│   ├── card-payment.tsx       # Payment Element for card input
│   ├── pay-button.tsx         # Submit button with loading state
│   └── payment-status.tsx     # Bambu loading/error/success states
├── stores/
│   └── checkout.ts            # Zustand: selected plan, email, coupon, payment state
├── lib/
│   ├── stripe/
│   │   ├── client.ts          # loadStripe singleton (client-side)
│   │   ├── server.ts          # Stripe server instance
│   │   └── config.ts          # Stripe appearance theme matching design system
│   ├── checkout/
│   │   ├── pricing.ts         # Server-side price calculation + coupon math
│   │   ├── coupons.ts         # Coupon validation logic
│   │   └── tax.ts             # Stripe Tax calculation wrapper
│   └── mock-data/
│       ├── checkout.ts        # Mock Payment Intent responses
│       └── coupons.ts         # Mock coupon data (STUDENT30)
├── app/api/checkout/
│   ├── create-intent/route.ts # POST: create Payment Intent with tax
│   ├── update-intent/route.ts # POST: update Payment Intent (coupon applied)
│   └── validate-coupon/route.ts # POST: validate coupon code
└── messages/
    └── en.json                # Add checkout translation keys
```

### Pattern 1: Payment Intent Flow (Embedded Elements)
**What:** Server creates Payment Intent, client renders Elements with client secret
**When to use:** Every checkout session

```typescript
// src/app/api/checkout/create-intent/route.ts
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: Request) {
  const { plan_id, email, coupon_code } = await request.json();

  // 1. Look up plan from DB/mock data (NEVER trust client price)
  const plan = getPlanById(plan_id);
  if (!plan) return Response.json({ error: 'Plan not found' }, { status: 404 });

  // 2. Calculate price with coupon
  let amount = plan.retail_price_cents;
  let discount = 0;
  if (coupon_code) {
    const coupon = validateCoupon(coupon_code);
    if (coupon) {
      discount = Math.round(amount * coupon.discount_percent / 100);
      amount -= discount;
    }
  }

  // 3. Calculate tax via Stripe Tax API
  const taxCalc = await stripe.tax.calculations.create({
    currency: 'eur',
    line_items: [{
      amount,
      reference: plan_id,
      tax_code: 'txcd_10000000', // General digital services
    }],
    customer_details: {
      address: { country: 'auto' }, // IP-based geolocation
      address_source: 'billing',
    },
  });

  // 4. Create Payment Intent with tax linked
  const paymentIntent = await stripe.paymentIntents.create({
    amount: taxCalc.amount_total,
    currency: 'eur',
    automatic_payment_methods: { enabled: true },
    receipt_email: email,
    metadata: {
      plan_id,
      email,
      coupon_code: coupon_code || '',
      discount_cents: String(discount),
    },
    hooks: {
      inputs: {
        tax: { calculation: taxCalc.id },
      },
    },
  });

  return Response.json({
    client_secret: paymentIntent.client_secret,
    amount: taxCalc.amount_total,
    tax_amount: taxCalc.tax_amount_exclusive,
    subtotal: amount,
    discount,
  });
}
```

### Pattern 2: Stripe Elements Provider Setup
**What:** Client-side Elements wrapper with appearance theme
**When to use:** Checkout page component tree root

```typescript
// src/components/checkout/checkout-page.tsx
'use client';

import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { stripeAppearance } from '@/lib/stripe/config';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export function CheckoutPage({ plan }: { plan: Plan }) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  // Fetch Payment Intent on mount
  useEffect(() => {
    fetch('/api/checkout/create-intent', {
      method: 'POST',
      body: JSON.stringify({ plan_id: plan.id, email: '' }),
    })
      .then(res => res.json())
      .then(data => setClientSecret(data.client_secret));
  }, [plan.id]);

  if (!clientSecret) return <CheckoutSkeleton />;

  return (
    <Elements stripe={stripePromise} options={{
      clientSecret,
      appearance: stripeAppearance,
    }}>
      {/* Express Checkout at top */}
      <ExpressCheckout />
      {/* Card form below */}
      <CardPayment />
    </Elements>
  );
}
```

### Pattern 3: Express Checkout Element (Apple Pay / Google Pay / PayPal)
**What:** One-tap payment buttons that auto-detect device support
**When to use:** Top of checkout form, before card input

```typescript
// src/components/checkout/express-checkout.tsx
'use client';

import { ExpressCheckoutElement } from '@stripe/react-stripe-js';

export function ExpressCheckout() {
  const [available, setAvailable] = useState(true);

  return (
    <div className={available ? '' : 'hidden'}>
      <ExpressCheckoutElement
        onReady={({ availablePaymentMethods }) => {
          // Hide section if no wallet methods available
          if (!availablePaymentMethods) setAvailable(false);
        }}
        onConfirm={async (event) => {
          // Payment confirmation handled by parent Elements context
          const { error } = await stripe.confirmPayment({
            elements,
            confirmParams: { return_url: `${window.location.origin}/checkout/success` },
          });
          if (error) handlePaymentError(error);
        }}
        options={{
          paymentMethods: {
            applePay: 'auto',
            googlePay: 'auto',
            paypal: 'auto',
          },
        }}
      />
    </div>
  );
}
```

### Pattern 4: Mock Pattern for Development
**What:** Mock API routes that return fake Stripe responses
**When to use:** All development (no real Stripe connection per project constraint)

```typescript
// src/lib/mock-data/checkout.ts
export const MOCK_CLIENT_SECRET = 'pi_mock_secret_test123';

export const mockCreateIntent = (planId: string, couponCode?: string) => {
  const plan = mockPlans.find(p => p.id === planId);
  if (!plan) return null;

  let amount = plan.retail_price_cents;
  let discount = 0;

  if (couponCode === 'STUDENT30') {
    discount = Math.round(amount * 0.3);
    amount -= discount;
  }

  const taxRate = 0.23; // Mock 23% VAT (Portugal)
  const taxAmount = Math.round(amount * taxRate);
  const total = amount + taxAmount;

  return {
    client_secret: MOCK_CLIENT_SECRET,
    amount: total,
    tax_amount: taxAmount,
    subtotal: amount,
    discount,
  };
};
```

### Pattern 5: Server-Side Coupon Validation
**What:** Validate coupon codes server-side, calculate discount, update Payment Intent
**When to use:** When user applies a coupon code

```typescript
// src/lib/checkout/coupons.ts
interface Coupon {
  code: string;
  discount_percent: number;
  max_uses: number;
  current_uses: number;
  valid_from: string;
  valid_until: string | null;
  is_active: boolean;
}

// For v1: single hardcoded coupon. In production, this queries the DB.
const COUPONS: Coupon[] = [
  {
    code: 'STUDENT30',
    discount_percent: 30,
    max_uses: 999999,
    current_uses: 0,
    valid_from: '2026-01-01T00:00:00Z',
    valid_until: null,
    is_active: true,
  },
];

export function validateCoupon(code: string): Coupon | null {
  const coupon = COUPONS.find(c =>
    c.code.toUpperCase() === code.toUpperCase() &&
    c.is_active &&
    c.current_uses < c.max_uses
  );
  if (!coupon) return null;
  const now = new Date();
  if (new Date(coupon.valid_from) > now) return null;
  if (coupon.valid_until && new Date(coupon.valid_until) < now) return null;
  return coupon;
}
```

### Anti-Patterns to Avoid
- **Trusting client-side price:** NEVER use the price sent from the client. Always look up the plan server-side and calculate the price.
- **Creating Payment Intent with coupon on client:** Coupons must be validated and applied server-side. The client shows the visual discount but the server decides the actual charge amount.
- **Loading Stripe.js multiple times:** Use a singleton `loadStripe()` call. Multiple loads cause console errors and duplicate initializations.
- **Rendering Elements without clientSecret:** The Elements provider needs the clientSecret to render. Show a loading skeleton until it's available.
- **Blocking on tax calculation for UI:** Calculate tax asynchronously. Show "Calculating..." for the VAT line while the API call completes.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Card input fields | Custom input masking for card/expiry/CVC | Stripe Payment Element | PCI compliance, 3DS, error handling built in |
| Apple Pay / Google Pay detection | Custom `window.ApplePaySession` checks | Express Checkout Element | Handles availability detection, UI rendering, payment flow |
| PayPal redirect flow | Custom PayPal SDK integration | Stripe PayPal via Express Checkout Element | Single integration point, no separate PayPal SDK needed |
| EU VAT calculation | VAT rate lookup tables | Stripe Tax Calculations API | Handles 27 EU countries, rate changes, OSS reporting |
| 3D Secure authentication | Custom 3DS challenge handling | Stripe automatic SCA | Stripe handles 3DS challenges in the payment flow automatically |
| Fraud scoring | Risk assessment logic | Stripe Radar | ML-based fraud detection, enabled by default |
| Webhook signature verification | Custom HMAC | `stripe.webhooks.constructEvent()` | Handles timing attacks, replay attacks |

**Key insight:** Stripe's embedded Elements handle the entire payment UX including error states, loading states, and SCA challenges. The developer's job is to (1) create the Payment Intent server-side with the right amount, (2) mount the Elements, and (3) handle the success/error result.

## Common Pitfalls

### Pitfall 1: Stripe Elements in Server Components
**What goes wrong:** Trying to use Stripe Elements in a Next.js Server Component causes hydration errors.
**Why it happens:** Stripe Elements require browser APIs (DOM, window).
**How to avoid:** All Stripe Element components MUST be `'use client'`. The checkout page.tsx can be a server component that fetches plan data, but the actual checkout form must be a client component.
**Warning signs:** "window is not defined" errors, hydration mismatch errors.

### Pitfall 2: Payment Intent Amount Mismatch
**What goes wrong:** The amount shown to the user doesn't match what Stripe charges.
**Why it happens:** Coupon or tax calculated differently on client vs server, or Payment Intent not updated after coupon applied.
**How to avoid:** Always return the final breakdown from the server (subtotal, discount, tax, total). Client displays what server returns. When coupon is applied, call server to recalculate AND update the Payment Intent.
**Warning signs:** Customer complaints about wrong charge amounts.

### Pitfall 3: Express Checkout Element Not Showing
**What goes wrong:** Apple Pay / Google Pay buttons don't appear even on supported devices.
**Why it happens:** Apple Pay requires domain verification (apple-developer-merchantid-domain-association file), Google Pay requires a verified domain. In test mode, both require specific browser/device configurations.
**How to avoid:** In development, test with mock data. In staging, set up proper domain verification. The Express Checkout Element's `onReady` callback tells you what methods are available.
**Warning signs:** Blank space where buttons should be; `availablePaymentMethods` is null.

### Pitfall 4: Coupon Applied But Intent Not Updated
**What goes wrong:** User applies coupon, sees discounted price, but gets charged full amount.
**Why it happens:** Frontend updated the display but forgot to update the Payment Intent on the server.
**How to avoid:** When coupon is applied, always call the update-intent API endpoint to recalculate and update the Payment Intent amount. The UI update and the intent update must happen together.
**Warning signs:** Stripe Dashboard shows different amount than what user saw.

### Pitfall 5: Tax Calculation Timing
**What goes wrong:** Tax calculated at Payment Intent creation but customer location changes (different IP, VPN).
**Why it happens:** Stripe Tax uses the address provided at calculation time.
**How to avoid:** For IP-based geolocation, calculate tax once at checkout load. If customer provides explicit address later, recalculate. For v1 with IP geolocation only, single calculation is sufficient.
**Warning signs:** Tax amounts inconsistent with customer's actual location.

### Pitfall 6: Double Payment on Return URL
**What goes wrong:** User completes payment, gets redirected to success page, but the success page tries to confirm payment again.
**Why it happens:** Not checking Payment Intent status on the success page before attempting operations.
**How to avoid:** On success page, retrieve Payment Intent status via `stripe.retrievePaymentIntent(clientSecret)` and only display success if status is `succeeded`.
**Warning signs:** Multiple payment attempts in Stripe Dashboard for same order.

## Code Examples

### Stripe Appearance Theme (matching eSIM Panda design system)
```typescript
// src/lib/stripe/config.ts
import type { Appearance } from '@stripe/stripe-js';

export const stripeAppearance: Appearance = {
  theme: 'flat',
  variables: {
    colorPrimary: '#16a34a',          // accent (green-600)
    colorBackground: '#ffffff',
    colorText: '#1a1a1a',             // text-primary
    colorDanger: '#dc2626',           // destructive
    fontFamily: '"Plus Jakarta Sans", "Inter", system-ui, sans-serif',
    borderRadius: '12px',             // rounded-card token
    spacingUnit: '4px',
  },
  rules: {
    '.Input': {
      border: '1px solid #e5e7eb',    // border color
      padding: '12px',
      fontSize: '16px',               // prevents iOS zoom on focus
    },
    '.Input:focus': {
      border: '1px solid #16a34a',
      boxShadow: '0 0 0 2px rgba(22, 163, 74, 0.2)',
    },
    '.Tab': {
      border: '1px solid #e5e7eb',
    },
    '.Tab--selected': {
      borderColor: '#16a34a',
      backgroundColor: '#f0fdf4',
    },
  },
};
```

### Checkout Zustand Store
```typescript
// src/stores/checkout.ts
import { create } from 'zustand';

type PaymentStatus = 'idle' | 'processing' | 'succeeded' | 'failed';

interface CheckoutState {
  plan_id: string | null;
  email: string;
  coupon_code: string | null;
  discount_cents: number;
  subtotal_cents: number;
  tax_cents: number;
  total_cents: number;
  payment_status: PaymentStatus;
  error_message: string | null;
  client_secret: string | null;

  setPlan: (id: string) => void;
  setEmail: (email: string) => void;
  applyCoupon: (code: string, discount: number, newSubtotal: number, newTax: number, newTotal: number) => void;
  removeCoupon: () => void;
  setPaymentStatus: (status: PaymentStatus, error?: string) => void;
  setClientSecret: (secret: string) => void;
  reset: () => void;
}
```

### URL Coupon Auto-Apply
```typescript
// In checkout page component
'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

function useCouponFromUrl() {
  const searchParams = useSearchParams();
  const couponParam = searchParams.get('coupon');

  useEffect(() => {
    if (couponParam) {
      // Auto-apply coupon from URL parameter
      applyCoupon(couponParam);
    }
  }, [couponParam]);
}
```

### Zod Schema for Checkout Validation
```typescript
// src/lib/checkout/schemas.ts
import { z } from 'zod/v4';

export const checkoutFormSchema = z.object({
  email: z.email('Please enter a valid email address'),
  plan_id: z.uuid('Invalid plan'),
  coupon_code: z.string().optional(),
});

export const createIntentRequestSchema = z.object({
  plan_id: z.uuid(),
  email: z.email(),
  coupon_code: z.string().optional(),
});

export const createIntentResponseSchema = z.object({
  client_secret: z.string(),
  amount: z.number(),
  tax_amount: z.number(),
  subtotal: z.number(),
  discount: z.number(),
});
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Payment Request Button | Express Checkout Element | 2023-2024 | Single element handles Apple Pay, Google Pay, PayPal, Link |
| Card Element (individual fields) | Payment Element | 2022-2023 | One component handles all card payment methods + dynamic methods |
| Manual tax rate tables | Stripe Tax Calculations API | 2023+ | Automatic EU VAT rates, OSS reporting, no manual rate maintenance |
| Separate 3DS integration | Automatic SCA via Payment Intents | 2019+ | Stripe handles 3DS challenges automatically, no custom code needed |
| Stripe coupons on Payment Intents | Server-side coupon + intent amount adjustment | Current | Stripe coupons only work with Checkout Sessions; for Payment Intents, adjust amount server-side |
| Manual tax transaction tracking | `hooks.inputs.tax.calculation` on Payment Intent | Late 2025 | Automatic tax transaction commitment when Payment Intent succeeds |

**Deprecated/outdated:**
- `PaymentRequestButtonElement`: Replaced by `ExpressCheckoutElement` (migration guide available)
- `CardElement` / `CardNumberElement`: Replaced by `PaymentElement` for new integrations
- Client-side Stripe.js v2 (`Stripe.card.createToken`): Long deprecated, use Elements

## Open Questions

1. **Apple Pay domain verification in development**
   - What we know: Apple Pay requires a domain association file at `/.well-known/apple-developer-merchantid-domain-association`. In development/test mode, this may not be needed.
   - What's unclear: Exact behavior in Stripe test mode on localhost
   - Recommendation: Build the Express Checkout Element, test with mock data in dev. Domain verification is a deployment concern for staging/production.

2. **Stripe Tax with IP geolocation accuracy**
   - What we know: Stripe Tax can use customer IP for location. For EU VAT, the customer's country determines the rate.
   - What's unclear: How accurate IP geolocation is for VPN users, and whether Stripe allows `country: 'auto'` or requires explicit address
   - Recommendation: Use IP-based for initial estimate, allow customer to select country if needed. For v1, IP-based is sufficient for most EU customers.

3. **PayPal redirect UX in single-page checkout**
   - What we know: PayPal via Stripe redirects user to PayPal, then back to return_url
   - What's unclear: Whether this breaks the "single page" experience feeling
   - Recommendation: PayPal redirect is standard UX that all PayPal users expect. The return_url should be the success page. This is acceptable.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.4 + jsdom |
| Config file | `vitest.config.ts` (exists) |
| Quick run command | `npm test` (vitest run) |
| Full suite command | `npm test` |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| CHK-01 | Guest checkout creates order with email only | unit | `npx vitest run src/lib/checkout/__tests__/pricing.test.ts -t "guest"` | No - Wave 0 |
| CHK-02 | Express Checkout Element renders wallet buttons | unit | `npx vitest run src/components/checkout/__tests__/express-checkout.test.ts` | No - Wave 0 |
| CHK-03 | PayPal payment method included in Element config | unit | `npx vitest run src/components/checkout/__tests__/express-checkout.test.ts -t "paypal"` | No - Wave 0 |
| CHK-04 | Coupon STUDENT30 applies 30% discount correctly | unit | `npx vitest run src/lib/checkout/__tests__/coupons.test.ts` | No - Wave 0 |
| CHK-05 | Tax calculation returns correct VAT breakdown | unit | `npx vitest run src/lib/checkout/__tests__/tax.test.ts` | No - Wave 0 |
| INF-05 | Payment Intent created with 3DS and Radar config | unit | `npx vitest run src/app/api/checkout/__tests__/create-intent.test.ts` | No - Wave 0 |

### Sampling Rate
- **Per task commit:** `npm test`
- **Per wave merge:** `npm test`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `src/lib/checkout/__tests__/pricing.test.ts` -- covers CHK-01 (price calculation, guest order)
- [ ] `src/lib/checkout/__tests__/coupons.test.ts` -- covers CHK-04 (coupon validation, discount math)
- [ ] `src/lib/checkout/__tests__/tax.test.ts` -- covers CHK-05 (mock tax calculation)
- [ ] `src/components/checkout/__tests__/express-checkout.test.ts` -- covers CHK-02, CHK-03
- [ ] `src/app/api/checkout/__tests__/create-intent.test.ts` -- covers INF-05
- [ ] `src/stores/__tests__/checkout.test.ts` -- checkout store state transitions

## Sources

### Primary (HIGH confidence)
- [Stripe Payment Element docs](https://docs.stripe.com/payments/payment-element) -- Element setup, appearance, layout options
- [Stripe Express Checkout Element docs](https://docs.stripe.com/elements/express-checkout-element) -- Apple Pay, Google Pay, PayPal via single element
- [Stripe Tax with Payment Intents](https://docs.stripe.com/tax/payment-intent) -- `hooks.inputs.tax.calculation` parameter, automatic tax transactions
- [Stripe PayPal payments](https://docs.stripe.com/payments/paypal/accept-a-payment) -- PayPal via Stripe, supported currencies (EUR included)
- [Stripe 3D Secure authentication](https://docs.stripe.com/payments/3d-secure) -- Automatic SCA handling
- [Stripe Radar fraud rules](https://docs.stripe.com/radar/rules) -- Request 3DS rules, block rules
- [Stripe Coupons API limitation](https://support.stripe.com/questions/support-for-coupons-using-payment-intents-api) -- Coupons NOT supported with Payment Intents
- [React Stripe.js reference](https://docs.stripe.com/sdks/stripejs-react) -- React component API

### Secondary (MEDIUM confidence)
- [Payment Element vs Card Element comparison](https://docs.stripe.com/payments/payment-card-element-comparison) -- Migration guidance, feature comparison
- [Stripe Tax EU documentation](https://docs.stripe.com/tax/supported-countries/european-union) -- EU VAT rates, OSS scheme support
- npm registry version checks (2026-04-21) -- Package version verification

### Tertiary (LOW confidence)
- [Stripe + Next.js 2026 guide (DEV Community)](https://dev.to/sameer_saleem/the-ultimate-guide-to-stripe-nextjs-2026-edition-2f33) -- Community patterns, needs verification against official docs

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- Stripe packages verified against npm, official docs consulted
- Architecture: HIGH -- Pattern follows official Stripe documentation for embedded Elements with Payment Intents
- Pitfalls: HIGH -- Based on well-documented Stripe integration issues and official migration guides
- Coupon approach: HIGH -- Confirmed via Stripe support that coupons don't work with Payment Intents; server-side calculation is the documented workaround
- Tax integration: MEDIUM -- `hooks.inputs.tax.calculation` is a newer API (late 2025); verified via Stripe docs but limited community examples

**Research date:** 2026-04-21
**Valid until:** 2026-05-21 (Stripe APIs are stable; 30-day validity)
