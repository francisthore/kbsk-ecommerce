import { pgTable, uuid, integer, numeric, text } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { z } from 'zod';
import { quotes } from './quotes';
import { productVariants } from '../variants';

export const quoteItems = pgTable('quote_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  quoteId: uuid('quote_id').references(() => quotes.id, { onDelete: 'cascade' }).notNull(),
  productVariantId: uuid('product_variant_id').references(() => productVariants.id, { onDelete: 'restrict' }).notNull(),
  quantity: integer('quantity').notNull(),
  // Customer's target price per unit (optional, for RFQ)
  targetPrice: numeric('target_price', { precision: 10, scale: 2 }),
  // Quoted unit price from sales team
  quotedUnitPrice: numeric('quoted_unit_price', { precision: 10, scale: 2 }),
  lineDiscount: numeric('line_discount', { precision: 10, scale: 2 }).notNull().default('0'),
  lineNotes: text('line_notes'),
});

export const quoteItemsRelations = relations(quoteItems, ({ one }) => ({
  quote: one(quotes, {
    fields: [quoteItems.quoteId],
    references: [quotes.id],
  }),
  variant: one(productVariants, {
    fields: [quoteItems.productVariantId],
    references: [productVariants.id],
  }),
}));

export const insertQuoteItemSchema = z.object({
  quoteId: z.string().uuid(),
  productVariantId: z.string().uuid(),
  quantity: z.number().int().min(1),
  targetPrice: z.string().optional().nullable(),
  quotedUnitPrice: z.string().optional().nullable(),
  lineDiscount: z.string().optional(),
  lineNotes: z.string().optional().nullable(),
});

export const selectQuoteItemSchema = insertQuoteItemSchema.extend({
  id: z.string().uuid(),
});

export type InsertQuoteItem = z.infer<typeof insertQuoteItemSchema>;
export type SelectQuoteItem = z.infer<typeof selectQuoteItemSchema>;
