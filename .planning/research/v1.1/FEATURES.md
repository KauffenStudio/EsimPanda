# Feature Research — v1.1 Live Data Cutover

**Domain:** eSIM reseller catalog/checkout UI behavior on async Supabase data + support entry-point removal
**Researched:** 2026-05-13
**Confidence:** HIGH (scoped to UX behavior of an already-shipped product; verified against existing code)

> **Scope discipline:** This file documents *only* the new UX behaviors introduced by the cutover from mock to live Supabase data, plus the WhatsApp removal cleanup. The v1.0 feature set (browse, checkout, eSIM delivery, accounts, dashboard, top-up, history, SEO, i18n, referrals, PWA, dark mode, push) is documented in `.planning/research/FEATURES.md` and is **not** re-listed here.
>
> The product's brand asset — the Bambu/panda mascot system — already exists in `src/components/bambu/` with poses for `loading`, `empty`, `error`, `success`, `preparing`, `browse`, `welcome`. The cutover should *exploit* those poses, not invent new ones.

---

## Feature Landscape

### Table Stakes (Users Expect These)

Without these, the live-data version will feel *worse* than the mock version it replaces (mock data is synchronous; live data isn't). The bar is "no visible regression."

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| **Skeleton cards for destination grid** | Today the grid renders instantly because mock data is in-bundle. Replacing it with a Supabase fetch must not introduce a flash of empty content. Users on 3G campus Wi-Fi will see hundreds of ms of nothing. | S | One `<DestinationCardSkeleton>` component, 4–8 grey shimmer placeholders matching the existing 2/3/4-column grid. Reuse Tailwind `animate-pulse`. Render server-side via RSC initial paint so the skeleton is in the HTML, not painted after hydration. |
| **Skeleton rows for plan list** | Plan-card list (currently `mockPlans`) will hit Supabase per destination page. Empty plan area during fetch breaks the "tap to buy in 2 min" promise. | S | 3–5 skeleton `<PlanCard>`s sized to the real card (height + padding match) so layout doesn't shift when real data arrives. |
| **Instant client-side filter for destination search** | 226 destinations fits comfortably in memory (≈25 KB JSON). Round-tripping to Supabase on every keystroke would feel laggy vs the current zero-latency mock filter. | S | Fetch full destination list once (already happening), filter in-memory exactly as `use-destinations` does today. No debounce needed — the filter is local. |
| **`next/image` with `blurDataURL` placeholder** | Pexels hero photos are 800×600 JPEGs. Without a blur placeholder, cards flash white then snap to image — looks cheap. | S | Generate or store a 10-px base64 blurhash per destination at sync time, or use `placeholder="empty"` with a brand-tinted background until image loads. |
| **Country-flag fallback when `image_url` is null** | The backfill copies image_url for ISO codes that match `mockDestinations`. The other ~160 Celitech destinations will have `image_url = null` on day one. A broken `<img>` icon is a hostile UX regression. | S | Render an SVG/emoji flag (e.g. `flag-icons` library, ISO code → flag) inside a brand-colored gradient card. The flag *is* the destination identity — this is honest and clean, not a placeholder. |
| **Network-error empty state with retry** | Supabase outage or bad RLS policy will yield `null`/`[]` to the grid. Today's mock can't fail. The grid must distinguish "no results" (search miss) from "fetch failed" (retry button) from "really empty" (no plans for this country). | S | Three distinct empty states. Pose mapping: search-miss = `empty` Bambu (already used), error = `error` Bambu, no-plans = `preparing` Bambu with "Plans coming soon" copy. |
| **Stable card identity across refetch** | If a user is comparing plans (`useComparisonStore` holds IDs) and the plan list refetches, plan IDs must match between fetches. With live data the IDs come from Celitech UUIDs in Supabase — fine — but the comparison sheet must not break if a plan disappears mid-session (e.g. provider deprecation). | S | When reading from comparison store, filter out plan IDs that no longer exist in the latest fetch instead of crashing. |
| **Graceful WhatsApp button removal — no dead UI** | The component is already commented out in `src/app/[locale]/layout.tsx:49`. Translation keys (`whatsapp.*`) and `src/lib/config/support.ts` still exist. Leaving dead exports invites someone to re-import the button later by accident. | S | Delete `whatsapp-button.tsx`, `whatsapp-button.test.tsx`, `support.ts` (WhatsApp URL), and prune `whatsapp.*` namespace from all four locale JSONs. Keep the `wa.me` link in `referral/share-buttons.tsx` — that's user-initiated sharing, not support. |

### Differentiators (Competitive Advantage)

These are *cheap* extras that turn the cutover from "we replaced the data source" into "the live version feels better than the mock did." All exploit the Bambu mascot system already shipped in v1.0.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **Bambu `loading` pose during catalog fetch** | Competitors (Airalo, Holafly) show a generic spinner. We have a munching panda video (`/bambu/loading.mp4`). Replacing the destination-grid skeleton with the Bambu pose for fetches >300 ms turns dead time into brand reinforcement. | S | Use existing `<BambuVideo variant="loading" />`. Show only after 300 ms (skeleton handles <300 ms case so fast networks don't see the panda flash). Reuse the same intersection-observer playback policy already in `bambu-video.tsx`. |
| **Bambu `error` pose for fetch failures with one-tap retry** | A sweat-drop panda saying "Couldn't reach the catalog — tap to retry" is *vastly* warmer than "Failed to load. Error: PostgrestError: connection reset." Students remember the panda apology, not the bug. | S | Already-shipped `<BambuVideo variant="error" />` + a single accent-colored Retry button. Log the technical error to console for support, never to the user. |
| **Bambu `preparing` pose for "Plans coming soon" (empty plans table)** | Celitech may onboard a destination row before populating its plans. Without this, the destination card is clickable → leads to a blank plans page. With this, the empty state says "Bambu's still packing plans for [Country] — check back soon" + a notify-me button. | S | Use existing `preparing` variant. Notify-me can be deferred (just store email → table) or stubbed for v1.1. The pose alone with copy is enough to not feel broken. |
| **Optimistic destination-card render from URL slug** | When a user lands on `/browse/japan` from an SEO page, render the country card with name + ISO flag immediately from the slug param, *before* the destination row arrives from Supabase. Plans grid still skeletons. Reduces perceived latency on the most-trafficked entry path. | M | Requires a static slug→ISO map (or just parse the slug, fetch the flag, paint, then let the Supabase fetch fill in image and popularity). Existing destinations file already has this mapping — preserve it as a static lookup even after data moves to Supabase. |
| **Blurred image cross-fade** | When `image_url` arrives after the flag fallback already rendered, a hard swap looks broken. A 200 ms opacity fade-in from flag → photo feels intentional, like Instagram. | S | `<motion.img>` with `initial={{opacity:0}}` `animate={{opacity:1}}`. Layout doesn't shift because both occupy the same card slot. |
| **Hard-pin the top-12 destinations in SSR** | The 12 highest-`popularity_rank` destinations (France, Spain, Italy, Germany, Portugal, etc.) account for ≈70 % of v1.0 traffic. Pre-render their cards at build time / ISR rather than client-fetching the whole catalog. The "below the fold" tail loads on demand. | M | Next.js `generateStaticParams` already covers SEO pages — extend the principle to the home grid's first row. Refetch every 24 h via ISR; Celitech catalog changes daily at most. |
| **Bambu `success` micro-celebration on first plan-card mount** | When the plans grid resolves for a destination, briefly play the `success` pose in the corner of the page header for ~1.2 s. Tiny dopamine hit reinforces "we found what you want." | S | Optional; remove if it gets annoying in QA. Easy to wire as a one-shot `<BambuVideo loop={false}>` triggered by `useEffect(() => {}, [plans])`. |
| **Static `/help` route as WhatsApp replacement** | Removing WhatsApp without offering *anywhere* to get help is hostile. A single `/help` page with FAQ + a `mailto:support@…` link (or contact-form server action) is the minimum civilized replacement. | S | New route `src/app/[locale]/help/page.tsx`. Content: 6–10 FAQ entries (eSIM compatibility, top-up, refund, activation, no service). Footer link from layout. No live chat, no WhatsApp, no widget. Async only. |

### Anti-Features (Commonly Requested, Often Problematic)

Things that *sound* like the right cutover response but actively make v1.1 worse.

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| **Streaming SSR with `<Suspense>` boundaries per destination card** | "It's the React 19 / Next 15 modern pattern, let's use the fancy thing." | The grid is 200+ cards. Per-card suspense floods the response with chunks, hurts TTFB, and the visual result (cards popping in one by one) is *worse* than a single skeleton → bulk swap. Streaming is for *long-running* heterogeneous content (a feed of widgets), not a uniform grid of identical fetches. | One Supabase query → one render. Skeletons during the wait. Suspense boundary at the *page* level, not the card level. |
| **Server-side debounced search via Supabase full-text** | "226 destinations is a lot, server-side search scales better." | 226 rows is 25 KB of JSON. Round-tripping a Postgres query per keystroke adds 80–300 ms of network latency for *zero* benefit — the in-memory `.includes(query)` filter is already instant. This is over-engineering with a real UX cost. | Client-side filter on the already-fetched list (what v1.0 does today). Revisit only if the destination count crosses ≈5,000. |
| **Generic "mountain" or "city" stock-photo placeholder for missing `image_url`** | "We don't have a photo for Liechtenstein, just show a nice generic mountain." | The user knows it's not their destination. Generic stock photos feel like a content farm, undermine trust, and a wrong photo is worse than no photo. The country flag *is* a correct, honest, instantly-recognizable identity. | Country-flag-in-gradient fallback (see Table Stakes). Optionally a Bambu accent in the corner of the flag card to keep brand presence. |
| **Toast notification on fetch error** | "Show a toast saying 'Network error'." | Toasts disappear, leaving the user staring at a blank grid with no way to recover. They're for ephemeral feedback (item added to cart), not for terminal failure of the main content area. | In-place `error` Bambu state with a Retry button. The user always sees what's wrong *and* what to do. |
| **Live chat widget (Intercom/Crisp/Drift) to replace WhatsApp** | "We removed WhatsApp so let's bolt on a chat widget." | We've already classified live chat as out-of-scope (v1.0 PROJECT.md). Chat widgets cost €50–500/mo, require staffing, and break the PWA install promise (third-party scripts, CSP headaches). | Static `/help` FAQ + `mailto:` or simple contact form. Async only. Documented as the chosen support model in PROJECT.md. |
| **Polling Supabase every N seconds for catalog freshness** | "What if Celitech adds a destination while the user is browsing?" | The Celitech catalog changes maybe once per week. Polling every 30 s creates 120× the load for zero user-visible benefit. Users don't expect a static catalog page to mutate while they read it. | Fetch on mount. Optionally revalidate on tab focus (`react-query`-style `refetchOnWindowFocus`) — once per session is plenty. |
| **Removing `popularity_rank` and letting Supabase auto-sort by Celitech's order** | "It's one less column to maintain." | Celitech returns destinations alphabetically. Showing Albania, Andorra, Argentina before France/Spain/Italy buries the 70 % of traffic that drives revenue. The hand-curated `popularity_rank` is the single most important piece of curation metadata. | Keep `popularity_rank` as a first-class Supabase column. Backfill from `src/lib/mock-data/destinations.ts`. New Celitech destinations default to `999` (sort to bottom) until manually ranked. |
| **Keeping `mock-data/` as a "fallback" when Supabase is down** | "Belt and braces — if Supabase fails, fall back to mock." | The mock catalog has 67 destinations; live has 226. Falling back silently means some users see 226 plans, others see 67, all for the same URL — chaos for support and SEO. Also defeats the entire point of the cutover. | Delete `src/lib/mock-data/` entirely once the cutover is verified. If Supabase is down, show the `error` Bambu and retry. Honest > silent inconsistency. |

---

## Feature Dependencies

```
Skeleton cards (destinations + plans)
    └──depends on──> async data hooks (use-destinations, use-plans rewrite)
                         └──depends on──> Supabase reads with proper loading state

Country-flag fallback
    └──depends on──> ISO code present on every destination row (already true)

Bambu loading/error/preparing/success poses
    └──depends on──> v1.0 Bambu mascot system (already shipped in src/components/bambu/)

"Plans coming soon" preparing state
    └──depends on──> ability to detect empty plans table for a destination (one Supabase query)

Optimistic destination-card from slug
    └──depends on──> static slug→ISO map preserved post-cutover

Hard-pin top-12 destinations in SSR
    └──depends on──> popularity_rank column populated in Supabase (covered by backfill script)

/help route (WhatsApp replacement)
    └──depends on──> nothing (independent — can ship in parallel with cutover)
    └──unlocks──> safe deletion of whatsapp-button.tsx, support.ts, whatsapp.* i18n keys

WhatsApp removal
    └──conflicts with──> any unshipped onboarding/empty-state copy that says "ask us on WhatsApp"
        ├──action──> grep all locale JSONs for whatsapp/wa.me references
        └──action──> grep all components for support.ts imports

Stable card identity across refetch
    └──depends on──> Celitech plan UUIDs being stable in Supabase (they are; they're the PKs)
```

### Dependency Notes

- **Cutover order:** ship the Supabase fetch + skeletons + flag fallback together. Don't ship skeletons without the fetch (nothing to wait for) and don't ship the fetch without skeletons (regression). They're one unit of work.
- **WhatsApp removal is independent** of the data cutover and can ship in either order. Recommend shipping `/help` route *first*, then the WhatsApp deletion, so there's never a window where users have no support entry-point at all.
- **`mock-data/` deletion is the last step**, after E2E verification of the live cutover. Until then it stays as a reference for the backfill script but is no longer imported by any UI component.

---

## v1.1 Definition (per quality_gate)

### Must Ship (gates v1.1 closure)

- [ ] Destination grid renders skeletons → real Supabase data with no FOUC — S
- [ ] Plan-card list renders skeletons → real Supabase data with no FOUC — S
- [ ] Country-flag fallback when `image_url` is null — S
- [ ] Three distinct empty/error states using existing Bambu poses (`empty`, `error`, `preparing`) — S
- [ ] Client-side destination search preserved (no server-side debounce) — S
- [ ] Network-error state offers a Retry that actually retries — S
- [ ] WhatsApp button + `support.ts` + `whatsapp.*` i18n keys deleted from codebase — S
- [ ] `/help` route shipped with FAQ + `mailto:` contact, linked from footer — S
- [ ] No `mock-data/` imports remain in any component under `src/` (verified by grep) — S

### Should Ship (improves quality if time permits)

- [ ] Bambu `loading` pose for catalog fetches >300 ms — S
- [ ] Blurred-image cross-fade from flag → photo — S
- [ ] Optimistic destination-card render from slug param — M
- [ ] Hard-pin top-12 destinations in SSR/ISR — M

### Defer to v1.2+

- [ ] Bambu `success` micro-celebration on plan-list mount — taste call, validate in QA
- [ ] Notify-me on "plans coming soon" state — needs email-capture table + double-opt-in flow
- [ ] Refetch-on-tab-focus — wait until we have real telemetry showing catalog staleness matters

---

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Destination + plan skeletons | HIGH | LOW | P1 |
| Country-flag fallback for missing image_url | HIGH | LOW | P1 |
| Bambu error state + Retry button | HIGH | LOW | P1 |
| Bambu `preparing` for empty plans table | HIGH | LOW | P1 |
| Delete WhatsApp components/i18n/config | MEDIUM | LOW | P1 |
| `/help` static route (FAQ + mailto) | HIGH | LOW | P1 |
| Client-side search preserved (no regression) | HIGH | LOW | P1 |
| Bambu `loading` pose on slow fetches | MEDIUM | LOW | P2 |
| Image cross-fade flag → photo | MEDIUM | LOW | P2 |
| Optimistic card from slug | MEDIUM | MEDIUM | P2 |
| ISR hard-pin top-12 destinations | MEDIUM | MEDIUM | P2 |
| Bambu `success` micro-celebration | LOW | LOW | P3 |
| Notify-me on coming-soon | LOW | MEDIUM | P3 |

**Priority key:**
- P1: Must have to close v1.1 without UX regression vs the mock version
- P2: Should have, makes live version *better* than mock
- P3: Nice to have, defer to v1.2 if not free

---

## Competitor Feature Analysis (Scoped to Async Catalog UX)

| Behavior | Airalo | Holafly | Nomad | eSIM Panda v1.1 (planned) |
|----------|--------|---------|-------|---------------------------|
| Catalog loading indicator | Generic spinner | Skeleton cards | Generic spinner | Skeleton cards + Bambu after 300 ms |
| Missing destination image | Stock photo | Country flag | Stock photo | Country flag in brand gradient |
| Empty/error states | Generic "Try again" | Generic empty | Generic "Try again" | Branded Bambu poses (empty/error/preparing) |
| Search latency | Instant client filter | Instant client filter | Server-debounced (laggy) | Instant client filter |
| Support entry-point | In-app live chat | WhatsApp + chat | Email only | Static `/help` + mailto (async-only) |
| First-paint of top destinations | Client-fetched | Client-fetched | Client-fetched | SSR/ISR for top-12 |

**Take:** competitors treat the catalog as commodity SaaS UI. Our mascot system makes loading/error states a brand moment for ~zero extra cost. Don't waste that lever.

---

## WhatsApp Removal — Concrete Cleanup Checklist

Verified via grep against current source. These are the only places that need to change:

**Delete:**
- `src/components/layout/whatsapp-button.tsx`
- `src/components/layout/__tests__/whatsapp-button.test.tsx`
- `src/lib/config/support.ts` (entire file — only contains WhatsApp helpers)

**Edit:**
- `src/app/[locale]/layout.tsx` — remove the commented-out import (line 9) and JSX (line 49)
- `src/i18n/messages/{en,pt,es,fr}.json` — remove the entire `whatsapp` namespace
- Any test or doc referencing `getWhatsAppUrl` / `WHATSAPP_SUPPORT_URL`

**Keep (intentional, not support):**
- `src/components/referral/share-buttons.tsx` line 82–88 — uses `wa.me` for user-initiated *referral sharing*, which is a different feature. The user opens WhatsApp to send their referral link to friends. This is not a support entry-point.

**Add to replace:**
- `src/app/[locale]/help/page.tsx` — static FAQ + mailto link
- Footer link to `/help` from the layout (replaces any prior WhatsApp affordance)

**Env cleanup:**
- `NEXT_PUBLIC_WHATSAPP_NUMBER` env var — remove from `.env.example`, deployment configs (Vercel)

**UX rule for the cleanup:** at no point during the rollout should a user be able to land on a page that *promises* WhatsApp support and then find the button missing. Either both are present, or both are gone *and* `/help` is shipped. Treat the three changes (button delete + i18n cleanup + `/help` ship) as one deploy unit.

---

## Sources

- Current codebase inspection (HIGH confidence):
  - `src/components/browse/destination-grid.tsx`, `plan-card.tsx`
  - `src/hooks/use-destinations.ts`
  - `src/lib/mock-data/destinations.ts`
  - `src/components/bambu/` (8 mascot variants already shipped)
  - `src/components/layout/whatsapp-button.tsx`, `src/lib/config/support.ts`
  - `src/components/referral/share-buttons.tsx`
- v1.0 baseline: `.planning/research/FEATURES.md`
- v1.1 milestone scope: `.planning/PROJECT.md` "Current Milestone: v1.1 Live Data Cutover"
- Pattern reference: Next.js 15 docs on Suspense vs skeleton trade-offs (training data, MEDIUM confidence — patterns are stable since Next 13)
- Anti-pattern reference: real-world post-mortems on per-card Suspense streaming hurting LCP (training data, MEDIUM confidence)

---
*Feature research for: eSIM Panda v1.1 — Live Data Cutover + WhatsApp Removal*
*Researched: 2026-05-13*
