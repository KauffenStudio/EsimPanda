// Stable catalog fixtures decoupled from src/lib/mock-data/ (Pitfall 6).
// Component + read-module tests import these instead of relying on mock-data,
// so the cutover does not cascade test breakage.
import type { CatalogDestination, Plan } from '@/lib/db/destinations';

/** Country destinations — varied image_url (one null), varied popularity_rank. */
export const fixtureDestinations: CatalogDestination[] = [
  {
    id: 'dest-france',
    name: 'France',
    slug: 'france',
    iso_code: 'FR',
    region: 'country',
    region_bucket: 'europe',
    image_url: 'https://images.pexels.com/photos/france.jpg',
    popularity_rank: 1,
    is_active: true,
    startingPriceCents: 449,
    bestDiscountPercent: 30,
  },
  {
    id: 'dest-spain',
    name: 'Spain',
    slug: 'spain',
    iso_code: 'ES',
    region: 'country',
    region_bucket: 'europe',
    image_url: 'https://images.pexels.com/photos/spain.jpg',
    popularity_rank: 2,
    is_active: true,
    startingPriceCents: 449,
    bestDiscountPercent: 30,
  },
  {
    id: 'dest-italy',
    name: 'Italy',
    slug: 'italy',
    iso_code: 'IT',
    region: 'country',
    region_bucket: 'europe',
    // Intentionally null — exercises the typographic fallback card path.
    image_url: null,
    popularity_rank: 3,
    is_active: true,
    startingPriceCents: 449,
    bestDiscountPercent: 30,
  },
  {
    id: 'dest-japan',
    name: 'Japan',
    slug: 'japan',
    iso_code: 'JP',
    region: 'country',
    region_bucket: 'asia',
    image_url: 'https://images.pexels.com/photos/japan.jpg',
    popularity_rank: 5,
    is_active: true,
    startingPriceCents: 449,
    bestDiscountPercent: 30,
  },
];

/** Regional hero destinations — region_bucket in the multi-country set. */
export const fixtureRegionalPlans: CatalogDestination[] = [
  {
    id: 'dest-europe-wide',
    name: 'Europe',
    slug: 'europe',
    iso_code: 'EU',
    region: 'region',
    region_bucket: 'europe-wide',
    image_url: 'https://images.pexels.com/photos/europe.jpg',
    popularity_rank: 1,
    is_active: true,
    startingPriceCents: 1699,
    bestDiscountPercent: 30,
  },
];

/** Plan objects for read-module + comparison tests. */
export const fixturePlans: Plan[] = [
  {
    id: 'plan-france-1gb',
    destination_id: 'dest-france',
    wholesale_plan_id: 'cel_france_1',
    provider: 'celitech',
    name: 'France 1GB 14 Days',
    data_gb: 1,
    duration_days: 14,
    wholesale_price_cents: 320,
    retail_price_cents: 449,
    currency: 'USD',
    is_active: true,
  },
  {
    id: 'plan-france-5gb',
    destination_id: 'dest-france',
    wholesale_plan_id: 'cel_france_3',
    provider: 'celitech',
    name: 'France 5GB 30 Days',
    data_gb: 5,
    duration_days: 30,
    wholesale_price_cents: 800,
    retail_price_cents: 1199,
    currency: 'USD',
    is_active: true,
  },
  {
    id: 'plan-spain-3gb',
    destination_id: 'dest-spain',
    wholesale_plan_id: 'cel_spain_2',
    provider: 'celitech',
    name: 'Spain 3GB 20 Days',
    data_gb: 3,
    duration_days: 20,
    wholesale_price_cents: 480,
    retail_price_cents: 699,
    currency: 'USD',
    is_active: true,
  },
];
