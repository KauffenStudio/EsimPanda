# Phase 7: SEO and Internationalization - Research

**Researched:** 2026-04-24
**Domain:** Next.js 15 SEO (structured data, meta, sitemap) + next-intl multi-locale i18n
**Confidence:** HIGH

## Summary

Phase 7 adds SEO-optimized destination landing pages and multi-language support (EN, PT, ES, FR) to eSIM Panda. The existing codebase already has next-intl v4.9.1 configured with `[locale]` routing, but only the `en` locale is active. Extending to 4 locales requires changes to `routing.ts`, `middleware.ts` matcher, locale layout (add `setRequestLocale` for SSG), and creating 3 new translation files. Destination landing pages at `/[locale]/esim/[slug]` use `generateStaticParams` + `generateMetadata` for SSG/ISR with full structured data (Product, FAQPage, BreadcrumbList JSON-LD).

The codebase uses `next/link` with manual `/${locale}/path` interpolation throughout (~20+ files). This pattern works fine with multi-locale -- no migration to `next-intl/navigation` Link is required. The critical architectural insight is that destination pages must be server components (for `generateMetadata` and `generateStaticParams`) that compose existing client components (`PlanCard`, `DurationFilter`).

**Primary recommendation:** Structure as 3 waves -- (1) i18n infrastructure expansion + navigation module, (2) destination landing pages with SEO, (3) sitemap/robots/translations.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Plans + light intro format: short 2-3 sentence paragraph about connectivity, then plan cards grid
- Templated FAQ section at bottom (3-5 common questions per destination, country name interpolated)
- "Student Pick" / "Erasmus Favorite" badges on 1-2 recommended plans per destination
- Standalone pages with breadcrumb navigation (Home > Destinations > Country)
- Browse page destination cards link to `/esim/[slug]` instead of accordion expand
- URL pattern: `/[locale]/esim/[slug]` with same slugs across all locales
- Regional plans also get landing pages (e.g., `/en/esim/europe`)
- AI-generated translations, human-reviewed before shipping (PT, ES, FR)
- UI strings only translated; destination intro content stays in English for now
- Language switcher in footer (dropdown), default English, no auto-detection
- next-intl already configured -- extend locales array from `['en']` to `['en', 'pt', 'es', 'fr']`
- JSON-LD: Product + Offer, FAQPage, BreadcrumbList on every destination page
- SSG with ISR (generateStaticParams + revalidate) for all destination pages
- Full Open Graph + Twitter Card meta on destination pages
- generateMetadata() on each destination page for dynamic meta tags

### Claude's Discretion
- Sitemap strategy (all locale variants with hreflang vs English-only initially)
- robots.txt configuration
- ISR revalidation interval
- FAQ question selection per destination
- Exact breadcrumb component implementation
- Loading/skeleton states for destination pages

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| GRW-02 | Destination pages are SEO-optimized with structured data | Destination landing pages at `/[locale]/esim/[slug]` with JSON-LD (Product+Offer, FAQPage, BreadcrumbList), generateMetadata for meta tags, SSG+ISR for indexability |
| GRW-03 | Platform supports multiple languages (EN, PT, ES, FR minimum) | Extend next-intl routing.ts locales, update middleware matcher, add pt/es/fr translation files, footer language switcher component |
</phase_requirements>

## Standard Stack

### Core (already installed)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| next-intl | 4.9.1 | i18n routing, translations, locale switching | Already in project, handles [locale] routing, message loading, useTranslations |
| next | 15.5.15 | SSG/ISR via generateStaticParams, generateMetadata, sitemap.ts | Built-in SEO primitives, no external SEO library needed |
| lucide-react | 1.8.0 | ChevronRight (breadcrumbs), Globe (language switcher) icons | Already in project |

### Supporting (already installed)
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| motion | 12.38.0 | FAQ accordion animation, page transitions | Existing project pattern for micro-interactions |
| zod | 4.3.6 | Validate destination slug params | Existing validation pattern |

### No New Dependencies
This phase requires zero new npm packages. All functionality is covered by Next.js built-in APIs (generateMetadata, generateStaticParams, sitemap.ts, robots.ts) and the already-installed next-intl v4.

## Architecture Patterns

