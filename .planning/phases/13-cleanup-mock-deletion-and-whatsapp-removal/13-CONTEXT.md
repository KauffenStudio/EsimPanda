# Phase 13: Cleanup, Mock Deletion and WhatsApp Removal - Context

**Gathered:** 2026-05-17
**Status:** Ready for planning

<domain>
## Phase Boundary

Two independent cleanup workstreams, bundled because both are pure removal:

1. **Mock-data deletion** — delete `src/lib/mock-data/destinations.ts`, `plans.ts`, and `tag-plans.ts` after extracting their pure-compute helpers to a real module (`src/lib/plans/pricing-display.ts`). Add an ESLint gate blocking new imports of those three files.
2. **WhatsApp removal** — fully remove the WhatsApp support integration (button component + test, `support.ts`, env var, 6 locale `whatsapp.*` namespaces, 4 error-state copy strings) and ship a static `/help` route as the replacement support entry point.

Out of scope: Bambu mascot pose removal (Phase 13.1); E2E + service-worker bump + deploy (Phase 14). Phase 13 owns INF-11, INF-13, INF-14.
</domain>

<decisions>
## Implementation Decisions

### Mock-data deletion scope
- Delete exactly three files: `src/lib/mock-data/destinations.ts`, `src/lib/mock-data/plans.ts`, `src/lib/mock-data/tag-plans.ts` (+ their `__tests__` entries)
- **KEEP** the other four mock-data files — `checkout.ts`, `coupons.ts`, `dashboard.ts`, `delivery.ts` — they back still-mocked dev flows (the `IS_MOCK` paths in checkout/dashboard/delivery) and are NOT in scope for v1.1 deletion
- Before deleting, extract the pure-compute helpers currently living in those files — `getOriginalPrice`, `getDiscountPercent`, `getBestDiscount`, `tagPlans` — into a new real module `src/lib/plans/pricing-display.ts` (no Supabase imports, no I/O — pure functions). Update every importer to point at the new module.
- After deletion: `grep -rn "mock-data/destinations\|mock-data/plans\|mock-data/tag-plans" src/` must return 0

### CI gate
- Add an ESLint `no-restricted-imports` rule blocking imports from `@/lib/mock-data/destinations`, `@/lib/mock-data/plans`, `@/lib/mock-data/tag-plans` — fails `npm run lint` / CI on regression (INF-11)
- The rule targets ONLY those three deleted modules — the four kept mock-data files are still importable
- **NO dedicated WhatsApp CI guard.** Per the user's decision: WhatsApp is removed fully and verified ONCE at phase-end with a grep; there is no permanent CI grep step policing WhatsApp reintroduction. (This overrides ROADMAP Phase 13 success criterion 6, which is being reworded to a one-time verification check.)

