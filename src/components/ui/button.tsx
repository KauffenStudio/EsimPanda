'use client';

import { motion } from 'motion/react';
import { type ReactNode } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
  className?: string;
  disabled?: boolean;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  type?: 'button' | 'submit' | 'reset';
  'aria-label'?: string;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-accent text-white hover:bg-accent-hover active:bg-accent-pressed shadow-[0_2px_8px_rgba(41,121,255,0.25)] hover:shadow-[0_4px_16px_rgba(41,121,255,0.35)]',
  secondary: 'border border-border dark:border-border-dark bg-transparent text-primary dark:text-gray-100 hover:bg-surface dark:hover:bg-surface-dark',
  ghost: 'bg-transparent text-primary dark:text-gray-100 hover:bg-surface dark:hover:bg-surface-dark',
  destructive: 'bg-destructive text-white hover:bg-destructive-hover dark:bg-destructive-dark dark:hover:bg-destructive-dark/90',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-4 py-1.5 text-sm',
  md: 'px-5 py-2.5 text-base',
  lg: 'px-8 py-3.5 text-lg',
};

export function Button({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  disabled,
  onClick,
  type = 'button',
  'aria-label': ariaLabel,
}: ButtonProps) {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(10);
    }
    onClick?.(e);
  };

  return (
    <motion.button
      type={type}
      disabled={disabled}
      onClick={handleClick}
      whileTap={disabled ? undefined : { scale: 0.97, y: 1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      aria-label={ariaLabel}
      className={`inline-flex items-center justify-center rounded-button font-semibold min-h-[44px] transition-all duration-200 ${variantStyles[variant]} ${sizeStyles[size]} ${disabled ? 'opacity-50 pointer-events-none' : ''} ${className}`}
    >
      {children}
    </motion.button>
  );
}
