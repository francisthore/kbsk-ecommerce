import { db } from '@/lib/db';
import {
  products,
  productVariants,
  productImages,
  categories,
  brands,
  productStandards,
  colors,
  sizes,
  genders,
  productCollections,
  collections,
  reviews,
  productToCategories,
} from '@/lib/db/schema';
import {
  eq,
  and,
  or,
  desc,
  asc,
  inArray,
  gte,
  lte,
  gt,
  like,
  sql,
  isNull,
  count,
  avg,
} from 'drizzle-orm';

// ============================================================================
// TYPES
// ============================================================================

export type SortOption =
  | 'newest'
  | 'oldest'
  | 'price_asc'
  | 'price_desc'
  | 'name_asc'
  | 'name_desc'
  | 'popularity'
  | 'rating';

export interface ProductFilters {
  categoryIds?: string[];
  brandIds?: string[];
  colorIds?: string[];
  sizeIds?: string[];
  genderIds?: string[];
  productTypes?: string[];
  collectionIds?: string[];
  priceMin?: number;
  priceMax?: number;
  inStock?: boolean;
  onSale?: boolean;
  search?: string;
  standards?: string[];
  hazmat?: boolean;
}

export interface PaginationOptions {
  page?: number;
  pageSize?: number;
  sort?: SortOption;
}

// ============================================================================
// MAIN PRODUCT QUERY WITH FILTERS
// ============================================================================

