import { pgTable, text, timestamp, uuid, boolean, jsonb, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { z } from 'zod';
import { categories } from './categories';
import { genders } from './filters/genders';
import { brands } from './brands';
import { productTypeEnum } from './enums';

export const products = pgTable('products', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  categoryId: uuid('category_id').references(() => categories.id, { onDelete: 'set null' }),
  brandId: uuid('brand_id').references(() => brands.id, { onDelete: 'set null' }),
  productType: productTypeEnum('product_type').notNull().default('tool'),
  // Gender is optional - used for PPE/workwear and gendered accessories only
  // NULL for non-wearable tools and unisex items
  genderId: uuid('gender_id').references(() => genders.id, { onDelete: 'set null' }),
  // JSONB for structured product specs (voltage, torque, rpm, disc_diameter, arbor, battery_type, ip_rating, safety_rating, material, pack_size, etc.)
  specs: jsonb('specs').notNull().default('{}'),
  isPublished: boolean('is_published').notNull().default(false),
  isBundle: boolean('is_bundle').notNull().default(false),
  defaultVariantId: uuid('default_variant_id'),
  // Hazmat fields for shipping compliance
  hazmat: boolean('hazmat').notNull().default(false),
  unNumber: text('un_number'),
  // SEO fields
  seoMetaTitle: text('seo_meta_title'),
  seoMetaDescription: text('seo_meta_description'),
  // Soft delete
  deletedAt: timestamp('deleted_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (t) => ({
  slugIdx: index('products_slug_idx').on(t.slug),
}));

export const productsRelations = relations(products, ({ one }) => ({
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
  gender: one(genders, {
    fields: [products.genderId],
    references: [genders.id],
  }),
  brand: one(brands, {
    fields: [products.brandId],
    references: [brands.id],
  }),
}));

export const insertProductSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().optional().nullable(),
  categoryId: z.string().uuid().optional().nullable(),
  brandId: z.string().uuid().optional().nullable(),
  productType: z.enum(['tool', 'accessory', 'consumable', 'ppe']).optional(),
  genderId: z.string().uuid().optional().nullable(),
  specs: z.record(z.any()).optional(),
  isPublished: z.boolean().optional(),
  isBundle: z.boolean().optional(),
  defaultVariantId: z.string().uuid().optional().nullable(),
  hazmat: z.boolean().optional(),
  unNumber: z.string().optional().nullable(),
  seoMetaTitle: z.string().optional().nullable(),
  seoMetaDescription: z.string().optional().nullable(),
  deletedAt: z.date().optional().nullable(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export const selectProductSchema = insertProductSchema.extend({
  id: z.string().uuid(),
});

export type InsertProduct = z.infer<typeof insertProductSchema>;
export type SelectProduct = z.infer<typeof selectProductSchema>;
export type SelectProduct = z.infer<typeof selectProductSchema>;
