"use client";

import { useState, useTransition } from "react";
import { ShoppingBag, Check } from "lucide-react";
import { addToCart } from "@/lib/actions/cart";
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
  const addToZustandCart = useCartStore((state) => state.addItem);

  const handleAddToCart = () => {
    setError(null);
    setShowSuccess(false);

    // Optimistic update to Zustand store
    addToZustandCart(
      {
        id: variantId,
        name: `${productName} - ${variantSku}`,
        price,
        image: imageUrl,
      },
      quantity
    );

    // Show immediate success
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);

    // Sync to database in background
    startTransition(async () => {
      const result = await addToCart(variantId, quantity);

      if (!result.success) {
        // Revert on failure (could implement proper rollback)
        setError(result.error || "Failed to sync cart");
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
