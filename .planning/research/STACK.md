# Technology Stack

**Project:** eSIM Reseller Platform
**Researched:** 2026-04-19
**Note:** Web search/fetch tools were unavailable during research. All recommendations based on training data (cutoff May 2025). eSIM wholesale provider details especially need live verification.

## Recommended Stack

### Core Framework

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| Next.js | 15.x (App Router) | Full-stack framework | Server Components for SEO landing pages, API Routes for backend, App Router for nested layouts (destination pages), built-in image optimization, ISR for plan catalogs. The eSIM platform needs both excellent SEO (destination pages) and dynamic app behavior (checkout, dashboard) — Next.js handles both in one framework. | HIGH |
| TypeScript | 5.x | Type safety | eSIM API responses are complex nested objects (plans, QR codes, usage data). TypeScript prevents entire categories of integration bugs. Non-negotiable. | HIGH |
| React | 19.x | UI library | Ships with Next.js 15. Server Components reduce client bundle for content-heavy destination pages. | HIGH |

### Styling & Animation

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| Tailwind CSS | 4.x | Utility-first styling | Fast iteration for mobile-first design. JIT compilation keeps bundle small. The student audience expects modern, polished UI — Tailwind enables rapid premium design without CSS bloat. | HIGH |
| Framer Motion | 11.x | Animations & gestures | Best React animation library. Spring physics for natural card transitions, layout animations for plan switching, gesture support for mobile swipe interactions. Key to the "brutally good UX" differentiator. Exit animations for checkout flow. AnimatePresence for page transitions. | HIGH |
| Lucide React | latest | Icons | Tree-shakeable, consistent icon set. Lighter than FontAwesome. | HIGH |

### Database

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| Supabase (PostgreSQL) | Latest | Primary database + auth | PostgreSQL for relational data (users, orders, plans, eSIMs). Supabase provides: auth with social logins, Row Level Security, real-time subscriptions (eSIM status updates), edge functions, storage (QR code images). Free tier generous enough for launch. Already have Supabase CLI installed. | HIGH |
| Supabase Auth | Included | Authentication | Email/password + Google OAuth. Student email domain detection for auto-discount. Magic links for frictionless mobile auth. | HIGH |

### Payment Processing

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| Stripe | Latest SDK | Payment processing | Handles Apple Pay, Google Pay, and card payments in one integration. Stripe Checkout or Payment Element for PCI compliance without building payment forms. Webhook-based order fulfillment (purchase eSIM after confirmed payment). PayPal supported via Stripe's PayPal integration or separate PayPal SDK. | HIGH |
| PayPal SDK | Latest | PayPal checkout | Students in some European countries prefer PayPal. Add as secondary payment method. Can use Stripe's built-in PayPal support if available in your region, otherwise integrate PayPal Buttons SDK directly. | MEDIUM |

### eSIM Wholesale API

| Provider | API Quality | Pricing Model | Min Commitment | European Coverage | Best For | Confidence |
|----------|------------|---------------|----------------|-------------------|----------|------------|
| **CELITECH** (Recommended) | REST API, well-documented, sandbox available | Pay-per-eSIM, no upfront cost | No minimum — true pay-as-you-go | Strong European coverage | Startups and new resellers. Zero upfront investment, developer-friendly API, instant QR code delivery. Best fit for this project's zero-inventory model. | MEDIUM |
| eSIM Go | REST API, decent docs | Wholesale pricing tiers | Low minimum (~$100 deposit) | Good European coverage, 160+ countries | Budget-conscious resellers. Competitive wholesale rates. | MEDIUM |
| MobiMatter | REST API, aggregator model | Markup over wholesale | Varies | Aggregates multiple providers, wide coverage | Flexibility — accesses plans from multiple underlying providers. Good fallback if primary provider lacks coverage. | LOW |
| Airalo Partner | REST API | Revenue share / wholesale | Application required, minimum volumes likely | Extensive (190+ countries) | Established resellers with volume. Airalo is the market leader, but partner requirements may be harder for a new startup. | LOW |

**Recommendation: Start with CELITECH.** Zero minimum commitment means zero risk. If CELITECH's European coverage or pricing doesn't work, MobiMatter as aggregator provides a fallback. Design the architecture with a provider abstraction layer so switching is painless.

**IMPORTANT: All eSIM provider details need live verification.** Pricing, minimums, and API capabilities may have changed. Contact each provider directly before committing.

