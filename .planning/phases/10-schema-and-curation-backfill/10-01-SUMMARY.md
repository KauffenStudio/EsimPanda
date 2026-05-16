---
phase: 10-schema-and-curation-backfill
plan: 01
subsystem: database
tags: [supabase, postgres, migration, partial-index, schema, rls]

# Dependency graph
requires:
  - phase: 01-foundation
    provides: destinations table + "Public can read active destinations" RLS policy (00001_initial_schema.sql)
provides:
  - destinations.popularity_rank column (INTEGER NOT NULL DEFAULT 9999) on production Supabase
  - destinations.region_bucket column (TEXT, nullable) on production Supabase
  - idx_destinations_popularity_curated partial index (WHERE popularity_rank < 9999)
  - idx_destinations_region_bucket partial index (WHERE region_bucket IS NOT NULL)
affects: [10-02-backfill, 11-read-layer-and-browse-cutover]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Additive-only migration: ADD COLUMN IF NOT EXISTS + CREATE INDEX IF NOT EXISTS, no transaction wrap, no CONCURRENTLY"
    - "Sequential 00003_ migration prefix retained (locked) despite repo's later timestamped-prefix migrations"
    - "Out-of-order migration applied to remote via `supabase db push --include-all`"

key-files:
  created:
    - supabase/migrations/00003_destinations_curation_metadata.sql
  modified: []

key-decisions:
  - "Used `supabase db push --include-all` because the locked 00003_ prefix sorts before the existing timestamped remote migrations — the default push refused without the flag."
  - "Verification queries (information_schema.columns, pg_indexes) run via the Supabase Management API /database/query endpoint — psql, SUPABASE_DB_URL, and local Docker were all unavailable."

patterns-established:
  - "Pattern: out-of-order migrations (sequential prefix added after timestamped ones) require `--include-all` on db push"
  - "Pattern: schema verification via Supabase Management API database/query endpoint when psql is unavailable"

requirements-completed: [INF-09]

# Metrics
duration: 2min
completed: 2026-05-16
---

# Phase 10 Plan 01: Schema and Curation Backfill (Migration) Summary

**Applied additive v1.1 migration adding `popularity_rank` and `region_bucket` curation columns plus two partial indexes to production Supabase `destinations`, with RLS policy untouched.**

## Performance

- **Duration:** 2 min
- **Started:** 2026-05-16T12:32:05Z
- **Completed:** 2026-05-16T12:34:17Z
- **Tasks:** 3
- **Files modified:** 1 (created)

## Accomplishments
- Created `supabase/migrations/00003_destinations_curation_metadata.sql` with the locked ALTER TABLE + 2 CREATE INDEX statements (verbatim from 10-RESEARCH.md §1)
- Applied the migration to production project `esim-panda` (ref `dgpzjtmsiggfcxmjmazg`, EU-West) via `supabase db push --include-all`
- Verified both new columns exist with the exact locked types/defaults and both partial indexes exist with the correct `WHERE` predicates
- Confirmed RLS policy `Public can read active destinations` is unchanged and anon-key reads of the 226 existing rows still succeed (no RLS regression)

## Task Commits

Each task was committed atomically:

1. **Task 1: Create the migration file at the locked path** - `9f1e430` (feat)
2. **Task 2: Apply the migration to production Supabase** - no source files modified (remote schema change only; no commit)
3. **Task 3: Verify columns + indexes exist on production Supabase** - no source files modified (verification only; no commit)

**Plan metadata:** see final docs commit

## Files Created/Modified
- `supabase/migrations/00003_destinations_curation_metadata.sql` - Additive migration: adds `popularity_rank` (INTEGER NOT NULL DEFAULT 9999) and `region_bucket` (TEXT, nullable) columns to `destinations`, plus two partial indexes

### Exact migration file contents

