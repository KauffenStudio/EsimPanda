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

// Mirror of src/lib/esim/sync.ts REGIONAL_ISO_MAP — Celitech labels regional
// bundles "Europe (44 countries)" / "Asia (...)" / "Global" with ISOs like
// EUROPE/ASIA/GLOBAL. The storefront's three hero rows use synthetic 3-letter
// ISOs (EUW/ASW/GLW) that cannot collide with any real ISO-3166-1 alpha-2
// country code. An earlier version used 'EU'/'AS'/'GL' — but 'AS' is American
// Samoa and 'GL' is Greenland, and Celitech's country sync overwrote our
// curated rows with country data on every sync run.
const REGIONAL_ISO_MAP = [
  { match: /^europe/i, iso: 'EUW', name: 'Europe', slug: 'europe' },
  { match: /^asia/i, iso: 'ASW', name: 'Asia', slug: 'asia' },
  { match: /^(global|worldwide)/i, iso: 'GLW', name: 'Global', slug: 'global' },
];

function curatedRegional(dest) {
  if (dest.region !== 'region') return null;
  for (const entry of REGIONAL_ISO_MAP) {
    if (entry.match.test(dest.name)) {
      return { iso: entry.iso, name: entry.name, slug: entry.slug };
    }
  }
  return null;
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
  let regionalMapped = 0;
  for (const dest of destinations) {
    if (!dest.iso) continue;
    const curated = curatedRegional(dest);
    if (curated) regionalMapped++;
    const iso = curated?.iso ?? dest.iso;
    const name = curated?.name ?? dest.name;
    const slug = curated?.slug ?? slugify(dest.name);
    const { error } = await supabase.from('destinations').upsert(
      {
        name,
        slug,
        iso_code: iso,
        region: dest.region,
        is_active: true,
        synced_at: new Date().toISOString(),
      },
      { onConflict: 'iso_code' },
    );
    if (error) console.error(`destination ${iso} upsert error:`, error.message);
    else destOk++;
  }
  console.log(`Upserted ${destOk}/${destinations.length} destinations (regional mapped: ${regionalMapped}).`);

  let totalPlans = 0;
  let totalDestsWithPlans = 0;
  for (const dest of destinations) {
    if (!dest.iso) continue;
    let pkgs = [];
    try {
      // Packages MUST be fetched with Celitech's own iso (e.g. 'EUROPE'); the
      // destination row we attach them to uses our curated iso (e.g. 'EUW').
      const pkgResp = await celitech.packages.listPackages({ destination: dest.iso });
      pkgs = pkgResp.data?.packages ?? pkgResp.packages ?? [];
    } catch (e) {
      console.error(`listPackages(${dest.iso}) failed:`, e.message);
      continue;
    }
    if (pkgs.length === 0) continue;
    totalDestsWithPlans++;

    const lookupIso = curatedRegional(dest)?.iso ?? dest.iso;
    const { data: destRow } = await supabase.from('destinations').select('id').eq('iso_code', lookupIso).single();
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
