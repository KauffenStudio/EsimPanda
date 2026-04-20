export interface MockPlan {
  id: string;
  destination_id: string;
  wholesale_plan_id: string;
  provider: string;
  name: string;
  data_gb: number;
  duration_days: number;
  wholesale_price_cents: number;
  retail_price_cents: number;
  currency: string;
  is_active: boolean;
  synced_at: string;
  created_at: string;
  updated_at: string;
}

const now = '2026-04-01T00:00:00Z';

function makePlan(
  id: string,
  destinationId: string,
  name: string,
  dataGb: number,
  durationDays: number,
  wholesaleCents: number,
  retailCents: number
): MockPlan {
  return {
    id,
    destination_id: destinationId,
    wholesale_plan_id: `cel_${id.slice(0, 8)}`,
    provider: 'celitech',
    name,
    data_gb: dataGb,
    duration_days: durationDays,
    wholesale_price_cents: wholesaleCents,
    retail_price_cents: retailCents,
    currency: 'EUR',
    is_active: true,
    synced_at: now,
    created_at: now,
    updated_at: now,
  };
}

// Destination IDs from mock-data/destinations.ts
const DEST_IDS = {
  europe: 'a1b2c3d4-0001-4000-8000-000000000001',
  france: 'a1b2c3d4-0002-4000-8000-000000000002',
  spain: 'a1b2c3d4-0003-4000-8000-000000000003',
  italy: 'a1b2c3d4-0004-4000-8000-000000000004',
  germany: 'a1b2c3d4-0005-4000-8000-000000000005',
  portugal: 'a1b2c3d4-0006-4000-8000-000000000006',
  netherlands: 'a1b2c3d4-0007-4000-8000-000000000007',
  uk: 'a1b2c3d4-0008-4000-8000-000000000008',
  greece: 'a1b2c3d4-0009-4000-8000-000000000009',
  turkey: 'a1b2c3d4-0010-4000-8000-000000000010',
  poland: 'a1b2c3d4-0011-4000-8000-000000000011',
  czech: 'a1b2c3d4-0012-4000-8000-000000000012',
  austria: 'a1b2c3d4-0013-4000-8000-000000000013',
};

