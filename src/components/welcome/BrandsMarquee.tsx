"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useRef, useCallback } from "react";
import type { BrandLogo } from "@/types/welcome-section";

export interface BrandsMarqueeProps {
  brands: BrandLogo[];
  autoplay?: boolean;
  intervalMs?: number;
  showArrows?: boolean;
  className?: string;
}

export default function BrandsMarquee({
  brands,
  autoplay = true,
  intervalMs = 3000,
  showArrows = true,
  className = "",
}: BrandsMarqueeProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isDocumentHidden, setIsDocumentHidden] = useState(false);
  const [hoveredBrand, setHoveredBrand] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(5);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const announcementRef = useRef<HTMLDivElement>(null);

  const totalBrands = brands.length;

  // Navigate to next brand
  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % totalBrands);
  }, [totalBrands]);

  // Navigate to previous brand
  const goToPrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev === 0 ? totalBrands - 1 : prev - 1));
  }, [totalBrands]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!containerRef.current?.contains(document.activeElement)) {
        return;
      }

      if (e.key === "ArrowLeft") {
        e.preventDefault();
        goToPrevious();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        goToNext();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goToPrevious, goToNext]);

  // Handle document visibility change
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsDocumentHidden(document.hidden);
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  // Autoplay timer
  useEffect(() => {
    if (!autoplay || isHovered || isDocumentHidden || totalBrands <= 1) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    timerRef.current = setInterval(() => {
      goToNext();
    }, intervalMs);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [autoplay, isHovered, isDocumentHidden, intervalMs, goToNext, totalBrands]);

  // Handle responsive visible count
  useEffect(() => {
    const getVisibleCount = () => {
      if (typeof window === "undefined") return 5;
      const width = window.innerWidth;
      if (width < 640) return 3; // mobile
      if (width < 1024) return 4; // tablet
      return 6; // desktop
    };

    const handleResize = () => {
      setVisibleCount(getVisibleCount());
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Announce slide changes for screen readers
  useEffect(() => {
    if (announcementRef.current) {
      announcementRef.current.textContent = `Slide ${currentIndex + 1} of ${totalBrands}`;
    }
  }, [currentIndex, totalBrands]);

  if (totalBrands === 0) {
    return null;
  }

  // Get visible brands with wrapping
  const getVisibleBrands = () => {
    const visible = [];
    for (let i = 0; i < visibleCount; i++) {
      const index = (currentIndex + i) % totalBrands;
      visible.push({ ...brands[index], displayIndex: i });
    }
    return visible;
  };

  const visibleBrands = getVisibleBrands();

  return (
    <section
      ref={containerRef}
      className={`relative w-full overflow-hidden bg-light-100 py-8 sm:py-12 ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      aria-label="Popular Brands"
    >
      {/* Screen reader announcement */}
      <div
        ref={announcementRef}
        className="sr-only"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      />
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <h2 className="mb-6 text-center text-2xl font-bold text-dark-900 sm:mb-8 sm:text-3xl">
          Popular Brands
        </h2>

        <div className="relative">
          {/* Brands container */}
          <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 sm:gap-6 lg:grid-cols-6 lg:gap-8">
            {visibleBrands.map((brand, idx) => (
              <Link
                key={`${brand.slug}-${idx}`}
                href={`/brands/${brand.slug}`}
                className="group relative flex aspect-[3/2] items-center justify-center rounded-lg border border-neutral-200 bg-white p-4 shadow-sm transition-all hover:border-neutral-300 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 sm:p-6"
                onMouseEnter={() => setHoveredBrand(brand.slug)}
                onMouseLeave={() => setHoveredBrand(null)}
                aria-label={`View ${brand.name} products`}
              >
                {/* Black and white logo */}
                <div
                  className={`absolute inset-0 flex items-center justify-center p-4 transition-opacity duration-300 sm:p-6 ${
                    hoveredBrand === brand.slug ? "opacity-0" : "opacity-100"
                  }`}
                >
                  <Image
                    src={brand.logoBwSrc}
                    alt={brand.alt || `${brand.name} logo`}
                    width={160}
                    height={80}
                    className="h-auto w-full object-contain"
                    sizes="(max-width: 640px) 25vw, (max-width: 1024px) 20vw, 160px"
                  />
                </div>

                {/* Color logo */}
                <div
                  className={`absolute inset-0 flex items-center justify-center p-4 transition-opacity duration-300 sm:p-6 ${
                    hoveredBrand === brand.slug ? "opacity-100" : "opacity-0"
                  }`}
                >
                  <Image
                    src={brand.logoColorSrc}
                    alt={brand.alt || `${brand.name} logo`}
                    width={160}
                    height={80}
                    className="h-auto w-full object-contain"
                    sizes="(max-width: 640px) 25vw, (max-width: 1024px) 20vw, 160px"
                  />
                </div>
              </Link>
            ))}
          </div>

          {/* Navigation arrows */}
          {showArrows && totalBrands > visibleCount && (
            <>
              <button
                onClick={goToPrevious}
                className="absolute left-0 top-1/2 z-10 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-2xl text-dark-900 shadow-lg transition-all hover:bg-neutral-100 hover:shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 sm:h-12 sm:w-12"
                aria-label="Previous brands"
                type="button"
              >
                ‹
              </button>

              <button
                onClick={goToNext}
                className="absolute right-0 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 translate-x-1/2 items-center justify-center rounded-full bg-white text-2xl text-dark-900 shadow-lg transition-all hover:bg-neutral-100 hover:shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 sm:h-12 sm:w-12"
                aria-label="Next brands"
                type="button"
              >
                ›
              </button>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
