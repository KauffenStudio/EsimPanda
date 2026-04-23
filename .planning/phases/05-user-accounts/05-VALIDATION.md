---
phase: 05
slug: user-accounts
status: draft
nyquist_compliant: false
wave_0_complete: false
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
| 05-01-01 | 01 | 1 | ACC-01, ACC-02, ACC-03 | unit | `npx vitest run src/lib/auth/__tests__/actions.test.ts` | ❌ W0 | ⬜ pending |
| 05-01-02 | 01 | 1 | ACC-04 | unit | `npx vitest run src/stores/__tests__/auth.test.ts` | ❌ W0 | ⬜ pending |
| 05-01-03 | 01 | 1 | ACC-03 | unit | `npx vitest run src/lib/email/__tests__/send-reset.test.ts` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/lib/auth/__tests__/actions.test.ts` — stubs for ACC-01 (signUp/conversion), ACC-02 (signIn), ACC-03 (resetPassword, updatePassword)
- [ ] `src/stores/__tests__/auth.test.ts` — stubs for ACC-04 (store initialization, onAuthStateChange)
- [ ] `src/lib/email/__tests__/send-reset.test.ts` — stubs for ACC-03 (reset email sending, mock mode)

*If none: "Existing infrastructure covers all phase requirements."*

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

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
