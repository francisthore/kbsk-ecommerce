"use client";

import CategoryGrid from "./CategoryGrid";
import BrandsMarquee from "./BrandsMarquee";
import type { CategoryCard, BrandLogo } from "@/types/welcome-section";

export interface WelcomeCategoriesAndBrandsProps {
  welcomeHeadline?: string;
  categories: CategoryCard[];
  brands: BrandLogo[];
  autoplay?: boolean;
  intervalMs?: number;
  showArrows?: boolean;
  className?: string;
}

export default function WelcomeCategoriesAndBrands({
  welcomeHeadline = "Welcome to FIRST CLASS",
  categories,
  brands,
  autoplay = true,
  intervalMs = 3000,
  showArrows = true,
  className = "",
}: WelcomeCategoriesAndBrandsProps) {
  // Split headline to emphasize "FIRST CLASS"
  const getHeadlineParts = () => {
    const match = welcomeHeadline.match(/^(.*?)(FIRST CLASS)(.*)$/i);
    if (match) {
      return {
        before: match[1].trim(),
        emphasis: match[2],
        after: match[3].trim(),
      };
    }
    return { before: welcomeHeadline, emphasis: "", after: "" };
  };

  const { before, emphasis, after } = getHeadlineParts();

  return (
    <div className={`w-full ${className}`}>
      {/* Welcome band with dark green background */}
      <section
        className="relative w-full bg-[var(--color-primary)] py-12 sm:py-16"
        aria-label="Welcome"
      >
        <div className="mx-auto w-[90%]">
          <h1 className="text-center text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
            {before && <span>{before} </span>}
            {emphasis && (
              <span className="relative inline-block">
                <span className="relative z-10">{emphasis}</span>
                <span className="absolute inset-x-0 bottom-1 h-3 bg-yellow-400/30" />
              </span>
            )}
            {after && <span> {after}</span>}
          </h1>
        </div>

        {/* Elevated category grid - positioned to overlap the green band */}
        <div className="relative z-10 mx-auto w-[90%]">
          <div className="mt-8 sm:mt-12">
            <CategoryGrid categories={categories} />
          </div>
        </div>
      </section>

      {/* Brands marquee */}
      <BrandsMarquee
        brands={brands}
        autoplay={autoplay}
        intervalMs={intervalMs}
        showArrows={showArrows}
      />
    </div>
  );
}
