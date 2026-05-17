---
phase: 13-cleanup-mock-deletion-and-whatsapp-removal
verified: 2026-05-17T14:31:00Z
status: passed
score: 10/10 must-haves verified
re_verification: false
human_verification:
  - test: "Visit /en/help in dev and confirm 8 FAQ entries render (each <details> expands), the mailto:geral@kauffen.com link is present and correct"
    expected: "8 native disclosure entries expand/collapse; mailto link opens mail client"
    why_human: "Static content rendering visual confirmation — low value to automate beyond the build's missing-key check (build passed)"
  - test: "Click the footer Help link and confirm it navigates to /{locale}/help"
    expected: "Browser lands on the Help & FAQ page for the active locale"
    why_human: "Navigation behavior requires browser"
  - test: "Trigger a payment error, a provisioning error, and a setup-guide view; confirm each 'Help page' link navigates to /{locale}/help"
    expected: "All 3 error-state help links route to the localized /help page"
    why_human: "Error-state rendering requires triggering the error flow in browser"
---

# Phase 13: Cleanup, Mock Deletion and WhatsApp Removal — Verification Report

**Phase Goal:** The mock-data layer's three catalog files are gone (pure helpers survive in `src/lib/plans/pricing-display.ts`), an ESLint gate blocks their reimport, WhatsApp is fully removed from the codebase, and a static `/help` route ships as the support entry point.
**Verified:** 2026-05-17T14:31:00Z
**Status:** PASSED
**Re-verification:** No — initial verification

---

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|---------|
| 1 | Pure helpers (getOriginalPrice, getDiscountPercent, tagPlans) exist in a pure module with zero imports | VERIFIED | `src/lib/plans/pricing-display.ts` — 108 lines, 0 import statements, exports all 3; getBestDiscount correctly absent |
| 2 | sitemap.ts and esim/[slug]/page.tsx read from Supabase, not mock arrays | VERIFIED | sitemap.ts line 3: `import { listActiveDestinations } from '@/lib/db/destinations'`; esim/[slug] lines 4-5: `getDestinationBySlug, listActiveDestinations, listPlansForDestination` + `tagPlans` from pricing-display |
| 3 | The 3 mock-data files (destinations, plans, tag-plans) no longer exist; no source file imports them | VERIFIED | `test ! -f` confirms all 3 deleted; `grep -rn "mock-data/destinations\|mock-data/plans\|mock-data/tag-plans" src/` returns 0 hits |
| 4 | ESLint no-restricted-imports gate blocks the 3 deleted modules; npm run lint passes (0 errors) | VERIFIED | eslint.config.mjs has the rule with both `@/lib/mock-data/` aliased and `**/mock-data/` glob patterns; `npm run lint` exits with 0 errors (11 pre-existing warnings, all unrelated) |
| 5 | The 4 KEPT mock files (checkout, coupons, dashboard, delivery) still exist | VERIFIED | `ls src/lib/mock-data/` returns exactly: checkout.ts, coupons.ts, dashboard.ts, delivery.ts |
| 6 | use-plans.ts is deleted (orphaned dead code) | VERIFIED | `test ! -f src/hooks/use-plans.ts` passes; db/destinations.ts imports getDiscountPercent from `@/lib/plans/pricing-display` (line 3) |
| 7 | WhatsApp fully removed: button, test stub, support.ts deleted; no whatsapp/wa.me outside intentional referral share | VERIFIED | All 3 files confirmed deleted; `grep -rni "whatsapp\|wa\.me" src/ messages/` filtering share-buttons/shareWhatsapp returns 0 hits; referral share-buttons.tsx `wa.me` link preserved (1 hit); shareWhatsapp key present in all 6 locales |
| 8 | /help route exists as pure server component with 8 FAQ entries and mailto:geral@kauffen.com | VERIFIED | `src/app/[locale]/help/page.tsx` — 60 lines; 0 `use client` directives; 1 `mailto:geral@kauffen.com` anchor; 1 `<details` mapping 8 FAQ_KEYS; 3 `getTranslations` calls |
| 9 | Footer links to /help; 3 error-state components link to /{locale}/help | VERIFIED | legal-footer.tsx line 20: `<Link href={\`/${locale}/help\`}`; payment-error.tsx, provisioning-error.tsx, setup-guide.tsx each contain `href={\`/${locale}/help\`}` |
| 10 | npm test 273 pass; npm run lint 0 errors; tsc --noEmit clean; npm run build succeeds and statically renders /help x6 and /esim/[slug] | VERIFIED | Test: 273 passed, 43 todo, 51 files passed; lint: 0 errors; tsc: clean (no output); build: compiled successfully, `●  /[locale]/help` with en/pt/es + [+3 more] = all 6 locales; `●  /[locale]/esim/[slug]` also builds |

**Score:** 10/10 truths verified

