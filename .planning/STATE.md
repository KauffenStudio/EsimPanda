---
gsd_state_version: 1.0
milestone: v1.1
milestone_name: live-data-cutover
status: ui-spec-approved
stopped_at: Phase 11 UI-SPEC approved
last_updated: "2026-05-16T15:08:44.197Z"
progress:
  total_phases: 6
  completed_phases: 1
  total_plans: 2
  completed_plans: 2
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-05-13)

**Core value:** A student arriving in a new country gets connected with mobile data in under 2 minutes
**Current focus:** Phase 11 — read-layer-module-and-browse-cutover (UI-SPEC approved, ready to plan)

## Current Position

Phase: 11 (read-layer-module-and-browse-cutover) — RESEARCH + UI-SPEC complete, ready for /gsd:plan-phase 11
Plan: not yet planned

Phase 10 complete (migration + backfill, 69 curated rows). Phase 11 has 11-RESEARCH.md, 11-VALIDATION.md, and an approved 11-UI-SPEC.md. Re-run /gsd:plan-phase 11 to generate plans.

## Performance Metrics

**Velocity:**

- Total plans completed: 27 (across v1.0)
- Average duration: ~5min/plan
- Total execution time: ~135 minutes across v1.0

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 01 | 2 | 13min | 6.5min |
| 02 | 3 | 10min | 3.3min |
| 03 | 2 | 43min | 21.5min |
| 04 | 3 | 11min | 3.7min |
| 05 | 3 | 15min | 5min |
| 06 | 2 | 8min | 4min |
| 07 | 4 | 8min | 2min |
| 08 | 3 | 12min | 4min |
| 09 | 3 | 20min | 6.7min |

**Recent Trend:**

- Last 5 plans: 09-01 (5min), 09-02 (10min), 09-03 (5min), 05-13 v1.1 research, 05-13 v1.1 roadmap
- Trend: Roadmap planning for v1.1 underway

*Updated after each plan completion*
| Phase 01 P01 | 8min | 2 tasks | 23 files |
| Phase 01 P02 | 5min | 2 tasks | 17 files |
| Phase 02 P01 | 4min | 2 tasks | 14 files |
| Phase 02 P03 | 2min | 2 tasks | 5 files |
| Phase 02 P02 | 4min | 2 tasks | 11 files |
| Phase 03-01 P01 | 8min | 2 tasks | 22 files |
| Phase 03-02 P02 | 35min | 3 tasks | 30 files |
| Phase 04 P01 | 5min | 2 tasks | 17 files |
| Phase 04 P02 | 5min | 3 tasks | 21 files |
| Phase 04 P04 | 1min | 2 tasks | 6 files |
| Phase 05 P01 | 3min | 2 tasks | 10 files |
| Phase 05 P02 | 4min | 2 tasks | 9 files |
| Phase 05 P03 | 8min | 2 tasks | 14 files |
| Phase 06 P01 | 4min | 2 tasks | 12 files |
| Phase 06 P02 | 4min | 2 tasks | 11 files |
| Phase 07 P00 | 1min | 1 tasks | 5 files |
| Phase 07 P01 | 3min | 2 tasks | 8 files |
| Phase 07 P02 | 2min | 2 tasks | 8 files |
| Phase 07 P03 | 2min | 2 tasks | 7 files |
| Phase 08 P01 | 6min | 3 tasks | 20 files |
| Phase 08 P02 | 3min | 3 tasks | 8 files |
| Phase 08 P03 | 3min | 2 tasks | 5 files |
| Phase 09 P01 | 5min | 2 tasks | 17 files |
| Phase 09 P02 | 10min | 4 tasks | 58 files |
| Phase 09 P03 | 5min | 2 tasks | 21 files |
| Phase 10 P01 | 2min | 3 tasks | 1 files |
| Phase 10 P02 | 6min | 5 tasks | 4 files |

## Accumulated Context

### Roadmap Evolution

- Phase 13.1 inserted after Phase 13 (2026-05-16): Remove Bambu mascot pose system app-wide — placed before Phase 14 so E2E tests the final poseless UI. Owns new requirement UXD-09.

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

**v1.1 Roadmap (2026-05-13):**

