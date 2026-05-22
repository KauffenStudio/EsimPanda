import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RegionalPlanCard } from '../regional-plan-card';
import { fixtureRegionalPlans } from '@/lib/__test-fixtures__/catalog';
import type { CatalogDestination } from '@/lib/db/destinations';

// next-intl
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string, params?: Record<string, string>) => {
    const messages: Record<string, string> = {
      'browse.from': 'from',
      'browse.noPlans': 'No plans available',
      'browse.coverageRegion': '{name}-Wide Coverage',
      'browse.coverageGlobal': 'Worldwide Coverage',
    };
    const template = messages[key] ?? key;
    if (!params) return template;
    return Object.entries(params).reduce(
      (acc, [k, v]) => acc.replace(new RegExp(`\\{${k}\\}`, 'g'), v),
      template,
    );
  },
  useLocale: () => 'en',
}));

// next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

// next/image — render as a plain <img>
vi.mock('next/image', () => ({
  default: ({ alt, src }: { alt: string; src: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={alt} src={src} />
  ),
}));

// currency store
vi.mock('@/stores/currency', () => ({
  useCurrencyStore: (selector: (s: Record<string, unknown>) => unknown) =>
    selector({ currency: 'USD' }),
}));

vi.mock('@/lib/currency/rates', () => ({
  formatPrice: (cents: number) => `$${(cents / 100).toFixed(2)}`,
}));

describe('RegionalPlanCard', () => {
  it('renders nothing when given an empty regionalPlans prop', () => {
    const { container } = render(<RegionalPlanCard regionalPlans={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders a card per regional plan from the prop (no mock-data dependency)', () => {
    render(<RegionalPlanCard regionalPlans={fixtureRegionalPlans} />);
    // Europe regional fixture -> "Europe-Wide Coverage"
    expect(screen.getByText('Europe-Wide Coverage')).toBeInTheDocument();
  });

  it('uses the photo treatment when image_url is present', () => {
    render(<RegionalPlanCard regionalPlans={fixtureRegionalPlans} />);
    expect(screen.getByAltText('Europe Coverage')).toBeInTheDocument();
  });

  it('falls back to the typographic card when image_url is null', () => {
    const noImage: CatalogDestination[] = [
      { ...fixtureRegionalPlans[0], image_url: null },
    ];
    const { container } = render(<RegionalPlanCard regionalPlans={noImage} />);
    // no <img> rendered — the shared typographic fallback primitive instead
    expect(container.querySelector('img')).toBeNull();
    // the destination name still renders inside the gradient card
    expect(screen.getAllByText(/Europe/).length).toBeGreaterThan(0);
  });
});
