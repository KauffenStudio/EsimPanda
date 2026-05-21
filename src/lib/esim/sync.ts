import { createProvider } from './provider';
import { createClient } from '@supabase/supabase-js';

/**
 * Columns the daily Celitech sync is allowed to write to `destinations`.
 * Curation fields (the popularity-rank, region-bucket and image-URL columns)
 * are managed exclusively by `scripts/backfill-curation.mjs` and operator
 * edits via Supabase Studio. The sync MUST NOT touch them or the 3 a.m. cron
 * will erase manual curation. See .planning/phases/10-schema-and-curation-backfill/
 *
 * The `satisfies` clause on the upsert below turns this allowlist into a
 * compile-time guard: adding a curation field to the upsert object literal
 * raises a TypeScript error.
 */
const DESTINATION_SYNC_COLUMNS = ['name', 'slug', 'iso_code', 'region', 'is_active', 'synced_at'] as const;

// Map Celitech regional bundles ("Europe (39 countries)", "Asia (15)", "Global")
// onto our three curated hero rows. Backfill seeds those rows with synthetic ISOs
// (EU/AS/GL) plus image_url + region_bucket; without remapping, Celitech would
// create parallel rows (iso_code='EUROPE' etc.) and the hero cards would never
// see plans. The Celitech iso is preserved separately and still used to fetch
// packages from the wholesale API.
const REGIONAL_ISO_MAP: ReadonlyArray<{ match: RegExp; iso: string; name: string; slug: string }> = [
  { match: /^europe/i, iso: 'EU', name: 'Europe', slug: 'europe' },
  { match: /^asia/i, iso: 'AS', name: 'Asia', slug: 'asia' },
  { match: /^(global|worldwide)/i, iso: 'GL', name: 'Global', slug: 'global' },
];

function curatedRegional(dest: { name: string; region: string }):
  | { iso: string; name: string; slug: string }
  | null {
  if (dest.region !== 'region') return null;
  for (const entry of REGIONAL_ISO_MAP) {
    if (entry.match.test(dest.name)) return { iso: entry.iso, name: entry.name, slug: entry.slug };
  }
  return null;
}

export async function syncCatalog() {
  const provider = createProvider();

  // Use service role client for writes (bypasses RLS)
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  // 1. Fetch all destinations from CELITECH
  const destinations = await provider.listDestinations();

  // 2. Batch-upsert destinations in one round-trip. Supabase accepts arrays on
  //    .upsert() and resolves all conflicts (iso_code) server-side, replacing
  //    226 sequential awaits with one.
  const destinationRows = destinations.map((dest) => {
    const curated = curatedRegional(dest);
    const iso = curated?.iso ?? dest.iso;
    const slug = curated?.slug ?? dest.name
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');
    const name = curated?.name ?? dest.name;
    return {
      name,
      slug,
      iso_code: iso,
      region: dest.region,
      is_active: true,
      synced_at: new Date().toISOString(),
    } satisfies Record<typeof DESTINATION_SYNC_COLUMNS[number], unknown>;
  });

  const { error: destBatchError } = await supabase
    .from('destinations')
    .upsert(destinationRows, { onConflict: 'iso_code' });
  if (destBatchError) {
    console.error('syncCatalog destinations upsert error:', destBatchError);
    throw destBatchError;
  }

  // 3. For each destination, fetch and batch-upsert its packages/plans.
  //    Celitech is kept sequential (one HTTP call per destination) to respect
  //    upstream rate limits, but Supabase writes are batched per destination —
  //    so a destination with 12 plans goes from 12 round-trips to 1.
  let totalPlans = 0;
  let plansWithErrors = 0;
  for (const dest of destinations) {
    // Packages MUST be fetched with Celitech's own iso (e.g. 'EUROPE'), but the
    // destination row we attach them to uses our curated iso (e.g. 'EU').
    const packages = await provider.listPackages(dest.iso);
    if (packages.length === 0) continue;
    const curated = curatedRegional(dest);
    const lookupIso = curated?.iso ?? dest.iso;

    const { data: destRow, error: destLookupError } = await supabase
      .from('destinations')
      .select('id')
      .eq('iso_code', lookupIso)
      .single();

    if (destLookupError || !destRow) {
      console.error(
        `syncCatalog destination lookup failed for ${lookupIso}:`,
        destLookupError?.message ?? 'no row returned',
      );
      plansWithErrors += packages.length;
      continue;
    }

    const planRows = packages.map((pkg) => {
      // Retail price: 1.6× wholesale, rounded UP to the next .99 ending. This is
      // intentional .99 psychological pricing — small wholesale prices get a
      // higher effective % markup as a side-effect of the rounding floor.
      const retailPriceCents =
        Math.ceil((pkg.wholesalePriceCents * 1.6) / 100) * 100 - 1;
      return {
        destination_id: destRow.id,
        wholesale_plan_id: pkg.wholesaleId,
        provider: 'celitech',
        name: `${pkg.dataGB}GB / ${pkg.durationDays} days`,
        data_gb: pkg.dataGB,
        duration_days: pkg.durationDays,
        wholesale_price_cents: pkg.wholesalePriceCents,
        retail_price_cents: retailPriceCents,
        currency: pkg.currency,
        is_active: true,
        synced_at: new Date().toISOString(),
      };
    });

    const { error: planBatchError } = await supabase
      .from('plans')
      .upsert(planRows, { onConflict: 'wholesale_plan_id,provider' });
    if (planBatchError) {
      console.error(
        `syncCatalog plans upsert failed for ${lookupIso}:`,
        planBatchError.message,
      );
      plansWithErrors += packages.length;
      continue;
    }
    totalPlans += packages.length;
  }

  return { destinations: destinations.length, plans: totalPlans, plansWithErrors };
}
