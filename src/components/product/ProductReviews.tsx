"use client";

import { useState } from "react";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";
import type { Review, ReviewStats } from "@/lib/actions/products";
import ReviewForm from "@/components/product/ReviewForm";

interface ProductReviewsProps {
  productId: string;
  reviews: Review[];
  stats: ReviewStats;
  currentPage: number;
  totalPages: number;
  onPageChange?: (page: number) => void;
}

export default function ProductReviews({
  productId,
  reviews,
  stats,
  currentPage,
  totalPages,
  onPageChange,
}: ProductReviewsProps) {
  const [showReviewForm, setShowReviewForm] = useState(false);

  const renderStars = (rating: number, size: "sm" | "md" = "md") => {
    const starClass = size === "sm" ? "h-4 w-4" : "h-5 w-5";
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${starClass} ${
              star <= rating ? "fill-dark-900 text-dark-900" : "text-light-300"
            }`}
          />
        ))}
      </div>
    );
  };

  const renderRatingBar = (rating: number, count: number) => {
    const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0;
    return (
      <div className="flex items-center gap-3">
        <span className="w-12 text-body text-dark-700">{rating} star</span>
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-light-200">
          <div
            className="h-full bg-dark-900 transition-all duration-300"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <span className="w-12 text-right text-caption text-dark-700">{count}</span>
      </div>
    );
  };

  return (
    <section className="mt-12">
      {/* Header with Stats */}
      <div className="mb-8">
        <h2 className="mb-4 text-heading-3 text-dark-900">Customer Reviews</h2>

        <div className="grid gap-8 md:grid-cols-[300px_1fr]">
          {/* Overall Rating */}
          <div className="flex flex-col items-start gap-2">
            <div className="text-display text-dark-900">
              {stats.average.toFixed(1)}
            </div>
            {renderStars(Math.round(stats.average), "md")}
            <p className="text-body text-dark-700">
              Based on {stats.total} review{stats.total !== 1 ? "s" : ""}
            </p>
            <button
              onClick={() => setShowReviewForm(true)}
              className="mt-2 rounded-full border border-dark-900 px-6 py-2 text-body-medium text-dark-900 transition hover:bg-dark-900 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-dark-500"
            >
              Write a Review
            </button>
          </div>

          {/* Rating Distribution */}
          <div className="flex flex-col gap-2">
            {[5, 4, 3, 2, 1].map((rating) =>
              renderRatingBar(rating, stats.distribution[rating as keyof typeof stats.distribution])
            )}
          </div>
        </div>
      </div>

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <div className="rounded-xl border border-light-300 bg-light-100 p-8 text-center">
          <p className="text-body text-dark-700">
            No reviews yet. Be the first to review this product!
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-6">
            {reviews.map((review) => (
              <article
                key={review.id}
                className="rounded-xl border border-light-300 p-6"
              >
                <div className="mb-3 flex items-start justify-between">
                  <div>
                    <p className="text-body-medium text-dark-900">{review.author}</p>
                    {review.isVerified && (
                      <span className="mt-1 inline-block text-caption text-green-600">
                        ✓ Verified Purchase
                      </span>
                    )}
                  </div>
                  {renderStars(review.rating, "sm")}
                </div>

                {review.title && (
                  <h3 className="mb-2 text-body-medium text-dark-900">{review.title}</h3>
                )}

                {review.content && (
                  <p className="mb-3 text-body text-dark-700">{review.content}</p>
                )}

                {review.pros && (
                  <div className="mb-2">
                    <p className="text-caption text-dark-700">
                      <span className="font-medium text-dark-900">Pros:</span> {review.pros}
                    </p>
                  </div>
                )}

                {review.cons && (
                  <div className="mb-3">
                    <p className="text-caption text-dark-700">
                      <span className="font-medium text-dark-900">Cons:</span> {review.cons}
                    </p>
                  </div>
                )}

                <p className="text-caption text-dark-700">
                  {new Date(review.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </article>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-4">
              <button
                onClick={() => onPageChange?.(currentPage - 1)}
                disabled={currentPage === 1}
                className="flex items-center gap-2 rounded-full border border-light-300 px-4 py-2 text-body-medium text-dark-900 transition hover:border-dark-500 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </button>

              <span className="text-body text-dark-700">
                Page {currentPage} of {totalPages}
              </span>

              <button
                onClick={() => onPageChange?.(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="flex items-center gap-2 rounded-full border border-light-300 px-4 py-2 text-body-medium text-dark-900 transition hover:border-dark-500 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </>
      )}

      {/* Review Form Modal */}
      {showReviewForm && (
        <ReviewForm
          productId={productId}
          onClose={() => setShowReviewForm(false)}
        />
      )}
    </section>
  );
}
