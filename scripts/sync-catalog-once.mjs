// One-off catalog sync against real Celitech. Run with:
//   node --env-file=.env.local scripts/sync-catalog-once.mjs
import { Celitech } from 'celitech-sdk';
import { createClient } from '@supabase/supabase-js';

const required = ['CELITECH_CLIENT_ID', 'CELITECH_CLIENT_SECRET', 'NEXT_PUBLIC_SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY'];
for (const k of required) {
  if (!process.env[k]) {
    console.error(`Missing env: ${k}`);
    process.exit(1);
  }
}

const celitech = new Celitech({
  clientId: process.env.CELITECH_CLIENT_ID,
  clientSecret: process.env.CELITECH_CLIENT_SECRET,
});

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

function slugify(name) {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

async function main() {
  console.log('Fetching destinations from Celitech...');
  const destResp = await celitech.destinations.listDestinations();
  const destinations = (destResp.data?.destinations ?? destResp.destinations ?? []).map((d) => ({
    name: d.name,
    iso: d.destinationIso2 ?? d.destination,
    region: d.supportedCountries?.length > 1 ? 'region' : 'country',
  }));
  console.log(`Got ${destinations.length} destinations.`);

  let destOk = 0;
  for (const dest of destinations) {
    if (!dest.iso) continue;
    const { error } = await supabase.from('destinations').upsert(
      {
        name: dest.name,
        slug: slugify(dest.name),
        iso_code: dest.iso,
        region: dest.region,
        is_active: true,
        synced_at: new Date().toISOString(),
      },
      { onConflict: 'iso_code' },
    );
    if (error) console.error(`destination ${dest.iso} upsert error:`, error.message);
    else destOk++;
  }
  console.log(`Upserted ${destOk}/${destinations.length} destinations.`);

  let totalPlans = 0;
  let totalDestsWithPlans = 0;
  for (const dest of destinations) {
    if (!dest.iso) continue;
    let pkgs = [];
    try {
      const pkgResp = await celitech.packages.listPackages({ destination: dest.iso });
      pkgs = pkgResp.data?.packages ?? pkgResp.packages ?? [];
    } catch (e) {
      console.error(`listPackages(${dest.iso}) failed:`, e.message);
      continue;
    }
    if (pkgs.length === 0) continue;
    totalDestsWithPlans++;

    const { data: destRow } = await supabase.from('destinations').select('id').eq('iso_code', dest.iso).single();
    if (!destRow) continue;

    for (const p of pkgs) {
      const wholesale = typeof p.priceInCents === 'number' ? p.priceInCents : Math.round((p.price ?? 0) * 100);
      const retail = Math.ceil((wholesale * 1.6) / 100) * 100 - 1;
      const dataGB = p.dataLimitInGb;
      const durationDays = p.maxDays ?? p.duration ?? 0;

      const { error } = await supabase.from('plans').upsert(
        {
          destination_id: destRow.id,
          wholesale_plan_id: p.id,
          provider: 'celitech',
          name: `${dataGB}GB / ${durationDays} days`,
          data_gb: dataGB,
          duration_days: durationDays,
          wholesale_price_cents: wholesale,
          retail_price_cents: retail,
          currency: 'USD',
          is_active: true,
          synced_at: new Date().toISOString(),
        },
        { onConflict: 'wholesale_plan_id,provider' },
      );
      if (error) console.error(`plan ${p.id} upsert error:`, error.message);
      else totalPlans++;
    }
  }

  console.log(`\n=== SYNC COMPLETE ===`);
  console.log(`Destinations upserted: ${destOk}`);
  console.log(`Destinations with plans: ${totalDestsWithPlans}`);
  console.log(`Plans upserted: ${totalPlans}`);
}

main().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});
