# Phase 10: Schema and Curation Backfill - Context

**Gathered:** 2026-05-13
**Status:** Ready for planning

<domain>
## Phase Boundary

Add the curation metadata columns Celitech does not return (`popularity_rank`, `region_bucket`) to the existing `destinations` table, and backfill them — plus `image_url` which already exists — from `src/lib/mock-data/destinations.ts` keyed by `iso_code`. Three regional hero rows (`EU`, `AS`, `GL`) are seeded explicitly via UPSERT before the country-level loop because Celitech does not produce them. The daily Celitech sync cron is patched so it never overwrites operator-edited curation columns on its 3am run.

The UI cutover, the read-layer module, and the cleanup of mock-data files are all out of scope for this phase — they belong to Phases 11-13.

</domain>

<decisions>
## Implementation Decisions

### Schema additions
- New columns on existing `destinations` table: `popularity_rank INTEGER NOT NULL DEFAULT 9999` and `region_bucket TEXT`
- `image_url TEXT` already exists in `00001_initial_schema.sql` — currently null for all 226 rows; backfill will populate it for the ~80 curated destinations
- Two partial indexes: `WHERE popularity_rank < 9999` (curated lookup) and `WHERE region_bucket IS NOT NULL` (region grouping)
- Migration file name: `supabase/migrations/00003_destinations_curation_metadata.sql`
- RLS policy `"Public can read active destinations"` is unchanged — new columns inherit existing SELECT permission

### Region column reconciliation
- Keep both `region` and `region_bucket` — they serve different purposes
- `region` (existing, populated by sync.ts) stays as `'country'` / `'region'` classifier — single-country vs multi-country bundle
- `region_bucket` (new, populated by backfill only) holds UI grouping values like `europe`, `asia`, `north-america`, `europe-wide`, `asia-wide`, `global` — sourced from `src/lib/mock-data/destinations.ts`
- No change to existing `region` semantics; sync.ts continues to write `'country'`/`'region'` to it

### Backfill conflict policy
- Idempotent: `WHERE col IS NULL OR col = <default>` guards on every UPDATE
- Operator edits in production Supabase are **never overwritten** by a re-run of the backfill
- Default values that count as "unset" for re-run logic:
  - `popularity_rank`: 9999 (the DEFAULT)
  - `region_bucket`: NULL
  - `image_url`: NULL
- A second invocation against an already-populated DB must report zero updates

### Sync safety (3am Celitech cron)
- Modify `src/lib/esim/sync.ts` so the destinations UPSERT object does NOT include `popularity_rank`, `region_bucket`, or `image_url`
- Daily cron only refreshes `name`, `iso_code`, `region`, `is_active`, `synced_at`
- This prevents the 3am cron from erasing curation values that the backfill or operator edits set

### Regional hero rows (EU / AS / GL)
- Three explicit UPSERTs run **before** the country-level loop:
  - `iso_code='EU'`, `region_bucket='europe-wide'`, `popularity_rank=0`, plus `name`, `slug`, `region='region'`, `is_active=true`
  - `iso_code='AS'`, `region_bucket='asia-wide'`, `popularity_rank=0`
  - `iso_code='GL'`, `region_bucket='global'`, `popularity_rank=0`
- These ISO codes are synthetic (not real ISO 3166) and won't conflict with Celitech sync output

### Uncurated destinations
- The ~146 Celitech destinations with no matching row in mock-data stay at `popularity_rank=9999` and `region_bucket=NULL`
- Phase 11's UI query filters those out (`WHERE popularity_rank < 9999 OR region_bucket IS NOT NULL`)
- No INSERT logic in the backfill — only UPDATE on existing rows by `iso_code`

### Migration deployment cadence
- Direct `supabase db push` against the linked production project (`esim-panda`, `dgpzjtmsiggfcxmjmazg`, EU-West)
- Justification: migration is purely additive — nullable columns with defaults, no constraint changes, no RLS change, zero downtime
- Matches how the five existing v1.0 migrations were deployed
- No Supabase branch, no local docker step — speed-of-execution beats ceremony for a zero-risk change

### Plan granularity
- Two PLAN files:
  - `10-01-PLAN.md` — migration only (creates `00003_destinations_curation_metadata.sql`, runs `supabase db push`, verifies columns + indexes exist via `psql` / Supabase studio query, no data writes)
  - `10-02-PLAN.md` — backfill script (`scripts/backfill-curation.mjs`), sync.ts UPSERT column-list patch, regional hero rows seed, run + verify
- Sequential: `10-02` depends on `10-01` (column must exist before backfill can write to it)
- Each PLAN commits independently so the migration can be deployed/verified before the backfill runs