### Recommended Project Structure
```
src/
  i18n/
    routing.ts              # Extend locales: ['en','pt','es','fr']
    request.ts              # Already handles dynamic message import
    navigation.ts           # NEW: createNavigation(routing) for Link, useRouter, usePathname, getPathname
  app/
    [locale]/
      esim/
        [slug]/
          page.tsx           # Destination landing page (server component)
      layout.tsx             # Add setRequestLocale + generateStaticParams
    sitemap.ts               # Dynamic sitemap with hreflang alternates
    robots.ts                # Allow all, reference sitemap
  components/
    seo/
      breadcrumb.tsx         # Breadcrumb with JSON-LD BreadcrumbList
      destination-hero.tsx   # Flag + country name + intro paragraph
      faq-section.tsx        # Accordion FAQ with JSON-LD FAQPage
      json-ld.tsx            # Reusable JSON-LD script renderer
    layout/
      language-switcher.tsx  # Footer dropdown for locale switching
  lib/
    seo/
      structured-data.ts    # JSON-LD generators (Product, FAQ, Breadcrumb)
      meta-templates.ts     # Title/description/OG template functions
      faq-templates.ts      # FAQ question/answer templates per destination
messages/
  en.json                    # Existing (266 lines, ~200+ keys)
  pt.json                    # NEW: Portuguese translations
  es.json                    # NEW: Spanish translations
  fr.json                    # NEW: French translations
```

### Pattern 1: Server Component Destination Page with SSG
**What:** Destination page is a server component that uses `generateStaticParams` for all destination slugs x all locales, and `generateMetadata` for dynamic SEO.
**When to use:** All destination landing pages.
**Example:**
```typescript
// src/app/[locale]/esim/[slug]/page.tsx
import { setRequestLocale } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import { mockDestinations } from '@/lib/mock-data/destinations';

export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    mockDestinations
      .filter((d) => d.is_active)
      .map((d) => ({ locale, slug: d.slug }))
  );
}

export async function generateMetadata({ params }: Props) {
  const { locale, slug } = await params;
  const destination = mockDestinations.find((d) => d.slug === slug);
  // ... return title, description, openGraph, alternates with hreflang
}

export default async function DestinationPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  // render hero, plans, FAQ as server + client component composition
}

export const revalidate = 3600; // ISR: revalidate every hour
```

### Pattern 2: JSON-LD Structured Data via Script Tag
**What:** Render JSON-LD as a `<script type="application/ld+json">` tag in server components.
**When to use:** Every destination page (Product, FAQPage, BreadcrumbList).
**Example:**
```typescript
// src/components/seo/json-ld.tsx
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
```

### Pattern 3: Locale-Aware Navigation Module
**What:** Create `src/i18n/navigation.ts` using `createNavigation(routing)` to export locale-aware `Link`, `useRouter`, `usePathname`, `getPathname`.
**When to use:** New components in this phase should use `Link` from `@/i18n/navigation`. Existing components continue using `next/link` with `/${locale}/path` pattern -- no migration required.
**Example:**
```typescript
// src/i18n/navigation.ts
import { createNavigation } from 'next-intl/navigation';
import { routing } from './routing';

export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
```

### Pattern 4: Middleware Matcher for All Locales
**What:** Update matcher from `['/', '/(en)/:path*']` to catch-all pattern that handles all 4 locales.
**When to use:** Required when adding locales.
**Example:**
```typescript
// src/middleware.ts
export const config = {
  matcher: ['/', '/(en|pt|es|fr)/:path*'],
};
```
Note: The next-intl docs recommend `'/((?!api|trpc|_next|_vercel|.*\\..*).*)'` as a broader matcher. Either works; the explicit locale list is simpler and matches the existing pattern.

### Pattern 5: ISR with Static Params
**What:** Combine `generateStaticParams` (build-time generation) with `revalidate` (ISR interval) for destination pages.
**When to use:** All destination pages.
**Recommendation for revalidation interval:** 3600 seconds (1 hour). Plans data changes infrequently (wholesale catalog sync), and destination content is static. 1 hour balances freshness with build cost.

