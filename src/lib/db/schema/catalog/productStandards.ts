import { pgTable, text, uuid, unique } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { z } from 'zod';
import { products } from '../products';

export const productStandards = pgTable('product_standards', {
  id: uuid('id').primaryKey().defaultRandom(),
  productId: uuid('product_id').references(() => products.id, { onDelete: 'cascade' }).notNull(),
  code: text('code').notNull(), // 'EN397', 'ANSI Z89.1', 'CE', 'OSHA', etc.
  label: text('label'),
}, (t) => ({
  uniqueProductStandard: unique().on(t.productId, t.code),
}));

export const productStandardsRelations = relations(productStandards, ({ one }) => ({
  product: one(products, {
    fields: [productStandards.productId],
    references: [products.id],
  }),
}));

export const insertProductStandardSchema = z.object({
  productId: z.string().uuid(),
  code: z.string().min(1),
  label: z.string().optional().nullable(),
});

export const selectProductStandardSchema = insertProductStandardSchema.extend({
  id: z.string().uuid(),
});

export type InsertProductStandard = z.infer<typeof insertProductStandardSchema>;
export type SelectProductStandard = z.infer<typeof selectProductStandardSchema>;
