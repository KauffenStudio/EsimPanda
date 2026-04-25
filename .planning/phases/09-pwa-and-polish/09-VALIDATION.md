---
phase: 09
slug: pwa-and-polish
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-25
---

# Phase 09 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest 4.1.4 with jsdom |
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
| 09-00-01 | 00 | 0 | UXD-02 | unit | `npx vitest run src/app/__tests__/manifest.test.ts` | ❌ W0 | ⬜ pending |
| 09-00-02 | 00 | 0 | UXD-02 | unit | `npx vitest run src/components/pwa/__tests__/install-banner.test.ts` | ❌ W0 | ⬜ pending |
| 09-00-03 | 00 | 0 | UXD-03 | unit | `npx vitest run src/stores/__tests__/theme.test.ts` | ❌ W0 | ⬜ pending |
| 09-00-04 | 00 | 0 | UXD-04 | unit | `npx vitest run src/stores/__tests__/notifications.test.ts` | ❌ W0 | ⬜ pending |
| 09-00-05 | 00 | 0 | UXD-04 | unit | `npx vitest run src/app/actions/__tests__/push.test.ts` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/app/__tests__/manifest.test.ts` — stubs for UXD-02 manifest fields
- [ ] `src/components/pwa/__tests__/install-banner.test.ts` — stubs for UXD-02 install banner behavior
- [ ] `src/stores/__tests__/theme.test.ts` — stubs for UXD-03 theme toggle
- [ ] `src/stores/__tests__/notifications.test.ts` — stubs for UXD-04 notification preferences
- [ ] `src/app/actions/__tests__/push.test.ts` — stubs for UXD-04 push subscribe/send

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Service worker registers and caches app shell | UXD-02 | Requires real browser service worker API | Open DevTools > Application > Service Workers, verify registered |
| Offline QR access works after install | UXD-02 | Requires offline toggle in real browser | Install PWA, go offline in DevTools, verify dashboard shows cached QR |
| Push notification with action buttons | UXD-04 | Requires HTTPS + browser permission + notification API | Enable push, trigger test notification, verify action buttons appear |
| iOS manual install instructions | UXD-02 | Requires iOS Safari testing | Open on iOS device, verify "Add to Home Screen" instructions shown |
| Dark mode flash prevention | UXD-03 | Requires page reload in browser | Enable dark mode, reload page, verify no white flash |
| Offline indicator banner | UXD-02 | Requires network toggle | Go offline, verify "You're offline" banner appears, go online, verify it disappears |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
