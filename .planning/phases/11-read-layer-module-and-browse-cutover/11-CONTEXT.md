# Phase 11: Read-Layer Module and Browse Cutover - Context

**Gathered:** 2026-05-16
**Status:** Ready for planning

<domain>
## Phase Boundary

Build the shared, typed, `server-only` catalog read module at `src/lib/db/destinations.ts` and cut the browse page and all its child components over from `src/lib/mock-data/` to live Supabase reads. Browse page becomes an async RSC that fetches the catalog server-side and hands data to a `<BrowseClient>` client child. Destination grid, search filter, plan cards, regional plan cards, and the comparison sheet all consume real Supabase data, with shimmer skeletons during fetch, a typographic fallback card for missing images, and an inline error banner with retry.

Out of scope (later phases): checkout/pricing/coupon cutover (Phase 12), mock-data file deletion (Phase 13), WhatsApp removal (Phase 13), E2E + service-worker bump (Phase 14).
</domain>

<decisions>
## Implementation Decisions

### Loading state
- Shimmer skeleton cards while the catalog fetches — grey placeholder cards matching real destination-card dimensions, with a left-to-right shimmer sweep
- Skeleton card count + grid layout must match the real grid so there is no layout shift when data lands
- No centered single-mascot loader for the grid (would cause a pop-in shift)

### Error state
- Inline error banner rendered above the grid area when the Supabase catalog fetch fails — NOT a full-page takeover, NOT a full-area Bambu replacement
- Banner contains a short apologetic message + a Retry button
- Retry re-runs the entire `getCatalog()` catalog fetch (destinations + regional plans). The catalog is a single fetch, so a full re-fetch is the simple correct behavior — do NOT use `router.refresh()`
- Page header / nav / chrome stay intact during the error state

### Image fallback — typographic card (SUPERSEDES research recommendation)
- When a destination row has no `image_url`, the card shows the **destination name in bold type on a brand-color gradient** — a typographic card
- This explicitly OVERRIDES the milestone research (`v1.1/FEATURES.md`) recommendation of a country-flag fallback, the REQUIREMENTS.md CAT-07 wording ("country-flag fallback"), and ROADMAP Phase 11 success criterion 5 ("country-flag SVG"). CAT-07 and the ROADMAP criterion are being updated to say "typographic name card" to match this decision.
- Rationale: the user prefers the cleaner typographic treatment over flag emoji/SVG. The intent of CAT-07 (a meaningful, branded, non-generic fallback — never a broken-image icon or generic stock photo) is fully preserved.
- No flag emoji, no SVG flag asset, no generic placeholder image.

### Photo cross-fade (UXD-07)
- When `image_url` IS present, the real photo blur-cross-fades in over the card using a `motion.img` opacity transition
- The thing it cross-fades in *over* is the typographic fallback card (not a flag card)

### Regional hero cards (EU / AS / GL)
- Render with their curated `image_url` photo (Phase 10's backfill seeded these three rows with photos) using the **existing regional-plan-card treatment** — no special-case visual frame, no badge, no globe icon
- If a regional card's `image_url` is somehow missing, it falls back to the same typographic card as country destinations
- No new "Multi-country" badge styling in this phase

### No Bambu mascot poses (user decision 2026-05-16)
- The Bambu mascot **pose** system (`bambu-empty`, `bambu-error`, `bambu-loading`, `bambu-preparing`, `bambu-success`, `bambu-travel`, `bambu-welcome`, `bambu-base`) is NOT used in any Phase 11 component — cleaner approach
- This overrides `v1.1/FEATURES.md`, which leaned on Bambu poses as the differentiator for loading/error/empty states
- The existing **panda video** (`src/components/bambu/bambu-video.tsx` — the "hello" animation) is untouched and stays exactly as-is
- `src/components/browse/destination-grid.tsx` currently imports a Bambu pose — that import is removed as part of this phase's browse cutover (it's a browse-path file already being rewritten)
- App-wide removal of the pose system from the other 21 files (auth, checkout, dashboard, PWA, delivery) is a SEPARATE dedicated phase — see Deferred Ideas

