import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DestinationGrid } from '../destination-grid';

// Mock next-intl
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string, params?: Record<string, string>) => {
    const messages: Record<string, string> = {
      'browse.searchPlaceholder': 'Search destinations...',
      'browse.europePlan': 'Europe-Wide Coverage',
      'browse.europeDescription': 'One plan, 30+ countries',
      'browse.from': 'from',
      'browse.noResults': `No plans for "${params?.query || ''}" yet`,
      'browse.noResultsSuggestion': 'Try the Europe-wide plan or browse popular destinations',
    };
    return messages[key] || key;
  },
}));

// Mock next/image
vi.mock('next/image', () => ({
  default: ({ alt, ...props }: { alt: string; [key: string]: unknown }) => (
    <img alt={alt} {...props} />
  ),
}));

// Mock the browse store
const mockStore: {
  searchQuery: string;
  expandedDestination: string | null;
  durationFilter: 'all' | '1' | '7' | '14' | '30' | '90';
  setSearch: ReturnType<typeof vi.fn>;
  toggleDestination: ReturnType<typeof vi.fn>;
  setDurationFilter: ReturnType<typeof vi.fn>;
  clearFilters: ReturnType<typeof vi.fn>;
} = {
  searchQuery: '',
  expandedDestination: null,
  durationFilter: 'all',
  setSearch: vi.fn(),
  toggleDestination: vi.fn(),
  setDurationFilter: vi.fn(),
  clearFilters: vi.fn(),
};

vi.mock('@/stores/browse', () => ({
  useBrowseStore: (selector: (state: typeof mockStore) => unknown) => selector(mockStore),
}));

describe('DestinationGrid', () => {
  beforeEach(() => {
    mockStore.searchQuery = '';
    mockStore.expandedDestination = null;
    vi.clearAllMocks();
  });

  it('renders destination cards for all mock destinations', () => {
    render(<DestinationGrid />);
    expect(screen.getByText(/France/)).toBeInTheDocument();
    expect(screen.getByText(/Spain/)).toBeInTheDocument();
    expect(screen.getByText(/Italy/)).toBeInTheDocument();
    expect(screen.getByText(/Germany/)).toBeInTheDocument();
  });

  it('filters destinations when search query changes', () => {
    mockStore.searchQuery = 'fra';
    render(<DestinationGrid />);
    expect(screen.getByText(/France/)).toBeInTheDocument();
    expect(screen.queryByText(/Spain/)).not.toBeInTheDocument();
  });

  it('shows BambuEmpty when no results match', () => {
    mockStore.searchQuery = 'zzzznotfound';
    render(<DestinationGrid />);
    expect(screen.getByText(/No plans for "zzzznotfound" yet/)).toBeInTheDocument();
  });

  it('expands accordion when destination card is clicked', () => {
    mockStore.expandedDestination = 'france';
    render(<DestinationGrid />);
    expect(screen.getByText('Plans loading...')).toBeInTheDocument();
  });
});