### Anti-Patterns to Avoid
- **Client-side metadata:** Never use useEffect to set document.title or meta tags. Always use `generateMetadata` for SSR/SSG meta.
- **Hardcoded JSON-LD strings:** Build JSON-LD objects programmatically, then JSON.stringify. Never hand-write JSON strings in templates.
- **Translating slugs:** Keep `/esim/portugal` across all locales. Translated slugs (`/esim/portugal` vs `/esim/portugale`) break link consistency and complicate routing.
- **Importing all messages on every page:** next-intl already handles this -- `getMessages()` loads the locale-specific JSON. Don't import all 4 locale files.
- **Missing setRequestLocale:** Every page and layout that should be statically rendered MUST call `setRequestLocale(locale)`. Without it, next-intl falls back to dynamic rendering.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Sitemap generation | Custom XML builder | `app/sitemap.ts` with `MetadataRoute.Sitemap` | Next.js handles XML formatting, caching, and the `alternates.languages` property generates hreflang tags automatically |
| robots.txt | Static file | `app/robots.ts` with `MetadataRoute.Robots` | Programmatic, can reference sitemap URL dynamically |
| Meta tags | Custom Head component | `generateMetadata()` export | Next.js deduplicates, streams, and handles meta correctly across layouts |
| Locale routing | Custom middleware | next-intl `createMiddleware(routing)` | Already handles redirects, cookie-based preferences, prefix management |
| hreflang tags | Manual link tags | `alternates.languages` in both `generateMetadata` and `sitemap.ts` | Next.js renders them correctly in both HTML head and sitemap XML |
| Language switching | Custom state + reload | next-intl `useRouter().push(pathname, { locale })` or `Link` with `locale` prop | Handles cookie persistence, URL update, no full reload |

**Key insight:** Next.js 15 has first-class SEO primitives (generateMetadata, sitemap.ts, robots.ts, generateStaticParams). Combined with next-intl for locale routing, zero external SEO libraries are needed.

## Common Pitfalls

### Pitfall 1: Missing setRequestLocale Causes Dynamic Rendering
**What goes wrong:** Destination pages that should be statically generated fall back to dynamic rendering, increasing TTFB and server load.
**Why it happens:** next-intl APIs read from headers by default. Without `setRequestLocale`, static rendering is impossible.
**How to avoid:** Call `setRequestLocale(locale)` at the top of every page and layout component. Add it to `[locale]/layout.tsx` as well (currently missing).
**Warning signs:** Build output shows destination pages as "lambda" instead of "static" or "ISR".

### Pitfall 2: Middleware Matcher Not Updated for New Locales
**What goes wrong:** Routes like `/pt/esim/portugal` return 404 because the middleware matcher only handles `/(en)/:path*`.
**Why it happens:** Current matcher is explicitly `['/', '/(en)/:path*']`. Adding locales to `routing.ts` without updating the matcher breaks non-English routes.
**How to avoid:** Update matcher to `['/', '/(en|pt|es|fr)/:path*']` simultaneously with routing.ts changes.
**Warning signs:** Non-English locale URLs show 404 or redirect to English.

### Pitfall 3: Type Narrowing on Locale in request.ts
**What goes wrong:** TypeScript error when checking `routing.locales.includes(locale)` because `locale` is `string` but `routing.locales` is `readonly ['en', 'pt', 'es', 'fr']`.
**Why it happens:** The existing code casts `locale as 'en'` -- this needs updating for the expanded locale array.
**How to avoid:** Use `routing.locales.includes(locale as (typeof routing.locales)[number])` or define a type guard.
**Warning signs:** TypeScript compilation errors in `request.ts`.

### Pitfall 4: Forgetting generateStaticParams in Layout
**What goes wrong:** Build error or dynamic rendering because the `[locale]` layout doesn't return all locale values.
**Why it happens:** Current `[locale]/layout.tsx` doesn't export `generateStaticParams`.
**How to avoid:** Add `export function generateStaticParams() { return routing.locales.map((locale) => ({ locale })); }` to `[locale]/layout.tsx`.
**Warning signs:** Build warnings about dynamic routes.

### Pitfall 5: JSON-LD Duplication Across Layout and Page
**What goes wrong:** Multiple JSON-LD blocks with conflicting data.
**Why it happens:** Adding structured data in both layout and page without coordination.
**How to avoid:** All JSON-LD for destination pages goes in the page component only. Layout has no structured data.
**Warning signs:** Google Rich Results Test shows duplicate/conflicting schemas.

### Pitfall 6: Open Graph Images with Unsplash URLs
**What goes wrong:** Social sharing previews may fail or be slow because OG images point to external Unsplash URLs.
**Why it happens:** Destination data uses Unsplash CDN URLs for images.
**How to avoid:** This is acceptable for now. Unsplash CDN is fast and reliable. For production, consider proxying through Next.js Image Optimization or using `opengraph-image.tsx` route for generated OG images.
**Warning signs:** Slow or missing social preview images.

## Code Examples

### Extending Routing Configuration
```typescript
// src/i18n/routing.ts
import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['en', 'pt', 'es', 'fr'],
  defaultLocale: 'en',
});
```

