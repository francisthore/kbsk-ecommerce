import { pgTable, text, uuid, foreignKey } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { z } from 'zod';

export const categories = pgTable('categories', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  imageUrl: text('image_url'),
  seoMetaTitle: text('seo_meta_title'),
  seoMetaDescription: text('seo_meta_description'),
  parentId: uuid('parent_id'),
}, (t) => ({
  parentFk: foreignKey({
    columns: [t.parentId],
    foreignColumns: [t.id],
  }).onDelete('set null'),
}));

export const categoriesRelations = relations(categories, ({ many, one }) => ({
  parent: one(categories, {
    fields: [categories.parentId],
    references: [categories.id],
  }),
  children: many(categories),
}));

export const insertCategorySchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().optional().nullable(),
  imageUrl: z.string().url().optional().nullable(),
  seoMetaTitle: z.string().optional().nullable(),
  seoMetaDescription: z.string().optional().nullable(),
  parentId: z.string().uuid().optional().nullable(),
});

export const selectCategorySchema = insertCategorySchema.extend({
  id: z.string().uuid(),
});

export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type SelectCategory = z.infer<typeof selectCategorySchema>;
