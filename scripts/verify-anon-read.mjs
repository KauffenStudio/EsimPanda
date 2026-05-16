// scripts/verify-anon-read.mjs
// Phase 10 (INF-10 verification): prove that the existing RLS policy
// "Public can read active destinations" continues to grant SELECT on the
// new curation columns (popularity_rank, region_bucket, image_url).
// RLS is row-level only; new columns inherit SELECT automatically — this
// script asserts that behavior empirically.
//
// Run:
//   node --env-file=.env.local scripts/verify-anon-read.mjs
//
// Exits 0 on success, 1 on failure (used by VALIDATION row 10-02-04).
// Deleted in Phase 13 cleanup.

import { createClient } from '@supabase/supabase-js';

const required = ['NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_ANON_KEY'];
for (const k of required) {
  if (!process.env[k]) {
    console.error(`Missing env: ${k}`);
    process.exit(1);
  }
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,  // ANON, not service-role
);

const { data, error } = await supabase
  .from('destinations')
  .select('id, iso_code, popularity_rank, region_bucket, image_url')
  .eq('is_active', true)
  .limit(1);

if (error) {
  console.error('FAIL:', error.message);
  process.exit(1);
}
if (!data || data.length === 0) {
  console.error('FAIL: empty array (RLS or no rows)');
  process.exit(1);
}
console.log('OK — anon reads new columns:', JSON.stringify(data[0], null, 2));