```sql
-- Phase 10 (INF-09): add curation columns Celitech does not return.
-- Populated by scripts/backfill-curation.mjs (INF-10) after this migration applies.
-- Additive only: nullable columns with safe defaults; existing RLS policy
-- "Public can read active destinations" (00001 line 106) is column-agnostic
-- (USING (is_active = true) FOR SELECT) and grants SELECT on these new columns automatically.

ALTER TABLE destinations
  ADD COLUMN IF NOT EXISTS popularity_rank INTEGER NOT NULL DEFAULT 9999,
  ADD COLUMN IF NOT EXISTS region_bucket   TEXT;

-- Partial index 1: speeds up the curated-destinations sort path
--   SELECT ... FROM destinations WHERE popularity_rank < 9999 ORDER BY popularity_rank ASC
-- (uncurated rows default to 9999 and stay out of the index)
CREATE INDEX IF NOT EXISTS idx_destinations_popularity_curated
  ON destinations (popularity_rank)
  WHERE popularity_rank < 9999;

-- Partial index 2: speeds up region-pill grouping queries
--   SELECT ... FROM destinations WHERE region_bucket = 'europe'
CREATE INDEX IF NOT EXISTS idx_destinations_region_bucket
  ON destinations (region_bucket)
  WHERE region_bucket IS NOT NULL;
```

### `supabase db push` output

First attempt (`supabase db push`, no flag) reported:
```
Found local migration files to be inserted before the last migration on remote database.
Rerun the command with --include-all flag to apply these migrations:
supabase/migrations/00003_destinations_curation_metadata.sql
```

Second attempt (`supabase db push --include-all`) succeeded:
```
Initialising login role...
Connecting to remote database...
Do you want to push these migrations to the remote database?
 • 00003_destinations_curation_metadata.sql
 [Y/n] Y
Applying migration 00003_destinations_curation_metadata.sql...
Finished supabase db push.
```

`supabase migration list` confirmed Local/Remote parity:
```
 Local          | Remote         | Time (UTC)
 ---------------|----------------|---------------------
 00001          | 00001          | 00001
 00002          | 00002          | 00002
 00003          | 00003          | 00003
 20260425131821 | 20260425131821 | 2026-04-25 13:18:21
 20260502220212 | 20260502220212 | 2026-05-02 22:02:12
 20260503150846 | 20260503150846 | 2026-05-03 15:08:46
```

### Verification query results (gate evidence for INF-09)

**Query 1 — columns** (`information_schema.columns`, exactly 2 rows):
```json
[{"column_name":"popularity_rank","data_type":"integer","is_nullable":"NO","column_default":"9999"},
 {"column_name":"region_bucket","data_type":"text","is_nullable":"YES","column_default":null}]
```

**Query 2 — partial indexes** (`pg_indexes`, exactly 2 rows):
```json
[{"indexname":"idx_destinations_popularity_curated","indexdef":"CREATE INDEX idx_destinations_popularity_curated ON public.destinations USING btree (popularity_rank) WHERE (popularity_rank < 9999)"},
 {"indexname":"idx_destinations_region_bucket","indexdef":"CREATE INDEX idx_destinations_region_bucket ON public.destinations USING btree (region_bucket) WHERE (region_bucket IS NOT NULL)"}]
```

**RLS policy** (`pg_policies`, unchanged):
```json
[{"policyname":"Public can read active destinations","cmd":"SELECT","qual":"(is_active = true)"}]
```

Additional confirmations via service-role + anon clients:
- All 226 existing rows have `popularity_rank = 9999` (NOT NULL DEFAULT applied) and `region_bucket IS NULL` (nullable)
- Anon-key SELECT of an active destination returns the row with the two new columns visible — no RLS regression

