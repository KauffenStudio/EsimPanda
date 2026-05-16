---
phase: 10-schema-and-curation-backfill
plan: 02
subsystem: database
tags: [supabase, backfill, curation, idempotent, rls, sync-safety, typescript]

# Dependency graph
requires:
  - phase: 10-01
    provides: destinations.popularity_rank + destinations.region_bucket columns + 2 partial indexes on production Supabase
provides:
  - Production destinations table populated with curation metadata (69 curated rows)
  - 3 regional hero rows (EU/AS/GL) at popularity_rank=0 with region_bucket europe-wide/asia-wide/global
  - scripts/backfill-curation.mjs (idempotent one-off backfill, deleted in Phase 13)
  - scripts/verify-anon-read.mjs (anon-key RLS probe)
  - scripts/verify-phase-10.sh (Phase 10 CLI verification bundle)
  - src/lib/esim/sync.ts DESTINATION_SYNC_COLUMNS compile-time allowlist guard
affects: [11-read-layer-and-browse-cutover]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Idempotent backfill: regional rows UPSERTed with exact-match skip-check, country rows guarded UPDATE that only writes unset-default slots"
    - "satisfies Record<typeof CONST[number], unknown> as a compile-time column allowlist guard on a supabase-js upsert"
    - "node --experimental-strip-types to import a .ts module directly from a .mjs script (Node 24)"
    - "Anon-key probe asserts both error===null AND data.length>=1 to catch RLS empty-array failures"

key-files:
  created:
    - scripts/backfill-curation.mjs
    - scripts/verify-anon-read.mjs
    - scripts/verify-phase-10.sh
  modified:
    - src/lib/esim/sync.ts

key-decisions:
  - "Success-criteria row threshold corrected from >=78 to =69 — actual src/lib/mock-data/destinations.ts has 69 rows (3 hero + 66 country), not 78. The RESEARCH.md region table arithmetic miscounted."
  - "verify-phase-10.sh captures command output into a variable before grep — `... | grep -q` under `set -o pipefail` marks the pipeline failed via SIGPIPE on the upstream process."
  - "sync.ts grep gate verified without `> /dev/null` — BSD grep flips the empty-pipeline exit code when stdout is redirected to /dev/null."
  - "sync.ts doc comment phrases curation columns descriptively (not literal tokens) so VALIDATION row 10-02-05's prefix-broken grep never produces a false positive."

patterns-established:
  - "Pattern: one-off data-migration .mjs scripts mirror scripts/sync-catalog-once.mjs (service-role client, env-check loop, --env-file=.env.local)"
  - "Pattern: guarded-UPDATE idempotency — only patch columns whose current value equals the unset default"

requirements-completed: [INF-10]

# Metrics
duration: 6min
completed: 2026-05-16
---

# Phase 10 Plan 02: Schema and Curation Backfill (Backfill + Sync Safety) Summary

**Populated production Supabase `destinations` with curation metadata from mock-data (69 rows incl. 3 regional heroes) via an idempotent backfill, and added a compile-time allowlist guard to the daily Celitech sync so the 3 a.m. cron can never overwrite curation values.**

## Performance

- **Duration:** ~6 min
- **Started:** 2026-05-16T13:36:00Z
- **Completed:** 2026-05-16T13:43:00Z
- **Tasks:** 5
- **Files modified:** 4 (3 created, 1 modified)

## Accomplishments
- Patched `src/lib/esim/sync.ts` with a `DESTINATION_SYNC_COLUMNS` allowlist constant + `satisfies` clause — adding any curation column to the destinations UPSERT now raises a TypeScript compile error
- Created `scripts/backfill-curation.mjs` — idempotent backfill: 3 regional heroes UPSERTed, 66 country rows guarded-UPDATEd by `iso_code`
- Created `scripts/verify-anon-read.mjs` — anon-key RLS probe proving the new columns are readable through the existing `Public can read active destinations` policy
- Created `scripts/verify-phase-10.sh` — executable bundle of the 5 CLI-runnable Phase 10 verification checks
- Ran the backfill against production: 69 rows curated, 0 errors, 0 missing-in-DB
- Proved idempotency: second run reported `Updated: 0`, `Already curated (skipped): 69`
- Confirmed `npx tsc --noEmit` and the 239-test v1.0 suite still pass — no regression

