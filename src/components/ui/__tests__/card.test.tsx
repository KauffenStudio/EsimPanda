import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Card } from '../card';

describe('Card', () => {
  it('elevated variant has shadow-card class', () => {
    const { container } = render(<Card variant="elevated">Content</Card>);
    const card = container.firstElementChild as HTMLElement;
    expect(card.className).toContain('shadow-card');
  });

  it('flat variant does not have shadow-card class', () => {
    const { container } = render(<Card variant="flat">Content</Card>);
    const card = container.firstElementChild as HTMLElement;
    expect(card.className).not.toContain('shadow-card');
  });
});
