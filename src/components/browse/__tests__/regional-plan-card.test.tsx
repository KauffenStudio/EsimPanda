import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RegionalPlanCard } from '../regional-plan-card';

// Mock next-intl
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const messages: Record<string, string> = {
      'browse.europePlan': 'Europe-Wide Coverage',
      'browse.europeDescription': 'One plan, 30+ countries',
      'browse.from': 'from',
    };
    return messages[key] || key;
  },
  useLocale: () => 'en',
}));

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), back: vi.fn() }),
  usePathname: () => '/en/browse',
  useSearchParams: () => new URLSearchParams(),
}));

// Mock next/image
vi.mock('next/image', () => ({
  default: ({ alt, ...props }: { alt: string; [key: string]: unknown }) => (
    <img alt={alt} {...props} />
  ),
}));

// Mock the browse store
vi.mock('@/stores/browse', () => ({
  useBrowseStore: (selector: (state: { searchQuery: string; expandedDestination: string | null; durationFilter: string; toggleDestination: () => void }) => unknown) =>
    selector({ searchQuery: '', expandedDestination: null, durationFilter: 'all', toggleDestination: vi.fn() }),
}));

describe('RegionalPlanCard', () => {
  it('renders Europe-wide plan card with correct text', () => {
    render(<RegionalPlanCard />);
    expect(screen.getByText('Europe-Wide Coverage')).toBeInTheDocument();
    expect(screen.getByText('One plan, 30+ countries')).toBeInTheDocument();
    expect(screen.getByText('30+ countries')).toBeInTheDocument();
  });

  it('displays starting price from cheapest Europe plan', () => {
    render(<RegionalPlanCard />);
    // Europe cheapest plan is 1499 cents = 14.99
    expect(screen.getByText(/14\.99/)).toBeInTheDocument();
  });
});