## Task Commits

Each task was committed atomically:

1. **Task 1: Patch sync.ts with DESTINATION_SYNC_COLUMNS allowlist + satisfies guard** - `ce7bd28` (feat)
2. **Task 2: Create scripts/backfill-curation.mjs idempotent backfill** - `3d5daaa` (feat)
3. **Task 3: Create scripts/verify-anon-read.mjs anon-key RLS probe** - `64eeb4d` (feat)
4. **Task 4: Run backfill, verify SQL gates, idempotency re-run, anon probe** - no source files modified (runtime verification only; no commit)
5. **Task 5: Create scripts/verify-phase-10.sh verification bundle** - `7a6b8f3` (feat)

**Plan metadata:** see final docs commit

## Files Created/Modified
- `src/lib/esim/sync.ts` - Added `DESTINATION_SYNC_COLUMNS` allowlist constant + `satisfies Record<typeof DESTINATION_SYNC_COLUMNS[number], unknown>` clause on the destinations UPSERT (compile-time guard against curation-column writes)
- `scripts/backfill-curation.mjs` - One-off idempotent backfill: service-role client, dynamic `.ts` import of `mockDestinations`, regional UPSERT branch with exact-match skip, country guarded-UPDATE branch with `.select('id')` row-count chaining
- `scripts/verify-anon-read.mjs` - Anon-key SELECT probe for `id, iso_code, popularity_rank, region_bucket, image_url`; exits non-zero on error or empty array
- `scripts/verify-phase-10.sh` - Executable bundle of 5 verification checks; aggregates pass/fail counts

## Verification Evidence

### Task 4 Step 1 — First backfill run (full stdout)

```
=== PHASE 10 BACKFILL COMPLETE ===
Regional heroes upserted: 3
Country rows updated:     66
Already curated (skipped):0
Missing in DB (no sync):  0
Errors:                   0
Updated: 69
```

### Task 4 Step 4 — Second backfill run (idempotency proof, full stdout)

```
=== PHASE 10 BACKFILL COMPLETE ===
Regional heroes upserted: 0
Country rows updated:     0
Already curated (skipped):69
Missing in DB (no sync):  0
Errors:                   0
Updated: 0
```

`grep -E "Updated:\s+0"` on the re-run log matched — idempotency gate PASS.

### Task 4 Steps 2-3 — SQL verification gates

```
Gate 10-02-01 — popularity_rank < 9999 count: 69
Gate 10-02-02 — regional hero rows:
  AS | Asia   | 0 | asia-wide
  EU | Europe | 0 | europe-wide
  GL | Global | 0 | global
Gate 10-02-02 — heroes at rank 0: 3
Informational — uncurated (rank 9999): 159
```

### Task 4 Step 5 — Anon-key probe (full stdout)

```
OK — anon reads new columns: {
  "id": "02f43aaa-73f9-487a-80f3-be786580495d",
  "iso_code": "AF",
  "popularity_rank": 9999,
  "region_bucket": null,
  "image_url": null
}
```

Exit code 0 — RLS unchanged, new columns readable by the anon role.

### Task 5 — verify-phase-10.sh (full stdout)

```
=== Phase 10 verification ===

10-01: Migration applied
  PASS: supabase migration list shows 00003_destinations_curation_metadata

10-02-03: Backfill idempotency
  PASS: re-run reports 'Updated: 0' (idempotent)

10-02-04: Anon-key SELECT on new columns
  PASS: anon-key probe exits 0

10-02-05: sync.ts does not write curation columns
  PASS: no non-comment line in sync.ts mentions a curation column

Regression: v1.0 test suite
  PASS: npm test passes

=== Result: 5 pass / 0 fail ===
```

### Phase-level checks (all 10)

1. sync.ts allowlist holds — PASS (zero curation-column matches in sync.ts)
2. `node --check scripts/backfill-curation.mjs` — PASS
3. `node --check scripts/verify-anon-read.mjs` — PASS
4. `bash -n scripts/verify-phase-10.sh` — PASS
5. Curated count `popularity_rank < 9999` = 69 (see Deviation 1) — PASS
6. Regional hero count = 3 — PASS
7. Idempotency: second run `Updated: 0` — PASS
8. Anon-read probe exits 0 — PASS
9. `npm test` — 239 passed / 1 skipped / 46 todo — PASS
10. `npx tsc --noEmit` — PASS

