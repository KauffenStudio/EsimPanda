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
