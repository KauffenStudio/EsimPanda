# Architecture Patterns

**Domain:** eSIM Reseller Platform (digital goods marketplace with API-backed fulfillment)
**Researched:** 2026-04-19
**Overall confidence:** MEDIUM (based on training data knowledge of eSIM APIs and standard platform patterns; no live doc verification due to tool restrictions)

## Recommended Architecture

### High-Level System Diagram

```
                         +-------------------+
                         |   User (Browser)  |
                         +--------+----------+
                                  |
                                  v
                    +----------------------------+
                    |   Next.js App (Vercel)      |
                    |                            |
                    |  SSR Pages (SEO landing)   |
                    |  Client Components (SPA)   |
                    |  API Routes (/api/*)       |
                    +---+--------+--------+------+
                        |        |        |
               +--------+   +---+---+  +-+----------+
               |             |       |  |            |
               v             v       v  v            v
        +-----------+  +---------+ +--------+  +-----------+
        | Supabase  |  | Stripe  | | eSIM   |  | Resend /  |
        | (DB+Auth) |  | Payment | | Whole- |  | Email     |
        |           |  | Gateway | | sale   |  | Service   |
        +-----------+  +----+----+ | API    |  +-----------+
                            |      +---+----+
                            |          |
                   Webhooks |          | Webhooks
                            v          v
                    +-------------------+
                    | /api/webhooks/*   |
                    | (Next.js routes)  |
                    +-------------------+
```

### Architecture Style: Modular Monolith on Next.js

**Decision:** Single Next.js application with API routes acting as the backend. NOT a separate backend service.

**Why:**
- Digital goods marketplace with low write volume (purchases, not real-time streams)
- One developer / small team -- separate backend adds deployment complexity with no benefit
- Next.js API routes handle webhooks, Stripe callbacks, and wholesale API calls perfectly
- Vercel serverless functions scale automatically for traffic spikes
- SSR for SEO landing pages (destination pages need indexing) coexists with SPA-like checkout flow

**When to reconsider:** If you hit 10K+ daily orders and webhook processing needs dedicated workers, extract to a separate service. Not before.

## Component Boundaries

### 1. Catalog Service (read-heavy, cache-heavy)

| Aspect | Detail |
|--------|--------|
| **Responsibility** | Sync wholesale plans into local DB, serve browsable catalog to frontend |
| **Data source** | Wholesale API (CELITECH/eSIM Go/MobiMatter) |
| **Storage** | Supabase `destinations` + `plans` tables |
| **Caching** | ISR (Incremental Static Regeneration) on destination pages, 1-hour revalidation |
| **Communicates with** | Wholesale API (scheduled sync), Frontend (read), Pricing Engine |

**Key pattern:** Do NOT call the wholesale API on every page load. Sync catalog to your DB on a schedule (cron job every 1-6 hours via Vercel Cron or Supabase pg_cron). Serve from your own DB. This gives you:
- Control over pricing (apply markup)
- Resilience if wholesale API is down
- Ability to add metadata (descriptions, images, tags)
- Fast page loads

```
Wholesale API --[cron sync]--> Supabase plans table --[query]--> Next.js pages
```

### 2. Pricing Engine (compute layer, no persistence)

| Aspect | Detail |
|--------|--------|
| **Responsibility** | Calculate retail price from wholesale cost, apply discounts/coupons |
| **Logic location** | Server-side utility functions (NOT in DB, NOT in frontend) |
| **Communicates with** | Catalog Service (wholesale cost), Coupon System (discount %), Checkout |

**Pricing formula:**
```
retail_price = wholesale_cost * markup_multiplier
discounted_price = retail_price * (1 - discount_percentage)
final_price = max(discounted_price, wholesale_cost * 1.05)  // never sell below cost + 5%
```

**Why server-side only:** Prices must never be computed on the client. The client displays prices; the server validates them at checkout. This prevents price manipulation.

### 3. Authentication & User Accounts

| Aspect | Detail |
|--------|--------|
| **Responsibility** | User signup/login, session management, profile, order history |
| **Provider** | Supabase Auth (email + magic link, Google OAuth) |
| **Storage** | Supabase `auth.users` + public `profiles` table |
| **Communicates with** | All authenticated routes, Order Service, Referral System |

**Key decision:** Allow guest checkout. Do NOT force account creation before purchase. Capture email for QR delivery, create account lazily after purchase with a "save your eSIMs" prompt. This eliminates the biggest conversion killer in e-commerce.

