import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Button } from '../button';

describe('Button', () => {
  it('renders with primary variant class', () => {
    render(<Button variant="primary">Click me</Button>);
    const button = screen.getByRole('button', { name: 'Click me' });
    expect(button.className).toContain('bg-accent');
  });

  it('renders with destructive variant class', () => {
    render(<Button variant="destructive">Delete</Button>);
    const button = screen.getByRole('button', { name: 'Delete' });
    expect(button.className).toContain('bg-destructive');
  });

  it('disabled button has opacity-50', () => {
    render(<Button disabled>Disabled</Button>);
    const button = screen.getByRole('button', { name: 'Disabled' });
    expect(button.className).toContain('opacity-50');
  });

  it('renders children text', () => {
    render(<Button>Hello World</Button>);
    expect(screen.getByText('Hello World')).toBeDefined();
  });
});
