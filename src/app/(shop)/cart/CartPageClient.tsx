"use client";

import { useEffect } from "react";
import { Truck, Package, Lock } from "lucide-react";
import { useCartStore } from "@/store/cart.store";
import { formatPrice, groupItemsBySupplier } from "@/lib/utils/cart";
import CartItemRow from "@/components/cart/CartItemRow";
import CartSummary from "@/components/cart/CartSummary";
import EmptyCart from "@/components/cart/EmptyCart";
import EstimateShipping from "@/components/cart/EstimateShipping";
import OrderInstructions from "@/components/cart/OrderInstructions";

interface CartPageClientProps {
  initialCartData: Awaited<ReturnType<typeof import("@/lib/actions/cart").getCart>>;
}

export default function CartPageClient({ initialCartData }: CartPageClientProps) {
  const { setCart, items, totals, freeShipping } = useCartStore();

  // Sync initial cart data with store
  useEffect(() => {
    setCart(initialCartData);
  }, [initialCartData, setCart]);

  // ✅ Use initialCartData for the empty check to avoid sync timing issues
  if (initialCartData.items.length === 0) {
    return (
      <div className="mx-auto w-[90%] py-8">
        <h1 className="mb-8 text-heading-3 font-bold text-[var(--color-text-primary)]">
          My Cart
        </h1>
        <EmptyCart />
      </div>
    );
  }

  // Use store items for rendering (will be synced after first render)
  const displayItems = items.length > 0 ? items : initialCartData.items;
  const displayTotals = items.length > 0 ? totals : initialCartData.totals;
  const displayFreeShipping = items.length > 0 ? freeShipping : initialCartData.freeShipping;

  const { supplier: supplierItems } = groupItemsBySupplier(displayItems);
  const hasSupplierItems = supplierItems.length > 0;

  return (
    <div className="mx-auto w-[90%] py-8">
      {/* Page Title */}
      <h1 className="mb-6 text-heading-3 font-bold text-[var(--color-text-primary)]">
        My Cart
      </h1>

      {/* Free Shipping Banner */}
      <div className="mb-6 rounded-lg border border-[var(--color-gray-dark)] bg-[var(--color-gray-light)] px-6 py-4">
        {displayFreeShipping.eligible ? (
          <div className="flex items-center gap-3 text-body font-medium text-[var(--color-success)]">
            <Truck className="h-5 w-5" />
            <span>You are eligible for free shipping!</span>
          </div>
        ) : (
          <div className="flex items-center gap-3 text-body font-medium text-[var(--color-text-secondary)]">
            <Truck className="h-5 w-5" />
            <span>
              Add {formatPrice(displayFreeShipping.amountRemaining)} more for free shipping!
            </span>
          </div>
        )}
      </div>

      {/* Main Cart Layout */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Cart Items - Left Column */}
        <div className="lg:col-span-2">
          {/* Desktop Table Header */}
          <div className="mb-4 hidden grid-cols-12 gap-4 border-b border-[var(--color-gray-dark)] pb-3 text-caption font-semibold uppercase tracking-wide text-[var(--color-text-secondary)] lg:grid">
            <div className="col-span-6">Product</div>
            <div className="col-span-2 text-center">Quantity</div>
            <div className="col-span-2 text-right">Total</div>
            <div className="col-span-2 text-right">Remove</div>
          </div>

          {/* Cart Items List */}
          <div className="divide-y divide-[var(--color-gray-dark)] rounded-lg border border-[var(--color-gray-dark)] bg-white">
            {displayItems.map((item) => (
              <div key={item.cartItemId} className="px-4 lg:px-6">
                <CartItemRow item={item} />
              </div>
            ))}
          </div>

          {/* Supplier Warehouse Notice */}
          {hasSupplierItems && (
            <div className="mt-6 rounded-lg border border-[var(--color-gray-dark)] bg-[var(--color-gray-light)] p-6">
              <div className="flex items-start gap-4">
                <Package className="mt-0.5 h-6 w-6 flex-shrink-0 text-[var(--color-text-secondary)]" />
                <div>
                  <p className="text-body font-medium text-[var(--color-text-primary)]">
                    *** These products will ship to you directly from our supplier warehouse
                  </p>
                  <p className="mt-1 text-body italic text-[var(--color-text-secondary)]">
                    No additional delays expected
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Estimate Shipping & Order Instructions */}
          <div className="mt-8 rounded-lg border border-[var(--color-gray-dark)] bg-white p-6">
            <EstimateShipping />
            <OrderInstructions />
          </div>
        </div>

        {/* Summary - Right Column */}
        <div className="lg:col-span-1">
          <div className="sticky top-24">
            <CartSummary
              subtotal={displayTotals.subtotal}
              savings={displayTotals.savings}
              total={displayTotals.total}
              showCheckoutButton
            />

            {/* Secure Payments Badge */}
            <div className="mt-6 flex items-center justify-center gap-2 text-caption text-[var(--color-text-secondary)]">
              <Lock className="h-4 w-4" />
              <span>100% Secure Payments</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recently Viewed Section (TODO: Implement) */}
      {/* <div className="mt-12">
        <h2 className="mb-6 text-lead font-semibold text-[var(--color-text-primary)]">
          Recently Viewed
        </h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          Horizontal scrollable product cards
        </div>
      </div> */}
    </div>
  );
}