export async function getProducts(
  filters: ProductFilters = {},
  options: PaginationOptions = {}
) {
  const { page = 1, pageSize = 12, sort = 'newest' } = options;

  // Build WHERE conditions
  const conditions = [eq(products.isPublished, true), isNull(products.deletedAt)];

  if (filters.categoryIds?.length) {
    // Use subquery to check if product is in any of the specified categories
    const productIdsInCategories = db
      .selectDistinct({ productId: productToCategories.productId })
      .from(productToCategories)
      .where(inArray(productToCategories.categoryId, filters.categoryIds));
    
    conditions.push(inArray(products.id, productIdsInCategories));
  }

  if (filters.brandIds?.length) {
    conditions.push(inArray(products.brandId, filters.brandIds));
  }

  if (filters.genderIds?.length) {
    conditions.push(inArray(products.genderId, filters.genderIds));
  }

  if (filters.productTypes?.length) {
    conditions.push(inArray(products.productType, filters.productTypes as any));
  }

  if (filters.hazmat !== undefined) {
    conditions.push(eq(products.hazmat, filters.hazmat));
  }

  if (filters.search) {
    conditions.push(
      or(
        like(products.name, `%${filters.search}%`),
        like(products.description, `%${filters.search}%`)
      )!
    );
  }

  // Fetch base products
  let baseProducts = await db.query.products.findMany({
    where: and(...conditions),
  });

  const productIds = baseProducts.map((p) => p.id);
  if (!productIds.length) {
    return { items: [], total: 0, filters: getEmptyFilterOptions() };
  }

  // Fetch variants for filtering and pricing
  const allVariants = await db.query.productVariants.findMany({
    where: and(
      inArray(productVariants.productId, productIds),
      isNull(productVariants.deletedAt)
    ),
  });

  // Apply variant-level filters
  let filteredProductIds = new Set(productIds);

  if (filters.colorIds?.length) {
    const matchingIds = allVariants
      .filter((v) => filters.colorIds!.includes(v.colorId!))
      .map((v) => v.productId);
    filteredProductIds = new Set(
      [...filteredProductIds].filter((id) => matchingIds.includes(id))
    );
  }

  if (filters.sizeIds?.length) {
    const matchingIds = allVariants
      .filter((v) => filters.sizeIds!.includes(v.sizeId!))
      .map((v) => v.productId);
    filteredProductIds = new Set(
      [...filteredProductIds].filter((id) => matchingIds.includes(id))
    );
  }

  if (filters.inStock) {
    const inStockIds = allVariants
      .filter((v) => v.inStock > 0)
      .map((v) => v.productId);
    filteredProductIds = new Set(
      [...filteredProductIds].filter((id) => inStockIds.includes(id))
    );
  }

  if (filters.onSale) {
    const saleIds = allVariants
      .filter((v) => v.salePrice !== null)
      .map((v) => v.productId);
    filteredProductIds = new Set(
      [...filteredProductIds].filter((id) => saleIds.includes(id))
    );
  }

  // Price filtering
  if (filters.priceMin !== undefined || filters.priceMax !== undefined) {
    const priceFilteredIds = allVariants
      .filter((v) => {
        const price = Number(v.salePrice ?? v.price);
        if (filters.priceMin !== undefined && price < filters.priceMin)
          return false;
        if (filters.priceMax !== undefined && price > filters.priceMax)
          return false;
        return true;
      })
      .map((v) => v.productId);
    filteredProductIds = new Set(
      [...filteredProductIds].filter((id) => priceFilteredIds.includes(id))
    );
  }

  // Collection filtering
  if (filters.collectionIds?.length) {
    const productCollectionsData = await db.query.productCollections.findMany({
      where: inArray(productCollections.collectionId, filters.collectionIds),
    });
    const collectionProductIds = productCollectionsData.map((pc) => pc.productId);
    filteredProductIds = new Set(
      [...filteredProductIds].filter((id) => collectionProductIds.includes(id))
    );
  }

  // Standards filtering
  if (filters.standards?.length) {
    const standardsData = await db.query.productStandards.findMany({
      where: inArray(productStandards.code, filters.standards),
    });
    const standardProductIds = standardsData.map((s) => s.productId);
    filteredProductIds = new Set(
      [...filteredProductIds].filter((id) => standardProductIds.includes(id))
    );
  }

  baseProducts = baseProducts.filter((p) => filteredProductIds.has(p.id));

  // Fetch primary images
  const images = await db.query.productImages.findMany({
    where: and(
      eq(productImages.isPrimary, true),
      inArray(productImages.productId, [...filteredProductIds])
    ),
  });

  // Fetch brands
  const brandIds = [...new Set(baseProducts.map((p) => p.brandId).filter(Boolean))];
  const brandsData = brandIds.length
    ? await db.query.brands.findMany({ where: inArray(brands.id, brandIds as string[]) })
    : [];

  // Calculate min/max prices and stock
  const productMetaMap = new Map<
    string,
    { minPrice: number; maxPrice: number; inStock: boolean; onSale: boolean }
  >();

  for (const product of baseProducts) {
    const variants = allVariants.filter((v) => v.productId === product.id);
    if (!variants.length) continue;

    const prices = variants.map((v) => Number(v.salePrice ?? v.price));
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const inStock = variants.some((v) => v.inStock > 0);
    const onSale = variants.some((v) => v.salePrice !== null);

    productMetaMap.set(product.id, { minPrice, maxPrice, inStock, onSale });
  }

  // Enrich products
  let enrichedProducts = baseProducts.map((p) => {
    const meta = productMetaMap.get(p.id);
    const brand = brandsData.find((b) => b.id === p.brandId);
    const image = images.find((i) => i.productId === p.id);

    return {
      ...p,
      brand: brand || null,
      image: image || null,
      minPrice: meta?.minPrice ?? 0,
      maxPrice: meta?.maxPrice ?? 0,
      inStock: meta?.inStock ?? false,
      onSale: meta?.onSale ?? false,
    };
  });

  // Sorting
  enrichedProducts = await applySorting(enrichedProducts, sort);

  // Pagination
  const total = enrichedProducts.length;
  const start = (page - 1) * pageSize;
  const paged = enrichedProducts.slice(start, start + pageSize);

  // Get available filter options based on current results
  const filterOptions = await getAvailableFilters([...filteredProductIds]);

  return { items: paged, total, filters: filterOptions };
}

// ============================================================================
// SORTING LOGIC
// ============================================================================

