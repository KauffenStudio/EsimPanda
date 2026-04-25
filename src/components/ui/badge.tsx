import { type ReactNode } from 'react';

type BadgeVariant = 'default' | 'accent' | 'success' | 'warning';

interface BadgeProps {
  variant?: BadgeVariant;
  children: ReactNode;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-surface dark:bg-surface-dark text-gray-600 dark:text-gray-400',
  accent: 'bg-accent-soft dark:bg-accent-soft-dark text-accent',
  success: 'bg-success/10 dark:bg-success-dark/10 text-success dark:text-success-dark',
  warning: 'bg-warning/10 dark:bg-warning-dark/10 text-warning dark:text-warning-dark',
};

export function Badge({
  variant = 'default',
  children,
  className = '',
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-badge px-2 py-0.5 text-sm ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
