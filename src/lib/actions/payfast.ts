/**
 * Payfast Checkout Actions
 * Server actions for initiating Payfast payments
 */

"use server";

import { payfastConfig } from '@/lib/payfast/config';
import { generateSignature } from '@/lib/payfast/signature';
import { db } from '@/lib/db';
import { orders, payments } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export interface PayfastPayload {
  merchant_id: string;
  merchant_key: string;
  return_url: string;
  cancel_url: string;
  notify_url: string;
  name_first?: string;
  email_address?: string;
  cell_number?: string;
  m_payment_id: string;
  amount: string;
  item_name: string;
  item_description?: string;
  custom_str1?: string;
  signature: string;
}

export type PayfastPayloadEntry = [string, string];
export type PayfastPayloadArray = PayfastPayloadEntry[];

/**
 * Creates a Payfast checkout payload for an order
 * This must be called after order creation
 * Returns payload as ordered array to maintain field order for signature
 */
export async function createPayfastCheckoutPayload(
  orderId: string
): Promise<{ ok: true; payload: PayfastPayloadArray } | { ok: false; error: string }> {
  try {
    // Fetch order with related data
    const order = await db.query.orders.findFirst({
      where: eq(orders.id, orderId),
      with: {
        account: true,
        shippingAddress: true,
      },
    });

    if (!order) {
      return { ok: false, error: 'Order not found' };
    }

    if (order.status !== 'pending') {
      return { ok: false, error: 'Order is not in pending state' };
    }

    // Verify payment record exists
    const payment = await db.query.payments.findFirst({
      where: eq(payments.orderId, orderId),
    });

    if (!payment) {
      return { ok: false, error: 'Payment record not found' };
    }

    // Generate order reference for display
    const orderReference = `ORDER-${orderId.slice(0, 8).toUpperCase()}`;

    // Build payload as ordered array to maintain order for signature
    // Order matters for Payfast signature calculation!
    // CRITICAL ORDER: merchant_id, merchant_key, URLs, customer info, payment info, custom fields
    const payloadArray: PayfastPayloadEntry[] = [
      ['merchant_id', payfastConfig.merchantId],
      ['merchant_key', payfastConfig.merchantKey],
      ['return_url', payfastConfig.getReturnUrl() + `?order_id=${orderId}`],
      ['cancel_url', payfastConfig.getCancelUrl() + `?order_id=${orderId}`],
      ['notify_url', payfastConfig.getNotifyUrl()],
    ];

    // Add customer fields (must come before payment fields)
    if (order.shippingAddress?.contactName) {
      const nameParts = order.shippingAddress.contactName.split(' ');
      payloadArray.push(['name_first', nameParts[0] || '']);
      if (nameParts.length > 1) {
        payloadArray.push(['name_last', nameParts.slice(1).join(' ')]);
      }
    }
    
    payloadArray.push(['email_address', order.account.email]);

    if (order.shippingAddress?.phone) {
      payloadArray.push(['cell_number', order.shippingAddress.phone]);
    }

    // Add payment fields (must come after customer fields)
    payloadArray.push(['m_payment_id', orderId]);
    payloadArray.push(['amount', parseFloat(order.totalAmount).toFixed(2)]);
    payloadArray.push(['item_name', orderReference]);
    payloadArray.push(['item_description', `Order ${orderReference} - ${order.account.email}`]);
    
    // Add custom field for order tracking
    payloadArray.push(['custom_str1', orderId]);

    // Generate signature from array (excludes merchant_key automatically)
    const signature = generateSignature(payloadArray);
    
    // Add signature to array LAST
    payloadArray.push(['signature', signature]);

    return { ok: true, payload: payloadArray };
  } catch (error) {
    console.error('Error creating Payfast payload:', error);
    return { ok: false, error: 'Failed to create payment payload' };
  }
}

/**
 * Gets order details for success/cancel pages
 */
export async function getOrderDetails(orderId: string) {
  try {
    const order = await db.query.orders.findFirst({
      where: eq(orders.id, orderId),
      with: {
        account: true,
        shippingAddress: true,
        items: {
          with: {
            variant: {
              with: {
                product: true,
              },
            },
          },
        },
      },
    });

    if (!order) {
      return { ok: false, error: 'Order not found' };
    }

    return {
      ok: true,
      order: {
        id: order.id,
        status: order.status,
        total: order.totalAmount,
        subtotal: order.subtotal,
        shippingCost: order.shippingCost,
        discountTotal: order.discountTotal,
        currency: order.currency,
        createdAt: order.createdAt,
        items: order.items.map((item) => ({
          id: item.id,
          quantity: item.quantity,
          price: item.priceAtPurchase,
          productName: item.variant.product.name,
          variantSku: item.variant.sku,
        })),
        shippingAddress: order.shippingAddress
          ? {
              name: order.shippingAddress.contactName,
              line1: order.shippingAddress.line1,
              line2: order.shippingAddress.line2,
              city: order.shippingAddress.city,
              state: order.shippingAddress.state,
              postalCode: order.shippingAddress.postalCode,
              country: order.shippingAddress.country,
            }
          : null,
      },
    };
  } catch (error) {
    console.error('Error fetching order details:', error);
    return { ok: false, error: 'Failed to fetch order details' };
  }
}