### Sitemap with All Locales + Hreflang
```typescript
// src/app/sitemap.ts
import type { MetadataRoute } from 'next';
import { routing } from '@/i18n/routing';
import { mockDestinations } from '@/lib/mock-data/destinations';

const host = 'https://esimpanda.com';

export default function sitemap(): MetadataRoute.Sitemap {
  const destinations = mockDestinations.filter((d) => d.is_active);
  const locales = routing.locales;

  const destinationEntries = destinations.map((dest) => ({
    url: `${host}/en/esim/${dest.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
    alternates: {
      languages: Object.fromEntries(
        locales.map((locale) => [locale, `${host}/${locale}/esim/${dest.slug}`])
      ),
    },
  }));

  const staticPages = ['', '/browse'].map((path) => ({
    url: `${host}/en${path}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: path === '' ? 1.0 : 0.7,
    alternates: {
      languages: Object.fromEntries(
        locales.map((locale) => [locale, `${host}/${locale}${path}`])
      ),
    },
  }));

  return [...staticPages, ...destinationEntries];
}
```

### robots.ts
```typescript
// src/app/robots.ts
import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/' },
    sitemap: 'https://esimpanda.com/sitemap.xml',
  };
}
```

### generateMetadata with Hreflang Alternates
```typescript
// Inside destination page
import { getTranslations } from 'next-intl/server';
import { routing } from '@/i18n/routing';

export async function generateMetadata({ params }: Props) {
  const { locale, slug } = await params;
  const destination = mockDestinations.find((d) => d.slug === slug);
  if (!destination) return {};

  const startingPrice = (getStartingPrice(destination.id) / 100).toFixed(2);

  return {
    title: `eSIM ${destination.name} -- Instant Data Plans for Students | eSIM Panda`,
    description: `Get an eSIM for ${destination.name} in under 2 minutes. Plans from EUR${startingPrice}. No SIM swaps, instant activation. Perfect for Erasmus and international students.`,
    openGraph: {
      title: `eSIM ${destination.name} -- Instant Data Plans for Students`,
      description: `Plans from EUR${startingPrice}. Instant activation.`,
      images: [destination.image_url],
      type: 'website',
    },
    twitter: { card: 'summary_large_image' },
    alternates: {
      languages: Object.fromEntries(
        routing.locales.map((l) => [l, `https://esimpanda.com/${l}/esim/${slug}`])
      ),
    },
  };
}
```

### Language Switcher Pattern
```typescript
// src/components/layout/language-switcher.tsx
'use client';

import { useLocale } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/navigation';
import { Globe } from 'lucide-react';

const localeNames: Record<string, string> = {
  en: 'English',
  pt: 'Portugues',
  es: 'Espanol',
  fr: 'Francais',
};

export function LanguageSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  function switchLocale(newLocale: string) {
    router.replace(pathname, { locale: newLocale });
  }
  // ... dropdown UI
}
```

### Structured Data Generators
```typescript
// src/lib/seo/structured-data.ts
export function buildProductJsonLd(plan: Plan, destination: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: `eSIM ${destination} - ${plan.data_gb}GB ${plan.duration_days} days`,
    offers: {
      '@type': 'Offer',
      price: (plan.retail_price_cents / 100).toFixed(2),
      priceCurrency: 'EUR',
      availability: 'https://schema.org/InStock',
    },
  };
}

export function buildFaqJsonLd(questions: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: questions.map((q) => ({
      '@type': 'Question',
      name: q.question,
      acceptedAnswer: { '@type': 'Answer', text: q.answer },
    })),
  };
}

export function buildBreadcrumbJsonLd(locale: string, destination?: { name: string; slug: string }) {
  const items = [
    { position: 1, name: 'Home', item: `https://esimpanda.com/${locale}` },
    { position: 2, name: 'Destinations', item: `https://esimpanda.com/${locale}/browse` },
  ];
  if (destination) {
    items.push({ position: 3, name: destination.name });
  }
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items,
  };
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| next-head for meta tags | generateMetadata export | Next.js 13+ (App Router) | Streaming-compatible, server-side, no client JS |
| next-seo package | Built-in generateMetadata | Next.js 13+ | Zero-dependency SEO, first-class support |
| Manual sitemap XML | app/sitemap.ts with types | Next.js 13.3+ | Type-safe, auto-cached, hreflang via alternates.languages |
| next-intl v3 createSharedPathnamesNavigation | next-intl v4 createNavigation | v4.0 (2024) | Simplified API, single function for all navigation needs |
| next-intl pathnames config | Simplified routing without pathnames | v4.0 | Less boilerplate for shared-pathname apps |

## Sitemap Strategy Recommendation (Claude's Discretion)

**Recommendation: Include all locale variants with hreflang from day one.**

