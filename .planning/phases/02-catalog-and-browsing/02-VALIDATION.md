---
phase: 2
slug: catalog-and-browsing
status: draft
nyquist_compliant: true
wave_0_complete: false
created: 2026-04-20
---

# Phase 2 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest + @testing-library/react |
| **Config file** | `vitest.config.ts` (exists from Phase 1) |
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
| 2-01-01 | 01 | 1 | CAT-01 | unit | `npx vitest run src/components/browse/__tests__/destination-grid.test.tsx` | No - W0 | pending |
| 2-01-02 | 01 | 1 | CAT-02 | unit | `npx vitest run src/components/browse/__tests__/duration-filter.test.tsx` | No - W0 | pending |
| 2-02-01 | 02 | 2 | CAT-03 | unit | `npx vitest run src/components/browse/__tests__/regional-plan-card.test.tsx` | No - W0 | pending |
| 2-02-02 | 02 | 2 | CAT-04 | unit | `npx vitest run src/stores/__tests__/comparison.test.ts` | No - W0 | pending |
| 2-03-01 | 03 | 3 | DEL-04 | unit | `npx vitest run src/hooks/__tests__/use-device-compat.test.ts` | No - W0 | pending |

*Status: pending / green / red / flaky*

---

## Wave 0 Requirements

- [ ] `src/components/browse/__tests__/destination-grid.test.tsx` — stubs for destination grid (CAT-01)
- [ ] `src/components/browse/__tests__/duration-filter.test.tsx` — stubs for duration filter (CAT-02)
- [ ] `src/components/browse/__tests__/regional-plan-card.test.tsx` — stubs for regional plan card (CAT-03)
- [ ] `src/stores/__tests__/comparison.test.ts` — stubs for comparison store (CAT-04)
- [ ] `src/hooks/__tests__/use-device-compat.test.ts` — stubs for device compat hook (DEL-04)
- [ ] `src/lib/mock-data/__tests__/tag-plans.test.ts` — stubs for auto-tagging logic

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Photo cards display correctly with overlay text | CAT-01 | Visual verification | Open /browse, verify photo cards show landmark images with flag + country name overlay |
| Accordion expand animation is smooth | CAT-01 | Animation quality | Tap destination card, verify smooth expand/collapse without jank |
| Comparison bottom sheet renders side-by-side | CAT-04 | Visual layout | Select 2-3 plans with checkbox, tap Compare bar, verify side-by-side sheet |
| Bambu poses appear in correct states | CAT-01 | Visual/animation | Search for non-existent destination, verify Bambu curious pose appears |

---

## Sampling Continuity Check

Task sequence by automated verify type:
1. 2-01-01: unit (destination grid tests)
2. 2-01-02: unit (duration filter tests)
3. 2-02-01: unit (regional plan card tests)
4. 2-02-02: unit (comparison store tests)
5. 2-03-01: unit (device compat tests)

Max consecutive build-only: 0. All tasks have unit tests. Compliant with max 3 rule.

---

## Validation Sign-Off

- [x] All tasks have automated verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 15s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** approved
