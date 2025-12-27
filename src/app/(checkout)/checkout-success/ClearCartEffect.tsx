"use client";

import { useEffect } from 'react';
import { useCartStore } from '@/store/cart.store';
import { clearCart as clearCartAction } from '@/lib/actions/cart';

/**
 * Client component that clears the cart when the checkout success page loads
 * This ensures the cart is cleared both on the client (Zustand) and server (database)
 */
export default function ClearCartEffect() {
  const { clearCart } = useCartStore();

  useEffect(() => {
    // Clear client-side cart (Zustand store)
    clearCart();

    // Clear server-side cart (database)
    clearCartAction().catch((error) => {
      console.error('Failed to clear cart on server:', error);
    });
  }, [clearCart]);

  // This component doesn't render anything
  return null;
}
