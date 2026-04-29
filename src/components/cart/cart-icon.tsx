'use client';

import { ShoppingCart } from 'lucide-react';
import { useCartStore } from '@/stores/cart';

export function CartIcon() {
  const items = useCartStore((s) => s.items);
  const openCart = useCartStore((s) => s.openCart);
  const count = items.length;

  return (
    <button
      onClick={openCart}
      className="relative flex items-center justify-center p-1.5 text-gray-500 hover:text-accent transition-colors"
      aria-label="Cart"
    >
      <ShoppingCart size={18} />
      {count > 0 && (
        <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-white">
          {count}
        </span>
      )}
    </button>
  );
}
