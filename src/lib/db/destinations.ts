import 'server-only'; // build-time guard: a client component importing this fails the build
import { createClient } from '@/lib/supabase/server';
// pure compute helper — no I/O; extraction to src/lib/plans/pricing-display.ts is Phase 13 (INF-11), do not extract here
import { getDiscountPercent } from '@/lib/mock-data/plans';

// ── Row shapes ──────────────────────────────────────────────────────────────
// Match the destinations / plans tables after Phase 10 migration 00003.
// Structurally identical to MockDestination / MockPlan; destinations gains
// region_bucket, and popularity_rank / image_url are now real columns.

export interface Destination {
  id: string;
  name: string;
  slug: string;
  iso_code: string;
  region: string | null; // Celitech classifier: 'country' | 'region'
  region_bucket: string | null; // curation bucket: 'europe' | 'asia' | 'europe-wide' | 'asia-wide' | 'global' | ...
  image_url: string | null; // NULL for uncurated rows + possible curated gaps → typographic fallback
  popularity_rank: number; // NOT NULL DEFAULT 9999
  is_active: boolean;
}

export interface Plan {
  id: string;
  destination_id: string;
  wholesale_plan_id: string;
  provider: string;
  name: string;
  data_gb: number; // Postgres NUMERIC → JS number (eSIM sizes are safe integers)
  duration_days: number;
  wholesale_price_cents: number;
  retail_price_cents: number;
  currency: string; // assume 'USD'; Phase 12 verifies
  is_active: boolean;
  // Optional timestamp columns — present on synced rows, absent on the
  // `getPlanById` projection. Optional so MockPlan importers (which carry
  // these as required fields) compile against the canonical Plan after the
  // Phase 12 MockPlan→Plan rename.
  synced_at?: string;
  created_at?: string;
  updated_at?: string;
}

// Browse-grid destination enriched with per-destination pricing computed
// server-side so DestinationCard never fetches plans client-side.
export interface CatalogDestination extends Destination {
  startingPriceCents: number; // min retail_price_cents of its active plans; 0 if none
  bestDiscountPercent: number; // max getDiscountPercent across its plans; 0 if none
}

export interface Catalog {
  destinations: CatalogDestination[]; // country cards, popularity-sorted
  regionalPlans: CatalogDestination[]; // EU/AS/GL hero cards
  error: boolean; // true if the destinations query errored — drives UXD-06 banner in 11-02
}

// region_bucket values that mean a multi-country regional hero card.
const REGIONAL_BUCKETS = new Set(['europe-wide', 'asia-wide', 'global']);

// Column list reused across destination queries — keeps Destination shape exact.
const DESTINATION_COLUMNS =
  'id, name, slug, iso_code, region, region_bucket, image_url, popularity_rank, is_active';

/**
 * All active destinations, popularity-sorted. Public read for callers that do
 * not need the error flag (getCatalog runs its own destinations query inline so
 * it can surface the error precisely — see getCatalog).
 */
export async function listActiveDestinations(): Promise<Destination[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('destinations')
    .select(DESTINATION_COLUMNS)
    .eq('is_active', true)
    .order('popularity_rank', { ascending: true });
  if (error) {
    console.error('listActiveDestinations error:', error);
    return [];
  }
  return data ?? [];
}

/** Active plans for a single destination, cheapest first. [] on error. */
export async function listPlansForDestination(destinationId: string): Promise<Plan[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('plans')
    .select('*')
    .eq('destination_id', destinationId)
    .eq('is_active', true)
    .order('retail_price_cents', { ascending: true });
  if (error) {
    console.error('listPlansForDestination error:', error);
    return [];
  }
  return data ?? [];
}

/** Single active destination by slug. null (not throw) when 0 rows. */
export async function getDestinationBySlug(slug: string): Promise<Destination | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('destinations')
    .select(DESTINATION_COLUMNS)
    .eq('slug', slug)
    .eq('is_active', true)
    .maybeSingle(); // maybeSingle: 0 rows → null, not an error
  if (error) {
    console.error('getDestinationBySlug error:', error);
    return null;
  }
  return data;
}

/** Single plan by id. null (not throw) when 0 rows. Reused by Phase 12. */
export async function getPlanById(planId: string): Promise<Plan | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('plans')
    .select('*')
    .eq('id', planId)
    .maybeSingle();
  if (error) {
    console.error('getPlanById error:', error);
    return null;
  }
  return data;
}

/**
 * Single browse entry point. INF-08: called by the browse RSC.
 * - CAT-05: curated rows only (popularity_rank < 9999 OR region_bucket set).
 * - INF-07: partitions regional heroes vs country cards; enriches per-destination
 *   pricing server-side so cards never fetch plans client-side.
 * - UXD-06: `error` is true only if the destinations query itself errored.
 *
 * Runs the destinations query inline (rather than delegating to
 * listActiveDestinations) so the query's `error` can be read precisely.
 */
export async function getCatalog(): Promise<Catalog> {
  const supabase = await createClient();

  const { data: destinationRows, error: destinationsError } = await supabase
    .from('destinations')
    .select(DESTINATION_COLUMNS)
    .eq('is_active', true)
    .order('popularity_rank', { ascending: true });

  if (destinationsError) {
    console.error('getCatalog destinations error:', destinationsError);
    return { destinations: [], regionalPlans: [], error: true };
  }

  const all: Destination[] = destinationRows ?? [];

  // CAT-05: hide uncurated rows (decision from 10-CONTEXT.md).
  const curated = all.filter((d) => d.popularity_rank < 9999 || d.region_bucket !== null);
  if (curated.length === 0) {
    return { destinations: [], regionalPlans: [], error: false };
  }

  // One batched plans query for all curated destinations (avoids N round-trips).
  const ids = curated.map((d) => d.id);
  const { data: plans, error: plansError } = await supabase
    .from('plans')
    .select('id, destination_id, data_gb, retail_price_cents, is_active')
    .in('destination_id', ids)
    .eq('is_active', true);
  if (plansError) {
    // Non-fatal: still return destinations with 0 pricing. The error flag is
    // reserved for a destinations-query failure (drives the UXD-06 banner).
    console.error('getCatalog plans error:', plansError);
  }

  // Index plans by destination for O(1) enrichment.
  const byDest = new Map<string, { data_gb: number; retail_price_cents: number }[]>();
  for (const p of plans ?? []) {
    const arr = byDest.get(p.destination_id) ?? [];
    arr.push({ data_gb: p.data_gb, retail_price_cents: p.retail_price_cents });
    byDest.set(p.destination_id, arr);
  }

  const enrich = (d: Destination): CatalogDestination => {
    const ps = byDest.get(d.id) ?? [];
    const startingPriceCents = ps.length
      ? Math.min(...ps.map((p) => p.retail_price_cents))
      : 0;
    const bestDiscountPercent = ps.length
      ? Math.max(...ps.map((p) => getDiscountPercent(p.retail_price_cents, p.data_gb)))
      : 0;
    return { ...d, startingPriceCents, bestDiscountPercent };
  };

  const enriched = curated.map(enrich);
  return {
    destinations: enriched.filter((d) => !REGIONAL_BUCKETS.has(d.region_bucket ?? '')),
    regionalPlans: enriched.filter((d) => REGIONAL_BUCKETS.has(d.region_bucket ?? '')),
    error: false,
  };
}