### Empty / no-results states (plain text, no mascot)
- **Search returns zero matches:** a plain "No destinations match …" text message + a prominent **Clear search** button that resets the filter. No mascot, no suggested-destinations row.
- **Network/fetch failure:** handled by the inline error banner above (plain text + Retry, no mascot)
- **Destination with zero plans:** a simple plain-text "No plans available" message in-card or in-sheet — no mascot

### Plan file granularity — 3 plans
- `11-01-PLAN.md` — Read-layer module + browse RSC: create `src/lib/db/destinations.ts` (`server-only`, typed exports `listActiveDestinations`, `listPlansForDestination`, `getDestinationBySlug`, `getPlanById`, `getCatalog`); convert `app/[locale]/browse/page.tsx` to async RSC with `revalidate`; create `<BrowseClient>` client child; wire `getCatalog()` → props
- `11-02-PLAN.md` — Card components + states: adapt `destination-card`, `plan-card`, `regional-plan-card` to the real `Plan`/`Destination` shape; shimmer skeleton component; inline error banner + Retry; search-miss empty state with Clear-search; typographic fallback card + photo cross-fade
- `11-03-PLAN.md` — Comparison store migration: `useComparisonStore` `string[]` → `Plan[]`; `comparison-sheet` + `comparison-bar` consume stored `Plan` objects with no `mock-data` lookup
- Plans are sequential within the phase (11-02 and 11-03 depend on the read module + types from 11-01)

### Claude's Discretion
- Exact shimmer animation timing / gradient colors for skeletons (use existing design tokens)
- Exact brand-gradient colors for the typographic fallback card (use existing Tailwind theme tokens)
- Exact error-banner copy and Clear-search button copy (must go through i18n keys)
- `getCatalog()` internal shape / how destinations vs regional plans are partitioned
- `revalidate` interval for the browse RSC (research suggested 3600s — Claude may tune)
- Whether skeleton/error/empty are standalone components or inline in `<BrowseClient>`
- The zero-plans message exact wording and placement

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### v1.1 milestone research
- `.planning/research/v1.1/SUMMARY.md` — Phase 11 = Wave 1; hybrid RSC pattern; risks (hydration, type drift)
- `.planning/research/v1.1/ARCHITECTURE.md` — Hybrid RSC decision, `src/lib/db/destinations.ts` module shape, `<BrowseClient>` split, comparison store migration, the 18-file mock-import map
- `.planning/research/v1.1/FEATURES.md` — Loading/error/empty UX patterns (note: its flag-fallback recommendation is SUPERSEDED by the typographic-card decision above)
- `.planning/research/v1.1/PITFALLS.md` — Pitfall 4 (hydration mismatch), Pitfall 12 (single fetch + in-memory filter), Pitfall 13 (no server-side search), Pitfall 6 (test migration order)

### Prior phase context
- `.planning/phases/10-schema-and-curation-backfill/10-CONTEXT.md` — `region_bucket` semantics, curation column meanings, uncurated-destinations-hidden decision
- `.planning/phases/10-schema-and-curation-backfill/10-SUMMARY.md` (10-01 + 10-02) — 69 curated rows live in Supabase, 3 regional hero rows seeded with photos

### Code patterns to mirror
- `src/lib/db/orders.ts` — Typed Supabase query module style (error handling, joined selects) — the template for `db/destinations.ts`
- `src/app/[locale]/esim/[slug]/page.tsx` — Existing async RSC precedent in this codebase (the hybrid RSC/client pattern to follow)
- `src/lib/supabase/server.ts` — Anon-key server client factory for RSC reads
- `src/components/bambu/bambu-video.tsx` — The panda "hello" video — stays as-is, do NOT touch. The Bambu *pose* components are NOT used in Phase 11.

### Files being cut over (current mock-data consumers)
- `src/app/[locale]/browse/page.tsx` — currently `'use client'`, renders `<DestinationGrid />`
- `src/components/browse/destination-grid.tsx` — uses `useDestinations()` (sync mock hook)
- `src/components/browse/destination-card.tsx`, `plan-card.tsx`, `regional-plan-card.tsx`, `comparison-sheet.tsx`, `comparison-bar.tsx`
- `src/hooks/use-destinations.ts`, `src/hooks/use-plans.ts` — sync hooks reading `mock-data`
- `src/stores/comparison.ts` — currently stores `string[]` plan IDs

