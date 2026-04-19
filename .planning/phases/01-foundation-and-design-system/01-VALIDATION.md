---
phase: 1
slug: foundation-and-design-system
status: draft
nyquist_compliant: true
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
| 1-01-01 | 01 | 1 | INF-01 | build | `npx next build` | n/a | ⬜ pending |
| 1-01-02 | 01 | 1 | INF-01, INF-02 | unit | `npx vitest run src/lib/esim/__tests__/ --reporter=verbose` | ❌ W0 | ⬜ pending |
| 1-02-01 | 02 | 2 | UXD-01 | unit | `npx vitest run src/components/ui/__tests__/ --reporter=verbose` | ❌ W0 | ⬜ pending |
| 1-02-02 | 02 | 2 | UXD-01 | unit+build | `npx vitest run src/components/ui/__tests__/ --reporter=verbose && npx next build` | reuses W0 | ⬜ pending |
| 1-03-01 | 03 | 3 | INF-06 | unit+build | `npx vitest run src/i18n/__tests__/routing.test.ts --reporter=verbose && npx next build` | ❌ W0 | ⬜ pending |
| 1-03-02 | 03 | 3 | INF-02 | unit+build | `npx vitest run src/lib/esim/__tests__/sync.test.ts --reporter=verbose && npx next build` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `vitest` + `@vitest/coverage-v8` — install test framework
- [ ] `vitest.config.ts` — configure vitest for Next.js
- [ ] `src/lib/esim/__tests__/provider.test.ts` — stubs for provider factory (INF-01)
- [ ] `src/lib/esim/__tests__/celitech-adapter.test.ts` — stubs for CELITECH adapter (INF-01)
- [ ] `src/components/ui/__tests__/button.test.tsx` — stubs for Button component (UXD-01)
- [ ] `src/components/ui/__tests__/card.test.tsx` — stubs for Card component (UXD-01)
- [ ] `src/i18n/__tests__/routing.test.ts` — stubs for i18n routing config (INF-06)
- [ ] `src/lib/esim/__tests__/sync.test.ts` — stubs for catalog sync logic (INF-02)

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Motion animations render smoothly | UXD-01 | Visual verification, cannot automate animation smoothness | Open dev server, verify Bambu animations play, check no jank in Chrome DevTools Performance tab |
| Vercel deployment succeeds with Supabase connected | INF-02 | Deployment environment, not testable locally | Run `vercel deploy --prod`, verify app loads and DB queries work |
| Dark mode toggle works visually | UXD-01 | Visual verification | Toggle dark mode, verify colors change across all components |

---

## Sampling Continuity Check

Task sequence by automated verify type:
1. 1-01-01: build (npx next build)
2. 1-01-02: **unit** (vitest provider tests) — breaks build streak
3. 1-02-01: **unit** (vitest component tests)
4. 1-02-02: **unit+build** (vitest + next build)
5. 1-03-01: **unit+build** (vitest routing + next build) — breaks any potential streak
6. 1-03-02: **unit+build** (vitest sync + next build)

Max consecutive build-only: 1 (only 1-01-01). Compliant with max 3 rule.

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 15s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** approved
