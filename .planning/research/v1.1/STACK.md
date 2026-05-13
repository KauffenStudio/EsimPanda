# Stack Research — v1.1 Live Data Cutover

**Domain:** Next.js 15 + Supabase RSC catalog cutover (mock → live)
**Researched:** 2026-05-13
**Confidence:** HIGH

## TL;DR

**No new runtime dependencies are required for v1.1.** The existing stack (Next 15 RSC + `@supabase/ssr` 0.10 + `@supabase/supabase-js` 2.103 + Vitest 4) covers every requirement of the cutover. The right answer to each of the four research questions is "use what's already installed, in a slightly different shape":

1. **Data fetching:** Direct `@supabase/ssr` server-component fetching with Next's `unstable_cache` (or `'use cache'` if opted in) — **do NOT add TanStack Query / SWR**.
2. **Image handling:** Add Pexels (already done) + a single `supabase.co` hostname pattern when/if Supabase Storage is used — **do NOT migrate Pexels URLs**.
3. **Test patterns:** Keep the existing `vi.mock('@/lib/supabase/server', ...)` chained-mock pattern already used in `lib/auth/__tests__/order-linking.test.ts` — **do NOT add msw / supabase-js-testing-helpers**.
4. **Search performance:** Keep client-side filter for the 226-row destination list — **no Postgres FTS / pg_trgm needed**. Plan-level filtering moves server-side because of `destination_id` lookup, but it's an indexed equality query, not full-text search.

The detail and rationale for each decision is below.

---

## Question 1 — Data Fetching Layer

### Decision: **No new library. Use RSC + `@supabase/ssr` directly. Add Next `unstable_cache` for catalog reads.**

### Rationale

The catalog is **mostly-static, read-heavy, low-cardinality** data:
- 226 destinations × ~12 plans each = ~2,812 rows total
- Updates happen via Celitech sync (nightly cron or webhook), not user actions
- Browse pages, destination detail pages, and the checkout server component are all server-rendered

This is the exact shape of data Next 15's server-component cache was designed for. TanStack Query and SWR solve a problem this app doesn't have: **client-side request deduplication, refetch-on-focus, optimistic mutations**. The catalog isn't mutated by users; it's read. Adding a client-side cache here means:

- Larger client bundle (~12kB gzipped for TanStack Query v5)
- A second cache to keep in sync with Next's RSC cache
- Boilerplate `<QueryClientProvider>` + `useQuery` wrappers
- Hydration complexity (server → client cache rehydration)

…to solve a problem already solved by Next's own cache primitives.

### What to do instead

**Server Components fetch directly. Wrap in `unstable_cache` for shared destination/plan reads.**

```typescript
// src/lib/catalog/destinations.ts
import { unstable_cache } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

export const getDestinations = unstable_cache(
  async () => {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('destinations')
      .select('id, name, slug, iso_code, region, image_url, popularity_rank, region_bucket')
      .eq('is_active', true)
      .order('popularity_rank', { ascending: true });
    if (error) throw error;
    return data;
  },
  ['destinations:all'],
  { revalidate: 3600, tags: ['destinations'] }, // 1h TTL, tag-based invalidation
);

export const getPlansForDestination = unstable_cache(
  async (destinationId: string) => {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('plans')
      .select('*')
      .eq('destination_id', destinationId)
      .eq('is_active', true)
      .order('retail_price_cents', { ascending: true });
    if (error) throw error;
    return data ?? [];
  },
  ['plans:by-destination'],
  { revalidate: 3600, tags: ['plans'] },
);
```

After the Celitech sync writes new rows, call `revalidateTag('destinations')` / `revalidateTag('plans')` from the sync route to bust the cache.

### About the existing `use-destinations` / `use-plans` hooks

Those hooks return synchronous results today because they read `mockDestinations` directly. Two viable paths:

**Path A (recommended): Convert callers to RSC, delete the hooks.**
`browse/page.tsx`, the destination detail page, and `comparison-sheet`'s server-side equivalents become `async` Server Components that call `getDestinations()` / `getPlansForDestination()` directly. The `searchQuery` filter (currently in `useBrowseStore`) stays client-side — pass the full destinations list down as a prop, filter on the client where Zustand lives. This preserves the instant-search UX (no network roundtrip per keystroke) while keeping data-fetch on the server.

**Path B (only if a caller genuinely needs client-side fetching):** Keep the hook signature but switch the body to `useEffect` + `fetch('/api/destinations')` with a thin Route Handler that calls the same `getDestinations()`. No library needed; React 19's `use(promise)` + Suspense covers loading states. Avoid this unless a concrete UI needs it — the browse page should be RSC.

### Confidence

HIGH — verified `unstable_cache` is stable and current via Next.js 15/16 docs (May 2026). `'use cache'` directive (Next 15.2+) is a stylistic alternative; either works. Both ship in current `next@15.5.15`.