---

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/lib/plans/pricing-display.ts` | Pure module — getOriginalPrice, getDiscountPercent, tagPlans | VERIFIED | Exists, 108 lines, zero imports, all 3 helpers exported; getBestDiscount not present |
| `src/lib/plans/__tests__/pricing-display.test.ts` | ≥8 test cases covering migrated tagPlans + math cases | VERIFIED | 11 tests pass (1/1 test files) |
| `eslint.config.mjs` | no-restricted-imports rule banning 3 deleted modules | VERIFIED | Rule present, both @/ aliased and **/ glob forms, correct 3-module group |
| `src/app/[locale]/help/page.tsx` | Static server component, 8 FAQ entries, mailto | VERIFIED | Exists, async server component, 8-entry FAQ_KEYS map, `<details>` accordion, mailto link |
| `src/components/layout/legal-footer.tsx` | Contains /help link | VERIFIED | Link to `/${locale}/help` confirmed at line 20 |

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `src/app/[locale]/esim/[slug]/page.tsx` | `src/lib/db/destinations.ts` | getDestinationBySlug / listActiveDestinations / listPlansForDestination | WIRED | Import confirmed lines 4-5 |
| `src/app/sitemap.ts` | `src/lib/db/destinations.ts` | listActiveDestinations | WIRED | Import confirmed line 3 |
| `src/lib/db/destinations.ts` | `src/lib/plans/pricing-display.ts` | getDiscountPercent import | WIRED | Import confirmed line 3 |
| `src/components/checkout/payment-error.tsx` | `/help` | locale-aware internal Link | WIRED | `href={\`/${locale}/help\`}` confirmed |
| `src/components/layout/legal-footer.tsx` | `/help` | next/link Link with footer.help label | WIRED | Link confirmed line 20 |
| `src/app/[locale]/help/page.tsx` | `mailto:geral@kauffen.com` | contact-block anchor | WIRED | `href="mailto:geral@kauffen.com"` confirmed |

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|-------------|--------|----------|
| INF-11 | 13-01-PLAN.md | destinations.ts, plans.ts, tag-plans.ts deleted; pure helpers in pricing-display.ts; ESLint gate | SATISFIED | All 3 files deleted; grep returns 0; ESLint rule present; tsc/lint/build/test all pass |
| INF-13 | 13-02-PLAN.md | WhatsApp integration fully removed from all surfaces and i18n namespaces | SATISFIED | whatsapp-button.tsx, support.ts, whatsapp-button.test.tsx deleted; whatsapp namespace gone from all 6 locales; 5 error strings rewritten; grep zero outside intentional referral |
| INF-14 | 13-02-PLAN.md | /help static route ships as new support entry point linked from footer | SATISFIED | page.tsx exists as pure server component; statically renders x6 locales in build; footer + 3 error components link to it |

### Anti-Patterns Found

None detected. Scanned key modified/created files:
- `src/lib/plans/pricing-display.ts` — no TODOs, no stubs, no console.log
- `src/app/[locale]/help/page.tsx` — no `use client`, no TODOs, proper async server component
- `eslint.config.mjs` — rule is complete and functional

### Human Verification Required

#### 1. /help FAQ visual render

**Test:** Run `npm run dev`, visit `/en/help`. Click each of the 8 FAQ entries to confirm they expand and collapse.
**Expected:** 8 native `<details>` entries each open to reveal their answer paragraph; the "Still need help?" contact block appears below with `mailto:geral@kauffen.com` as a clickable link.
**Why human:** Static content rendering and `<details>` expand/collapse behavior requires browser inspection.

#### 2. Footer /help link navigation

**Test:** In dev, scroll to the footer and click the "Help" link.
**Expected:** Browser navigates to `/{locale}/help` for the active locale.
**Why human:** Navigation behavior requires browser.

#### 3. Error-state Help links

**Test:** Trigger a payment error (use a declined test card in checkout), trigger a provisioning error (force a failed provision in delivery), and view the setup guide. Click the "Help page" link in each.
**Expected:** All 3 links navigate to `/{locale}/help`.
**Why human:** Error-state rendering requires triggering the actual error flow in a browser.

---

## Gaps Summary

No gaps. All automated must-haves verified:

- Mock-data deletion: all 3 files gone, grep-zero confirmed, 4 kept files intact
- Pure helpers: pricing-display.ts is clean (zero imports, 3 exports, 11 tests pass)
- ESLint gate: no-restricted-imports rule blocks all 3 deleted module paths
- Supabase cutover: sitemap.ts and esim/[slug]/page.tsx both import from db/destinations
- WhatsApp removal: all 3 deleted files confirmed absent; grep-zero in src/ and messages/
- /help route: pure server component, 8 FAQ entries, mailto contact, all 6 locales in build
- i18n: all 6 locales have full help namespace (8 FAQ entries), footer.help key, no whatsapp namespace, 5 error strings cleaned
- Phase gate: 273 tests pass, 0 lint errors, tsc clean, build succeeds

Phase 13 goal is achieved. Only manual visual/navigation checks remain (documented above).

---

_Verified: 2026-05-17T14:31:00Z_
_Verifier: Claude (gsd-verifier)_
