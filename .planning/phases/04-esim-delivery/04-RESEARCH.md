# Phase 4: eSIM Delivery - Research

**Researched:** 2026-04-21
**Domain:** Post-payment eSIM provisioning, QR code delivery, email delivery, device setup guides
**Confidence:** HIGH

## Summary

Phase 4 transforms the existing success page into a full delivery experience. After payment confirmation, the system provisions an eSIM via the CELITECH wholesale API (synchronous on success page load with webhook safety net), delivers activation credentials with smart device detection (install link on mobile, QR code on desktop), sends a branded email backup via Resend + React Email, and provides device-specific setup guides (iOS, Samsung, Pixel).

The existing codebase has strong foundations: `ESIMProvider` interface with `purchase()` method, `NormalizedPurchase` type with all needed fields (iccid, activationQrBase64, manualActivationCode, iosActivationLink, androidActivationLink), the success page at `/checkout/success` ready for transformation, Bambu pose components (success, loading, error), and a well-established mock mode pattern (`STRIPE_MOCK_MODE`). The main gaps are: no webhook infrastructure, no email infrastructure, no encryption utilities, and no QR code server-side generation.

**Primary recommendation:** Build in three waves: (1) webhook handler + provisioning API + mock mode, (2) success page transformation with smart device detection and setup guides, (3) Resend + React Email integration for branded delivery email.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **Delivery page**: Transform existing `/checkout/success` URL -- celebration animation morphs into delivery content once provisioning completes. No separate route.
- **Smart device default**: Detect mobile vs desktop. Mobile: big "Install eSIM" button (direct link via iosActivationLink/androidActivationLink). Desktop: show QR code prominently.
- **Bambu preparing animation**: Bambu "wrapping/preparing" the eSIM with progress messages while provisioning runs. Transitions to delivery content when ready.
- **Session-only re-access + email backup**: Delivery page works during browser session. After that, user relies on email. Accounts (Phase 5) add permanent access later.
- **Three device families**: iOS, Samsung, Pixel/stock Android.
- **Text steps with icons**: Numbered text instructions with small icons for each action.
- **Expandable setup guide section**: "Need help setting up?" collapsible below install button. Auto-detected device family steps.
- **Single email after provisioning**: One email with everything -- QR code image + SM-DP+ address and activation code as copyable text + order receipt + link to setup guide on website.
- **Resend for email**: React Email for branded templates.
- **Branded with Bambu**: eSIM Panda header, brand colors (#2979FF accent), Bambu mascot graphic, styled receipt layout.
- **From name**: "eSIM Panda" <noreply@esimpanda.com>
- **Subtle referral footer**: Small "Know someone traveling? Share eSIM Panda" link in email footer.
- **Synchronous provisioning on success page**: When success page loads with payment_intent, calls API that provisions eSIM in real-time. User waits 3-10s with Bambu animation.
- **Polling for status**: Success page polls API every 2-3 seconds to check provisioning status.
- **Stripe webhook safety net**: Webhook listens for payment_intent.succeeded. If no eSIM provisioned within 60s, webhook triggers provisioning.
- **Auto-retry on failure**: Retry provisioning 3 times. If still fails, show Bambu error with "We're working on it" message + WhatsApp support link.
- **Encrypted QR storage**: Activation data stored encrypted in orders table (AES-256). Decrypt on-demand when displaying.
- **Orders table update**: Add esim_iccid, esim_qr_encrypted, esim_status, esim_activation_code, esim_smdp_address columns to existing orders table.
- **Mock mode**: Simulate 3-5 second provisioning delay, return mock QR code base64, fake activation codes, and mock install links.

### Claude's Discretion
- Exact Bambu "preparing" animation design (wrapping, dancing, etc.)
- QR code generation library choice
- Polling interval fine-tuning (2s vs 3s)
- Exact email template layout and spacing
- Setup guide icon selection
- Encryption key management approach
- Mock data content (fake QR codes, activation codes)
- Mobile vs desktop detection method (user-agent, screen size, or feature detection)

### Deferred Ideas (OUT OF SCOPE)
- Permanent eSIM page with account access -- Phase 5 (accounts) + Phase 6 (management)
- Full referral program in email -- Phase 8 (subtle footer link included now)
- Push notification when eSIM is ready -- Phase 9 (PWA)
- Multiple email templates (confirmation, delivery, expiry warning) -- Phase 6+
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| DEL-01 | User receives QR code on-screen immediately after successful payment | Synchronous provisioning API + polling pattern + qrcode.react for client-side rendering + qrcode for server-side generation for email |
| DEL-02 | User receives QR code backup via email | Resend + React Email integration with inline QR image + SM-DP+ text fallback |
| DEL-03 | User sees device-specific setup guide (step-by-step for their device model) | Device family detection via user-agent + static setup guide data for iOS/Samsung/Pixel |
| INF-03 | Stripe webhook handlers for payment confirmation and eSIM provisioning | Stripe webhook signature verification + idempotent handler + safety net provisioning |
| INF-04 | QR codes stored encrypted with on-demand generation | Node.js crypto AES-256-GCM field-level encryption + secure key management via env vars |
</phase_requirements>

## Standard Stack

### Core (New for Phase 4)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| resend | 6.12.2 | Transactional email delivery | Modern API, React Email native support, generous free tier (100/day). Locked decision. |
| @react-email/components | 1.0.12 | Email template components | JSX-based email templates with pre-built components (Container, Section, Img, Text, Button, Hr). Industry standard for React projects. |
| qrcode | 1.5.4 | Server-side QR code generation | Generate QR code as base64 PNG for email embedding. Node.js native, no canvas dependency on server. |

### Already Installed (Reuse)
| Library | Version | Purpose | Reuse For |
|---------|---------|---------|-----------|
| qrcode.react | 4.2.0 | Client-side QR rendering | Display QR code on delivery page (desktop view) |
| stripe | 22.0.2 | Stripe SDK server-side | Webhook signature verification, payment intent retrieval |
| zod | 4.3.6 | Schema validation | Webhook payload validation, provisioning API schemas |
| motion | 12.38.0 | Animations | Bambu preparing animation, delivery content transitions |
| sonner | 2.0.7 | Toast notifications | Error messages, copy-to-clipboard confirmations |
| zustand | 5.0.12 | Client state | Delivery page state machine (preparing/ready/error) |
| next-intl | 4.9.1 | i18n | All delivery page and email translation keys |
| Node.js crypto | built-in | AES-256 encryption | Field-level encryption for activation data. No external library needed. |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| qrcode (server) | sharp + QR generation | qrcode is simpler, dedicated purpose, no image processing overhead |
| Node.js crypto | crypto-js | crypto-js is slower and unnecessary -- Node.js built-in crypto supports AES-256-GCM natively |
| Resend | SendGrid | Resend has React Email native integration, simpler API, better DX. Locked decision. |
| User-agent detection | Screen size media query | User-agent is more reliable for mobile OS detection (need to know iOS vs Android specifically for install links) |

**Installation:**
```bash
npm install resend @react-email/components qrcode @types/qrcode
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── app/api/
│   ├── webhooks/
│   │   └── stripe/route.ts          # Stripe webhook handler
│   ├── delivery/
│   │   ├── provision/route.ts        # Trigger eSIM provisioning (called by success page)
│   │   └── status/route.ts           # Poll provisioning status
│   └── ...existing checkout routes
├── lib/
│   ├── delivery/
│   │   ├── provision.ts              # Core provisioning logic (shared by API + webhook)
│   │   ├── encryption.ts             # AES-256-GCM encrypt/decrypt utilities
│   │   ├── schemas.ts                # Zod schemas for delivery APIs
│   │   └── types.ts                  # Delivery-specific types
│   ├── email/
│   │   ├── send-delivery.ts          # Resend send function
│   │   └── templates/
│   │       └── delivery-email.tsx    # React Email template
│   └── mock-data/
│       └── delivery.ts               # Mock provisioning data
├── components/
│   ├── delivery/
│   │   ├── delivery-page.tsx         # Main delivery orchestrator (replaces payment-success)
│   │   ├── provisioning-state.tsx    # Bambu preparing animation + polling
│   │   ├── esim-credentials.tsx      # QR code / install link display
│   │   ├── setup-guide.tsx           # Expandable device setup instructions
│   │   └── device-detection.ts       # Mobile/desktop/OS detection utility
│   └── bambu/
│       └── bambu-preparing.tsx       # New Bambu pose for eSIM preparation
└── data/
    └── setup-guides.ts               # Static setup guide content (iOS, Samsung, Pixel)
```

### Pattern 1: Synchronous Provisioning with Polling
**What:** Success page triggers provisioning on load, polls for completion.
**When to use:** Primary delivery path -- user is on the page waiting.

```typescript
// POST /api/delivery/provision
// Called by success page with payment_intent ID
// 1. Verify payment_intent is valid and paid (mock mode: skip)
// 2. Check idempotency: if order already has esim_status != null, return existing
// 3. Call ESIMProvider.purchase()
// 4. Encrypt activation data with AES-256-GCM
// 5. Store encrypted data in orders table
// 6. Send delivery email via Resend
// 7. Return provisioning result

// GET /api/delivery/status?payment_intent=pi_xxx
// Returns current provisioning status for polling
// { status: 'pending' | 'provisioning' | 'ready' | 'failed', data?: DeliveryData }
```

### Pattern 2: Webhook Safety Net
**What:** Stripe webhook catches payments where user closed browser before provisioning.
**When to use:** Automatic -- runs for every payment_intent.succeeded event.

```typescript
// POST /api/webhooks/stripe
// 1. Verify stripe signature (CRITICAL)
// 2. Parse event, switch on event.type
// 3. For payment_intent.succeeded:
//    a. Look up order by stripe_payment_intent_id
//    b. If esim_status is already 'provisioned' or 'delivered', return 200 (idempotent)
//    c. If esim_status is null/pending, wait 60s (use setTimeout or check timestamp)
//    d. If still not provisioned after 60s, trigger provisioning
// 4. Return 200 quickly (< 20s)
```

**IMPORTANT:** The webhook should NOT block for 60 seconds. Instead, check if provisioning was done by the success page API. If the order already has `esim_status = 'provisioned'`, skip. The 60s delay is handled by Stripe's webhook retry schedule -- first retry is ~1 minute after initial. On first webhook delivery, if not provisioned yet, provision immediately (the success page API and webhook are racing -- idempotency prevents duplicates).

### Pattern 3: Idempotent Provisioning
**What:** Core provisioning function that can be called multiple times safely.
**When to use:** Both the success page API and webhook call this same function.

```typescript
// lib/delivery/provision.ts
export async function provisionEsim(paymentIntentId: string): Promise<ProvisionResult> {
  // 1. Find order by payment_intent_id
  // 2. If order.esim_status === 'provisioned' || 'delivered', return existing data
  // 3. Set order.esim_status = 'provisioning' (optimistic lock)
  // 4. Call ESIMProvider.purchase(order.wholesale_plan_id, 1)
  // 5. Encrypt activation data
  // 6. Update order with encrypted eSIM data, set esim_status = 'provisioned'
  // 7. Send delivery email
  // 8. Set esim_status = 'delivered'
  // 9. Return decrypted delivery data for display
}
```

### Pattern 4: AES-256-GCM Field-Level Encryption
**What:** Encrypt sensitive eSIM activation data before storing in database.
**When to use:** All writes of activation_code, smdp_address, qr_code data to orders table.

```typescript
// lib/delivery/encryption.ts
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const KEY = Buffer.from(process.env.ESIM_ENCRYPTION_KEY!, 'hex'); // 32 bytes

export function encrypt(plaintext: string): string {
  const iv = randomBytes(16);
  const cipher = createCipheriv(ALGORITHM, KEY, iv);
  let encrypted = cipher.update(plaintext, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');
  // Store as iv:authTag:ciphertext
  return `${iv.toString('hex')}:${authTag}:${encrypted}`;
}

export function decrypt(encryptedData: string): string {
  const [ivHex, authTagHex, ciphertext] = encryptedData.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  const decipher = createDecipheriv(ALGORITHM, KEY, iv);
  decipher.setAuthTag(authTag);
  let decrypted = decipher.update(ciphertext, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}
```

**Key management:** Generate a 32-byte hex key via `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` and store as `ESIM_ENCRYPTION_KEY` env variable. AES-256-GCM provides both confidentiality and integrity (authenticated encryption).

### Pattern 5: Device Detection for Smart Delivery
**What:** Detect mobile vs desktop and specific OS for install link routing.
**When to use:** On delivery page to choose between QR code (desktop) or install button (mobile).

```typescript
// components/delivery/device-detection.ts
export type DeviceFamily = 'ios' | 'samsung' | 'pixel' | 'android-other' | 'desktop';

export function detectDeviceFamily(userAgent: string): DeviceFamily {
  const ua = userAgent.toLowerCase();
  if (/iphone|ipad/.test(ua)) return 'ios';
  if (/samsung/.test(ua)) return 'samsung';
  if (/pixel/.test(ua)) return 'pixel';
  if (/android/.test(ua)) return 'android-other';
  return 'desktop';
}

export function isMobile(userAgent: string): boolean {
  return /android|iphone|ipad|mobile/i.test(userAgent);
}
```

**Why user-agent over screen size:** We need to know the specific OS (iOS vs Android) to provide the correct install link (`iosActivationLink` vs `androidActivationLink`). Screen size alone cannot determine this. Use `navigator.userAgent` client-side.

### Anti-Patterns to Avoid
- **Provisioning before payment verification:** Never call the wholesale API until payment is confirmed server-side. The success page API must verify the payment_intent status (or use mock mode).
- **Non-idempotent provisioning:** Both the success page API and webhook can trigger provisioning. Without idempotency, double-provisioning costs real money.
- **Blocking webhook response for provisioning:** Stripe times out webhooks after 20 seconds. Provision asynchronously or accept-and-process.
- **Storing encryption key in code:** Key MUST be in environment variable, never committed.
- **Generating QR images and storing them:** Store activation data, generate QR on-demand. Less storage, more secure, flexible sizing.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| QR code generation (server) | Canvas-based QR rendering | `qrcode` npm package `toDataURL()` | Handles error correction, sizing, encoding edge cases |
| QR code display (client) | Custom canvas rendering | `qrcode.react` (already installed) | React component, responsive, accessible |
| Email HTML | Raw HTML tables | `@react-email/components` | Email client compatibility is a minefield -- Img, Container, Section, Button all handle quirks |
| Email delivery | SMTP/Nodemailer | `resend` | Deliverability, SPF/DKIM, analytics, bounce handling |
| Encryption | Custom cipher implementation | Node.js built-in `crypto` with AES-256-GCM | Battle-tested, authenticated encryption prevents tampering |
| Webhook signature verification | Manual HMAC comparison | `stripe.webhooks.constructEvent()` | Handles timing-safe comparison, payload reconstruction |

**Key insight:** The eSIM activation data pipeline (encrypt, store, decrypt, generate QR, embed in email) has many failure modes. Each step should use proven libraries, not custom implementations.

## Common Pitfalls

### Pitfall 1: Webhook Raw Body Parsing in Next.js App Router
**What goes wrong:** Stripe signature verification fails because Next.js parses the request body as JSON before you can access the raw buffer.
**Why it happens:** `stripe.webhooks.constructEvent()` needs the raw request body (string/buffer), not parsed JSON.
**How to avoid:** In Next.js App Router, read the raw body with `await request.text()` before any JSON parsing. Do NOT use `await request.json()`.
**Warning signs:** Webhook signature verification always fails in production but works in development.

```typescript
// CORRECT for Next.js App Router
export async function POST(request: Request) {
  const body = await request.text(); // RAW body, not .json()
  const sig = request.headers.get('stripe-signature')!;
  const event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
}
```

### Pitfall 2: Race Condition Between Success Page and Webhook
**What goes wrong:** Both the success page API and webhook try to provision simultaneously, causing double eSIM purchase.
**Why it happens:** Stripe sends the webhook nearly instantly when payment succeeds, and the success page API also fires on page load.
**How to avoid:** Use database-level locking. Set `esim_status = 'provisioning'` with a conditional update (`WHERE esim_status IS NULL OR esim_status = 'pending'`). If the update affects 0 rows, another process is already provisioning.
**Warning signs:** Occasional duplicate ICCID entries in database.

### Pitfall 3: Email Image Blocking
**What goes wrong:** QR code in email is invisible because email client blocks images by default.
**Why it happens:** Gmail, Outlook, and others block external images and sometimes inline images by default.
**How to avoid:** Always include SM-DP+ address and activation code as copyable TEXT below the QR image. The text is the fallback -- QR is convenience.
**Warning signs:** Support requests from users who "can't see the QR code in email."

### Pitfall 4: Mock Mode Forgetting to Simulate Delays
**What goes wrong:** Delivery UI works perfectly in mock mode but breaks with real API because it doesn't handle loading states.
**Why it happens:** Mock mode returns instantly, real CELITECH API takes 3-10 seconds.
**How to avoid:** Mock provisioning MUST include a `setTimeout` delay of 3-5 seconds to simulate real API latency. Test the full loading/animation flow.
**Warning signs:** Bambu preparing animation never visible in development.

### Pitfall 5: QR Code Data URL Too Large for Email
**What goes wrong:** Base64 QR code data URL is too large for some email clients or gets stripped.
**Why it happens:** Data URLs in emails have mixed support across clients.
**How to avoid:** For email: generate QR as PNG buffer server-side using `qrcode`, then use it as a CID (Content-ID) inline attachment via Resend's attachment API, or host the QR image at a URL and reference with `<Img>`. For on-screen: use `qrcode.react` client-side (no size issues).
**Warning signs:** QR code shows in Gmail but not Apple Mail, or vice versa.

### Pitfall 6: Not Verifying Payment Before Provisioning
**What goes wrong:** Someone navigates to `/checkout/success?payment_intent=pi_fake` and gets a free eSIM.
**Why it happens:** Success page trusts the URL parameter without server-side verification.
**How to avoid:** The provisioning API MUST verify the payment_intent status via Stripe API (`stripe.paymentIntents.retrieve(id)` and check `status === 'succeeded'`). In mock mode, accept any `pi_mock_*` prefix.
**Warning signs:** Fraudulent orders with no Stripe payment record.

## Code Examples

### Stripe Webhook Handler (Next.js App Router)
```typescript
// src/app/api/webhooks/stripe/route.ts
import { NextResponse } from 'next/server';
import { getStripeServer } from '@/lib/stripe/server';
import { provisionEsim } from '@/lib/delivery/provision';

export async function POST(request: Request) {
  const body = await request.text();
  const sig = request.headers.get('stripe-signature');

  if (!sig) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  const stripe = getStripeServer();
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  switch (event.type) {
    case 'payment_intent.succeeded': {
      const paymentIntent = event.data.object;
      // Safety net: provision if not already done by success page
      await provisionEsim(paymentIntent.id);
      break;
    }
  }

  return NextResponse.json({ received: true });
}
```

### React Email Template Structure
```tsx
// src/lib/email/templates/delivery-email.tsx
import {
  Html, Head, Body, Container, Section, Img, Text,
  Button, Hr, Link, Preview,
} from '@react-email/components';

interface DeliveryEmailProps {
  orderId: string;
  planName: string;
  destination: string;
  qrCodeUrl: string; // hosted URL or CID reference
  smdpAddress: string;
  activationCode: string;
  iosLink?: string;
  androidLink?: string;
  amountPaid: string;
  setupGuideUrl: string;
}

export function DeliveryEmail(props: DeliveryEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Your eSIM for {props.destination} is ready!</Preview>
      <Body style={{ backgroundColor: '#f6f9fc', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
        <Container style={{ maxWidth: '600px', margin: '0 auto' }}>
          {/* Header with Bambu logo */}
          {/* QR Code image */}
          {/* SM-DP+ address + activation code as text */}
          {/* Install links for mobile */}
          {/* Order receipt */}
          {/* Setup guide link */}
          {/* Referral footer */}
        </Container>
      </Body>
    </Html>
  );
}
```

### Resend Send Function
```typescript
// src/lib/email/send-delivery.ts
import { Resend } from 'resend';
import { DeliveryEmail } from './templates/delivery-email';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendDeliveryEmail(props: DeliveryEmailProps) {
  const { data, error } = await resend.emails.send({
    from: 'eSIM Panda <noreply@esimpanda.com>',
    to: props.email,
    subject: `Your eSIM for ${props.destination} is ready!`,
    react: DeliveryEmail(props),
  });

  if (error) {
    console.error('Failed to send delivery email:', error);
    throw error;
  }
  return data;
}
```

### Mock Provisioning Data
```typescript
// src/lib/mock-data/delivery.ts
export const MOCK_QR_BASE64 = 'data:image/png;base64,iVBORw0KGg...'; // small valid QR PNG
export const MOCK_ICCID = '8901234567890123456';
export const MOCK_SMDP_ADDRESS = 'smdp.example.com';
export const MOCK_ACTIVATION_CODE = 'K2-ABC123-DEF456';
export const MOCK_IOS_LINK = 'https://esimsetup.apple.com/esim_qrcode_provisioning?carddata=LPA:1$smdp.example.com$K2-ABC123-DEF456';
export const MOCK_ANDROID_LINK = 'LPA:1$smdp.example.com$K2-ABC123-DEF456';

export async function mockProvision(): Promise<NormalizedPurchase> {
  // Simulate 3-5 second API delay
  await new Promise(resolve => setTimeout(resolve, 3000 + Math.random() * 2000));
  return {
    iccid: MOCK_ICCID,
    activationQrBase64: MOCK_QR_BASE64,
    manualActivationCode: MOCK_ACTIVATION_CODE,
    iosActivationLink: MOCK_IOS_LINK,
    androidActivationLink: MOCK_ANDROID_LINK,
    status: 'active',
  };
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| SendGrid HTML templates | React Email + Resend | 2023-2024 | JSX templates, component reuse, local preview with `npx react-email dev` |
| AES-256-CBC | AES-256-GCM | Ongoing recommendation | GCM provides authenticated encryption (integrity + confidentiality) |
| Separate esims table | eSIM columns on orders table | Phase 4 decision | Simpler queries, single table for full purchase lifecycle. Separate `esims` table exists in schema but CONTEXT.md says add columns to orders |
| Full page reload for status | Client-side polling + state machine | Standard pattern | Smooth UX with animation transitions |

**Schema decision note:** The initial schema (00001) has a separate `esims` table. The CONTEXT.md decision says "add esim_* columns to existing orders table. Single table for full purchase lifecycle." This means we add columns to `orders` AND may still use the `esims` table for detailed eSIM data. The migration should add columns to `orders` for quick access (esim_iccid, esim_qr_encrypted, esim_status, esim_activation_code, esim_smdp_address) while the existing `esims` table holds the full record. For Phase 4, the orders table columns are the primary interface.

## Open Questions

1. **QR code in email: inline data URL vs hosted image vs CID attachment?**
   - What we know: Data URLs have inconsistent email client support. CID attachments are most reliable but increase email size. Hosted URLs require a public endpoint.
   - What's unclear: Which approach Resend handles best for React Email templates.
   - Recommendation: Use Resend's attachment API with CID reference (most reliable across email clients). Fall back to hosted URL if CID proves problematic. Always include text SM-DP+ code as fallback.

2. **Webhook 60-second delay implementation**
   - What we know: CONTEXT.md says "If no eSIM provisioned within 60s, webhook triggers provisioning."
   - What's unclear: On Vercel serverless functions, you cannot sleep for 60 seconds waiting.
   - Recommendation: Don't implement the delay explicitly. Instead: webhook handler checks if already provisioned (idempotent). If not, provisions immediately. The "safety net" behavior happens naturally because: (a) success page API provisions first in the normal case, (b) webhook arrives ~seconds later and finds it already done, (c) if user closed browser, webhook provisions on first delivery. Stripe's retry mechanism handles the edge case.

3. **Resend domain verification for noreply@esimpanda.com**
   - What we know: Resend requires domain verification (DNS records) to send from custom domain.
   - What's unclear: Whether esimpanda.com domain is configured for email.
   - Recommendation: Use Resend's default `onboarding@resend.dev` sender during development. Add domain verification as a pre-production task. Mock mode should skip email sending entirely.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.4 |
| Config file | `vitest.config.ts` (exists) |
| Quick run command | `npm test` |
| Full suite command | `npx vitest run --coverage` |

### Phase Requirements to Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| DEL-01 | Provisioning API returns QR data on valid payment_intent | unit | `npx vitest run src/lib/delivery/__tests__/provision.test.ts -t "provision"` | No -- Wave 0 |
| DEL-01 | Polling endpoint returns correct status | unit | `npx vitest run src/app/api/delivery/__tests__/status.test.ts` | No -- Wave 0 |
| DEL-02 | Delivery email sent with QR + receipt data | unit | `npx vitest run src/lib/email/__tests__/send-delivery.test.ts` | No -- Wave 0 |
| DEL-03 | Device detection returns correct family | unit | `npx vitest run src/components/delivery/__tests__/device-detection.test.ts` | No -- Wave 0 |
| DEL-03 | Setup guide content matches device family | unit | `npx vitest run src/data/__tests__/setup-guides.test.ts` | No -- Wave 0 |
| INF-03 | Webhook verifies signature and routes events | unit | `npx vitest run src/app/api/webhooks/__tests__/stripe.test.ts` | No -- Wave 0 |
| INF-03 | Idempotent provisioning prevents duplicates | unit | `npx vitest run src/lib/delivery/__tests__/provision.test.ts -t "idempotent"` | No -- Wave 0 |
| INF-04 | Encrypt/decrypt round-trip preserves data | unit | `npx vitest run src/lib/delivery/__tests__/encryption.test.ts` | No -- Wave 0 |

### Sampling Rate
- **Per task commit:** `npm test`
- **Per wave merge:** `npx vitest run --coverage`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `src/lib/delivery/__tests__/provision.test.ts` -- covers DEL-01, INF-03
- [ ] `src/lib/delivery/__tests__/encryption.test.ts` -- covers INF-04
- [ ] `src/app/api/webhooks/__tests__/stripe.test.ts` -- covers INF-03
- [ ] `src/app/api/delivery/__tests__/status.test.ts` -- covers DEL-01
- [ ] `src/lib/email/__tests__/send-delivery.test.ts` -- covers DEL-02
- [ ] `src/components/delivery/__tests__/device-detection.test.ts` -- covers DEL-03
- [ ] `src/data/__tests__/setup-guides.test.ts` -- covers DEL-03
- [ ] Framework install: `npm install resend @react-email/components qrcode @types/qrcode` -- new dependencies

## Sources

### Primary (HIGH confidence)
- Existing codebase: `src/lib/esim/provider.ts`, `src/lib/esim/types.ts`, `src/lib/esim/celitech-adapter.ts` -- ESIMProvider interface with purchase() method and NormalizedPurchase type
- Existing codebase: `supabase/migrations/00001_initial_schema.sql` -- orders and esims table schemas
- Existing codebase: `src/components/checkout/payment-success.tsx` -- current success page to transform
- Existing codebase: `src/lib/stripe/server.ts`, `src/lib/stripe/client.ts` -- Stripe server/client setup with mock mode pattern
- npm registry: resend@6.12.2, @react-email/components@1.0.12, qrcode@1.5.4 -- verified current versions

### Secondary (MEDIUM confidence)
- [Resend Next.js docs](https://resend.com/docs/send-with-nextjs) -- React Email integration pattern
- [Stripe webhook docs](https://docs.stripe.com/webhooks) -- Signature verification, event handling, retry behavior
- [Node.js crypto AES-256-GCM](https://dev.to/jobizil/encrypt-and-decrypt-data-in-nodejs-using-aes-256-cbc-2l6d) -- AES encryption pattern (adapted to GCM)
- [qrcode npm](https://www.npmjs.com/package/qrcode) -- Server-side QR code generation API

### Tertiary (LOW confidence)
- iOS eSIM activation link format (`esimsetup.apple.com/esim_qrcode_provisioning`) -- based on training data, needs verification against current Apple docs
- Android eSIM activation link format (`LPA:1$smdp$code`) -- based on training data, needs verification

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- all libraries verified against npm registry, Resend is a locked decision
- Architecture: HIGH -- patterns derived from existing codebase (provider abstraction, mock mode, Stripe server setup)
- Pitfalls: HIGH -- webhook raw body parsing and idempotency are well-documented issues with Next.js + Stripe
- Email delivery: MEDIUM -- React Email + Resend integration is standard but QR-in-email specifics need testing
- Device detection: MEDIUM -- user-agent parsing is reliable but eSIM activation link formats need verification

**Research date:** 2026-04-21
**Valid until:** 2026-05-21 (30 days -- stable domain, libraries are mature)
