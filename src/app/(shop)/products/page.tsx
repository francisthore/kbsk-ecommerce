import { Suspense } from "react";
import {
  ProductsGrid,
  ProductsFilters,
  ProductsSort,
  ProductsPagination,
  FilterBadges,
  ProductsGridSkeleton,
} from "@/components/products";
import { getProducts } from "@/lib/db/queries/products";
import type { ProductFilters } from "@/lib/db/queries/products";

// Make this configurable
const PRODUCTS_PER_PAGE = 16;

type SearchParams = {
  page?: string;
  sort?: string;
  search?: string;
  category?: string | string[];
  brand?: string | string[];
  color?: string | string[];
  size?: string | string[];
  gender?: string | string[];
  priceMin?: string;
  priceMax?: string;
  inStock?: string;
  onSale?: string;
};

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;

  // Parse filters from URL
  const filters: ProductFilters = {
    categoryIds: params.category
      ? Array.isArray(params.category)
        ? params.category
        : [params.category]
      : undefined,
    brandIds: params.brand
      ? Array.isArray(params.brand)
        ? params.brand
        : [params.brand]
      : undefined,
    colorIds: params.color
      ? Array.isArray(params.color)
        ? params.color
        : [params.color]
      : undefined,
    sizeIds: params.size
      ? Array.isArray(params.size)
        ? params.size
        : [params.size]
      : undefined,
    genderIds: params.gender
      ? Array.isArray(params.gender)
        ? params.gender
        : [params.gender]
      : undefined,
    priceMin: params.priceMin ? parseFloat(params.priceMin) : undefined,
    priceMax: params.priceMax ? parseFloat(params.priceMax) : undefined,
    inStock: params.inStock === "true" ? true : undefined,
    onSale: params.onSale === "true" ? true : undefined,
    search: params.search,
  };

  const page = params.page ? parseInt(params.page) : 1;
  const sortParam = (params.sort as "newest" | "oldest" | "price-asc" | "price-desc" | undefined) || "newest";
  const sort = sortParam.replace(/-/g, "_") as "newest" | "oldest" | "price_asc" | "price_desc";

  // Fetch products
  const { items: products, total, filters: availableFilters } = await getProducts(
    filters,
    {
      page,
      pageSize: PRODUCTS_PER_PAGE,
      sort,
    }
  );

  const totalPages = Math.ceil(total / PRODUCTS_PER_PAGE);

  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto w-[90%] px-4 py-8">
        {/* Header */}
        <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-heading-2 text-dark-900">All Products</h1>
            <p className="text-body text-dark-700">
              {total} {total === 1 ? "product" : "products"} found
            </p>
          </div>
          <ProductsSort currentSort={sort} />
        </header>

        {/* Active Filter Badges */}
        <FilterBadges filters={filters} availableFilters={availableFilters} />

        {/* Main Content */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[280px_1fr]">
          {/* Filters Sidebar */}
          <aside className="lg:sticky lg:top-4 lg:h-fit">
            <ProductsFilters
              availableFilters={availableFilters}
              currentFilters={filters}
            />
          </aside>

          {/* Products Grid */}
          <div className="space-y-8">
            <Suspense fallback={<ProductsGridSkeleton />}>
              <ProductsGrid products={products} />
            </Suspense>

            {/* Pagination */}
            {totalPages > 1 && (
              <ProductsPagination
                currentPage={page}
                totalPages={totalPages}
                totalProducts={total}
              />
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