## Decisions Made
- **Corrected the curated-row threshold from ≥78 to =69.** The plan, RESEARCH.md §3, and CONTEXT.md all expected ≥78 (or ≥80) curated rows based on a region-count table whose arithmetic summed to 78. The actual `src/lib/mock-data/destinations.ts` — the locked source of truth — contains exactly 69 rows (3 regional heroes + 66 country rows: `europe:45, asia:10, north-america:3, south-america:2, middle-east:3, oceania:2, africa:1` = 66 country). The backfill ran perfectly against the real data (`missingInDb:0, errors:0`). The threshold was a research miscount, not a backfill failure.
- **verify-phase-10.sh captures output before grep.** Under `set -o pipefail`, `supabase migration list | grep -q` marked the pipeline as failed because `grep -q` exits early and SIGPIPEs the upstream `supabase` process. Capturing to a variable first removes the spurious failure.
- **sync.ts grep gate verified without `> /dev/null`.** BSD grep on macOS flips the empty-pipeline exit code when stdout is redirected to `/dev/null`. The verification uses a variable-capture + `[[ -z ]]` test instead, which is correct on both BSD and GNU grep.
- **sync.ts doc comment avoids literal curation column tokens.** VALIDATION row 10-02-05's grep (`grep -nE ... | grep -v '^[[:space:]]*//'`) is defeated by `grep -n`'s line-number prefix breaking the `^[[:space:]]` anchor — any comment literally containing the tokens would false-positive. The doc comment describes the columns descriptively ("the popularity-rank, region-bucket and image-URL columns") so the gate stays clean while the intent (no non-comment line writes a curation column) is fully met.

## Deviations from Plan

### Plan-assumption corrections (no code auto-fixes)

**1. [Rule 1 - Spec/data discrepancy] Curated-row count is 69, not 78**
- **Found during:** Task 4 (first backfill run reported `Updated: 69`, not the expected ~78)
- **Issue:** The plan's success criteria, RESEARCH.md §3, and CONTEXT.md verification gate all expect ≥78 (CONTEXT.md says ≥80) curated rows. RESEARCH.md §3's region-count table lists row counts that sum to 66 country rows (45+10+3+2+3+2+1) + 3 heroes = 69, yet the table's "Total" cell claims 78. The actual mock-data file has 69 entries.
- **Resolution:** No fix needed — the backfill is correct. It curated all 69 mock-data rows (`missingInDb:0, errors:0`). The intent of INF-10 (every curated mock-data destination populated in Supabase, idempotently) is fully satisfied. The `≥78` threshold is a research arithmetic error; the corrected threshold is `=69`.
- **Files modified:** none
- **Verification:** `SELECT count(*) FROM destinations WHERE popularity_rank < 9999` returns 69; mock-data row count confirmed at 69 (3 hero + 66 country).
- **Committed in:** n/a (no source file change)

**2. [Rule 3 - Blocking] verify-phase-10.sh migration check failed under pipefail**
- **Found during:** Task 5 (first run of `verify-phase-10.sh` reported the 10-01 migration check as FAIL despite `00003` being present)
- **Issue:** `~/.local/bin/supabase migration list 2>&1 | grep -qE "00003"` under `set -o pipefail`: `grep -q` exits 0 on first match and closes the pipe, the upstream `supabase` process gets SIGPIPE and exits non-zero, and `pipefail` propagates that failure.
- **Fix:** Capture `supabase migration list` output into the `MIGRATIONS` variable, then `echo "$MIGRATIONS" | grep -qE "00003"`. No pipe from a long-running process to `grep -q`.
- **Files modified:** scripts/verify-phase-10.sh (within Task 5 before commit)
- **Verification:** `verify-phase-10.sh` now prints `Result: 5 pass / 0 fail` and exits 0.
- **Committed in:** `7a6b8f3`

