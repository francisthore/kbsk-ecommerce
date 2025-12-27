"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils/utils";

interface FilterOption {
  id: string;
  name: string;
  slug: string;
}

interface GenderOption {
  id: string;
  label: string;
  slug: string;
}

interface AvailableFilters {
  brands: FilterOption[];
  categories: FilterOption[];
  colors: (FilterOption & { hexCode: string })[];
  sizes: (FilterOption & { sortOrder: number })[];
  genders: GenderOption[];
  priceRange: { min: number; max: number };
}

interface CurrentFilters {
  categoryIds?: string[];
  brandIds?: string[];
  colorIds?: string[];
  sizeIds?: string[];
  genderIds?: string[];
  priceMin?: number;
  priceMax?: number;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  onSale?: boolean;
}

interface ProductsFiltersProps {
  availableFilters: AvailableFilters;
  currentFilters: CurrentFilters;
}

export function ProductsFilters({
  availableFilters,
  currentFilters,
}: ProductsFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(true);

  const updateFilter = (key: string, value: string, checked: boolean) => {
    const params = new URLSearchParams(searchParams.toString());
    const existing = params.getAll(key);

    if (checked) {
      params.append(key, value);
    } else {
      params.delete(key);
      existing
        .filter((v) => v !== value)
        .forEach((v) => params.append(key, v));
    }

    // Reset to page 1 when filters change
    params.delete("page");

    router.push(`/products?${params.toString()}`, { scroll: false });
  };

  const updatePriceRange = (min?: string, max?: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (min) params.set("priceMin", min);
    else params.delete("priceMin");

    if (max) params.set("priceMax", max);
    else params.delete("priceMax");

    params.delete("page");
    router.push(`/products?${params.toString()}`, { scroll: false });
  };

  const clearAllFilters = () => {
    const params = new URLSearchParams();
    const sort = searchParams.get("sort");
    if (sort) params.set("sort", sort);
    router.push(`/products?${params.toString()}`);
  };

  const hasActiveFilters = searchParams.toString().includes("brand=") ||
    searchParams.toString().includes("category=") ||
    searchParams.toString().includes("color=") ||
    searchParams.toString().includes("size=") ||
    searchParams.toString().includes("gender=") ||
    searchParams.toString().includes("price");

  return (
    <div className="space-y-6 rounded-lg border border-light-200 bg-white p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-heading-4 text-dark-900">Filters</h2>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="text-sm text-primary-600 hover:text-primary-700"
          >
            Clear all
          </Button>
        )}
      </div>

      {/* Categories */}
      {availableFilters.categories.length > 0 && (
        <FilterSection title="Categories">
          {availableFilters.categories.map((category) => (
            <FilterCheckbox
              key={category.id}
              id={category.id}
              label={category.name}
              checked={!!currentFilters.categoryIds?.includes(category.id)}
              onCheckedChange={(checked) =>
                updateFilter("category", category.id, checked as boolean)
              }
            />
          ))}
        </FilterSection>
      )}

      {/* Brands */}
      {availableFilters.brands.length > 0 && (
        <FilterSection title="Brands">
          {availableFilters.brands.slice(0, 8).map((brand) => (
            <FilterCheckbox
              key={brand.id}
              id={brand.id}
              label={brand.name}
              checked={!!currentFilters.brandIds?.includes(brand.id)}
              onCheckedChange={(checked) =>
                updateFilter("brand", brand.id, checked as boolean)
              }
            />
          ))}
        </FilterSection>
      )}

      {/* Price Range */}
      {availableFilters.priceRange.max > 0 && (
        <FilterSection title="Price Range">
          <div className="space-y-3">
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="Min"
                min={0}
                max={availableFilters.priceRange.max}
                defaultValue={currentFilters.priceMin}
                onChange={(e) =>
                  updatePriceRange(e.target.value, searchParams.get("priceMax") || undefined)
                }
                className="w-full"
              />
              <Input
                type="number"
                placeholder="Max"
                min={0}
                max={availableFilters.priceRange.max}
                defaultValue={currentFilters.priceMax}
                onChange={(e) =>
                  updatePriceRange(searchParams.get("priceMin") || undefined, e.target.value)
                }
                className="w-full"
              />
            </div>
            <p className="text-caption text-dark-600">
              R{availableFilters.priceRange.min} - R
              {availableFilters.priceRange.max}
            </p>
          </div>
        </FilterSection>
      )}

      {/* Colors */}
      {availableFilters.colors.length > 0 && (
        <FilterSection title="Colors">
          <div className="grid grid-cols-6 gap-2">
            {availableFilters.colors.map((color) => (
              <button
                key={color.id}
                onClick={() =>
                  updateFilter(
                    "color",
                    color.id,
                    !currentFilters.colorIds?.includes(color.id)
                  )
                }
                className={cn(
                  "h-8 w-8 rounded-full border-2 transition-all",
                  currentFilters.colorIds?.includes(color.id)
                    ? "border-dark-900 ring-2 ring-primary-500 ring-offset-2"
                    : "border-light-300 hover:border-dark-600"
                )}
                style={{ backgroundColor: color.hexCode }}
                title={color.name}
              />
            ))}
          </div>
        </FilterSection>
      )}

      {/* Sizes */}
      {availableFilters.sizes.length > 0 && (
        <FilterSection title="Sizes">
          <div className="grid grid-cols-4 gap-2">
            {availableFilters.sizes.map((size) => (
              <button
                key={size.id}
                onClick={() =>
                  updateFilter(
                    "size",
                    size.id,
                    !currentFilters.sizeIds?.includes(size.id)
                  )
                }
                className={cn(
                  "rounded-md border px-3 py-2 text-sm font-medium transition-colors",
                  currentFilters.sizeIds?.includes(size.id)
                    ? "border-dark-900 bg-dark-900 text-white"
                    : "border-light-300 bg-white text-dark-900 hover:border-dark-600"
                )}
              >
                {size.name}
              </button>
            ))}
          </div>
        </FilterSection>
      )}

      {/* Gender */}
      {availableFilters.genders.length > 0 && (
        <FilterSection title="Gender">
          {availableFilters.genders.map((gender) => (
            <FilterCheckbox
              key={gender.id}
              id={gender.id}
              label={gender.label}
              checked={!!currentFilters.genderIds?.includes(gender.id)}
              onCheckedChange={(checked) =>
                updateFilter("gender", gender.id, checked as boolean)
              }
            />
          ))}
        </FilterSection>
      )}

      {/* Availability */}
      <FilterSection title="Availability">
        <FilterCheckbox
          id="inStock"
          label="In Stock Only"
          checked={currentFilters.inStock === true}
          onCheckedChange={(checked) =>
            updateFilter("inStock", "true", checked as boolean)
          }
        />
        <FilterCheckbox
          id="onSale"
          label="On Sale"
          checked={currentFilters.onSale === true}
          onCheckedChange={(checked) =>
            updateFilter("onSale", "true", checked as boolean)
          }
        />
      </FilterSection>
    </div>
  );
}

function FilterSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-3 border-b border-light-200 pb-6 last:border-b-0">
      <h3 className="text-sm font-semibold text-dark-900">{title}</h3>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function FilterCheckbox({
  id,
  label,
  checked,
  onCheckedChange,
}: {
  id: string;
  label: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-center space-x-2">
      <Checkbox
        id={id}
        checked={checked}
        onCheckedChange={onCheckedChange}
      />
      <Label
        htmlFor={id}
        className="text-sm font-normal text-dark-900 cursor-pointer"
      >
        {label}
      </Label>
    </div>
  );
}
