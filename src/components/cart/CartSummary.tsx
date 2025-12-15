"use client";

import { Lock, ArrowRight } from "lucide-react";
import { formatPrice } from "@/lib/utils/cart";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface CartSummaryProps {
  subtotal: number;
  savings: number;
  total: number;
  showCheckoutButton?: boolean;
  isDrawer?: boolean;
  onViewCart?: () => void;
}

export default function CartSummary({
  subtotal,
  savings,
  total,
  showCheckoutButton = true,
  isDrawer = false,
  onViewCart,
}: CartSummaryProps) {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCheckout = () => {
    setIsProcessing(true);
    router.push("/checkout");
  };

  return (
    <div className={`rounded-lg ${isDrawer ? "bg-transparent" : "bg-[var(--color-gray-light)]"} ${isDrawer ? "p-0" : "p-6"}`}>
      {/* Totals */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-body">
          <span className="text-[var(--color-text-secondary)]">Subtotal</span>
          <span className="font-medium text-[var(--color-text-primary)]">
            {formatPrice(subtotal)}
          </span>
        </div>

        {savings > 0 && (
          <div className="flex items-center justify-between text-body">
            <span className="text-[var(--color-text-secondary)]">You saved</span>
            <span className="font-semibold text-[var(--color-cta)]">
              {formatPrice(savings)}
            </span>
          </div>
        )}

        <div className="border-t border-[var(--color-gray-dark)] pt-3">
          <div className="flex items-center justify-between">
            <span className="text-lead font-semibold text-[var(--color-text-primary)]">
              Total
            </span>
            <span className="text-lead font-bold text-[var(--color-text-primary)]">
              {formatPrice(total)}
            </span>
          </div>
        </div>

        <p className="text-caption text-[var(--color-text-secondary)]">
          Tax included. Shipping calculated at checkout.
        </p>
      </div>

      {/* Buttons */}
      {showCheckoutButton && (
        <div className={`space-y-3 ${isDrawer ? "mt-4" : "mt-6"}`}>
          {isDrawer && onViewCart && (
            <button
              type="button"
              onClick={onViewCart}
              className="w-full rounded-lg border-2 border-[var(--color-primary)] bg-transparent px-6 py-3 text-body-medium font-semibold text-[var(--color-primary)] transition-colors hover:bg-[var(--color-primary)] hover:text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-offset-2"
            >
              View Cart
            </button>
          )}
          
          <button
            type="button"
            onClick={handleCheckout}
            disabled={isProcessing}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--color-cta)] px-6 py-3 text-body-medium font-semibold text-white transition-colors hover:bg-[var(--color-cta-dark)] focus:outline-none focus:ring-2 focus:ring-[var(--color-cta)] focus:ring-offset-2 disabled:opacity-50"
          >
            {isProcessing ? "Processing..." : "Checkout"}
            {!isProcessing && <ArrowRight className="h-5 w-5" />}
          </button>

          {!isDrawer && (
            <div className="flex items-center justify-center gap-2 text-caption text-[var(--color-text-secondary)]">
              <Lock className="h-4 w-4" />
              <span>100% Secure Payments</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
