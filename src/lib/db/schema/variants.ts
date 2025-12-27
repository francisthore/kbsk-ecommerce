import { pgTable, text, timestamp, uuid, integer, numeric, jsonb, real, boolean } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { z } from 'zod';
import { products } from './products';
import { colors } from './filters/colors';
import { sizes } from './filters/sizes';
import { genders } from './filters/genders';
import { productImages } from './images';
import { orderItems } from './orders';
import { cartItems } from './carts';

export const productVariants = pgTable('product_variants', {
  id: uuid('id').primaryKey().defaultRandom(),
  productId: uuid('product_id').references(() => products.id, { onDelete: 'cascade' }).notNull(),
  sku: text('sku').notNull().unique(),
  price: numeric('price', { precision: 10, scale: 2 }).notNull(),
  salePrice: numeric('sale_price', { precision: 10, scale: 2 }),
  colorId: uuid('color_id').references(() => colors.id, { onDelete: 'restrict' }),
  sizeId: uuid('size_id').references(() => sizes.id, { onDelete: 'restrict' }),
  // Gender at variant level for size differentiation (e.g., men's vs women's sizing)
  // If null, inherits from product level
  genderId: uuid('gender_id').references(() => genders.id, { onDelete: 'set null' }),
  // Stock management
  inStock: integer('in_stock').notNull().default(0),
  backorderable: boolean('backorderable').notNull().default(false),
  restockDate: timestamp('restock_date'),
  lowStockThreshold: integer('low_stock_threshold').notNull().default(0),
  // Physical attributes
  weight: numeric('weight', { precision: 10, scale: 3 }),
  dimensions: jsonb('dimensions'), // { length, width, height, unit }
  // Per-variant spec overrides
  specs: jsonb('specs'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  deletedAt: timestamp('deleted_at'),
});

export const productVariantsRelations = relations(productVariants, ({ one, many }) => ({
  product: one(products, {
    fields: [productVariants.productId],
    references: [products.id],
  }),
  color: one(colors, {
    fields: [productVariants.colorId],
    references: [colors.id],
  }),
  size: one(sizes, {
    fields: [productVariants.sizeId],
    references: [sizes.id],
  }),
  gender: one(genders, {
    fields: [productVariants.genderId],
    references: [genders.id],
  }),
  images: many(productImages),
  orderItems: many(orderItems),
  cartItems: many(cartItems),
}));

export const insertVariantSchema = z.object({
  productId: z.string().uuid(),
  sku: z.string().min(1),
  price: z.string(),
  salePrice: z.string().optional().nullable(),
  colorId: z.string().uuid().optional().nullable(),
  sizeId: z.string().uuid().optional().nullable(),
  genderId: z.string().uuid().optional().nullable(),
  inStock: z.number().int().nonnegative().optional(),
  backorderable: z.boolean().optional(),
  restockDate: z.date().optional().nullable(),
  lowStockThreshold: z.number().int().nonnegative().optional(),
  weight: z.string().optional().nullable(),
  dimensions: z
    .object({
      length: z.number(),
      width: z.number(),
      height: z.number(),
      unit: z.string(),
    })
    .partial()
    .optional()
    .nullable(),
  specs: z.record(z.string(), z.any()).optional().nullable(),
  createdAt: z.date().optional(),
  deletedAt: z.date().optional().nullable(),
});

export const selectVariantSchema = insertVariantSchema.extend({
  id: z.string().uuid(),
});

export type InsertVariant = z.infer<typeof insertVariantSchema>;
export type SelectVariant = z.infer<typeof selectVariantSchema>;