async function applySorting<T extends { id: string; name: string; createdAt: Date; minPrice: number }>(
  products: T[],
  sort: SortOption
): Promise<T[]> {
  switch (sort) {
    case 'price_asc':
      return products.sort((a, b) => a.minPrice - b.minPrice);

    case 'price_desc':
      return products.sort((a, b) => b.minPrice - a.minPrice);

    case 'name_asc':
      return products.sort((a, b) => a.name.localeCompare(b.name));

    case 'name_desc':
      return products.sort((a, b) => b.name.localeCompare(a.name));

    case 'oldest':
      return products.sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );

    case 'newest':
      return products.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

    case 'rating': {
      // Fetch average ratings
      const productIds = products.map((p) => p.id);
      const ratingsData = await db
        .select({
          productId: reviews.productId,
          avgRating: avg(reviews.rating),
        })
        .from(reviews)
        .where(inArray(reviews.productId, productIds))
        .groupBy(reviews.productId);

      const ratingMap = new Map(
        ratingsData.map((r) => [r.productId, Number(r.avgRating) || 0])
      );

      return products.sort(
        (a, b) => (ratingMap.get(b.id) || 0) - (ratingMap.get(a.id) || 0)
      );
    }

    case 'popularity':
      // You can implement this based on order frequency, views, etc.
      // For now, defaulting to newest
      return products.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

    default:
      return products;
  }
}

// ============================================================================
// FILTER OPTIONS
// ============================================================================

async function getAvailableFilters(productIds: string[]) {
  if (!productIds.length) return getEmptyFilterOptions();

  const [
    availableBrands,
    availableCategories,
    availableColors,
    availableSizes,
    availableGenders,
    priceRange,
  ] = await Promise.all([
    // Brands
    db
      .selectDistinct({ id: brands.id, name: brands.name, slug: brands.slug })
      .from(brands)
      .innerJoin(products, eq(products.brandId, brands.id))
      .where(inArray(products.id, productIds)),

    // Categories
    db
      .selectDistinct({
        id: categories.id,
        name: categories.name,
        slug: categories.slug,
      })
      .from(categories)
      .innerJoin(productToCategories, eq(productToCategories.categoryId, categories.id))
      .where(inArray(productToCategories.productId, productIds)),

    // Colors
    db
      .selectDistinct({
        id: colors.id,
        name: colors.name,
        slug: colors.slug,
        hexCode: colors.hexCode,
      })
      .from(colors)
      .innerJoin(productVariants, eq(productVariants.colorId, colors.id))
      .where(inArray(productVariants.productId, productIds)),

    // Sizes
    db
      .selectDistinct({
        id: sizes.id,
        name: sizes.name,
        slug: sizes.slug,
        sortOrder: sizes.sortOrder,
      })
      .from(sizes)
      .innerJoin(productVariants, eq(productVariants.sizeId, sizes.id))
      .where(inArray(productVariants.productId, productIds))
      .orderBy(asc(sizes.sortOrder)),

    // Genders
    db
      .selectDistinct({ id: genders.id, label: genders.label, slug: genders.slug })
      .from(genders)
      .innerJoin(products, eq(products.genderId, genders.id))
      .where(inArray(products.id, productIds)),

    // Price range
    db
      .select({
        min: sql<number>`MIN(COALESCE(${productVariants.salePrice}, ${productVariants.price}))`,
        max: sql<number>`MAX(COALESCE(${productVariants.salePrice}, ${productVariants.price}))`,
      })
      .from(productVariants)
      .where(inArray(productVariants.productId, productIds)),
  ]);

  return {
    brands: availableBrands,
    categories: availableCategories,
    colors: availableColors,
    sizes: availableSizes,
    genders: availableGenders,
    priceRange: {
      min: Number(priceRange[0]?.min || 0),
      max: Number(priceRange[0]?.max || 0),
    },
  };
}

function getEmptyFilterOptions() {
  return {
    brands: [],
    categories: [],
    colors: [],
    sizes: [],
    genders: [],
    priceRange: { min: 0, max: 0 },
  };
}

// ============================================================================
// PRODUCT DETAIL PAGE
// ============================================================================

