"use client";

import { useEffect } from "react";
import { X, ShoppingCart, Truck, Package } from "lucide-react";
import { useCartStore } from "@/store/cart.store";
import { formatPrice, groupItemsBySupplier } from "@/lib/utils/cart";
import CartItemRow from "./CartItemRow";
import CartSummary from "./CartSummary";
import EmptyCart from "./EmptyCart";
import { useRouter } from "next/navigation";

export default function CartDrawer() {
  const router = useRouter();
  const { 
    isDrawerOpen, 
    closeDrawer, 
    items, 
    totals, 
    freeShipping 
  } = useCartStore();

  // Handle ESC key to close drawer
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isDrawerOpen) {
        closeDrawer();
      }
    };

    if (isDrawerOpen) {
      document.addEventListener("keydown", handleEsc);
      // Prevent body scroll
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "unset";
    };
  }, [isDrawerOpen, closeDrawer]);

  const handleViewCart = () => {
    closeDrawer();
    router.push("/cart");
  };

  const handleBackdropClick = () => {
    closeDrawer();
  };

  if (!isDrawerOpen) return null;

  const { supplier: supplierItems } = groupItemsBySupplier(items);
  const hasSupplierItems = supplierItems.length > 0;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/50 transition-opacity"
        onClick={handleBackdropClick}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        className="fixed right-0 top-0 z-50 flex h-full w-full flex-col bg-white shadow-2xl transition-transform sm:w-[520px]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-drawer-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--color-gray-dark)] px-6 py-4">
          <h2
            id="cart-drawer-title"
            className="flex items-center gap-2 text-lead font-semibold text-[var(--color-text-primary)]"
          >
            <ShoppingCart className="h-5 w-5" />
            Shopping Cart ({items.length})
          </h2>
          <button
            type="button"
            onClick={closeDrawer}
            className="rounded-full p-2 text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-gray-light)] hover:text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            aria-label="Close cart"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Free Shipping Banner */}
        {items.length > 0 && (
          <div className="border-b border-[var(--color-gray-dark)] bg-[var(--color-gray-light)] px-6 py-3">
            {freeShipping.eligible ? (
              <div className="flex items-center gap-2 text-caption font-medium text-[var(--color-success)]">
                <Truck className="h-4 w-4" />
                <span>You are eligible for free shipping!</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-caption font-medium text-[var(--color-text-secondary)]">
                <Truck className="h-4 w-4" />
                <span>
                  Add {formatPrice(freeShipping.amountRemaining)} more for free shipping!
                </span>
              </div>
            )}
          </div>
        )}

        {/* Cart Items */}
        {items.length === 0 ? (
          <div className="flex-1 overflow-y-auto">
            <EmptyCart />
          </div>
        ) : (
          <>
            {/* Items List */}
            <div className="flex-1 overflow-y-auto px-6">
              <div className="divide-y divide-[var(--color-gray-dark)]">
                {items.map((item) => (
                  <CartItemRow
                    key={item.cartItemId}
                    item={item}
                    compact
                  />
                ))}
              </div>

              {/* Supplier Warehouse Notice */}
              {hasSupplierItems && (
                <div className="mt-6 rounded-lg border border-[var(--color-gray-dark)] bg-[var(--color-gray-light)] p-4">
                  <div className="flex items-start gap-3">
                    <Package className="mt-0.5 h-5 w-5 flex-shrink-0 text-[var(--color-text-secondary)]" />
                    <div>
                      <p className="text-caption font-medium text-[var(--color-text-primary)]">
                        *** These products will ship to you directly from our supplier warehouse
                      </p>
                      <p className="mt-1 text-caption italic text-[var(--color-text-secondary)]">
                        No additional delays expected
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer with Summary */}
            <div className="border-t border-[var(--color-gray-dark)] bg-white px-6 py-4">
              <CartSummary
                subtotal={totals.subtotal}
                savings={totals.savings}
                total={totals.total}
                showCheckoutButton
                isDrawer
                onViewCart={handleViewCart}
              />
            </div>
          </>
        )}
      </div>
    </>
  );
}
