"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import {
  carts,
  cartItems,
  productVariants,
  products,
  productImages,
  guests,
} from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { nanoid } from "nanoid";

// Helper: Get or create guest session
async function getOrCreateGuestSession() {
  const cookieStore = await cookies();
  let guestToken = cookieStore.get("guest_session")?.value;

  if (!guestToken) {
    // Create new guest session
    guestToken = nanoid(32);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30 days

    const [guest] = await db
      .insert(guests)
      .values({
        sessionToken: guestToken,
        expiresAt,
      })
      .returning();

    cookieStore.set("guest_session", guestToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      expires: expiresAt,
    });

    return guest.id;
  }

  // Find existing guest
  const guest = await db.query.guests.findFirst({
    where: eq(guests.sessionToken, guestToken),
  });

  if (!guest) {
    // Guest expired, create new one
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    const [newGuest] = await db
      .insert(guests)
      .values({
        sessionToken: guestToken,
        expiresAt,
      })
      .returning();

    return newGuest.id;
  }

  return guest.id;
}

// Helper: Get or create cart
async function getOrCreateCart(userId?: string, accountId?: string) {
  if (userId) {
    // Authenticated user - find or create user cart
    let cart = await db.query.carts.findFirst({
      where: eq(carts.userId, userId),
    });

    if (!cart) {
      const [newCart] = await db
        .insert(carts)
        .values({
          userId,
          accountId: accountId || null,
        })
        .returning();
      cart = newCart;
    }

    return cart.id;
  } else {
    // Guest user - find or create guest cart
    const guestId = await getOrCreateGuestSession();

    let cart = await db.query.carts.findFirst({
      where: eq(carts.guestId, guestId),
    });

    if (!cart) {
      const [newCart] = await db
        .insert(carts)
        .values({
          guestId,
        })
        .returning();
      cart = newCart;
    }

    return cart.id;
  }
}

// ============================================================================
// ADD TO CART
// ============================================================================

export async function addToCart(
  productVariantId: string,
  quantity: number = 1,
  userId?: string,
  accountId?: string
) {
  try {
    // Validate quantity
    if (quantity < 1) {
      return { success: false, error: "Quantity must be at least 1" };
    }

    // Check if variant exists and is in stock
    const variant = await db.query.productVariants.findFirst({
      where: eq(productVariants.id, productVariantId),
    });

    if (!variant) {
      return { success: false, error: "Product variant not found" };
    }

    if (variant.inStock < quantity) {
      return {
        success: false,
        error: `Only ${variant.inStock} items available in stock`,
      };
    }

    // Get or create cart
    const cartId = await getOrCreateCart(userId, accountId);

    // Check if item already in cart
    const existingItem = await db.query.cartItems.findFirst({
      where: and(
        eq(cartItems.cartId, cartId),
        eq(cartItems.productVariantId, productVariantId)
      ),
    });

    if (existingItem) {
      // Update quantity
      const newQuantity = existingItem.quantity + quantity;

      // Check stock again
      if (variant.inStock < newQuantity) {
        return {
          success: false,
          error: `Only ${variant.inStock} items available in stock`,
        };
      }

      await db
        .update(cartItems)
        .set({
          quantity: newQuantity,
        })
        .where(eq(cartItems.id, existingItem.id));
    } else {
      // Add new item
      await db.insert(cartItems).values({
        cartId,
        productVariantId,
        quantity,
      });
    }

    // Update cart timestamp
    await db
      .update(carts)
      .set({ updatedAt: new Date() })
      .where(eq(carts.id, cartId));

    revalidatePath("/cart");

    return { success: true, message: "Added to cart" };
  } catch (error) {
    console.error("Add to cart error:", error);
    return { success: false, error: "Failed to add to cart" };
  }
}

// ============================================================================
// REMOVE FROM CART
// ============================================================================

export async function removeFromCart(cartItemId: string) {
  try {
    await db.delete(cartItems).where(eq(cartItems.id, cartItemId));

    revalidatePath("/cart");
    return { success: true, message: "Item removed from cart" };
  } catch (error) {
    console.error("Remove from cart error:", error);
    return { success: false, error: "Failed to remove item" };
  }
}

// ============================================================================
// UPDATE CART ITEM QUANTITY
// ============================================================================

export async function updateCartItemQuantity(
  cartItemId: string,
  quantity: number
) {
  try {
    if (quantity < 1) {
      return { success: false, error: "Quantity must be at least 1" };
    }

    // Get cart item with variant info
    const item = await db.query.cartItems.findFirst({
      where: eq(cartItems.id, cartItemId),
      with: {
        productVariant: true,
      },
    });

    if (!item) {
      return { success: false, error: "Cart item not found" };
    }

    // Check stock
    if (item.productVariant.inStock < quantity) {
      return {
        success: false,
        error: `Only ${item.productVariant.inStock} items available`,
      };
    }

    await db
      .update(cartItems)
      .set({ quantity })
      .where(eq(cartItems.id, cartItemId));

    revalidatePath("/cart");
    return { success: true, message: "Quantity updated" };
  } catch (error) {
    console.error("Update cart quantity error:", error);
    return { success: false, error: "Failed to update quantity" };
  }
}

