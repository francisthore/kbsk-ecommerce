"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Zap } from "lucide-react";
import { buyNow } from "@/lib/actions/cart";
import { useCartStore } from "@/store/cart";

interface BuyNowButtonProps {
  variantId: string;
  variantSku: string;
  productName: string;
  price: number;
  imageUrl?: string;
  quantity: number;
  disabled?: boolean;
  className?: string;
}

export default function BuyNowButton({
  variantId,
  variantSku,
  productName,
  price,
  imageUrl,
  quantity,
  disabled = false,
  className = "",
}: BuyNowButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const addToZustandCart = useCartStore((state) => state.addItem);

  const handleBuyNow = () => {
    setError(null);

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

    // Navigate immediately
    router.push("/checkout");

    // Sync to database in background
    startTransition(async () => {
      const result = await buyNow(variantId, quantity);

      if (!result.success && "error" in result) {
        setError(result.error || "Failed to process purchase");
        setTimeout(() => setError(null), 4000);
      }
    });
  };

  return (
    <div>
      <button
        onClick={handleBuyNow}
        disabled={disabled || isPending}
        className={`flex w-full items-center justify-center gap-2 rounded-full border border-light-300 px-6 py-4 text-body-medium text-dark-900 transition hover:border-dark-500 hover:bg-light-100 disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-dark-500 ${className}`}
      >
        {isPending ? (
          <>
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-dark-900 border-t-transparent" />
            <span>Processing...</span>
          </>
        ) : (
          <>
            <Zap className="h-5 w-5" />
            <span>Buy It Now</span>
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
