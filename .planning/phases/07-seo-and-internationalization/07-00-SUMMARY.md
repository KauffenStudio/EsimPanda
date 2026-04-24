---
phase: 07-seo-and-internationalization
plan: 00
subsystem: testing
tags: [vitest, test-stubs, seo, structured-data, sitemap, metadata]

# Dependency graph
requires:
  - phase: 06-account-management
    provides: Complete application with destination pages and eSIM purchase flow
provides:
  - 29 behavioral test stubs defining expected SEO behaviors for Plans 01-03
  - Test targets for structured data, FAQ templates, sitemap, metadata, and static params
affects: [07-01, 07-02, 07-03]

# Tech tracking
tech-stack:
  added: []
  patterns: [wave-0-test-stubs, it.todo-for-behavioral-specs]

key-files:
  created:
    - src/lib/seo/__tests__/structured-data.test.ts
    - src/lib/seo/__tests__/faq-templates.test.ts
    - src/app/__tests__/sitemap.test.ts
    - src/app/[locale]/esim/__tests__/metadata.test.ts
    - src/app/[locale]/esim/__tests__/static-params.test.ts
  modified: []

key-decisions:
  - "All test stubs use it.todo() with no production imports for clean Wave 0 isolation"

patterns-established:
  - "Wave 0 pattern: test stubs define behaviors before implementation begins"

requirements-completed: [GRW-02, GRW-03]

# Metrics
duration: 1min
completed: 2026-04-24
---

# Phase 7 Plan 00: Wave 0 Test Stubs Summary

**29 behavioral test stubs across 5 files defining SEO validation targets for structured data, FAQ templates, sitemap, metadata, and static params**

## Performance

- **Duration:** 1 min
- **Started:** 2026-04-24T22:17:47Z
- **Completed:** 2026-04-24T22:18:31Z
- **Tasks:** 1
- **Files modified:** 5

## Accomplishments
- Created 5 test stub files with 29 it.todo() tests covering all Phase 7 SEO behaviors
- All stubs run cleanly under vitest (5 files skipped, 29 todos, 0 failures)
- Nyquist compliance achieved -- every implementation task in Plans 01-03 has a test target

## Task Commits

Each task was committed atomically:

1. **Task 1: Create 5 behavioral test stubs for Phase 7 validation** - `9d3f855` (test)

## Files Created/Modified
- `src/lib/seo/__tests__/structured-data.test.ts` - Test stubs for JSON-LD generators (Product, FAQ, Breadcrumb)
- `src/lib/seo/__tests__/faq-templates.test.ts` - Test stubs for FAQ template interpolation
- `src/app/__tests__/sitemap.test.ts` - Test stubs for sitemap with hreflang alternates
- `src/app/[locale]/esim/__tests__/metadata.test.ts` - Test stubs for generateMetadata
- `src/app/[locale]/esim/__tests__/static-params.test.ts` - Test stubs for generateStaticParams

## Decisions Made
- All test stubs use it.todo() with no production imports for clean Wave 0 isolation

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All 29 test targets ready for Plans 01-03 to implement against
- Plan 01 (structured data + FAQ templates) can proceed immediately

## Self-Check: PASSED

All 5 test files verified on disk. Commit 9d3f855 verified in git log.

---
*Phase: 07-seo-and-internationalization*
*Completed: 2026-04-24*
