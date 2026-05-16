---
phase: 10-schema-and-curation-backfill
verified: 2026-05-16T13:50:00Z
status: passed
score: 10/10 must-haves verified
---

# Phase 10: Schema and Curation Backfill — Verification Report

**Phase Goal:** Supabase `destinations` table holds the curation metadata Celitech does not return (`popularity_rank`, `region_bucket`), populated for the curated destinations and explicitly seeded for the 3 regional hero rows (EU, AS, GL), so the UI's planned reads will return data instead of empty arrays. The 3am Celitech sync cron is patched so it never overwrites operator-edited curation columns.

**Verified:** 2026-05-16T13:50:00Z
**Status:** PASSED
**Re-verification:** No — initial verification

---

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | `destinations.popularity_rank` column exists (INTEGER, NOT NULL, DEFAULT 9999) | VERIFIED | Management API: `{"column_name":"popularity_rank","data_type":"integer","is_nullable":"NO","column_default":"9999"}` |
| 2 | `destinations.region_bucket` column exists (TEXT, nullable) | VERIFIED | Management API: `{"column_name":"region_bucket","data_type":"text","is_nullable":"YES","column_default":null}` |
| 3 | Partial index `idx_destinations_popularity_curated` exists (WHERE popularity_rank < 9999) | VERIFIED | pg_indexes: indexdef confirms `WHERE (popularity_rank < 9999)` |
| 4 | Partial index `idx_destinations_region_bucket` exists (WHERE region_bucket IS NOT NULL) | VERIFIED | pg_indexes: indexdef confirms `WHERE (region_bucket IS NOT NULL)` |
| 5 | RLS policy "Public can read active destinations" is unchanged — no policy DDL in migration | VERIFIED | `grep -ciE "(CREATE|ALTER|DROP)\s+POLICY" 00003_*.sql` = 0; pg_policies shows `cmd=SELECT, qual=(is_active = true)` unchanged |
| 6 | 69 rows have popularity_rank < 9999 (all curated mock-data rows) | VERIFIED | `SELECT count(*) FROM destinations WHERE popularity_rank < 9999` = 69 (corrected from planning miscount of 78; actual mock-data has 69 rows) |
| 7 | Exactly 3 rows (EU/AS/GL) have popularity_rank = 0 and correct region_bucket values | VERIFIED | AS: asia-wide/0, EU: europe-wide/0, GL: global/0; `count(... AND popularity_rank=0)` = 3 |
| 8 | Re-running backfill is idempotent (reports Updated: 0) | VERIFIED | Second run: `Already curated (skipped):69`, `Updated: 0`, `Errors: 0` |
| 9 | `src/lib/esim/sync.ts` does not write any curation column (DESTINATION_SYNC_COLUMNS allowlist guard) | VERIFIED | Zero non-comment lines in sync.ts match `popularity_rank|region_bucket|image_url`; `DESTINATION_SYNC_COLUMNS` appears 2 times; `satisfies` clause present |
| 10 | Anon-key SELECT works on new columns (RLS unchanged — proves Phase 11 reads will work) | VERIFIED | `scripts/verify-anon-read.mjs` exits 0; returns row with `popularity_rank`, `region_bucket`, `image_url` keys |

**Score:** 10/10 truths verified

---

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `supabase/migrations/00003_destinations_curation_metadata.sql` | Additive migration — ALTER TABLE + 2 partial indexes | VERIFIED | File exists; contains locked ALTER TABLE + CREATE INDEX statements; no CONCURRENTLY; no transaction wrap; no policy DDL |
| `scripts/backfill-curation.mjs` | Idempotent backfill using service-role key and mockDestinations | VERIFIED | File exists; imports mockDestinations from `.ts`; REGIONAL_HEROES Set; `.select('id')` chaining; 3 idempotency guards; prints `Updated:` line |
| `scripts/verify-anon-read.mjs` | Anon-key probe asserting new columns readable via existing RLS | VERIFIED | File exists; uses ANON key (not service-role); selects id/iso_code/popularity_rank/region_bucket/image_url; exits non-zero on error or empty array |
| `src/lib/esim/sync.ts` | Patched with DESTINATION_SYNC_COLUMNS allowlist + satisfies guard | VERIFIED | DESTINATION_SYNC_COLUMNS count=2; satisfies clause present; zero non-comment curation column references |
| `scripts/verify-phase-10.sh` | Executable wrapper bundling 5 CLI verification checks | VERIFIED | File exists; executable bit set; valid bash syntax; bundles migration check, idempotency re-run, anon probe, sync grep, npm test |

---

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `00003_destinations_curation_metadata.sql` | Production Supabase destinations table | `supabase db push --include-all` | WIRED | `supabase migration list` shows `00003` in both Local and Remote columns |
| `scripts/backfill-curation.mjs` | Production destinations rows | service-role createClient + guarded UPDATE/UPSERT by iso_code | WIRED | First run: 66 country rows updated + 3 heroes upserted; second run: 0 updates (idempotent) |
| `scripts/verify-anon-read.mjs` | Production destinations table | anon-key createClient + SELECT with is_active=true filter | WIRED | Exits 0; returns row with all new columns |
| `src/lib/esim/sync.ts` DESTINATION_SYNC_COLUMNS | destinations UPSERT (never touches curation columns) | satisfies Record<typeof DESTINATION_SYNC_COLUMNS[number], unknown> | WIRED | Compile-time guard in place; zero runtime curation-column writes in the upsert object literal |

