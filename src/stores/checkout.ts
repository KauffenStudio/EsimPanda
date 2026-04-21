import { create } from 'zustand';
import type { PaymentStatus } from '@/lib/checkout/types';

interface CheckoutState {
  plan_id: string | null;
  email: string;
  coupon_code: string | null;
  discount_cents: number;
  subtotal_cents: number;
  tax_cents: number;
  total_cents: number;
  payment_status: PaymentStatus;
  error_message: string | null;
  client_secret: string | null;

  setPlan: (id: string) => void;
  setEmail: (email: string) => void;
  applyCoupon: (code: string, discount: number, newSubtotal: number, newTax: number, newTotal: number) => void;
  removeCoupon: () => void;
  setPricing: (subtotal: number, tax: number, total: number, discount: number) => void;
  setPaymentStatus: (status: PaymentStatus, error?: string) => void;
  setClientSecret: (secret: string) => void;
  reset: () => void;
}

const initialState = {
  plan_id: null as string | null,
  email: '',
  coupon_code: null as string | null,
  discount_cents: 0,
  subtotal_cents: 0,
  tax_cents: 0,
  total_cents: 0,
  payment_status: 'idle' as PaymentStatus,
  error_message: null as string | null,
  client_secret: null as string | null,
};

export const useCheckoutStore = create<CheckoutState>((set) => ({
  ...initialState,

  setPlan: (id) => set({ plan_id: id }),

  setEmail: (email) => set({ email }),

  applyCoupon: (code, discount, newSubtotal, newTax, newTotal) =>
    set({
      coupon_code: code,
      discount_cents: discount,
      subtotal_cents: newSubtotal,
      tax_cents: newTax,
      total_cents: newTotal,
    }),

  removeCoupon: () =>
    set({
      coupon_code: null,
      discount_cents: 0,
    }),

  setPricing: (subtotal, tax, total, discount) =>
    set({
      subtotal_cents: subtotal,
      tax_cents: tax,
      total_cents: total,
      discount_cents: discount,
    }),

  setPaymentStatus: (status, error?) =>
    set({
      payment_status: status,
      error_message: status === 'failed' ? (error ?? null) : null,
    }),

  setClientSecret: (secret) => set({ client_secret: secret }),

  reset: () => set({ ...initialState }),
}));
