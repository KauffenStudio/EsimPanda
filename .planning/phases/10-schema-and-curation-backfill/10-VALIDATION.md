---
phase: 10
slug: schema-and-curation-backfill
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-05-14
---

# Phase 10 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.1.4 (already in `package.json` devDeps) — but Phase 10 needs no Vitest specs |
| **Config file** | None at repo root; Vitest reads from `package.json` `test` script |
| **Quick run command** | `npm test` (runs all existing specs — Phase 10 must not regress them) |
| **Full suite command** | `npm test && bash scripts/verify-phase-10.sh` (verify script created in Plan 10-02) |
| **Estimated runtime** | ~8s for `npm test`; ~3s for the 7 verification commands |

Phase 10 has **no unit-test surface** worth covering with Vitest — every artifact is a DB or shell operation. Validation is live SQL + shell-grep + a small Node anon-key probe.

---

## Sampling Rate

- **After every task commit:** Run the relevant single verification command for that task (e.g., `10-01` migration commit → run the columns + indexes SQL queries; `10-02` backfill commit → run the backfill + idempotency + anon-key queries)
- **After every plan wave:** Phase 10 is a single wave. Run the entire 7-command verification table at the end of Plan 10-02
- **Before `/gsd:verify-work`:** All 7 verifications must be green AND `npm test` must pass with no regressions
- **Max feedback latency:** ~5 seconds per single check; ~10 seconds for the full Phase 10 suite

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 10-01-01 | 01 | 0 | INF-09 | smoke / SQL | `psql "$DB_URL" -c "SELECT column_name FROM information_schema.columns WHERE table_name='destinations' AND column_name IN ('popularity_rank','region_bucket');"` returns 2 data rows | ✅ migration file via Write | ⬜ pending |
| 10-01-02 | 01 | 0 | INF-09 | smoke / SQL | `psql "$DB_URL" -c "SELECT indexname FROM pg_indexes WHERE tablename='destinations' AND indexname LIKE 'idx_destinations_%';"` includes `idx_destinations_popularity_curated` and `idx_destinations_region_bucket` | ✅ migration file | ⬜ pending |
| 10-01-03 | 01 | 0 | INF-09 | static / grep | `supabase migration list` shows `00003_destinations_curation_metadata` with timestamp matching `pg_indexes`/`information_schema` | ✅ via supabase CLI | ⬜ pending |
| 10-02-01 | 02 | 0 | INF-10 | smoke / SQL | `psql "$DB_URL" -c "SELECT count(*) FROM destinations WHERE popularity_rank < 9999;"` returns ≥ 78 | ✅ via backfill script | ⬜ pending |
| 10-02-02 | 02 | 0 | INF-10 | smoke / SQL | `psql "$DB_URL" -c "SELECT count(*) FROM destinations WHERE iso_code IN ('EU','AS','GL') AND popularity_rank = 0;"` returns exactly 3 | ✅ via backfill script | ⬜ pending |
| 10-02-03 | 02 | 0 | INF-10 | integration / shell | Re-running `node --experimental-strip-types --env-file=.env.local scripts/backfill-curation.mjs` outputs `Updated: 0` for the country loop (idempotency) | ✅ shell, post-first-run | ⬜ pending |
| 10-02-04 | 02 | 0 | INF-10 | integration / Node | `node --env-file=.env.local scripts/verify-anon-read.mjs` exits 0 (anon-key SELECT returns ≥1 row with the new columns visible — proves RLS unchanged) | ❌ W0 — new file in Plan 10-02 | ⬜ pending |
| 10-02-05 | 02 | 0 | INF-10 | static / grep | `! grep -nE 'popularity_rank\|region_bucket\|image_url' src/lib/esim/sync.ts \| grep -v '^[[:space:]]*//'` exits 0 (no non-comment line in sync.ts writes a curation column) | ✅ shell | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `scripts/verify-anon-read.mjs` — ~12-line Node probe using `NEXT_PUBLIC_SUPABASE_ANON_KEY` to confirm the anon role can read the new columns. Created during Plan 10-02.
- [ ] `scripts/verify-phase-10.sh` (optional convenience) — bundles the 7 verification commands above into one shell-runnable script. Created during Plan 10-02 verification task.
- [ ] No framework install needed — Vitest already present; Phase 10 produces no new specs.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Migration `00003_destinations_curation_metadata.sql` does NOT break v1.0 functionality (sync.ts daily cron still runs without error) | INF-09 | Daily cron only runs at 3am; can't be triggered on-demand without rewriting `src/app/api/cron/sync-catalog/route.ts` invocation. Manual check is one curl. | After Phase 10 completes, invoke: `curl -X GET "https://<preview-url>/api/cron/sync-catalog" -H "Authorization: Bearer $CRON_SECRET"` — expect 200 + `{ success: true, synced: { destinations: 226, plans: 2812 } }` |
| Operator edits to `popularity_rank` survive a re-run of the backfill | INF-10 | The "operator edit" is a manual UPDATE in Supabase Studio. The re-run is the same as 10-02-03 but after an operator change. | (1) In Supabase Studio: `UPDATE destinations SET popularity_rank = 1 WHERE iso_code = 'PT';` (2) Re-run backfill. (3) Confirm `popularity_rank=1` for Portugal, not whatever mock-data sets it to. |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify (Phase 10 is single-plan-per-Wave, so trivially satisfied)
- [ ] Wave 0 covers all MISSING references (`scripts/verify-anon-read.mjs` is the only gap)
- [ ] No watch-mode flags
- [ ] Feedback latency < 10s
- [ ] `nyquist_compliant: true` set in frontmatter (flip after executor passes 7/7)

**Approval:** pending
