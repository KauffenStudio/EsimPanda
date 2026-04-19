---
phase: 1
slug: foundation-and-design-system
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-19
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest |
| **Config file** | `vitest.config.ts` (Wave 0 installs) |
| **Quick run command** | `npx vitest run --reporter=verbose` |
| **Full suite command** | `npx vitest run --coverage` |
| **Estimated runtime** | ~10 seconds |

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
| 1-01-01 | 01 | 1 | INF-01 | unit | `npx vitest run src/lib/providers/__tests__` | ❌ W0 | ⬜ pending |
| 1-01-02 | 01 | 1 | INF-02 | unit | `npx vitest run src/lib/catalog/__tests__` | ❌ W0 | ⬜ pending |
| 1-02-01 | 02 | 1 | UXD-01 | unit | `npx vitest run src/components/__tests__` | ❌ W0 | ⬜ pending |
| 1-03-01 | 03 | 1 | INF-06 | unit | `npx vitest run src/lib/i18n/__tests__` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `vitest` + `@vitest/coverage-v8` — install test framework
- [ ] `vitest.config.ts` — configure vitest for Next.js
- [ ] `src/lib/providers/__tests__/provider.test.ts` — stubs for provider abstraction (INF-01)
- [ ] `src/lib/catalog/__tests__/sync.test.ts` — stubs for catalog sync (INF-02)
- [ ] `src/components/__tests__/` — stubs for design system components (UXD-01)
- [ ] `src/lib/i18n/__tests__/i18n.test.ts` — stubs for i18n framework (INF-06)

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Framer Motion animations render smoothly | UXD-01 | Visual verification, cannot automate animation smoothness | Open dev server, verify Bambu animations play, check no jank in Chrome DevTools Performance tab |
| Vercel deployment succeeds with Supabase connected | INF-02 | Deployment environment, not testable locally | Run `vercel deploy --prod`, verify app loads and DB queries work |
| Dark mode toggle works visually | UXD-01 | Visual verification | Toggle dark mode, verify colors change across all components |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
