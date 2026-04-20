import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DurationFilter } from '../duration-filter';

// Mock next-intl
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const messages: Record<string, string> = {
      'browse.filterAll': 'All',
      'browse.filter24h': '24h',
      'browse.filter7d': '7 days',
      'browse.filter14d': '14 days',
      'browse.filter30d': '30 days',
      'browse.filterSemester': '90+ days',
    };
    return messages[key] || key;
  },
}));

// Mock motion/react
vi.mock('motion/react', () => ({
  motion: {
    div: ({ children, ...props }: { children?: React.ReactNode; [key: string]: unknown }) => (
      <div data-testid="motion-div" {...props}>{children}</div>
    ),
  },
  AnimatePresence: ({ children }: { children?: React.ReactNode }) => <>{children}</>,
}));

const mockSetDurationFilter = vi.fn();

vi.mock('@/stores/browse', () => ({
  useBrowseStore: (selector: (state: Record<string, unknown>) => unknown) =>
    selector({
      durationFilter: 'all',
      setDurationFilter: mockSetDurationFilter,
    }),
}));

describe('DurationFilter', () => {
  it('renders all 6 duration chips', () => {
    render(<DurationFilter />);
    expect(screen.getByText('All')).toBeInTheDocument();
    expect(screen.getByText('24h')).toBeInTheDocument();
    expect(screen.getByText('7 days')).toBeInTheDocument();
    expect(screen.getByText('14 days')).toBeInTheDocument();
    expect(screen.getByText('30 days')).toBeInTheDocument();
    expect(screen.getByText('90+ days')).toBeInTheDocument();
  });

  it('clicking chip calls setDurationFilter with correct key', () => {
    render(<DurationFilter />);
    fireEvent.click(screen.getByText('7 days'));
    expect(mockSetDurationFilter).toHaveBeenCalledWith('7');
  });
});
