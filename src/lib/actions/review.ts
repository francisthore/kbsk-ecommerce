"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { reviews, products } from "@/lib/db/schema";
import { eq, and, sql } from "drizzle-orm";

// ============================================================================
// TYPES
// ============================================================================

export interface ReviewFormData {
  productId: string;
  userId: string;
  rating: number;
  title?: string;
  comment?: string;
  pros?: string;
  cons?: string;
}

export interface ReviewStatsData {
  average: number;
  total: number;
  distribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

// ============================================================================
// SUBMIT REVIEW
// ============================================================================

export async function submitReview(data: ReviewFormData) {
  try {
    if (!data.userId) {
      return { success: false, error: "You must be logged in to submit a review" };
    }

    // Validate rating
    if (data.rating < 1 || data.rating > 5) {
      return { success: false, error: "Rating must be between 1 and 5" };
    }

    // Check if product exists
    const product = await db.query.products.findFirst({
      where: eq(products.id, data.productId),
    });

    if (!product) {
      return { success: false, error: "Product not found" };
    }

    // Check if user already reviewed this product
    const existingReview = await db.query.reviews.findFirst({
      where: and(
        eq(reviews.productId, data.productId),
        eq(reviews.userId, data.userId)
      ),
    });

    if (existingReview) {
      return { success: false, error: "You have already reviewed this product" };
    }

    // Create review
    const [review] = await db
      .insert(reviews)
      .values({
        productId: data.productId,
        userId: data.userId,
        rating: data.rating,
        title: data.title || null,
        comment: data.comment || null,
        pros: data.pros || null,
        cons: data.cons || null,
        status: "pending", // Reviews require approval
      })
      .returning();

    revalidatePath(`/products/${product.slug}`);

    return {
      success: true,
      message: "Review submitted successfully. It will be visible after approval.",
      reviewId: review.id,
    };
  } catch (error) {
    console.error("Submit review error:", error);
    return { success: false, error: "Failed to submit review" };
  }
}

// ============================================================================
// GET REVIEW STATS
// ============================================================================

export async function getReviewStats(productId: string): Promise<ReviewStatsData> {
  try {
    const [ratingDistribution, totalCount] = await Promise.all([
      db
        .select({
          rating: reviews.rating,
          count: sql<number>`count(*)`,
        })
        .from(reviews)
        .where(and(
          eq(reviews.productId, productId),
          eq(reviews.status, "approved")
        ))
        .groupBy(reviews.rating),

      db
        .select({ count: sql<number>`count(*)` })
        .from(reviews)
        .where(and(
          eq(reviews.productId, productId),
          eq(reviews.status, "approved")
        ))
        .then(result => Number(result[0]?.count || 0)),
    ]);

    // Build distribution object
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    ratingDistribution.forEach(({ rating, count }) => {
      if (rating >= 1 && rating <= 5) {
        distribution[rating as keyof typeof distribution] = Number(count);
      }
    });

    // Calculate average
    const totalRatings = Object.values(distribution).reduce((sum, count) => sum + count, 0);
    const weightedSum = Object.entries(distribution).reduce(
      (sum, [rating, count]) => sum + Number(rating) * count,
      0
    );
    const average = totalRatings > 0 ? weightedSum / totalRatings : 0;

    return {
      average,
      total: totalCount,
      distribution,
    };
  } catch (error) {
    console.error("Get review stats error:", error);
    return {
      average: 0,
      total: 0,
      distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    };
  }
}

// ============================================================================
// UPDATE REVIEW
// ============================================================================

export async function updateReview(
  reviewId: string,
  userId: string,
  data: Partial<ReviewFormData>
) {
  try {
    if (!userId) {
      return { success: false, error: "You must be logged in" };
    }

    const review = await db.query.reviews.findFirst({
      where: eq(reviews.id, reviewId),
    });

    if (!review) {
      return { success: false, error: "Review not found" };
    }

    if (review.userId !== userId) {
      return { success: false, error: "You can only edit your own reviews" };
    }

    await db
      .update(reviews)
      .set({
        ...(data.rating !== undefined && { rating: data.rating }),
        ...(data.title !== undefined && { title: data.title || null }),
        ...(data.comment !== undefined && { comment: data.comment || null }),
        ...(data.pros !== undefined && { pros: data.pros || null }),
        ...(data.cons !== undefined && { cons: data.cons || null }),
        status: "pending", // Re-submit for approval
      })
      .where(eq(reviews.id, reviewId));

    const product = await db.query.products.findFirst({
      where: eq(products.id, review.productId),
    });

    if (product) {
      revalidatePath(`/products/${product.slug}`);
    }

    return { success: true, message: "Review updated successfully" };
  } catch (error) {
    console.error("Update review error:", error);
    return { success: false, error: "Failed to update review" };
  }
}

// ============================================================================
// DELETE REVIEW
// ============================================================================

export async function deleteReview(reviewId: string, userId: string) {
  try {
    if (!userId) {
      return { success: false, error: "You must be logged in" };
    }

    const review = await db.query.reviews.findFirst({
      where: eq(reviews.id, reviewId),
    });

    if (!review) {
      return { success: false, error: "Review not found" };
    }

    if (review.userId !== userId) {
      return { success: false, error: "You can only delete your own reviews" };
    }

    await db.delete(reviews).where(eq(reviews.id, reviewId));

    const product = await db.query.products.findFirst({
      where: eq(products.id, review.productId),
    });

    if (product) {
      revalidatePath(`/products/${product.slug}`);
    }

    return { success: true, message: "Review deleted successfully" };
  } catch (error) {
    console.error("Delete review error:", error);
    return { success: false, error: "Failed to delete review" };
  }
}
