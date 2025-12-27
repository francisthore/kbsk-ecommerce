"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { X } from "lucide-react";

interface FilterOption {
  id: string;
  name: string;
}

interface GenderOption {
  id: string;
  label: string;
  slug: string;
}

interface AvailableFilters {
  categories: FilterOption[];
  brands: FilterOption[];
  colors: FilterOption[];
  sizes: FilterOption[];
  genders: GenderOption[];
}

interface Filters {
  categoryIds?: string[];
  brandIds?: string[];
  colorIds?: string[];
  sizeIds?: string[];
  genderIds?: string[];
  priceMin?: string | number;
  priceMax?: string | number;
  inStock?: boolean;
  onSale?: boolean;
}

export function FilterBadges({ filters, availableFilters }: {
  filters: Filters;
  availableFilters: AvailableFilters;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const badges: Array<{ label: string; key: string; value: string }> = [];

  // Categories
  filters.categoryIds?.forEach((id: string) => {
    const cat = availableFilters.categories.find((c) => c.id === id);
    if (cat) badges.push({ label: cat.name, key: "category", value: id });
  });

  // Brands
  filters.brandIds?.forEach((id: string) => {
    const brand = availableFilters.brands.find((b) => b.id === id);
    if (brand) badges.push({ label: brand.name, key: "brand", value: id });
  });

  // Colors
  filters.colorIds?.forEach((id: string) => {
    const color = availableFilters.colors.find((c) => c.id === id);
    if (color) badges.push({ label: color.name, key: "color", value: id });
  });

  // Sizes
  filters.sizeIds?.forEach((id: string) => {
    const size = availableFilters.sizes.find((s) => s.id === id);
    if (size) badges.push({ label: `Size: ${size.name}`, key: "size", value: id });
  });

  // Genders
  filters.genderIds?.forEach((id: string) => {
    const gender = availableFilters.genders.find((g) => g.id === id);
    if (gender) badges.push({ label: gender.label, key: "gender", value: id });
  });

  // Price
  if (filters.priceMin || filters.priceMax) {
    const label = filters.priceMin && filters.priceMax
      ? `$${filters.priceMin} - $${filters.priceMax}`
      : filters.priceMin
        ? `Over $${filters.priceMin}`
        : `Under $${filters.priceMax}`;
    badges.push({ label, key: "price", value: "range" });
  }

  // Stock/Sale
  if (filters.inStock) badges.push({ label: "In Stock", key: "inStock", value: "true" });
  if (filters.onSale) badges.push({ label: "On Sale", key: "onSale", value: "true" });

  const removeBadge = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (key === "price") {
      params.delete("priceMin");
      params.delete("priceMax");
    } else {
      const existing = params.getAll(key);
      params.delete(key);
      existing.filter((v) => v !== value).forEach((v) => params.append(key, v));
    }

    params.delete("page");
    router.push(`/products?${params.toString()}`, { scroll: false });
  };

  if (badges.length === 0) return null;

  return (
    <div className="mb-6 flex flex-wrap items-center gap-2">
      <span className="text-sm font-medium text-dark-700">Active filters:</span>
      {badges.map((badge, index) => (
        <button
          key={`${badge.key}-${badge.value}-${index}`}
          onClick={() => removeBadge(badge.key, badge.value)}
          className="inline-flex items-center gap-1 rounded-full border border-light-300 bg-light-50 px-3 py-1 text-sm text-dark-900 transition-colors hover:bg-light-100"
        >
          {badge.label}
          <X className="h-3 w-3" />
        </button>
      ))}
    </div>
  );
}
