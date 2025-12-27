"use server";

import { db } from "@/lib/db";
import { orders, orderItems, addresses, accounts, productVariants, payments } from "@/lib/db/schema";
import { eq, inArray } from "drizzle-orm";
import { getCart } from "./cart";
import { getCurrentUser } from "@/lib/auth/actions";
import { sendOrderConfirmationEmail } from "@/lib/email/sender";

interface CreateOrderInput {
  // Shipping Address
  fullName: string;
  email: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  zipCode: string;
  
  // Billing Address (if different)
  sameBillingAddress: boolean;
  billingFullName?: string;
  billingPhone?: string;
  billingLine1?: string;
  billingLine2?: string;
  billingCity?: string;
  billingState?: string;
  billingZipCode?: string;
  
  // Other
  shippingMethod: "delivery" | "pickup";
  saveAddress: boolean;
}

export async function createOrder(input: CreateOrderInput) {
  try {
    // Get current user (authenticated or null for guest)
    const user = await getCurrentUser();

    // Get cart data
    const cartData = await getCart();

    if (!cartData.items || cartData.items.length === 0) {
      return { ok: false, error: "Cart is empty" };
    }

    // Determine account
    let accountId: string;

    if (user?.id) {
      // Find or create account for authenticated user
      const existingAccount = await db.query.accounts.findFirst({
        where: eq(accounts.email, user.email || input.email),
      });

      if (existingAccount) {
        accountId = existingAccount.id;
      } else {
        // Create account for authenticated user
        const [newAccount] = await db
          .insert(accounts)
          .values({
            type: "individual",
            email: user.email || input.email,
            phone: input.phone,
          })
          .returning();
        accountId = newAccount.id;
      }
    } else {
      // Guest checkout - check if account with email already exists
      const existingAccount = await db.query.accounts.findFirst({
        where: eq(accounts.email, input.email),
      });

      if (existingAccount) {
        accountId = existingAccount.id;
      } else {
        // Create new account for guest
        const [guestAccount] = await db
          .insert(accounts)
          .values({
            type: "individual",
            email: input.email,
            phone: input.phone,
          })
          .returning();
        accountId = guestAccount.id;
      }
    }

    // Create shipping address
    const [shippingAddress] = await db
      .insert(addresses)
      .values({
        accountId,
        type: "shipping",
        contactName: input.fullName,
        phone: input.phone,
        line1: input.line1,
        line2: input.line2 || null,
        city: input.city,
        state: input.state,
        country: "ZA",
        postalCode: input.zipCode,
        isDefault: input.saveAddress,
      })
      .returning();

    // Create billing address if different
    let billingAddressId = shippingAddress.id;

    if (!input.sameBillingAddress && input.billingLine1) {
      const [billingAddress] = await db
        .insert(addresses)
        .values({
          accountId,
          type: "billing",
          contactName: input.billingFullName || input.fullName,
          phone: input.billingPhone || input.phone,
          line1: input.billingLine1,
          line2: input.billingLine2 || null,
          city: input.billingCity || input.city,
          state: input.billingState || input.state,
          country: "ZA",
          postalCode: input.billingZipCode || input.zipCode,
          isDefault: false,
        })
        .returning();
      billingAddressId = billingAddress.id;
    }

    // Calculate totals
    const subtotal = cartData.totals.subtotal;
    const discount = cartData.totals.savings;
    
    // Fetch shipping fee from settings
    const settings = await db.query.shopSettings.findFirst();
    const shippingFeeAmount = input.shippingMethod === "delivery" 
      ? parseFloat(settings?.shippingFee || "135.00")
      : 0;
    
    const total = subtotal - discount + shippingFeeAmount;

    // Create order
    const [order] = await db
      .insert(orders)
      .values({
        accountId,
        userId: user?.id || null,
        status: "pending",
        currency: "ZAR",
        subtotal: subtotal.toFixed(2),
        discountTotal: discount.toFixed(2),
        shippingCost: shippingFeeAmount.toFixed(2),
        totalAmount: total.toFixed(2),
        shippingAddressId: shippingAddress.id,
        billingAddressId,
      })
      .returning();

    // Get cart item details with variant info
    const cartItems = cartData.items;
    const variantIds = cartItems.map((item) => item.variantId);

    const variants = await db.query.productVariants.findMany({
      where: inArray(productVariants.id, variantIds),
    });

    // Create order items
    const orderItemsData = cartItems.map((cartItem) => {
      const variant = variants.find((v) => v.id === cartItem.variantId);
      const price = variant?.price || 0;

      return {
        orderId: order.id,
        productVariantId: cartItem.variantId,
        quantity: cartItem.quantity,
        priceAtPurchase: price.toString(),
        taxRate: null,
        taxAmount: null,
      };
    });

    await db.insert(orderItems).values(orderItemsData);

    // Create payment record for Payfast (initiated state)
    const [payment] = await db
      .insert(payments)
      .values({
        orderId: order.id,
        method: 'payfast',
        status: 'initiated',
      })
      .returning();

    // Send order confirmation email with payment pending status
    try {
      await sendOrderConfirmationEmail(input.email, {
        userName: input.fullName,
        orderNumber: order.id.slice(0, 8).toUpperCase(), // Use first 8 chars of UUID as order number
        orderId: order.id,
        orderDate: new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }),
        items: orderItemsData.map((item) => {
          const cartItem = cartItems.find((ci) => ci.variantId === item.productVariantId);
          return {
            productName: cartItem?.productName || 'Product',
            variantName: cartItem?.sku || '',
            quantity: item.quantity,
            priceAtPurchase: (parseFloat(cartItem?.price || '0')).toFixed(2),
          };
        }),
        subtotal: order.subtotal,
        taxTotal: '0.00',
        shippingCost: order.shippingCost,
        totalAmount: order.totalAmount,
        shippingAddress: {
          name: input.fullName,
          street: `${input.line1}${input.line2 ? `, ${input.line2}` : ""}`,
          city: input.city,
          state: input.state,
          postalCode: input.zipCode,
          country: 'South Africa',
        },
        paymentMethod: 'Payment Pending',
      });
    } catch (emailError) {
      console.error('Failed to send order confirmation email:', emailError);
      // Don't fail the order if email fails
    }

    return {
      ok: true,
      order: {
        id: order.id,
        accountId: order.accountId,
        total: order.totalAmount,
        itemCount: cartItems.length,
        shippingAddress: {
          name: input.fullName,
          email: input.email,
          phone: input.phone,
          address: `${input.line1}${input.line2 ? `, ${input.line2}` : ""}, ${input.city}, ${input.state} ${input.zipCode}`,
        },
      },
      payment: {
        id: payment.id,
      },
    };
  } catch (error) {
    console.error("Order creation error:", error);
    return { ok: false, error: "Failed to create order" };
  }
}
