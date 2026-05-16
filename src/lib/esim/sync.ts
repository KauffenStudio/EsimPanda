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

export async function syncCatalog() {
  const provider = createProvider();

  // Use service role client for writes (bypasses RLS)
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  // 1. Fetch all destinations from CELITECH
  const destinations = await provider.listDestinations();

  // 2. Upsert destinations into Supabase
  for (const dest of destinations) {
    const slug = dest.name
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');

    await supabase.from('destinations').upsert(
      {
        name: dest.name,
        slug,
        iso_code: dest.iso,
        region: dest.region,
        is_active: true,
        synced_at: new Date().toISOString(),
      } satisfies Record<typeof DESTINATION_SYNC_COLUMNS[number], unknown>,
      { onConflict: 'iso_code' },
    );
  }

  // 3. For each destination, fetch and upsert packages/plans
  let totalPlans = 0;
  for (const dest of destinations) {
    const packages = await provider.listPackages(dest.iso);

    // Get destination UUID from DB
    const { data: destRow } = await supabase
      .from('destinations')
      .select('id')
      .eq('iso_code', dest.iso)
      .single();

    if (!destRow) continue;

    for (const pkg of packages) {
      // Calculate retail price: wholesale + 60% markup, rounded to nearest 99 cents
      const retailPriceCents =
        Math.ceil((pkg.wholesalePriceCents * 1.6) / 100) * 100 - 1;

      await supabase.from('plans').upsert(
        {
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
        },
        { onConflict: 'wholesale_plan_id,provider' },
      );
      totalPlans++;
    }
  }

  return { destinations: destinations.length, plans: totalPlans };
}
