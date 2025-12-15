import { pgTable, uuid, timestamp, numeric, text, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { z } from 'zod';
import { accounts } from '../accounts/accounts';
import { users } from '../user';
import { addresses } from '../addresses';
import { carts } from '../carts';
import { quoteItems } from './quoteItems';
import { quoteEvents } from './quoteEvents';
import { quoteStatusEnum, quoteSourceEnum } from '../enums';

export const quotes = pgTable('quotes', {
  id: uuid('id').primaryKey().defaultRandom(),
  accountId: uuid('account_id').references(() => accounts.id, { onDelete: 'cascade' }).notNull(),
  requestedByUserId: uuid('requested_by_user_id').references(() => users.id, { onDelete: 'set null' }),
  status: quoteStatusEnum('status').notNull().default('draft'),
  currency: text('currency').notNull().default('USD'),
  // Pricing breakdown
  subtotal: numeric('subtotal', { precision: 12, scale: 2 }).notNull().default('0'),
  discountTotal: numeric('discount_total', { precision: 12, scale: 2 }).notNull().default('0'),
  taxTotal: numeric('tax_total', { precision: 12, scale: 2 }).notNull().default('0'),
  shippingCost: numeric('shipping_cost', { precision: 12, scale: 2 }).notNull().default('0'),
  total: numeric('total', { precision: 12, scale: 2 }).notNull().default('0'),
  // Notes
  notesFromCustomer: text('notes_from_customer'),
  internalNotes: text('internal_notes'),
  // Validity
  validUntil: timestamp('valid_until'),
  // Addresses
  shippingAddressId: uuid('shipping_address_id').references(() => addresses.id, { onDelete: 'set null' }),
  billingAddressId: uuid('billing_address_id').references(() => addresses.id, { onDelete: 'set null' }),
  // Link to cart if quote was created from cart
  cartId: uuid('cart_id').references(() => carts.id, { onDelete: 'set null' }),
  source: quoteSourceEnum('source').notNull().default('self_service'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (t) => ({
  accountStatusIdx: index('quotes_account_status_idx').on(t.accountId, t.status),
}));

export const quotesRelations = relations(quotes, ({ one, many }) => ({
  account: one(accounts, {
    fields: [quotes.accountId],
    references: [accounts.id],
  }),
  requestedByUser: one(users, {
    fields: [quotes.requestedByUserId],
    references: [users.id],
  }),
  shippingAddress: one(addresses, {
    fields: [quotes.shippingAddressId],
    references: [addresses.id],
    relationName: 'quoteShippingAddress',
  }),
  billingAddress: one(addresses, {
    fields: [quotes.billingAddressId],
    references: [addresses.id],
    relationName: 'quoteBillingAddress',
  }),
  cart: one(carts, {
    fields: [quotes.cartId],
    references: [carts.id],
  }),
  items: many(quoteItems),
  events: many(quoteEvents),
}));

export const insertQuoteSchema = z.object({
  accountId: z.string().uuid(),
  requestedByUserId: z.string().uuid().optional().nullable(),
  status: z.enum(['draft', 'submitted', 'in_review', 'quoted', 'accepted', 'rejected', 'expired', 'converted']).optional(),
  currency: z.string().optional(),
  subtotal: z.string().optional(),
  discountTotal: z.string().optional(),
  taxTotal: z.string().optional(),
  shippingCost: z.string().optional(),
  total: z.string().optional(),
  notesFromCustomer: z.string().optional().nullable(),
  internalNotes: z.string().optional().nullable(),
  validUntil: z.date().optional().nullable(),
  shippingAddressId: z.string().uuid().optional().nullable(),
  billingAddressId: z.string().uuid().optional().nullable(),
  cartId: z.string().uuid().optional().nullable(),
  source: z.enum(['self_service', 'sales_agent', 'import']).optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export const selectQuoteSchema = insertQuoteSchema.extend({
  id: z.string().uuid(),
});

export type InsertQuote = z.infer<typeof insertQuoteSchema>;
export type SelectQuote = z.infer<typeof selectQuoteSchema>;