---

## Question 2 — Image Handling for Destinations

### Decision: **Reuse existing `remotePatterns`. Pexels stays. Add Supabase Storage hostname only if you actually upload images there.**

### Rationale

`destinations.image_url` in the mock layer points to `https://images.pexels.com/photos/...` with a query-string transform. The backfill script copies these exact URLs into the Supabase `destinations.image_url` column. After the cutover, `<Image src={destination.image_url}>` still loads from `images.pexels.com` — **the URL host doesn't change, only the storage location of the URL string changes**. Existing `next.config.ts` already whitelists this host:

```typescript
// next.config.ts (current)
images: {
  remotePatterns: [
    { protocol: 'https', hostname: 'images.unsplash.com' },
    { protocol: 'https', hostname: 'images.pexels.com' },
  ],
}
```

This continues to work unchanged. No upgrades, no new packages.

### When to add Supabase Storage

Only if the product later needs:
- User-uploaded images (avatars, custom destination art)
- Image variants Pexels can't serve (cropped, watermarked, panda-overlay versions)
- Pexels rate-limit / TOS concerns at scale

If/when that happens, append one entry:

```typescript
{ protocol: 'https', hostname: '<project-ref>.supabase.co', pathname: '/storage/v1/object/public/**' }
```

…and upload via `supabase.storage.from('destinations').upload(...)`. Out of scope for v1.1. The mock URLs are already CDN-served by Pexels with the right transform params.

### Confidence

HIGH — verified current `remotePatterns` syntax in Next.js docs (`docs/app/api-reference/components/image`, fetched 2026-05-13). Object form is current; `new URL()` form also works in Next 15.5+ but adds nothing here.

---

## Question 3 — Test Patterns for Supabase Mocking

### Decision: **Reuse the existing `vi.mock('@/lib/supabase/server', ...)` chained-mock pattern. Extract a shared factory once you have ≥3 catalog tests using it. Do NOT add msw or supabase-js-testing-helpers.**

### Rationale

The codebase already has a working pattern at `src/lib/auth/__tests__/order-linking.test.ts`:

```typescript
const mockSelect = vi.fn();
const mockIs = vi.fn().mockReturnValue({ select: mockSelect });
const mockEq = vi.fn().mockReturnValue({ is: mockIs });
const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq });
const mockFrom = vi.fn().mockReturnValue({ update: mockUpdate });

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockResolvedValue({ from: mockFrom }),
}));
```

This is the right approach because:

1. **It mocks the seam the codebase already has** (`@/lib/supabase/server` → `createClient()` returning a `from`-fluent client). New v1.1 modules (`getDestinations`, `getPlansForDestination`, `validateCoupon`, `lib/checkout/pricing`) will hit the same seam.
2. **It is library-free.** Vitest's `vi.mock` is already in the toolchain (`vitest@4.1.4`).
3. **It tests behaviour at the right boundary.** The catalog functions are thin wrappers over Supabase's query builder; the test asserts "we called `.from('destinations').select('…').eq('is_active', true).order('popularity_rank', { ascending: true })` and returned the data". That's the contract.

### Why not msw

`msw` intercepts at the HTTP layer. The Supabase JS client builds HTTP requests with auth headers, RLS context, PostgREST query strings — mocking that surface forces you to either (a) intercept fully-formed PostgREST URLs (brittle, breaks on Supabase SDK updates) or (b) accept any URL and return canned JSON (no better than mocking `createClient`, plus a 30kB dependency). msw shines for testing against external HTTP APIs you don't own; for Supabase calls in unit/integration tests, `vi.mock` of the client is simpler and more accurate.

### Why not supabase-js-testing-helpers / similar

No first-party Supabase testing helper exists. Third-party packages (`supabase-js-testing-helpers`, `vitest-mock-supabase`, etc.) are sparsely maintained, sub-1k weekly downloads, no Context7 entries. Adding one means owning its bugs. Don't.

### Shared factory (recommended once you have ≥3 catalog tests)

```typescript
// src/test-utils/supabase-mock.ts
import { vi } from 'vitest';

export function createSupabaseQueryMock<T = unknown>(result: { data: T; error: null } | { data: null; error: { message: string } }) {
  const terminal = vi.fn().mockResolvedValue(result);
  const proxy: any = new Proxy(
    { then: undefined },
    {
      get: (_, prop) => {
        if (prop === 'then') return terminal().then.bind(terminal());
        return vi.fn().mockReturnValue(proxy);
      },
    },
  );
  return { from: vi.fn().mockReturnValue(proxy), __terminal: terminal };
}
```

Use it as:

