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
  const baseStyles = 'rounded-card bg-white dark:bg-surface-dark';
  const variantStyles =
    variant === 'elevated'
      ? 'shadow-card transition-shadow duration-200 hover:shadow-card-hover'
      : 'bg-surface dark:bg-surface-dark';

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
