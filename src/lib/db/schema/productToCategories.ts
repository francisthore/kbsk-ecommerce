import { pgTable, uuid, primaryKey, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { products } from './products';
import { categories } from './categories';

/**
 * Junction table for many-to-many relationship between products and categories
 * Allows products to belong to multiple categories (e.g., "Cordless Drills" + "Power Tools")
 */
export const productToCategories = pgTable('product_to_categories', {
  productId: uuid('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
  categoryId: uuid('category_id').notNull().references(() => categories.id, { onDelete: 'cascade' }),
}, (t) => ({
  // Composite primary key
  pk: primaryKey({ columns: [t.productId, t.categoryId] }),
  // Indexes for efficient queries
  productIdx: index('product_to_categories_product_idx').on(t.productId),
  categoryIdx: index('product_to_categories_category_idx').on(t.categoryId),
}));

export const productToCategoriesRelations = relations(productToCategories, ({ one }) => ({
  product: one(products, {
    fields: [productToCategories.productId],
    references: [products.id],
  }),
  category: one(categories, {
    fields: [productToCategories.categoryId],
    references: [categories.id],
  }),
}));