### WhatsApp removal — full inventory
- Delete `src/components/layout/whatsapp-button.tsx` and `src/components/layout/__tests__/whatsapp-button.test.tsx`
- Delete `src/lib/config/support.ts` entirely (it is 100% WhatsApp — `WHATSAPP_NUMBER`, `WHATSAPP_SUPPORT_URL`, `getWhatsAppUrl`)
- Remove the commented/active WhatsApp-button import from `src/app/[locale]/layout.tsx`
- Remove `NEXT_PUBLIC_WHATSAPP_NUMBER` from `.env.example` (and note it for removal from Vercel env — actual Vercel cleanup is Phase 14's deploy step)
- Remove the `whatsapp.*` i18n namespace from all 6 locale files (`messages/{en,pt,es,fr,ja,zh}.json`)
- Replace the 4 "contact us on WhatsApp" error-state copy strings (in `payment-error.tsx`, `provisioning-error.tsx`, `setup-guide.tsx`, and the dashboard error state) — see "Error-state copy" below
- **KEEP** the `wa.me` link in `src/components/referral/share-buttons.tsx` — that is a user-initiated referral *share* action (share to a friend via WhatsApp), NOT support. It is intentionally retained.

### Error-state copy replacement
- Each of the 4 error states replaces its "contact us on WhatsApp" reference with a **link to `/help`** — copy along the lines of "Need help? Visit our Help page" pointing at `/{locale}/help`
- `/help` is the single support entry point; it carries the `mailto:` so error states route there rather than to a raw mailto

### /help route
- New static route `src/app/[locale]/help/page.tsx` — a server component, statically rendered, localized via `next-intl`
- **~8 concise FAQ entries.** Suggested topic set (exact copy is Claude's discretion, must read naturally and match the brand voice): (1) what an eSIM is, (2) device eSIM compatibility, (3) how to install / scan the QR, (4) activation timing / when data starts, (5) topping up data, (6) refunds / cancellation, (7) troubleshooting "no connection", (8) how to contact support
- Support contact: a `mailto:` link to **`geral@kauffen.com`**
- Linked from the site footer (in `src/app/[locale]/layout.tsx` or the footer component) AND reachable from the 4 error states
- All `/help` copy goes through `next-intl` translation keys across all 6 locales

### Plan file granularity — 2 plans
- `13-01-PLAN.md` — Mock-data deletion: extract pure helpers to `src/lib/plans/pricing-display.ts`, repoint importers, delete the 3 mock-data files + their tests, add the ESLint `no-restricted-imports` gate, fix any straggler imports so `tsc`/`lint`/`build` stay green. Requirement: INF-11.
- `13-02-PLAN.md` — WhatsApp removal + /help route: delete button/test/`support.ts`, strip env var + 6 locale namespaces + 4 error-state strings, ship `/help` (FAQ + mailto, footer link), point error states at `/help`. Requirements: INF-13, INF-14.
- The two plans are independent (no shared files) — they may run in parallel or sequentially; mark them same-wave-parallel-capable unless the planner finds a shared-file conflict.

### Claude's Discretion
- Exact FAQ copy + question wording (must be concise, brand-voiced, 8 entries)
- Exact ESLint `no-restricted-imports` rule config shape (in `eslint.config.mjs`)
- `/help` page layout/styling (reuse existing design tokens + primitives; this is a simple static content page — no UI-SPEC needed)
- Exact error-state link copy/placement within each of the 4 components
- Whether `pricing-display.ts` also needs a co-located test (recommended if the helpers have non-trivial math)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### v1.1 milestone research
- `.planning/research/v1.1/SUMMARY.md` — Phase 13 = Wave 3 (cleanup); the "delete last, after the last `MockPlan` import is gone" ordering rationale
- `.planning/research/v1.1/FEATURES.md` — WhatsApp removal checklist, `/help` route recommendation, the "keep `referral/share-buttons.tsx` wa.me" call-out
- `.planning/research/v1.1/PITFALLS.md` — Pitfall 6 (test-migration cascade), Pitfall 8 (WhatsApp half-wired removal — the 10-artifact inventory)
- `.planning/research/v1.1/ARCHITECTURE.md` — pure-helper extraction to `src/lib/plans/pricing-display.ts`

### Prior phase context
- `.planning/phases/11-read-layer-module-and-browse-cutover/11-CONTEXT.md` and `12-CONTEXT.md` — both note pure helpers were deliberately kept imported from `mock-data/plans` UNTIL this phase (Phase 13 / INF-11)

### Code to modify / delete
- `src/lib/mock-data/destinations.ts`, `plans.ts`, `tag-plans.ts` — DELETE (after helper extraction)
- `src/lib/mock-data/{checkout,coupons,dashboard,delivery}.ts` — KEEP
- `src/components/layout/whatsapp-button.tsx` + `__tests__/whatsapp-button.test.tsx` — DELETE
- `src/lib/config/support.ts` — DELETE (100% WhatsApp)
- `src/app/[locale]/layout.tsx` — remove WhatsApp import + footer gets `/help` link
- `src/components/checkout/payment-error.tsx`, `src/components/delivery/provisioning-error.tsx`, `src/components/delivery/setup-guide.tsx`, dashboard error state — replace WhatsApp copy with `/help` link
- `src/components/referral/share-buttons.tsx` — KEEP the `wa.me` referral share (NOT support)
- `messages/{en,pt,es,fr,ja,zh}.json` — remove `whatsapp.*`, add `help.*` keys
- `.env.example` — remove `NEXT_PUBLIC_WHATSAPP_NUMBER`
- `eslint.config.mjs` — add the `no-restricted-imports` rule
- NEW: `src/lib/plans/pricing-display.ts`, `src/app/[locale]/help/page.tsx`

### Requirements
- `.planning/REQUIREMENTS.md` — Phase 13 owns INF-11, INF-13, INF-14

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- Existing static page patterns — `src/app/[locale]/privacy/`, `terms/` are precedents for a simple localized static content route; `/help` mirrors them
- `next-intl` translation key infrastructure — `/help` copy and the error-state link copy go through it
- Existing design tokens / UI primitives for the `/help` page layout — no new design system work

### Established Patterns
- `IS_MOCK` dev-mode flag still gates checkout/dashboard/delivery against the KEPT mock-data files — do not break those paths
- ESLint flat config in `eslint.config.mjs` — the `no-restricted-imports` rule slots in there
- The pure helpers (`getOriginalPrice` etc.) are imported by `plan-card.tsx`, `db/destinations.ts`, and checkout components — all repointed to `pricing-display.ts`

### Integration Points
- The 4 error-state components + the footer all gain a `/help` link — `/help` is the hub
- Deleting `mock-data/{destinations,plans,tag-plans}.ts` will surface any straggler import the cutover missed — `tsc --noEmit` + `npm run build` are the gate that proves none remain
- Test files that import the deleted mock-data modules must be migrated/removed (Pitfall 6) — the planner inventories them

</code_context>

<specifics>
## Specific Ideas

- Support email is `geral@kauffen.com` (Kauffen — the studio behind eSIM Panda).
- "No WhatsApp CI guard" — the user does not want a permanent grep gate for WhatsApp; a one-time phase-end verification grep is enough. The mock-data ESLint gate IS wanted (INF-11).
- `/help` replaces WhatsApp as the single support surface — every error state and the footer route there.
- The referral `wa.me` share button is NOT support and stays — do not let a broad "remove wa.me" sweep delete it.
- Only 3 of 7 mock-data files are deleted; the 4 dev-flow mock files stay.

</specifics>

<deferred>
## Deferred Ideas

- **Permanent WhatsApp CI grep guard** — considered; the user declined. WhatsApp removal is verified once at phase-end, not policed permanently.
- **Deleting the remaining 4 mock-data files** (`checkout`, `coupons`, `dashboard`, `delivery`) — out of scope; they back still-mocked dev flows. A future milestone that cuts checkout/dashboard/delivery fully to live data would remove them.
- **Vercel env var cleanup** (`NEXT_PUBLIC_WHATSAPP_NUMBER` on the hosting platform) — Phase 14's deploy step handles the live Vercel environment; Phase 13 only removes it from `.env.example`.
- **A full help-center** (search, categories, articles) — `/help` ships as a simple static FAQ; a richer help-center is a future consideration.

</deferred>

---

*Phase: 13-cleanup-mock-deletion-and-whatsapp-removal*
*Context gathered: 2026-05-17*
