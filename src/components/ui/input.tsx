'use client';

import { type InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, disabled, className = '', id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-sans text-primary dark:text-gray-100"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          disabled={disabled}
          className={`border rounded-input bg-white dark:bg-surface-dark px-3 py-2 text-base font-sans transition-all duration-150 ease-in-out focus:ring-2 focus:ring-accent focus:outline-none ${
            error
              ? 'border-destructive text-destructive'
              : 'border-border dark:border-border-dark'
          } ${
            disabled
              ? 'opacity-50 cursor-not-allowed bg-surface'
              : ''
          } ${className}`}
          {...props}
        />
        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
