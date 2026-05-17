import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── Supabase mock ────────────────────────────────────────────────────────────
// A thenable query builder: every chained method returns the same builder, and
// the builder resolves to whatever `result` is set to. `.maybeSingle()` resolves
// immediately. getCatalog issues two distinct `.from()` calls (destinations then
// plans) — `fromResults` lets each call resolve independently in order.

type QueryResult = { data: unknown; error: unknown };

let fromResults: QueryResult[] = [];
let fromCallIndex = 0;
const fromTables: string[] = [];

function makeBuilder(result: QueryResult) {
  const builder: Record<string, unknown> = {};
  const chain = () => builder;
  for (const m of ['select', 'eq', 'in', 'order']) {
    builder[m] = vi.fn(chain);
  }
  builder.maybeSingle = vi.fn(() => Promise.resolve(result));
  // Make the builder itself awaitable (resolves the terminal query).
  builder.then = (resolve: (v: QueryResult) => unknown) => resolve(result);
  return builder;
}

const mockFrom = vi.fn((table: string) => {
  fromTables.push(table);
  const result = fromResults[fromCallIndex] ?? { data: [], error: null };
  fromCallIndex += 1;
  return makeBuilder(result);
});

// db/destinations.ts uses a cookieless anon client from `@supabase/supabase-js`
// (catalog is public-read; required for build-time `generateStaticParams`).
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({ from: mockFrom })),
}));

function setQueryResults(...results: QueryResult[]) {
  fromResults = results;
  fromCallIndex = 0;
  fromTables.length = 0;
}

beforeEach(() => {
  vi.clearAllMocks();
  fromResults = [];
  fromCallIndex = 0;
  fromTables.length = 0;
});

// ── Helpers ──────────────────────────────────────────────────────────────────
function destRow(over: Partial<Record<string, unknown>> = {}) {
  return {
    id: 'dest-1',
    name: 'France',
    slug: 'france',
    iso_code: 'FR',
    region: 'country',
    region_bucket: 'europe',
    image_url: null,
    popularity_rank: 1,
    is_active: true,
    ...over,
  };
}

function planRow(over: Partial<Record<string, unknown>> = {}) {
  return {
    id: 'plan-1',
    destination_id: 'dest-1',
    data_gb: 5,
    retail_price_cents: 1199,
    is_active: true,
    ...over,
  };
}

describe('listActiveDestinations', () => {
  it('Test 1 (INF-07): queries destinations with is_active + popularity order; returns data; [] on error', async () => {
    const { listActiveDestinations } = await import('../destinations');

    // Success path.
    setQueryResults({ data: [destRow()], error: null });
    const rows = await listActiveDestinations();
    expect(mockFrom).toHaveBeenCalledWith('destinations');
    const builder = mockFrom.mock.results[0].value as Record<string, ReturnType<typeof vi.fn>>;
    expect(builder.eq).toHaveBeenCalledWith('is_active', true);
    expect(builder.order).toHaveBeenCalledWith('popularity_rank', { ascending: true });
    expect(rows).toEqual([destRow()]);

    // Error path → [].
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    setQueryResults({ data: null, error: { message: 'boom' } });
    const onError = await listActiveDestinations();
    expect(onError).toEqual([]);
    consoleSpy.mockRestore();
  });
});

describe('getDestinationBySlug', () => {
  it('Test 2 (INF-07): returns null when maybeSingle yields 0 rows; returns the row when present', async () => {
    const { getDestinationBySlug } = await import('../destinations');

    setQueryResults({ data: null, error: null });
    expect(await getDestinationBySlug('nope')).toBeNull();

    setQueryResults({ data: destRow(), error: null });
    expect(await getDestinationBySlug('france')).toEqual(destRow());
  });
});

describe('getPlanById', () => {
  it('Test 3 (INF-07): returns null when maybeSingle yields 0 rows', async () => {
    const { getPlanById } = await import('../destinations');

    setQueryResults({ data: null, error: null });
    expect(await getPlanById('nope')).toBeNull();

    setQueryResults({ data: planRow(), error: null });
    expect(await getPlanById('plan-1')).toEqual(planRow());
  });
});