**Flow:**
```
Guest: Browse -> Checkout (email required) -> Purchase -> "Create account to manage your eSIMs?"
Logged in: Browse -> Checkout (pre-filled) -> Purchase -> Dashboard
```

### 4. Checkout & Payment Service

| Aspect | Detail |
|--------|--------|
| **Responsibility** | Create Stripe Checkout Session, handle payment confirmation, trigger provisioning |
| **Provider** | Stripe Checkout (hosted) or Stripe Payment Intents (embedded) |
| **Communicates with** | Pricing Engine (validate price), Stripe API, Order Service, Webhook Handler |

**Recommended: Stripe Checkout (hosted page).** Why:
- Apple Pay, Google Pay, PayPal built-in with zero extra code
- PCI compliance handled entirely by Stripe
- Mobile-optimized out of the box
- Coupon/discount display handled by Stripe
- Reduces custom UI work significantly

**Alternative (Stripe Elements embedded):** More control over UI, but you must build Apple Pay / Google Pay integration yourself. Only choose this if the hosted checkout page truly cannot match your brand.

**Checkout flow:**
```
1. User selects plan + enters email
2. Frontend calls POST /api/checkout/create-session
3. Server validates plan exists, calculates price, applies coupon
4. Server creates Stripe Checkout Session with:
   - line_items (plan name, price)
   - metadata (plan_id, wholesale_plan_id, user_email, coupon_code)
   - success_url, cancel_url
5. Frontend redirects to Stripe Checkout
6. User pays (Apple Pay / card / PayPal)
7. Stripe sends checkout.session.completed webhook
8. Webhook handler triggers eSIM provisioning
```

### 5. Order Service & eSIM Provisioning (the critical path)

| Aspect | Detail |
|--------|--------|
| **Responsibility** | Create order record, call wholesale API to provision eSIM, store QR code, deliver to user |
| **Storage** | Supabase `orders` table, `esims` table |
| **Communicates with** | Stripe Webhooks (trigger), Wholesale API (provision), Email Service (deliver QR) |

**This is the most critical component.** It bridges payment confirmation to eSIM delivery.

**Order state machine:**
```
PENDING -> PAYMENT_CONFIRMED -> PROVISIONING -> PROVISIONED -> DELIVERED -> ACTIVE -> EXPIRED
                                     |
                                     v
                              PROVISION_FAILED -> REFUND_INITIATED -> REFUNDED
```

**Provisioning flow (detailed):**

```
Stripe webhook (checkout.session.completed)
    |
    v
1. Verify webhook signature (CRITICAL - prevents fake orders)
2. Check idempotency (has this session already been processed?)
3. Create order record: status = PAYMENT_CONFIRMED
4. Call wholesale API: purchase eSIM
    |
    +-- SUCCESS:
    |     - Store eSIM details (ICCID, QR code data, activation code)
    |     - Update order: status = PROVISIONED
    |     - Send email with QR code + setup guide link
    |     - Update order: status = DELIVERED
    |
    +-- FAILURE:
          - Log error with full context
          - Update order: status = PROVISION_FAILED
          - Queue for retry (max 3 attempts, exponential backoff)
          - If all retries fail: initiate Stripe refund
          - Notify admin (email/Slack)
```

**Wholesale API call pattern (typical for CELITECH/eSIM Go):**

```typescript
// Typical wholesale API endpoints (varies by provider):
// GET  /destinations          - List available countries
// GET  /packages?dest={iso}   - List plans for a destination
// POST /esim/purchase         - Buy an eSIM (returns ICCID + QR data)
// GET  /esim/{iccid}/usage    - Check data usage
// POST /esim/{iccid}/topup    - Add more data to existing eSIM
```

### 6. Webhook Handler System

| Aspect | Detail |
|--------|--------|
| **Responsibility** | Receive and process webhooks from Stripe and wholesale API |
| **Location** | Next.js API routes: `/api/webhooks/stripe`, `/api/webhooks/esim` |
| **Communicates with** | Order Service, Notification Service |

**Critical webhook design principles:**

1. **Idempotency:** Every webhook handler MUST be idempotent. Stripe and wholesale APIs will retry webhooks. Use the event ID or session ID as an idempotency key.

2. **Signature verification:** Always verify webhook signatures. Never trust payload without verification.

3. **Quick response:** Return 200 immediately, process asynchronously if needed. Stripe times out webhooks after 20 seconds.

