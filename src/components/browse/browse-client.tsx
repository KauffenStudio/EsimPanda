'use client';

// Client boundary for the browse grid. Receives the catalog as props from the
// browse RSC (server fetch via getCatalog) and owns all interactivity: search
// filter, region pills, Framer Motion, comparison store.
//
// Search is intentionally in-memory (.includes() over the props array) — at
// ~226 rows a server round-trip per keystroke is an anti-feature (Pitfall 13).
// Do NOT add a useEffect fetch or a Supabase call here: data arrives entirely
// as props so the first client render matches the server render (Pitfall 4).

import { memo, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useTranslations } from 'next-intl';
import { useBrowseStore } from '@/stores/browse';
import type { CatalogDestination } from '@/lib/db/destinations';
import { DestinationSearch } from './destination-search';
import { DestinationCard } from './destination-card';
import { RegionalPlanCard } from './regional-plan-card';
import { ComparisonBar } from './comparison-bar';
import { ComparisonSheet } from './comparison-sheet';

const MemoizedDestinationCard = memo(DestinationCard);

const REGION_ORDER = [
  'europe',
  'asia',
  'north-america',
  'south-america',
  'middle-east',
  'oceania',
  'africa',
] as const;

const regionLabels: Record<string, string> = {
  europe: 'Europe',
  asia: 'Asia',
  'north-america': 'North America',
  'south-america': 'South America',
  'middle-east': 'Middle East',
  oceania: 'Oceania',
  africa: 'Africa',
};

interface RegionGroup {
  region: string;
  label: string;
  items: CatalogDestination[];
}

// Post-Phase-10 the live `region` column holds Celitech's 'country'/'region'
// classifier — the UI groups by `region_bucket` instead.
function groupByRegion(destinations: CatalogDestination[]): RegionGroup[] {
  const groups: RegionGroup[] = [];
  for (const region of REGION_ORDER) {
    const items = destinations.filter((d) => d.region_bucket === region);
    if (items.length > 0) {
      groups.push({ region, label: regionLabels[region] ?? region, items });
    }
  }
  return groups;
}

function CountryGrid({ items }: { items: CatalogDestination[] }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
      {items.map((dest, index) => (
        <motion.div
          key={dest.slug}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.25,
            delay: Math.min(index, 5) * 0.03,
            ease: 'easeOut',
          }}
        >
          <MemoizedDestinationCard
            name={dest.name}
            slug={dest.slug}
            isoCode={dest.iso_code}
            imageUrl={dest.image_url}
            destinationId={dest.id}
            startingPriceCents={dest.startingPriceCents}
          />
        </motion.div>
      ))}
    </div>
  );
}

interface BrowseClientProps {
  destinations: CatalogDestination[];
  regionalPlans: CatalogDestination[];
  error: boolean;
}

export function BrowseClient({ destinations, regionalPlans, error }: BrowseClientProps) {
  const t = useTranslations();
  const searchQuery = useBrowseStore((state) => state.searchQuery);
  const isSearching = searchQuery.trim().length > 0;

  // In-memory search filter — synchronous, hydration-safe, no network round-trip.
  const filtered = useMemo(
    () =>
      destinations.filter((d) =>
        d.name.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
    [destinations, searchQuery],
  );

  const groups = useMemo(() => groupByRegion(filtered), [filtered]);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);

  // Derive the active region from state directly (no useEffect) so the first
  // render already lands on the right region.
  const activeGroup = groups.find((g) => g.region === selectedRegion) ?? groups[0];

  return (
    <div className="flex flex-col gap-6">
      {/* 11-02: error banner renders here when error === true */}
      {error ? null : null}

      <DestinationSearch />
      <RegionalPlanCard regionalPlans={regionalPlans} />

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16">
          <p className="text-gray-600 dark:text-gray-400 text-center font-semibold">
            {t('browse.noResults', { query: searchQuery })}
          </p>
          <p className="text-gray-400 text-center text-sm mt-1">
            {t('browse.noResultsSuggestion')}
          </p>
        </div>
      ) : isSearching ? (
        // While the user is typing, ignore the region tabs and show a flat
        // grid of every destination matching the query.
        <CountryGrid items={filtered} />
      ) : (
        <div className="flex flex-col gap-4">
          {/* Region pills — horizontal scroll on small screens, wrap on wider ones */}
          <div
            role="tablist"
            aria-label="Regions"
            className="flex gap-2 overflow-x-auto md:flex-wrap pb-1 -mx-4 px-4 md:mx-0 md:px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {groups.map((group) => {
              const isActive = group.region === activeGroup?.region;
              return (
                <button
                  key={group.region}
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setSelectedRegion(group.region)}
                  className={`shrink-0 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors min-h-[40px] ${
                    isActive
                      ? 'bg-accent text-white shadow-[0_2px_8px_rgba(41,121,255,0.25)]'
                      : 'bg-surface dark:bg-surface-dark text-gray-700 dark:text-gray-300 border border-border dark:border-border-dark hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  <span>{group.label}</span>
                  <span
                    className={`text-xs ${
                      isActive ? 'text-white/80' : 'text-gray-400 dark:text-gray-500'
                    }`}
                  >
                    {group.items.length}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Active region's grid */}
          <AnimatePresence mode="wait">
            {activeGroup && (
              <motion.section
                key={activeGroup.region}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
                aria-label={activeGroup.label}
              >
                <CountryGrid items={activeGroup.items} />
              </motion.section>
            )}
          </AnimatePresence>
        </div>
      )}

      <ComparisonBar />
      <ComparisonSheet />
    </div>
  );
}
