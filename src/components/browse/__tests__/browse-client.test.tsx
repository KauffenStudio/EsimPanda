import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowseClient } from '../browse-client';
import {
  fixtureDestinations,
  fixtureRegionalPlans,
} from '@/lib/__test-fixtures__/catalog';

// next-intl — interpolates {query} for noResults.
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string, vars?: Record<string, string>) => {
    const messages: Record<string, string> = {
      'browse.noResults': `No destinations match "${vars?.query ?? ''}"`,
      'browse.clearSearch': 'Clear search',
      'browse.error.message':
        "We couldn't load destinations right now. Check your connection and try again.",
      'browse.error.retry': 'Try loading again',
    };
    return messages[key] || key;
  },
  useLocale: () => 'en',
}));

// motion/react — pass-through.
vi.mock('motion/react', () => ({
  motion: new Proxy(
    {},
    {
      get: () => ({ children, ...props }: { children?: React.ReactNode; [k: string]: unknown }) => {
        const { initial, animate, transition, exit, ...rest } = props as Record<
          string,
          unknown
        >;
        void initial;
        void animate;
        void transition;
        void exit;
        return <div {...rest}>{children as React.ReactNode}</div>;
      },
    },
  ),
  AnimatePresence: ({ children }: { children?: React.ReactNode }) => <>{children}</>,
  useReducedMotion: () => false,
}));

// Mutable search query — drives the search-miss path.
let mockSearchQuery = '';
const mockSetSearch = vi.fn((q: string) => {
  mockSearchQuery = q;
});

vi.mock('@/stores/browse', () => ({
  useBrowseStore: (selector: (s: Record<string, unknown>) => unknown) =>
    selector({ searchQuery: mockSearchQuery, setSearch: mockSetSearch }),
}));

// Server action — Retry handler.
const mockRefetch = vi.fn(async () => ({
  destinations: fixtureDestinations,
  regionalPlans: fixtureRegionalPlans,
  error: false,
}));
vi.mock('@/app/[locale]/browse/actions', () => ({
  refetchCatalogAction: () => mockRefetch(),
}));

// Heavy children — stub to plain markers; they have their own tests.
vi.mock('../destination-card', () => ({
  DestinationCard: ({ name }: { name: string }) => (
    <div data-testid="destination-card">{name}</div>
  ),
}));
vi.mock('../regional-plan-card', () => ({
  RegionalPlanCard: () => <div data-testid="regional-plan-card" />,
}));
vi.mock('../comparison-bar', () => ({ ComparisonBar: () => null }));
vi.mock('../comparison-sheet', () => ({ ComparisonSheet: () => null }));

describe('BrowseClient', () => {
  beforeEach(() => {
    mockSearchQuery = '';
    mockSetSearch.mockClear();
    mockRefetch.mockClear();
  });

  it('renders the fixture destination names when populated (CAT-06)', () => {
    render(
      <BrowseClient
        destinations={fixtureDestinations}
        regionalPlans={fixtureRegionalPlans}
        error={false}
      />,
    );
    // The default active region (europe) grid is shown — its members render.
    expect(screen.getByText('France')).toBeInTheDocument();
    expect(screen.getByText('Spain')).toBeInTheDocument();
    // Both regions are present as pills (europe + asia for the fixtures).
    expect(screen.getByRole('tab', { name: /Europe/ })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Asia/ })).toBeInTheDocument();
  });

  it('shows the search-miss state with a Clear-search button when nothing matches', () => {
    mockSearchQuery = 'zzzznonexistent';
    render(
      <BrowseClient
        destinations={fixtureDestinations}
        regionalPlans={fixtureRegionalPlans}
        error={false}
      />,
    );
    expect(
      screen.getByText('No destinations match "zzzznonexistent"'),
    ).toBeInTheDocument();
    // The search-miss Clear-search button carries the visible text label
    // (the search input's clear-X uses an aria-label instead).
    const clearBtn = screen
      .getAllByRole('button', { name: 'Clear search' })
      .find((b) => b.textContent === 'Clear search');
    expect(clearBtn).toBeDefined();
    fireEvent.click(clearBtn!);
    expect(mockSetSearch).toHaveBeenCalledWith('');
  });

  it('renders the error banner with role=alert and a Retry button when error is true (UXD-06)', () => {
    render(
      <BrowseClient
        destinations={fixtureDestinations}
        regionalPlans={fixtureRegionalPlans}
        error={true}
      />,
    );
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Try loading again' }),
    ).toBeInTheDocument();
  });
});
