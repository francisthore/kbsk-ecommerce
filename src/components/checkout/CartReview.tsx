"use client";

import { useState } from "react";
import { Lock, Loader2 } from "lucide-react";
import { CartItemData, CartTotals } from "@/store/cart.store";
import { formatPrice } from "@/lib/utils/cart";
import Image from "next/image";
import { toast } from "sonner";

interface CartReviewProps {
  items: CartItemData[];
  totals: CartTotals;
  shippingFee: number;
  isSubmitting: boolean;
}

export default function CartReview({ items, totals, shippingFee, isSubmitting }: CartReviewProps) {
  const [discountCode, setDiscountCode] = useState("");
  const [isApplyingDiscount, setIsApplyingDiscount] = useState(false);
  const [appliedDiscount, setAppliedDiscount] = useState(0);

  const handleApplyDiscount = () => {
    if (!discountCode.trim()) {
      toast.error("Please enter a discount code");
      return;
    }

    setIsApplyingDiscount(true);

    // Simulate discount application
    setTimeout(() => {
      // For demo: Apply 10 discount if code is "SAVE10"
      if (discountCode.toUpperCase() === "SAVE10") {
        setAppliedDiscount(10);
        toast.success("Discount code applied!");
      } else {
        toast.error("Invalid discount code");
      }
      setIsApplyingDiscount(false);
    }, 500);
  };

  const finalTotal = totals.total + shippingFee - appliedDiscount;

  return (
    <div className="rounded-lg bg-white">
      <h2 className="mb-6 text-xl font-semibold text-[var(--color-text-primary)]">
        Review your cart
      </h2>

      {/* Cart Items */}
      <div className="mb-6 space-y-6">
        {items.map((item) => {
          const displayPrice = item.salePrice || item.price;

          return (
            <div key={item.cartItemId} className="flex gap-4">
              {/* Product Image */}
              <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-[var(--color-gray-light)]">
                {item.image ? (
                  <Image
                    src={item.image}
                    alt={item.productName}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xs text-[var(--color-text-muted)]">
                    No image
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="flex-1">
                <h3 className="text-sm font-medium text-[var(--color-text-primary)]">
                  {item.productName}
                </h3>
                <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
                  {item.quantity}x
                </p>
                <p className="mt-2 text-sm font-semibold text-[var(--color-text-primary)]">
                  {formatPrice(parseFloat(displayPrice))}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Discount Code */}
      <div className="mb-6">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={discountCode}
              onChange={(e) => setDiscountCode(e.target.value)}
              placeholder="Discount code"
              className="w-full rounded-lg border border-[var(--color-border)] py-3 pl-10 pr-4 text-sm placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
            />
            <div className="absolute left-3 top-1/2 -translate-y-1/2">
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M8 4H4V8"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-[var(--color-text-muted)]"
                />
                <path
                  d="M12 16H16V12"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-[var(--color-text-muted)]"
                />
                <path
                  d="M4 4L10 10"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  className="text-[var(--color-text-muted)]"
                />
                <path
                  d="M16 16L10 10"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  className="text-[var(--color-text-muted)]"
                />
              </svg>
            </div>
          </div>
          <button
            type="button"
            onClick={handleApplyDiscount}
            disabled={isApplyingDiscount}
            className="rounded-lg px-6 py-3 text-sm font-medium text-[var(--color-cta)] transition-colors hover:bg-[var(--color-cta)]/5 disabled:opacity-50"
          >
            {isApplyingDiscount ? "Applying..." : "Apply"}
          </button>
        </div>
      </div>

      {/* Price Breakdown */}
      <div className="space-y-3 border-t border-[var(--color-border)] pt-6">
        <div className="flex items-center justify-between text-sm">
          <span className="text-[var(--color-text-secondary)]">Subtotal</span>
          <span className="font-medium text-[var(--color-text-primary)]">
            {formatPrice(totals.subtotal)}
          </span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-[var(--color-text-secondary)]">Shipping</span>
          <span className="font-medium text-[var(--color-text-primary)]">
            {formatPrice(shippingFee)}
          </span>
        </div>

        {appliedDiscount > 0 && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-[var(--color-text-secondary)]">Discount</span>
            <span className="font-medium text-[var(--color-cta)]">
              -{formatPrice(appliedDiscount)}
            </span>
          </div>
        )}

        <div className="flex items-center justify-between border-t border-[var(--color-border)] pt-3 text-base">
          <span className="font-semibold text-[var(--color-text-primary)]">Total</span>
          <span className="text-xl font-bold text-[var(--color-text-primary)]">
            {formatPrice(finalTotal)}
          </span>
        </div>
      </div>

      {/* Pay Now Button */}
      <button
        type="submit"
        form="checkout-form"
        disabled={isSubmitting}
        className="mt-6 w-full rounded-lg bg-[var(--color-cta)] py-4 text-base font-semibold text-white transition-colors hover:bg-[var(--color-cta-dark)] focus:outline-none focus:ring-2 focus:ring-[var(--color-cta)] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isSubmitting ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            Submitting order...
          </span>
        ) : (
          "Pay Now"
        )}
      </button>

      {/* Security Notice */}
      <div className="mt-6 flex items-center gap-2 rounded-lg bg-[var(--color-gray-light)] p-4">
        <Lock className="h-5 w-5 flex-shrink-0 text-[var(--color-text-secondary)]" />
        <div>
          <p className="text-sm font-medium text-[var(--color-text-primary)]">
            Secure Checkout - SSL Encrypted
          </p>
          <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
            Ensuring your financial and personal details are secure during every transaction.
          </p>
        </div>
      </div>
    </div>
  );
}
