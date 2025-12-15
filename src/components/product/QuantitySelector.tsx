"use client";

import { useState } from "react";
import { Minus, Plus } from "lucide-react";

interface QuantitySelectorProps {
  initialQuantity?: number;
  min?: number;
  max?: number;
  onQuantityChange?: (quantity: number) => void;
}

export default function QuantitySelector({
  initialQuantity = 1,
  min = 1,
  max = 99,
  onQuantityChange,
}: QuantitySelectorProps) {
  const [quantity, setQuantity] = useState(initialQuantity);

  const handleIncrement = () => {
    if (quantity < max) {
      const newQuantity = quantity + 1;
      setQuantity(newQuantity);
      onQuantityChange?.(newQuantity);
    }
  };

  const handleDecrement = () => {
    if (quantity > min) {
      const newQuantity = quantity - 1;
      setQuantity(newQuantity);
      onQuantityChange?.(newQuantity);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (isNaN(value)) {
      setQuantity(min);
      onQuantityChange?.(min);
    } else if (value < min) {
      setQuantity(min);
      onQuantityChange?.(min);
    } else if (value > max) {
      setQuantity(max);
      onQuantityChange?.(max);
    } else {
      setQuantity(value);
      onQuantityChange?.(value);
    }
  };

  return (
    <div>
      <label className="mb-2 block text-body-medium text-dark-900">Quantity</label>
      <div className="inline-flex items-center rounded-lg border border-light-300">
        <button
          onClick={handleDecrement}
          disabled={quantity <= min}
          className="flex h-10 w-10 items-center justify-center border-r border-light-300 text-dark-900 transition hover:bg-light-100 disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Decrease quantity"
        >
          <Minus className="h-4 w-4" />
        </button>
        <input
          type="number"
          min={min}
          max={max}
          value={quantity}
          onChange={handleInputChange}
          className="h-10 w-16 border-0 text-center text-body-medium text-dark-900 focus:outline-none focus:ring-0"
          aria-label="Quantity"
        />
        <button
          onClick={handleIncrement}
          disabled={quantity >= max}
          className="flex h-10 w-10 items-center justify-center border-l border-light-300 text-dark-900 transition hover:bg-light-100 disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Increase quantity"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
