# Phase 1: Foundation and Design System - Context

**Gathered:** 2026-04-19
**Status:** Ready for planning

<domain>
## Phase Boundary

Project skeleton with Next.js 15 + Supabase, database schema, wholesale provider abstraction layer (CELITECH), catalog sync job, i18n framework, and the eSIM Panda design system with Framer Motion animations featuring Bambu the panda mascot.

</domain>

<decisions>
## Implementation Decisions

### Brand Identity
- **Name:** eSIM Panda
- **Domain:** esimpanda.co
- **Mascot:** Bambu — a flat illustration 2D panda (Duolingo-style, SVG-based)
- Bambu has a name and personality — he's a friendly guide/companion
- Bambu appears contextually (loading, success, errors, empty states, onboarding) — NOT always visible
- Black and white color scheme with electric blue (#2979FF) accent for CTAs and highlights

### Color System
- Primary: #000000 (black)
- Accent: #2979FF (electric blue) — CTAs, links, interactive elements
- Background light: #FFFFFF (white)
- Background dark: #111111 (for dark mode)
- The panda itself is black & white — IS the brand colors
- Neutral grays for secondary text, borders, cards

### Typography
- Geometric modern font family (Inter or Plus Jakarta Sans)
- Clean, tech-forward, excellent legibility at all sizes
- Bold weights for headlines, regular for body

### Component Style
- Border radius: medium (8-12px) — balanced, professional
- Cards with subtle shadows
- Clean spacing, modern feel

### Bambu Poses & States
- **Success (checkout approved):** Happy dance/bounce animation
- **Error (something fails):** Apologetic expression with sweat drop
- **Browse (exploring destinations):** Looking through binoculars
- **Loading (waiting):** Eating bamboo — branded loading state, replaces spinners
- **Empty states:** Curious, inviting ("No eSIMs yet? Let's fix that!")
- **QR delivery:** Celebrates and "hands" QR code to user
- **Setup guide:** Walks alongside user, pointing at each step

### Animations & Micro-interactions
- **UI animations:** Smooth and elegant (ease-in-out, no bounce on UI elements)
- **Bambu animations:** Playful and bouncy (spring physics, overshoot) — he's the fun element
- **Page transitions:** Slide/morph between pages — native app feel
- **Scroll effects:** Parallax layers + reveal on scroll on landing page
- **Feedback:** Haptic vibration on mobile + visual feedback (scale down on press, ripple)
- **Loading states:** Bambu animation (eating bamboo, poses) — NOT skeleton screens

### Layout & Navigation
- **Mobile:** Bottom tab bar + header with logo (app-native feel)
  - Tabs: Home, Destinations, My eSIMs, Profile
  - Header: Panda logo + eSIM Panda text
- **Desktop:** Claude's discretion — adapt bottom tabs to appropriate desktop pattern
- **Dark mode:** Manual toggle only (not system auto-detect)
- **Site structure:** Single Next.js app with routing
  - `/` = marketing landing page (with parallax, Bambu hero)
  - `/browse` = destination browsing (app)
  - `/dashboard` = eSIM management (app)
  - No separate subdomains

### Wholesale Provider
- **Primary provider:** CELITECH — pay-as-you-go, zero minimum commitment
- **Strategy:** Single provider for now, abstraction layer allows switching later
- **NOT multi-provider aggregation at launch** — simplicity first
- Get CELITECH sandbox access as first development step
- Abstraction layer must exist but only CELITECH adapter implemented

### i18n Framework
- Wire i18n from the start — all user-facing strings through translation keys
- Only English (EN) translations in Phase 1
- Additional languages (PT, ES, FR) added in Phase 7

### Claude's Discretion
- Exact font choice within geometric modern family
- Desktop navigation pattern (sidebar vs top nav)
- Dark mode color palette details
- Database schema design
- Catalog sync scheduling strategy (cron interval)
- Supabase RLS policies structure
- Loading animation specifics for Bambu (exact poses/keyframes)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project Context
- `.planning/PROJECT.md` — Full project vision, brand identity with Bambu persona, core value, constraints
- `.planning/REQUIREMENTS.md` — Phase 1 requirements: INF-01, INF-02, INF-06, UXD-01

### Research
- `.planning/research/STACK.md` — Technology stack recommendations (Next.js 15, Supabase, Framer Motion, Tailwind, CELITECH)
- `.planning/research/ARCHITECTURE.md` — System architecture, component boundaries, data flow, build order
- `.planning/research/PITFALLS.md` — Provider lock-in prevention, abstraction layer necessity
- `.planning/research/SUMMARY.md` — Synthesized research findings

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- None — greenfield project, no existing code

### Established Patterns
- None — patterns will be established in this phase

### Integration Points
- Supabase: database + auth provider
- CELITECH API: wholesale eSIM provider (sandbox first)
- Vercel: deployment target

</code_context>

<specifics>
## Specific Ideas

- Bambu the panda is NOT a static illustration — he's an animated SVG character with multiple poses/expressions driven by Framer Motion
- The loading experience should feel delightful, not boring — Bambu eating bamboo instead of a spinner
- Landing page should feel immersive with parallax + reveal animations — first impression matters for the student audience
- "Like Duolingo's owl but for eSIMs" — the character creates emotional connection and brand recognition
- The app should feel like a native mobile app even though it's a web app — slide transitions, bottom nav, haptic feedback

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 01-foundation-and-design-system*
*Context gathered: 2026-04-19*
