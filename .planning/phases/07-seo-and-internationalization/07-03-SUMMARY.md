---
phase: 07-seo-and-internationalization
plan: 03
subsystem: seo
tags: [sitemap, robots-txt, hreflang, language-switcher, i18n, navigation]

# Dependency graph
requires:
  - phase: 07-seo-and-internationalization
    provides: Multi-locale routing, navigation module, destination landing pages
  - phase: 01-foundation
    provides: Mock data layer (destinations), browse page components
provides:
  - Dynamic sitemap with hreflang alternates for all 4 locales
  - robots.txt allowing crawlers with sitemap reference
  - Language switcher component (mobile bottom nav + desktop header)
  - Browse page cards linking to destination landing pages (no accordion)
affects: [07-04, search-indexing, crawlability]

# Tech tracking
tech-stack:
  added: []
  patterns: [Next.js MetadataRoute.Sitemap with hreflang alternates, locale-aware navigation via useRouter/usePathname from i18n/navigation]

key-files:
  created: [src/app/sitemap.ts, src/app/robots.ts, src/components/layout/language-switcher.tsx]
  modified: [src/components/layout/bottom-nav.tsx, src/components/layout/header.tsx, src/components/browse/destination-card.tsx, src/components/browse/destination-grid.tsx]

key-decisions:
  - "Language switcher placed in both bottom nav (mobile) and header (desktop) for universal access"
  - "Dropdown opens upward on mobile (bottom-full) and downward on desktop (top-full) via responsive classes"
  - "Destination cards use useRouter.push instead of Link for click handler compatibility with Card component"

patterns-established:
  - "Import LanguageSwitcher from @/components/layout/language-switcher for locale switching UI"
  - "router.replace(pathname, { locale }) pattern for locale switching without full page reload"

requirements-completed: [GRW-02, GRW-03]

# Metrics
duration: 2min
completed: 2026-04-24
---

# Phase 7 Plan 3: Sitemap, Robots, Language Switcher, and Browse Rewiring Summary

**Dynamic sitemap with hreflang for 13 destinations x 4 locales, robots.txt, language switcher in nav, and browse cards linking to destination pages**

## Performance

- **Duration:** 2 min
- **Started:** 2026-04-24T22:26:59Z
- **Completed:** 2026-04-24T22:29:20Z
- **Tasks:** 2
- **Files modified:** 7

## Accomplishments
- Created dynamic sitemap generating entries for 13 active destinations and 2 static pages, each with hreflang alternates for en/pt/es/fr
- Added robots.txt allowing all crawlers and referencing sitemap.xml
- Built language switcher component with Globe icon, 4-locale dropdown, outside-click-to-close, responsive positioning
- Rewired browse page destination cards from accordion toggle to navigation to /[locale]/esim/[slug]
- Removed PlanAccordion, PlanList, DurationFilter, and expandedDestination from browse grid

## Task Commits

Each task was committed atomically:

1. **Task 1: Create sitemap.ts and robots.ts** - `9eb2aad` (feat)
2. **Task 2: Create language switcher and rewire browse page** - `d5ee5e0` (feat)

## Files Created/Modified
- `src/app/sitemap.ts` - Dynamic sitemap with hreflang alternates for all locales
- `src/app/robots.ts` - robots.txt config allowing crawlers, referencing sitemap
- `src/components/layout/language-switcher.tsx` - Locale switching dropdown with Globe icon
- `src/components/layout/bottom-nav.tsx` - Added LanguageSwitcher as 5th element
- `src/components/layout/header.tsx` - Added LanguageSwitcher next to UserMenu/ThemeToggle
- `src/components/browse/destination-card.tsx` - Navigate to destination page on click
- `src/components/browse/destination-grid.tsx` - Removed accordion, simplified to direct card grid

## Decisions Made
- Language switcher placed in both bottom nav (mobile) and header (desktop) for universal access
- Dropdown opens upward on mobile and downward on desktop via responsive CSS classes
- Destination cards use useRouter.push for navigation (compatible with Card onClick)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical] Added LanguageSwitcher to header.tsx for desktop**
- **Found during:** Task 2
- **Issue:** Plan suggested adding to header OR bottom-nav for desktop; header is the correct place for desktop users
- **Fix:** Imported and rendered LanguageSwitcher in header between nav links and user menu
- **Files modified:** src/components/layout/header.tsx
- **Verification:** TypeScript compiles without errors
- **Committed in:** d5ee5e0

---

**Total deviations:** 1 auto-fixed (1 missing critical)
**Impact on plan:** Essential for desktop users to access language switcher. No scope creep.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Sitemap and robots.txt ready for search engine crawling
- Language switcher enables user locale switching across all pages
- Browse page now serves as a gateway to destination landing pages
- Ready for 07-04 (final SEO polish/optimization)

---
*Phase: 07-seo-and-internationalization*
*Completed: 2026-04-24*
