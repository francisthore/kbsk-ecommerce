import { pgTable, timestamp, uuid, text, jsonb } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { z } from 'zod';
import { orders } from './orders';
import { paymentMethodEnum, paymentStatusEnum } from './enums';

export const payments = pgTable('payments', {
  id: uuid('id').primaryKey().defaultRandom(),
  orderId: uuid('order_id').references(() => orders.id, { onDelete: 'cascade' }).notNull(),
  method: paymentMethodEnum('method').notNull(),
  status: paymentStatusEnum('status').notNull().default('initiated'),
  paidAt: timestamp('paid_at'),
  transactionId: text('transaction_id'),
  meta: jsonb('meta'), // Additional payment metadata (gateway response, etc.)
});

export const paymentsRelations = relations(payments, ({ one }) => ({
  order: one(orders, {
    fields: [payments.orderId],
    references: [orders.id],
  }),
}));

export const insertPaymentSchema = z.object({
  orderId: z.string().uuid(),
  method: z.enum(['stripe', 'paypal', 'cod', 'bank_transfer', 'payfast']),
  status: z.enum(['initiated', 'completed', 'failed', 'refunded']).optional(),
  paidAt: z.date().optional().nullable(),
  transactionId: z.string().optional().nullable(),
  meta: z.record(z.string(), z.any()).optional().nullable(),
});

export const selectPaymentSchema = insertPaymentSchema.extend({
  id: z.string().uuid(),
});

export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type SelectPayment = z.infer<typeof selectPaymentSchema>;
