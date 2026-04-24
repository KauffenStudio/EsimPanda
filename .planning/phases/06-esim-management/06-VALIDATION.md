---
phase: 06
slug: esim-management
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-24
---

# Phase 06 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.1.4 |
| **Config file** | vitest.config.ts |
| **Quick run command** | `npx vitest run --reporter=verbose` |
| **Full suite command** | `npx vitest run --coverage` |
| **Estimated runtime** | ~20 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run --reporter=verbose`
- **After every plan wave:** Run `npx vitest run --coverage`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 20 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 06-01-01 | 01 | 1 | MGT-01 | unit | `npx vitest run src/stores/__tests__/dashboard.test.ts` | W0 | pending |
| 06-01-02 | 01 | 1 | MGT-01, MGT-03 | unit | `npx vitest run src/lib/esim/__tests__/usage.test.ts` | W0 | pending |
| 06-02-01 | 02 | 1 | MGT-02 | unit | `npx vitest run src/lib/esim/__tests__/topup.test.ts` | W0 | pending |
| 06-02-02 | 02 | 1 | MGT-04 | unit | `npx vitest run src/lib/esim/__tests__/history.test.ts` | W0 | pending |

*Status: pending -- green -- red -- flaky*

---

## Wave 0 Requirements

- [ ] `src/stores/__tests__/dashboard.test.ts` — stubs for MGT-01 (dashboard store, eSIM card data)
- [ ] `src/lib/esim/__tests__/usage.test.ts` — stubs for MGT-03 (usage fetch, cache, refresh)
- [ ] `src/lib/esim/__tests__/topup.test.ts` — stubs for MGT-02 (top-up action, payment intent)
- [ ] `src/lib/esim/__tests__/history.test.ts` — stubs for MGT-04 (purchase history fetch, order details)

*Wave 0 test files will be created by TDD tasks inline or as Wave 0 setup.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Circular gauge renders with correct fill | MGT-01, MGT-03 | SVG visual rendering | Navigate to /en/dashboard, verify gauge shows data % |
| Low-data banner appears at threshold | MGT-03 | UI state + visual | Mock eSIM at 15% data, verify amber banner renders |
| Top-up modal opens from card CTA | MGT-02 | React portal + animation | Click "Top Up" on card, verify modal overlay appears |
| Purchase history expandable row | MGT-04 | UI interaction | Click row, verify details expand with order info |
| Protected route redirect | MGT-01 | Middleware + redirect | Visit /dashboard logged out, verify redirect to /login?next=/dashboard |
| QR code re-access in history | MGT-04 | Requires prior purchase data | Expand history row, click "View QR Code", verify display |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 20s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
