import React from "react";
import Link from "next/link";
import { Card, HeroSlider } from "@/components";
import WelcomeCategoriesAndBrands from "@/components/welcome/WelcomeCategoriesAndBrands";
import { heroSlides } from "@/lib/hero-slides";
import { categories } from "@/lib/welcome-categories";
import { brands } from "@/lib/welcome-brands";
import {
  getFeaturedProducts,
  getProducts,
} from "@/lib/db/queries/products";
import { db } from "@/lib/db";
import { categories as categoriesTable, brands as brandsTable } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { Button } from "@/components/ui/button";
import InteractiveCard from "@/components/InteractiveCard";

const Home = async () => {
  // Fetch featured products (12 total)
  const featuredProducts = await getFeaturedProducts(12);

  // Fetch power tools category
  const powerToolsCategory = await db.query.categories.findFirst({
    where: eq(categoriesTable.slug, "power-tools"),
  });

  // Fetch power tools products (12 total)
  const powerToolsProducts = powerToolsCategory
    ? await getProducts(
        { categoryIds: [powerToolsCategory.id] },
        { page: 1, pageSize: 12 }
      )
    : { items: [] };

  // Fetch Milwaukee brand
  const milwaukeeBrand = await db.query.brands.findFirst({
    where: eq(brandsTable.slug, "milwaukee"),
  });

  // Fetch Milwaukee products (12 total)
  const milwaukeeProducts = milwaukeeBrand
    ? await getProducts(
        { brandIds: [milwaukeeBrand.id] },
        { page: 1, pageSize: 12 }
      )
    : { items: [] };

  return (
    <main>
      {/* Hero Slider */}
      <HeroSlider
        slides={heroSlides}
        autoPlay={true}
        intervalMs={6000}
        showDots={true}
        className="mb-12"
      />

      {/* Welcome, Categories & Brands Section */}
      <WelcomeCategoriesAndBrands
        welcomeHeadline="Welcome to FIRST CLASS"
        categories={categories}
        brands={brands}
        autoplay={true}
        intervalMs={3000}
        showArrows={true}
        className="mb-12"
      />

      {/* Products Sections */}
      <div className="mx-auto w-[90%] px-4 py-12 sm:px-6 lg:px-8">
        {/* Featured Products Section */}
        <section aria-labelledby="featured-products" className="mb-16">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <h2 className="text-heading-2 mb-2 text-dark-900">
                Featured Products
              </h2>
              <p className="text-lead text-dark-700">
                Handpicked quality equipment for professionals
              </p>
            </div>
            <Button asChild variant="outline" size="lg">
              <Link href="/products">
                View All Products
                <span className="ml-2">→</span>
              </Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {featuredProducts.map((product) => (
              <InteractiveCard
                key={product.id}
                title={product.name}
                description={product.description || ""}
                imageSrc={product.image?.url || "/placeholder-product.svg"}
                price={product.minPrice}
                originalPrice={
                  product.onSale && product.maxPrice > product.minPrice
                    ? product.maxPrice
                    : undefined
                }
                rating={4.5} // You can calculate this from reviews later
                reviewCount={0} // You can fetch this from reviews later
                badge={
                  product.onSale
                    ? ("Sale" as const)
                    : !product.inStock
                      ? ("Limited" as const)
                      : undefined
                }
                href={`/products/${product.slug}`}
              />
            ))}
          </div>
        </section>

        {/* Power Tools Section */}
        {powerToolsProducts.items.length > 0 && (
          <section aria-labelledby="power-tools" className="mb-16">
            <div className="mb-8 flex items-end justify-between">
              <div>
                <h2 className="text-heading-2 mb-2 text-dark-900">
                  Power Tools
                </h2>
                <p className="text-lead text-dark-700">
                  Professional-grade tools for every job
                </p>
              </div>
              <Button asChild variant="outline" size="lg">
                <Link href={`/categories/${powerToolsCategory?.slug}`}>
                  View All Power Tools
                  <span className="ml-2">→</span>
                </Link>
              </Button>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
              {powerToolsProducts.items.map((product) => (
                <Card
                  key={product.id}
                  title={product.name}
                  description={product.description || ""}
                  imageSrc={product.image?.url || "/placeholder-product.svg"}
                  price={product.minPrice}
                  originalPrice={
                    product.onSale && product.maxPrice > product.minPrice
                      ? product.maxPrice
                      : undefined
                  }
                  rating={4.5}
                  reviewCount={0}
                  badge={
                    product.onSale
                      ? ("Sale" as const)
                      : !product.inStock
                        ? ("Limited" as const)
                        : undefined
                  }
                  href={`/products/${product.slug}`}
                />
              ))}
            </div>
          </section>
        )}

        {/* Milwaukee Brand Section */}
        {milwaukeeProducts.items.length > 0 && (
          <section aria-labelledby="milwaukee-products" className="mb-16">
            <div className="mb-8 flex items-end justify-between">
              <div>
                <h2 className="text-heading-2 mb-2 text-dark-900">
                  Milwaukee Tools
                </h2>
                <p className="text-lead text-dark-700">
                  Industry-leading innovation and durability
                </p>
              </div>
              <Button asChild variant="outline" size="lg">
                <Link href={`/brands/${milwaukeeBrand?.slug}`}>
                  View All Milwaukee
                  <span className="ml-2">→</span>
                </Link>
              </Button>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
              {milwaukeeProducts.items.map((product) => (
                <Card
                  key={product.id}
                  title={product.name}
                  description={product.description || ""}
                  imageSrc={product.image?.url || "/placeholder-product.svg"}
                  price={product.minPrice}
                  originalPrice={
                    product.onSale && product.maxPrice > product.minPrice
                      ? product.maxPrice
                      : undefined
                  }
                  rating={4.5}
                  reviewCount={0}
                  badge={
                    product.onSale
                      ? ("Sale" as const)
                      : !product.inStock
                        ? ("Limited" as const)
                        : ("Bestseller" as const)
                  }
                  href={`/products/${product.slug}`}
                />
              ))}
            </div>
          </section>
        )}

        {/* Empty State (if no products) */}
        {featuredProducts.length === 0 &&
          powerToolsProducts.items.length === 0 &&
          milwaukeeProducts.items.length === 0 && (
            <section className="py-16 text-center">
              <div className="mx-auto max-w-md">
                <h2 className="text-heading-2 mb-4 text-dark-900">
                  No Products Available
                </h2>
                <p className="text-lead text-dark-700">
                  Check back soon for our latest products and deals!
                </p>
              </div>
            </section>
          )}
      </div>
    </main>
  );
};

export default Home;