export async function getProductById(productId: string) {
  try {
    const product = await db.query.products.findFirst({
      where: and(eq(products.id, productId), isNull(products.deletedAt)),
    });

    if (!product) return null;

    const [brand, category, gender, images, variants, standards, productCollectionsData, reviewStats] =
      await Promise.all([
        product.brandId
          ? db.query.brands.findFirst({ where: eq(brands.id, product.brandId) })
          : null,
        product.categoryId
          ? db.query.categories.findFirst({
              where: eq(categories.id, product.categoryId),
            })
          : null,
        product.genderId
          ? db.query.genders.findFirst({ where: eq(genders.id, product.genderId) })
          : null,
        db.query.productImages.findMany({
          where: eq(productImages.productId, product.id),
          orderBy: asc(productImages.sortOrder),
        }),
        db.query.productVariants.findMany({
          where: and(
            eq(productVariants.productId, product.id),
            isNull(productVariants.deletedAt)
          ),
        }).catch(err => {
          console.error('Failed to fetch variants for product:', product.id, err);
          return [];
        }),
        db.query.productStandards.findMany({
          where: eq(productStandards.productId, product.id),
        }),
        db.query.productCollections.findMany({
          where: eq(productCollections.productId, product.id),
        }),
        // Fetch review statistics
        db
          .select({
            avgRating: avg(reviews.rating),
            totalReviews: count(reviews.id),
          })
          .from(reviews)
          .where(and(
            eq(reviews.productId, product.id),
            eq(reviews.status, 'approved')
          ))
          .then(result => result[0] || { avgRating: null, totalReviews: 0 }),
      ]);

    // Fetch variant attributes (colors, sizes, genders)
    const colorIds = [...new Set(variants.map((v) => v.colorId).filter(Boolean))];
    const sizeIds = [...new Set(variants.map((v) => v.sizeId).filter(Boolean))];
    const genderIds = [...new Set(variants.map((v) => v.genderId).filter(Boolean))];

    const [variantColors, variantSizes, variantGenders] = await Promise.all([
      colorIds.length
        ? db.query.colors.findMany({
            where: inArray(colors.id, colorIds as string[]),
          })
        : [],
      sizeIds.length
        ? db.query.sizes.findMany({
            where: inArray(sizes.id, sizeIds as string[]),
          })
        : [],
      genderIds.length
        ? db.query.genders.findMany({
            where: inArray(genders.id, genderIds as string[]),
          })
        : [],
    ]);

    // Enrich variants with their attributes
    const enrichedVariants = variants.map((v) => ({
      ...v,
      color: variantColors.find((c) => c.id === v.colorId) || null,
      size: variantSizes.find((s) => s.id === v.sizeId) || null,
      gender: variantGenders.find((g) => g.id === v.genderId) || null,
    }));

    // Calculate price range
    const prices = enrichedVariants.map(v => Number(v.salePrice ?? v.price));
    const minPrice = prices.length ? Math.min(...prices) : 0;
    const maxPrice = prices.length ? Math.max(...prices) : 0;

    // Check overall stock availability
    const inStock = enrichedVariants.some(v => v.inStock > 0);
    const totalStock = enrichedVariants.reduce((sum, v) => sum + v.inStock, 0);

    return {
      ...product,
      brand,
      category,
      gender,
      images,
      variants: enrichedVariants,
      standards,
      collections: productCollectionsData,
      rating: {
        average: reviewStats.avgRating ? Number(reviewStats.avgRating) : 0,
        count: Number(reviewStats.totalReviews),
      },
      pricing: {
        minPrice,
        maxPrice,
      },
      stock: {
        inStock,
        totalStock,
      },
    };
  } catch (error) {
    console.error('Error in getProductById:', productId, error);
    throw error;
  }
}

