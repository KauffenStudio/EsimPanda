---
phase: 05
slug: user-accounts
status: draft
nyquist_compliant: true
wave_0_complete: true
created: 2026-04-23
---

# Phase 05 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.1.4 |
| **Config file** | vitest.config.ts |
| **Quick run command** | `npx vitest run --reporter=verbose` |
| **Full suite command** | `npx vitest run --coverage` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run --reporter=verbose`
- **After every plan wave:** Run `npx vitest run --coverage`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 05-01-01 | 01 | 1 | ACC-01, ACC-02, ACC-03 | unit | `npx vitest run src/lib/auth/__tests__/actions.test.ts` | TDD inline | pending |
| 05-01-02 | 01 | 1 | ACC-04 | unit | `npx vitest run src/stores/__tests__/auth.test.ts` | TDD inline | pending |
| 05-03-01 | 03 | 2 | ACC-03 | unit | `npx vitest run src/lib/email/__tests__/send-reset.test.ts` | Task creates | pending |
| 05-03-02 | 03 | 2 | ACC-01 | unit | `npx vitest run src/lib/auth/__tests__/order-linking.test.ts` | Task creates | pending |

*Status: pending -- green -- red -- flaky*

---

## Wave 0 Requirements

Plan 01 Task 1 is `tdd=true` and creates test files inline as part of the TDD red-green-refactor cycle. Plan 03 creates additional test files within its tasks. No separate Wave 0 task is needed.

- [x] `src/lib/auth/__tests__/actions.test.ts` — created by Plan 01 Task 1 (tdd=true, inline)
- [x] `src/stores/__tests__/auth.test.ts` — created by Plan 01 Task 2 (inline)
- [x] `src/lib/email/__tests__/send-reset.test.ts` — created by Plan 03 Task 1 (inline)
- [x] `src/lib/auth/__tests__/order-linking.test.ts` — created by Plan 03 Task 2 (inline)

*Wave 0 is satisfied by inline test creation within TDD and standard tasks.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Login form renders with Bambu wave | ACC-02 | React rendering + animation | Navigate to /en/login, verify form fields and Bambu pose |
| Password reset email branded correctly | ACC-03 | Requires running Resend or inspecting React Email preview | Trigger reset, check console in mock mode for email content |
| Header avatar/dropdown after login | ACC-04 | UI state transition | Log in, verify header changes from "Log in" to avatar circle |
| Guest conversion CTA on delivery page | ACC-01 | Requires completing mock checkout first | Complete checkout, verify password-only CTA appears on success page |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references (fulfilled by inline TDD)
- [x] No watch-mode flags
- [x] Feedback latency < 15s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** approved