export const mockPlans: MockPlan[] = [
  // Europe-wide plans
  makePlan('p001-0001-4000-8000-000000000001', DEST_IDS.europe, 'Europe 5GB 7 Days', 5, 7, 1099, 1499),
  makePlan('p001-0002-4000-8000-000000000002', DEST_IDS.europe, 'Europe 10GB 14 Days', 10, 14, 1799, 2499),
  makePlan('p001-0003-4000-8000-000000000003', DEST_IDS.europe, 'Europe 20GB 30 Days', 20, 30, 2899, 3999),

  // France
  makePlan('p002-0001-4000-8000-000000000001', DEST_IDS.france, 'France 1GB 1 Day', 1, 1, 349, 499),
  makePlan('p002-0002-4000-8000-000000000002', DEST_IDS.france, 'France 3GB 7 Days', 3, 7, 599, 899),
  makePlan('p002-0003-4000-8000-000000000003', DEST_IDS.france, 'France 5GB 14 Days', 5, 14, 899, 1299),
  makePlan('p002-0004-4000-8000-000000000004', DEST_IDS.france, 'France 10GB 30 Days', 10, 30, 1499, 2199),

  // Spain
  makePlan('p003-0001-4000-8000-000000000001', DEST_IDS.spain, 'Spain 1GB 1 Day', 1, 1, 349, 499),
  makePlan('p003-0002-4000-8000-000000000002', DEST_IDS.spain, 'Spain 3GB 7 Days', 3, 7, 599, 899),
  makePlan('p003-0003-4000-8000-000000000003', DEST_IDS.spain, 'Spain 5GB 14 Days', 5, 14, 899, 1299),
  makePlan('p003-0004-4000-8000-000000000004', DEST_IDS.spain, 'Spain 10GB 30 Days', 10, 30, 1499, 2199),

  // Italy
  makePlan('p004-0001-4000-8000-000000000001', DEST_IDS.italy, 'Italy 1GB 1 Day', 1, 1, 349, 499),
  makePlan('p004-0002-4000-8000-000000000002', DEST_IDS.italy, 'Italy 3GB 7 Days', 3, 7, 599, 899),
  makePlan('p004-0003-4000-8000-000000000003', DEST_IDS.italy, 'Italy 5GB 14 Days', 5, 14, 899, 1299),
  makePlan('p004-0004-4000-8000-000000000004', DEST_IDS.italy, 'Italy 10GB 30 Days', 10, 30, 1499, 2199),
  makePlan('p004-0005-4000-8000-000000000005', DEST_IDS.italy, 'Italy 20GB 90 Days', 20, 90, 2999, 4299),

  // Germany
  makePlan('p005-0001-4000-8000-000000000001', DEST_IDS.germany, 'Germany 1GB 1 Day', 1, 1, 349, 499),
  makePlan('p005-0002-4000-8000-000000000002', DEST_IDS.germany, 'Germany 3GB 7 Days', 3, 7, 649, 949),
  makePlan('p005-0003-4000-8000-000000000003', DEST_IDS.germany, 'Germany 5GB 14 Days', 5, 14, 949, 1399),
  makePlan('p005-0004-4000-8000-000000000004', DEST_IDS.germany, 'Germany 10GB 30 Days', 10, 30, 1599, 2299),

  // Portugal
  makePlan('p006-0001-4000-8000-000000000001', DEST_IDS.portugal, 'Portugal 1GB 1 Day', 1, 1, 299, 449),
  makePlan('p006-0002-4000-8000-000000000002', DEST_IDS.portugal, 'Portugal 3GB 7 Days', 3, 7, 549, 799),
  makePlan('p006-0003-4000-8000-000000000003', DEST_IDS.portugal, 'Portugal 5GB 14 Days', 5, 14, 849, 1199),
  makePlan('p006-0004-4000-8000-000000000004', DEST_IDS.portugal, 'Portugal 10GB 30 Days', 10, 30, 1399, 1999),

  // Netherlands
  makePlan('p007-0001-4000-8000-000000000001', DEST_IDS.netherlands, 'Netherlands 1GB 1 Day', 1, 1, 349, 499),
  makePlan('p007-0002-4000-8000-000000000002', DEST_IDS.netherlands, 'Netherlands 3GB 7 Days', 3, 7, 649, 949),
  makePlan('p007-0003-4000-8000-000000000003', DEST_IDS.netherlands, 'Netherlands 5GB 14 Days', 5, 14, 949, 1399),

  // UK
  makePlan('p008-0001-4000-8000-000000000001', DEST_IDS.uk, 'UK 1GB 1 Day', 1, 1, 349, 499),
  makePlan('p008-0002-4000-8000-000000000002', DEST_IDS.uk, 'UK 3GB 7 Days', 3, 7, 649, 949),
  makePlan('p008-0003-4000-8000-000000000003', DEST_IDS.uk, 'UK 5GB 14 Days', 5, 14, 999, 1449),
  makePlan('p008-0004-4000-8000-000000000004', DEST_IDS.uk, 'UK 10GB 30 Days', 10, 30, 1699, 2399),

  // Greece
  makePlan('p009-0001-4000-8000-000000000001', DEST_IDS.greece, 'Greece 1GB 1 Day', 1, 1, 349, 499),
  makePlan('p009-0002-4000-8000-000000000002', DEST_IDS.greece, 'Greece 3GB 7 Days', 3, 7, 599, 899),
  makePlan('p009-0003-4000-8000-000000000003', DEST_IDS.greece, 'Greece 5GB 14 Days', 5, 14, 899, 1299),

  // Turkey
  makePlan('p010-0001-4000-8000-000000000001', DEST_IDS.turkey, 'Turkey 1GB 1 Day', 1, 1, 299, 449),
  makePlan('p010-0002-4000-8000-000000000002', DEST_IDS.turkey, 'Turkey 3GB 7 Days', 3, 7, 499, 749),
  makePlan('p010-0003-4000-8000-000000000003', DEST_IDS.turkey, 'Turkey 5GB 14 Days', 5, 14, 799, 1149),
  makePlan('p010-0004-4000-8000-000000000004', DEST_IDS.turkey, 'Turkey 10GB 30 Days', 10, 30, 1299, 1849),

  // Poland
  makePlan('p011-0001-4000-8000-000000000001', DEST_IDS.poland, 'Poland 1GB 1 Day', 1, 1, 299, 449),
  makePlan('p011-0002-4000-8000-000000000002', DEST_IDS.poland, 'Poland 3GB 7 Days', 3, 7, 499, 749),
  makePlan('p011-0003-4000-8000-000000000003', DEST_IDS.poland, 'Poland 5GB 14 Days', 5, 14, 799, 1149),

  // Czech Republic
  makePlan('p012-0001-4000-8000-000000000001', DEST_IDS.czech, 'Czech 1GB 1 Day', 1, 1, 299, 449),
  makePlan('p012-0002-4000-8000-000000000002', DEST_IDS.czech, 'Czech 3GB 7 Days', 3, 7, 549, 799),
  makePlan('p012-0003-4000-8000-000000000003', DEST_IDS.czech, 'Czech 5GB 14 Days', 5, 14, 849, 1199),

  // Austria
  makePlan('p013-0001-4000-8000-000000000001', DEST_IDS.austria, 'Austria 1GB 1 Day', 1, 1, 349, 499),
  makePlan('p013-0002-4000-8000-000000000002', DEST_IDS.austria, 'Austria 3GB 7 Days', 3, 7, 649, 949),
  makePlan('p013-0003-4000-8000-000000000003', DEST_IDS.austria, 'Austria 5GB 14 Days', 5, 14, 949, 1399),
  makePlan('p013-0004-4000-8000-000000000004', DEST_IDS.austria, 'Austria 10GB 30 Days', 10, 30, 1599, 2299),
];

export function getPlansForDestination(destinationId: string): MockPlan[] {
  return mockPlans.filter((plan) => plan.destination_id === destinationId);
}

export function getStartingPrice(destinationId: string): number {
  const plans = getPlansForDestination(destinationId);
  if (plans.length === 0) return 0;
  return Math.min(...plans.map((p) => p.retail_price_cents));
}
