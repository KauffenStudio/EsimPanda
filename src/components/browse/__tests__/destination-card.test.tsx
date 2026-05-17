import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DestinationCard } from '../destination-card';
import { fixtureDestinations } from '@/lib/__test-fixtures__/catalog';

// next-intl
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const messages: Record<string, string> = {
      'browse.from': 'from',
      'browse.noPlans': 'No plans available',
    };
    return messages[key] || key;
  },
  useLocale: () => 'en',
}));

// next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

// motion/react — render motion.img as a plain <img>, preserve useReducedMotion
vi.mock('motion/react', () => ({
  motion: {
    img: ({ children, ...props }: { children?: React.ReactNode; [k: string]: unknown }) => {
      // strip motion-only props so React does not warn
      const { initial, animate, transition, ...rest } = props as Record<string, unknown>;
      void initial;
      void animate;
      void transition;
      // eslint-disable-next-line jsx-a11y/alt-text
      return <img {...rest}>{children as React.ReactNode}</img>;
    },
  },
  useReducedMotion: () => false,
}));

// currency store
vi.mock('@/stores/currency', () => ({
  useCurrencyStore: (selector: (s: Record<string, unknown>) => unknown) =>
    selector({ currency: 'USD' }),
}));

vi.mock('@/lib/currency/rates', () => ({
  formatPrice: (cents: number) => `$${(cents / 100).toFixed(2)}`,
}));

const withImage = fixtureDestinations.find((d) => d.image_url !== null)!;
const withoutImage = fixtureDestinations.find((d) => d.image_url === null)!;

describe('DestinationCard', () => {
  it('renders the typographic name card and NO <img> when image_url is null (CAT-07)', () => {
    const { container } = render(
      <DestinationCard
        name={withoutImage.name}
        slug={withoutImage.slug}
        isoCode={withoutImage.iso_code}
        imageUrl={withoutImage.image_url}
        destinationId={withoutImage.id}
        startingPriceCents={withoutImage.startingPriceCents}
        bestDiscountPercent={withoutImage.bestDiscountPercent}
      />,
    );
    // the destination name renders (typographic card + footer chip both show it)
    expect(screen.getAllByText(new RegExp(withoutImage.name)).length).toBeGreaterThan(0);
    // no photo element at all
    expect(container.querySelector('img')).toBeNull();
  });

  it('renders a motion.img with alt text when image_url is present', () => {
    render(
      <DestinationCard
        name={withImage.name}
        slug={withImage.slug}
        isoCode={withImage.iso_code}
        imageUrl={withImage.image_url}
        destinationId={withImage.id}
        startingPriceCents={withImage.startingPriceCents}
        bestDiscountPercent={withImage.bestDiscountPercent}
      />,
    );
    const img = screen.getByAltText(withImage.name);
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', withImage.image_url);
  });

  it('shows the no-plans label when startingPriceCents is 0', () => {
    render(
      <DestinationCard
        name={withoutImage.name}
        slug={withoutImage.slug}
        isoCode={withoutImage.iso_code}
        imageUrl={withoutImage.image_url}
        destinationId={withoutImage.id}
        startingPriceCents={0}
        bestDiscountPercent={0}
      />,
    );
    expect(screen.getByText('No plans available')).toBeInTheDocument();
  });
});
