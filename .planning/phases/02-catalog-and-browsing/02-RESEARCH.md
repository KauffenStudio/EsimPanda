# Phase 02: Catalog and Browsing - Research

**Researched:** 2026-04-19
**Domain:** React catalog UI — destination grid, plan browsing, filtering, comparison, device compatibility
**Confidence:** HIGH

## Summary

This phase builds the main browsing experience: a destination grid with photo cards, inline accordion expansion showing filtered plans, a comparison bottom sheet, and a device compatibility checker. All data comes from the existing Supabase `destinations` and `plans` tables (public RLS read access), with mock data used until real Supabase connection is established.

The existing codebase provides strong primitives: Card, Badge, Button, Input components; Bambu poses for all states; Motion for animations; Zustand for client state; and next-intl for translations. The browse page placeholder (`src/app/[locale]/browse/page.tsx`) is the entry point to replace.

**Primary recommendation:** Build a data layer (hooks + mock data) first, then destination grid with accordion, then plan cards with filtering, then comparison sheet, and finally the device compatibility module (static JSON + localStorage persistence).

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Search + popular grid layout: search bar at top, grid of popular European destinations below with photo cards
- Photo cards with overlay: real stock photos (iconic landmarks) as card background, flag + country name overlaid at bottom, "from X.XX" starting price
- Europe-wide regional plan featured at top: large card above country grid
- Destinations ordered by popularity (not alphabetical, not by region)
- Inline accordion expand: tapping a destination card expands plans below with smooth Motion animation (no separate destination page)
- Bambu empty state with suggestions for no-results
- Real stock photos from Unsplash/Pexels
- Plan cards: Data + Duration + Price front and center ("3GB . 14 days . 8.99")
- Vertical stack layout for plans within expanded accordion
- Auto-tag best value (lowest price-per-GB) and most popular (most popular duration)
- Direct to checkout (placeholder "Coming soon" for now)
- Plans sorted by price ascending, no sort toggle
- Horizontal chip filters for duration: "All", "24h", "7 days", "14 days", "30 days", "Semester (90d+)"
- Side-by-side bottom sheet comparison: long-press or compare checkbox selects 2-3 plans, sticky bottom bar appears
- Device compatibility check at checkout only (not on browse page)
- Device picker dropdown: brand + model from static JSON (~50 popular devices)
- Static JSON device list, updated manually
- Bambu error on incompatible device (non-blocking, "Browse anyway" option)
- Save device compatibility result in localStorage

### Claude's Discretion
- Exact photo selection for destination cards
- Comparison sheet column layout and which attributes to compare
- Search implementation details (debounce, fuzzy matching)
- Loading states during data fetch (Bambu loading pose)
- Desktop adaptation of accordion expand behavior
- Chip filter animation/transition style

### Deferred Ideas (OUT OF SCOPE)
None
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| CAT-01 | User can browse eSIM plans by destination country (Europe-first) | Destination grid with photo cards, search, popularity ordering, accordion expand to show plans |
| CAT-02 | User can filter plans by duration, data amount, and price | Horizontal chip filters for duration; plans already sorted by price ascending |
| CAT-03 | User can view multi-country/regional plans (e.g., Europe-wide) | Featured Europe-wide regional plan card at top of browse page |
| CAT-04 | User can compare 2-3 plans side by side | Long-press/checkbox selection + sticky bottom bar + comparison bottom sheet |
| DEL-04 | User can check device eSIM compatibility before purchasing | Device picker dropdown with static JSON list, localStorage persistence, Bambu error state |
</phase_requirements>

## Standard Stack

### Core (already installed)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js | 15.5.15 | App Router, RSC, route segments | Already in project |
| React | 19.1.0 | UI rendering | Already in project |
| motion | 12.38.0 | Animations (accordion, chips, sheets) | Already in project, import from "motion/react" |
| zustand | 5.0.12 | Client state (filters, comparison selection, device compat) | Already in project with persist middleware |
| @supabase/ssr | 0.10.2 | Data fetching from Supabase | Already in project |
| next-intl | 4.9.1 | i18n translations | Already in project |
| lucide-react | 1.8.0 | Icons (search, filter, check, x) | Already in project |
| zod | 4.3.6 | Schema validation for device list | Already in project |

### No New Dependencies Needed

This phase requires zero new packages. Everything is achievable with the existing stack:
- Search: native string matching with `toLowerCase().includes()` or simple fuzzy via splitting terms
- Accordion: `motion/react` AnimatePresence + height auto-animate
- Bottom sheet: `motion/react` drag gesture + backdrop
- Chip filters: styled buttons with zustand state
- Device compatibility: static JSON import + localStorage via zustand persist

