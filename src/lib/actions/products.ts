"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { wishlists, products, reviews, users } from "@/lib/db/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import { getProductBySlug, getProductById, getRelatedProducts } from "@/lib/db/queries/products";

// ============================================================================
// TYPES
// ============================================================================

export interface Review {
  id: string;
  rating: number;
  author: string;
  title: string | null;
  content: string | null;
  pros: string | null;
  cons: string | null;
  createdAt: Date;
  isVerified?: boolean;
}

export interface ReviewStats {
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

export interface RecommendedProduct {
  id: string;
  title: string;
  imageUrl: string;
  price: number | null;
}

// ============================================================================
// ADD TO WISHLIST
// ============================================================================

export async function addToWishlist(productId: string, userId: string) {
  try {
    if (!userId) {
      return { success: false, error: "You must be logged in" };
    }

    // Check if product exists
    const product = await db.query.products.findFirst({
      where: eq(products.id, productId),
    });

    if (!product) {
      return { success: false, error: "Product not found" };
    }

    // Check if already in wishlist
    const existing = await db.query.wishlists.findFirst({
      where: and(
        eq(wishlists.userId, userId),
        eq(wishlists.productId, productId)
      ),
    });

    if (existing) {
      return { success: false, error: "Already in wishlist" };
    }

    // Add to wishlist
    await db.insert(wishlists).values({
      userId,
      productId,
    });

    revalidatePath("/account/wishlist");
    revalidatePath(`/products/${product.slug}`);

    return { success: true, message: "Added to wishlist" };
  } catch (error) {
    console.error("Add to wishlist error:", error);
    return { success: false, error: "Failed to add to wishlist" };
  }
}

// ============================================================================
// REMOVE FROM WISHLIST
// ============================================================================

export async function removeFromWishlist(productId: string, userId: string) {
  try {
    if (!userId) {
      return { success: false, error: "You must be logged in" };
    }

    await db
      .delete(wishlists)
      .where(
        and(eq(wishlists.userId, userId), eq(wishlists.productId, productId))
      );

    revalidatePath("/account/wishlist");
    revalidatePath(`/products`);

    return { success: true, message: "Removed from wishlist" };
  } catch (error) {
    console.error("Remove from wishlist error:", error);
    return { success: false, error: "Failed to remove from wishlist" };
  }
}

// ============================================================================
// CHECK IF IN WISHLIST
// ============================================================================

export async function isInWishlist(productId: string, userId?: string) {
  try {
    if (!userId) {
      return false;
    }

    const item = await db.query.wishlists.findFirst({
      where: and(
        eq(wishlists.userId, userId),
        eq(wishlists.productId, productId)
      ),
    });

    return !!item;
  } catch (error) {
    console.error("Check wishlist error:", error);
    return false;
  }
}

// ============================================================================
// GET USER WISHLIST
// ============================================================================

export async function getUserWishlist(userId: string) {
  try {
    if (!userId) {
      return { items: [] };
    }

    const items = await db.query.wishlists.findMany({
      where: eq(wishlists.userId, userId),
    });

    // Fetch product details
    const enrichedItems = await Promise.all(
      items.map(async (item) => {
        const product = await db.query.products.findFirst({
          where: eq(products.id, item.productId),
        });

        return {
          ...item,
          product,
        };
      })
    );

    return { items: enrichedItems.filter((item) => item.product !== null) };
  } catch (error) {
    console.error("Get wishlist error:", error);
    return { items: [] };
  }
}

// ============================================================================
// TOGGLE WISHLIST (convenience function)
// ============================================================================

export async function toggleWishlist(productId: string, userId: string) {
  try {
    const inWishlist = await isInWishlist(productId, userId);

    if (inWishlist) {
      return await removeFromWishlist(productId, userId);
    } else {
      return await addToWishlist(productId, userId);
    }
  } catch (error) {
    console.error("Toggle wishlist error:", error);
    return { success: false, error: "Failed to update wishlist" };
  }
}

// ============================================================================
// GET PRODUCT BY SLUG
// ============================================================================

export async function getProduct(slug: string) {
  try {
    // Try to get by slug first
    let productData = await getProductBySlug(slug);
    
    // If slug fails and the string looks like a UUID, try by ID
    if (!productData && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug)) {
      console.log('Slug lookup failed, trying by ID:', slug);
      productData = await getProductById(slug);
    }
    
    if (!productData) {
      return null;
    }

    return {
      product: productData,
      variants: productData.variants || [],
      images: productData.images || [],
    };
  } catch (error) {
    console.error("Get product error:", error);
    return null;
  }
}

// ============================================================================
// GET PRODUCT REVIEWS
// ============================================================================

export async function getProductReviews(
  productId: string,
  page: number = 1,
  limit: number = 10
): Promise<{ reviews: Review[]; stats: ReviewStats; total: number; pages: number }> {
  try {
    const offset = (page - 1) * limit;

    // Fetch reviews with pagination
    const [productReviews, totalCount, ratingDistribution] = await Promise.all([
      db
        .select({
          id: reviews.id,
          rating: reviews.rating,
          title: reviews.title,
          comment: reviews.comment,
          pros: reviews.pros,
          cons: reviews.cons,
          createdAt: reviews.createdAt,
          userId: reviews.userId,
        })
        .from(reviews)
        .where(and(
          eq(reviews.productId, productId),
          eq(reviews.status, "approved")
        ))
        .orderBy(desc(reviews.createdAt))
        .limit(limit)
        .offset(offset),
      
      // Get total count
      db
        .select({ count: sql<number>`count(*)` })
        .from(reviews)
        .where(and(
          eq(reviews.productId, productId),
          eq(reviews.status, "approved")
        ))
        .then(result => Number(result[0]?.count || 0)),

      // Get rating distribution
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
    ]);

    // Fetch user details for each review
    const enrichedReviews = await Promise.all(
      productReviews.map(async (review) => {
        const user = await db.query.users.findFirst({
          where: eq(users.id, review.userId),
        });

        return {
          id: review.id,
          rating: review.rating,
          author: user?.name || "Anonymous",
          title: review.title,
          content: review.comment,
          pros: review.pros,
          cons: review.cons,
          createdAt: review.createdAt,
          isVerified: false, // TODO: Implement verified purchase check
        };
      })
    );

    // Calculate distribution
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

    const stats: ReviewStats = {
      average,
      total: totalCount,
      distribution,
    };

    return {
      reviews: enrichedReviews,
      stats,
      total: totalCount,
      pages: Math.ceil(totalCount / limit),
    };
  } catch (error) {
    console.error("Get product reviews error:", error);
    return {
      reviews: [],
      stats: { average: 0, total: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } },
      total: 0,
      pages: 0,
    };
  }
}

// ============================================================================
// GET RECOMMENDED PRODUCTS
// ============================================================================

export async function getRecommendedProducts(
  productId: string
): Promise<RecommendedProduct[]> {
  try {
    const relatedProducts = await getRelatedProducts(productId, 6);

    return relatedProducts.map((product) => ({
      id: (product as unknown as { slug: string }).slug,
      title: (product as unknown as { name: string }).name,
      imageUrl: product.image?.url || "/placeholder-product.svg",
      price: product.minPrice,
    }));
  } catch (error) {
    console.error("Get recommended products error:", error);
    return [];
  }
}
