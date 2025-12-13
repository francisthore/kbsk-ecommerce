"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useCallback, useRef } from "react";

export type CtaPosition = "center" | "bottom-center" | "bottom-right" | "bottom-left";

export interface HeroSlide {
  id: string;
  imageSrc: string;
  imageAlt: string;
  ctaLabel?: string;
  ctaHref: string;
  ctaPosition?: CtaPosition;
}

export interface HeroSliderProps {
  slides: HeroSlide[];
  autoPlay?: boolean;
  intervalMs?: number;
  showDots?: boolean;
  className?: string;
}

const CTA_POSITION_CLASSES: Record<CtaPosition, string> = {
  center: "absolute inset-0 flex items-center justify-center",
  "bottom-center": "absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full mt-4 sm:mt-6 md:mt-8",
  "bottom-right": "absolute bottom-0 right-8 translate-y-full mt-4 sm:mt-6 md:mt-8 sm:right-12 md:right-16",
  "bottom-left": "absolute bottom-0 left-8 translate-y-full mt-4 sm:mt-6 md:mt-8 sm:left-12 md:left-16",
};

export default function HeroSlider({
  slides,
  autoPlay = true,
  intervalMs = 6000,
  showDots = true,
  className = "",
}: HeroSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isDocumentHidden, setIsDocumentHidden] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const announcementRef = useRef<HTMLDivElement>(null);

  const totalSlides = slides.length;

  // Navigate to previous slide
  const goToPrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev === 0 ? totalSlides - 1 : prev - 1));
  }, [totalSlides]);

  // Navigate to next slide
  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev === totalSlides - 1 ? 0 : prev + 1));
  }, [totalSlides]);

  // Go to specific slide
  const goToSlide = useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
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
    if (!autoPlay || isHovered || isDocumentHidden || totalSlides <= 1) {
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
  }, [autoPlay, isHovered, isDocumentHidden, intervalMs, goToNext, totalSlides]);

  // Announce slide changes for screen readers
  useEffect(() => {
    if (announcementRef.current) {
      announcementRef.current.textContent = `Slide ${currentIndex + 1} of ${totalSlides}`;
    }
  }, [currentIndex, totalSlides]);

  if (totalSlides === 0) {
    return null;
  }

  const currentSlide = slides[currentIndex];
  const ctaPosition = currentSlide.ctaPosition || "bottom-center";

  return (
    <section
      className={`relative w-full overflow-hidden bg-dark-200 ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      aria-roledescription="carousel"
      aria-label="Hero product showcase"
    >
      {/* Screen reader announcement */}
      <div
        ref={announcementRef}
        className="sr-only"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      />

      {/* Main container with max-width constraint */}
      <div className="relative mx-auto w-[90%]">
        {/* Slides container */}
        <div className="relative aspect-[16/9] w-full sm:aspect-[21/9] md:aspect-[24/9]">
          {slides.map((slide, index) => (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-700 ${
                index === currentIndex ? "opacity-100" : "opacity-0"
              }`}
              aria-hidden={index !== currentIndex}
            >
              {/* Slide image */}
              <div className="relative h-full w-full">
                <Image
                  src={slide.imageSrc}
                  alt={slide.imageAlt}
                  fill
                  priority={index === 0}
                  className="object-contain"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1280px"
                />
              </div>
            </div>
          ))}
        </div>

        {/* CTA Button - positioned below the image container */}
        {currentSlide.ctaLabel && (
          <div className="flex justify-center mt-4 sm:mt-6 md:mt-8">
            <Link
              href={currentSlide.ctaHref}
              className="group inline-flex items-center justify-center gap-3 rounded-full bg-[var(--color-cta)] px-8 py-3.5 font-semibold text-light-100 shadow-lg transition-all hover:bg-[var(--color-cta-dark)] hover:shadow-xl focus:outline-none focus-visible:ring-4 focus-visible:ring-[var(--color-cta)] focus-visible:ring-offset-2 sm:px-10 sm:py-4 text-base sm:text-lg"
              aria-label={`${currentSlide.ctaLabel} - ${currentSlide.imageAlt}`}
            >
              {currentSlide.ctaLabel} →
            </Link>
          </div>
        )}

        {/* Pagination dots - only show if enabled and more than 1 slide */}
        {showDots && totalSlides > 1 && (
          <div
            className="flex justify-center gap-2 mt-4 sm:mt-6"
            role="tablist"
            aria-label="Slide navigation"
          >
            {slides.map((slide, index) => (
              <button
                key={slide.id}
                onClick={() => goToSlide(index)}
                className={`h-2.5 rounded-full transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-dark-900 ${
                  index === currentIndex
                    ? "w-8 bg-white"
                    : "w-2.5 bg-white/50 hover:bg-white/75"
                }`}
                aria-label={`Go to slide ${index + 1}`}
                aria-current={index === currentIndex ? "true" : "false"}
                role="tab"
                type="button"
              />
            ))}
          </div>
        )}

        {/* Navigation arrows - only show if more than 1 slide */}
        {totalSlides > 1 && (
          <>
            {/* Previous button */}
            <button
              onClick={goToPrevious}
              className="absolute left-4 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-2xl text-dark-900 shadow-lg backdrop-blur-sm transition-all hover:bg-white hover:shadow-xl focus:outline-none focus-visible:ring-4 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-dark-900 sm:h-12 sm:w-12 sm:text-3xl md:left-8"
              aria-label="Previous slide"
              type="button"
            >
              ‹
            </button>

            {/* Next button */}
            <button
              onClick={goToNext}
              className="absolute right-4 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-2xl text-dark-900 shadow-lg backdrop-blur-sm transition-all hover:bg-white hover:shadow-xl focus:outline-none focus-visible:ring-4 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-dark-900 sm:h-12 sm:w-12 sm:text-3xl md:right-8"
              aria-label="Next slide"
              type="button"
            >
              ›
            </button>
          </>
        )}
      </div>
    </section>
  );
}