**3. [Rule 3 - Blocking] VALIDATION row 10-02-05 literal grep command is unreliable**
- **Found during:** Task 1 (the literal `! grep -nE ... | grep -v '^[[:space:]]*//' | grep -v '^[[:space:]]*\*' | grep -v '^[[:space:]]*/\*\*'` command behaved inconsistently)
- **Issue:** Two compounding flaws: (a) `grep -n` prefixes each line with `<number>:`, so the `^[[:space:]]*` comment-skip anchors never match a comment line — a doc comment literally containing the tokens would false-positive; (b) on macOS BSD grep, appending `> /dev/null` to the empty pipeline flips its exit code from 1 to 0, inverting the `!` test.
- **Fix:** (a) The sync.ts doc comment is phrased so it does not contain the literal column tokens — `grep -nE` finds zero matches in the file, making the gate unambiguous. (b) `verify-phase-10.sh` checks the gate via variable-capture + `[[ -z ]]` instead of the redirect form. The gate's intent — no non-comment line in sync.ts writes a curation column — is fully and verifiably met.
- **Files modified:** src/lib/esim/sync.ts (doc comment wording, within Task 1 before commit); scripts/verify-phase-10.sh (gate form, within Task 5)
- **Verification:** `grep -nE 'popularity_rank|region_bucket|image_url' src/lib/esim/sync.ts` returns zero lines.
- **Committed in:** `ce7bd28` (sync.ts), `7a6b8f3` (verify script)

---

**Total deviations:** 1 spec/data correction (Rule 1), 2 blocking-issue fixes (Rule 3), 0 code-behavior auto-fixes
**Impact on plan:** All deviations are environment/spec-driven — a research miscount and two shell-portability quirks. The backfill logic, sync.ts patch, and all three scripts implement the locked design verbatim. No scope creep, no behavior change.

## Issues Encountered
- **159 uncurated destinations remain at `popularity_rank=9999`** — informational, expected. Production has 226 destinations; 69 are now curated, 159 stay uncurated (Celitech destinations with no mock-data match). Phase 11's UI query (`WHERE popularity_rank < 9999 OR region_bucket IS NOT NULL`) filters these out by design (CONTEXT.md "Uncurated destinations").
- **`missingInDb: 0`** — every one of the 66 country ISO codes in mock-data has a matching Celitech-synced row in production. The RESEARCH.md Open Question #1 (mock ISOs absent from Celitech) is resolved: zero drift. No Phase 11 follow-up needed.
- **Node ESM warning** — `node --experimental-strip-types` prints a `MODULE_TYPELESS_PACKAGE_JSON` performance warning when importing the `.ts` mock-data file. Cosmetic only; the import works. Not fixed (would require adding `"type": "module"` to package.json — out of scope, could affect the Next.js build).

## User Setup Required
None - no external service configuration required. The backfill has already run against production Supabase.

## Next Phase Readiness
- **Phase 11 (read-layer + browse cutover) is unblocked.** Production `destinations` has 69 curated rows including the 3 regional hero rows the browse UI needs.
- The two partial indexes from Plan 10-01 (`idx_destinations_popularity_curated`, `idx_destinations_region_bucket`) now have non-trivial content to index.
- The `DESTINATION_SYNC_COLUMNS` allowlist guarantees the daily 3 a.m. Celitech cron will never overwrite curation values — Phase 11 can rely on curation data being stable.
- `scripts/verify-phase-10.sh` is available for `/gsd:verify-work` to re-invoke as a regression catcher.
- `scripts/backfill-curation.mjs` and `scripts/verify-anon-read.mjs` are flagged for deletion in Phase 13 cleanup.

---
*Phase: 10-schema-and-curation-backfill*
*Completed: 2026-05-16*

## Self-Check: PASSED

- FOUND: `src/lib/esim/sync.ts`
- FOUND: `scripts/backfill-curation.mjs`
- FOUND: `scripts/verify-anon-read.mjs`
- FOUND: `scripts/verify-phase-10.sh`
- FOUND: `.planning/phases/10-schema-and-curation-backfill/10-02-SUMMARY.md`
- FOUND: commit `ce7bd28` (Task 1)
- FOUND: commit `3d5daaa` (Task 2)
- FOUND: commit `64eeb4d` (Task 3)
- FOUND: commit `7a6b8f3` (Task 5)
