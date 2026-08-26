-- Live activity feed: the data behind the rotating social-proof toasts.
--
-- Everything the widget shows has to be literally true, so it is fed from two
-- real sources: actual views recorded here, and actual rows in `orders`.
-- Nothing is seeded or simulated.

-- One row per (session, destination, minute). The minute bucket is part of the
-- primary key so a visitor idling on a page cannot inflate their own count —
-- repeated pings inside the same minute collide and upsert instead of stacking.
CREATE TABLE IF NOT EXISTS destination_views (
  destination_id UUID NOT NULL REFERENCES destinations(id) ON DELETE CASCADE,
  session_id     TEXT NOT NULL,
  minute_bucket  TIMESTAMPTZ NOT NULL,
  seen_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (destination_id, session_id, minute_bucket)
);

-- Serves both queries the feed makes: "viewing right now" (last 5 minutes) and
-- "viewed today" (last 24h), each scoped to one destination.
CREATE INDEX IF NOT EXISTS idx_destination_views_recent
  ON destination_views (destination_id, seen_at DESC);

-- Sweep index for the retention delete below.
CREATE INDEX IF NOT EXISTS idx_destination_views_seen_at
  ON destination_views (seen_at);

-- No policies are added: RLS on with zero policies means the anon key cannot
-- read or write this table at all. Writes go through /api/activity/view and
-- reads through /api/activity/live, both service-role, so raw session ids are
-- never reachable from the browser.
ALTER TABLE destination_views ENABLE ROW LEVEL SECURITY;

-- Buyer country for the "someone in X just bought" line. Populated from the
-- edge geo header at intent creation (the same lookup that resolves VAT), so
-- it costs nothing extra. Deliberately country-level: it is coarse enough that
-- it cannot identify an individual buyer, which a city would risk on low
-- volume. Nullable — orders created before this column, or with no geo header,
-- simply render without a location.
ALTER TABLE orders ADD COLUMN IF NOT EXISTS buyer_country TEXT;

-- 48h retention. The feed only ever looks back 24h, so anything older is dead
-- weight, and keeping per-session rows longer than they are used would be
-- collecting more than the feature needs.
CREATE OR REPLACE FUNCTION prune_destination_views() RETURNS void
LANGUAGE sql
AS $$
  DELETE FROM destination_views WHERE seen_at < now() - INTERVAL '48 hours';
$$;