## Architecture Patterns

### Recommended Project Structure
```
src/
├── app/[locale]/browse/
│   └── page.tsx                    # Main browse page (server component shell)
├── components/browse/
│   ├── destination-search.tsx      # Search bar with debounce
│   ├── destination-grid.tsx        # Photo card grid
│   ├── destination-card.tsx        # Individual destination photo card
│   ├── regional-plan-card.tsx      # Featured Europe-wide plan card
│   ├── plan-accordion.tsx          # Expanded plan list within destination
│   ├── plan-card.tsx               # Individual plan card (data/duration/price)
│   ├── duration-filter.tsx         # Horizontal chip filter row
│   ├── comparison-bar.tsx          # Sticky bottom "Compare (N)" bar
│   ├── comparison-sheet.tsx        # Bottom sheet with side-by-side comparison
│   └── device-compatibility/
│       ├── device-checker.tsx      # Brand + model picker UI
│       └── device-list.json        # Static compatible device list
├── hooks/
│   ├── use-destinations.ts         # Fetch destinations from Supabase (with mock fallback)
│   ├── use-plans.ts                # Fetch plans for a destination
│   └── use-device-compat.ts        # Device compatibility check + localStorage
├── stores/
│   ├── browse.ts                   # Browse state: search query, selected destination, filters
│   └── comparison.ts               # Comparison state: selected plan IDs (max 3)
└── lib/
    └── mock-data/
        ├── destinations.ts         # Mock destination data for development
        └── plans.ts                # Mock plan data for development
```

### Pattern 1: Zustand Store for Browse State
**What:** Single store managing search query, active destination expansion, and duration filter
**When to use:** All browse interactions (search, expand, filter)
**Example:**
```typescript
import { create } from 'zustand';

interface BrowseState {
  searchQuery: string;
  expandedDestination: string | null; // destination slug
  durationFilter: 'all' | '1' | '7' | '14' | '30' | '90';
  setSearch: (query: string) => void;
  toggleDestination: (slug: string) => void;
  setDurationFilter: (filter: BrowseState['durationFilter']) => void;
}

export const useBrowseStore = create<BrowseState>((set) => ({
  searchQuery: '',
  expandedDestination: null,
  durationFilter: 'all',
  setSearch: (query) => set({ searchQuery: query }),
  toggleDestination: (slug) =>
    set((state) => ({
      expandedDestination: state.expandedDestination === slug ? null : slug,
    })),
  setDurationFilter: (filter) => set({ durationFilter: filter }),
}));
```

### Pattern 2: Accordion with Motion AnimatePresence
**What:** Smooth height animation when expanding/collapsing plan list below a destination
**When to use:** Tapping a destination card
**Example:**
```typescript
import { AnimatePresence, motion } from 'motion/react';

function PlanAccordion({ isOpen, children }: { isOpen: boolean; children: React.ReactNode }) {
  return (
    <AnimatePresence initial={false}>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          style={{ overflow: 'hidden' }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

### Pattern 3: Comparison Selection Store with Persist
**What:** Track which plans are selected for comparison (max 3), persisted in session
**When to use:** Long-press or checkbox on plan cards
**Example:**
```typescript
import { create } from 'zustand';

interface ComparisonState {
  selectedPlanIds: string[];
  togglePlan: (id: string) => void;
  clearSelection: () => void;
}

export const useComparisonStore = create<ComparisonState>((set) => ({
  selectedPlanIds: [],
  togglePlan: (id) =>
    set((state) => {
      if (state.selectedPlanIds.includes(id)) {
        return { selectedPlanIds: state.selectedPlanIds.filter((p) => p !== id) };
      }
      if (state.selectedPlanIds.length >= 3) return state; // max 3
      return { selectedPlanIds: [...state.selectedPlanIds, id] };
    }),
  clearSelection: () => set({ selectedPlanIds: [] }),
}));
```

### Pattern 4: Mock Data with Supabase Query Shape
**What:** Mock data matching Supabase table shape for development without real connection
**When to use:** All data fetching hooks until real Supabase is connected
**Example:**
```typescript
// src/lib/mock-data/destinations.ts
export const mockDestinations = [
  {
    id: 'dest-fr',
    name: 'France',
    slug: 'france',
    iso_code: 'FR',
    region: 'europe',
    image_url: '/images/destinations/france.jpg',
    is_active: true,
    popularity: 1, // for ordering
  },
  // ... more destinations
];
```

### Pattern 5: Device Compatibility with Zustand Persist
**What:** Check device against static JSON, remember result in localStorage
**When to use:** Device compatibility checker (at checkout, but built in Phase 2)
**Example:**
```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface DeviceCompatState {
  brand: string | null;
  model: string | null;
  isCompatible: boolean | null;
  setBrand: (brand: string) => void;
  setModel: (model: string) => void;
  checkCompatibility: () => void;
}

