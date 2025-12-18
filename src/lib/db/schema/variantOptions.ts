import { pgTable, text, timestamp, uuid, integer, boolean } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { z } from 'zod';
import { products } from './products';
import { productVariants } from './variants';

/**
 * Product Variant Options Schema
 * Supports dynamic variant generation (e.g., Color: Red, Size: M)
 */

// Option Groups (e.g., "Color", "Size", "Material")
export const variantOptionGroups = pgTable('variant_option_groups', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(), // "Color", "Size", "Material"
  displayOrder: integer('display_order').notNull().default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Option Values (e.g., "Red", "Blue", "Small", "Medium")
export const variantOptionValues = pgTable('variant_option_values', {
  id: uuid('id').primaryKey().defaultRandom(),
  groupId: uuid('group_id').references(() => variantOptionGroups.id, { onDelete: 'cascade' }).notNull(),
  value: text('value').notNull(), // "Red", "Blue", "Small"
  displayOrder: integer('display_order').notNull().default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Product-specific option groups (which options apply to this product)
export const productVariantOptions = pgTable('product_variant_options', {
  id: uuid('id').primaryKey().defaultRandom(),
  productId: uuid('product_id').references(() => products.id, { onDelete: 'cascade' }).notNull(),
  groupId: uuid('group_id').references(() => variantOptionGroups.id, { onDelete: 'cascade' }).notNull(),
  required: boolean('required').notNull().default(true),
  displayOrder: integer('display_order').notNull().default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Junction table: which option values belong to which variant
export const variantOptionAssignments = pgTable('variant_option_assignments', {
  id: uuid('id').primaryKey().defaultRandom(),
  variantId: uuid('variant_id').references(() => productVariants.id, { onDelete: 'cascade' }).notNull(),
  optionValueId: uuid('option_value_id').references(() => variantOptionValues.id, { onDelete: 'cascade' }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Relations
export const variantOptionGroupsRelations = relations(variantOptionGroups, ({ many }) => ({
  values: many(variantOptionValues),
  productOptions: many(productVariantOptions),
}));

export const variantOptionValuesRelations = relations(variantOptionValues, ({ one, many }) => ({
  group: one(variantOptionGroups, {
    fields: [variantOptionValues.groupId],
    references: [variantOptionGroups.id],
  }),
  assignments: many(variantOptionAssignments),
}));

export const productVariantOptionsRelations = relations(productVariantOptions, ({ one }) => ({
  product: one(products, {
    fields: [productVariantOptions.productId],
    references: [products.id],
  }),
  group: one(variantOptionGroups, {
    fields: [productVariantOptions.groupId],
    references: [variantOptionGroups.id],
  }),
}));

export const variantOptionAssignmentsRelations = relations(variantOptionAssignments, ({ one }) => ({
  variant: one(productVariants, {
    fields: [variantOptionAssignments.variantId],
    references: [productVariants.id],
  }),
  optionValue: one(variantOptionValues, {
    fields: [variantOptionAssignments.optionValueId],
    references: [variantOptionValues.id],
  }),
}));

// Zod Schemas
export const insertVariantOptionGroupSchema = z.object({
  name: z.string().min(1),
  displayOrder: z.number().int().nonnegative().optional(),
});

export const insertVariantOptionValueSchema = z.object({
  groupId: z.string().uuid(),
  value: z.string().min(1),
  displayOrder: z.number().int().nonnegative().optional(),
});

export const insertProductVariantOptionSchema = z.object({
  productId: z.string().uuid(),
  groupId: z.string().uuid(),
  required: z.boolean().optional(),
  displayOrder: z.number().int().nonnegative().optional(),
});

export const insertVariantOptionAssignmentSchema = z.object({
  variantId: z.string().uuid(),
  optionValueId: z.string().uuid(),
});

export type InsertVariantOptionGroup = z.infer<typeof insertVariantOptionGroupSchema>;
export type InsertVariantOptionValue = z.infer<typeof insertVariantOptionValueSchema>;
export type InsertProductVariantOption = z.infer<typeof insertProductVariantOptionSchema>;
export type InsertVariantOptionAssignment = z.infer<typeof insertVariantOptionAssignmentSchema>;
