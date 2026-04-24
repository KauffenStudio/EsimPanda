# Phase 7: SEO and Internationalization - Context

**Gathered:** 2026-04-24
**Status:** Ready for planning

<domain>
## Phase Boundary

SEO-optimized destination landing pages with structured data, meta tags, and unique content per destination. Multi-language support (EN, PT, ES, FR) with language switcher. Destination cards on browse page link to dedicated landing pages instead of inline accordion expand. Pages are statically generated with ISR for performance and SEO.

</domain>

<decisions>
## Implementation Decisions

### Destination Page Content
- Plans + light intro format: short 2-3 sentence paragraph about connectivity in that country, then plan cards grid
- Templated FAQ section at bottom (3-5 common questions per destination, generated from template with country name inserted)
- "Student Pick" / "Erasmus Favorite" badge on 1-2 recommended plans per destination — reinforces student-first positioning
- Standalone pages with breadcrumb navigation (Home > Destinations > Portugal) — each page is a proper landing page that users can reach directly from Google
- Browse page destination cards link to `/esim/[slug]` instead of accordion expand — replaces the inline expand behavior

### URL and Slug Strategy
- URL pattern: `/[locale]/esim/[slug]` — e.g. `/en/esim/portugal`, `/pt/esim/portugal`
- Regional plans also get landing pages — e.g. `/en/esim/europe` for Europe-wide plans
- Same slugs across all locales (no translated slugs) — `/fr/esim/portugal` not `/fr/esim/portugal` → standard practice, simpler routing
- Destination slugs already exist in mock data (`destinations.ts` has slug field for 30+ countries)

### Translation Approach
- AI-generated translations, human-reviewed before shipping — covers PT, ES, FR for 200+ existing UI keys
- UI strings only are translated; destination intro content stays in English for now
- Language switcher in footer (dropdown) — standard pattern, doesn't clutter header
- Default to English for all users — no browser auto-detection. User switches manually via footer dropdown
- next-intl already configured with `[locale]` routing — extend `locales` array from `['en']` to `['en', 'pt', 'es', 'fr']`

### Structured Data and Technical SEO
- JSON-LD: Product + Offer (each plan) + FAQ schema + BreadcrumbList on every destination page
- SSG with ISR (generateStaticParams + revalidate) for all destination pages — fast TTFB, SEO-friendly
- Full Open Graph + Twitter Card meta on destination pages — title, description, country image, starting price
- generateMetadata() on each destination page for dynamic meta tags

### Claude's Discretion
- Sitemap strategy — whether to include all locale variants with hreflang or English-only initially
- robots.txt configuration
- ISR revalidation interval (balance between freshness and build cost)
- FAQ question selection per destination
- Exact breadcrumb component implementation
- Loading/skeleton states for destination pages

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### i18n Infrastructure
- `src/i18n/routing.ts` — Current locale config (only 'en'), routing setup to extend
- `src/i18n/request.ts` — Message loading per locale via dynamic import
- `src/middleware.ts` — next-intl middleware handling locale routing
- `messages/en.json` — All 200+ English translation keys to translate

### Destination Data
- `src/lib/mock-data/destinations.ts` — 30+ countries with slug, iso_code, region, image_url, popularity ranking
- `src/components/browse/destination-card.tsx` — Existing card component (will link to destination pages)
- `src/components/browse/destination-grid.tsx` — Browse grid (accordion behavior to be replaced with page links)
- `src/components/browse/plan-card.tsx` — Plan card component to reuse on destination pages
- `src/components/browse/regional-plan-card.tsx` — Regional plan card for Europe-wide page

### Existing SEO
- `src/app/layout.tsx` — Root metadata (basic title/description only)
- `src/app/[locale]/layout.tsx` — Locale layout with NextIntlClientProvider

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `DestinationCard` component: image, flag emoji, starting price — can be adapted for breadcrumb/header on landing pages
- `PlanCard` component: data/duration/price/badges with comparison checkbox — reuse directly on destination pages
- `RegionalPlanCard`: Europe-wide plan display — reuse on `/esim/europe` page
- `destination-grid.tsx`: search and filter logic — internal linking source
- next-intl `useTranslations()` hook used across all pages — established pattern for i18n
- Flag emoji generation via ISO code (String.fromCodePoint) — zero-bundle-cost, reuse on destination pages

### Established Patterns
- `[locale]` routing prefix on all pages via next-intl middleware
- Translation keys organized by page section in `messages/en.json` (e.g., `landing.*`, `browse.*`, `checkout.*`)
- Mock data pattern: static TypeScript files in `src/lib/mock-data/` — destination data follows this
- Motion (framer-motion) for page transitions and micro-interactions
- Bambu panda mascot poses for empty/loading/error states

### Integration Points
- Browse page (`/[locale]/browse`): destination cards must link to `/[locale]/esim/[slug]` instead of expanding accordion
- New route: `app/[locale]/esim/[slug]/page.tsx` for destination pages
- New route: `app/sitemap.ts` for dynamic sitemap generation
- New route: `app/robots.ts` for robots.txt
- Footer component: add language switcher dropdown
- `messages/` directory: add `pt.json`, `es.json`, `fr.json` translation files

</code_context>

<specifics>
## Specific Ideas

- Destination pages should feel like standalone landing pages users can reach from Google — not internal app screens
- Student Pick badge differentiates from competitors who don't target students
- FAQ section doubles as SEO signal (FAQ structured data → rich snippets in Google)
- Regional page for Europe is high-priority — "europe esim" has significant search volume

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 07-seo-and-internationalization*
*Context gathered: 2026-04-24*
