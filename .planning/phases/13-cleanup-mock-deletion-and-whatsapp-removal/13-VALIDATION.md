---
phase: 13
slug: cleanup-mock-deletion-and-whatsapp-removal
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-05-17
---

# Phase 13 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.1.4 (already installed; `vitest.config.ts` has the Phase 11 `server-only` stub alias) |
| **Config file** | `vitest.config.ts` (root) |
| **Quick run command** | `npx vitest run src/lib/plans/` |
| **Full suite command** | `npm test` |
| **Lint gate** | `npm run lint` (ESLint flat config) |
| **Type/build gate** | `npx tsc --noEmit` + `npm run build` |
| **Estimated runtime** | ~8s test suite; ~30s build |

No framework install needed. Phase 13 is deletion + a static page; the gates are lint, type-check, build, and grep-zero assertions.

---

## Sampling Rate

- **After every task commit:** `npx tsc --noEmit` + `npx vitest run src/lib/plans/` (fast)
- **After every plan:** `npm run lint` + `npm test` + `npm run build`
- **Phase gate:** full suite green + `npm run lint` clean + `npm run build` succeeds + both verification greps below return 0, before `/gsd:verify-work`
- **Max feedback latency:** ~30s (the build)

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 13-01-* | 01 | 1 | INF-11 | unit | `npx vitest run src/lib/plans/__tests__/pricing-display.test.ts` — extracted helpers compute correctly | ❌ W0 | ⬜ pending |
| 13-01-* | 01 | 1 | INF-11 | type/build | cut `sitemap.ts` + `esim/[slug]/page.tsx` (+ `use-plans.ts` if live) to Supabase — `npx tsc --noEmit` clean, `npm run build` succeeds | ✅ | ⬜ pending |
| 13-01-* | 01 | 1 | INF-11 | grep (smoke) | `grep -rn "mock-data/destinations\|mock-data/plans\|mock-data/tag-plans" src/` returns 0 (the 3 modules deleted, no straggler imports) | ✅ | ⬜ pending |
| 13-01-* | 01 | 1 | INF-11 | lint (smoke) | `npm run lint` passes — the new `no-restricted-imports` rule fires zero violations because no importer of the 3 modules remains | ✅ | ⬜ pending |
| 13-02-* | 02 | 1 | INF-13 | grep (smoke) | `grep -rni "whatsapp\|wa\.me" src/ messages/ \| grep -v "share-buttons" \| grep -v "shareWhatsapp"` returns 0 | ✅ | ⬜ pending |
| 13-02-* | 02 | 1 | INF-13 | type/build | WhatsApp files deleted; the 3 error components + `errors.generic` repointed — `npx tsc --noEmit` clean, `npm run build` succeeds | ✅ | ⬜ pending |
| 13-02-* | 02 | 1 | INF-14 | build (smoke) | `npm run build` statically renders `/[locale]/help` for all 6 locales — a missing `next-intl` key fails the build | ✅ | ⬜ pending |
| 13-02-* | 02 | 1 | INF-14 | inspection | `/help` renders FAQ + `mailto:geral@kauffen.com`; footer link + error-state Help links navigate — manual | n/a | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## What is unit-testable vs needs browser verification

**Unit-testable / automated (MUST have an automated gate):**
- Extracted pure helpers in `pricing-display.ts` (`getOriginalPrice`, `getDiscountPercent`, `tagPlans`) compute correctly
- ESLint `no-restricted-imports` rule is present and `npm run lint` is clean
- `grep -rn "mock-data/{destinations,plans,tag-plans}" src/` returns 0
- `grep -rni "whatsapp|wa\.me" src/ messages/` (minus the referral share) returns 0
- `npx tsc --noEmit` clean; `npm run build` succeeds (the build statically renders `/help` × 6 locales — catches missing i18n keys)

**Browser / inspection only (note in VERIFICATION.md):**
- `/help` page visually renders the 8 FAQ entries + the `mailto:` link
- Footer `/help` link navigates
- The 4 error states' Help links navigate to `/help`

---

## Wave 0 Requirements

- [ ] `src/lib/plans/pricing-display.ts` — NEW module holding the extracted pure helpers (`getOriginalPrice`, `getDiscountPercent`, `tagPlans`). `getBestDiscount` is NOT migrated — it reads the `mockPlans` global, has zero live importers, and `db/destinations.ts` already computes `bestDiscountPercent` inline; drop it. Created in 13-01.
- [ ] `src/lib/plans/__tests__/pricing-display.test.ts` — MIGRATE the 5 genuine cases from `src/lib/mock-data/__tests__/tag-plans.test.ts` (repoint import to `../pricing-display`) + add ~3-4 `getOriginalPrice`/`getDiscountPercent` cases. Covers INF-11.
- [ ] `src/app/[locale]/help/page.tsx` — NEW static localized route. Created in 13-02.
- [ ] No framework install needed.

---

## Tests that BREAK from the deletions (Pitfall 6)

| Test | Why it breaks | Action |
|------|---------------|--------|
| `src/lib/mock-data/__tests__/tag-plans.test.ts` | imports `tagPlans` from `../tag-plans` (deleted) | **MIGRATE** to `src/lib/plans/__tests__/pricing-display.test.ts`, import `../pricing-display` — 5 genuine cases, do not drop |
| `src/components/layout/__tests__/whatsapp-button.test.tsx` | tests the deleted button | **DELETE** — only 2 `it.todo()` stubs, no real assertions, no coverage lost |

No other test imports the 3 deleted modules — the cascade is minimal (1 migrate, 1 delete).

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| `/help` page renders the FAQ + mailto correctly | INF-14 | Static content rendering — low value to automate beyond the build's missing-key check | `npm run dev`; visit `/en/help`; confirm 8 FAQ entries render and the `mailto:geral@kauffen.com` link is present and correct |
| Footer `/help` link + error-state Help links navigate | INF-14 | Navigation/visual | In dev, click the footer Help link; trigger a payment/provisioning error and click its "Help page" link — all land on `/{locale}/help` |

---

## Validation Sign-Off

- [ ] All tasks have an `<automated>` verify command or a Wave 0 dependency
- [ ] Sampling continuity: no 3 consecutive tasks without an automated verify
- [ ] Wave 0 covers all MISSING references (`pricing-display.ts` + its test, `/help` route)
- [ ] No watch-mode flags
- [ ] `npm run lint` + `npm run build` + the 2 grep-zero checks are part of the phase gate
- [ ] `nyquist_compliant: true` set in frontmatter after the executor passes the map

**Approval:** pending
