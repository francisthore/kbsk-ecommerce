import { pgTable, uuid, integer, unique } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { z } from 'zod';
import { products } from '../products';

export const productBundleItems = pgTable('product_bundle_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  parentProductId: uuid('parent_product_id').references(() => products.id, { onDelete: 'cascade' }).notNull(),
  childProductId: uuid('child_product_id').references(() => products.id, { onDelete: 'cascade' }).notNull(),
  quantity: integer('quantity').notNull().default(1),
}, (t) => ({
  uniqueBundleItem: unique().on(t.parentProductId, t.childProductId),
}));

export const productBundleItemsRelations = relations(productBundleItems, ({ one }) => ({
  parentProduct: one(products, {
    fields: [productBundleItems.parentProductId],
    references: [products.id],
    relationName: 'bundleParent',
  }),
  childProduct: one(products, {
    fields: [productBundleItems.childProductId],
    references: [products.id],
    relationName: 'bundleChild',
  }),
}));

export const insertProductBundleItemSchema = z.object({
  parentProductId: z.string().uuid(),
  childProductId: z.string().uuid(),
  quantity: z.number().int().min(1).optional(),
});

export const selectProductBundleItemSchema = insertProductBundleItemSchema.extend({
  id: z.string().uuid(),
});

export type InsertProductBundleItem = z.infer<typeof insertProductBundleItemSchema>;
export type SelectProductBundleItem = z.infer<typeof selectProductBundleItemSchema>;
