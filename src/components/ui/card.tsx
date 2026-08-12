'use client';

import { type ReactNode } from 'react';

type CardVariant = 'elevated' | 'flat';

interface CardProps {
  variant?: CardVariant;
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  'aria-label'?: string;
}

export function Card({
  variant = 'elevated',
  children,
  className = '',
  onClick,
  'aria-label': ariaLabel,
}: CardProps) {
  const baseStyles = 'rounded-card bg-white dark:bg-surface-dark border border-border dark:border-border-dark';
  const variantStyles =
    variant === 'elevated'
      ? 'shadow-card transition-all duration-300 hover:shadow-card-hover hover:-translate-y-0.5'
      : '';
  // When the card acts as a button, keep it operable by keyboard (Enter/Space)
  // and give it a visible focus ring — a bare role="button" div has neither.
  const interactiveStyles = onClick
    ? 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background dark:focus-visible:ring-offset-background-dark'
    : '';

  return (
    <div
      className={`${baseStyles} ${variantStyles} ${interactiveStyles} ${className}`}
      onClick={onClick}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      aria-label={ariaLabel}
    >
      {children}
    </div>
  );
}
