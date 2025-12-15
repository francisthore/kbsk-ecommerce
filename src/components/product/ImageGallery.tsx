"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";

interface ImageGalleryProps {
  images: string[];
  productName: string;
  className?: string;
}

export default function ImageGallery({
  images,
  productName,
  className = "",
}: ImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);

  if (!images || images.length === 0) {
    return (
      <div className={`flex items-center justify-center rounded-xl bg-light-200 ${className}`}>
        <p className="text-body text-dark-700">No images available</p>
      </div>
    );
  }

  const handlePrevious = () => {
    setSelectedIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setSelectedIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") handlePrevious();
    if (e.key === "ArrowRight") handleNext();
    if (e.key === "Escape") setIsZoomed(false);
  };

  return (
    <div className={className} onKeyDown={handleKeyDown} tabIndex={0}>
      {/* Main Image Display */}
      <div className="relative aspect-square overflow-hidden rounded-xl bg-light-100">
        <Image
          src={images[selectedIndex]}
          alt={`${productName} - Image ${selectedIndex + 1}`}
          fill
          className={`object-contain transition-transform duration-300 ${
            isZoomed ? "scale-150 cursor-zoom-out" : "cursor-zoom-in"
          }`}
          onClick={() => setIsZoomed(!isZoomed)}
          priority={selectedIndex === 0}
        />

        {/* Navigation Arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={handlePrevious}
              className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow-lg transition hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-dark-500"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-5 w-5 text-dark-900" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow-lg transition hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-dark-500"
              aria-label="Next image"
            >
              <ChevronRight className="h-5 w-5 text-dark-900" />
            </button>
          </>
        )}

        {/* Zoom Indicator */}
        <div className="absolute bottom-2 right-2 rounded-full bg-white/90 p-2">
          <ZoomIn className="h-4 w-4 text-dark-700" />
        </div>

        {/* Image Counter */}
        {images.length > 1 && (
          <div className="absolute bottom-2 left-2 rounded-full bg-dark-900/80 px-3 py-1 text-caption text-white">
            {selectedIndex + 1} / {images.length}
          </div>
        )}
      </div>

      {/* Thumbnail Strip */}
      {images.length > 1 && (
        <div className="mt-4 flex gap-2 overflow-x-auto">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => setSelectedIndex(index)}
              className={`relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border-2 transition ${
                index === selectedIndex
                  ? "border-dark-900"
                  : "border-light-300 hover:border-dark-500"
              }`}
              aria-label={`View image ${index + 1}`}
            >
              <Image
                src={image}
                alt={`${productName} - Thumbnail ${index + 1}`}
                fill
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
