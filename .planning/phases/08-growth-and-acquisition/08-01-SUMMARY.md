---
phase: 08-growth-and-acquisition
plan: 01
subsystem: referral, checkout, ui
tags: [nanoid, zustand, referral, whatsapp, coupons, i18n]

requires:
  - phase: 03-checkout-payment
    provides: Coupon validation system (validateCoupon, Coupon interface)
  - phase: 05-accounts-dashboard
    provides: Auth store pattern, Zustand store conventions
  - phase: 07-seo-i18n
    provides: i18n message files, next-intl setup, locale layout

provides:
  - Referral types, mock data store, and server actions
  - Zustand referral store with fetchReferralData and copyLink
  - Referral redirect route with 7-day httpOnly cookie
  - API routes for referral code, tracking, and reward fulfillment
  - Extended coupon validation for influencer and referral reward coupons
  - WhatsApp floating button with scroll-hide and context messages
  - i18n keys for referral, whatsapp, admin sections (EN/PT/ES/FR)
  - Test coverage for referral actions, redirect, coupon extension

affects: [08-02-referral-ui, 08-03-admin-coupons]

tech-stack:
  added: [nanoid]
  patterns: [referral mock Map store, coupon pool composition, reward single-use via markRewardRedeemed]

key-files:
  created:
    - src/lib/referral/types.ts
    - src/lib/referral/mock.ts
    - src/lib/referral/actions.ts
    - src/stores/referral.ts
    - src/app/r/[code]/route.ts
    - src/app/api/referral/code/route.ts
    - src/app/api/referral/track/route.ts
    - src/app/api/referral/reward/route.ts
    - src/components/layout/whatsapp-button.tsx
    - src/lib/referral/__tests__/actions.test.ts
    - src/app/r/__tests__/redirect.test.ts
    - src/components/layout/__tests__/whatsapp-button.test.tsx
  modified:
    - src/lib/checkout/coupons.ts
    - src/lib/checkout/types.ts
    - src/app/[locale]/layout.tsx
    - src/lib/checkout/__tests__/coupons.test.ts
    - messages/en.json
    - messages/pt.json
    - messages/es.json
    - messages/fr.json

key-decisions:
  - "findMockReferralCodeByCode reverse lookup added for code-based lookups in actions"
  - "Coupon pool composed via spread: [...COUPONS, ...getInfluencerCoupons(), ...getAllActiveRewardCoupons()]"
  - "Referral reward coupons marked redeemed inline during validateCoupon (single-use enforcement)"
  - "WhatsApp button uses useScrollDirection hook with 10px threshold for scroll jitter prevention"

patterns-established:
  - "Referral mock Map store: in-memory Maps keyed by user_id, consistent with Phase 4 pattern"
  - "Coupon pool composition: validateCoupon checks static + influencer + reward pools via spread"
  - "Reward single-use: markRewardRedeemed called on validation, prevents reuse via getAllActiveRewardCoupons filter"

requirements-completed: [GRW-01, GRW-04]

duration: 6min
completed: 2026-04-25
---

# Phase 08 Plan 01: Referral Data Layer and Growth Foundation Summary

**Referral data layer with mock store, coupon system extension for influencer and reward coupons, WhatsApp floating button with scroll-hide, and Wave 0 test coverage**

## Performance

- **Duration:** 6 min
- **Started:** 2026-04-25T08:51:25Z
- **Completed:** 2026-04-25T08:57:30Z
- **Tasks:** 3
- **Files modified:** 20

## Accomplishments
- Referral types, mock data store, server actions (generate, track, reward with self-referral block and monthly cap)
- Extended coupon validation to compose static + influencer + referral reward coupon pools with single-use enforcement
- WhatsApp floating button with context-aware pre-filled messages, scroll-hide on mobile, first-visit pulse animation
- Wave 0 test stubs covering all GRW-01 and GRW-04 validation requirements (18 passing tests)

## Task Commits

Each task was committed atomically:

1. **Task 1: Referral data layer, coupon extension, i18n** - `ba07ab6` (feat)
2. **Task 2: WhatsApp floating button** - `4fb8b9e` (feat)
3. **Task 3: Wave 0 test stubs** - `c2c0092` (test)

## Files Created/Modified
- `src/lib/referral/types.ts` - ReferralCode, ReferralStats, ReferralReward, InfluencerCoupon interfaces
- `src/lib/referral/mock.ts` - In-memory Map store with bridge to coupon pool
- `src/lib/referral/actions.ts` - Server actions: generateReferralCode, trackReferralClick, checkAndFulfillReward
- `src/stores/referral.ts` - Zustand store with fetchReferralData and copyLink
- `src/app/r/[code]/route.ts` - Referral redirect with 7-day httpOnly cookie
- `src/app/api/referral/*/route.ts` - API routes for code, track, reward
- `src/lib/checkout/coupons.ts` - Extended with influencer + reward coupon pools
- `src/lib/checkout/types.ts` - Added type field to Coupon interface
- `src/components/layout/whatsapp-button.tsx` - Floating WhatsApp button component
- `src/app/[locale]/layout.tsx` - WhatsApp button integration
- `messages/*.json` - referral, whatsapp, admin i18n keys in 4 languages

## Decisions Made
- Added findMockReferralCodeByCode for reverse code lookups (plan specified by-userId lookup only)
- Coupon pool composed via spread operator for clean composition of 3 sources
- Referral reward coupons marked redeemed inline during validateCoupon call
- WhatsApp button useScrollDirection with 10px threshold to prevent scroll jitter

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Added findMockReferralCodeByCode to mock.ts**
- **Found during:** Task 1
- **Issue:** actions.ts needed to look up referral codes by code value (not userId), but mock.ts only had getMockReferralCode(userId)
- **Fix:** Added findMockReferralCodeByCode that iterates Map values
- **Files modified:** src/lib/referral/mock.ts
- **Committed in:** ba07ab6

**2. [Rule 1 - Bug] Fixed SameSite case sensitivity in redirect test**
- **Found during:** Task 3
- **Issue:** Test expected 'SameSite=Lax' but Next.js cookies output 'SameSite=lax' (lowercase)
- **Fix:** Changed assertion to case-insensitive check
- **Files modified:** src/app/r/__tests__/redirect.test.ts
- **Committed in:** c2c0092

---

**Total deviations:** 2 auto-fixed (1 blocking, 1 bug)
**Impact on plan:** Both fixes necessary for correctness. No scope creep.

## Issues Encountered
None beyond the auto-fixed deviations above.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Referral data contracts stable for Plan 02 (referral UI page)
- Coupon system extended and tested for Plan 03 (admin coupon management)
- WhatsApp button live on all pages

---
*Phase: 08-growth-and-acquisition*
*Completed: 2026-04-25*