4. **Ordered processing:** For Stripe, handle these events:
   - `checkout.session.completed` -- trigger provisioning
   - `payment_intent.payment_failed` -- update order status
   - `charge.refunded` -- update order status
   - `customer.subscription.*` -- if you add recurring plans later

5. **Wholesale API webhooks (if supported):**
   - eSIM activated (user installed and connected)
   - Data usage threshold reached
   - eSIM expired
   - Not all wholesale providers support webhooks -- may need polling

```
/api/webhooks/stripe    -- Stripe signature verification + event routing
/api/webhooks/esim      -- Wholesale provider webhook handling
```

### 7. QR Code Storage & Delivery

| Aspect | Detail |
|--------|--------|
| **Responsibility** | Store eSIM QR codes securely, deliver to user via multiple channels |
| **Storage** | Supabase Storage (private bucket) or encrypted field in `esims` table |
| **Delivery channels** | Email (primary), web dashboard (logged-in users), download link (one-time token) |

**Key decisions:**

- **Store QR data, not images.** The wholesale API returns activation data (SM-DP+ address + activation code). Generate QR images on-demand from this data. This is more secure and flexible.
- **Email delivery:** Send QR as inline image + manual activation code as text fallback. Some email clients block images.
- **Dashboard access:** Logged-in users can view/re-download QR codes for their purchased eSIMs.
- **Security:** QR codes are essentially bearer tokens for the eSIM. Treat them like passwords -- encrypted at rest, time-limited download links for guests.

### 8. Coupon & Discount System

| Aspect | Detail |
|--------|--------|
| **Responsibility** | Manage discount codes, validate at checkout, track usage |
| **Storage** | Supabase `coupons` table |
| **Communicates with** | Pricing Engine, Checkout Service, Stripe |

**Two approaches:**

**Recommended: Stripe Coupons + local validation.** Use Stripe's built-in coupon/promotion code system. This keeps pricing consistent between your DB and Stripe's charge amount.

```
coupons table:
  - id, code, type (percentage/fixed), value, 
  - max_uses, current_uses, 
  - valid_from, valid_until,
  - min_purchase_amount,
  - applicable_plans (null = all),
  - stripe_coupon_id (synced with Stripe)
```

**Flow:**
```
1. User enters coupon code at checkout
2. POST /api/coupons/validate -- check code exists, not expired, not maxed out
3. Return discount amount to frontend (display updated price)
4. At checkout session creation, attach Stripe coupon to session
5. Stripe handles the actual discounted charge
6. On successful payment, increment coupon usage count
```

**Student discount (30%):** Create a permanent coupon code (e.g., "STUDENT30") with high max_uses. For verification, start with honor system (anyone can use it). Later, integrate student verification (email domain check, or services like UNiDAYS/Student Beans).

### 9. Usage Tracking & eSIM Management

| Aspect | Detail |
|--------|--------|
| **Responsibility** | Show users their data usage, eSIM status, expiry |
| **Data source** | Wholesale API (polled) or webhooks |
| **Storage** | Supabase `esim_usage` table (cached readings) |
| **Communicates with** | Wholesale API, Frontend Dashboard |

**Pattern: Poll and cache, NOT real-time.**

Most wholesale APIs provide usage data with a delay (minutes to hours). Real-time usage is not feasible or necessary.

```
1. When user opens dashboard: check last cached reading
2. If stale (>15 min old): call wholesale API for fresh usage
3. Cache new reading in esim_usage table
4. Display to user with "last updated X minutes ago" label
5. Background job (cron): update usage for all active eSIMs every 30 min
```

**Top-up flow:**
```
1. User clicks "Add Data" on active eSIM
2. Show available top-up packages for that eSIM's destination
3. Same checkout flow as initial purchase
4. On payment confirmed: call wholesale API top-up endpoint
5. Update eSIM record with new data allowance
```

### 10. Notification Service

| Aspect | Detail |
|--------|--------|
| **Responsibility** | Send transactional emails (QR delivery, usage alerts, expiry warnings) |
| **Provider** | Resend (recommended) or SendGrid |
| **Communicates with** | Order Service, Usage Tracking, Cron Jobs |

**Emails to send:**
- Purchase confirmation + QR code (immediate)
- Setup guide link (immediate, same email or follow-up)
- 80% data usage warning
- 24 hours before expiry warning
- eSIM expired + "buy another" CTA
- Referral credit earned

### 11. SEO & Landing Pages

| Aspect | Detail |
|--------|--------|
| **Responsibility** | Destination-specific landing pages optimized for organic search |
| **Pattern** | SSR/ISR pages generated from destination catalog |
| **Route** | `/esim/[country-slug]` (e.g., `/esim/portugal`, `/esim/france`) |

