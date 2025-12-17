/**
 * Email system type definitions
 */

export interface EmailResponse {
  success: boolean;
  error?: string;
  data?: unknown;
}

export interface OrderItem {
  productName: string;
  variantName?: string;
  quantity: number;
  priceAtPurchase: string;
}

export interface Address {
  name: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface OrderConfirmationData {
  userName: string;
  orderNumber: string;
  orderId: string;
  orderDate: string;
  items: OrderItem[];
  subtotal: string;
  taxTotal: string;
  shippingCost: string;
  totalAmount: string;
  shippingAddress: Address;
  paymentMethod?: string;
}

export interface ShippingNotificationData {
  userName: string;
  orderNumber: string;
  orderId: string;
  trackingNumber: string;
  carrier: string;
  trackingUrl?: string;
  estimatedDelivery?: string;
  shippingAddress: Address;
}

export interface OrderCancellationData {
  userName: string;
  orderNumber: string;
  orderId: string;
  cancellationDate: string;
  refundAmount: string;
  refundMethod?: string;
  cancellationReason?: string;
}
