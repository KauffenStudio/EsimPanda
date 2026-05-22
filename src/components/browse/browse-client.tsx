'use client';

// Client boundary for the browse grid. Receives the catalog as props from the
// browse RSC (server fetch via getCatalog) and owns all interactivity: search
// filter, region pills, Framer Motion, comparison store, and the four-state
// grid contract (loading / error / search-miss / populated).
//
// Search is intentionally in-memory (.includes() over the props array) — at
// ~226 rows a server round-trip per keystroke is an anti-feature (Pitfall 13).
// Do NOT add a useEffect fetch or a Supabase call here: data arrives entirely
// as props so the first client render matches the server render (Pitfall 4).
// Retry re-runs the full getCatalog() via the refetchCatalogAction server
// action — never router.refresh() (CONTEXT-locked).

import { memo, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useTranslations, useLocale } from 'next-intl';
import { useBrowseStore } from '@/stores/browse';
import { localizedDestinationName } from '@/lib/i18n/destination-name';
import type { CatalogDestination } from '@/lib/db/destinations';
import { refetchCatalogAction } from '@/app/[locale]/browse/actions';
import { DestinationSearch } from './destination-search';
import { DestinationCard } from './destination-card';
import { RegionalPlanCard } from './regional-plan-card';
import { BrowseErrorBanner } from './browse-error-banner';
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
// classifier — the UI groups by `region_bucket` instead. Within each continent
// we sort alphabetically by the LOCALE-LOCALIZED name so PT users see Albânia /
// Alemanha / França in that order, not the English-storage order. localeCompare
// also keeps accented characters in the right slot.
function groupByRegion(destinations: CatalogDestination[], locale: string): RegionGroup[] {
  const groups: RegionGroup[] = [];
  for (const region of REGION_ORDER) {
    const items = destinations
      .filter((d) => d.region_bucket === region)
      .map((d) => ({ d, localized: localizedDestinationName(d.iso_code, d.name, locale) }))
      .sort((a, b) => a.localized.localeCompare(b.localized, locale))
      .map((entry) => entry.d);
    if (items.length > 0) {
      groups.push({ region, label: regionLabels[region] ?? region, items });
    }
  }
  return groups;
}

function CountryGrid({ items, locale }: { items: CatalogDestination[]; locale: string }) {
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
            name={localizedDestinationName(dest.iso_code, dest.name, locale)}
            slug={dest.slug}
            isoCode={dest.iso_code}
            imageUrl={dest.image_url}
            destinationId={dest.id}
            startingPriceCents={dest.startingPriceCents}
            bestDiscountPercent={dest.bestDiscountPercent}
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
  // ?notice= query param forwarded from the browse RSC. 'plan-unavailable'
  // shows a dismissable banner after a stale checkout link redirect (CHK-06).
  notice?: string;
}

export function BrowseClient({
  destinations,
  regionalPlans,
  error,
  notice,
}: BrowseClientProps) {
  const t = useTranslations();
  const locale = useLocale();
  const searchQuery = useBrowseStore((state) => state.searchQuery);
  const setSearch = useBrowseStore((state) => state.setSearch);
  const isSearching = searchQuery.trim().length > 0;
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Hold the catalog in local state so Retry can swap in a fresh fetch (UXD-06).
  const [catalog, setCatalog] = useState({ destinations, regionalPlans, error });

  const handleRetry = async () => {
    const fresh = await refetchCatalogAction();
    setCatalog(fresh);
  };

  const handleClearSearch = () => {
    setSearch('');
    // Accessibility: return focus to the search input after clearing.
    searchInputRef.current?.focus();
  };

  // In-memory search filter — synchronous, hydration-safe, no network round-trip.
  // Match against BOTH the stored English name and the locale-localized name so
  // a PT user searching for "França" finds the row stored as "France".
  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase();
    if (!q) return catalog.destinations;
    return catalog.destinations.filter((d) => {
      if (d.name.toLowerCase().includes(q)) return true;
      const localized = localizedDestinationName(d.iso_code, d.name, locale).toLowerCase();
      return localized.includes(q);
    });
  }, [catalog.destinations, searchQuery, locale]);

  const groups = useMemo(() => groupByRegion(filtered, locale), [filtered, locale]);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);

  // Dismissable plan-unavailable notice — shown when a stale checkout link
  // redirected here with ?notice=plan-unavailable.
  const [noticeDismissed, setNoticeDismissed] = useState(false);
  const showPlanUnavailableNotice = notice === 'plan-unavailable' && !noticeDismissed;

  // Derive the active region from state directly (no useEffect) so the first
  // render already lands on the right region.
  const activeGroup = groups.find((g) => g.region === selectedRegion) ?? groups[0];

  return (
    <div className="flex flex-col gap-6">
      {/* Plan-unavailable notice — dismissable; lands here after a stale
          checkout link redirect. Mirrors the BrowseErrorBanner layout. */}
      {showPlanUnavailableNotice && (
        <div
          role="status"
          className="rounded-card border border-border dark:border-border-dark bg-surface dark:bg-surface-dark px-4 py-3 flex items-center justify-between gap-3"
        >
          <p className="text-sm text-gray-700 dark:text-gray-300">
            {t('browse.planUnavailableNotice.message')}
          </p>
          <button
            type="button"
            onClick={() => setNoticeDismissed(true)}
            aria-label={t('browse.planUnavailableNotice.dismiss')}
            className="shrink-0 rounded-button text-gray-500 dark:text-gray-400 text-sm font-medium px-3 py-2 min-h-[40px] hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            {t('browse.planUnavailableNotice.dismiss')}
          </button>
        </div>
      )}

      {/* Error state — banner renders above the grid; chrome stays mounted (UXD-06). */}
      {catalog.error && <BrowseErrorBanner onRetry={handleRetry} />}

      <DestinationSearch ref={searchInputRef} />
      <RegionalPlanCard regionalPlans={catalog.regionalPlans} />

      {filtered.length === 0 ? (
        // Search-miss state — plain message + a Clear-search button (CAT-06).
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <p className="text-gray-600 dark:text-gray-400 font-semibold text-center">
            {t('browse.noResults', { query: searchQuery })}
          </p>
          <button
            type="button"
            onClick={handleClearSearch}
            className="rounded-button bg-accent text-white text-sm font-medium px-4 py-2 min-h-[40px]"
          >
            {t('browse.clearSearch')}
          </button>
        </div>
      ) : isSearching ? (
        // While the user is typing, ignore the region tabs and show a flat
        // grid of every destination matching the query.
        <CountryGrid items={filtered} locale={locale} />
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
                <CountryGrid items={activeGroup.items} locale={locale} />
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