**Why SSR matters here:** "buy eSIM [country]" is the primary search query. These pages MUST be server-rendered with proper meta tags, structured data, and fast load times.

## Data Flow: End-to-End Purchase

```
USER                    NEXT.JS                   STRIPE              WHOLESALE API
 |                         |                         |                      |
 |-- Browse /esim/france ->|                         |                      |
 |<- SSR page (from DB) ---|                         |                      |
 |                         |                         |                      |
 |-- Select plan --------->|                         |                      |
 |-- Enter email --------->|                         |                      |
 |-- Apply coupon -------->|                         |                      |
 |                         |-- Validate coupon ----->|                      |
 |                         |-- Create checkout ----->|                      |
 |                         |<- Session URL ----------|                      |
 |<- Redirect to Stripe ---|                         |                      |
 |                         |                         |                      |
 |-- Pay (Apple Pay) -------------------------------->|                     |
 |                         |                         |                      |
 |                         |<- Webhook: paid --------|                      |
 |                         |-- Verify signature ---->|                      |
 |                         |-- Create order (DB) --->|                      |
 |                         |                         |     -- Purchase eSIM->|
 |                         |                         |     <-- ICCID + QR --|
 |                         |-- Store eSIM data ----->|                      |
 |                         |-- Send QR email ------->|                      |
 |<- Redirect to success --|                         |                      |
 |                         |                         |                      |
 |-- Open email ---------->|                         |                      |
 |-- Scan QR code -------->|  (device activates eSIM on carrier network)   |
```

## Database Schema (Core Tables)

```sql
-- Catalog (synced from wholesale)
destinations (id, name, slug, iso_code, region, image_url, is_active, updated_at)
plans (id, destination_id, wholesale_plan_id, name, data_gb, duration_days, 
       wholesale_price, retail_price, currency, is_active, updated_at)

-- Users (extends Supabase Auth)
profiles (id [FK auth.users], email, full_name, referral_code, referral_credits, 
          created_at)

-- Orders
orders (id, user_id [nullable for guests], email, plan_id, 
        stripe_session_id, stripe_payment_intent_id,
        amount_paid, currency, coupon_id, discount_amount,
        status [enum], created_at, updated_at)

-- eSIMs
esims (id, order_id, iccid, wholesale_esim_id, 
       activation_code_encrypted, smdp_address,
       status [enum], data_total_gb, data_used_gb,
       activated_at, expires_at, last_usage_check, created_at)

-- Coupons
coupons (id, code, type, value, max_uses, current_uses,
         valid_from, valid_until, stripe_coupon_id, is_active, created_at)

-- Referrals
referrals (id, referrer_id, referred_email, order_id, credit_amount, 
           status, created_at)
```

## Suggested Build Order (dependency-driven)

### Phase 1: Foundation (no external dependencies)
- Next.js project setup with TypeScript
- Supabase project + database schema
- Supabase Auth (email magic link)
- Basic layout + navigation components
- Tailwind CSS + design system tokens

**Rationale:** Everything else depends on DB schema and auth being in place.

### Phase 2: Catalog + Landing Pages
- Wholesale API integration (read-only: list destinations + plans)
- Catalog sync job (cron)
- Destination pages with SSR/ISR (`/esim/[slug]`)
- Plan selection UI
- Pricing engine (markup calculation)

**Rationale:** Users need to browse before they buy. This also validates wholesale API integration early. Landing pages provide SEO value from day one.

### Phase 3: Checkout + Payment + Provisioning
- Stripe integration (Checkout Sessions)
- Webhook handler (stripe + signature verification)
- Order service + state machine
- eSIM provisioning (wholesale API purchase call)
- QR code storage + email delivery (Resend)
- Success/failure pages

**Rationale:** This is the core revenue path. Cannot be built without catalog (Phase 2). Most complex phase -- needs careful error handling.

### Phase 4: User Dashboard + eSIM Management
- User profile pages
- Order history
- Active eSIMs view
- Usage tracking (poll wholesale API)
- Top-up flow
- Device setup guides

**Rationale:** Depends on orders existing (Phase 3). Important for retention but not for first sale.

### Phase 5: Growth Features
- Coupon/discount system
- Referral program
- Usage alert emails (cron-based)
- Expiry warning emails

**Rationale:** Nice-to-haves that improve metrics. Student discount coupon is simple enough to ship in Phase 3 as a hardcoded Stripe coupon, then formalize in Phase 5.

