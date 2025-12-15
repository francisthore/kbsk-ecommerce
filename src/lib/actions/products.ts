"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { wishlists, products, reviews, users } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { getProductBySlug, getRelatedProducts } from "@/lib/db/queries/products";

// ============================================================================
// TYPES
// ============================================================================

export interface Review {
  id: string;
  rating: number;
  author: string;
  title: string | null;
  content: string | null;
  createdAt: Date;
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
    const productData = await getProductBySlug(slug);
    
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

export async function getProductReviews(productId: string): Promise<Review[]> {
  try {
    const productReviews = await db
      .select({
        id: reviews.id,
        rating: reviews.rating,
        title: reviews.title,
        comment: reviews.comment,
        createdAt: reviews.createdAt,
        userId: reviews.userId,
      })
      .from(reviews)
      .where(and(
        eq(reviews.productId, productId),
        eq(reviews.status, "approved")
      ))
      .orderBy(desc(reviews.createdAt))
      .limit(50);

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
          createdAt: review.createdAt,
        };
      })
    );

    return enrichedReviews;
  } catch (error) {
    console.error("Get product reviews error:", error);
    return [];
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
      id: product.slug,
      title: product.name,
      imageUrl: product.image?.url || "/placeholder-product.svg",
      price: product.minPrice,
    }));
  } catch (error) {
    console.error("Get recommended products error:", error);
    return [];
  }
}
