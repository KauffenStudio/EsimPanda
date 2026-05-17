# Phase 13 — Deferred / Cross-Plan Items

## Cross-plan: full-suite `npm test` / `tsc` / `npm run build` blocked by 13-02 in-flight

**Discovered during:** 13-01 Task 4 (full-suite gate)

**Detail:** 13-01 ran in parallel with 13-02 (WhatsApp removal). The 13-02 agent
deleted `src/lib/config/support.ts` but had not yet finished repointing its three
error-state components (`payment-error.tsx`, `provisioning-error.tsx`,
`setup-guide.tsx`) off `@/lib/config/support`. This left `tsc --noEmit` with 3
`TS2307 Cannot find module '@/lib/config/support'` errors and one Vitest suite
(`delivery-page.test.tsx`) failing to resolve the same import.

**Scope:** NOT a 13-01 defect — every error traces to `@/lib/config/support`
(a 13-02-owned file). Zero errors in any 13-01-touched file. 13-01's own surface
is fully green: `pricing-display.test.ts` passes 11/11, `npm run lint` exits 0
(the new `no-restricted-imports` rule fires zero violations), and the
`mock-data/{destinations,plans,tag-plans}` import grep returns 0.

**Resolution:** Resolved — 13-02 Task 2 repointed all three error components off
`@/lib/config/support` and deleted the file. `tsc --noEmit` is now clean.

## Cross-plan: `npm run build` fails in 13-01's `esim/[slug]` Supabase cutover

**Discovered during:** 13-02 Task 4 (full-suite gate)

**Detail:** `npm run build` fails at "Collecting page data" with:
`Error: cookies was called outside a request scope` —
stack: `generateStaticParams` in `.next/server/app/[locale]/esim/[slug]/page.js`
→ `app/api/referral/code/route.js` → `chunks/991.js`.

`src/app/[locale]/esim/[slug]/page.tsx` was last modified by 13-01
(`f09f1e6 refactor(13-01): repoint 8 mock-data importers off deleted modules`).
13-01's Supabase cutover of that route's `generateStaticParams` reads a request-
scoped API (`cookies()` via the Supabase server client) at build time, which is
illegal inside `generateStaticParams`.

**Scope:** NOT a 13-02 defect. Plan 13-02 touches `src/app/[locale]/help/page.tsx`,
`layout.tsx`, the footer, the 3 error components, and the 6 locale files — none of
these is in the failing stack. 13-02's own surface is fully green: `npm run lint`
exits 0, `npx tsc --noEmit` is clean, `npm test` passes 273/273 (43 todo), the
WhatsApp phase-end grep returns 0, and the build's compile + lint phases (where a
missing `/help` i18n key or a `/help` page error would surface) passed — the build
only fails later in 13-01's `esim/[slug]` page-data collection.

**Resolution:** 13-01 must make `esim/[slug]/page.tsx` `generateStaticParams` use a
non-request-scoped Supabase client (service-role / anon client, not the cookie-based
server client). The phase-merge `npm run build` gate must be re-run by the phase
orchestrator after 13-01 fixes this — it is a phase gate, not a 13-02 per-plan gate.