export async function getProductBySlug(slug: string) {
  try {
    const product = await db.query.products.findFirst({
      where: and(eq(products.slug, slug), isNull(products.deletedAt)),
    });

    if (!product) return null;

    const [brand, category, gender, images, variants, standards, productCollectionsData, reviewStats] =
      await Promise.all([
      product.brandId
        ? db.query.brands.findFirst({ where: eq(brands.id, product.brandId) })
        : null,
      product.categoryId
        ? db.query.categories.findFirst({
            where: eq(categories.id, product.categoryId),
          })
        : null,
      product.genderId
        ? db.query.genders.findFirst({ where: eq(genders.id, product.genderId) })
        : null,
      db.query.productImages.findMany({
        where: eq(productImages.productId, product.id),
        orderBy: asc(productImages.sortOrder),
      }),
      db.query.productVariants.findMany({
        where: and(
          eq(productVariants.productId, product.id),
          isNull(productVariants.deletedAt)
        ),
      }).catch(err => {
        console.error('Failed to fetch variants for product:', product.id, err);
        return [];
      }),
      db.query.productStandards.findMany({
        where: eq(productStandards.productId, product.id),
      }),
      db.query.productCollections.findMany({
        where: eq(productCollections.productId, product.id),
      }),
      // Fetch review statistics
      db
        .select({
          avgRating: avg(reviews.rating),
          totalReviews: count(reviews.id),
        })
        .from(reviews)
        .where(and(
          eq(reviews.productId, product.id),
          eq(reviews.status, 'approved')
        ))
        .then(result => result[0] || { avgRating: null, totalReviews: 0 }),
    ]);

  // Fetch variant attributes (colors, sizes, genders)
  const colorIds = [...new Set(variants.map((v) => v.colorId).filter(Boolean))];
  const sizeIds = [...new Set(variants.map((v) => v.sizeId).filter(Boolean))];
  const genderIds = [...new Set(variants.map((v) => v.genderId).filter(Boolean))];

  const [variantColors, variantSizes, variantGenders] = await Promise.all([
    colorIds.length
      ? db.query.colors.findMany({
          where: inArray(colors.id, colorIds as string[]),
        })
      : [],
    sizeIds.length
      ? db.query.sizes.findMany({
          where: inArray(sizes.id, sizeIds as string[]),
        })
      : [],
    genderIds.length
      ? db.query.genders.findMany({
          where: inArray(genders.id, genderIds as string[]),
        })
      : [],
  ]);

  // Enrich variants with their attributes
  const enrichedVariants = variants.map((v) => ({
    ...v,
    color: variantColors.find((c) => c.id === v.colorId) || null,
    size: variantSizes.find((s) => s.id === v.sizeId) || null,
    gender: variantGenders.find((g) => g.id === v.genderId) || null,
  }));

  // Calculate price range
  const prices = enrichedVariants.map(v => Number(v.salePrice ?? v.price));
  const minPrice = prices.length ? Math.min(...prices) : 0;
  const maxPrice = prices.length ? Math.max(...prices) : 0;

  // Check overall stock availability
  const inStock = enrichedVariants.some(v => v.inStock > 0);
  const totalStock = enrichedVariants.reduce((sum, v) => sum + v.inStock, 0);

  return {
    ...product,
    brand,
    category,
    gender,
    images,
    variants: enrichedVariants,
    standards,
    collections: productCollectionsData,
    rating: {
      average: reviewStats.avgRating ? Number(reviewStats.avgRating) : 0,
      count: Number(reviewStats.totalReviews),
    },
    pricing: {
      minPrice,
      maxPrice,
    },
    stock: {
      inStock,
      totalStock,
    },
  };
  } catch (error) {
    console.error('Error in getProductBySlug:', slug, error);
    throw error;
  }
}

// ============================================================================
// CATEGORY PRODUCTS (SIMPLIFIED)
// ============================================================================

export async function getProductsByCategory(
  categorySlug: string,
  options: PaginationOptions = {}
) {
  const category = await db.query.categories.findFirst({
    where: eq(categories.slug, categorySlug),
  });

  if (!category) return { items: [], total: 0, filters: getEmptyFilterOptions() };

  return getProducts({ categoryIds: [category.id] }, options);
}

// ============================================================================
// FEATURED & HOME PAGE
// ============================================================================

export async function getFeaturedProducts(limit = 8) {
  const prods = await db.query.products.findMany({
    where: and(eq(products.isPublished, true), isNull(products.deletedAt)),
    limit,
    orderBy: desc(products.createdAt),
  });

  return enrichProductsWithMetadata(prods);
}

export async function getNewArrivals(limit = 12) {
  const prods = await db.query.products.findMany({
    where: and(eq(products.isPublished, true), isNull(products.deletedAt)),
    limit,
    orderBy: desc(products.createdAt),
  });

  return enrichProductsWithMetadata(prods);
}

export async function getSaleProducts(limit = 12) {
  // Find products with variants on sale
  const saleVariants = await db.query.productVariants.findMany({
    where: and(sql`${productVariants.salePrice} IS NOT NULL`),
  });

  const productIds = [...new Set(saleVariants.map((v) => v.productId))].slice(
    0,
    limit
  );

  if (!productIds.length) return [];

  const prods = await db.query.products.findMany({
    where: and(
      inArray(products.id, productIds),
      eq(products.isPublished, true),
      isNull(products.deletedAt)
    ),
  });

  return enrichProductsWithMetadata(prods);
}

