import { pgTable, text, uuid, integer, boolean, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { z } from 'zod';
import { products } from './products';
import { productVariants } from './variants';
import { mediaKindEnum } from './enums';

export const productImages = pgTable('product_images', {
  id: uuid('id').primaryKey().defaultRandom(),
  productId: uuid('product_id').references(() => products.id, { onDelete: 'cascade' }).notNull(),
  variantId: uuid('variant_id').references(() => productVariants.id, { onDelete: 'set null' }),
  url: text('url').notNull(),
  kind: mediaKindEnum('kind').notNull().default('image'),
  sortOrder: integer('sort_order').notNull().default(0),
  isPrimary: boolean('is_primary').notNull().default(false),
}, (t) => ({
  productSortIdx: index('product_images_product_sort_idx').on(t.productId, t.sortOrder),
}));

export const productImagesRelations = relations(productImages, ({ one }) => ({
  product: one(products, {
    fields: [productImages.productId],
    references: [products.id],
  }),
  variant: one(productVariants, {
    fields: [productImages.variantId],
    references: [productVariants.id],
  }),
}));

export const insertProductImageSchema = z.object({
  productId: z.string().uuid(),
  variantId: z.string().uuid().optional().nullable(),
  url: z.string().min(1),
  kind: z.enum(['image', 'video', 'doc']).optional(),
  sortOrder: z.number().int().optional(),
  isPrimary: z.boolean().optional(),
});

export const selectProductImageSchema = insertProductImageSchema.extend({
  id: z.string().uuid(),
});

export type InsertProductImage = z.infer<typeof insertProductImageSchema>;
export type SelectProductImage = z.infer<typeof selectProductImageSchema>;
