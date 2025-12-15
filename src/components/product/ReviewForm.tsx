"use client";

import { useState, useTransition } from "react";
import { X, Star } from "lucide-react";
import { submitReview } from "@/lib/actions/review";

interface ReviewFormProps {
  productId: string;
  onClose: () => void;
  userId?: string;
}

export default function ReviewForm({
  productId,
  onClose,
  userId,
}: ReviewFormProps) {
  const [isPending, startTransition] = useTransition();
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [pros, setPros] = useState("");
  const [cons, setCons] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!userId) {
      setError("You must be logged in to submit a review");
      return;
    }

    if (rating === 0) {
      setError("Please select a rating");
      return;
    }

    startTransition(async () => {
      const result = await submitReview({
        productId,
        userId,
        rating,
        title: title.trim() || undefined,
        comment: comment.trim() || undefined,
        pros: pros.trim() || undefined,
        cons: cons.trim() || undefined,
      });

      if (result.success) {
        setSuccess(true);
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        setError(result.error || "Failed to submit review");
      }
    });
  };

  if (success) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div className="w-full max-w-md rounded-xl bg-white p-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <svg
              className="h-8 w-8 text-green-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h3 className="mb-2 text-heading-3 text-dark-900">Review Submitted!</h3>
          <p className="text-body text-dark-700">
            Thank you for your review. It will be visible after approval.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl rounded-xl bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-light-300 p-6">
          <h2 className="text-heading-3 text-dark-900">Write a Review</h2>
          <button
            onClick={onClose}
            className="rounded-full p-2 transition hover:bg-light-100"
            aria-label="Close"
          >
            <X className="h-5 w-5 text-dark-900" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* Rating */}
          <div className="mb-6">
            <label className="mb-2 block text-body-medium text-dark-900">
              Rating <span className="text-red-600">*</span>
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="transition hover:scale-110"
                >
                  <Star
                    className={`h-8 w-8 ${
                      star <= (hoveredRating || rating)
                        ? "fill-dark-900 text-dark-900"
                        : "text-light-300"
                    }`}
                  />
                </button>
              ))}
              {rating > 0 && (
                <span className="ml-2 text-body text-dark-700">({rating}/5)</span>
              )}
            </div>
          </div>

          {/* Title */}
          <div className="mb-6">
            <label htmlFor="title" className="mb-2 block text-body-medium text-dark-900">
              Review Title
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Sum up your experience"
              className="w-full rounded-lg border border-light-300 px-4 py-3 text-body text-dark-900 transition focus:border-dark-500 focus:outline-none focus:ring-2 focus:ring-dark-500"
              maxLength={100}
            />
          </div>

          {/* Comment */}
          <div className="mb-6">
            <label htmlFor="comment" className="mb-2 block text-body-medium text-dark-900">
              Review
            </label>
            <textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your thoughts about this product"
              rows={4}
              className="w-full rounded-lg border border-light-300 px-4 py-3 text-body text-dark-900 transition focus:border-dark-500 focus:outline-none focus:ring-2 focus:ring-dark-500"
              maxLength={1000}
            />
          </div>

          {/* Pros */}
          <div className="mb-6">
            <label htmlFor="pros" className="mb-2 block text-body-medium text-dark-900">
              Pros (Optional)
            </label>
            <input
              id="pros"
              type="text"
              value={pros}
              onChange={(e) => setPros(e.target.value)}
              placeholder="What did you like?"
              className="w-full rounded-lg border border-light-300 px-4 py-3 text-body text-dark-900 transition focus:border-dark-500 focus:outline-none focus:ring-2 focus:ring-dark-500"
              maxLength={200}
            />
          </div>

          {/* Cons */}
          <div className="mb-6">
            <label htmlFor="cons" className="mb-2 block text-body-medium text-dark-900">
              Cons (Optional)
            </label>
            <input
              id="cons"
              type="text"
              value={cons}
              onChange={(e) => setCons(e.target.value)}
              placeholder="What could be improved?"
              className="w-full rounded-lg border border-light-300 px-4 py-3 text-body text-dark-900 transition focus:border-dark-500 focus:outline-none focus:ring-2 focus:ring-dark-500"
              maxLength={200}
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 rounded-lg bg-red-50 p-4 text-body text-red-600">
              {error}
            </div>
          )}

          {/* Submit Buttons */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-full border border-light-300 px-6 py-3 text-body-medium text-dark-900 transition hover:border-dark-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-dark-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending || rating === 0}
              className="flex-1 rounded-full bg-dark-900 px-6 py-3 text-body-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-dark-500"
            >
              {isPending ? "Submitting..." : "Submit Review"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
