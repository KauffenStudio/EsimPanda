'use client';

import { type ReactNode } from 'react';

type CardVariant = 'elevated' | 'flat';

interface CardProps {
  variant?: CardVariant;
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export function Card({
  variant = 'elevated',
  children,
  className = '',
  onClick,
}: CardProps) {
  const baseStyles = 'rounded-card bg-white dark:bg-surface-dark border border-border dark:border-border-dark';
  const variantStyles =
    variant === 'elevated'
      ? 'shadow-card transition-all duration-300 hover:shadow-card-hover hover:-translate-y-0.5'
      : '';

  return (
    <div
      className={`${baseStyles} ${variantStyles} ${className}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {children}
    </div>
  );
}
