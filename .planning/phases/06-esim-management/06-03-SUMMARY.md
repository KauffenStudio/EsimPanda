---
phase: 06-esim-management
plan: 03
subsystem: ui
tags: [stripe, react, motion, qrcode, sonner]

requires:
  - phase: 06-01
    provides: dashboard types, store, API routes, i18n keys
  - phase: 06-02
    provides: dashboard page with tabs, eSIM cards, gauge components
provides:
  - Top-up payment modal with Stripe Elements integration
  - Purchase history list with expandable rows
  - QR code re-access from purchase history
  - Email re-send from purchase history
  - Full dashboard page wiring (TopUpModal + PurchaseHistoryList)
affects: []

tech-stack:
  added: []
  patterns: [fresh-stripe-elements-per-modal, expandable-row-pattern, svg-classname-getattribute]

key-files:
  created:
    - src/components/dashboard/top-up-modal.tsx
    - src/components/dashboard/top-up-plan-card.tsx
    - src/components/dashboard/purchase-history-list.tsx
    - src/components/dashboard/purchase-history-row.tsx
    - src/components/dashboard/__tests__/top-up-modal.test.tsx
    - src/components/dashboard/__tests__/purchase-history-row.test.tsx
  modified:
    - src/app/[locale]/dashboard/page.tsx
    - messages/en.json

key-decisions:
  - "SVG className in jsdom is SVGAnimatedString — use getAttribute('class') instead of .className for SVG element assertions"
  - "TopUpModal reads all state from Zustand store (no props) — always mounted, visibility controlled by store"
  - "PurchaseHistoryRow handles email re-send internally via resendDeliveryEmail action + toast"

patterns-established:
  - "Fresh Stripe Elements provider per modal session: mount <Elements> inside modal, not at page level"
  - "Expandable row pattern: aria-expanded button trigger + AnimatePresence + motion.div height auto"

requirements-completed: [MGT-02, MGT-04]

duration: 8min
completed: 2026-04-24
---

# Plan 06-03: Top-Up Modal + Purchase History Summary

**Top-up payment modal with fresh Stripe Elements per session, purchase history with expandable rows showing order details/VAT/ICCID, inline QR re-access, and email re-send — all wired into dashboard page**

## Performance

- **Duration:** 8 min
- **Tasks:** 2
- **Files created:** 6
- **Files modified:** 2

## Accomplishments
- Top-up modal with plan selection cards, Stripe payment integration, optimistic card update + toast on success
- Purchase history list with expandable rows showing full order details (order ID, plan, payment, coupon, VAT, ICCID)
- Inline QR code re-access via QRCodeDisplay component reuse
- Email re-send button with toast feedback
- Dashboard page fully wired: TopUpModal + PurchaseHistoryList replacing placeholder

## Task Commits

1. **Task 1: Top-up modal** - `541a17b` (test) + `1c72d20` (feat)
2. **Task 2: Purchase history + dashboard wiring** - `7d25a8d` (test) + `a79e633` (feat)

## Files Created/Modified
- `src/components/dashboard/top-up-modal.tsx` - Modal with plan selection, Stripe Elements, state machine
- `src/components/dashboard/top-up-plan-card.tsx` - Plan duration/price card for top-up selection
- `src/components/dashboard/purchase-history-list.tsx` - Chronological list wrapper with empty state
- `src/components/dashboard/purchase-history-row.tsx` - Expandable row with details, QR, email re-send
- `src/app/[locale]/dashboard/page.tsx` - Wired TopUpModal + PurchaseHistoryList, added resend handler

## Decisions Made
- SVG elements in jsdom use SVGAnimatedString for className — fixed tests to use getAttribute('class') instead
- TopUpModal is zero-prop (reads store directly) — simplifies page wiring

## Deviations from Plan

### Auto-fixed Issues

**1. [Test Fix] SVG className assertion incompatible with jsdom**
- **Found during:** Task 2 (PurchaseHistoryRow tests)
- **Issue:** `element.className` returns SVGAnimatedString for `<svg>` in jsdom, causing `.toContain()` to fail
- **Fix:** Changed to `element.getAttribute('class')` for SVG element class assertions
- **Files modified:** src/components/dashboard/__tests__/purchase-history-row.test.tsx
- **Verification:** All 6 PurchaseHistoryRow tests pass
- **Committed in:** a79e633

**2. [Test Fix] getByText exact match fails with flag emoji prefix**
- **Found during:** Task 2 (PurchaseHistoryRow tests)
- **Issue:** `getByText('Italy')` fails because rendered text is "🇮🇹 Italy" (flag emoji + destination in single span)
- **Fix:** Changed to regex matcher `getByText(/Italy/)`
- **Verification:** Test passes
- **Committed in:** a79e633

---

**Total deviations:** 2 auto-fixed (both test assertion fixes)
**Impact on plan:** Minor test fixes, no scope creep.

## Issues Encountered
- Agent hit rate limit mid-execution during Task 2 — completed manually with test fixes

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Phase 6 dashboard fully functional with all 4 requirements (MGT-01 through MGT-04)
- 182 tests passing across 36 test files
- Ready for phase verification

---
*Phase: 06-esim-management*
*Completed: 2026-04-24*
