"use client";

import Image from "next/image";
import Link from "next/link";
import type { CategoryCard } from "@/types/welcome-section";

export interface CategoryGridProps {
  categories: CategoryCard[];
  className?: string;
}

export default function CategoryGrid({ categories, className = "" }: CategoryGridProps) {
  if (categories.length === 0) {
    return null;
  }

  return (
    <section className={`w-full bg-transparent ${className}`} aria-label="Shop by Category">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        {/* Grid container */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 lg:gap-6">
          {categories.map((category) => {
            // List variant with bullet points and "View All" CTA
            if (category.variant === "list") {
              return (
                <div
                  key={category.key}
                  className="flex flex-col rounded-lg border border-neutral-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
                >
                  <h3 className="mb-4 text-xl font-bold text-dark-900">{category.title}</h3>
                  {category.items && category.items.length > 0 && (
                    <ul className="mb-4 flex-1 space-y-2">
                      {category.items.map((item, idx) => (
                        <li key={idx}>
                          <Link
                            href={item.href}
                            className="text-dark-700 transition-colors hover:text-[var(--color-primary)] focus:outline-none focus-visible:text-[var(--color-primary)] focus-visible:underline"
                          >
                            • {item.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                  <Link
                    href={category.href}
                    className="mt-auto inline-flex items-center font-semibold text-[var(--color-primary)] transition-colors hover:text-[var(--color-primary-dark)] focus:outline-none focus-visible:underline"
                  >
                    View All →
                  </Link>
                </div>
              );
            }

            // Hero-tall variant: large image tile
            if (category.variant === "hero-tall") {
              return (
                <Link
                  key={category.key}
                  href={category.href}
                  className="group relative overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-sm transition-all hover:scale-[1.02] hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 md:row-span-2"
                >
                  {category.imageSrc && (
                    <div className="relative aspect-[3/4] w-full md:h-full">
                      <Image
                        src={category.imageSrc}
                        alt={category.imageAlt || category.title}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-dark-900/60 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-6">
                        <h3 className="text-2xl font-bold text-white">{category.title}</h3>
                      </div>
                    </div>
                  )}
                </Link>
              );
            }

            // Tile variant: horizontal image tile
            return (
              <Link
                key={category.key}
                href={category.href}
                className="group relative overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-sm transition-all hover:scale-[1.02] hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2"
              >
                {category.imageSrc && (
                  <div className="relative aspect-[16/9] w-full lg:aspect-[4/3]">
                    <Image
                      src={category.imageSrc}
                      alt={category.imageAlt || category.title}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-dark-900/60 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <h3 className="text-lg font-bold text-white sm:text-xl">{category.title}</h3>
                    </div>
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