---

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|-------------|-------------|--------|----------|
| INF-09 | 10-01-PLAN.md | Supabase migration adds `popularity_rank INTEGER` and `region_bucket TEXT` columns to `destinations` (additive, no RLS change) | SATISFIED | Columns verified in information_schema; indexes verified in pg_indexes; no policy DDL in migration; REQUIREMENTS.md marks `[x]` |
| INF-10 | 10-02-PLAN.md | One-off backfill copies curation metadata from mock-data into Supabase by iso_code, idempotently | SATISFIED | 69 rows curated (all mock-data rows with 0 missing-in-DB); idempotency proven; REQUIREMENTS.md marks `[x]` |

No orphaned requirements — REQUIREMENTS.md traceability table assigns only INF-09 and INF-10 to Phase 10.

---

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `scripts/backfill-curation.mjs` | 6 | Comment says "Country rows (75)" but actual count is 66 | Info | Comment-only inaccuracy; no runtime effect; count=69 total (3+66) is accurate in execution |
| `scripts/verify-phase-10.sh` | 4 | Comment says "bundles all 7 VALIDATION.md commands" but only bundles 5 CLI-runnable ones (SQL gates omitted by design) | Info | Comment slightly overstates scope; correctly documented in file header that SQL gates are manual |

No blockers. No warnings that affect goal achievement.

---

### Live Production Evidence (run during verification)

**Columns in information_schema:**
```json
[{"column_name":"popularity_rank","data_type":"integer","is_nullable":"NO","column_default":"9999"},
 {"column_name":"region_bucket","data_type":"text","is_nullable":"YES","column_default":null}]
```

**Partial indexes in pg_indexes:**
```json
[{"indexname":"idx_destinations_popularity_curated","indexdef":"CREATE INDEX idx_destinations_popularity_curated ON public.destinations USING btree (popularity_rank) WHERE (popularity_rank < 9999)"},
 {"indexname":"idx_destinations_region_bucket","indexdef":"CREATE INDEX idx_destinations_region_bucket ON public.destinations USING btree (region_bucket) WHERE (region_bucket IS NOT NULL)"}]
```

**Curated count:** 69 rows with `popularity_rank < 9999`

**Regional heroes:** AS (asia-wide/0), EU (europe-wide/0), GL (global/0) — all 3 at rank 0

**RLS policy:** `{"policyname":"Public can read active destinations","cmd":"SELECT","qual":"(is_active = true)"}` — unchanged

**Anon-key probe:** exits 0 — `OK — anon reads new columns: {"id":"02f43aaa-...","iso_code":"AF","popularity_rank":9999,"region_bucket":null,"image_url":null}`

**Backfill idempotency re-run:**
```
=== PHASE 10 BACKFILL COMPLETE ===
Regional heroes upserted: 0
Country rows updated:     0
Already curated (skipped):69
Missing in DB (no sync):  0
Errors:                   0
Updated: 0
```

**Test suite:** 239 passed / 1 skipped / 46 todo — no regression

**Migration list:** `00003 | 00003 | 00003` confirmed in Local and Remote columns

---

### Count Deviation — Documented and Acceptable

The plan frontmatter and VALIDATION.md reference "≥78" curated rows. The actual `src/lib/mock-data/destinations.ts` contains **69 rows** (3 regional heroes + 66 country). The RESEARCH.md arithmetic miscounted the region table totals. The backfill populated every row from mock-data (`missingInDb: 0, errors: 0`). The intent of INF-10 — "every curated mock-data destination is populated in Supabase, idempotently" — is fully satisfied at 69 rows. Per verification instructions, `count(popularity_rank < 9999) == 69` is treated as PASS.

---

### Human Verification Required

None for automated goals. Two items remain manual-only per 10-VALIDATION.md by design (require 3am cron trigger or Studio-based operator edit simulation):

1. **Daily cron still runs without error** — invoke `curl -X GET "https://<preview-url>/api/cron/sync-catalog" -H "Authorization: Bearer $CRON_SECRET"` — expect 200 + sync success. Cannot trigger on demand without live cron environment.

2. **Operator edit survives backfill re-run** — UPDATE a popularity_rank manually in Studio, then re-run backfill and confirm the edit is preserved. The idempotency logic (`existing.popularity_rank === 9999` guard) makes this provably safe in code, but a full end-to-end operator-edit cycle needs human execution.

Both are informational — they do not block Phase 11 readiness.

---

## Summary

Phase 10 goal is fully achieved. Both INF-09 and INF-10 are satisfied:

- The schema migration is applied to production with the exact locked column types, defaults, and partial indexes.
- The backfill populated all 69 curated mock-data rows (3 regional heroes + 66 countries) with zero errors and zero missing-in-DB rows.
- The idempotency contract is proven — a second run makes zero writes and preserves any operator edits.
- The 3am Celitech sync cron is compile-time guarded against writing curation columns via the `DESTINATION_SYNC_COLUMNS` allowlist + `satisfies` clause.
- The anon-key RLS probe confirms Phase 11 reads will return the new columns without policy changes.
- The v1.0 test suite (239 tests) passes with no regression.

Phase 11 (read-layer + browse cutover) is unblocked.

---

_Verified: 2026-05-16T13:50:00Z_
_Verifier: Claude (gsd-verifier)_
