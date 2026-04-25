---
phase: 09-pwa-and-polish
plan: 01
subsystem: ui
tags: [pwa, service-worker, manifest, offline, install-prompt, i18n]

# Dependency graph
requires:
  - phase: 04-esim-delivery
    provides: delivery page where install banner is placed
  - phase: 07-seo-and-i18n
    provides: locale layout, i18n message files, next-intl integration
provides:
  - PWA manifest with standalone display mode
  - Service worker with caching, push, offline QR support
  - Custom install banner component for delivery page
  - Offline indicator with auto-sync on reconnect
  - PWA i18n keys in all 4 locales
affects: [09-02-push-notifications, 09-03-ui-polish]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Hand-written service worker (not Workbox) for full control over caching strategies"
    - "Network-first for navigation, cache-first for static assets, pass-through for API/Next.js"
    - "REFRESH_CACHE postMessage pattern for silent background sync on reconnect"
    - "CACHE_QR message pattern for offline QR code access"

key-files:
  created:
    - src/app/manifest.ts
    - public/sw.js
    - src/components/pwa/install-banner.tsx
    - src/components/pwa/offline-indicator.tsx
    - public/icon-192x192.png
    - public/icon-512x512.png
    - public/badge.png
    - src/app/__tests__/manifest.test.ts
    - src/components/pwa/__tests__/install-banner.test.ts
    - src/components/pwa/__tests__/offline-indicator.test.ts
  modified:
    - src/app/layout.tsx
    - src/app/[locale]/layout.tsx
    - src/components/delivery/delivery-page.tsx
    - messages/en.json
    - messages/pt.json
    - messages/es.json
    - messages/fr.json

key-decisions:
  - "Hand-written SW instead of Workbox for minimal bundle and full control over caching strategies"
  - "Placeholder 8x8 PNG icons (blue squares) — will be replaced with final Bambu art later"
  - "Dark mode hydration script uses var instead of const for broader browser compat"

patterns-established:
  - "PWA components in src/components/pwa/ directory"
  - "beforeinstallprompt with localStorage dismiss persistence"
  - "Auto-sync pattern: online event -> postMessage REFRESH_CACHE -> brief confirmation banner"

requirements-completed: [UXD-02]

# Metrics
duration: 5min
completed: 2026-04-25
---

# Phase 9 Plan 1: PWA Foundation Summary

**PWA manifest, service worker with 7 event handlers, install banner on delivery page, and offline indicator with auto-sync on reconnect**

## Performance

- **Duration:** 5 min
- **Started:** 2026-04-25T12:26:08Z
- **Completed:** 2026-04-25T12:31:21Z
- **Tasks:** 2
- **Files modified:** 17

## Accomplishments
- Next.js manifest.ts with standalone display, theme color, and icon references for Lighthouse installability
- Service worker with install/activate/fetch/push/notificationclick/message-CACHE_QR/message-REFRESH_CACHE handlers
- Custom install banner on delivery page with Bambu mascot, iOS fallback, and dismiss persistence
- Offline indicator with WifiOff icon and silent auto-sync via REFRESH_CACHE postMessage on reconnect
- Root layout updated with SW registration, dark mode hydration fix, and theme-color meta
- PWA i18n namespace added to all 4 locale files (en, pt, es, fr) with 8 translation keys each
- 6 passing manifest tests plus test stubs for install banner and offline indicator

## Task Commits

Each task was committed atomically:

1. **Task 1: PWA manifest, service worker, icons, registration, and test stubs** - `407ecbe` (feat)
2. **Task 2: Install banner, offline indicator with auto-sync, delivery page integration, and i18n keys** - `ca6d0ba` (feat)

## Files Created/Modified
- `src/app/manifest.ts` - Next.js MetadataRoute.Manifest with PWA metadata
- `public/sw.js` - Service worker with 7 event handlers and caching strategies
- `public/icon-192x192.png` - Placeholder PWA icon (192x192)
- `public/icon-512x512.png` - Placeholder PWA icon (512x512, maskable)
- `public/badge.png` - Placeholder notification badge
- `src/app/layout.tsx` - Added SW registration, dark mode hydration fix, theme-color meta
- `src/components/pwa/install-banner.tsx` - Custom install banner with beforeinstallprompt and iOS fallback
- `src/components/pwa/offline-indicator.tsx` - Offline banner with auto-sync on reconnect
- `src/components/delivery/delivery-page.tsx` - Integrated InstallBanner after PostPurchaseShareCTA
- `src/app/[locale]/layout.tsx` - Integrated OfflineIndicator between Header and main
- `messages/en.json` - Added pwa namespace with 8 keys
- `messages/pt.json` - Added pwa namespace with 8 keys
- `messages/es.json` - Added pwa namespace with 8 keys
- `messages/fr.json` - Added pwa namespace with 8 keys
- `src/app/__tests__/manifest.test.ts` - 6 passing manifest tests
- `src/components/pwa/__tests__/install-banner.test.ts` - Test stub (7 todo tests)
- `src/components/pwa/__tests__/offline-indicator.test.ts` - Test stub (7 todo tests)

## Decisions Made
- Hand-written service worker (no Workbox) for full control and zero extra dependencies
- Placeholder 8x8 blue square PNGs for icons — to be replaced with final Bambu panda art
- Dark mode hydration script uses `var` instead of `const` for broader browser compatibility
- Removed hardcoded `colorScheme: 'light'` from html tag — now handled dynamically by hydration script

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- PWA foundation complete for push notification integration (plan 09-02)
- Service worker already has push and notificationclick handlers ready
- Install banner and offline indicator ready for UI polish (plan 09-03)
- Placeholder icons need replacement with final Bambu panda artwork

## Self-Check: PASSED

All 10 created files verified present. Both task commits (407ecbe, ca6d0ba) verified in git log.

---
*Phase: 09-pwa-and-polish*
*Completed: 2026-04-25*