export const useDeviceCompatStore = create<DeviceCompatState>()(
  persist(
    (set, get) => ({
      brand: null,
      model: null,
      isCompatible: null,
      setBrand: (brand) => set({ brand, model: null, isCompatible: null }),
      setModel: (model) => set({ model }),
      checkCompatibility: () => {
        const { brand, model } = get();
        // Check against imported static JSON
        const compatible = checkDevice(brand, model);
        set({ isCompatible: compatible });
      },
    }),
    { name: 'esim-panda-device-compat' }
  )
);
```

### Anti-Patterns to Avoid
- **Fetching plans for all destinations on page load:** Only fetch plans for the expanded destination (accordion pattern keeps it lazy)
- **Using separate pages for each destination:** CONTEXT.md explicitly says inline accordion, no page navigation
- **Adding a sort toggle:** Plans are always sorted by price ascending, no user control
- **Putting device check on browse page:** It goes at checkout only per decision
- **Using framer-motion import:** Must be `motion/react` (the project uses the `motion` package v12+)

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Animation orchestration | Custom CSS transitions for accordion | motion/react AnimatePresence + height auto | Handles mount/unmount animation, layout shifts |
| Client state management | React useState scattered across components | Zustand stores (browse, comparison) | Single source of truth, persist middleware for device compat |
| Debounced search | Custom setTimeout management | Simple useEffect with cleanup timeout (300ms) | Standard pattern, no library needed for this simple case |
| Bottom sheet | Custom absolute-positioned div | motion/react drag constraints + backdrop | Handles drag-to-dismiss, spring physics, accessibility |
| Device list maintenance | Database table for devices | Static JSON file imported at build time | ~50 devices, rarely changes, zero API calls |

## Common Pitfalls

### Pitfall 1: Accordion Height Animation Jank
**What goes wrong:** Animating `height: 0` to `height: auto` causes layout thrashing
**Why it happens:** Browser can't interpolate to `auto`
**How to avoid:** Use motion/react which handles this internally with `animate={{ height: 'auto' }}` — it measures the content height and animates to a concrete pixel value
**Warning signs:** Jerky expansion or content clipping during animation

### Pitfall 2: Search Re-rendering Entire Grid
**What goes wrong:** Every keystroke causes full grid re-render
**Why it happens:** Search state change triggers all destination cards to re-render
**How to avoid:** Debounce search input (300ms), use zustand selector to only subscribe to filtered results, memoize destination cards with React.memo
**Warning signs:** Visible lag when typing in search

### Pitfall 3: Image Loading Causing Layout Shift
**What goes wrong:** Destination photos load asynchronously causing cards to jump
**Why it happens:** No explicit dimensions set on image containers
**How to avoid:** Use Next.js Image component with explicit width/height or aspect-ratio CSS on the card container; use placeholder="blur" for progressive loading
**Warning signs:** CLS (Cumulative Layout Shift) visible when scrolling

### Pitfall 4: Comparison State Lost on Navigation
**What goes wrong:** User selects plans for comparison, navigates away, selections lost
**Why it happens:** Component state resets on unmount
**How to avoid:** Keep comparison state in Zustand (not persisted to localStorage since it's session-only, but survives component unmount)
**Warning signs:** Empty comparison bar after back-navigation

### Pitfall 5: Bottom Sheet Blocks Scroll on Mobile
**What goes wrong:** When comparison sheet is open, background page scrolls
**Why it happens:** Missing body scroll lock
**How to avoid:** When sheet is open, set `document.body.style.overflow = 'hidden'`; restore on close
**Warning signs:** Page scrolling visible behind the sheet

### Pitfall 6: Mock Data Shape Drift
**What goes wrong:** Mock data doesn't match actual Supabase table shape, breaks when switching to real data
**Why it happens:** Mock data defined without referencing the schema
**How to avoid:** Type mock data with the same TypeScript interface derived from the DB schema; include all fields including `id`, `synced_at`, etc.
**Warning signs:** TypeScript errors when removing mock data layer

## Code Examples

### Destination Card with Photo Overlay
```typescript
import Image from 'next/image';
import { Card } from '@/components/ui/card';