describe('getCatalog — curation filter (CAT-05)', () => {
  it('Test 4: excludes popularity_rank=9999 AND region_bucket=null; includes curated rows', async () => {
    const { getCatalog } = await import('../destinations');

    const uncurated = destRow({
      id: 'd-uncurated',
      slug: 'uncurated',
      popularity_rank: 9999,
      region_bucket: null,
    });
    const byRank = destRow({ id: 'd-rank', slug: 'rank', popularity_rank: 5, region_bucket: null });
    const byBucket = destRow({
      id: 'd-bucket',
      slug: 'bucket',
      popularity_rank: 9999,
      region_bucket: 'europe',
    });

    setQueryResults(
      { data: [uncurated, byRank, byBucket], error: null },
      { data: [], error: null },
    );
    const catalog = await getCatalog();

    const slugs = [...catalog.destinations, ...catalog.regionalPlans].map((d) => d.slug);
    expect(slugs).not.toContain('uncurated');
    expect(slugs).toContain('rank');
    expect(slugs).toContain('bucket');
  });
});

describe('getCatalog — regional vs country partition (INF-07)', () => {
  it('Test 5: regional buckets go to regionalPlans, everything else to destinations', async () => {
    const { getCatalog } = await import('../destinations');

    const country = destRow({ id: 'd-fr', slug: 'france', region_bucket: 'europe' });
    const euWide = destRow({ id: 'd-eu', slug: 'europe', region_bucket: 'europe-wide' });
    const asWide = destRow({ id: 'd-as', slug: 'asia', region_bucket: 'asia-wide' });
    const global = destRow({ id: 'd-gl', slug: 'global', region_bucket: 'global' });

    setQueryResults(
      { data: [country, euWide, asWide, global], error: null },
      { data: [], error: null },
    );
    const catalog = await getCatalog();

    expect(catalog.destinations.map((d) => d.slug)).toEqual(['france']);
    expect(catalog.regionalPlans.map((d) => d.slug).sort()).toEqual([
      'asia',
      'europe',
      'global',
    ]);
  });
});

describe('getCatalog — pricing enrichment (INF-07)', () => {
  it('Test 6: startingPriceCents = min retail; bestDiscountPercent = max discount; 0 when no plans', async () => {
    const { getCatalog } = await import('../destinations');

    const withPlans = destRow({ id: 'd-fr', slug: 'france', region_bucket: 'europe' });
    const withoutPlans = destRow({ id: 'd-es', slug: 'spain', region_bucket: 'europe' });

    setQueryResults(
      { data: [withPlans, withoutPlans], error: null },
      {
        data: [
          planRow({ id: 'p1', destination_id: 'd-fr', data_gb: 1, retail_price_cents: 449 }),
          planRow({ id: 'p2', destination_id: 'd-fr', data_gb: 5, retail_price_cents: 1199 }),
        ],
        error: null,
      },
    );
    const catalog = await getCatalog();

    const fr = catalog.destinations.find((d) => d.slug === 'france')!;
    const es = catalog.destinations.find((d) => d.slug === 'spain')!;

    // Cheapest of 449 / 1199.
    expect(fr.startingPriceCents).toBe(449);
    // 1GB plan yields 0% discount; 5GB plan yields a positive discount → max > 0.
    expect(fr.bestDiscountPercent).toBeGreaterThan(0);

    // No plans → both 0.
    expect(es.startingPriceCents).toBe(0);
    expect(es.bestDiscountPercent).toBe(0);
  });
});

describe('getCatalog — error flag (UXD-06 support)', () => {
  it('Test 7: error:true when destinations query errors; error:false on success', async () => {
    const { getCatalog } = await import('../destinations');

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    setQueryResults({ data: null, error: { message: 'destinations down' } });
    const errored = await getCatalog();
    expect(errored.error).toBe(true);
    expect(errored.destinations).toEqual([]);
    expect(errored.regionalPlans).toEqual([]);
    consoleSpy.mockRestore();

    setQueryResults(
      { data: [destRow({ region_bucket: 'europe' })], error: null },
      { data: [], error: null },
    );
    const ok = await getCatalog();
    expect(ok.error).toBe(false);
  });
});
