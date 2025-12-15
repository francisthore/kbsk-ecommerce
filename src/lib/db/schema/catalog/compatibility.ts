import { pgTable, text, uuid, unique } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { z } from 'zod';
import { products } from '../products';

export const productCompatibility = pgTable('product_compatibility', {
  id: uuid('id').primaryKey().defaultRandom(),
  productId: uuid('product_id').references(() => products.id, { onDelete: 'cascade' }).notNull(),
  platform: text('platform').notNull(), // 'M18', 'M12', '20V MAX', 'FlexVolt', etc.
}, (t) => ({
  uniqueCompatibility: unique().on(t.productId, t.platform),
}));

export const productCompatibilityRelations = relations(productCompatibility, ({ one }) => ({
  product: one(products, {
    fields: [productCompatibility.productId],
    references: [products.id],
  }),
}));

export const insertProductCompatibilitySchema = z.object({
  productId: z.string().uuid(),
  platform: z.string().min(1),
});

export const selectProductCompatibilitySchema = insertProductCompatibilitySchema.extend({
  id: z.string().uuid(),
});

export type InsertProductCompatibility = z.infer<typeof insertProductCompatibilitySchema>;
export type SelectProductCompatibility = z.infer<typeof selectProductCompatibilitySchema>;
