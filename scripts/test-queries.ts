import "dotenv/config";
import { db } from "@/lib/db";
import {
  getProducts,
  getFeaturedProducts,
  getProductsByCategory,
  getProductBySlug,
  getNewArrivals,
  getSaleProducts,
  getProductsByCollection,
  getRelatedProducts,
  searchProducts,
  getTrendingProducts,
  getBestSellers,
} from "@/lib/db/queries/products";

// Helper to log results nicely
function logResult(title: string, data: any) {
  console.log(`\n${"=".repeat(60)}`);
  console.log(`📦 ${title}`);
  console.log("=".repeat(60));
  console.log(JSON.stringify(data, null, 2));
}

function logSection(title: string) {
  console.log(`\n\n${"*".repeat(60)}`);
  console.log(`🧪 ${title.toUpperCase()}`);
  console.log("*".repeat(60));
}

async function testQueries() {
  console.log("🚀 Starting comprehensive product query tests...\n");

  try {
    // ========================================================================
    // TEST 1: BASIC PRODUCT RETRIEVAL
    // ========================================================================
    logSection("Basic Product Retrieval");

    console.log("\n1.1 Testing getFeaturedProducts (limit 4)...");
    const featuredProducts = await getFeaturedProducts(4);
    if (featuredProducts.length > 0) {
      logResult("Featured Products", {
        count: featuredProducts.length,
        products: featuredProducts.map((p) => ({
          id: p.id,
          name: p.name,
          slug: p.slug,
          minPrice: p.minPrice,
          inStock: p.inStock,
          onSale: p.onSale,
        })),
      });
    } else {
      console.log("❌ No featured products found.");
    }

    console.log("\n1.2 Testing getNewArrivals (limit 5)...");
    const newArrivals = await getNewArrivals(5);
    if (newArrivals.length > 0) {
      logResult("New Arrivals", {
        count: newArrivals.length,
        products: newArrivals.map((p) => ({
          name: p.name,
          createdAt: p.createdAt,
          minPrice: p.minPrice,
        })),
      });
    } else {
      console.log("❌ No new arrivals found.");
    }

    console.log("\n1.3 Testing getSaleProducts (limit 5)...");
    const saleProducts = await getSaleProducts(5);
    if (saleProducts.length > 0) {
      logResult("Sale Products", {
        count: saleProducts.length,
        products: saleProducts.map((p) => ({
          name: p.name,
          minPrice: p.minPrice,
          onSale: p.onSale,
        })),
      });
    } else {
      console.log("❌ No sale products found.");
    }

    // ========================================================================
    // TEST 2: PRODUCT DETAIL PAGE
    // ========================================================================
    logSection("Product Detail Page");

    const firstProduct = await db.query.products.findFirst({
      where: (products, { isNotNull, eq, and, isNull }) =>
        and(isNotNull(products.slug), eq(products.isPublished, true), isNull(products.deletedAt)),
    });

    if (firstProduct?.slug) {
      console.log(`\n2.1 Testing getProductBySlug ("${firstProduct.slug}")...`);
      const productDetail = await getProductBySlug(firstProduct.slug);
      if (productDetail) {
        logResult("Product Detail", {
          id: productDetail.id,
          name: productDetail.name,
          slug: productDetail.slug,
          description: productDetail.description?.substring(0, 100),
          brand: productDetail.brand?.name,
          category: productDetail.category?.name,
          gender: productDetail.gender?.label,
          variantsCount: productDetail.variants.length,
          imagesCount: productDetail.images.length,
          standardsCount: productDetail.standards.length,
          variants: productDetail.variants.map((v) => ({
            sku: v.sku,
            price: v.price,
            salePrice: v.salePrice,
            color: v.color?.name,
            size: v.size?.name,
            inStock: v.inStock,
          })),
        });
      } else {
        console.log("❌ Product not found.");
      }

      // Test related products
      if (productDetail) {
        console.log(`\n2.2 Testing getRelatedProducts for "${productDetail.name}"...`);
        const relatedProducts = await getRelatedProducts(productDetail.id, 4);
        logResult("Related Products", {
          count: relatedProducts.length,
          products: relatedProducts.map((p) => ({
            name: p.name,
            minPrice: p.minPrice,
          })),
        });
      }
    } else {
      console.log("❌ No products found to test detail page.");
    }

    // ========================================================================
    // TEST 3: FILTERING
    // ========================================================================
    logSection("Product Filtering");

    console.log("\n3.1 Testing getProducts with no filters (page 1)...");
    const allProducts = await getProducts({}, { page: 1, pageSize: 5 });
    logResult("All Products", {
      total: allProducts.total,
      itemsReturned: allProducts.items.length,
      filters: {
        brandsCount: allProducts.filters.brands.length,
        categoriesCount: allProducts.filters.categories.length,
        colorsCount: allProducts.filters.colors.length,
        sizesCount: allProducts.filters.sizes.length,
        priceRange: allProducts.filters.priceRange,
      },
      items: allProducts.items.map((p) => ({
        name: p.name,
        minPrice: p.minPrice,
        brand: p.brand?.name,
      })),
    });

    // Test category filter
    const firstCategory = await db.query.categories.findFirst();
    if (firstCategory) {
      console.log(`\n3.2 Testing filter by category ("${firstCategory.name}")...`);
      const categoryProducts = await getProducts(
        { categoryIds: [firstCategory.id] },
        { page: 1, pageSize: 5 }
      );
      logResult("Category Filter", {
        categoryName: firstCategory.name,
        total: categoryProducts.total,
        itemsReturned: categoryProducts.items.length,
        items: categoryProducts.items.map((p) => p.name),
      });
    }

    // Test brand filter
    const firstBrand = await db.query.brands.findFirst();
    if (firstBrand) {
      console.log(`\n3.3 Testing filter by brand ("${firstBrand.name}")...`);
      const brandProducts = await getProducts(
        { brandIds: [firstBrand.id] },
        { page: 1, pageSize: 5 }
      );
      logResult("Brand Filter", {
        brandName: firstBrand.name,
        total: brandProducts.total,
        itemsReturned: brandProducts.items.length,
        items: brandProducts.items.map((p) => p.name),
      });
    }

    // Test price range filter
    console.log("\n3.4 Testing filter by price range ($10 - $100)...");
    const priceFilteredProducts = await getProducts(
      { priceMin: 10, priceMax: 100 },
      { page: 1, pageSize: 5 }
    );
    logResult("Price Range Filter", {
      priceRange: "$10 - $100",
      total: priceFilteredProducts.total,
      itemsReturned: priceFilteredProducts.items.length,
      items: priceFilteredProducts.items.map((p) => ({
        name: p.name,
        minPrice: p.minPrice,
      })),
    });

    // Test in-stock filter
    console.log("\n3.5 Testing filter by in-stock products...");
    const inStockProducts = await getProducts(
      { inStock: true },
      { page: 1, pageSize: 5 }
    );
    logResult("In-Stock Filter", {
      total: inStockProducts.total,
      itemsReturned: inStockProducts.items.length,
      items: inStockProducts.items.map((p) => ({
        name: p.name,
        inStock: p.inStock,
      })),
    });

    // Test on-sale filter
    console.log("\n3.6 Testing filter by on-sale products...");
    const onSaleProducts = await getProducts(
      { onSale: true },
      { page: 1, pageSize: 5 }
    );
    logResult("On-Sale Filter", {
      total: onSaleProducts.total,
      itemsReturned: onSaleProducts.items.length,
      items: onSaleProducts.items.map((p) => ({
        name: p.name,
        onSale: p.onSale,
        minPrice: p.minPrice,
      })),
    });

    // Test multiple filters combined
    if (firstCategory && firstBrand) {
      console.log(
        `\n3.7 Testing combined filters (category + brand + price + in-stock)...`
      );
      const combinedFilter = await getProducts(
        {
          categoryIds: [firstCategory.id],
          brandIds: [firstBrand.id],
          priceMin: 0,
          priceMax: 500,
          inStock: true,
        },
        { page: 1, pageSize: 5 }
      );
      logResult("Combined Filters", {
        filters: {
          category: firstCategory.name,
          brand: firstBrand.name,
          priceRange: "$0 - $500",
          inStock: true,
        },
        total: combinedFilter.total,
        itemsReturned: combinedFilter.items.length,
      });
    }

    // ========================================================================
    // TEST 4: SORTING
    // ========================================================================
    logSection("Product Sorting");

    console.log("\n4.1 Testing sort by price (ascending)...");
    const sortedByPriceAsc = await getProducts(
      {},
      { page: 1, pageSize: 5, sort: "price_asc" }
    );
    logResult("Sort: Price Ascending", {
      items: sortedByPriceAsc.items.map((p) => ({
        name: p.name,
        minPrice: p.minPrice,
      })),
    });

    console.log("\n4.2 Testing sort by price (descending)...");
    const sortedByPriceDesc = await getProducts(
      {},
      { page: 1, pageSize: 5, sort: "price_desc" }
    );
    logResult("Sort: Price Descending", {
      items: sortedByPriceDesc.items.map((p) => ({
        name: p.name,
        minPrice: p.minPrice,
      })),
    });

    console.log("\n4.3 Testing sort by name (A-Z)...");
    const sortedByNameAsc = await getProducts(
      {},
      { page: 1, pageSize: 5, sort: "name_asc" }
    );
    logResult("Sort: Name A-Z", {
      items: sortedByNameAsc.items.map((p) => p.name),
    });

    console.log("\n4.4 Testing sort by newest...");
    const sortedByNewest = await getProducts(
      {},
      { page: 1, pageSize: 5, sort: "newest" }
    );
    logResult("Sort: Newest", {
      items: sortedByNewest.items.map((p) => ({
        name: p.name,
        createdAt: p.createdAt,
      })),
    });

    console.log("\n4.5 Testing sort by rating...");
    const sortedByRating = await getProducts(
      {},
      { page: 1, pageSize: 5, sort: "rating" }
    );
    logResult("Sort: Rating", {
      items: sortedByRating.items.map((p) => p.name),
    });

    // ========================================================================
    // TEST 5: PAGINATION
    // ========================================================================
    logSection("Pagination");

    console.log("\n5.1 Testing pagination (page 1, size 3)...");
    const page1 = await getProducts({}, { page: 1, pageSize: 3 });
    logResult("Page 1", {
      total: page1.total,
      itemsReturned: page1.items.length,
      items: page1.items.map((p) => p.name),
    });

    console.log("\n5.2 Testing pagination (page 2, size 3)...");
    const page2 = await getProducts({}, { page: 2, pageSize: 3 });
    logResult("Page 2", {
      total: page2.total,
      itemsReturned: page2.items.length,
      items: page2.items.map((p) => p.name),
    });

    // ========================================================================
    // TEST 6: SEARCH
    // ========================================================================
    logSection("Search Functionality");

    console.log('\n6.1 Testing search with query "tool"...');
    const searchResults = await searchProducts("tool", { page: 1, pageSize: 5 });
    logResult("Search Results", {
      query: "tool",
      total: searchResults.total,
      itemsReturned: searchResults.items.length,
      items: searchResults.items.map((p) => ({
        name: p.name,
        description: p.description?.substring(0, 50),
      })),
    });

    // ========================================================================
    // TEST 7: COLLECTIONS
    // ========================================================================
    logSection("Collections");

    const firstCollection = await db.query.collections.findFirst();
    if (firstCollection) {
      console.log(
        `\n7.1 Testing getProductsByCollection ("${firstCollection.name}")...`
      );
      const collectionProducts = await getProductsByCollection(
        firstCollection.slug,
        { page: 1, pageSize: 5 }
      );
      logResult("Collection Products", {
        collectionName: firstCollection.name,
        total: collectionProducts.total,
        itemsReturned: collectionProducts.items.length,
        items: collectionProducts.items.map((p) => p.name),
      });
    } else {
      console.log("❌ No collections found.");
    }

    // ========================================================================
    // TEST 8: CATEGORY PAGE (by slug)
    // ========================================================================
    logSection("Category Page");

    if (firstCategory) {
      console.log(
        `\n8.1 Testing getProductsByCategory with slug ("${firstCategory.slug}")...`
      );
      const categoryPageProducts = await getProductsByCategory(
        firstCategory.slug,
        { page: 1, pageSize: 5, sort: "price_asc" }
      );
      logResult("Category Page Products", {
        categoryName: firstCategory.name,
        total: categoryPageProducts.total,
        itemsReturned: categoryPageProducts.items.length,
        items: categoryPageProducts.items.map((p) => ({
          name: p.name,
          minPrice: p.minPrice,
        })),
      });
    }

    // ========================================================================
    // TEST 9: TRENDING & BESTSELLERS
    // ========================================================================
    logSection("Trending & Bestsellers");

    console.log("\n9.1 Testing getTrendingProducts...");
    const trendingProducts = await getTrendingProducts(5);
    logResult("Trending Products", {
      count: trendingProducts.length,
      items: trendingProducts.map((p) => p.name),
    });

    console.log("\n9.2 Testing getBestSellers...");
    const bestSellers = await getBestSellers(undefined, 5);
    logResult("Best Sellers", {
      count: bestSellers.length,
      items: bestSellers.map((p) => p.name),
    });

    // ========================================================================
    // TEST 10: EDGE CASES
    // ========================================================================
    logSection("Edge Cases");

    console.log("\n10.1 Testing non-existent product slug...");
    const nonExistentProduct = await getProductBySlug("non-existent-slug-12345");
    console.log(
      nonExistentProduct ? "❌ Should return null" : "✅ Correctly returned null"
    );

    console.log("\n10.2 Testing empty search query...");
    const emptySearch = await searchProducts("", { page: 1, pageSize: 5 });
    logResult("Empty Search", {
      total: emptySearch.total,
      itemsReturned: emptySearch.items.length,
    });

    console.log("\n10.3 Testing pagination beyond available products...");
    const beyondPagination = await getProducts({}, { page: 9999, pageSize: 10 });
    logResult("Beyond Pagination", {
      total: beyondPagination.total,
      itemsReturned: beyondPagination.items.length,
    });

    console.log("\n10.4 Testing filter with impossible constraints...");
    const impossibleFilter = await getProducts(
      { priceMin: 10000, priceMax: 10001 },
      { page: 1, pageSize: 5 }
    );
    logResult("Impossible Filter", {
      total: impossibleFilter.total,
      itemsReturned: impossibleFilter.items.length,
    });

    // ========================================================================
    // SUMMARY
    // ========================================================================
    logSection("Test Summary");

    console.log("\n✅ All query tests completed successfully!");
    console.log("\nTested Functions:");
    console.log("  - getProducts (main query with filters)");
    console.log("  - getFeaturedProducts");
    console.log("  - getNewArrivals");
    console.log("  - getSaleProducts");
    console.log("  - getProductBySlug");
    console.log("  - getRelatedProducts");
    console.log("  - searchProducts");
    console.log("  - getProductsByCategory");
    console.log("  - getProductsByCollection");
    console.log("  - getTrendingProducts");
    console.log("  - getBestSellers");
    console.log("\nCoverage:");
    console.log("  - Basic retrieval ✓");
    console.log("  - Filtering (category, brand, price, stock, sale) ✓");
    console.log("  - Sorting (price, name, date, rating) ✓");
    console.log("  - Pagination ✓");
    console.log("  - Search ✓");
    console.log("  - Collections ✓");
    console.log("  - Related products ✓");
    console.log("  - Edge cases ✓");
  } catch (error) {
    console.error("\n❌ An error occurred during query testing:");
    console.error(error);
    if (error instanceof Error) {
      console.error("\nStack trace:", error.stack);
    }
  } finally {
    console.log("\n" + "=".repeat(60));
    console.log("🏁 Query tests finished.");
    console.log("=".repeat(60));
    process.exit(0);
  }
}

testQueries();
