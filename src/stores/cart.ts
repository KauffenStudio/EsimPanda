import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Plan } from '@/lib/db/destinations';

export interface CartItem {
  plan: Plan;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  coupon_code: string | null;
  discount_percent: number;
  addItem: (plan: Plan) => void;
  removeItem: (planId: string) => void;
  clear: () => void;
  openCart: () => void;
  closeCart: () => void;
  setCoupon: (code: string, percent: number) => void;
  removeCoupon: () => void;
}

/**
 * Persist `migrate` function for the cart store. Exported (rather than inlined
 * in the persist config) so it is directly unit-testable.
 *
 * CHK-08: any persisted state from a version < 2 was written before the v1.1
 * Supabase cutover and holds dead v1.0 mock plan IDs. Nothing is safely
 * recoverable → return a clean empty cart. Silent — no toast, no notice.
 */
export function migrateCart(persistedState: unknown, version: number) {
  if (version < 2) {
    return { items: [], coupon_code: null, discount_percent: 0 };
  }
  return persistedState as CartState;
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
      version: 2,
      migrate: migrateCart,
      partialize: (state) => ({
        items: state.items,
        coupon_code: state.coupon_code,
        discount_percent: state.discount_percent,
      }),
    },
  ),
);