### Phase 6: Polish + Scale
- PWA support
- Performance optimization
- Error monitoring (Sentry)
- Analytics (PostHog / Vercel Analytics)
- A/B testing on checkout flow

## Key Architectural Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| App framework | Next.js (App Router) | SSR for SEO + API routes for backend + React for SPA-like UX |
| Backend | Next.js API Routes (no separate service) | Low complexity, sufficient for expected volume, deploy as one unit |
| Database | Supabase (PostgreSQL) | Auth + DB + Storage in one, generous free tier, good DX |
| Payments | Stripe Checkout (hosted) | Apple Pay/Google Pay/PayPal out of the box, PCI compliant |
| Auth | Supabase Auth | Already using Supabase, magic link is frictionless |
| Email | Resend | Modern API, React Email templates, good deliverability |
| Hosting | Vercel | Native Next.js support, edge functions, cron jobs |
| Catalog strategy | Sync to local DB (NOT live proxy) | Resilience, speed, price control |
| QR storage | Encrypted activation data in DB (generate QR on-demand) | More secure than storing image files |
| Guest checkout | Yes, account creation optional | Maximizes conversion rate |
| Pricing | Server-side only, validated at webhook | Prevents client-side price manipulation |

## Anti-Patterns to Avoid

### Anti-Pattern 1: Calling Wholesale API at Page Load
**What:** Making API calls to the wholesale provider every time a user visits a destination page.
**Why bad:** Slow pages, API rate limits, single point of failure for browsing.
**Instead:** Sync catalog to your DB on a schedule. Serve from your own data.

### Anti-Pattern 2: Provisioning Before Payment Confirmation
**What:** Calling the wholesale API to buy an eSIM before Stripe confirms payment.
**Why bad:** Chargebacks leave you paying wholesale cost with no revenue.
**Instead:** Only provision after webhook confirms payment. Never trust client-side "payment success."

### Anti-Pattern 3: Trusting Client-Side Prices
**What:** Accepting the price the frontend sends to create a checkout session.
**Why bad:** Users can modify requests to pay less.
**Instead:** Server looks up plan by ID, calculates price from DB, ignores any client-sent price.

### Anti-Pattern 4: Storing QR Codes in Plain Text
**What:** Storing eSIM activation codes unencrypted in the database.
**Why bad:** Database breach = all eSIMs stolen.
**Instead:** Encrypt activation data at rest. Use field-level encryption or Supabase Vault.

### Anti-Pattern 5: No Idempotency on Webhooks
**What:** Processing the same Stripe webhook event twice, resulting in duplicate eSIM purchases.
**Why bad:** You pay wholesale twice, deliver two eSIMs, customer charged once.
**Instead:** Store processed event IDs. Check before processing. Use database transactions.

### Anti-Pattern 6: Blocking Webhook Response for Provisioning
**What:** Calling the wholesale API synchronously inside the webhook handler before responding 200.
**Why bad:** Wholesale API may be slow. Stripe times out at 20s, retries, you process twice.
**Instead:** Accept webhook, create order with PAYMENT_CONFIRMED status, return 200. Process provisioning in a background task or a second serverless function call.

## Scalability Considerations

| Concern | At 100 users/day | At 1K users/day | At 10K users/day |
|---------|-------------------|------------------|-------------------|
| Page loads | ISR caching handles it | ISR caching handles it | CDN + edge caching |
| Webhook processing | Synchronous in API route | Still fine (serverless scales) | Consider queue (Inngest/Trigger.dev) |
| Catalog sync | Cron every 6 hours | Cron every 1 hour | Cron every 15 min + cache invalidation |
| Usage polling | On-demand when user checks | Background job every 30 min | Dedicated worker + webhooks if provider supports |
| Database | Supabase free/pro tier | Supabase pro tier | Connection pooling, read replicas |

## Sources

- Training data knowledge of CELITECH, eSIM Go, and MobiMatter API patterns (LOW confidence -- needs verification against actual API docs during implementation)
- Stripe Checkout and Webhooks documentation (HIGH confidence -- well-known, stable API)
- Next.js App Router patterns (HIGH confidence)
- Supabase Auth and Database patterns (HIGH confidence)
- General e-commerce platform architecture patterns (HIGH confidence)

**Note:** Wholesale API specifics (exact endpoints, webhook support, QR code format) marked LOW confidence and MUST be verified against the chosen provider's actual documentation before Phase 2 implementation.
