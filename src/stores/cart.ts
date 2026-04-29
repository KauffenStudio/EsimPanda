import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { MockPlan } from '@/lib/mock-data/plans';

export interface CartItem {
  plan: MockPlan;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  coupon_code: string | null;
  discount_percent: number;
  addItem: (plan: MockPlan) => void;
  removeItem: (planId: string) => void;
  clear: () => void;
  openCart: () => void;
  closeCart: () => void;
  setCoupon: (code: string, percent: number) => void;
  removeCoupon: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      coupon_code: null,
      discount_percent: 0,

      addItem: (plan) => {
        const existing = get().items.find((i) => i.plan.id === plan.id);
        if (existing) {
          // Already in cart, just open
          set({ isOpen: true });
          return;
        }
        set((state) => ({
          items: [...state.items, { plan }],
          isOpen: true,
        }));
      },

      removeItem: (planId) => {
        set((state) => ({
          items: state.items.filter((i) => i.plan.id !== planId),
        }));
      },

      clear: () => set({ items: [], coupon_code: null, discount_percent: 0 }),

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),

      setCoupon: (code, percent) => set({ coupon_code: code, discount_percent: percent }),
      removeCoupon: () => set({ coupon_code: null, discount_percent: 0 }),
    }),
    {
      name: 'esim-panda-cart',
      partialize: (state) => ({
        items: state.items,
        coupon_code: state.coupon_code,
        discount_percent: state.discount_percent,
      }),
    },
  ),
);
