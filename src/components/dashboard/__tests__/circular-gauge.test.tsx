import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CircularGauge } from '../circular-gauge';

// Mock motion/react to render plain elements
vi.mock('motion/react', () => ({
  motion: {
    circle: (props: Record<string, unknown>) => {
      const { children, ...rest } = props;
      return <circle {...rest}>{children as React.ReactNode}</circle>;
    },
  },
}));

describe('CircularGauge', () => {
  it('renders SVG with two circle elements (track + progress)', () => {
    const { container } = render(
      <CircularGauge total_gb={5} used_gb={2.5} />
    );
    const circles = container.querySelectorAll('circle');
    expect(circles.length).toBeGreaterThanOrEqual(2);
  });

  it('renders "2.5" and "GB left" text for total_gb=5, used_gb=2.5', () => {
    render(<CircularGauge total_gb={5} used_gb={2.5} />);
    expect(screen.getByText('2.5')).toBeInTheDocument();
    expect(screen.getByText('GB left')).toBeInTheDocument();
  });

  it('uses accent color (#2979FF) stroke when remaining > 20%', () => {
    const { container } = render(
      <CircularGauge total_gb={5} used_gb={2.5} />
    );
    // remaining_pct = 50%, should be accent color
    const progressCircle = container.querySelectorAll('circle')[1];
    expect(progressCircle.getAttribute('stroke')).toBe('#2979FF');
  });

  it('uses warning color (#FB8C00) stroke when remaining is 10-20%', () => {
    const { container } = render(
      <CircularGauge total_gb={5} used_gb={4.25} />
    );
    // remaining_pct = 15%, should be warning
    const progressCircle = container.querySelectorAll('circle')[1];
    expect(progressCircle.getAttribute('stroke')).toBe('#FB8C00');
  });

  it('uses destructive color (#E53935) stroke when remaining < 10%', () => {
    const { container } = render(
      <CircularGauge total_gb={5} used_gb={4.75} />
    );
    // remaining_pct = 5%, should be destructive
    const progressCircle = container.querySelectorAll('circle')[1];
    expect(progressCircle.getAttribute('stroke')).toBe('#E53935');
  });

  it('renders "Expired" text when status is expired', () => {
    render(
      <CircularGauge total_gb={5} used_gb={5} status="expired" />
    );
    expect(screen.getByText('Expired')).toBeInTheDocument();
  });
});
