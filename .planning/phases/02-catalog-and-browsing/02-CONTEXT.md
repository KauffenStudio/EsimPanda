# Phase 2: Catalog and Browsing - Context

**Gathered:** 2026-04-20
**Status:** Ready for planning

<domain>
## Phase Boundary

Users can browse eSIM plans by destination, filter by duration/data/price, view regional plans, compare plans side-by-side, and check device compatibility — all from cached local data (never hitting wholesale API on page load). No checkout flow (Phase 3), no account system (Phase 5).

</domain>

<decisions>
## Implementation Decisions

### Destination Discovery
- **Search + popular grid** layout: search bar at top, grid of popular European destinations below with photo cards
- **Photo cards with overlay**: real stock photos (iconic landmarks — Eiffel Tower, Colosseum, etc.) as card background, flag + country name overlaid at bottom, "from X.XX" starting price
- **Europe-wide regional plan featured at top**: large card above the country grid promoting the multi-country Europe plan (30+ countries, one plan)
- **Destinations ordered by popularity** (not alphabetical, not by region): most popular destinations shown first
- **Inline accordion expand**: tapping a destination card expands plans below it with smooth Motion animation (no separate destination page, no page navigation)
- **Bambu empty state with suggestions**: no-results state shows Bambu (curious pose) + "No plans for [X] yet" + suggests similar countries or Europe-wide plan as fallback
- **Real stock photos** from Unsplash/Pexels for destination cards (not flag illustrations)

### Plan Card Design
- **Data + Duration + Price**: three key numbers front and center on each card (e.g., "3GB · 14 days · €8.99")
- **Vertical stack layout**: full-width cards stacked vertically within expanded destination accordion
- **Auto-tag best value**: automatically badge the plan with lowest price-per-GB as "Best Value" and most popular duration as "Most Popular" (using existing Badge component)
- **Direct to checkout**: tapping a plan card navigates directly to checkout (Phase 3 builds the page; for now shows "Coming soon" placeholder)
- **Plans sorted by price ascending**: cheapest first, no sort toggle needed

### Comparison & Filtering
- **Horizontal chip filters**: row of tappable duration chips above plan cards: "All", "24h", "7 days", "14 days", "30 days", "Semester (90d+)"
- **Side-by-side bottom sheet comparison**: long-press or compare checkbox on plan cards selects 2-3 plans, sticky bottom bar appears "Compare (2)", tapping opens side-by-side comparison sheet
- **No sort toggle**: plans always sorted by price (cheapest first), no user-facing sort option

### Device Compatibility
- **Check at checkout only**: compatibility check appears during checkout flow (not on browse page), doesn't clutter browsing experience
- **Device picker dropdown**: user selects phone brand + model from dropdowns, checked against known-compatible list
- **Static JSON device list**: hardcoded JSON file (~50 popular devices: all iPhones XS+, Samsung S20+, Pixel 3+, etc.), updated manually
- **Bambu error on incompatible**: Bambu (apologetic/sweat-drop pose) + "Sorry, [device] doesn't support eSIM" + link to compatible device list + "Browse anyway" option (non-blocking)
- **Save result in localStorage**: remember device choice so returning users skip the check

### Claude's Discretion
- Exact photo selection for destination cards
- Comparison sheet column layout and which attributes to compare
- Search implementation details (debounce, fuzzy matching)
- Loading states during data fetch (Bambu loading pose)
- Desktop adaptation of accordion expand behavior
- Chip filter animation/transition style

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project Context
- `.planning/PROJECT.md` — Full project vision, brand identity with Bambu persona, core value, constraints
- `.planning/REQUIREMENTS.md` — Phase 2 requirements: CAT-01, CAT-02, CAT-03, CAT-04, DEL-04

### Research
- `.planning/research/STACK.md` — Technology stack (Next.js 15, Supabase, Motion, Tailwind)
- `.planning/research/ARCHITECTURE.md` — System architecture, catalog sync pattern, data flow
- `.planning/research/FEATURES.md` — Feature landscape, table stakes vs differentiators

### Phase 1 Foundation
- `.planning/phases/01-foundation-and-design-system/01-CONTEXT.md` — Design decisions: brand colors, typography, Bambu poses, animation contracts
- `.planning/phases/01-foundation-and-design-system/01-UI-SPEC.md` — UI design contract: spacing tokens, color system, component primitives, animation specs
- `.planning/phases/01-foundation-and-design-system/01-01-SUMMARY.md` — DB schema, provider abstraction, Supabase clients
- `.planning/phases/01-foundation-and-design-system/01-02-SUMMARY.md` — Design system components, Bambu poses, layout components

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/components/ui/card.tsx`: Card component with elevated/flat variants and shadow transitions — use for plan cards and destination cards
- `src/components/ui/badge.tsx`: Semantic badge with pill shape — use for "Best Value" and "Most Popular" tags
- `src/components/ui/button.tsx`: 4-variant button with whileTap scale — use for "Buy Now" and filter chips
- `src/components/ui/input.tsx`: Form input with error state — use for search bar
- `src/components/bambu/bambu-empty.tsx`: Curious/inviting Bambu pose — use for no-results state
- `src/components/bambu/bambu-error.tsx`: Apologetic sweat-drop Bambu — use for incompatible device state
- `src/components/bambu/bambu-loading.tsx`: Eating bamboo animation — use for data loading
- `src/components/layout/page-transition.tsx`: AnimatePresence slide+fade — use for accordion expand animations
- `src/stores/theme.ts`: Zustand theme store — established pattern for client state

### Established Patterns
- Motion library: import from "motion/react" (not framer-motion)
- Tailwind v4: CSS-first config with @theme directive in globals.css
- i18n: next-intl with [locale] route segments, all text through translation keys
- Data access: Supabase browser client for public reads (destinations, plans tables have public RLS)

### Integration Points
- `src/app/[locale]/browse/page.tsx`: Existing browse placeholder — replace with destination grid
- `src/lib/supabase/client.ts`: Browser Supabase client for querying destinations and plans
- `supabase/migrations/00001_initial_schema.sql`: destinations (name, slug, iso_code, region, image_url) and plans (data_gb, duration_days, retail_price_cents) tables
- `messages/en.json`: Translation keys — add browse-related keys
- `src/lib/esim/types.ts`: NormalizedDestination and NormalizedPackage types

</code_context>

<specifics>
## Specific Ideas

- Destination cards should feel like a travel app (Airalo/Holafly style) — real photos create wanderlust
- The accordion expand on tap keeps users on the same page flow, no jarring page changes
- "Best Value" auto-tagging helps students who are price-sensitive make quick decisions
- One-tap from plan card to checkout embodies the "under 2 minutes" core value
- Device compatibility saved in localStorage avoids repeating the check for returning users

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 02-catalog-and-browsing*
*Context gathered: 2026-04-20*