```typescript
const { from, __terminal } = createSupabaseQueryMock({ data: [mockDest1, mockDest2], error: null });
vi.mock('@/lib/supabase/server', () => ({ createClient: vi.fn().mockResolvedValue({ from }) }));
```

The Proxy lets you chain `.select().eq().order()` in any combination without rebuilding the mock per test. Add this only when the chain-by-hand pattern starts duplicating. Don't pre-build it — YAGNI.

### Mock-data fixtures

Keep `src/lib/mock-data/destinations.ts` and `src/lib/mock-data/plans.ts` **as test fixtures only** after the cutover. Re-export them from `src/test-utils/fixtures/` so production code never imports them. They're already typed (`MockDestination`, `MockPlan`) and shaped to match the Supabase row shape — perfect for fixture reuse.

### Confidence

HIGH — pattern verified in existing codebase (`order-linking.test.ts`); Vitest `vi.mock` is the de-facto standard for this kind of module mocking; absence of a mature Supabase mock library is verified via npm registry weekly-downloads scan (May 2026).

---

## Question 4 — Search Performance

### Decision: **Keep client-side filtering for destinations. Do NOT add Postgres full-text search or pg_trgm.**

### Rationale

- **Dataset:** 226 destinations. Total payload at ~150 bytes per destination ≈ 35kB JSON uncompressed, ~7–10kB gzipped over the wire.
- **Query shape:** `destination.name.toLowerCase().includes(query)` — substring match, no ranking, no stemming.
- **Latency target:** Instant (filter on keystroke).

Sending all 226 destinations once on initial page load, then filtering in-memory in the browser is **objectively faster** than a server-side full-text search round-trip per keystroke. Postgres FTS / `pg_trgm` is for: thousands-to-millions of rows, multi-field weighted ranking, fuzzy matching, language-aware stemming. None of those apply at 226 destinations.

The current `useDestinations` hook's filter logic is correct; only the data source changes (Supabase fetch in the parent RSC, passed as prop instead of imported from mock).

### When to revisit

