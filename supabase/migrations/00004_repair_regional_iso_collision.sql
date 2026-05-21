-- 00004 — Repair regional hero ISO collision with real country codes.
--
-- The storefront's three curated hero rows were originally seeded with
-- synthetic ISO codes 'EU' / 'AS' / 'GL'. Two of those collide with real
-- ISO-3166-1 alpha-2 codes: 'AS' is American Samoa, 'GL' is Greenland.
-- When Celitech's daily sync upserted those countries (onConflict: iso_code),
-- it overwrote our curated Asia / Global rows with country data while
-- preserving the curation columns (region_bucket / image_url / popularity_rank
-- are not in the sync allowlist).
--
-- This migration moves the curated rows onto 3-letter synthetic ISOs that
-- cannot collide with any 2-letter country code: EUW / ASW / GLW. The matching
-- code change lives in src/lib/esim/sync.ts + scripts/sync-catalog-once.mjs +
-- scripts/backfill-curation.mjs (REGIONAL_ISO_MAP and REGIONAL_HEROES).
--
-- The destinations.id (UUID) does NOT change, so plans attached via destination_id
-- stay valid. Country plans from Greenland / American Samoa that landed on the
-- corrupted rows during the broken-sync window get reattached to their real
-- country rows on the next sync (upsert on `wholesale_plan_id,provider` updates
-- the existing plan row's `destination_id`).
--
-- Each UPDATE is gated on `region_bucket` so we can only ever touch the curated
-- hero row, never a real Celitech country row that happens to share the ISO.

UPDATE destinations
SET iso_code = 'EUW', name = 'Europe', slug = 'europe', region = 'region'
WHERE iso_code = 'EU' AND region_bucket = 'europe-wide';

UPDATE destinations
SET iso_code = 'ASW', name = 'Asia', slug = 'asia', region = 'region'
WHERE iso_code = 'AS' AND region_bucket = 'asia-wide';

UPDATE destinations
SET iso_code = 'GLW', name = 'Global', slug = 'global', region = 'region'
WHERE iso_code = 'GL' AND region_bucket = 'global';
