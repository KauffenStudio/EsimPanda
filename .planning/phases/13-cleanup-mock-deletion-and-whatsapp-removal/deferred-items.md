# Phase 13 — Deferred / Cross-Plan Items

## Cross-plan: full-suite `npm test` / `tsc` / `npm run build` blocked by 13-02 in-flight

**Discovered during:** 13-01 Task 4 (full-suite gate)

**Detail:** 13-01 ran in parallel with 13-02 (WhatsApp removal). The 13-02 agent
deleted `src/lib/config/support.ts` but had not yet finished repointing its three
error-state components (`payment-error.tsx`, `provisioning-error.tsx`,
`setup-guide.tsx`) off `@/lib/config/support`. This left `tsc --noEmit` with 3
`TS2307 Cannot find module '@/lib/config/support'` errors and one Vitest suite
(`delivery-page.test.tsx`) failing to resolve the same import.

**Scope:** NOT a 13-01 defect — every error traces to `@/lib/config/support`
(a 13-02-owned file). Zero errors in any 13-01-touched file. 13-01's own surface
is fully green: `pricing-display.test.ts` passes 11/11, `npm run lint` exits 0
(the new `no-restricted-imports` rule fires zero violations), and the
`mock-data/{destinations,plans,tag-plans}` import grep returns 0.

**Resolution:** Resolves automatically once 13-02 completes its component
repointing. The phase-merge gate (full `npm test` + `npm run build` green) should
be re-run by the phase orchestrator after BOTH 13-01 and 13-02 are merged — it is
a phase gate, not a per-plan gate.