// ============================================================================
// CLEAR CART
// ============================================================================

export async function clearCart(userId?: string) {
  try {
    const cartId = await getOrCreateCart(userId);

    await db.delete(cartItems).where(eq(cartItems.cartId, cartId));

    revalidatePath("/cart");
    return { success: true, message: "Cart cleared" };
  } catch (error) {
    console.error("Clear cart error:", error);
    return { success: false, error: "Failed to clear cart" };
  }
}

// ============================================================================
// GET CART WITH ITEMS (for display)
// ============================================================================

export async function getCart(userId?: string, accountId?: string) {
  try {
    const cartId = await getOrCreateCart(userId, accountId);

    const cart = await db.query.carts.findFirst({
      where: eq(carts.id, cartId),
    });

    if (!cart) {
      return { items: [], total: 0, subtotal: 0 };
    }

    // Get cart items with product details
    const items = await db.query.cartItems.findMany({
      where: eq(cartItems.cartId, cartId),
    });

    // Fetch variant, product, and image details
    const enrichedItems = await Promise.all(
      items.map(async (item) => {
        const variant = await db.query.productVariants.findFirst({
          where: eq(productVariants.id, item.productVariantId),
        });

        if (!variant) return null;

        const product = await db.query.products.findFirst({
          where: eq(products.id, variant.productId),
        });

        const image = await db.query.productImages.findFirst({
          where: and(
            eq(productImages.productId, variant.productId),
            eq(productImages.isPrimary, true)
          ),
        });

        const price = Number(variant.salePrice ?? variant.price);
        const lineTotal = price * item.quantity;

        return {
          id: item.id,
          cartId: item.cartId,
          quantity: item.quantity,
          variant: {
            id: variant.id,
            sku: variant.sku,
            price: Number(variant.price),
            salePrice: variant.salePrice ? Number(variant.salePrice) : null,
            inStock: variant.inStock,
          },
          product: {
            id: product?.id,
            name: product?.name,
            slug: product?.slug,
            imageUrl: image?.url,
          },
          price,
          lineTotal,
        };
      })
    );

    // Filter out null items (deleted products/variants)
    const validItems = enrichedItems.filter((item) => item !== null);

    // Calculate totals
    const subtotal = validItems.reduce((sum, item) => sum + item.lineTotal, 0);

    return {
      items: validItems,
      subtotal,
      total: subtotal, // Add tax/shipping later
      itemCount: validItems.reduce((sum, item) => sum + item.quantity, 0),
    };
  } catch (error) {
    console.error("Get cart error:", error);
    return { items: [], total: 0, subtotal: 0, itemCount: 0 };
  }
}

// ============================================================================
// MERGE GUEST CART TO USER CART (on login)
// ============================================================================

export async function mergeGuestCartToUser(
  userId: string,
  accountId?: string
) {
  try {
    const guestId = await getOrCreateGuestSession();

    // Get guest cart
    const guestCart = await db.query.carts.findFirst({
      where: eq(carts.guestId, guestId),
    });

    if (!guestCart) {
      return { success: true, message: "No guest cart to merge" };
    }

    // Get or create user cart
    const userCartId = await getOrCreateCart(userId, accountId);

    // Get guest cart items
    const guestItems = await db.query.cartItems.findMany({
      where: eq(cartItems.cartId, guestCart.id),
    });

    // Merge items
    for (const guestItem of guestItems) {
      // Check if item exists in user cart
      const existingUserItem = await db.query.cartItems.findFirst({
        where: and(
          eq(cartItems.cartId, userCartId),
          eq(cartItems.productVariantId, guestItem.productVariantId)
        ),
      });

      if (existingUserItem) {
        // Update quantity
        await db
          .update(cartItems)
          .set({
            quantity: existingUserItem.quantity + guestItem.quantity,
          })
          .where(eq(cartItems.id, existingUserItem.id));
      } else {
        // Add new item to user cart
        await db.insert(cartItems).values({
          cartId: userCartId,
          productVariantId: guestItem.productVariantId,
          quantity: guestItem.quantity,
        });
      }
    }

    // Delete guest cart items
    await db.delete(cartItems).where(eq(cartItems.cartId, guestCart.id));

    // Delete guest cart
    await db.delete(carts).where(eq(carts.id, guestCart.id));

    revalidatePath("/cart");
    return { success: true, message: "Cart merged successfully" };
  } catch (error) {
    console.error("Merge cart error:", error);
    return { success: false, error: "Failed to merge cart" };
  }
}

// ============================================================================
// BUY NOW (Add to cart and return checkout URL)
// ============================================================================

export async function buyNow(
  productVariantId: string,
  quantity: number = 1,
  userId?: string,
  accountId?: string
) {
  try {
    // Add to cart first
    const result = await addToCart(productVariantId, quantity, userId, accountId);

    if (!result.success) {
      return result;
    }

    // Return success with checkout redirect
    return {
      success: true,
      message: "Proceeding to checkout",
      redirectUrl: "/checkout",
    };
  } catch (error) {
    console.error("Buy now error:", error);
    return { success: false, error: "Failed to process buy now" };
  }
}
