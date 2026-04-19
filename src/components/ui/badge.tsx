import { type ReactNode } from 'react';

type BadgeVariant = 'default' | 'accent' | 'success' | 'warning';

interface BadgeProps {
  variant?: BadgeVariant;
  children: ReactNode;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-surface text-gray-600',
  accent: 'bg-accent-soft text-accent',
  success: 'bg-success/10 text-success',
  warning: 'bg-warning/10 text-warning',
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