- Roadmap: 5 v1.1 phases (10-14) derived from 19 requirements at fine granularity, mapping 1:1 to the research's 5-wave structure (Schema+Backfill / Read-Layer+Browse / Checkout+Pricing / Cleanup+WhatsApp / E2E+Deploy)
- Roadmap: Phases execute strictly sequentially (10→11→12→13→14) — each has a hard dependency on its predecessor (schema before code, read-layer before consumers, browse before checkout, type rename before deletion, E2E after all code)
- Roadmap: Service worker cache bump (INF-12) and update prompt (UXD-08) bundled in final deploy phase to ship in the same release as the code cutover — prevents "stale cache" window for returning users
- Roadmap: WhatsApp removal (INF-13/14) bundled with mock-data cleanup (INF-11) in Phase 13 — independent of data cutover, prevents merge-conflict noise during Phases 11-12
- Roadmap: `MockPlan` → `Plan` type rename happens in Phase 12 (before deletion in Phase 13) to avoid TypeScript red-wall

**v1.0 Decisions:**

- Roadmap: 9 phases derived from 29 requirements at fine granularity
- Roadmap: Wholesale API integration front-loaded in Phase 1 to validate highest-risk dependency early
- Roadmap: Guest checkout before accounts (Phase 3 before Phase 5) per research recommendation
- [Phase 01]: Used actual celitech-sdk method names (listDestinations, listPackages, createPurchase, topUpEsim) discovered by runtime inspection
- [Phase 01]: Plus Jakarta Sans as primary font with Inter as fallback per RESEARCH.md recommendation
- [Phase 01]: Explicit ButtonProps interface to avoid motion.button type conflicts with React HTML attributes
- [Phase 02]: Used contents CSS display for grid items with accordion to maintain grid flow
- [Phase 02]: Regional plan card separated from grid as full-width featured element
- [Phase 02]: Non-null assertions for i18n interpolation inside guarded render block
- [Phase 02]: tagPlans uses first-match for mostPopular tie-breaking, reassigns on double-badge conflict
- [Phase 03-01]: Relaxed plan_id schema from uuid() to min(1) for mock data compatibility
- [Phase 03-01]: Installed @stripe/stripe-js for type-safe Stripe Elements config
- [Phase 03-01]: EU VAT rates hardcoded for 27 member states; production uses Stripe Tax API
- [Phase 03-02]: Mock mode (NEXT_PUBLIC_STRIPE_MOCK=true) enables full checkout UI in dev without real Stripe keys
- [Phase 03-02]: Success page redirect guard — payment_intent searchParam required to prevent spurious success display on refresh
- [Phase 03-02]: Stable order ID derived from payment_intent suffix (ORD-{last8}) — deterministic, no regeneration on refresh
- [Phase 03-02]: Pure CSS @keyframes confetti (40 particles) — no external library needed
- [Phase 04]: In-memory Map for provisioning state (no Supabase in dev); will migrate to DB reads in production
- [Phase 04]: AES-256-GCM encryption format: iv_hex:authTag_hex:ciphertext_hex with random IV per call
- [Phase 04]: qrcode.react for client-side QR rendering; QR data uses LPA:1$smdp$code format
- [Phase 04]: encrypted_payload destructured from buildDeliveryData return, clean DeliveryData kept separate
- [Phase 05]: admin.generateLink for branded reset email via Resend instead of resetPasswordForEmail
- [Phase 05]: useActionState (React 19) for auth form server action integration; BambuLoading inline at 24px for button loading states
- [Phase 05]: Branded reset email via Resend (not Supabase default) using admin.generateLink
- [Phase 05]: Order auto-linking silently handles errors -- account creation is primary, linking is best-effort
- [Phase 06]: Top-up flow uses state machine pattern (idle -> plan-select -> payment -> processing -> success/error)
- [Phase 06]: Mock mode bypass in middleware for development without Supabase auth
- [Phase 06]: Inline styles for badge colors (not Tailwind classes) since hex values with opacity need dynamic rendering
- [Phase 06]: Flag emoji via ISO code conversion (String.fromCodePoint) rather than flag image assets for zero-bundle-cost country flags
- [Phase 07]: All test stubs use it.todo() with no production imports for clean Wave 0 isolation
- [Phase 07]: Used (typeof routing.locales)[number] for type-safe locale union instead of hardcoded string literal
- [Phase 07]: createNavigation(routing) pattern for locale-aware Link/useRouter exports
- [Phase 07]: Used dangerouslySetInnerHTML for JSON-LD script injection (standard Next.js pattern for structured data)
- [Phase 07]: Regional destination detection via destination.region === 'europe-wide' check
- [Phase 07]: Language switcher placed in both bottom nav (mobile) and header (desktop) for universal access
- [Phase 07]: Destination cards use useRouter.push for navigation to /[locale]/esim/[slug] instead of accordion toggle
- [Phase 08]: findMockReferralCodeByCode reverse lookup for code-based lookups in referral actions
- [Phase 08]: Coupon pool composed via spread: COUPONS + influencer + reward pools in validateCoupon
- [Phase 08]: Referral reward coupons marked redeemed inline during validateCoupon (single-use enforcement)
- [Phase 08]: Web Share API on mobile covers Instagram via native share sheet; Instagram omitted from desktop fallback
- [Phase 08]: Referral reward triggered on delivery ready in mock mode; production should move to provisioning webhook
- [Phase 08]: zod/v4 for admin API validation consistent with checkout and dashboard schemas
- [Phase 08]: Inline deactivation confirmation per UI-SPEC with row highlight and Confirm/Cancel buttons
- [Phase 09]: Hand-written SW instead of Workbox for minimal bundle and full control over caching strategies
- [Phase 09]: Dark mode hydration script with var for broader browser compat; removed hardcoded colorScheme: light
- [Phase 09]: Auto-sync pattern: online event triggers postMessage REFRESH_CACHE to SW with brief confirmation banner
- [Phase 09]: Used currentColor + className for SVG dark mode instead of JS color switching
- [Phase 09]: QR code container stays white in dark mode for scannability
- [Phase 09]: Replaced inline color styles with Tailwind classes in dashboard/referral components for dark mode support
- [Phase 09]: In-memory Map for push subscriptions in mock mode; production migrates to Supabase push_subscriptions table
- [Phase 09]: QR offline caching uses activation_qr_base64 + manual fields from DeliveryData (not plan's qr_data/setup_guide)
- [Phase 10]: [Phase 10-01]: Applied out-of-order 00003_ migration via 'supabase db push --include-all' (locked sequential prefix sorts before existing timestamped remote migrations)
- [Phase 10]: [Phase 10-01]: Schema verification run via Supabase Management API /database/query endpoint (psql + local Docker unavailable)
- [Phase 10]: [Phase 10-02]: Curated-row threshold corrected to 69 (actual mock-data row count: 3 hero + 66 country) — RESEARCH.md region table miscounted as 78
- [Phase 10]: [Phase 10-02]: sync.ts guarded with DESTINATION_SYNC_COLUMNS allowlist + satisfies clause — curation columns can never be added to the daily Celitech UPSERT (compile-time error)

### Pending Todos

**For Phase 10 plan-phase (Schema and Curation Backfill):**

- Decide policy for the 146 Celitech destinations without curation metadata: hide until manually curated (default), or show in an "Other" region bucket, or seed `region_bucket` from Celitech's `region` field
- Confirm Celitech regional bundle ISO codes in live Supabase before Wave 0 backfill maps EU/AS/GL
- Spot-check Celitech plan currencies — research assumed all USD; query for any `currency != 'USD'` before Phase 12 cutover

### Blockers/Concerns

- **Uncurated destinations decision**: 146 of 226 Celitech destinations have no `region_bucket`. Product owner must decide visibility before Phase 10 backfill runs (default assumption in research: hide until curated)
- **Celitech regional SKU mapping**: synthetic ISO codes EU/AS/GL in mock data have no Celitech equivalent — backfill must explicitly UPSERT the 3 regional rows before the country loop (Pitfall 3)
- **Service-role key discipline**: `import 'server-only'` directive must be added to `src/lib/db/destinations.ts` and any service-role-using script in Phase 10 to prevent client-bundle leakage (Pitfall 2)
- **iOS Capacitor SW behavior**: WKWebView's interaction with service workers differs in edge cases; Pitfall 5 prevention requires TestFlight verification post Phase 14 deploy

## Session Continuity

Last session: 2026-05-16T15:08:44.188Z
Stopped at: Phase 11 UI-SPEC approved
Resume file: .planning/phases/11-read-layer-module-and-browse-cutover/11-UI-SPEC.md
