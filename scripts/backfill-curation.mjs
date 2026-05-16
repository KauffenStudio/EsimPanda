// scripts/backfill-curation.mjs
// Phase 10 (INF-10): copy curation metadata from mock-data into Supabase by iso_code.
// Idempotent: re-running against an already-populated DB reports zero updates.
// Three regional hero rows (EU/AS/GL) are UPSERTed before the country loop — they
// are synthetic ISO codes invented by mock-data that Celitech never syncs.
// Country rows (75) are guarded UPDATEs — only writes columns whose current slot
// is still the "unset" default (popularity_rank=9999, image_url=NULL, region_bucket=NULL).
//
// Run:
//   node --experimental-strip-types --env-file=.env.local scripts/backfill-curation.mjs
//
// Deleted in Phase 13 cleanup.

import { createClient } from '@supabase/supabase-js';
import { mockDestinations } from '../src/lib/mock-data/destinations.ts';

const required = ['NEXT_PUBLIC_SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY'];
for (const k of required) {
  if (!process.env[k]) {
    console.error(`Missing env: ${k}`);
    process.exit(1);
  }
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
  // Lookup existing row (Celitech may have already synced country rows; regional rows likely absent)
  const { data: existing, error: lookupErr } = await supabase
    .from('destinations')
    .select('id, popularity_rank, image_url, region_bucket')
    .eq('iso_code', row.iso_code)
    .maybeSingle();

  if (lookupErr) {
    console.error(`[${row.iso_code}] lookup error:`, lookupErr.message);
    errors++;
    continue;
  }

  // Regional hero rows (EU/AS/GL) — UPSERT because Celitech does not produce them.
  // Idempotency: if existing matches the target curation exactly, skip.
  if (REGIONAL_HEROES.has(row.iso_code)) {
    if (
      existing &&
      existing.popularity_rank === row.popularity_rank &&
      existing.region_bucket === row.region &&
      existing.image_url === row.image_url
    ) {
      alreadyCurated++;
      continue;
    }
    const { error } = await supabase.from('destinations').upsert(
      {
        name: row.name,
        slug: row.slug,
        iso_code: row.iso_code,
        region: 'region',                      // Celitech-style classifier ('country' | 'region')
        is_active: true,
        popularity_rank: row.popularity_rank,  // 0
        image_url: row.image_url,
        region_bucket: row.region,             // 'europe-wide' | 'asia-wide' | 'global'
        synced_at: new Date().toISOString(),
      },
      { onConflict: 'iso_code' },
    );
    if (error) {
      console.error(`[${row.iso_code}] upsert error:`, error.message);
      errors++;
    } else {
      upsertedHero++;
    }
    continue;
  }

  // Country rows — UPDATE only if Celitech has synced this iso_code (existing row present).
  if (!existing) {
    missingInDb++;
    continue;
  }

  // Build a partial update body — only include columns whose target slot is still "unset"
  // (operator edits and prior backfill runs are preserved).
  const patch = {};
  if (existing.popularity_rank === 9999) patch.popularity_rank = row.popularity_rank;
  if (existing.image_url === null)       patch.image_url = row.image_url;
  if (existing.region_bucket === null)   patch.region_bucket = row.region;

  if (Object.keys(patch).length === 0) {
    alreadyCurated++;
    continue;
  }

  const { data, error } = await supabase
    .from('destinations')
    .update(patch)
    .eq('iso_code', row.iso_code)
    .select('id'); // MUST chain .select() to get affected-row array; .update() alone returns null

  if (error) {
    console.error(`[${row.iso_code}] update error:`, error.message);
    errors++;
    continue;
  }
  if (data && data.length > 0) updatedCountry++;
}

console.log(`\n=== PHASE 10 BACKFILL COMPLETE ===`);
console.log(`Regional heroes upserted: ${upsertedHero}`);
console.log(`Country rows updated:     ${updatedCountry}`);
console.log(`Already curated (skipped):${alreadyCurated}`);
console.log(`Missing in DB (no sync):  ${missingInDb}`);
console.log(`Errors:                   ${errors}`);
// Aggregate for idempotency assertion (VALIDATION row 10-02-03 — second-run must show `Updated: 0`).
console.log(`Updated: ${upsertedHero + updatedCountry}`);

if (errors > 0) process.exit(1);
