---
phase: 05-user-accounts
plan: 03
subsystem: auth
tags: [password-reset, resend, react-email, guest-conversion, order-linking, supabase]

requires:
  - phase: 05-user-accounts-01
    provides: auth actions with stubs for sendResetEmail and linkOrdersByEmail
  - phase: 04-delivery
    provides: branded email template pattern via Resend + React Email
provides:
  - Forgot/reset password pages with branded email via Resend
  - Guest-to-account conversion CTA on delivery page
  - Order auto-linking by email on guest conversion
  - Complete auth feature set (login, signup, reset, guest conversion)
affects: [06-dashboard, user-accounts]

tech-stack:
  added: []
  patterns:
    - "Stub replacement: Plan 01 creates stubs, Plan 03 replaces with real imports"
    - "Order auto-linking: match guest email to orders with null user_id"

key-files:
  created:
    - src/components/auth/forgot-password-form.tsx
    - src/components/auth/reset-password-form.tsx
    - src/components/auth/account-conversion-cta.tsx
    - src/app/[locale]/forgot-password/page.tsx
    - src/app/[locale]/reset-password/page.tsx
    - src/lib/email/send-reset.ts
    - src/lib/email/templates/reset-email.tsx
    - src/lib/email/__tests__/send-reset.test.ts
    - src/lib/auth/order-linking.ts
    - src/lib/auth/__tests__/order-linking.test.ts
  modified:
    - src/lib/auth/actions.ts
    - src/components/delivery/delivery-page.tsx
    - src/components/delivery/__tests__/delivery-page.test.tsx
    - src/lib/auth/__tests__/actions.test.ts

key-decisions:
  - "Branded reset email via Resend (not Supabase default) using admin.generateLink pattern from Plan 01"
  - "Order auto-linking silently handles errors -- account creation already succeeded, linking is best-effort"

patterns-established:
  - "Anti-enumeration: forgot password always returns success regardless of email existence"
  - "Guest conversion CTA: password-only field with hidden email from checkout context"

requirements-completed: [ACC-01, ACC-03]

duration: 8min
completed: 2026-04-24
---

# Phase 05 Plan 03: Password Reset and Guest Conversion Summary

**Branded password reset flow via Resend, guest-to-account conversion CTA on delivery page with automatic order linking by email**

## Performance

- **Duration:** 8 min
- **Started:** 2026-04-24T09:09:49Z
- **Completed:** 2026-04-24T09:18:00Z
- **Tasks:** 2
- **Files modified:** 14

## Accomplishments
- Forgot password page with anti-enumeration success message and branded reset email via Resend
- Reset password page with password match validation and show/hide toggle
- Guest-to-account conversion CTA on delivery page: password-only field, hidden email, Bambu success animation
- Order auto-linking module wired into convertGuestToAccount -- guest orders get user_id on conversion
- Both Plan 01 stubs (sendResetEmail, linkOrdersByEmail) replaced with real imports

## Task Commits

Each task was committed atomically:

1. **Task 1: Forgot/reset password forms, pages, branded reset email, and wire sendResetEmail** - `0d8aa32` (feat)
2. **Task 2: Order auto-linking module, wire into actions.ts, and guest conversion CTA** - `f54eae7` (feat)

## Files Created/Modified
- `src/components/auth/forgot-password-form.tsx` - Email form with "Check Your Email" success state
- `src/components/auth/reset-password-form.tsx` - New password + confirm with match validation
- `src/components/auth/account-conversion-cta.tsx` - Delivery page guest-to-account CTA with 3 states
- `src/app/[locale]/forgot-password/page.tsx` - Forgot password page route
- `src/app/[locale]/reset-password/page.tsx` - Reset password page route
- `src/lib/email/send-reset.ts` - Password reset email sender via Resend with mock mode
- `src/lib/email/templates/reset-email.tsx` - Branded React Email template (blue header, Plus Jakarta Sans)
- `src/lib/email/__tests__/send-reset.test.ts` - 4 tests for mock/production/error modes
- `src/lib/auth/order-linking.ts` - Auto-link guest orders by email with null user_id
- `src/lib/auth/__tests__/order-linking.test.ts` - 3 tests for mock/production/error modes
- `src/lib/auth/actions.ts` - Replaced both stubs with real imports
- `src/components/delivery/delivery-page.tsx` - Added AccountConversionCTA after SetupGuide
- `src/components/delivery/__tests__/delivery-page.test.tsx` - Added useLocale mock
- `src/lib/auth/__tests__/actions.test.ts` - Updated mocks for real sendResetEmail and linkOrdersByEmail

## Decisions Made
- Branded reset email via Resend (not Supabase default) using admin.generateLink pattern from Plan 01
- Order auto-linking silently handles errors -- account creation already succeeded, linking is best-effort
- Anti-enumeration: forgot password always returns success regardless of email existence

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Updated existing test mocks for real module imports**
- **Found during:** Task 2 (after wiring real imports)
- **Issue:** Existing actions.test.ts and delivery-page.test.tsx failed because real imports now require resend mock, supabase `from()` mock, and next-intl `useLocale` mock
- **Fix:** Added resend class mock, `from` chain mock to supabase, and `useLocale` to next-intl mock
- **Files modified:** src/lib/auth/__tests__/actions.test.ts, src/components/delivery/__tests__/delivery-page.test.tsx
- **Verification:** All 144 tests pass
- **Committed in:** f54eae7 (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (1 bug)
**Impact on plan:** Test mock update necessary for correctness after stub replacement. No scope creep.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Full auth feature set complete: login, signup, password reset, guest conversion
- Order auto-linking ready for production (currently mock mode in dev)
- Phase 05 user-accounts is now complete (all 3 plans done)

---
*Phase: 05-user-accounts*
*Completed: 2026-04-24*