- Destination count exceeds ~1,000 (unlikely — covers world's countries already)
- Search needs fuzzy match ("portgal" → Portugal) — at that point consider `pg_trgm` for trigram similarity
- Multi-language search (PT users typing "frança") — at that point consider an i18n alias table or `pg_trgm` on a `search_aliases` column

For v1.1, none of these are in scope.

### Plan-level queries — different story

`getPlansForDestination(destinationId)` runs on every destination-detail page. **This is a server-side equality query**, not a search:

```sql
SELECT * FROM plans WHERE destination_id = $1 AND is_active = true ORDER BY retail_price_cents;
```

Schema requirement: ensure `plans.destination_id` has an index. If `plans (destination_id, is_active)` composite index exists, the query is sub-millisecond at 2,812 rows. Confirm in the migration; add if missing. This is a Supabase schema concern, not a stack-library concern.

### Confidence

HIGH — performance math is straightforward at this dataset size; pattern matches how Airalo, Holafly, and similar competitors structure their destination pickers (client-side filter on small destination list, server-side fetch on plans).

---

## Stack Additions Summary

| Need | Decision | Library to Install | Version |
|------|----------|-------------------|---------|
| Server-side cache for catalog reads | Use Next built-in | none | uses `next@15.5.15` |
| Tag-based revalidation after Celitech sync | Use Next built-in | none | uses `next/cache.revalidateTag` |
| Client-side data fetching / cache | Not needed | none | — |
| Image host whitelist (Pexels) | Already configured | none | — |
| Supabase Storage hostname | Not needed for v1.1 | none | — |
| Supabase client mocking in tests | Use existing `vi.mock` pattern | none | uses `vitest@4.1.4` |
| Shared mock factory | Optional, in-repo utility | none | — |
| Destination search | Client-side filter (current) | none | — |
| Plans by destination query | Server-side, indexed equality | none | uses `@supabase/ssr@0.10.2` |

**Net new dependencies: zero.**

## Version Health Check (existing deps already in package.json)

| Package | Installed | Latest (May 2026) | Status |
|---------|-----------|-------------------|--------|
| `next` | 15.5.15 | 15.5.x / 16.x available | HEALTHY — 15.5 has stable App Router, `unstable_cache`, `revalidateTag`. No upgrade required for v1.1. |
| `react` / `react-dom` | 19.1.0 | 19.1.x | HEALTHY |
| `@supabase/ssr` | 0.10.2 | 0.10.x | HEALTHY — current line for Next 15 App Router |
| `@supabase/supabase-js` | 2.103.3 | 2.103.x | HEALTHY |
| `vitest` | 4.1.4 | 4.1.x | HEALTHY — `vi.mock` API stable |
| `zustand` | 5.0.12 | 5.0.x | HEALTHY — keeps `useBrowseStore` for client-side filter state |
| `zod` | 4.3.6 | 4.x | HEALTHY — use for Supabase row schema validation at the catalog boundary if desired |

No upgrades required by v1.1. (The roadmap may still choose to bump for unrelated reasons.)

## What NOT to Add for v1.1

| Library | Why Avoid for This Milestone |
|---------|------------------------------|
| `@tanstack/react-query` (v5) | The v1.0 STACK.md recommended it but it was never installed and the cutover doesn't need it. The catalog is server-rendered. Adding TanStack Query now means a ~12kB client bundle increase, a second cache to reason about alongside Next's RSC cache, and `<QueryClientProvider>` plumbing — all to solve a problem the app doesn't have. If a future milestone introduces client-side mutations with optimistic UI (e.g., live usage refresh on the dashboard), revisit then. |
| `swr` | Same reasoning as TanStack Query. Smaller (~4kB) but still solving the wrong problem at v1.1 scope. |
| `msw` | Wrong abstraction level for Supabase tests. See Question 3 above. |
| `supabase-js-testing-helpers` and similar | Unmaintained, low-trust, adds dependency surface for no measurable testability gain over `vi.mock`. |
| `prisma` / `drizzle-orm` | The v1.0 stack already rejected Prisma. `@supabase/ssr`'s query builder + raw SQL via `supabase.rpc()` covers all v1.1 needs. Adding an ORM mid-project is a multi-week refactor with no v1.1 benefit. |
| `pg_trgm` / Postgres full-text search | Overkill for 226-row destination search. See Question 4. |
| Supabase Storage SDK usage | Not needed — image URLs remain Pexels-hosted. Add only if the product later needs user-uploaded or transformed images. |
| New testing libraries (`vitest-mock-extended`, `@vitest/spy`, etc.) | The existing pattern works. Don't add tooling pre-emptively. |

## Integration Points with Existing Stack

| Existing module | v1.1 change | New dependency? |
|-----------------|-------------|-----------------|
| `src/lib/supabase/server.ts` | Unchanged. Catalog functions call `createClient()` here. | No |
| `src/lib/mock-data/destinations.ts` | Reclassified as test fixture. Re-export from `src/test-utils/fixtures/`. | No |
| `src/lib/mock-data/plans.ts` | Same — test fixture only. | No |
| `src/hooks/use-destinations.ts` | Either deleted (move to RSC) or rewrites to consume props from server-fetched data. Filter logic stays client-side via `useBrowseStore`. | No |
| `src/hooks/use-plans.ts` | Same path — likely deleted in favour of RSC server fetch on destination detail page. | No |
| `src/lib/checkout/pricing.ts` | Rewritten to query Supabase instead of `mockPlans`. Same `vi.mock` test pattern. | No |
| `src/app/api/checkout/validate-coupon/route.ts` | Rewritten to look up real plan from Supabase. | No |
| `next.config.ts` | Unchanged. `images.pexels.com` already whitelisted. | No |
| Celitech sync route (existing, in `src/lib/esim/sync.ts` per tests) | Add `revalidateTag('destinations')` + `revalidateTag('plans')` after successful sync. | No |

## WhatsApp Removal — Stack Implications

None. The WhatsApp support button (`src/components/layout/whatsapp-button.tsx` and its test) is pure presentational code with no external SDK. Deleting the component, its imports, any layout slot it occupied, and its `.test.tsx` is a code-removal task only. **No dependencies need to be removed from `package.json`.** (Confirmed by grep — no `whatsapp` package, no chat SDK in dependencies.)

## Installation

```bash
# Nothing. v1.1 introduces no new dependencies.
```

## Sources

- Next.js Image / `remotePatterns` docs — https://nextjs.org/docs/app/api-reference/components/image (verified 2026-05-13, HIGH confidence)
- Next.js `unstable_cache` and `revalidateTag` (App Router caching) — HIGH confidence, documented in `next@15.5` (installed) and current 16.x docs
- Existing codebase pattern: `src/lib/auth/__tests__/order-linking.test.ts` — proven `vi.mock('@/lib/supabase/server')` chain pattern (HIGH confidence, verified by reading file)
- Existing codebase: `src/lib/supabase/server.ts` — confirmed `createClient` async server client (HIGH confidence)
- Existing codebase: `next.config.ts` — confirmed `images.pexels.com` already whitelisted (HIGH confidence)
- v1.0 STACK.md (`.planning/research/STACK.md`) — baseline for what's already validated (HIGH confidence)
- Supabase `@supabase/ssr` 0.10.x — current line for App Router, no breaking changes vs installed 0.10.2 (HIGH confidence)

---
*Stack research for: v1.1 Live Data Cutover + WhatsApp removal*
*Researched: 2026-05-13*
*Net result: zero new dependencies; reuse Next 15 RSC + `@supabase/ssr` + Vitest patterns already in place.*
