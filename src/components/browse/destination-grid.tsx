'use client';

import { memo, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useTranslations } from 'next-intl';
import { useDestinations } from '@/hooks/use-destinations';
import { useBrowseStore } from '@/stores/browse';
import { getStartingPrice } from '@/lib/mock-data/plans';
import { DestinationSearch } from './destination-search';
import { DestinationCard } from './destination-card';
import { RegionalPlanCard } from './regional-plan-card';
import { ComparisonBar } from './comparison-bar';
import { ComparisonSheet } from './comparison-sheet';
import { BambuVideo } from '@/components/bambu/bambu-video';
import type { MockDestination } from '@/lib/mock-data/destinations';

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
  items: MockDestination[];
}

function groupByRegion(destinations: MockDestination[]): RegionGroup[] {
  const groups: RegionGroup[] = [];
  for (const region of REGION_ORDER) {
    const items = destinations.filter((d) => d.region === region);
    if (items.length > 0) {
      groups.push({ region, label: regionLabels[region] ?? region, items });
    }
  }
  return groups;
}

function CountryGrid({ items }: { items: MockDestination[] }) {
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
            startingPriceCents={getStartingPrice(dest.id)}
          />
        </motion.div>
      ))}
    </div>
  );
}

export function DestinationGrid() {
  const t = useTranslations();
  const { destinations } = useDestinations();
  const searchQuery = useBrowseStore((state) => state.searchQuery);
  const isSearching = searchQuery.trim().length > 0;

  const groups = useMemo(() => groupByRegion(destinations), [destinations]);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);

  // Resolve the active region by deriving from state directly: no useEffect,
  // so the very first render already lands on the right region (avoids a
  // flash of empty content and keeps tests synchronous).
  const activeGroup =
    groups.find((g) => g.region === selectedRegion) ?? groups[0];

  return (
    <div className="flex flex-col gap-6">
      <DestinationSearch />
      <RegionalPlanCard />

      {destinations.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16">
          <BambuVideo variant="empty" size={120} className="mb-4" />
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
        <CountryGrid items={destinations} />
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