interface DestinationCardProps {
  name: string;
  slug: string;
  isoCode: string;
  imageUrl: string;
  startingPrice: number; // cents
  isExpanded: boolean;
  onTap: () => void;
}

export function DestinationCard({ name, isoCode, imageUrl, startingPrice, onTap }: DestinationCardProps) {
  return (
    <Card variant="elevated" onClick={onTap} className="relative overflow-hidden aspect-[4/3] cursor-pointer">
      <Image
        src={imageUrl}
        alt={name}
        fill
        className="object-cover"
        sizes="(max-width: 768px) 50vw, 33vw"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-3 flex items-center gap-2">
        <span className="text-lg">{getFlagEmoji(isoCode)}</span>
        <div>
          <p className="text-white font-bold text-sm">{name}</p>
          <p className="text-white/80 text-xs">from {formatPrice(startingPrice)}</p>
        </div>
      </div>
    </Card>
  );
}

function getFlagEmoji(isoCode: string): string {
  return isoCode
    .toUpperCase()
    .split('')
    .map((c) => String.fromCodePoint(127397 + c.charCodeAt(0)))
    .join('');
}
```

### Duration Chip Filter Row
```typescript
import { motion } from 'motion/react';
import { useBrowseStore } from '@/stores/browse';

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: '1', label: '24h' },
  { key: '7', label: '7 days' },
  { key: '14', label: '14 days' },
  { key: '30', label: '30 days' },
  { key: '90', label: '90+ days' },
] as const;

export function DurationFilter() {
  const { durationFilter, setDurationFilter } = useBrowseStore();

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {FILTERS.map(({ key, label }) => (
        <button
          key={key}
          onClick={() => setDurationFilter(key)}
          className={`relative px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
            durationFilter === key
              ? 'text-white'
              : 'text-gray-600 dark:text-gray-400 bg-surface dark:bg-surface-dark'
          }`}
        >
          {durationFilter === key && (
            <motion.div
              layoutId="active-chip"
              className="absolute inset-0 bg-accent rounded-full"
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            />
          )}
          <span className="relative z-10">{label}</span>
        </button>
      ))}
    </div>
  );
}
```

### Plan Card with Auto-Badges
```typescript
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface PlanCardProps {
  id: string;
  dataGb: number;
  durationDays: number;
  retailPriceCents: number;
  isBestValue: boolean;
  isMostPopular: boolean;
  onSelect: () => void;
}

export function PlanCard({ dataGb, durationDays, retailPriceCents, isBestValue, isMostPopular, onSelect }: PlanCardProps) {
  return (
    <Card variant="flat" onClick={onSelect} className="p-4 flex items-center justify-between">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <span className="font-bold text-lg">{dataGb}GB</span>
          <span className="text-gray-400">·</span>
          <span className="text-gray-600 dark:text-gray-300">{formatDuration(durationDays)}</span>
        </div>
        <div className="flex gap-1">
          {isBestValue && <Badge variant="success">Best Value</Badge>}
          {isMostPopular && <Badge variant="info">Most Popular</Badge>}
        </div>
      </div>
      <span className="font-bold text-xl text-accent">{formatPrice(retailPriceCents)}</span>
    </Card>
  );
}
```

### Best Value / Most Popular Auto-Tagging Logic
```typescript
interface Plan {
  id: string;
  dataGb: number;
  durationDays: number;
  retailPriceCents: number;
}

