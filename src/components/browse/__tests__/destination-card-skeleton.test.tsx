import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  DestinationCardSkeleton,
  DestinationGridSkeleton,
} from '../destination-card-skeleton';

// UXD-05: the shimmer skeleton grid must render exactly 12 placeholder cards by
// default (a full 3-row x 4-col lg grid) and be decorative for screen readers.
describe('DestinationGridSkeleton', () => {
  it('renders exactly 12 placeholder cards by default', () => {
    const { container } = render(<DestinationGridSkeleton />);
    const grid = screen.getByTestId('destination-grid-skeleton');
    expect(grid.children).toHaveLength(12);
    // pulse animation present on the placeholder cards
    expect(
      container.querySelectorAll('.animate-\\[pulse_1\\.5s_ease-in-out_infinite\\]')
        .length,
    ).toBe(12);
  });

  it('respects the count prop', () => {
    render(<DestinationGridSkeleton count={6} />);
    expect(screen.getByTestId('destination-grid-skeleton').children).toHaveLength(6);
  });

  it('marks the skeleton container as decorative (aria-hidden)', () => {
    render(<DestinationGridSkeleton count={3} />);
    expect(screen.getByTestId('destination-grid-skeleton')).toHaveAttribute(
      'aria-hidden',
      'true',
    );
  });

  it('renders a single skeleton card with the real card footprint', () => {
    const { container } = render(<DestinationCardSkeleton />);
    const card = container.firstElementChild as HTMLElement;
    expect(card.className).toContain('rounded-card');
    expect(card.className).toContain('aspect-[4/3]');
  });
});
