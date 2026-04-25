---
phase: 09-pwa-and-polish
plan: 03
subsystem: pwa, notifications
tags: [web-push, vapid, zustand, service-worker, push-api, i18n]

# Dependency graph
requires:
  - phase: 09-01
    provides: Service worker with push event handler and CACHE_QR message handler
provides:
  - Push notification infrastructure (VAPID, subscribe/unsubscribe server actions, send utility)
  - Notification preferences Zustand store with localStorage persistence
  - Push permission modal for PWA standalone mode
  - QR offline caching via service worker postMessage
  - Notification i18n keys in all 4 locales
affects: [production-push-notifications, supabase-push-subscriptions]

# Tech tracking
tech-stack:
  added: [web-push, @types/web-push]
  patterns: [push-subscribe-flow, notification-preferences-store, pwa-only-modal]

key-files:
  created:
    - src/lib/push/vapid.ts
    - src/lib/push/actions.ts
    - src/lib/push/send.ts
    - src/stores/notifications.ts
    - src/components/pwa/push-permission-modal.tsx
    - src/components/pwa/push-manager.tsx
    - src/components/dashboard/notification-prefs.tsx
    - src/stores/__tests__/notifications.test.ts
    - src/app/actions/__tests__/push.test.ts
  modified:
    - src/app/[locale]/dashboard/page.tsx
    - src/app/[locale]/layout.tsx
    - src/components/delivery/delivery-page.tsx
    - messages/en.json
    - messages/pt.json
    - messages/es.json
    - messages/fr.json
    - .env.example
    - package.json

key-decisions:
  - "In-memory Map for push subscriptions in mock mode; production migrates to Supabase push_subscriptions table"
  - "QR offline caching uses activation_qr_base64 + manual fields from DeliveryData (not qr_data/setup_guide from plan)"
  - "BufferSource cast for VAPID applicationServerKey to satisfy strict TS typing of Uint8Array"

patterns-established:
  - "Push permission modal: display-mode: standalone check -> 7-day dismissal cooldown -> 2s delay -> show"
  - "Notification preferences: Zustand persist store with esim-panda-notifications localStorage key"
  - "QR caching: postMessage CACHE_QR to service worker on delivery ready"

requirements-completed: [UXD-02, UXD-04]

# Metrics
duration: 5min
completed: 2026-04-25
---

# Phase 09 Plan 03: Push Notifications and Offline QR Summary

**Web Push infrastructure with VAPID config, permission modal for PWA users, notification preference toggles on dashboard, and offline QR caching via service worker**

## Performance

- **Duration:** 5 min
- **Started:** 2026-04-25T12:40:07Z
- **Completed:** 2026-04-25T12:44:55Z
- **Tasks:** 2
- **Files modified:** 21

## Accomplishments
- Push notification infrastructure with web-push, VAPID config, mock-mode server actions, and send utility
- Push permission modal that only appears in PWA standalone mode with 7-day dismissal cooldown
- Dashboard notification preference toggles (expiry, usage, promotions) persisted via Zustand
- QR data cached in service worker for offline access on delivery page
- Wave 0 test stubs for notification store (5 tests) and push actions (3 tests)
- Notification i18n keys in all 4 locale files (en, pt, es, fr)

## Task Commits

Each task was committed atomically:

1. **Task 1: Push notification infrastructure** - `971f4da` (feat)
2. **Task 2: Push permission modal, notification prefs, QR offline caching** - `7a53fad` (feat)

## Files Created/Modified
- `src/lib/push/vapid.ts` - VAPID key configuration
- `src/lib/push/actions.ts` - Server actions for subscribe/unsubscribe/test-send with mock mode
- `src/lib/push/send.ts` - Push notification send utility with web-push
- `src/stores/notifications.ts` - Notification preferences Zustand store with localStorage persistence
- `src/stores/__tests__/notifications.test.ts` - Wave 0 test stub for notification store defaults
- `src/app/actions/__tests__/push.test.ts` - Wave 0 test stub for push action exports
- `src/components/pwa/push-permission-modal.tsx` - PWA-only push permission modal with 7-day cooldown
- `src/components/pwa/push-manager.tsx` - Thin wrapper mounting PushPermissionModal
- `src/components/dashboard/notification-prefs.tsx` - Three toggle rows for notification preferences
- `src/app/[locale]/dashboard/page.tsx` - Added NotificationPrefs component
- `src/app/[locale]/layout.tsx` - Added PushManager component
- `src/components/delivery/delivery-page.tsx` - Added CACHE_QR postMessage for offline QR access
- `messages/en.json` - Notification i18n keys
- `messages/pt.json` - Notification i18n keys (Portuguese)
- `messages/es.json` - Notification i18n keys (Spanish)
- `messages/fr.json` - Notification i18n keys (French)
- `.env.example` - VAPID and push mock env vars documented
- `package.json` - Added web-push and @types/web-push

## Decisions Made
- Used in-memory Map for push subscription storage in mock mode; production will use Supabase push_subscriptions table
- Fixed plan's reference to data.qr_data/setup_guide to use actual DeliveryData fields (activation_qr_base64, smdp_address, manual_activation_code)
- Added BufferSource cast for VAPID applicationServerKey to satisfy strict TypeScript typing

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed QR caching field names to match DeliveryData interface**
- **Found during:** Task 2 (QR offline caching)
- **Issue:** Plan referenced `data.qr_data` and `data.setup_guide` which don't exist on DeliveryData type
- **Fix:** Used `data.activation_qr_base64` for qrData and constructed setupGuide from `data.smdp_address` and `data.manual_activation_code`
- **Files modified:** src/components/delivery/delivery-page.tsx
- **Verification:** `npx tsc --noEmit` passes with no errors in delivery-page.tsx
- **Committed in:** 7a53fad (Task 2 commit)

**2. [Rule 3 - Blocking] Installed @types/web-push for TypeScript support**
- **Found during:** Task 2 (TypeScript compilation check)
- **Issue:** web-push module had no declaration file, causing TS7016 error
- **Fix:** Installed @types/web-push as devDependency
- **Files modified:** package.json, package-lock.json
- **Committed in:** 7a53fad (Task 2 commit)

**3. [Rule 1 - Bug] Cast Uint8Array to BufferSource for applicationServerKey**
- **Found during:** Task 2 (TypeScript compilation check)
- **Issue:** TS2322 - Uint8Array not directly assignable to applicationServerKey's expected type
- **Fix:** Added `as BufferSource` cast
- **Files modified:** src/components/pwa/push-permission-modal.tsx
- **Committed in:** 7a53fad (Task 2 commit)

---

**Total deviations:** 3 auto-fixed (2 bugs, 1 blocking)
**Impact on plan:** All auto-fixes necessary for TypeScript compilation. No scope creep.

## Issues Encountered
- Pre-existing build failures in pay-button.tsx and delivery-page.test.tsx (unrelated to this plan's changes) prevent `npm run build` from completing. These are out of scope.

## User Setup Required
None - push notifications use mock mode by default (NEXT_PUBLIC_PUSH_MOCK=true). For production push, generate VAPID keys with `npx web-push generate-vapid-keys` and set in .env.

## Next Phase Readiness
- Phase 09 Plan 03 is the final plan in Phase 09 (pwa-and-polish)
- All PWA features complete: service worker, install banner, offline indicator, dark mode, push notifications
- Production readiness requires VAPID key generation and Supabase push_subscriptions table

## Self-Check: PASSED

All 9 created files verified. Both task commits (971f4da, 7a53fad) confirmed in git log.

---
*Phase: 09-pwa-and-polish*
*Completed: 2026-04-25*