export function tagPlans(plans: Plan[]) {
  if (plans.length === 0) return [];

  // Best value = lowest price per GB
  const withPricePerGb = plans.map((p) => ({
    ...p,
    pricePerGb: p.retailPriceCents / p.dataGb,
  }));
  const bestValueId = withPricePerGb.reduce((best, p) =>
    p.pricePerGb < best.pricePerGb ? p : best
  ).id;

  // Most popular = most common duration (or 14 days as default popular)
  const durationCounts = plans.reduce((acc, p) => {
    acc[p.durationDays] = (acc[p.durationDays] || 0) + 1;
    return acc;
  }, {} as Record<number, number>);
  const popularDuration = Object.entries(durationCounts)
    .sort(([, a], [, b]) => b - a)[0]?.[0];
  const mostPopularId = plans.find((p) => p.durationDays === Number(popularDuration))?.id;

  return plans.map((p) => ({
    ...p,
    isBestValue: p.id === bestValueId,
    isMostPopular: p.id === mostPopularId && p.id !== bestValueId, // don't double-badge
  }));
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| framer-motion package | motion package (import from "motion/react") | motion v11+ (2024) | Same API, new package name |
| Zustand v4 create() | Zustand v5 create() | 2024 | Slightly different TypeScript generics |
| Next.js pages router | Next.js App Router with RSC | Next 13+ (stable in 14/15) | Server components, new data fetching patterns |
| @supabase/auth-helpers-nextjs | @supabase/ssr | 2024 | Unified SSR helper |

## Open Questions

1. **Image hosting strategy**
   - What we know: Destination cards need real stock photos; Unsplash/Pexels are sources
   - What's unclear: Host in public/ folder, use external URLs, or put in Supabase Storage?
   - Recommendation: Use static images in `public/images/destinations/` for development; real hosting decision can be deferred since `image_url` in DB is a URL string either way

2. **Popularity ordering data source**
   - What we know: Destinations should be ordered by popularity
   - What's unclear: No `popularity` column exists in the DB schema currently
   - Recommendation: Add a `popularity_rank` integer column to destinations table (or handle via ordered mock data for now and add column in a migration)

3. **Regional plan data model**
   - What we know: Europe-wide plan spans 30+ countries, needs featured card
   - What's unclear: How is a multi-country plan stored? Current schema has `destination_id` as single FK
   - Recommendation: Add a `destinations_plans` junction table OR use a special "europe" destination slug with `region = 'europe-wide'`. Simplest: create a destination entry with name "Europe" and iso_code "EU" that the regional plans point to

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.4 + Testing Library React 16.3.2 |
| Config file | vitest.config.ts |
| Quick run command | `npm test -- --run` |
| Full suite command | `npm test` |

### Phase Requirements to Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| CAT-01 | Destination grid renders, search filters destinations | unit | `npx vitest run src/components/browse/__tests__/destination-grid.test.tsx` | No - Wave 0 |
| CAT-02 | Duration chip filter filters plans correctly | unit | `npx vitest run src/components/browse/__tests__/duration-filter.test.tsx` | No - Wave 0 |
| CAT-03 | Regional plan card renders for Europe-wide plan | unit | `npx vitest run src/components/browse/__tests__/regional-plan-card.test.tsx` | No - Wave 0 |
| CAT-04 | Comparison store manages max 3 selections, sheet renders | unit | `npx vitest run src/stores/__tests__/comparison.test.ts` | No - Wave 0 |
| DEL-04 | Device compat check against JSON, localStorage persist | unit | `npx vitest run src/hooks/__tests__/use-device-compat.test.ts` | No - Wave 0 |

### Sampling Rate
- **Per task commit:** `npx vitest run --reporter=verbose`
- **Per wave merge:** `npm test`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `src/components/browse/__tests__/destination-grid.test.tsx` — covers CAT-01
- [ ] `src/components/browse/__tests__/duration-filter.test.tsx` — covers CAT-02
- [ ] `src/components/browse/__tests__/regional-plan-card.test.tsx` — covers CAT-03
- [ ] `src/stores/__tests__/comparison.test.ts` — covers CAT-04
- [ ] `src/hooks/__tests__/use-device-compat.test.ts` — covers DEL-04
- [ ] `src/lib/mock-data/__tests__/tag-plans.test.ts` — covers auto-tagging logic

## Sources

### Primary (HIGH confidence)
- Project codebase: `package.json`, `vitest.config.ts`, `src/lib/esim/types.ts`, `supabase/migrations/00001_initial_schema.sql`
- Phase 1 UI spec: `.planning/phases/01-foundation-and-design-system/01-UI-SPEC.md`
- Phase 2 CONTEXT.md: All user decisions and code context

### Secondary (MEDIUM confidence)
- Motion library API knowledge (AnimatePresence, layoutId, drag) — based on training data for motion v11-12
- Zustand v5 patterns — based on training data, consistent with project usage in `src/stores/theme.ts`

### Tertiary (LOW confidence)
- None — all findings based on codebase inspection and established patterns

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all packages already in package.json, versions verified
- Architecture: HIGH — follows established project patterns (Zustand, Motion, next-intl)
- Pitfalls: HIGH — common React/animation pitfalls, well-documented in ecosystem

**Research date:** 2026-04-19
**Valid until:** 2026-05-19 (stable domain, no fast-moving dependencies)
