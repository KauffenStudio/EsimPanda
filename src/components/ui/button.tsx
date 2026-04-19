'use client';

import { motion } from 'motion/react';
import { type ButtonHTMLAttributes, type ReactNode } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'type'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
  type?: 'button' | 'submit' | 'reset';
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-accent text-white hover:bg-accent-hover active:bg-accent-pressed',
  secondary: 'border border-border bg-transparent text-primary hover:bg-surface',
  ghost: 'bg-transparent text-primary hover:bg-surface',
  destructive: 'bg-destructive text-white hover:bg-destructive-hover',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
};

export function Button({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  disabled,
  onClick,
  type = 'button',
  ...props
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
      whileTap={disabled ? undefined : { scale: 0.97 }}
      transition={{ duration: 0.15, ease: 'easeInOut' }}
      className={`inline-flex items-center justify-center rounded-button font-semibold min-h-[44px] transition-colors duration-150 ease-in-out ${variantStyles[variant]} ${sizeStyles[size]} ${disabled ? 'opacity-50 pointer-events-none' : ''} ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  );
}
