import type { Appearance } from '@stripe/stripe-js';

export const stripeAppearance: Appearance = {
  theme: 'flat',
  variables: {
    colorPrimary: '#16a34a',
    colorBackground: '#ffffff',
    colorText: '#1a1a1a',
    colorDanger: '#dc2626',
    fontFamily: '"Plus Jakarta Sans", "Inter", system-ui, sans-serif',
    borderRadius: '12px',
    spacingUnit: '4px',
  },
  rules: {
    '.Input': {
      border: '1px solid #e5e7eb',
      padding: '12px',
      fontSize: '16px',
    },
    '.Input:focus': {
      border: '1px solid #16a34a',
      boxShadow: '0 0 0 2px rgba(22, 163, 74, 0.2)',
    },
    '.Tab': {
      border: '1px solid #e5e7eb',
    },
    '.Tab--selected': {
      borderColor: '#16a34a',
      backgroundColor: '#f0fdf4',
    },
  },
};
