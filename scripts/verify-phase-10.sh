#!/usr/bin/env bash
# scripts/verify-phase-10.sh
# Phase 10 final verification — bundles the CLI-runnable VALIDATION.md commands.
# Exits 0 only if every check passes. Suitable for invocation before /gsd:verify-work.
#
# Run from project root:
#   bash scripts/verify-phase-10.sh
#
# Requires .env.local with NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY,
# SUPABASE_SERVICE_ROLE_KEY. The two first-run SQL gates (10-02-01 curated count,
# 10-02-02 regional hero count) are validated manually in Plan 10-02 Task 4 —
# this script re-runs only the pure-CLI checks.
# Deleted in Phase 13 cleanup.

set -uo pipefail
cd "$(dirname "$0")/.."

PASS=0
FAIL=0
fail() { echo "  FAIL: $1"; FAIL=$((FAIL+1)); }
pass() { echo "  PASS: $1"; PASS=$((PASS+1)); }

echo "=== Phase 10 verification ==="
echo

# 10-01-01 + 10-01-02 — migration applied.
# Capture output first: `... | grep -q` under `set -o pipefail` would mark the
# pipeline failed because grep -q closes the pipe early (SIGPIPE on supabase).
echo "10-01: Migration applied"
MIGRATIONS="$(~/.local/bin/supabase migration list 2>&1)"
if echo "$MIGRATIONS" | grep -qE "00003"; then
  pass "supabase migration list shows 00003_destinations_curation_metadata"
else
  fail "supabase migration list missing 00003_destinations_curation_metadata"
fi
echo

# 10-02-03 — backfill idempotency (re-run reports Updated: 0)
echo "10-02-03: Backfill idempotency"
REPLAY="$(node --experimental-strip-types --env-file=.env.local scripts/backfill-curation.mjs 2>&1)"
if echo "$REPLAY" | grep -qE "Updated:[[:space:]]+0"; then
  pass "re-run reports 'Updated: 0' (idempotent)"
else
  fail "re-run did not report 'Updated: 0' — operator edits may be at risk"
  echo "$REPLAY" | tail -10
fi
echo

# 10-02-04 — anon-key probe
echo "10-02-04: Anon-key SELECT on new columns"
if node --env-file=.env.local scripts/verify-anon-read.mjs > /dev/null 2>&1; then
  pass "anon-key probe exits 0"
else
  fail "anon-key probe failed — RLS may be blocking the new columns"
  node --env-file=.env.local scripts/verify-anon-read.mjs || true
fi
echo

# 10-02-05 — sync.ts curation-column allowlist guard.
# Note: the raw grep below is checked WITHOUT a redirect to avoid a BSD-grep
# quirk where `... > /dev/null` flips the empty-pipeline exit code.
echo "10-02-05: sync.ts does not write curation columns"
SYNC_HITS="$(grep -nE 'popularity_rank|region_bucket|image_url' src/lib/esim/sync.ts | grep -v '^[[:space:]]*//' | grep -v '^[[:space:]]*\*' | grep -v '^[[:space:]]*/\*\*')"
if [[ -z "$SYNC_HITS" ]]; then
  pass "no non-comment line in sync.ts mentions a curation column"
else
  fail "sync.ts has non-comment references to curation columns"
  echo "$SYNC_HITS"
fi
echo

# v1.0 regression check
echo "Regression: v1.0 test suite"
if npm test --silent > /dev/null 2>&1; then
  pass "npm test passes"
else
  fail "npm test failed — Phase 10 introduced a regression"
fi
echo

echo "=== Result: ${PASS} pass / ${FAIL} fail ==="
[[ "$FAIL" -eq 0 ]] || exit 1
