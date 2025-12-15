"use client";

import React from "react";
import { Card, HeroSlider } from "@/components";
import WelcomeCategoriesAndBrands from "@/components/welcome/WelcomeCategoriesAndBrands";
import { heroSlides } from "@/lib/hero-slides";
import { categories } from "@/lib/welcome-categories";
import { brands } from "@/lib/welcome-brands";

const products = [
  {
    id: 1,
    title: "20V Cordless Drill Kit",
    description: "Professional-grade drill with 2 batteries, charger, and carrying case",
    price: 149.99,
    originalPrice: 199.99,
    imageSrc: "/products/drill-01.svg",
    rating: 4.5,
    reviewCount: 127,
    badge: "Bestseller" as const,
  },
  {
    id: 2,
    title: "Industrial Safety Helmet",
    description: "ANSI-certified hard hat with adjustable suspension and ventilation",
    price: 34.99,
    imageSrc: "/ppe/helmet-01.svg",
    rating: 4.8,
    reviewCount: 89,
    badge: "PPE" as const,
  },
  {
    id: 3,
    title: "Adjustable Wrench Set",
    description: "3-piece chrome vanadium steel wrench set, 6-inch, 8-inch, and 10-inch",
    price: 29.99,
    originalPrice: 39.99,
    imageSrc: "/products/wrench-01.svg",
    rating: 4.3,
    reviewCount: 56,
    badge: "Sale" as const,
  },
  {
    id: 4,
    title: "Safety Goggles - Anti-Fog",
    description: "ANSI Z87.1 certified protective eyewear with anti-fog coating",
    price: 12.99,
    imageSrc: "/ppe/goggles-01.svg",
    rating: 4.6,
    reviewCount: 203,
    badge: "New" as const,
  },
  {
    id: 5,
    title: "20V Lithium-Ion Battery",
    description: "High-capacity 4.0Ah battery compatible with all 20V tools",
    price: 59.99,
    imageSrc: "/products/battery-01.svg",
    rating: 4.7,
    reviewCount: 145,
    badge: "Limited" as const,
  },
];

const Home = () => {
  const handleAddToCart = (productId: number) => {
    console.log(`Added product ${productId} to cart`);
    // Add your cart logic here
  };

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

      {/* Products Section */}
      <div className="mx-auto w-[90%] px-4 py-12 sm:px-6 lg:px-8">
        <section aria-labelledby="featured" className="mb-12">
          <div className="mb-8">
            <h1 className="text-heading-2 mb-2 text-dark-900">
              Professional Tools & PPE
            </h1>
            <p className="text-lead text-dark-700">
              Quality equipment for professionals and enthusiasts
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {products.map((p) => (
              <Card
                key={p.id}
                title={p.title}
                description={p.description}
                imageSrc={p.imageSrc}
                price={p.price}
                originalPrice={p.originalPrice}
                rating={p.rating}
                reviewCount={p.reviewCount}
                badge={p.badge}
                href={`/products/${p.id}`}
                onAddToCart={() => handleAddToCart(p.id)}
              />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
};

export default Home;
