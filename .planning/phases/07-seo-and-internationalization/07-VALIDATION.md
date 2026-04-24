---
phase: 7
slug: seo-and-internationalization
status: draft
nyquist_compliant: true
wave_0_complete: false
created: 2026-04-24
---

# Phase 7 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest 4.1.4 + @testing-library/react 16.3.2 |
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
| 07-00-01 | 00 | 0 | GRW-02, GRW-03 | stubs | `npx vitest run src/lib/seo/__tests__ src/app/__tests__ "src/app/[locale]/esim/__tests__" --reporter=verbose` | W0 creates | ⬜ pending |
| 07-01-01 | 01 | 1 | GRW-03a | unit | `npx vitest run src/i18n/__tests__/routing.test.ts -x` | check | ⬜ pending |
| 07-02-01 | 02 | 2 | GRW-02a | unit | `npx vitest run src/lib/seo/__tests__/structured-data.test.ts -x` | W0 | ⬜ pending |
| 07-02-02 | 02 | 2 | GRW-02b | unit | `npx vitest run src/app/[locale]/esim/__tests__/metadata.test.ts -x` | W0 | ⬜ pending |
| 07-02-03 | 02 | 2 | GRW-02c | unit | `npx vitest run src/app/[locale]/esim/__tests__/static-params.test.ts -x` | W0 | ⬜ pending |
| 07-02-04 | 02 | 2 | GRW-02d | unit | `npx vitest run src/lib/seo/__tests__/faq-templates.test.ts -x` | W0 | ⬜ pending |
| 07-03-01 | 03 | 3 | GRW-03b | unit | `npx vitest run src/app/__tests__/sitemap.test.ts -x` | W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

Handled by **07-00-PLAN.md** (Wave 0):

- [ ] `src/lib/seo/__tests__/structured-data.test.ts` — stubs for GRW-02a (JSON-LD generators)
- [ ] `src/lib/seo/__tests__/faq-templates.test.ts` — stubs for GRW-02d (FAQ template interpolation)
- [ ] `src/app/__tests__/sitemap.test.ts` — stubs for GRW-03b (sitemap with hreflang)
- [ ] `src/app/[locale]/esim/__tests__/metadata.test.ts` — stubs for GRW-02b (generateMetadata)
- [ ] `src/app/[locale]/esim/__tests__/static-params.test.ts` — stubs for GRW-02c (generateStaticParams)

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| OG/Twitter card rendering in social shares | GRW-02 | External platform rendering | Share destination URL on Twitter/WhatsApp, verify rich preview shows country image + starting price |
| Google Search Console structured data | GRW-02 | External search engine indexing | Use Google Rich Results Test tool on destination page URL |
| Language switcher UX across browsers | GRW-03 | Cross-browser visual rendering | Test footer language dropdown in Chrome, Safari, Firefox on mobile and desktop |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references (07-00-PLAN.md)
- [x] No watch-mode flags
- [x] Feedback latency < 15s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
