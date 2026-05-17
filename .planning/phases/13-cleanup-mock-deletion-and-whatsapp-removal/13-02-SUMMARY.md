---
phase: 13-cleanup-mock-deletion-and-whatsapp-removal
plan: 02
subsystem: infra
tags: [next-intl, i18n, whatsapp-removal, static-route, faq, next-link]

# Dependency graph
requires:
  - phase: 07-internationalization
    provides: next-intl translation infrastructure, locale-aware Link/routing, static-route precedent (privacy/terms)
provides:
  - Static localized /help FAQ route (8 native <details> entries + mailto:geral@kauffen.com contact block)
  - WhatsApp support integration fully removed (button, support.ts config, layout import, 6-locale whatsapp.* namespace)
  - 5 error-state copy strings rewritten to point at /help instead of WhatsApp
  - footer.help link wired alongside privacy/terms
affects: [14-e2e-and-deploy, 13.1-remove-bambu-mascot]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Native <details>/<summary> FAQ accordion — zero-JS, pure server component, keyboard-accessible"
    - "next-intl getTranslations('help') namespace for a fully localized static content route"

key-files:
  created:
    - src/app/[locale]/help/page.tsx
  modified:
    - src/app/[locale]/layout.tsx
    - src/components/layout/legal-footer.tsx
    - src/components/checkout/payment-error.tsx
    - src/components/delivery/provisioning-error.tsx
    - src/components/delivery/setup-guide.tsx
    - messages/en.json
    - messages/pt.json
    - messages/es.json
    - messages/fr.json
    - messages/ja.json
    - messages/zh.json
  deleted:
    - src/components/layout/whatsapp-button.tsx
    - src/components/layout/__tests__/whatsapp-button.test.tsx
    - src/lib/config/support.ts

key-decisions:
  - "Native HTML <details>/<summary> for the FAQ accordion — keeps /help a pure server component with zero client bundle"
  - "errors.generic and dashboard.error_body are copy-only rewrites (plain text); only the 3 error COMPONENTS get a real /help Link"
  - "referral/share-buttons.tsx wa.me share link + shareWhatsapp key preserved — user-initiated referral share, not support"

patterns-established:
  - "Localized static content route via getTranslations + setRequestLocale, mirroring privacy/terms"
  - "Error-state support links are locale-aware internal next/link Links to /{locale}/help (no target=_blank)"

requirements-completed: [INF-13, INF-14]

# Metrics
duration: 22min
completed: 2026-05-17
---

# Phase 13 Plan 02: WhatsApp Removal and /help FAQ Route Summary

**WhatsApp support integration fully stripped (button, config, layout import, 6-locale namespace, 5 error strings) and replaced with a static localized /help FAQ route — 8 native `<details>` entries plus a `mailto:geral@kauffen.com` contact block, linked from the footer and the 3 error-state components.**

## Performance

- **Duration:** 22 min
- **Started:** 2026-05-17T12:58:00Z
- **Completed:** 2026-05-17T13:20:46Z
- **Tasks:** 4
- **Files modified:** 11 (created 1, modified 10, deleted 3)

## Accomplishments

- New `src/app/[locale]/help/page.tsx` — a pure async server component rendering 8 native `<details>`/`<summary>` FAQ entries plus a `mailto:geral@kauffen.com` contact block, statically rendered per locale.
- The full `help` namespace (8 FAQ × {question, answer} + 6 page strings) and a `footer.help` key added and translated across all 6 locale files.
- WhatsApp button, its test stub, and the 100%-WhatsApp `src/lib/config/support.ts` deleted; the commented WhatsApp import/render lines removed from the locale layout.
- The 3 error components (`payment-error`, `provisioning-error`, `setup-guide`) repointed from `WHATSAPP_SUPPORT_URL` to locale-aware `/{locale}/help` internal links; the footer gained a `/help` link.
- The `whatsapp.*` namespace removed from all 6 locale files and the 5 error-state copy strings rewritten to point at the Help page; the `shareWhatsapp` referral key preserved.

## Task Commits

Each task was committed atomically:

1. **Task 1: Ship /help route + help i18n namespace** - `6f845d6` (feat)
2. **Task 2: Delete WhatsApp button/test/support.ts, repoint 3 error components + footer** - `9292364` (feat) — note: the 3 file deletions were staged by `git rm` and landed in commits `6f845d6`/`59f0740` due to parallel 13-01 staging interleave; all 3 files are confirmed untracked and gone from the repo.
3. **Task 3: Strip whatsapp.* namespace + rewrite 5 error strings across 6 locales** - `2a15100` (feat)
4. **Task 4: Full-suite gate** - `8db079e` (docs — logged the 13-01 build blocker found during the gate)