### Hosting & Infrastructure

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| Vercel | Latest | Hosting & deployment | Native Next.js support (Vercel built Next.js). Edge functions for low-latency API responses across Europe. Preview deployments for testing. Free tier sufficient for launch. Automatic HTTPS, CDN, image optimization. | HIGH |
| Vercel Analytics | Included | Performance monitoring | Core Web Vitals tracking. Critical for SEO destination pages. | HIGH |
| Resend | Latest | Transactional email | Order confirmations, QR code delivery via email. React Email for beautiful templates. Simple API, generous free tier (100 emails/day). | MEDIUM |

### PWA Capabilities

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| next-pwa / @serwist/next | Latest | PWA support | Service worker for offline access to purchased eSIM QR codes and setup guides. Add-to-home-screen prompt. Push notifications for data usage alerts. next-pwa or its maintained successor Serwist wraps Workbox for Next.js. | MEDIUM |
| Web Push API | Native | Push notifications | Data usage warnings, plan expiry reminders. Free, no third-party service needed. | HIGH |

### Supporting Libraries

| Library | Version | Purpose | When to Use | Confidence |
|---------|---------|---------|-------------|------------|
| Zustand | 5.x | Client state management | Shopping cart, UI state, active filters. Lightweight (~1KB), no boilerplate. Replaces Redux. | HIGH |
| TanStack Query (React Query) | 5.x | Server state / caching | eSIM plan catalog fetching, usage data polling, order status. Automatic refetching, caching, optimistic updates. | HIGH |
| Zod | 3.x | Schema validation | Validate eSIM API responses, form inputs, webhook payloads. Runtime type safety at API boundaries. | HIGH |
| date-fns | 3.x | Date handling | Plan expiry dates, countdown timers, "X days remaining" displays. Tree-shakeable (unlike Moment.js). | HIGH |
| QRCode.react | Latest | QR code rendering | Display eSIM activation QR codes. Client-side rendering, no server dependency. | HIGH |
| next-intl | Latest | Internationalization | Students from across Europe. Support EN, PT, ES, FR, DE at minimum. Next.js App Router compatible. | MEDIUM |
| Sonner | Latest | Toast notifications | Purchase confirmations, error messages, data alerts. Beautiful by default, accessible. | HIGH |
| nuqs | Latest | URL search params | Filter plans by destination, duration, data amount. Keeps state in URL for shareability and back-button support. | MEDIUM |

### Dev Tooling

| Tool | Purpose | Why |
|------|---------|-----|
| ESLint + Prettier | Code quality | Standard. Use Next.js ESLint config as base. |
| Vitest | Unit testing | Fast, ESM-native, Jest-compatible API. |
| Playwright | E2E testing | Test checkout flows, eSIM purchase flow. Already familiar with Playwright per project context. |
| Husky + lint-staged | Pre-commit hooks | Enforce formatting and linting before commits. |

## Alternatives Considered

| Category | Recommended | Alternative | Why Not |
|----------|-------------|-------------|---------|
| Framework | Next.js 15 | Remix | Remix is solid but Next.js has larger ecosystem, better Vercel integration, and more community resources for e-commerce patterns. |
| Framework | Next.js 15 | Nuxt (Vue) | Vue ecosystem is smaller. React has more animation libraries, component libraries, and hiring pool. |
| Styling | Tailwind CSS | CSS Modules | Tailwind is faster for iteration and has better mobile-first utilities. CSS Modules add friction for responsive design. |
| Animation | Framer Motion | GSAP | GSAP is more powerful but heavier, not React-native, and has commercial licensing concerns. Framer Motion integrates naturally with React component lifecycle. |
| Animation | Framer Motion | React Spring | Framer Motion has better DX, more features (layout animations, gestures, AnimatePresence), and larger community. |
| Database | Supabase | Firebase | PostgreSQL (Supabase) is better for relational e-commerce data. Firebase's NoSQL makes order/plan queries painful. Supabase gives raw SQL access when needed. |
| Database | Supabase | PlanetScale | PlanetScale removed free tier. Supabase free tier is generous and includes auth, storage, edge functions. |
| State | Zustand | Redux Toolkit | Redux is overkill for this app's state needs. Zustand is simpler, smaller, faster to implement. |
| State | Zustand | Jotai | Zustand's store pattern is more intuitive for shopping cart and order state than Jotai's atomic model. |
| Payments | Stripe | Paddle/LemonSqueezy | Those are for SaaS/digital products with tax handling. Stripe gives more control over payment flows and supports Apple Pay/Google Pay natively. |
| Hosting | Vercel | Netlify | Vercel has first-class Next.js support (they build it). Netlify's Next.js support is second-class. |
| Hosting | Vercel | AWS (self-hosted) | Unnecessary complexity for a startup. Vercel abstracts all DevOps. Move to AWS only if you outgrow Vercel's pricing. |
| Email | Resend | SendGrid | Resend has React Email integration (build email templates as React components), simpler API, better DX. |
| eSIM Provider | CELITECH | Airalo Partner | Airalo likely has minimum volume requirements. CELITECH's pay-as-you-go model eliminates risk for a new platform. |

