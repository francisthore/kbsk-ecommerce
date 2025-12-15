"use client";

import Image from "next/image";
import Link from "next/link";
import { Trash2 } from "lucide-react";
import { CartItemData } from "@/store/cart.store";
import { formatPrice, getVariantDisplay } from "@/lib/utils/cart";
import CartQuantitySelector from "./CartQuantitySelector";
import { removeFromCart } from "@/lib/actions/cart";
import { useCartStore } from "@/store/cart.store";
import { toast } from "sonner";
import { useState } from "react";

interface CartItemRowProps {
  item: CartItemData;
  showRemoveButton?: boolean;
  compact?: boolean;
}

export default function CartItemRow({
  item,
  showRemoveButton = true,
  compact = false,
}: CartItemRowProps) {
  const [isRemoving, setIsRemoving] = useState(false);
  const removeItem = useCartStore((state) => state.removeItem);

  const handleRemove = async () => {
    setIsRemoving(true);
    
    // Optimistic update
    removeItem(item.cartItemId);
    
    try {
      const result = await removeFromCart(item.cartItemId);
      
      if (result.success) {
        toast.success("Item removed from cart");
      } else {
        toast.error(result.error || "Failed to remove item");
      }
    } catch (error) {
      toast.error("Failed to remove item");
    } finally {
      setIsRemoving(false);
    }
  };

  const currentPrice = parseFloat(item.salePrice || item.price);
  const originalPrice = parseFloat(item.price);
  const hasDiscount = item.salePrice && currentPrice < originalPrice;
  const variantText = getVariantDisplay(item);

  return (
    <div className={`flex gap-4 ${compact ? "py-3" : "py-4"} ${isRemoving ? "opacity-50" : ""}`}>
      {/* Product Image */}
      <Link
        href={`/products/${item.productId}`}
        className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border border-[var(--color-gray-dark)] bg-[var(--color-gray-light)] transition-opacity hover:opacity-80"
      >
        {item.image ? (
          <Image
            src={item.image}
            alt={item.productName}
            fill
            className="object-cover"
            sizes="80px"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[var(--color-text-muted)]">
            <span className="text-caption">No image</span>
          </div>
        )}
      </Link>

      {/* Product Details */}
      <div className="flex flex-1 flex-col justify-between">
        <div>
          {/* Brand */}
          {item.brand && (
            <p className="mb-1 text-caption font-medium uppercase tracking-wide text-[var(--color-text-secondary)]">
              {item.brand}
            </p>
          )}
          
          {/* Product Name */}
          <Link
            href={`/products/${item.productId}`}
            className="mb-1 block text-body-medium text-[var(--color-text-primary)] transition-colors hover:text-[var(--color-cta)] focus:outline-none focus:underline"
          >
            {item.productName}
          </Link>
          
          {/* Variant Info */}
          {variantText && (
            <p className="mb-2 text-body text-[var(--color-text-secondary)]">
              {variantText}
            </p>
          )}
          
          {/* Price */}
          <div className="flex items-baseline gap-2">
            <span className="text-body-medium font-semibold text-[var(--color-cta)]">
              {formatPrice(currentPrice)}
            </span>
            {hasDiscount && (
              <span className="text-body text-[var(--color-text-muted)] line-through">
                {formatPrice(originalPrice)}
              </span>
            )}
          </div>
        </div>

        {/* Quantity and Remove (Mobile) */}
        <div className={`mt-3 flex items-center justify-between ${compact ? "md:hidden" : "lg:hidden"}`}>
          <CartQuantitySelector
            cartItemId={item.cartItemId}
            initialQuantity={item.quantity}
            maxStock={item.inStock}
          />
          
          {showRemoveButton && (
            <button
              type="button"
              onClick={handleRemove}
              disabled={isRemoving}
              className="flex items-center gap-1 text-caption text-[var(--color-text-secondary)] transition-colors hover:text-red-600 focus:outline-none focus:underline disabled:opacity-40"
            >
              <Trash2 className="h-4 w-4" />
              <span>Remove</span>
            </button>
          )}
        </div>
      </div>

      {/* Quantity (Desktop) */}
      <div className={`hidden ${compact ? "md:flex" : "lg:flex"} items-center`}>
        <CartQuantitySelector
          cartItemId={item.cartItemId}
          initialQuantity={item.quantity}
          maxStock={item.inStock}
        />
      </div>

      {/* Total Price (Desktop) */}
      <div className={`hidden ${compact ? "md:flex" : "lg:flex"} w-24 items-center justify-end`}>
        <span className="text-body-medium font-semibold text-[var(--color-text-primary)]">
          {formatPrice(currentPrice * item.quantity)}
        </span>
      </div>

      {/* Remove Button (Desktop) */}
      {showRemoveButton && (
        <div className={`hidden ${compact ? "md:flex" : "lg:flex"} items-center`}>
          <button
            type="button"
            onClick={handleRemove}
            disabled={isRemoving}
            className="rounded p-2 text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-gray-light)] hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-600 disabled:opacity-40"
            aria-label="Remove item"
          >
            <Trash2 className="h-5 w-5" />
          </button>
        </div>
      )}
    </div>
  );
}