## Decisions Made
- **Used `supabase db push --include-all`** — the locked `00003_` prefix sorts before the existing timestamped remote migrations (`20260425...` etc.), so the default `db push` refused to insert it out of order. `--include-all` is the documented flag for this exact case; the migration is additive/zero-risk so out-of-order insertion is safe. 10-RESEARCH.md §2 already anticipated the mixed-prefix repo state.
- **Ran verification queries via the Supabase Management API `/v1/projects/{ref}/database/query` endpoint** — `psql` is not installed, no `SUPABASE_DB_URL` is wired in `.env.local`, and local Docker (needed for `supabase status`) is not running. The Management API (authenticated via the `SUPABASE_ACCESS_TOKEN` env var) runs the exact locked Query 1/Query 2 SQL against production. This is the no-extra-wiring path the plan's Task 3 permitted as an alternative to Studio.

## Deviations from Plan

### Process deviations (no auto-fixes to code)

**1. [Rule 3 - Blocking] `supabase db push` required the `--include-all` flag**
- **Found during:** Task 2 (Apply the migration to production Supabase)
- **Issue:** Plain `supabase db push` refused: the `00003_` migration sorts before the remote's last (timestamped) migration, so the CLI treats it as an out-of-order insertion and requires explicit opt-in.
- **Fix:** Re-ran as `supabase db push --include-all`, which the plan's Task 2 action explicitly anticipated ("pass `--include-all` only if explicitly required"). Migration applied cleanly.
- **Files modified:** none (remote schema change only)
- **Verification:** `supabase migration list` shows `00003` in both Local and Remote columns; Query 1/Query 2 confirm columns + indexes exist.
- **Committed in:** n/a (no source file change)

**2. [Rule 3 - Blocking] Verification path switched from psql to the Management API**
- **Found during:** Task 3 (Verify columns + indexes)
- **Issue:** Plan's Task 3 preferred `psql "$SUPABASE_DB_URL"`, but `psql` is not installed and no DB URL is wired; `supabase status` needs local Docker which is not running.
- **Fix:** Ran the two locked verification queries via the Supabase Management API `/database/query` endpoint (authenticated with `SUPABASE_ACCESS_TOKEN`). The plan's Task 3 explicitly allowed an alternative path ("use the Supabase Studio SQL editor ... document the result") — the Management API is the programmatic equivalent.
- **Files modified:** none (verification only)
- **Verification:** Both queries returned exactly 2 rows with the locked types/defaults/predicates.
- **Committed in:** n/a (no source file change)

---

**Total deviations:** 2 process deviations (both Rule 3 - blocking), 0 code auto-fixes
**Impact on plan:** Both deviations are environment-driven (missing local tooling) and were resolved with flags/endpoints the plan itself permitted. No scope creep, no behavior change to the migration. The migration body is verbatim the locked 10-RESEARCH.md §1.

## Issues Encountered
- Phase verification check #5 expects `grep -c "Public can read active destinations"` on the migration file to return 0. It returns 1 — but the only match is the explanatory **comment** on line 4 (verbatim from the locked RESEARCH.md §1 body). `grep -ciE "(CREATE|ALTER|DROP)\s+POLICY"` returns 0, confirming the migration contains no policy DDL. The intent of check #5 (migration must not modify the RLS policy) is satisfied; the literal count of 1 is an expected comment-only match.

## User Setup Required
None - no external service configuration required. The migration is already applied to production.

## Next Phase Readiness
- **Plan 10-02 (backfill) is now unblocked** — the `popularity_rank`, `region_bucket` columns exist on production `destinations` for the backfill script to write to.
- The 226 existing rows are all at default values (`popularity_rank=9999`, `region_bucket=NULL`), exactly the "uncurated" state the idempotent backfill expects.
- Phase 11 (read-layer + browse cutover) can rely on these columns existing once 10-02 populates them.

---
*Phase: 10-schema-and-curation-backfill*
*Completed: 2026-05-16*

## Self-Check: PASSED

- FOUND: `supabase/migrations/00003_destinations_curation_metadata.sql`
- FOUND: `.planning/phases/10-schema-and-curation-backfill/10-01-SUMMARY.md`
- FOUND: commit `9f1e430` (Task 1)
