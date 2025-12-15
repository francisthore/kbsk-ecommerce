import { pgTable, uuid, timestamp, numeric, integer, text, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { z } from 'zod';
import { users } from './user';
import { accounts } from './accounts/accounts';
import { addresses } from './addresses';
import { productVariants } from './variants';
import { shippingMethods } from './commerce/shipping';
import { quotes } from './quotes/quotes';
import { orderStatusEnum, paymentTermEnum } from './enums';

export const orders = pgTable('orders', {
  id: uuid('id').primaryKey().defaultRandom(),
  // B2B: primary reference is account
  accountId: uuid('account_id').references(() => accounts.id, { onDelete: 'set null' }).notNull(),
  // Keep user_id to track which user in the account created the order
  userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
  status: orderStatusEnum('status').notNull().default('pending'),
  // B2B fields
  poNumber: text('po_number'),
  paymentTerm: paymentTermEnum('payment_term'),
  currency: text('currency').notNull().default('USD'),
  // Pricing breakdown
  subtotal: numeric('subtotal', { precision: 12, scale: 2 }).notNull(),
  discountTotal: numeric('discount_total', { precision: 12, scale: 2 }).notNull().default('0'),
  taxTotal: numeric('tax_total', { precision: 12, scale: 2 }).notNull().default('0'),
  shippingCost: numeric('shipping_cost', { precision: 12, scale: 2 }).notNull().default('0'),
  totalAmount: numeric('total_amount', { precision: 12, scale: 2 }).notNull(),
  // Shipping
  shippingMethodId: uuid('shipping_method_id').references(() => shippingMethods.id, { onDelete: 'set null' }),
  shippingAddressId: uuid('shipping_address_id').references(() => addresses.id, { onDelete: 'set null' }),
  billingAddressId: uuid('billing_address_id').references(() => addresses.id, { onDelete: 'set null' }),
  // Link to quote if order originated from RFQ
  quoteId: uuid('quote_id').references(() => quotes.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (t) => ({
  accountStatusIdx: index('orders_account_status_idx').on(t.accountId, t.status),
}));

export const orderItems = pgTable('order_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  orderId: uuid('order_id').references(() => orders.id, { onDelete: 'cascade' }).notNull(),
  productVariantId: uuid('product_variant_id').references(() => productVariants.id, { onDelete: 'restrict' }).notNull(),
  quantity: integer('quantity').notNull().default(1),
  priceAtPurchase: numeric('price_at_purchase', { precision: 10, scale: 2 }).notNull(),
  taxRate: numeric('tax_rate', { precision: 5, scale: 4 }),
  taxAmount: numeric('tax_amount', { precision: 10, scale: 2 }),
});

export const ordersRelations = relations(orders, ({ many, one }) => ({
  account: one(accounts, {
    fields: [orders.accountId],
    references: [accounts.id],
  }),
  user: one(users, {
    fields: [orders.userId],
    references: [users.id],
  }),
  shippingAddress: one(addresses, {
    fields: [orders.shippingAddressId],
    references: [addresses.id],
    relationName: 'orderShippingAddress',
  }),
  billingAddress: one(addresses, {
    fields: [orders.billingAddressId],
    references: [addresses.id],
    relationName: 'orderBillingAddress',
  }),
  shippingMethod: one(shippingMethods, {
    fields: [orders.shippingMethodId],
    references: [shippingMethods.id],
  }),
  quote: one(quotes, {
    fields: [orders.quoteId],
    references: [quotes.id],
  }),
  items: many(orderItems),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  variant: one(productVariants, {
    fields: [orderItems.productVariantId],
    references: [productVariants.id],
  }),
}));

export const insertOrderSchema = z.object({
  accountId: z.string().uuid(),
  userId: z.string().uuid().optional().nullable(),
  status: z.enum(['pending', 'paid', 'shipped', 'delivered', 'cancelled']).optional(),
  poNumber: z.string().optional().nullable(),
  paymentTerm: z.enum(['prepaid', '30d', '60d']).optional().nullable(),
  currency: z.string().optional(),
  subtotal: z.string(),
  discountTotal: z.string().optional(),
  taxTotal: z.string().optional(),
  shippingCost: z.string().optional(),
  totalAmount: z.string(),
  shippingMethodId: z.string().uuid().optional().nullable(),
  shippingAddressId: z.string().uuid().optional().nullable(),
  billingAddressId: z.string().uuid().optional().nullable(),
  quoteId: z.string().uuid().optional().nullable(),
  createdAt: z.date().optional(),
});

export const selectOrderSchema = insertOrderSchema.extend({
  id: z.string().uuid(),
});

export const insertOrderItemSchema = z.object({
  orderId: z.string().uuid(),
  productVariantId: z.string().uuid(),
  quantity: z.number().int().min(1),
  priceAtPurchase: z.string(),
  taxRate: z.string().optional().nullable(),
  taxAmount: z.string().optional().nullable(),
});

export const selectOrderItemSchema = insertOrderItemSchema.extend({
  id: z.string().uuid(),
});

export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type SelectOrder = z.infer<typeof selectOrderSchema>;
export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;
export type SelectOrderItem = z.infer<typeof selectOrderItemSchema>;