### Verification gates
- Migration: `select column_name from information_schema.columns where table_name='destinations' and column_name in ('popularity_rank','region_bucket')` returns 2 rows
- Migration: `select indexname from pg_indexes where tablename='destinations' and indexname like '%popularity%' or indexname like '%region_bucket%'` returns 2 rows
- Backfill: `select count(*) from destinations where popularity_rank < 9999` returns ≥ 80
- Backfill: `select count(*) from destinations where iso_code in ('EU','AS','GL') and popularity_rank=0` returns 3
- Backfill: re-running `scripts/backfill-curation.mjs` reports 0 updates (idempotency)
- Anon-key verification: query `select * from destinations where is_active=true limit 1` returns ≥ 1 row (proves RLS doesn't swallow the new columns)
- Sync safety: `grep -n "popularity_rank\|region_bucket\|image_url" src/lib/esim/sync.ts` returns 0 lines inside the UPSERT object

### Claude's Discretion
- Exact partial-index SQL syntax / naming (`idx_destinations_popularity_curated`, `idx_destinations_region_bucket`)
- Exact mock-data parsing approach in the backfill script (ESM dynamic import vs JSON parse vs ts-node)
- Console output verbosity of the backfill script (`Skipped X | Updated Y | Inserted Z` summary format)
- Exact sync.ts edit shape — could be removed-keys, or could be a column allowlist constant — whichever reads better in the file

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase 10 research
- `.planning/research/v1.1/SUMMARY.md` — Phase boundary, key risks, recommended wave structure (Phase 10 = Wave 0)
- `.planning/research/v1.1/ARCHITECTURE.md` — Schema migration SQL pattern, backfill script pattern, hybrid RSC/client decisions for downstream phases
- `.planning/research/v1.1/PITFALLS.md` — Pitfall 1 (RLS empty-array), Pitfall 3 (regional EU/AS/GL mapping), Pitfall 7 (backfill idempotency), Pitfall 11 (OrderRow type drift — relevant once columns exist)
- `.planning/research/v1.1/STACK.md` — Confirms zero new dependencies; `unstable_cache` + `revalidateTag` pattern (relevant for Phase 11 not Phase 10)

### Existing schema + RLS
- `supabase/migrations/00001_initial_schema.sql` — Current `destinations` table definition (lines around `CREATE TABLE destinations`), existing indexes, RLS policy `"Public can read active destinations"` — backfill must preserve all of these
- `supabase/migrations/00002_orders_esim_columns.sql` — Naming/style convention for migration files
- `supabase/migrations/20260425131821_phase_5_9_tables.sql` and the 2026-05 migrations — Timestamp prefix style used by `supabase migration new`

### Code patterns to mirror or modify
- `scripts/sync-catalog-once.mjs` — Pattern for one-off Node script using service-role key + `@supabase/supabase-js`; ESM `.mjs` with `--env-file=.env.local`
- `src/lib/esim/sync.ts` — The daily cron sync; MUST be modified in Phase 10's `10-02-PLAN.md` to exclude curation columns from the destinations UPSERT
- `src/lib/mock-data/destinations.ts` — Source of curation data for the backfill (image_url, popularity_rank, region/region_bucket). DO NOT delete or modify in Phase 10 — that's Phase 13.

### Project context
- `.planning/PROJECT.md` — Current Milestone v1.1 section (live data cutover + WhatsApp removal context)
- `.planning/REQUIREMENTS.md` — REQ-IDs INF-09 (schema migration) and INF-10 (backfill) — the only two requirements Phase 10 owns

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `scripts/sync-catalog-once.mjs` — Working template for the new backfill script: imports `Celitech` (drop) and `createClient` (keep), reads `.env.local`, uses service-role key, idempotent upsert with `WHERE col IS NULL` guards
- `supabase` CLI installed at `~/.local/bin/supabase`, logged in, linked to project `esim-panda` — `supabase migration new`, `supabase db push`, `supabase migration list` all work today
- Existing 5 migrations in `supabase/migrations/` — naming pattern, RLS-aware additive style

### Established Patterns
- Service-role client for write-path scripts (`SUPABASE_SERVICE_ROLE_KEY` bypasses RLS): same pattern in `src/lib/esim/sync.ts` and the new `src/app/api/webhooks/celitech/route.ts`
- Idempotency via `WHERE col IS NULL` guards (proven in v1.0 by `syncCatalog`'s upsert-by-unique-key approach)
- Migrations are additive in v1.0; no DROP COLUMN or destructive changes anywhere

### Integration Points
- The migration touches `destinations` table only — no impact on `plans`, `orders`, `esims`
- The backfill reads `src/lib/mock-data/destinations.ts` (still exists in v1.1 — deleted only in Phase 13)
- The sync.ts patch is one targeted edit in the destinations UPSERT object literal — does not touch the plans UPSERT
- No UI code is touched in Phase 10 — all UI changes start in Phase 11

</code_context>

<specifics>
## Specific Ideas

- "Direct `supabase db push` — matches how we shipped the five v1.0 migrations, don't over-ceremony a zero-risk additive change"
- "Two PLANs — migration and backfill should commit independently so the migration can be verified before any data writes happen"
- "Operator edits must be sacred. If someone manually re-ranks Spain to popularity_rank=1 next month, neither the backfill re-run nor the 3am sync can erase that."
- Regional hero rows: `EU` / `AS` / `GL` are the only ISO codes the mock-data layer invented that don't correspond to real ISO 3166 codes — the backfill must seed them explicitly before the country loop or those three cards never appear in the v1.1 UI

</specifics>

<deferred>
## Deferred Ideas

- **Per-destination CMS UI for operator curation** — currently operators would edit popularity_rank/image_url via Supabase studio directly. A proper admin UI is a v2 concern (ADV-01 in REQUIREMENTS.md).
- **Migrate `image_url` hosting from Pexels hotlinks to Supabase Storage** — Pitfalls research flagged third-party hotlink risk. Out of scope for v1.1; revisit if Pexels availability becomes a problem.
- **`supabase gen types typescript` codegen** — would auto-update TypeScript types from schema. PITFALLS.md flags this as a v1.2 Wave 1 task; deferring for now since v1.1 hand-types the `Plan` / `Destination` shapes.
- **Verifying Celitech plan currencies are all USD** — flagged in PITFALLS.md as a Wave 2 task (Phase 12), not Phase 10.

</deferred>

---

*Phase: 10-schema-and-curation-backfill*
*Context gathered: 2026-05-13*