Rationale: Next.js `sitemap.ts` makes this trivial (see code example above). Including hreflang from the start means Google discovers all language versions immediately. With only 13 destinations x 4 locales = 52 destination URLs plus a handful of static pages, the sitemap is tiny. No reason to defer.

## ISR Revalidation Recommendation (Claude's Discretion)

**Recommendation: 3600 seconds (1 hour).**

Rationale: Destination content is templated (not dynamic). Plan pricing comes from mock data (later wholesale API sync that runs on a schedule). Hourly revalidation ensures any data changes propagate within an hour while keeping build costs near zero.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | vitest 4.1.4 + @testing-library/react 16.3.2 |
| Config file | vitest.config.ts |
| Quick run command | `npx vitest run --reporter=verbose` |
| Full suite command | `npx vitest run` |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| GRW-02a | Structured data generators produce valid JSON-LD | unit | `npx vitest run src/lib/seo/__tests__/structured-data.test.ts -x` | Wave 0 |
| GRW-02b | generateMetadata returns correct title/desc/OG for destination | unit | `npx vitest run src/app/[locale]/esim/__tests__/metadata.test.ts -x` | Wave 0 |
| GRW-02c | generateStaticParams returns all destination x locale combinations | unit | `npx vitest run src/app/[locale]/esim/__tests__/static-params.test.ts -x` | Wave 0 |
| GRW-02d | FAQ templates interpolate country name correctly | unit | `npx vitest run src/lib/seo/__tests__/faq-templates.test.ts -x` | Wave 0 |
| GRW-03a | Routing config includes all 4 locales | unit | `npx vitest run src/i18n/__tests__/routing.test.ts -x` | Exists (check) |
| GRW-03b | Sitemap includes all destinations with hreflang alternates | unit | `npx vitest run src/app/__tests__/sitemap.test.ts -x` | Wave 0 |

### Sampling Rate
- **Per task commit:** `npx vitest run --reporter=verbose`
- **Per wave merge:** `npx vitest run`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `src/lib/seo/__tests__/structured-data.test.ts` -- covers GRW-02a
- [ ] `src/lib/seo/__tests__/faq-templates.test.ts` -- covers GRW-02d
- [ ] `src/app/__tests__/sitemap.test.ts` -- covers GRW-03b

## Open Questions

1. **Translation workflow tooling**
   - What we know: User decided AI-generated translations, human-reviewed. ~200+ keys in en.json.
   - What's unclear: Whether to generate translations within implementation tasks or as a separate pre-step. JSON file format is straightforward -- can use any LLM to translate en.json keys.
   - Recommendation: Generate translations as part of the i18n infrastructure task. Use Claude to translate en.json into pt/es/fr during implementation. Mark as "draft" for human review.

2. **Domain/host URL for structured data**
   - What we know: Structured data and sitemap need absolute URLs (e.g., `https://esimpanda.com`).
   - What's unclear: Whether the domain is finalized and deployed.
   - Recommendation: Use an environment variable `NEXT_PUBLIC_SITE_URL` defaulting to `https://esimpanda.com`. Structured data and sitemap reference this.

## Sources

### Primary (HIGH confidence)
- next-intl v4.9.1 -- installed in project, routing.ts and request.ts examined directly
- Next.js 15.5.15 -- installed in project, generateMetadata and sitemap.ts docs verified
- [next-intl routing setup](https://next-intl.dev/docs/routing/setup) -- multi-locale config, generateStaticParams, setRequestLocale
- [next-intl metadata docs](https://next-intl.dev/docs/environments/actions-metadata-route-handlers) -- generateMetadata with next-intl, sitemap with locale alternates
- [next-intl navigation docs](https://next-intl.dev/docs/routing/navigation) -- createNavigation API for Link, useRouter, usePathname
- [Next.js sitemap.ts docs](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap) -- MetadataRoute.Sitemap type, alternates.languages for hreflang
- [Next.js generateMetadata docs](https://nextjs.org/docs/app/api-reference/functions/generate-metadata) -- alternates, openGraph, twitter metadata

### Secondary (MEDIUM confidence)
- [Multilingual Next.js SEO patterns](https://generaltranslation.com/en-US/blog/multilingual-nextjs-seo) -- hreflang best practices verified against official docs

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- all libraries already installed, versions verified via package.json and npm ls
- Architecture: HIGH -- patterns verified against next-intl v4 and Next.js 15 official docs
- Pitfalls: HIGH -- identified from direct codebase analysis (middleware matcher, setRequestLocale, type narrowing)

**Research date:** 2026-04-24
**Valid until:** 2026-05-24 (stable -- next-intl v4 and Next.js 15 are mature)