**Plan metadata:** (this SUMMARY + STATE/ROADMAP) — final docs commit

## Files Created/Modified

- `src/app/[locale]/help/page.tsx` - NEW. Pure server component; 8 native `<details>` FAQ entries + mailto contact block, `generateMetadata` via `getTranslations({ namespace: 'help' })`.
- `src/app/[locale]/layout.tsx` - Removed the commented WhatsApp button import and render lines.
- `src/components/layout/legal-footer.tsx` - Added a 3rd `<Link>` to `/{locale}/help` after Terms.
- `src/components/checkout/payment-error.tsx` - Repointed the support `<a>` to a `/{locale}/help` `next/link` Link; dropped the `support.ts` import.
- `src/components/delivery/provisioning-error.tsx` - Same repoint pattern.
- `src/components/delivery/setup-guide.tsx` - Same repoint pattern.
- `messages/{en,pt,es,fr,ja,zh}.json` - Added the `help` namespace + `footer.help`; deleted the `whatsapp.*` namespace; rewrote 5 error strings.
- `src/components/layout/whatsapp-button.tsx`, `src/components/layout/__tests__/whatsapp-button.test.tsx`, `src/lib/config/support.ts` - DELETED.

## Decisions Made

- Native HTML `<details>`/`<summary>` chosen for the FAQ accordion — keyboard-accessible, zero-JS, lets `/help` stay a pure server component (per UI-SPEC locked decision).
- `errors.generic` and `dashboard.error_body` rewritten as copy-only (they render as plain text); only the 3 error *components* get an actual `/help` `<Link>`.
- `referral/share-buttons.tsx` `wa.me` share link and the `shareWhatsapp` i18n key left untouched — intentional referral share, not support.

## Deviations from Plan

None — plan executed exactly as written. All 4 tasks completed per spec; no Rule 1–4 deviations were needed within 13-02's scope.

## Issues Encountered

**`npm run build` fails — but the failure is outside 13-02's scope (logged to `deferred-items.md`).**

During the Task 4 full-suite gate, `npm run build` failed at "Collecting page data" with `Error: cookies was called outside a request scope` — stack: `generateStaticParams` in `app/[locale]/esim/[slug]/page.js`. `src/app/[locale]/esim/[slug]/page.tsx` was last modified by **13-01** (`f09f1e6 refactor(13-01): repoint 8 mock-data importers`). 13-01's Supabase cutover of that route reads a request-scoped `cookies()` API at build time inside `generateStaticParams`, which is illegal.

This is **not** caused by any 13-02 file. Per the SCOPE BOUNDARY rule, it was not fixed here — it was logged to `.planning/phases/13-cleanup-mock-deletion-and-whatsapp-removal/deferred-items.md` for 13-01 to resolve. 13-02's own surface is fully verified:

- `npm run lint` — 0 errors (11 pre-existing unused-var warnings, all in unrelated files, out of scope).
- `npx tsc --noEmit` — clean.
- `npm test` — 273 passed, 43 todo, 51 test files passed (the removed `whatsapp-button.test.tsx` stubs are the only test-count delta).
- `grep -rni "whatsapp|wa.me" src/ messages/ | grep -v share-buttons | grep -vi shareWhatsapp` — returns 0.
- The build's compile + lint phases passed — a missing `/help` i18n key or a `/help` page error would have surfaced there; the build only fails later in 13-01's `esim/[slug]` page-data collection.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- INF-13 (WhatsApp removal) and INF-14 (`/help` static route) are satisfied at the 13-02 level: WhatsApp is fully removed, `/help` ships localized × 6, the footer + 3 error states route there.
- **Phase gate blocker:** the phase-merge `npm run build` gate cannot pass until 13-01 fixes `esim/[slug]/page.tsx` `generateStaticParams` (use a non-request-scoped Supabase client). The phase orchestrator must re-run `npm run build` after that fix before `/gsd:verify-work`.
- Manual-only verifications for VERIFICATION.md (per 13-VALIDATION.md): `/help` visual render of the 8 FAQ entries + mailto, the footer `/help` link navigation, and the 3 error-state Help links navigating to `/{locale}/help`.

## Self-Check: PASSED

- `src/app/[locale]/help/page.tsx` — created, confirmed on disk.
- `whatsapp-button.tsx`, `whatsapp-button.test.tsx`, `support.ts` — confirmed deleted (gone from disk and untracked).
- Commits `6f845d6`, `9292364`, `2a15100`, `8db079e` — all confirmed in git history.

---
*Phase: 13-cleanup-mock-deletion-and-whatsapp-removal*
*Completed: 2026-05-17*
