---
phase: 08
slug: growth-and-acquisition
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-25
---

# Phase 08 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest 3.x with jsdom |
| **Config file** | vitest.config.ts |
| **Quick run command** | `npx vitest run --reporter=verbose` |
| **Full suite command** | `npx vitest run` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run --reporter=verbose`
- **After every plan wave:** Run `npx vitest run`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 08-00-01 | 00 | 0 | GRW-01a | unit | `npx vitest run src/lib/referral/__tests__/actions.test.ts -t "generate"` | ❌ W0 | ⬜ pending |
| 08-00-02 | 00 | 0 | GRW-01b | unit | `npx vitest run src/app/r/__tests__/redirect.test.ts` | ❌ W0 | ⬜ pending |
| 08-00-03 | 00 | 0 | GRW-01c | unit | `npx vitest run src/lib/referral/__tests__/actions.test.ts -t "self-referral"` | ❌ W0 | ⬜ pending |
| 08-00-04 | 00 | 0 | GRW-01d | unit | `npx vitest run src/lib/referral/__tests__/actions.test.ts -t "cap"` | ❌ W0 | ⬜ pending |
| 08-00-05 | 00 | 0 | GRW-01e | unit | `npx vitest run src/lib/referral/__tests__/actions.test.ts -t "reward coupon"` | ❌ W0 | ⬜ pending |
| 08-00-06 | 00 | 0 | GRW-01f | unit | `npx vitest run src/lib/checkout/__tests__/coupons.test.ts` | ❌ W0 | ⬜ pending |
| 08-00-07 | 00 | 0 | GRW-04a | unit | `npx vitest run src/components/layout/__tests__/whatsapp-button.test.tsx` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/lib/referral/__tests__/actions.test.ts` — stubs for GRW-01a, GRW-01c, GRW-01d, GRW-01e
- [ ] `src/app/r/__tests__/redirect.test.ts` — stubs for GRW-01b
- [ ] `src/lib/checkout/__tests__/coupons.test.ts` — extend existing for GRW-01f (influencer coupon validation)
- [ ] `src/components/layout/__tests__/whatsapp-button.test.tsx` — stubs for GRW-04a

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| WhatsApp button scroll hide/show on mobile | GRW-04 | Requires real scroll events in mobile viewport | Open on mobile, scroll down (button hides), scroll up (reappears) |
| Web Share API native sheet | GRW-01 | Browser-level native share dialog | Click share button on mobile device, verify native share sheet opens |
| WhatsApp opens correct chat with pre-filled message | GRW-04 | Requires WhatsApp installed on device | Click WhatsApp button, verify it opens WhatsApp with correct number and message |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