### Requirements
- `.planning/REQUIREMENTS.md` — Phase 11 owns INF-07, INF-08, CAT-05, CAT-06, CAT-07, UXD-05, UXD-06, UXD-07 (CAT-07 wording updated this phase to "typographic name card")

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/lib/db/orders.ts` — the typed query-module pattern; `db/destinations.ts` should mirror its structure (named async functions, `createClient()`, typed row interfaces, error logging)
- `src/app/[locale]/esim/[slug]/page.tsx` — proven async RSC in this codebase; the cutover follows its pattern
- Existing design tokens / Tailwind theme — for skeleton shimmer + gradient colors
- `src/components/bambu/bambu-video.tsx` — panda hello video, untouched; Bambu pose components deliberately NOT used

### Established Patterns
- `@supabase/ssr` anon-key client for server-component reads (RLS allows public SELECT on active rows — verified in Phase 10)
- `next-intl` for all user-facing copy — error banner, clear-search, empty-state strings need translation keys
- Zustand stores for client state (`comparison`, `browse`, `cart`, `currency`)
- Framer Motion (`motion`) for animations — used for the photo cross-fade

### Integration Points
- `getCatalog()` in the new `db/destinations.ts` is the single read entry point — browse RSC calls it; Phase 12 checkout will reuse `getPlanById`
- `<BrowseClient>` is the new boundary: server fetches, client owns search filter + Framer Motion + Zustand
- Comparison store shape change (`string[]` → `Plan[]`) ripples into `comparison-sheet` and `comparison-bar`
- The `Plan` / `Destination` TypeScript types defined here become canonical — Phase 12 renames `MockPlan` to align with them

</code_context>

<specifics>
## Specific Ideas

- "Typographic fallback, not flags" — the user explicitly prefers a bold destination-name-on-gradient card over flag emoji or SVG flags. This is a deliberate override of the research recommendation.
- "Inline error banner, not a full-page error" — keep the page chrome; the error is a banner above the grid.
- Regional hero cards should NOT get special badge treatment in v1.1 — they just use their curated photos like any other card.
- Search must stay instant (in-memory) — no server round-trip per keystroke. This was locked at milestone level and reaffirmed here.

</specifics>

<deferred>
## Deferred Ideas

- **App-wide Bambu pose removal — NEW DEDICATED PHASE (user decision 2026-05-16).** The Bambu mascot *pose* system (8 components: `bambu-base/empty/error/loading/preparing/success/travel/welcome`) is used in 22 files across auth, checkout, dashboard, PWA, delivery, and browse. The user wants it removed app-wide for a cleaner approach, keeping only `bambu-video.tsx` (the panda hello video). Phase 11 only removes the pose import from `destination-grid.tsx` (in its scope). The other 21 files + deletion of the 8 pose component files need a dedicated phase. **Recommended placement: a new phase BEFORE the current Phase 14 (E2E + Deploy)** so E2E tests the final poseless UI — i.e. insert as Phase 14, renumber E2E to Phase 15. To be created via `/gsd:add-phase` or `/gsd:insert-phase` after this discussion.
- **"Multi-country" badge styling for regional cards** — came up as an option; deferred. Regional cards use plain photo treatment in v1.1. Could be a v1.2 polish item.
- **Suggested-destinations row on search-miss** — considered; deferred in favor of a simple Clear-search button. Revisit if search-abandonment telemetry shows a problem.
- **ISR hard-pin / optimistic render** — already deferred to v1.2 as POL-02/03 in REQUIREMENTS.md. (POL-01, the Bambu loading-pose threshold, is now moot — the pose system is being removed.)
- **Server-side search (Postgres FTS)** — explicitly an anti-feature at 226 rows; never in scope.

</deferred>

---

*Phase: 11-read-layer-module-and-browse-cutover*
*Context gathered: 2026-05-16*
