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
  brands,
  colors,
  sizes,
} from "@/lib/db/schema";
import { eq, and, isNull } from "drizzle-orm";
import { nanoid } from "nanoid";
import { getCurrentUser } from "@/lib/auth/actions";
import {
  calculateCartTotals,
  isFreeShippingEligible,
  calculateItemCount,
  validateQuantity,
  estimateShipping as utilEstimateShipping,
} from "@/lib/utils/cart";
import { CartItemData } from "@/store/cart.store";

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

// Helper: Get or create cart (updated to support both auth methods)
async function getOrCreateCart() {
  // Try to get authenticated user first
  const user = await getCurrentUser();
  
  if (user) {
    // Authenticated user - find or create user cart
    let cart = await db.query.carts.findFirst({
      where: and(
        eq(carts.userId, user.id),
        isNull(carts.accountId)
      ),
    });

    if (!cart) {
      const [newCart] = await db
        .insert(carts)
        .values({
          userId: user.id,
        })
        .returning();
      cart = newCart;
    }

    return { cartId: cart.id, userId: user.id, guestId: null };
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

    return { cartId: cart.id, userId: null, guestId };
  }
}

// ============================================================================
// ADD TO CART
// ============================================================================

export async function addToCart(
  productVariantId: string,
  quantity: number = 1
) {
  try {
    // Validate quantity
    const validation = validateQuantity(quantity, 9999); // Will check actual stock below
    if (!validation.valid && quantity < 1) {
      return { success: false, error: validation.message };
    }

    // Check if variant exists and is in stock
    const variant = await db.query.productVariants.findFirst({
      where: eq(productVariants.id, productVariantId),
    });

    if (!variant) {
      return { success: false, error: "Product variant not found" };
    }

    // Validate against actual stock
    const stockValidation = validateQuantity(quantity, variant.inStock);
    if (!stockValidation.valid) {
      return { success: false, error: stockValidation.message };
    }

    // Get or create cart
    const { cartId } = await getOrCreateCart();

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
      const finalValidation = validateQuantity(newQuantity, variant.inStock);
      if (!finalValidation.valid) {
        return { success: false, error: finalValidation.message };
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
        quantity: stockValidation.quantity,
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
      // Remove item if quantity is 0 or less
      return removeFromCart(cartItemId);
    }

    // Get cart item with variant info
    const item = await db.query.cartItems.findFirst({
      where: eq(cartItems.id, cartItemId),
      with: {
        variant: true,
      },
    });

    if (!item) {
      return { success: false, error: "Cart item not found" };
    }

    // Validate quantity against stock
    const validation = validateQuantity(quantity, item.variant.inStock);
    if (!validation.valid) {
      return { success: false, error: validation.message };
    }

    await db
      .update(cartItems)
      .set({ quantity: validation.quantity })
      .where(eq(cartItems.id, cartItemId));

    // Update cart timestamp
    await db
      .update(carts)
      .set({ updatedAt: new Date() })
      .where(eq(carts.id, item.cartId));

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

export async function clearCart() {
  try {
    const { cartId } = await getOrCreateCart();

    await db.delete(cartItems).where(eq(cartItems.cartId, cartId));

    revalidatePath("/cart");
    return { success: true, message: "Cart cleared" };
  } catch (error) {
    console.error("Clear cart error:", error);
    return { success: false, error: "Failed to clear cart" };
  }
}

// ============================================================================
// GET CART WITH ITEMS (Enhanced version with all details)
// ============================================================================

export async function getCart() {
  try {
    const { cartId } = await getOrCreateCart();

    // Fetch cart items with all necessary joins in a single optimized query
    const items = await db
      .select({
        cartItemId: cartItems.id,
        quantity: cartItems.quantity,
        variantId: productVariants.id,
        sku: productVariants.sku,
        price: productVariants.price,
        salePrice: productVariants.salePrice,
        inStock: productVariants.inStock,
        productId: products.id,
        productName: products.name,
        productSlug: products.slug,
        brandName: brands.name,
        colorId: colors.id,
        colorName: colors.label,
        colorHex: colors.hex,
        sizeId: sizes.id,
        sizeName: sizes.label,
        imageUrl: productImages.url,
      })
      .from(cartItems)
      .innerJoin(productVariants, eq(cartItems.productVariantId, productVariants.id))
      .innerJoin(products, eq(productVariants.productId, products.id))
      .leftJoin(brands, eq(products.brandId, brands.id))
      .leftJoin(colors, eq(productVariants.colorId, colors.id))
      .leftJoin(sizes, eq(productVariants.sizeId, sizes.id))
      .leftJoin(
        productImages,
        and(
          eq(productImages.productId, products.id),
          eq(productImages.isPrimary, true)
        )
      )
      .where(eq(cartItems.cartId, cartId));

    // Transform to CartItemData format
    const cartItemsData: CartItemData[] = items.map((item) => ({
      id: item.productId,
      cartItemId: item.cartItemId,
      productId: item.productId,
      productName: item.productName,
      brand: item.brandName,
      variantId: item.variantId,
      sku: item.sku,
      price: item.price,
      salePrice: item.salePrice,
      quantity: item.quantity,
      inStock: item.inStock,
      image: item.imageUrl,
      colorName: item.colorName,
      colorHex: item.colorHex,
      sizeName: item.sizeName,
      isSupplierWarehouse: false, // TODO: Add when available in schema
    }));

    // Calculate totals
    const totals = calculateCartTotals(cartItemsData);
    const itemCount = calculateItemCount(cartItemsData);
    const freeShipping = isFreeShippingEligible(totals.total);

    return {
      items: cartItemsData,
      totals,
      itemCount,
      freeShipping,
    };
  } catch (error) {
    console.error("Get cart error:", error);
    return {
      items: [],
      totals: { subtotal: 0, savings: 0, total: 0 },
      itemCount: 0,
      freeShipping: { eligible: false, threshold: 1000, amountRemaining: 1000 },
    };
  }
}

// ============================================================================
// MERGE GUEST CART TO USER CART (on login)
// ============================================================================

export async function mergeGuestCartToUser(userId: string) {
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
    let userCart = await db.query.carts.findFirst({
      where: and(
        eq(carts.userId, userId),
        isNull(carts.accountId)
      ),
    });

    if (!userCart) {
      const [newCart] = await db
        .insert(carts)
        .values({ userId })
        .returning();
      userCart = newCart;
    }

    // Get guest cart items
    const guestItems = await db.query.cartItems.findMany({
      where: eq(cartItems.cartId, guestCart.id),
    });

    // Merge items
    for (const guestItem of guestItems) {
      // Check if item exists in user cart
      const existingUserItem = await db.query.cartItems.findFirst({
        where: and(
          eq(cartItems.cartId, userCart.id),
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
          cartId: userCart.id,
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
// GET CART COUNT (for badge)
// ============================================================================

export async function getCartCount(): Promise<number> {
  try {
    const { cartId } = await getOrCreateCart();

    const items = await db
      .select({ quantity: cartItems.quantity })
      .from(cartItems)
      .where(eq(cartItems.cartId, cartId));

    return items.reduce((total, item) => total + item.quantity, 0);
  } catch (error) {
    console.error("Error getting cart count:", error);
    return 0;
  }
}

// ============================================================================
// ESTIMATE SHIPPING
// ============================================================================

export async function estimateShipping(params: {
  country: string;
  province?: string;
  postalCode?: string;
}) {
  try {
    const cartData = await getCart();
    
    const estimate = utilEstimateShipping({
      ...params,
      cartTotal: cartData.totals.total,
    });

    return { success: true, ...estimate };
  } catch (error) {
    console.error("Error estimating shipping:", error);
    return { success: false, error: "Failed to estimate shipping" };
  }
}

// ============================================================================
// SAVE ORDER INSTRUCTIONS
// ============================================================================

export async function saveOrderInstructions(instructions: string) {
  try {
    const { cartId } = await getOrCreateCart();

    // TODO: Add orderInstructions field to carts table schema
    // For now, this is a placeholder that validates the action
    // await db
    //   .update(carts)
    //   .set({ orderInstructions: instructions, updatedAt: new Date() })
    //   .where(eq(carts.id, cartId));

    return { success: true };
  } catch (error) {
    console.error("Error saving order instructions:", error);
    return { success: false, error: "Failed to save order instructions" };
  }
}

// ============================================================================
// BUY NOW (Add to cart and return checkout URL)
// ============================================================================

export async function buyNow(
  productVariantId: string,
  quantity: number = 1
) {
  try {
    // Add to cart first
    const result = await addToCart(productVariantId, quantity);

    if (!result.success) {
      return result;
    }

    // Check if user is authenticated
    const user = await getCurrentUser();
    
    if (!user) {
      // Redirect to login/signup with return URL
      return {
        success: true,
        message: "Please sign in to continue",
        redirectUrl: "/login?redirect=/checkout",
      };
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
