"use client";

import Image from "next/image";
import Link from "next/link";

export type BadgeType =
  | "New"
  | "Bestseller"
  | "Sale"
  | "PPE"
  | "Limited"
  | string;

export interface CardProps {
  title: string;
  description?: string;
  imageSrc: string;
  imageAlt?: string;
  href?: string;
  price?: number;
  originalPrice?: number;
  currency?: string;
  badge?: BadgeType;
  rating?: number;
  reviewCount?: number;
  onAddToCart?: () => void;
  compact?: boolean;
  className?: string;
}

const getBadgeStyles = (badge: BadgeType): string => {
  const badgeMap: Record<string, string> = {
    New: "bg-[var(--color-primary)] text-light-100",
    Bestseller: "bg-[--color-secondary] text-light-100",
    Sale: "bg-[var(--color-cta)] text-light-100",
    PPE: "bg-dark-900 text-light-100",
    Limited: "bg-dark-700 text-light-100",
  };
  return (
    badgeMap[badge] ||
    "bg-dark-500 text-light-100"
  );
};

const StarRating = ({
  rating,
  reviewCount,
}: {
  rating: number;
  reviewCount?: number;
}) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-0.5" aria-label={`Rating: ${rating} out of 5 stars`}>
        {Array.from({ length: fullStars }).map((_, i) => (
          <Image
            key={`full-${i}`}
            src="/icons/star.svg"
            alt=""
            width={16}
            height={16}
            className="h-4 w-4 text-orange"
          />
        ))}
        {hasHalfStar && (
          <Image
            src="/icons/star-half.svg"
            alt=""
            width={16}
            height={16}
            className="h-4 w-4 text-orange"
          />
        )}
        {Array.from({ length: emptyStars }).map((_, i) => (
          <Image
            key={`empty-${i}`}
            src="/icons/star.svg"
            alt=""
            width={16}
            height={16}
            className="h-4 w-4 text-light-400"
          />
        ))}
      </div>
      {reviewCount !== undefined && reviewCount > 0 && (
        <span className="text-caption text-dark-700">
          ({reviewCount})
        </span>
      )}
    </div>
  );
};

export default function Card({
  title,
  description,
  imageSrc,
  imageAlt,
  href,
  price,
  originalPrice,
  currency = "ZAR",
  badge,
  rating,
  reviewCount,
  onAddToCart,
  compact = false,
  className = "",
}: CardProps) {
  const formatPrice = (amount: number): string => {
    return new Intl.NumberFormat("en-ZA", {
      style: "currency",
      currency,
    }).format(amount);
  };

  const discountPercentage =
    originalPrice && price
      ? Math.round(((originalPrice - price) / originalPrice) * 100)
      : 0;

  const cardContent = (
    <article
      className={`group relative flex flex-col overflow-hidden rounded-lg bg-light-100 shadow-sm ring-1 ring-light-300 transition-all hover:shadow-md hover:ring-dark-500 ${
        compact ? "h-full" : ""
      } ${className}`}
    >
      <div
        className={`relative overflow-hidden bg-light-200 ${
          compact ? "aspect-square" : "aspect-[4/3]"
        }`}
      >
        {badge && (
          <div
            className={`absolute left-3 top-3 z-10 rounded-md px-2 py-1 text-footnote font-medium ${getBadgeStyles(
              badge
            )}`}
          >
            {badge}
          </div>
        )}
        {discountPercentage > 0 && (
          <div className="absolute right-3 top-3 z-10 rounded-md bg-red px-2 py-1 text-footnote font-medium text-light-100">
            -{discountPercentage}%
          </div>
        )}
        <Image
          src={imageSrc}
          alt={imageAlt || title}
          fill
          sizes={
            compact
              ? "(min-width: 1280px) 280px, (min-width: 1024px) 240px, (min-width: 640px) 45vw, 90vw"
              : "(min-width: 1280px) 360px, (min-width: 1024px) 300px, (min-width: 640px) 45vw, 90vw"
          }
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>

      <div
        className={`flex flex-1 flex-col ${
          compact ? "p-3" : "p-4"
        }`}
      >
        <h3
          className={`${
            compact ? "text-body-medium" : "text-heading-3"
          } mb-2 text-dark-900 line-clamp-2`}
        >
          {title}
        </h3>

        {!compact && description && (
          <p className="mb-3 text-body text-dark-700 line-clamp-2">
            {description}
          </p>
        )}

        {rating !== undefined && (
          <div className="mb-3">
            <StarRating rating={rating} reviewCount={reviewCount} />
          </div>
        )}

        <div className="mt-auto">
          {price !== undefined && (
            <div className="mb-3 flex items-baseline gap-2">
              <span
                className={`${
                  compact ? "text-lead" : "text-heading-3"
                } font-bold text-dark-900`}
              >
                {formatPrice(price)}
              </span>
              {originalPrice && originalPrice > price && (
                <span className="text-body text-dark-500 line-through">
                  {formatPrice(originalPrice)}
                </span>
              )}
            </div>
          )}

          <div
            className={`flex gap-2 ${
              compact ? "flex-col" : "flex-row"
            }`}
          >
            {onAddToCart && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  onAddToCart();
                }}
                className={`${
                  compact
                    ? "w-full"
                    : "flex-1"
                } rounded-md bg-[var(--color-cta)] px-4 py-2 text-body-medium font-medium text-light-100 transition-colors hover:bg-[var(--color-cta-dark)] focus:outline-none focus:ring-2 focus:ring-[var(--color-cta)] focus:ring-offset-2`}
                aria-label={`Add ${title} to cart`}
              >
                Add to Cart
              </button>
            )}
            {href && onAddToCart && (
              <Link
                href={href}
                className={`${
                  compact
                    ? "w-full"
                    : onAddToCart
                      ? "flex-1"
                      : "w-full"
                } flex items-center justify-center rounded-md border-2 border-[--color-primary] bg-light-100 px-4 py-2 text-body-medium font-medium text-[var(--color-primary)] transition-colors hover:bg-[var(--color-primary)] hover:text-light-100 focus:outline-none focus:ring-2 focus:ring-[--color-primary] focus:ring-offset-2`}
                aria-label={`View details for ${title}`}
              >
                Details
              </Link>
            )}
          </div>
        </div>
      </div>
    </article>
  );

  return href && !onAddToCart ? (
    <Link href={href} className="block h-full focus:outline-none">
      {cardContent}
    </Link>
  ) : (
    cardContent
  );
}