// ============================================================================
// COLLECTIONS
// ============================================================================

export async function getProductsByCollection(
  collectionSlug: string,
  options: PaginationOptions = {}
) {
  const collection = await db.query.collections.findFirst({
    where: eq(collections.slug, collectionSlug),
  });

  if (!collection)
    return { items: [], total: 0, filters: getEmptyFilterOptions() };

  return getProducts({ collectionIds: [collection.id] }, options);
}

// ============================================================================
// RELATED PRODUCTS
// ============================================================================

export async function getRelatedProducts(productId: string, limit = 4) {
  // Get categories for this product
  const productCategories = await db
    .select({ categoryId: productToCategories.categoryId })
    .from(productToCategories)
    .where(eq(productToCategories.productId, productId));

  if (productCategories.length === 0) return [];

  const categoryIds = productCategories.map(pc => pc.categoryId);

  // Find products in the same categories
  const relatedProductIds = await db
    .selectDistinct({ productId: productToCategories.productId })
    .from(productToCategories)
    .where(and(
      inArray(productToCategories.categoryId, categoryIds),
      sql`${productToCategories.productId} != ${productId}`
    ));

  if (relatedProductIds.length === 0) return [];

  const related = await db.query.products.findMany({
    where: and(
      inArray(products.id, relatedProductIds.map(r => r.productId)),
      eq(products.isPublished, true),
      isNull(products.deletedAt)
    ),
    limit,
  });

  return enrichProductsWithMetadata(related);
}

// ============================================================================
// SEARCH
// ============================================================================

export async function searchProducts(
  query: string,
  options: PaginationOptions = {}
) {
  return getProducts({ search: query }, options);
}

// ============================================================================
// HELPER: ENRICH PRODUCTS
// ============================================================================

async function enrichProductsWithMetadata(prods: any[]) {
  if (!prods.length) return [];

  const ids = prods.map((p) => p.id);

  const [images, variants, brandsData] = await Promise.all([
    db.query.productImages.findMany({
      where: and(
        eq(productImages.isPrimary, true),
        inArray(productImages.productId, ids)
      ),
    }),
    db.query.productVariants.findMany({
      where: and(
        inArray(productVariants.productId, ids),
        isNull(productVariants.deletedAt)
      ),
    }),
    db.query.brands.findMany({
      where: inArray(
        brands.id,
        prods.map((p) => p.brandId).filter(Boolean) as string[]
      ),
    }),
  ]);

  const priceMap = new Map<
    string,
    { minPrice: number; maxPrice: number; inStock: boolean; onSale: boolean }
  >();

  for (const p of prods) {
    const pVariants = variants.filter((v) => v.productId === p.id);
    if (!pVariants.length) continue;

    const prices = pVariants.map((v) => Number(v.salePrice ?? v.price));
    priceMap.set(p.id, {
      minPrice: Math.min(...prices),
      maxPrice: Math.max(...prices),
      inStock: pVariants.some((v) => v.inStock > 0),
      onSale: pVariants.some((v) => v.salePrice !== null),
    });
  }

  return prods.map((p) => ({
    ...p,
    brand: brandsData.find((b) => b.id === p.brandId) || null,
    image: images.find((i) => i.productId === p.id) || null,
    minPrice: priceMap.get(p.id)?.minPrice ?? 0,
    maxPrice: priceMap.get(p.id)?.maxPrice ?? 0,
    inStock: priceMap.get(p.id)?.inStock ?? false,
    onSale: priceMap.get(p.id)?.onSale ?? false,
  }));
}

// ============================================================================
// TRENDING / BESTSELLERS (stub - implement based on your analytics)
// ============================================================================

export async function getTrendingProducts(limit = 8) {
  // This would typically query order_items to find most purchased
  // For now, returning featured
  return getFeaturedProducts(limit);
}

export async function getBestSellers(categoryId?: string, limit = 8) {
  // Query most ordered products
  // Placeholder implementation
  return getFeaturedProducts(limit);
}
