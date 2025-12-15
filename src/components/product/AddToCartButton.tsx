"use client";

import { useState, useTransition } from "react";
import { ShoppingBag, Check } from "lucide-react";
import { addToCart, getCart } from "@/lib/actions/cart";
import { useCartStore } from "@/store/cart";

interface AddToCartButtonProps {
  variantId: string;
  variantSku: string;
  productName: string;
  price: number;
  imageUrl?: string;
  quantity: number;
  disabled?: boolean;
  className?: string;
}

export default function AddToCartButton({
  variantId,
  variantSku,
  productName,
  price,
  imageUrl,
  quantity,
  disabled = false,
  className = "",
}: AddToCartButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setCart, openDrawer } = useCartStore();

  const handleAddToCart = () => {
    setError(null);
    setShowSuccess(false);

    // Add to cart and sync state
    startTransition(async () => {
      const result = await addToCart(variantId, quantity);

      if (result.success) {
        // Fetch updated cart data and sync with store
        const cartData = await getCart();
        setCart(cartData);
        
        // Show success
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 2000);
        
        // Optionally open drawer to show the added item
        //openDrawer();
      } else {
        setError(result.error || "Failed to add to cart");
        setTimeout(() => setError(null), 4000);
      }
    });
  };

  return (
    <div>
      <button
        onClick={handleAddToCart}
        disabled={disabled || isPending}
        className={`flex w-full items-center justify-center gap-2 rounded-full bg-dark-900 px-6 py-4 text-body-medium text-light-100 transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-dark-500 ${className}`}
      >
        {isPending ? (
          <>
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            <span>Adding...</span>
          </>
        ) : showSuccess ? (
          <>
            <Check className="h-5 w-5" />
            <span>Added to Bag!</span>
          </>
        ) : (
          <>
            <ShoppingBag className="h-5 w-5" />
            <span>Add to Bag</span>
          </>
        )}
      </button>

      {error && (
        <p className="mt-2 text-caption text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
