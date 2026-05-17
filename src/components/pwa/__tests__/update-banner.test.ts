import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { createElement } from 'react';
import { UpdateBanner } from '../update-banner';

// Mirror install-banner test setup: useTranslations returns identity (k) => k.
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

// motion/react: render motion.div as a plain div so children/handlers are testable.
vi.mock('motion/react', () => ({
  motion: {
    div: ({ children, ...props }: { children?: unknown }) =>
      createElement('div', props, children as never),
  },
}));

describe('UpdateBanner', () => {
  it('renders the heading and body text', () => {
    render(
      createElement(UpdateBanner, { onReload: () => {}, onDismiss: () => {} })
    );
    expect(screen.getByText('update_heading')).toBeTruthy();
    expect(screen.getByText('update_body')).toBeTruthy();
  });

  it('calls onReload when the Reload button is clicked', () => {
    const onReload = vi.fn();
    render(
      createElement(UpdateBanner, { onReload, onDismiss: () => {} })
    );
    fireEvent.click(screen.getByText('update_cta'));
    expect(onReload).toHaveBeenCalledTimes(1);
  });

  it('calls onDismiss when the Dismiss button is clicked', () => {
    const onDismiss = vi.fn();
    render(
      createElement(UpdateBanner, { onReload: () => {}, onDismiss })
    );
    fireEvent.click(screen.getByLabelText('Dismiss'));
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });
});
