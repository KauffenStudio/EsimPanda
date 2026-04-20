---
phase: 01-foundation-and-design-system
plan: 03
subsystem: infra, i18n, ui
tags: [next-intl, i18n, cron, celitech, catalog-sync, app-shell]

requires:
  - phase: 01-01
    provides: Supabase client, provider abstraction, CELITECH adapter, DB schema
  - phase: 01-02
    provides: Layout components (Header, BottomNav, PageTransition), Bambu poses
provides:
  - next-intl i18n framework with [locale] route segments
  - Catalog sync cron endpoint pulling CELITECH data into Supabase
  - App shell with Header, BottomNav, PageTransition integrated
  - Page routes: /, /browse, /dashboard, /profile
affects: [catalog-browsing, checkout, landing-page, seo]

tech-stack:
  added: [next-intl]
  patterns: [locale-prefixed-routing, cron-sync-pattern, layout-shell]

key-files:
  created:
    - src/i18n/routing.ts
    - src/i18n/request.ts
    - src/middleware.ts
    - messages/en.json
    - src/app/[locale]/layout.tsx
    - src/app/[locale]/page.tsx
    - src/app/[locale]/browse/page.tsx
    - src/app/[locale]/dashboard/page.tsx
    - src/app/[locale]/profile/page.tsx
    - src/app/api/cron/sync-catalog/route.ts
    - src/lib/esim/sync.ts
  modified:
    - next.config.ts
    - src/components/layout/bottom-nav.tsx
    - src/components/layout/header.tsx

key-decisions:
  - "next-intl with [locale] route segment for i18n — middleware redirects / to /en"
  - "Catalog sync as Next.js API route with CRON_SECRET auth, 60% markup applied during sync"
  - "Nav links use useLocale() for locale-aware hrefs"

patterns-established:
  - "i18n routing: all pages under src/app/[locale]/, translations in messages/{locale}.json"
  - "Cron sync: POST /api/cron/sync-catalog with Authorization: Bearer CRON_SECRET"
  - "Layout shell: Header + main (with PageTransition) + BottomNav in locale layout"

requirements-completed: [INF-06, INF-02]

duration: 12min
completed: 2026-04-20
---

# Plan 01-03: i18n, Catalog Sync & App Shell Summary

**next-intl i18n wiring with [locale] routing, CELITECH catalog sync cron endpoint with 60% markup, and full app shell integrating design system layout components**

## Performance

- **Duration:** 12 min
- **Tasks:** 3 (2 auto + 1 human-verify)
- **Files modified:** 16

## Accomplishments
- next-intl i18n framework with middleware redirect, [locale] route segments, EN translations
- Catalog sync endpoint pulling CELITECH destinations/packages into Supabase with 60% markup
- App shell with Header, BottomNav (spring-animated), PageTransition (slide+fade) on all routes
- All 4 page routes working: /, /browse, /dashboard, /profile

## Task Commits

1. **Task 1: i18n wiring + layout shell** - `cd15056` (feat)
2. **Task 2: Catalog sync cron** - `04b8f71` (feat)
3. **Task 3: Human verification** - `c0efb0d` (fix: locale-aware nav + profile page)

## Files Created/Modified
- `src/i18n/routing.ts` - Locale routing config (EN default)
- `src/i18n/request.ts` - Server request locale resolution
- `src/middleware.ts` - next-intl middleware for locale redirect
- `messages/en.json` - English translation keys
- `src/app/[locale]/layout.tsx` - Locale layout with Header/BottomNav/PageTransition
- `src/app/[locale]/page.tsx` - Landing page
- `src/app/[locale]/browse/page.tsx` - Browse destinations placeholder
- `src/app/[locale]/dashboard/page.tsx` - Dashboard with Bambu empty state
- `src/app/[locale]/profile/page.tsx` - Profile placeholder
- `src/app/api/cron/sync-catalog/route.ts` - Cron endpoint with CRON_SECRET auth
- `src/lib/esim/sync.ts` - Sync logic: fetch CELITECH → upsert Supabase with markup

## Decisions Made
- Used `useLocale()` from next-intl in client components for locale-aware nav links
- Profile page added during human verification (was missing from original plan)

## Deviations from Plan

### Auto-fixed Issues

**1. Nav links missing locale prefix**
- **Found during:** Task 3 (human verification)
- **Issue:** BottomNav and Header linked to `/browse` instead of `/en/browse` — tabs didn't navigate
- **Fix:** Added `useLocale()` hook, built locale-prefixed hrefs
- **Files modified:** src/components/layout/bottom-nav.tsx, src/components/layout/header.tsx
- **Verification:** All tabs navigate correctly, build passes
- **Committed in:** c0efb0d

**2. Missing profile page**
- **Found during:** Task 3 (human verification)
- **Issue:** Profile tab linked to non-existent route
- **Fix:** Created profile page with Bambu empty state, added translation keys
- **Files modified:** src/app/[locale]/profile/page.tsx, messages/en.json
- **Committed in:** c0efb0d

---

**Total deviations:** 2 auto-fixed during human verification
**Impact on plan:** Essential fixes for navigation functionality. No scope creep.

## Issues Encountered
None beyond the deviations above.

## Next Phase Readiness
- i18n framework ready for additional languages (Phase 7)
- Catalog sync ready to populate real data once CELITECH sandbox is connected
- App shell ready for feature pages (browse, checkout, dashboard)
- Design system components available for all future phases

---
*Phase: 01-foundation-and-design-system*
*Completed: 2026-04-20*
