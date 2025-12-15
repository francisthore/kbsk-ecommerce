"use client";

interface VariantOption {
  id: string;
  name: string;
  value: string;
  inStock: number;
  hexCode?: string | null;
}

interface VariantSelectorProps {
  colors?: VariantOption[];
  sizes?: VariantOption[];
  selectedColor?: string;
  selectedSize?: string;
  onColorChange?: (colorId: string) => void;
  onSizeChange?: (sizeId: string) => void;
}

export default function VariantSelector({
  colors = [],
  sizes = [],
  selectedColor,
  selectedSize,
  onColorChange,
  onSizeChange,
}: VariantSelectorProps) {
  return (
    <div className="flex flex-col gap-6">
      {/* Color Selection */}
      {colors.length > 0 && (
        <div>
          <label className="mb-3 block text-body-medium text-dark-900">
            Color: {colors.find((c) => c.id === selectedColor)?.name || "Select"}
          </label>
          <div className="flex flex-wrap gap-2">
            {colors.map((color) => {
              const isSelected = color.id === selectedColor;
              const isOutOfStock = color.inStock === 0;

              return (
                <button
                  key={color.id}
                  onClick={() => !isOutOfStock && onColorChange?.(color.id)}
                  disabled={isOutOfStock}
                  className={`relative h-10 w-10 rounded-full border-2 transition ${
                    isSelected
                      ? "border-dark-900 ring-2 ring-dark-900 ring-offset-2"
                      : "border-light-300 hover:border-dark-500"
                  } ${isOutOfStock ? "cursor-not-allowed opacity-40" : "cursor-pointer"}`}
                  style={{
                    backgroundColor: color.hexCode || "#e5e5e5",
                  }}
                  title={`${color.name}${isOutOfStock ? " (Out of stock)" : ""}`}
                  aria-label={`Select ${color.name}`}
                  aria-pressed={isSelected}
                >
                  {isOutOfStock && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="h-px w-full rotate-45 bg-dark-900" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Size Selection */}
      {sizes.length > 0 && (
        <div>
          <label className="mb-3 block text-body-medium text-dark-900">
            Size: {sizes.find((s) => s.id === selectedSize)?.name || "Select"}
          </label>
          <div className="flex flex-wrap gap-2">
            {sizes.map((size) => {
              const isSelected = size.id === selectedSize;
              const isOutOfStock = size.inStock === 0;

              return (
                <button
                  key={size.id}
                  onClick={() => !isOutOfStock && onSizeChange?.(size.id)}
                  disabled={isOutOfStock}
                  className={`min-w-[60px] rounded-lg border-2 px-4 py-2 text-body-medium transition ${
                    isSelected
                      ? "border-dark-900 bg-dark-900 text-white"
                      : "border-light-300 bg-white text-dark-900 hover:border-dark-500"
                  } ${isOutOfStock ? "cursor-not-allowed opacity-40 line-through" : "cursor-pointer"}`}
                  title={isOutOfStock ? `${size.name} (Out of stock)` : size.name}
                  aria-label={`Select size ${size.name}`}
                  aria-pressed={isSelected}
                >
                  {size.name}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
