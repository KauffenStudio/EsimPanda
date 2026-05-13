# Phase 10: Schema and Curation Backfill — Research

**Researched:** 2026-05-14
**Domain:** Supabase Postgres 15 migration + idempotent backfill (Node `.mjs`) — additive only
**Confidence:** HIGH (all decisions verified against on-disk code, Postgres 15 docs, Supabase JS docs, and the v1.1 architecture/pitfalls research already produced)

---

## Summary

Phase 10 is a Wave-0, pure-DB change. It adds two columns (`popularity_rank`, `region_bucket`) to the existing `destinations` table, adds two partial indexes, and runs a one-off Node `.mjs` script that copies curation metadata from `src/lib/mock-data/destinations.ts` (78 rows: 3 regional + 75 country) into Supabase keyed by `iso_code`. A defensive allowlist patch on `src/lib/esim/sync.ts` ensures the 3 a.m. Celitech cron continues to never touch curation columns — confirmed by grep that the current sync code already excludes them, so the patch is preventive/explicit, not corrective.

The decisions in `10-CONTEXT.md` are locked. All open implementation details — exact SQL, exact Supabase CLI invocation, mock-data parse strategy, sync.ts patch shape, idempotency assertion, anon-key verification — are resolved below with concrete code/SQL/CLI snippets. The planner can write executable tasks without further investigation.

**Primary recommendation:** Generate the migration file manually as `supabase/migrations/00003_destinations_curation_metadata.sql` (do NOT use `supabase migration new` — it produces a timestamp prefix that breaks the locked file name). Backfill script parses mock data via dynamic ESM import using the runtime TS-strip flag (`node --experimental-strip-types --env-file=.env.local`), with a hardcoded JS literal fallback documented inline. UPDATE uses `.eq('iso_code', ...).is('popularity_rank', null).select('id')`-style guards so re-runs report zero matches.

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Schema additions**
- New columns on existing `destinations` table: `popularity_rank INTEGER NOT NULL DEFAULT 9999` and `region_bucket TEXT`
- `image_url TEXT` already exists in `00001_initial_schema.sql` — currently null for all 226 rows; backfill will populate it for the ~80 curated destinations
- Two partial indexes: `WHERE popularity_rank < 9999` (curated lookup) and `WHERE region_bucket IS NOT NULL` (region grouping)
- Migration file name: `supabase/migrations/00003_destinations_curation_metadata.sql`
- RLS policy `"Public can read active destinations"` is unchanged — new columns inherit existing SELECT permission

**Region column reconciliation**
- Keep both `region` and `region_bucket` — they serve different purposes
- `region` (existing, populated by sync.ts) stays as `'country'` / `'region'` classifier — single-country vs multi-country bundle
- `region_bucket` (new, populated by backfill only) holds UI grouping values like `europe`, `asia`, `north-america`, `europe-wide`, `asia-wide`, `global`
- No change to existing `region` semantics; sync.ts continues to write `'country'`/`'region'` to it

**Backfill conflict policy**
- Idempotent: `WHERE col IS NULL OR col = <default>` guards on every UPDATE
- Operator edits in production Supabase are **never overwritten** by a re-run of the backfill
- Defaults that count as "unset": `popularity_rank=9999`, `region_bucket=NULL`, `image_url=NULL`
- A second invocation against an already-populated DB must report zero updates

