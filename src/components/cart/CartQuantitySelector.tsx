"use client";

import { useState } from "react";
import { Minus, Plus } from "lucide-react";
import { updateCartItemQuantity } from "@/lib/actions/cart";
import { useCartStore } from "@/store/cart.store";
import { toast } from "sonner";

interface CartQuantitySelectorProps {
  cartItemId: string;
  initialQuantity: number;
  maxStock: number;
  onUpdate?: (newQuantity: number) => void;
}

export default function CartQuantitySelector({
  cartItemId,
  initialQuantity,
  maxStock,
  onUpdate,
}: CartQuantitySelectorProps) {
  const [quantity, setQuantity] = useState(initialQuantity);
  const [isUpdating, setIsUpdating] = useState(false);
  const updateItemQuantity = useCartStore((state) => state.updateItemQuantity);

  const handleQuantityChange = async (newQuantity: number) => {
    if (newQuantity < 1 || newQuantity > maxStock) return;
    
    // Optimistic update
    setQuantity(newQuantity);
    updateItemQuantity(cartItemId, newQuantity);
    onUpdate?.(newQuantity);

    setIsUpdating(true);
    
    try {
      const result = await updateCartItemQuantity(cartItemId, newQuantity);
      
      if (!result.success) {
        // Rollback on error
        setQuantity(initialQuantity);
        updateItemQuantity(cartItemId, initialQuantity);
        onUpdate?.(initialQuantity);
        toast.error(result.error || "Failed to update quantity");
      }
    } catch (error) {
      // Rollback on error
      setQuantity(initialQuantity);
      updateItemQuantity(cartItemId, initialQuantity);
      onUpdate?.(initialQuantity);
      toast.error("Failed to update quantity");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleIncrement = () => {
    if (quantity < maxStock) {
      handleQuantityChange(quantity + 1);
    } else {
      toast.warning(`Only ${maxStock} items available in stock`);
    }
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      handleQuantityChange(quantity - 1);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value)) {
      if (value > maxStock) {
        toast.warning(`Only ${maxStock} items available in stock`);
        setQuantity(maxStock);
      } else if (value < 1) {
        setQuantity(1);
      } else {
        handleQuantityChange(value);
      }
    }
  };

  return (
    <div className="inline-flex items-center gap-2 rounded-lg border border-[var(--color-gray-dark)] bg-white">
      <button
        type="button"
        onClick={handleDecrement}
        disabled={quantity <= 1 || isUpdating}
        className="flex h-9 w-9 items-center justify-center rounded-l-lg text-[var(--color-text-primary)] transition-colors hover:bg-[var(--color-gray-light)] disabled:cursor-not-allowed disabled:opacity-40"
        aria-label="Decrease quantity"
      >
        <Minus className="h-4 w-4" />
      </button>
      
      <input
        type="number"
        min="1"
        max={maxStock}
        value={quantity}
        onChange={handleInputChange}
        disabled={isUpdating}
        className="h-9 w-12 border-x border-[var(--color-gray-dark)] bg-transparent text-center text-body font-medium text-[var(--color-text-primary)] focus:outline-none disabled:opacity-40"
        aria-label="Quantity"
      />
      
      <button
        type="button"
        onClick={handleIncrement}
        disabled={quantity >= maxStock || isUpdating}
        className="flex h-9 w-9 items-center justify-center rounded-r-lg text-[var(--color-text-primary)] transition-colors hover:bg-[var(--color-gray-light)] disabled:cursor-not-allowed disabled:opacity-40"
        aria-label="Increase quantity"
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
}