## Architecture Decision: Provider Abstraction Layer

**Critical:** Build an abstraction layer over the eSIM wholesale API from day one.

```typescript
// src/lib/esim/provider.ts
interface ESIMProvider {
  getPlans(destination: string): Promise<Plan[]>;
  purchaseESIM(planId: string): Promise<PurchaseResult>;
  getESIMStatus(esimId: string): Promise<ESIMStatus>;
  topUp(esimId: string, planId: string): Promise<TopUpResult>;
}

// Swap providers without touching business logic
class CelitechProvider implements ESIMProvider { ... }
class MobiMatterProvider implements ESIMProvider { ... }
```

This lets you switch or combine providers without rewriting business logic. Essential given the LOW confidence on provider details.

## Installation

```bash
# Core
npx create-next-app@latest esim-platform --typescript --tailwind --eslint --app --src-dir

# UI & Animation
npm install framer-motion lucide-react sonner

# State & Data
npm install zustand @tanstack/react-query zod

# Database
npm install @supabase/supabase-js @supabase/ssr

# Payments
npm install @stripe/stripe-js stripe

# PWA
npm install @serwist/next

# Utilities
npm install date-fns qrcode.react nuqs next-intl

# Dev dependencies
npm install -D vitest @playwright/test husky lint-staged prettier
```

## What NOT to Use

| Technology | Why Avoid |
|------------|-----------|
| MongoDB | Relational data (users -> orders -> eSIMs -> plans) is a terrible fit for document databases. You'll regret it at query time. |
| Material UI / Chakra UI | Heavy component libraries kill performance and constrain the premium custom design you need. Tailwind + Framer Motion gives full control. |
| Redux | Boilerplate overhead for what is fundamentally simple client state (cart, UI toggles, filters). |
| Moment.js | Deprecated, massive bundle size. Use date-fns. |
| Express.js (separate backend) | Next.js API routes + Supabase Edge Functions handle everything. A separate backend doubles deployment complexity for zero benefit at this scale. |
| WordPress/headless CMS | SEO pages are code-driven with ISR. A CMS adds a dependency and learning curve for content that changes infrequently. |
| Prisma | Supabase has its own client library and direct PostgreSQL access. Prisma adds a build step (generate) and an abstraction layer you don't need. |

## Cost Estimate (Monthly at Launch)

| Service | Free Tier | Paid Estimate |
|---------|-----------|---------------|
| Vercel | 100GB bandwidth, unlimited deploys | $20/mo Pro if needed |
| Supabase | 500MB database, 50K auth users | $25/mo Pro if needed |
| Stripe | No monthly fee | 2.9% + 30c per transaction |
| Resend | 100 emails/day | $20/mo for 5K emails |
| Domain | N/A | ~$12/year |
| **Total at launch** | **$0-1/mo** | **$65-85/mo at scale** |

## Sources

- Next.js documentation (nextjs.org) — HIGH confidence for framework capabilities
- Supabase documentation (supabase.com) — HIGH confidence for database/auth features
- Stripe documentation (stripe.com) — HIGH confidence for payment capabilities
- Framer Motion documentation (framer.com/motion) — HIGH confidence for animation features
- CELITECH website (celitech.com) — MEDIUM confidence, pricing/API details need live verification
- eSIM Go website (esim-go.com) — LOW confidence, details from training data only
- MobiMatter website (mobimatter.com) — LOW confidence, details from training data only
- Airalo partner program (airalo.com/partner) — LOW confidence, details from training data only

**KEY ACTION ITEM:** Before committing to any eSIM wholesale provider, request sandbox/demo access from CELITECH, eSIM Go, and MobiMatter. Evaluate: actual wholesale pricing for European plans, API response times, QR code delivery method, sandbox quality, and support responsiveness. This is the single highest-risk technology decision in the stack.