**Sync safety (3am Celitech cron)**
- Modify `src/lib/esim/sync.ts` so the destinations UPSERT object does NOT include `popularity_rank`, `region_bucket`, or `image_url`
- Daily cron only refreshes `name`, `iso_code`, `region`, `is_active`, `synced_at`
- (Note: current sync.ts already excludes these three columns — see Decision #4 below; the patch is to make this exclusion explicit/durable, not corrective.)

**Regional hero rows (EU / AS / GL)**
- Three explicit UPSERTs before the country-level loop:
  - `iso_code='EU'`, `region_bucket='europe-wide'`, `popularity_rank=0`, plus `name`, `slug`, `region='region'`, `is_active=true`
  - `iso_code='AS'`, `region_bucket='asia-wide'`, `popularity_rank=0`
  - `iso_code='GL'`, `region_bucket='global'`, `popularity_rank=0`
- These ISO codes are synthetic (not real ISO 3166) and won't conflict with Celitech sync output

**Uncurated destinations**
- ~146 Celitech destinations with no matching row in mock-data stay at `popularity_rank=9999` and `region_bucket=NULL`
- Phase 11's UI query filters those out (`WHERE popularity_rank < 9999 OR region_bucket IS NOT NULL`)
- No INSERT logic in the backfill — only UPDATE on existing rows by `iso_code`, EXCEPT for the three regional hero rows (UPSERT because they don't yet exist in DB)

**Migration deployment cadence**
- Direct `supabase db push` against linked production project `esim-panda` (`dgpzjtmsiggfcxmjmazg`, EU-West)
- Justification: purely additive — nullable columns with defaults, no constraint changes, no RLS change, zero downtime
- Matches how the five existing v1.0 migrations were deployed
- No Supabase branch, no local docker step

**Plan granularity**
- `10-01-PLAN.md` — migration only (create file, `supabase db push`, verify columns + indexes via SQL, no data writes)
- `10-02-PLAN.md` — backfill script + sync.ts allowlist patch + regional hero seed + run + verify
- `10-02` depends on `10-01`; each commits independently

**Verification gates**
- Migration: `select column_name from information_schema.columns where table_name='destinations' and column_name in ('popularity_rank','region_bucket')` returns 2 rows
- Migration: `select indexname from pg_indexes where tablename='destinations' and (indexname like '%popularity%' or indexname like '%region_bucket%')` returns 2 rows
- Backfill: `select count(*) from destinations where popularity_rank < 9999` returns ≥ 80
- Backfill: `select count(*) from destinations where iso_code in ('EU','AS','GL') and popularity_rank=0` returns 3
- Backfill: re-running `scripts/backfill-curation.mjs` reports 0 updates (idempotency)
- Anon-key: `select * from destinations where is_active=true limit 1` returns ≥ 1 row
- Sync safety: `grep -n "popularity_rank\|region_bucket\|image_url" src/lib/esim/sync.ts` returns 0 lines inside the UPSERT object

### Claude's Discretion

- Exact partial-index SQL syntax / naming (`idx_destinations_popularity_curated`, `idx_destinations_region_bucket`)
- Exact mock-data parsing approach in the backfill script (ESM dynamic import vs JSON parse vs ts-node)
- Console output verbosity of the backfill script
- Exact sync.ts edit shape — could be removed-keys, or a column allowlist constant

### Deferred Ideas (OUT OF SCOPE)

- Per-destination CMS UI for operator curation (ADV-01, v2)
- Migrate `image_url` from Pexels hotlinks to Supabase Storage
- `supabase gen types typescript` codegen (deferred to v1.2)
- Verifying Celitech plan currencies are all USD (Phase 12, not Phase 10)
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| INF-09 | Supabase migration adds `popularity_rank INTEGER` and `region_bucket TEXT` columns to `destinations` (additive, no RLS change) | §1 Migration SQL syntax — full file body + verification queries |
| INF-10 | One-off backfill script copies curation metadata (`popularity_rank`, `image_url`, `region_bucket`) from `src/lib/mock-data/destinations.ts` into Supabase by `iso_code`, idempotently | §2 Mock-data parse strategy, §3 Idempotency pattern, §4 Sync safety, §5 Regional hero rows |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `@supabase/supabase-js` | `2.103.3` (already installed) | Service-role client for backfill UPDATEs | Established in `scripts/sync-catalog-once.mjs` and `src/lib/esim/sync.ts` — same pattern, same key handling |
| `supabase` CLI | `2.78.1` at `~/.local/bin/supabase` | `db push` to apply migration to linked project | Already authenticated, already linked to `esim-panda` (`dgpzjtmsiggfcxmjmazg`) |
| Node 24+ runtime | system | Run `.mjs` script with `--env-file` flag | `scripts/sync-catalog-once.mjs` already uses this exact pattern |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Node `--experimental-strip-types` | Node 22.6+ (24 is fine) | Run a `.ts` import directly from `.mjs` without a build step | Optional — only if planner picks the "dynamic import the .ts" parse strategy in §2 |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `supabase db push` | A Postgres migration via `psql` against the pooler URL | Both work; `supabase db push` is the established repo pattern (5 prior migrations) — use it for consistency |
| `.mjs` Node script | A SQL-only migration that hardcodes the 78 rows as INSERT statements | SQL-only is simpler but harder to read review (long literal blocks) and harder to keep idempotent with mixed UPSERT + guarded UPDATE semantics — keep separation: migration = schema, script = data |
| Dynamic ESM import of `.ts` | One-time `node scripts/dump-mock-curation.mjs > /tmp/curation.json` then load JSON | Marginally cleaner; both equally one-off. Pick dynamic import — fewer moving parts |

**Installation:** No new dependencies. All packages already in `package.json`.

**Version verification:**
```bash
npm view @supabase/supabase-js version    # confirmed 2.84.0+ is current; locked at 2.103.3
supabase --version                         # 2.78.1 installed; CLI 2.98.2 available — not required to upgrade
```

---

## Architecture Patterns

### Recommended Project Structure (delta for Phase 10)
```
supabase/migrations/
  └── 00003_destinations_curation_metadata.sql   # NEW (Plan 10-01)
scripts/
  └── backfill-curation.mjs                       # NEW (Plan 10-02), deleted in Phase 13
src/lib/esim/
  └── sync.ts                                     # PATCHED (Plan 10-02) — defensive allowlist
```

No new directories. Both new files mirror existing siblings (`00002_orders_esim_columns.sql`, `sync-catalog-once.mjs`).

### Pattern 1: Additive, Idempotent Migration
**What:** Migration uses `ADD COLUMN IF NOT EXISTS` and `CREATE INDEX IF NOT EXISTS` exclusively. No `ALTER COLUMN`, no `DROP`, no transaction wrapping that fights `CREATE INDEX CONCURRENTLY` (we don't use CONCURRENTLY — see Pitfall 1 below).
**When to use:** Always for v1.x — repo invariant is "no destructive migrations."
**Example:**
```sql
-- Source: postgresql.org/docs/15/sql-createindex.html + Supabase repo migration style
ALTER TABLE destinations
  ADD COLUMN IF NOT EXISTS popularity_rank INTEGER NOT NULL DEFAULT 9999,
  ADD COLUMN IF NOT EXISTS region_bucket   TEXT;

CREATE INDEX IF NOT EXISTS idx_destinations_popularity_curated
  ON destinations (popularity_rank) WHERE popularity_rank < 9999;

CREATE INDEX IF NOT EXISTS idx_destinations_region_bucket
  ON destinations (region_bucket) WHERE region_bucket IS NOT NULL;
```

### Pattern 2: One-Off Service-Role Script (mirrors `sync-catalog-once.mjs`)
**What:** Standalone Node `.mjs` reading `SUPABASE_SERVICE_ROLE_KEY` via `--env-file=.env.local`; `createClient` from `@supabase/supabase-js` (NOT `@supabase/ssr`); idempotent UPDATE/UPSERT in a loop; logs summary counts only (Pitfall 2 from PITFALLS.md — never log row contents to CI).
**When to use:** One-off data migration that needs to bypass RLS but doesn't belong in a SQL migration (mixed UPSERT + guarded UPDATE semantics).
**Example shape** (full version in §2 below):
```js
// Source: scripts/sync-catalog-once.mjs (existing pattern), src/lib/esim/sync.ts:8-11
import { createClient } from '@supabase/supabase-js';

const required = ['NEXT_PUBLIC_SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY'];
for (const k of required) {
  if (!process.env[k]) { console.error(`Missing env: ${k}`); process.exit(1); }
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);
```

### Pattern 3: Guarded UPDATE for Idempotency
**What:** Add a `.is('column', null)` (or `.eq('column', defaultValue)`) filter on every UPDATE so re-runs cannot overwrite operator edits. Chain `.select('id')` so we get a row array whose length is the affected-row count.
**When to use:** Any data-migration script that may be re-run against a live DB.

```js
const { data, error } = await supabase
  .from('destinations')
  .update({ popularity_rank: row.popularity_rank })
  .eq('iso_code', row.iso_code)
  .eq('popularity_rank', 9999)        // idempotency guard — only write if still default
  .select('id');

// data.length === 1  → updated this run
// data.length === 0  → already populated (operator edit OR previous run)
```

Same pattern for `image_url` (`.is('image_url', null)`) and `region_bucket` (`.is('region_bucket', null)`).

### Anti-Patterns to Avoid
- **`CREATE INDEX CONCURRENTLY` inside a migration** — Supabase wraps migrations in a transaction, and `CONCURRENTLY` cannot run in a transaction (`ERROR: CREATE INDEX CONCURRENTLY cannot run inside a transaction block`). For 226 rows on a tiny indexed table, plain `CREATE INDEX` is sub-millisecond. Don't use CONCURRENTLY.
- **`supabase migration new <name>` for this phase** — generates `<timestamp>_<name>.sql`, but CONTEXT.md locks the file name to `00003_...`. The timestamp prefix would sort AFTER the existing `20260503150846_device_tokens.sql` and break the intended ordering. Create the file manually with `touch`/`Write`.
- **One big UPSERT for the 78 rows** — UPSERT touches every column including overwriting operator edits. Use `.upsert` only for the three regional hero rows that don't yet exist in DB; use guarded `.update` for the 75 country rows that already exist (synced by Celitech).
- **Logging full row contents to CI** — Pitfall 2 (PITFALLS.md §Security Mistakes). Log only `iso_code` and counts.
- **Hand-rolling row-count from `.update()` without `.select()`** — supabase-js `.update()` returns `{ data: null, ... }` by default. Must chain `.select()` to get the affected rows back. Confirmed in Supabase JS reference docs (verified 2026-05-14).

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Idempotency tracking | Hand-rolled migration state table | Inline `WHERE col IS NULL` guards in each UPDATE statement | The "guard predicates" pattern is the canonical Postgres idempotency idiom — no infra needed |
| Row-count reporting | Manual `SELECT count(*)` before & after | `.update().eq(...).select('id')` returning array length | One round-trip, atomic, exactly what supabase-js was designed for |
| Schema-change rollback | Hand-rolled down-migration | Migration is purely additive; columns are nullable; rollback = `ALTER TABLE destinations DROP COLUMN popularity_rank, DROP COLUMN region_bucket` as a hotfix migration | v1.0 has zero `down` migrations — repo convention is forward-only additive |
| Anon-key probe | curl against `/rest/v1/` with raw JWT | A 5-line `.mjs` using `createClient(URL, ANON_KEY)` — see §6 below | Same library, no auth dance, fits the verification gate command |

**Key insight:** Postgres + supabase-js already provide every primitive Phase 10 needs. Every hand-roll temptation here is a sign that the simpler primitive was overlooked.

---

## Decision Resolutions (Open Questions From Phase Brief)

### 1. Migration SQL syntax — exact body

**File:** `supabase/migrations/00003_destinations_curation_metadata.sql`

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

**Postgres 15 partial-index syntax confirmed:**
- `CREATE INDEX [IF NOT EXISTS] name ON table (col) WHERE predicate;` — canonical form per [PostgreSQL 15 docs](https://www.postgresql.org/docs/15/sql-createindex.html)
- Predicate must use immutable operators (`<`, `IS NULL` — both immutable, both safe)
- `IF NOT EXISTS` makes the migration re-runnable if a partial apply ever happened
- Plain `CREATE INDEX` (no `CONCURRENTLY`) is required inside Supabase migrations — they execute in a transaction. `CONCURRENTLY` would error: `CREATE INDEX CONCURRENTLY cannot run inside a transaction block`. (226 rows, sub-ms operation — no benefit to CONCURRENTLY anyway.)

**Naming convention:** `idx_destinations_<column>_<qualifier>` — matches the existing convention in `00001_initial_schema.sql`:
- `idx_destinations_iso` (line 88)
- `idx_destinations_slug` (line 89)
- `idx_plans_active` (line 91) — also a partial index with `WHERE is_active = true`

### 2. `supabase migration new` does NOT fit this phase

**Behavior:** `supabase migration new <name>` creates `supabase/migrations/<UTC_TIMESTAMP>_<name>.sql` with timestamp format `YYYYMMDDHHMMSS`. Verified via `supabase migration new --help` on the installed CLI (v2.78.1).

**Mismatch with locked file name:**
- CONTEXT.md locks the file name to `00003_destinations_curation_metadata.sql` (sequential prefix matching `00001`/`00002`).
- `supabase migration new` would produce something like `20260514HHMMSS_destinations_curation_metadata.sql`.
- That timestamp prefix would order AFTER the existing `20260503150846_device_tokens.sql` — which is the intended order anyway — but the prefix STYLE diverges from the locked name and breaks grep-ability for "the v1.1 schema change."

**Resolution:** Create the migration manually:
```bash
# In the Plan 10-01 task list:
touch supabase/migrations/00003_destinations_curation_metadata.sql
# Then Write the SQL body from §1 above
```

**Then apply:**
```bash
supabase db push
# Or, if push requires explicit confirmation:
supabase db push --linked
```

Note: the existing 5 migrations include both `00001`/`00002` (sequential, pre-CLI-link era) and `20260425131821`/`20260502220212`/`20260503150846` (timestamped, post-CLI-link era). The repo is already mixed. CONTEXT.md's `00003_` choice is consistent with the *spirit* of the v1.0 schema lineage (the v1.0 doc-and-data migrations) rather than the post-CLI-link timestamped style. Honor the lock.

### 3. Mock-data parse strategy in `.mjs` — three options compared

**The source file:** `src/lib/mock-data/destinations.ts` is a TypeScript ESM module that exports `mockDestinations: MockDestination[]` — 78 entries (3 regional + 75 country). Each entry has:
- `iso_code` (key for join — string, ISO 3166-1 alpha-2 OR synthetic `EU`/`AS`/`GL`)
- `popularity_rank` (number, 0–45)
- `image_url` (string, Pexels URL)
- `region` (string — **this is the mock's `region` field; in backfill this maps to `region_bucket`**)
- Other fields the backfill ignores: `id`, `name`, `slug`, `is_active`, timestamps

**Enumerated `region` values from the mock** (these become `region_bucket` values in DB):
| Mock `region` value | Count | Example ISO codes |
|---|---|---|
| `europe-wide` | 1 | EU |
| `asia-wide` | 1 | AS |
| `global` | 1 | GL |
| `europe` | 45 | FR, ES, IT, DE, PT… |
| `asia` | 10 | JP, KR, TH, ID… |
| `north-america` | 3 | US, CA, MX |
| `south-america` | 2 | BR, AR |
| `middle-east` | 3 | SA, QA, EG |
| `oceania` | 2 | AU, NZ |
| `africa` | 1 | MA |
| **Total** | **78** | |

`popularity_rank`: the 3 regional rows are rank 0; country rows are ranked within their bucket (FR=1, ES=2, …) up to 45. `image_url`: all Pexels URLs in the form `https://images.pexels.com/photos/<id>/pexels-photo-<id>.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop`.

**Three parse options:**

| Option | How | Pros | Cons | Verdict |
|---|---|---|---|---|
| **a) Dynamic ESM import with strip-types** | `node --experimental-strip-types --env-file=.env.local scripts/backfill-curation.mjs` then `const { mockDestinations } = await import('../src/lib/mock-data/destinations.ts')` | Reads live source; survives mock edits | Requires Node 22.6+; flag is "experimental" until Node 24 (current LTS); one extra Node arg | **Chosen** — Node 24 is system runtime; flag is stable enough for a one-off script |
| b) One-time JSON dump | First run `node --experimental-strip-types -e "import('./src/lib/mock-data/destinations.ts').then(m => console.log(JSON.stringify(m.mockDestinations, null, 2)))" > scripts/curation-data.json`, then backfill script imports the JSON | Backfill script needs no TS flag; auditable file | Two-step process; the JSON file becomes a second source of truth | Acceptable fallback |
| c) Hardcode the 78 rows as a JS literal in the `.mjs` | Copy/paste the data inline | Zero flags, zero imports | Drift risk: mock-data edits don't propagate; 78-row literal in script body | Rejected — drift |
| d) Regex parse the `.ts` file | `fs.readFileSync` + regex on `dest(...)` calls | Pure JS, no flags | Brittle on whitespace/format changes | Rejected |

**Recommendation: option (a)** with a small adapter at the top of the script:

```js
// scripts/backfill-curation.mjs
// Run: node --experimental-strip-types --env-file=.env.local scripts/backfill-curation.mjs
import { mockDestinations } from '../src/lib/mock-data/destinations.ts';
```

If the strip-types flag fails for any reason in the planner's environment, the fallback is option (b) — well-documented in the planner's task list.

**Fields the backfill writes per row:**
```js
// for each mockDestinations[i]:
{
  iso_code:        row.iso_code,        // join key
  popularity_rank: row.popularity_rank, // 0..45
  image_url:       row.image_url,       // Pexels URL
  region_bucket:   row.region,          // 'europe' | 'asia' | 'europe-wide' | ...
}
```

### 3.5 Nyquist validation strategy

Phase 10 has zero application-code surface (no React, no API routes, no hooks). The four code/data artifacts are:
1. SQL migration file
2. `.mjs` backfill script
3. `sync.ts` allowlist patch
4. Verification queries

Standard unit-test scaffolding (`vitest`) does not naturally cover (1)–(3) — these are infrastructure operations. The correct Nyquist response is **DB-state assertion**, not in-memory mocked tests.

**Validation routes per decision:**

| Decision | Validate via | Test type |
|---|---|---|
| Migration applies cleanly to live DB | Live SQL queries against `information_schema.columns` and `pg_indexes` (the locked verification gates) | manual SQL — automated runnable as a script |
| Indexes exist with correct partial predicates | `\d+ destinations` in `psql`, or `SELECT indexdef FROM pg_indexes WHERE indexname = 'idx_destinations_popularity_curated'` returning a string containing `WHERE (popularity_rank < 9999)` | manual SQL |
| Backfill writes the expected 78 rows | `SELECT count(*) FROM destinations WHERE popularity_rank < 9999` returns ≥ 78 (allows for the 3 newly-UPSERTed regional rows) | manual SQL |
| Backfill respects idempotency | Run script twice; second run logs `Updated: 0` | shell script — capture stdout, grep |
| Anon-key SELECTs new columns | Tiny `.mjs` script using `NEXT_PUBLIC_SUPABASE_ANON_KEY` that does `from('destinations').select('id, popularity_rank, region_bucket, image_url').eq('is_active', true).limit(1)` and asserts non-empty | shell script |
| sync.ts allowlist does not regress | `grep -nE "(popularity_rank|region_bucket|image_url)" src/lib/esim/sync.ts` returns **only** the comment line documenting the exclusion (or zero lines) | grep — CI-runnable |
| Regional hero rows present | `SELECT count(*) FROM destinations WHERE iso_code IN ('EU','AS','GL') AND popularity_rank = 0` returns 3 | manual SQL |

**Wave 0 gaps (test scaffolding the phase MUST add before implementation):**
- A small `scripts/verify-curation-backfill.mjs` (or shell script) that runs each verification query and exits non-zero on failure. The planner should put this in Plan 10-02 as the final verification task.
- No new test framework files needed — Phase 10 is exclusively DB ops, and unit-mocking the DB would be theater. The Validation Architecture below codifies this.

### 4. Sync.ts surgical patch — exact before/after

**Current state (verified by `grep -n "popularity_rank\|region_bucket\|image_url" src/lib/esim/sync.ts` → returns zero matches):**

```ts
// src/lib/esim/sync.ts:23-33 (destinations UPSERT — current)
await supabase.from('destinations').upsert(
  {
    name: dest.name,
    slug,
    iso_code: dest.iso,
    region: dest.region,
    is_active: true,
    synced_at: new Date().toISOString(),
  },
  { onConflict: 'iso_code' },
);
```

**Conclusion: the sync code already excludes the three curation columns.** The "patch" CONTEXT.md mandates is therefore *defensive* — make the exclusion explicit and durable so a future contributor doesn't add curation fields to the UPSERT object.

**Proposed patch (Decision: column-allowlist constant + comment):**

```ts
// src/lib/esim/sync.ts — top of file, after imports
/**
 * Columns the daily Celitech sync is allowed to write to `destinations`.
 * Curation fields (`popularity_rank`, `region_bucket`, `image_url`) are
 * managed exclusively by `scripts/backfill-curation.mjs` and operator edits
 * via Supabase Studio. The sync MUST NOT touch them or the 3 a.m. cron will
 * erase manual curation. See .planning/phases/10-schema-and-curation-backfill/
 */
const DESTINATION_SYNC_COLUMNS = ['name', 'slug', 'iso_code', 'region', 'is_active', 'synced_at'] as const;

// ... inside syncCatalog(), the UPSERT body becomes:
await supabase.from('destinations').upsert(
  {
    name: dest.name,
    slug,
    iso_code: dest.iso,
    region: dest.region,
    is_active: true,
    synced_at: new Date().toISOString(),
  } satisfies Record<typeof DESTINATION_SYNC_COLUMNS[number], unknown>,
  { onConflict: 'iso_code' },
);
```

The `satisfies` clause turns the allowlist into a **TypeScript compile-time guard**: any future contributor who adds `popularity_rank: ...` to the UPSERT object will get an immediate type error (`Object literal may only specify known properties`).

**Supabase UPSERT-omitted-column semantics — verified:**
- supabase-js `.upsert({ ... }, { onConflict: 'iso_code' })` translates to PostgREST `Prefer: resolution=merge-duplicates`, which maps to Postgres `INSERT … ON CONFLICT … DO UPDATE SET <only listed cols> = EXCLUDED.<col>`.
- **Omitted columns are preserved on update** — they are NOT set to NULL. Postgres `ON CONFLICT DO UPDATE` only touches the columns the developer named in the `SET` clause; supabase-js generates the SET clause from the object literal keys.
- Therefore removing `popularity_rank`/`region_bucket`/`image_url` from the upsert payload does **not** null those columns on existing rows. Confirmed against Supabase JS reference: [JavaScript: Update data](https://supabase.com/docs/reference/javascript/update) (omitted properties preserved on row).

### 5. Anon-key RLS verification — exact test

**Question:** does the existing RLS policy `"Public can read active destinations"` cover the new columns?

**Answer: yes — column-agnostic by construction.** The policy body is:
```sql
-- supabase/migrations/00001_initial_schema.sql:106-108
CREATE POLICY "Public can read active destinations"
  ON destinations FOR SELECT
  USING (is_active = true);
```

This is a **row-level** policy (`FOR SELECT USING (...)`). It does not enumerate columns. Postgres RLS evaluates `USING` per-row to decide row visibility; column visibility is controlled separately via `GRANT SELECT (col1, col2, ...) ON table` (none of which has been applied to `destinations`). Therefore `SELECT *` from the anon role returns every column of every active row — including columns added later. No policy change is needed.

(Pitfall 1 from PITFALLS.md flags the broader risk that RLS returns empty arrays without error. The mitigation here is to assert `data.length >= 1` in the verification probe.)

**Verification one-liner** — runnable from project root as `node --env-file=.env.local <(cat <<'EOF' ...EOF)` or as a tiny script:

```js
// scripts/verify-anon-read.mjs (one-off; can live inline in Plan 10-02 verification task)
// Run: node --env-file=.env.local scripts/verify-anon-read.mjs
import { createClient } from '@supabase/supabase-js';
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,  // ANON, not service-role
);
const { data, error } = await supabase
  .from('destinations')
  .select('id, iso_code, popularity_rank, region_bucket, image_url')
  .eq('is_active', true)
  .limit(1);
if (error) { console.error('FAIL:', error.message); process.exit(1); }
if (!data || data.length === 0) { console.error('FAIL: empty array (RLS or no rows)'); process.exit(1); }
console.log('OK — anon reads new columns:', JSON.stringify(data[0], null, 2));
```

### 6. Idempotency assertion — how to prove "second run = 0 updates"

**Answer:** supabase-js `.update()` returns `{ data: null, ... }` by default. To get the affected-row array, chain `.select('id')` after the filter. The array length equals the affected-row count.

**In-script per-row pattern:**

```js
let updated = 0, alreadyCurated = 0, missingInDb = 0, errors = 0;

for (const row of mockDestinations) {
  // First, check if the row exists at all in DB (Celitech-synced)
  const { data: existing, error: lookupErr } = await supabase
    .from('destinations')
    .select('id, popularity_rank, image_url, region_bucket')
    .eq('iso_code', row.iso_code)
    .maybeSingle();

  if (lookupErr) { console.error(`[${row.iso_code}] lookup:`, lookupErr.message); errors++; continue; }

  // Special case: regional hero rows (EU/AS/GL) — UPSERT, they don't yet exist in DB
  if (['EU', 'AS', 'GL'].includes(row.iso_code)) {
    const { error } = await supabase.from('destinations').upsert(
      {
        name: row.name,
        slug: row.slug,
        iso_code: row.iso_code,
        region: 'region',                      // Celitech-style classifier
        is_active: true,
        popularity_rank: row.popularity_rank,  // 0
        image_url: row.image_url,
        region_bucket: row.region,             // 'europe-wide' | 'asia-wide' | 'global'
        synced_at: new Date().toISOString(),
      },
      { onConflict: 'iso_code' },
    );
    if (error) { console.error(`[${row.iso_code}] upsert:`, error.message); errors++; }
    else { updated++; }
    continue;
  }

  // Country rows: UPDATE only if Celitech synced this iso_code
  if (!existing) { missingInDb++; continue; }

  // Build a partial update body — only include columns whose target slot is still "unset"
  const patch = {};
  if (existing.popularity_rank === 9999)    patch.popularity_rank = row.popularity_rank;
  if (existing.image_url      === null)     patch.image_url      = row.image_url;
  if (existing.region_bucket  === null)     patch.region_bucket  = row.region;

  if (Object.keys(patch).length === 0) { alreadyCurated++; continue; }

  const { data, error } = await supabase
    .from('destinations')
    .update(patch)
    .eq('iso_code', row.iso_code)
    .select('id');

  if (error) { console.error(`[${row.iso_code}] update:`, error.message); errors++; continue; }
  if (data && data.length > 0) updated++;
}

console.log(`\n=== BACKFILL COMPLETE ===`);
console.log(`Updated:        ${updated}`);
console.log(`Already curated: ${alreadyCurated}`);
console.log(`Missing in DB:  ${missingInDb}`);
console.log(`Errors:         ${errors}`);
```

**Idempotency proof:**
- First run: `Updated: 78` (3 UPSERTs of regional + 75 UPDATEs of country rows) **assuming** all 75 ISO codes in mock have a Celitech-synced row. If some country mock rows are absent from Celitech, `missingInDb` accounts for them and `Updated` < 78.
- Second run: every country row's `popularity_rank` is no longer 9999 AND `image_url`/`region_bucket` are no longer null → `patch` is empty → `alreadyCurated++` → `Updated: 0`. The regional UPSERT is the only ambiguity: UPSERT re-runs idempotently but does write (`Updated: 3`). To make the second-run truly zero, gate the regional UPSERT on the same "is the row already curated?" check:

```js
// Augment the EU/AS/GL branch:
if (existing && existing.popularity_rank === 0 && existing.region_bucket === row.region && existing.image_url === row.image_url) {
  alreadyCurated++;
  continue;
}
// else fall through to the upsert
```

That gives a clean **second-run output: `Updated: 0, Already curated: 78`**.

### 7. Pitfalls 1, 3, 7 — concrete mitigations

#### Pitfall 1 — RLS empty-array (mitigation embedded in Phase 10)
- The anon-key verification probe in §5 asserts `data.length >= 1` AND `error === null` separately. If RLS were misconfigured for the new columns (it isn't — see §5), this probe fails loudly.
- Add a comment to the migration (§1 already includes it) noting that new columns inherit the existing policy.

#### Pitfall 3 — Regional EU/AS/GL mapping (mitigation embedded in Phase 10)
- The backfill script's loop has an explicit `if (['EU','AS','GL'].includes(...))` branch (§6 above) that UPSERTs those three rows. They are created by the script, not by the Celitech sync.
- Verification gate: `SELECT count(*) FROM destinations WHERE iso_code IN ('EU','AS','GL') AND popularity_rank = 0` must return 3.
- (Phase 11 is responsible for ensuring the UI filter `popularity_rank < 9999 OR region_bucket IS NOT NULL` picks these three up — Phase 10 just guarantees the data exists.)

#### Pitfall 7 — Backfill idempotency / lost operator edits (mitigation embedded in Phase 10)
- The guarded UPDATE pattern in §6 (only writes where `popularity_rank === 9999` or `image_url IS NULL` or `region_bucket IS NULL`) means: any operator edit (e.g., bumping Spain's `popularity_rank` to 1) survives a backfill re-run because the guard predicate is false.
- Re-run verification: shell out `node --env-file=.env.local scripts/backfill-curation.mjs` a second time and grep stdout for `Updated: 0`. Include this in Plan 10-02's verification task list.
- The script does NOT support a `--force` flag in v1.1 — keeping it intentionally non-destructive (per CONTEXT.md "operator edits are sacred"). A `--force` flag is a v1.2 candidate if Pexels images need a mass refresh.

---

## Code Examples

### Example A: Final backfill script outline

```js
// scripts/backfill-curation.mjs
// Phase 10 (INF-10): copy curation metadata from mock-data into Supabase by iso_code.
// Idempotent: re-running against an already-populated DB reports zero updates.
// Run:
//   node --experimental-strip-types --env-file=.env.local scripts/backfill-curation.mjs
//
// Deleted in Phase 13 cleanup.

import { createClient } from '@supabase/supabase-js';
import { mockDestinations } from '../src/lib/mock-data/destinations.ts';

const required = ['NEXT_PUBLIC_SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY'];
for (const k of required) {
  if (!process.env[k]) { console.error(`Missing env: ${k}`); process.exit(1); }
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

const REGIONAL_HEROES = new Set(['EU', 'AS', 'GL']);

let upsertedHero = 0;
let updatedCountry = 0;
let alreadyCurated = 0;
let missingInDb = 0;
let errors = 0;

for (const row of mockDestinations) {
  // ... see §6 above for the full per-row logic ...
}

console.log(`\n=== PHASE 10 BACKFILL COMPLETE ===`);
console.log(`Regional heroes upserted: ${upsertedHero}`);
console.log(`Country rows updated:     ${updatedCountry}`);
console.log(`Already curated (skipped):${alreadyCurated}`);
console.log(`Missing in DB (no sync):  ${missingInDb}`);
console.log(`Errors:                   ${errors}`);

if (errors > 0) process.exit(1);
```

### Example B: Migration file (full)

See §1 above for the verbatim file body.

### Example C: Verification SQL (paste into Supabase Studio or `psql`)

```sql
-- Verify columns exist (gate 1)
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name='destinations' AND column_name IN ('popularity_rank','region_bucket');
-- Expected: 2 rows

-- Verify indexes exist with correct partial predicates (gate 2)
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename='destinations'
  AND indexname IN ('idx_destinations_popularity_curated','idx_destinations_region_bucket');
-- Expected: 2 rows, indexdef containing 'WHERE' clauses

-- Verify backfill populated curated rows (gate 3)
SELECT count(*) FROM destinations WHERE popularity_rank < 9999;
-- Expected: >= 78 (3 regional + 75 country, minus any country missing from Celitech sync)

-- Verify regional hero rows (gate 4)
SELECT iso_code, name, popularity_rank, region_bucket
FROM destinations WHERE iso_code IN ('EU','AS','GL') ORDER BY iso_code;
-- Expected: 3 rows with popularity_rank=0 and region_bucket in {'europe-wide','asia-wide','global'}

-- Verify uncurated count (informational)
SELECT count(*) FROM destinations WHERE popularity_rank = 9999;
-- Expected: ~146 (the Celitech rows mock-data doesn't curate)
```

---

## Common Pitfalls (Phase-Specific)

### Pitfall A: Running `CREATE INDEX CONCURRENTLY` inside the migration
**What goes wrong:** `supabase db push` wraps migrations in `BEGIN ... COMMIT`. `CREATE INDEX CONCURRENTLY` is incompatible — Postgres errors with `CREATE INDEX CONCURRENTLY cannot run inside a transaction block` and the whole migration rolls back.
**Why it happens:** The instinct to use `CONCURRENTLY` for "production safety."
**How to avoid:** For 226-row tables, plain `CREATE INDEX` is sub-millisecond. Don't use CONCURRENTLY.
**Warning signs:** Migration fails on `db push` with the transaction-block error message.

### Pitfall B: `supabase migration new` produces a timestamp-prefix file
**What goes wrong:** Running `supabase migration new destinations_curation_metadata` creates `supabase/migrations/<timestamp>_destinations_curation_metadata.sql`, which violates the locked file name `00003_destinations_curation_metadata.sql`.
**How to avoid:** Create the file manually (`touch` or Write tool). Don't use `supabase migration new` for this phase.
**Warning signs:** A `20260514...` prefix appearing in git status instead of `00003`.

### Pitfall C: Forgetting `.select()` after `.update()` returns no row count
**What goes wrong:** `.update().eq(...)` without `.select()` returns `{ data: null, error: null }` even on a successful 50-row update. The script logs `Updated: 0` despite a successful run, breaking the idempotency assertion.
**How to avoid:** Always chain `.select('id')` after the filter when row count matters.
**Warning signs:** First-run output reports `Updated: 0` despite SQL showing populated rows.

### Pitfall D: Mock-data has a country mock-data ISO that Celitech doesn't sync
**What goes wrong:** Some country in `src/lib/mock-data/destinations.ts` (e.g., a country Celitech temporarily delisted) has no corresponding row in `destinations`. The backfill UPDATE silently matches zero rows.
**How to avoid:** The script's `missingInDb` counter (§6) makes this observable. After the first run, inspect that count. If non-zero, the planner should decide whether to (a) skip those countries (Phase 11 won't surface them either) or (b) INSERT them as new destination rows. Default: skip — matches CONTEXT.md's "No INSERT logic in the backfill — only UPDATE on existing rows."
**Warning signs:** `Missing in DB: > 0` in stdout.

### Pitfall E: Pexels image URL goes 404 between mock-data write and backfill run
**What goes wrong:** Pexels rotates/deletes images. A URL that worked when the mock was written may 404 by the time the backfill runs, leaving the DB with a dead URL.
**How to avoid:** Out of scope for Phase 10 — image-host migration is a deferred idea (CONTEXT.md). Phase 11's UI must already handle null/broken `image_url` via the country-flag fallback (CAT-07). Document the risk but don't fix it here.

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|---|---|---|---|
| Mixed sequential + timestamped migration prefixes | Repo convention is "use timestamp prefix going forward" (5 of 5 post-link migrations use timestamps) | Since `supabase link` was run (mid-Phase 5) | Phase 10's locked `00003_` prefix is an intentional deviation for grep-ability — accept it |
| `CREATE INDEX CONCURRENTLY` for big tables | Plain `CREATE INDEX` for tables under ~10k rows in Supabase migrations | Always — `CONCURRENTLY` cannot run in transactions | Phase 10 uses plain `CREATE INDEX` |
| Hand-rolled count-comparison for idempotency | `.select('id')` chained after `.update()` | supabase-js 2.x | Phase 10 uses chained `.select()` |
| `node --loader ts-node/esm` for `.ts` imports | Node 22.6+ `--experimental-strip-types` flag (no extra dep) | Node 22.6 (mid-2024) | Phase 10 uses the flag — no `ts-node` install needed |

**Deprecated/outdated:**
- `ts-node` for one-off scripts: superseded by built-in Node strip-types
- Putting service-role key in `.env` files without `import 'server-only'` guards: covered by PITFALLS.md Pitfall 2 — not Phase-10-blocking (the backfill is a Node script, not bundled by Next), but the convention is in force for `src/lib/db/destinations.ts` later

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.4 (already installed; declared in `package.json` devDeps) |
| Config file | None at repo root (Vitest reads from `package.json` `test` script: `vitest run`) |
| Quick run command | `npm test` (runs all Vitest specs) |
| Full suite command | `npm test` |

Phase 10 has **no unit-test surface** worth covering with Vitest — every artifact is a DB or shell operation. The validation strategy below uses live SQL + shell-grep + a small Node verification probe, all runnable without a test framework.

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| INF-09 | `destinations.popularity_rank` (INT, NOT NULL, DEFAULT 9999) and `destinations.region_bucket` (TEXT, nullable) columns exist after `supabase db push` | smoke / SQL | `psql "$DB_URL" -c "SELECT column_name FROM information_schema.columns WHERE table_name='destinations' AND column_name IN ('popularity_rank','region_bucket');" \| wc -l` returns 4 (header + 2 rows + footer) | psql via supabase project URL — Wave 0 |
| INF-09 | Two partial indexes exist with the locked `WHERE` predicates | smoke / SQL | `psql "$DB_URL" -c "SELECT indexname FROM pg_indexes WHERE tablename='destinations' AND indexname LIKE 'idx_destinations_%';"` includes `idx_destinations_popularity_curated` and `idx_destinations_region_bucket` | psql — Wave 0 |
| INF-10 | Backfill populates ≥ 78 rows on first run | smoke / SQL | `psql "$DB_URL" -c "SELECT count(*) FROM destinations WHERE popularity_rank < 9999;"` returns ≥ 78 | psql — Wave 0 |
| INF-10 | Three regional hero rows present at rank 0 | smoke / SQL | `psql "$DB_URL" -c "SELECT count(*) FROM destinations WHERE iso_code IN ('EU','AS','GL') AND popularity_rank = 0;"` returns 3 | psql — Wave 0 |
| INF-10 | Backfill is idempotent (second run reports 0 country updates AND 0 hero upserts) | integration / shell | `node --experimental-strip-types --env-file=.env.local scripts/backfill-curation.mjs 2>&1 \| grep -E "Updated:\s+0"` exits 0 | shell, post-first-run |
| INF-10 | Anon-key SELECT returns the new columns (RLS unchanged) | integration / Node | `node --env-file=.env.local scripts/verify-anon-read.mjs` exits 0 | script body in §5 above; create as part of Plan 10-02 |
| INF-10 | sync.ts does not write curation columns | static / grep | `! grep -nE "popularity_rank\|region_bucket\|image_url" src/lib/esim/sync.ts \| grep -v "^[[:space:]]*//"` — fails the build if any non-comment line mentions a curation column | shell — CI-runnable |

### Sampling Rate
- **Per task commit:** the relevant single verification query for the task (e.g., 10-01 commits → run the columns + indexes queries; 10-02 commits → run the backfill + idempotency + anon-key queries)
- **Per wave merge:** Phase 10 is a single wave (Wave 0). Run the entire verification table above at the end of Plan 10-02
- **Phase gate:** All seven rows green before `/gsd:verify-work` is invoked on Phase 10

### Wave 0 Gaps
- [ ] `scripts/verify-anon-read.mjs` — new file containing the anon-key probe from §5. Create as a deliverable in Plan 10-02
- [ ] (Optional) `scripts/verify-phase-10.sh` — bundles the 7 verification commands above into one shell-runnable script. Convenience-only; could live in Plan 10-02 verification task

*(No new Vitest specs needed. No conftest equivalent. No test framework install. Phase 10 validation is DB-state-driven by design.)*

---

## Open Questions

1. **Are there country ISO codes in `mockDestinations` that have NO matching row in production `destinations`?**
   - **What we know:** Phase 10 is run against a Supabase project where Celitech has already synced 226 destinations. The 75 country ISO codes in mock-data are mainstream (FR, ES, JP, US…) and almost certainly all present, but the count `Missing in DB: > 0` in backfill stdout would surface any drift.
   - **What's unclear:** Whether Celitech has any deletes/delistings between when the mock was authored (April) and when Phase 10 runs (May).
   - **Recommendation:** Run the backfill once on staging or directly in production (zero-risk additive); inspect `Missing in DB` count. If non-zero, log to STATE.md as a follow-up but do not block Phase 10 — uncurated rows simply stay invisible to the UI per CONTEXT.md.

2. **Does `--experimental-strip-types` work in the operator's Node 24 install?**
   - **What we know:** Flag is stable in Node 22.6+; Node 24 is current LTS. `package.json` does not pin a Node version (no `engines` field), so the operator's installed version is whatever `node -v` reports.
   - **Recommendation:** Plan 10-02's first task should print `node -v` and verify ≥ 22.6. If not, fall back to parse strategy (b) — JSON dump.

---

## Sources

### Primary (HIGH confidence)
- `supabase/migrations/00001_initial_schema.sql` (lines 1-122) — destinations table shape, existing indexes (idx_destinations_iso/slug/idx_plans_active partial), RLS policy "Public can read active destinations"
- `supabase/migrations/00002_orders_esim_columns.sql` — additive `ALTER TABLE … ADD COLUMN` style precedent
- `src/lib/esim/sync.ts` (lines 23-33) — current destinations UPSERT body; grep-confirmed to already exclude the three curation columns
- `scripts/sync-catalog-once.mjs` — Node `.mjs` template: `--env-file`, service-role client, idempotent upsert
- `src/lib/mock-data/destinations.ts` (lines 1-133) — full enumeration of 78 curation rows, region values, popularity range
- `.planning/research/v1.1/ARCHITECTURE.md` (§2.3 — migration, §2.4 — backfill) — already prescribes the exact SQL and script shape
- `.planning/research/v1.1/PITFALLS.md` (Pitfall 1, 3, 7) — mitigations embedded in §7 above
- [PostgreSQL 15: CREATE INDEX](https://www.postgresql.org/docs/15/sql-createindex.html) — partial-index syntax, `IF NOT EXISTS`, `CONCURRENTLY` transaction restriction
- [Supabase JS: update()](https://supabase.com/docs/reference/javascript/update) — `.select()` chaining for affected-row return; omitted-column UPSERT semantics

### Secondary (MEDIUM confidence)
- `supabase --version` output (CLI 2.78.1) — `supabase migration new` generates timestamp prefix (verified via `--help`)
- Node `--experimental-strip-types` — flag stability in Node 22.6+ (training data; matches widely-cited release notes)

### Tertiary (LOW confidence — explicitly flagged)
- `.planning/STATE.md` "Pending Todos" item: "Confirm Celitech regional bundle ISO codes in live Supabase before Wave 0 backfill maps EU/AS/GL" — Phase 10 resolves this by UPSERTing the three rows explicitly regardless of Celitech's output. Live spot-check post-backfill recommended.

---

## Metadata

**Confidence breakdown:**
- Migration SQL: HIGH — Postgres 15 syntax verified against official docs; partial-index pattern already present in `00001_initial_schema.sql:91`
- Backfill script shape: HIGH — direct mirror of `scripts/sync-catalog-once.mjs` (existing pattern); supabase-js `.update().select()` semantics verified against Supabase docs
- Sync safety patch: HIGH — current `sync.ts` already excludes curation columns (grep-confirmed); patch is defensive
- Mock-data parse strategy: HIGH — file enumerated end-to-end; 78 rows, region values catalogued
- Idempotency: HIGH — guarded-UPDATE pattern is canonical Postgres idempotency
- Anon-key RLS: HIGH — policy is column-agnostic by Postgres design; no policy change needed
- Pitfall mitigations: HIGH — all three (1, 3, 7) have concrete code/SQL in §7

**Research date:** 2026-05-14
**Valid until:** 2026-06-13 (30 days — schema/CLI is stable; would invalidate only if Supabase changes UPSERT semantics or `supabase migration new` changes file naming)
