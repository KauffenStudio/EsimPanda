'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Search, X } from 'lucide-react';
import { useBrowseStore } from '@/stores/browse';

export function DestinationSearch() {
  const t = useTranslations();
  const setSearch = useBrowseStore((state) => state.setSearch);
  const searchQuery = useBrowseStore((state) => state.searchQuery);
  const [localValue, setLocalValue] = useState(searchQuery);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setSearch(localValue);
    }, 300);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [localValue, setSearch]);

  const handleClear = () => {
    setLocalValue('');
    setSearch('');
  };

  return (
    <div className="relative w-full">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
      <input
        type="text"
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        placeholder={t('browse.searchPlaceholder')}
        className="w-full border border-border dark:border-border-dark rounded-input bg-white dark:bg-surface-dark pl-9 pr-9 py-2 text-base font-sans transition-all duration-150 ease-in-out focus:ring-2 focus:ring-accent focus:outline-none"
      />
      {localValue && (
        <button
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          aria-label="Clear search"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
