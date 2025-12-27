import { z } from 'zod';

/**
 * Product Form Validation Schemas - SIMPLIFIED
 * Fixed to prevent @hookform/resolvers _zod crash
 */

// ==================== IMAGE SCHEMAS ====================
export const productImageSchema = z.object({
  id: z.string().optional(),
  url: z.string().url('Invalid image URL'),
  altText: z.string().optional(),
  displayOrder: z.number().int().nonnegative().default(0),
  isPrimary: z.boolean().default(false),
});

// ==================== ATTRIBUTE SCHEMAS ====================

export const attributeOptionSchema = z.object({
  value: z.string().min(1, 'Value is required'),
  displayOrder: z.number().int().nonnegative().default(0),
  colorId: z.string().uuid().optional(),
  sizeId: z.string().uuid().optional(),
});

export const attributeGroupSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Group name is required'),
  type: z.enum(['color', 'size', 'custom']),
  options: z.array(attributeOptionSchema).min(1, 'At least one option is required'),
  displayOrder: z.number().int().nonnegative().default(0),
});

// ==================== VARIANT SCHEMAS ====================

const variantOptionAssignmentSchema = z.object({
  groupName: z.string(),
  groupType: z.enum(['color', 'size', 'custom']),
  value: z.string(),
  colorId: z.string().uuid().optional(),
  sizeId: z.string().uuid().optional(),
});

export const simpleVariantSchema = z.object({
  id: z.string().optional(),
  variantType: z.literal('simple'),
  sku: z.string().min(1, 'SKU is required'),
  price: z.string().min(1, 'Price is required'),
  salePrice: z.string().optional(),
  inStock: z.number().int().nonnegative().default(0),
  backorderable: z.boolean().default(false),
  weight: z.string().optional(),
  dimensions: z.object({
    length: z.number().nonnegative(),
    width: z.number().nonnegative(),
    height: z.number().nonnegative(),
    unit: z.enum(['cm', 'in']),
  }).optional(),
});

export const variableVariantSchema = z.object({
  id: z.string().optional(),
  variantType: z.literal('variable'),
  combinationId: z.string(),
  displayName: z.string(),
  sku: z.string().min(1, 'SKU is required'),
  price: z.string().min(1, 'Price is required'),
  salePrice: z.string().optional(),
  colorId: z.string().uuid().optional(),
  sizeId: z.string().uuid().optional(),
  genderId: z.string().uuid().optional(),
  inStock: z.number().int().nonnegative().default(0),
  backorderable: z.boolean().default(false),
  attributes: z.array(variantOptionAssignmentSchema).min(1),
  isEnabled: z.boolean().default(true),
  weight: z.string().optional(),
  dimensions: z.object({
    length: z.number().nonnegative(),
    width: z.number().nonnegative(),
    height: z.number().nonnegative(),
    unit: z.enum(['cm', 'in']),
  }).optional(),
});

export const productSpecsSchema = z.record(z.string(), z.string()).optional();

// ==================== BASE PRODUCT SCHEMA ====================

const baseProductSchema = z.object({
  name: z.string().min(3, 'Product name must be at least 3 characters'),
  slug: z.string().min(3, 'Slug must be at least 3 characters').regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    'Slug must be lowercase alphanumeric with hyphens'
  ),
  description: z.string().optional(),
  categoryIds: z.array(z.string().uuid()).min(1, 'Select at least one category'),
  brandId: z.string().uuid().optional(),
  productType: z.enum(['tool', 'accessory', 'consumable', 'ppe']),
  genderId: z.string().uuid().optional(),
  specs: productSpecsSchema,
  images: z.array(
    z.object({
      url: z.string(),
      displayOrder: z.number().optional(),
      isPrimary: z.boolean().optional(),
      id: z.string().optional(),
      altText: z.string().optional(),
    })
  ).default([]),
  isPublished: z.boolean().default(false),
  isBundle: z.boolean().default(false),
  hazmat: z.boolean().default(false),
  unNumber: z.string().optional(),
  seoMetaTitle: z.string().max(60).optional(),
  seoMetaDescription: z.string().max(160).optional(),
});

// ==================== SIMPLE PRODUCT SCHEMA ====================

const simpleProductSchema = baseProductSchema.extend({
  productMode: z.literal('simple'),
  variants: z.array(simpleVariantSchema).length(1),
});

// ==================== VARIABLE PRODUCT SCHEMA ====================

const variableProductSchema = baseProductSchema.extend({
  productMode: z.literal('variable'),
  attributeGroups: z.array(attributeGroupSchema).min(1),
  variants: z.array(variableVariantSchema).min(1),
});

// ==================== MAIN SCHEMAS ====================

/**
 * Create Product Form Schema - Discriminated Union
 * Used for form validation with react-hook-form
 */
export const createProductFormSchema = z.discriminatedUnion('productMode', [
  simpleProductSchema,
  variableProductSchema,
]);

/**
 * Update Product Schema - Manual Union of Partials
 * CRUCIAL: Cannot use .partial() on discriminated union directly
 */
export const updateProductFormSchema = z.union([
  simpleProductSchema.partial().extend({ id: z.string().uuid() }),
  variableProductSchema.partial().extend({ id: z.string().uuid() }),
]);


/**
 * Resolver-safe schema for react-hook-form
 * (Workaround for discriminatedUnion resolver typing issue)
 */
export const createProductFormResolverSchema =
  z.union([simpleProductSchema, variableProductSchema]);



// ==================== TYPE EXPORTS ====================

export type ProductImageInput = z.infer<typeof productImageSchema>;
export type AttributeOption = z.infer<typeof attributeOptionSchema>;
export type AttributeGroup = z.infer<typeof attributeGroupSchema>;
export type VariantOptionAssignment = z.infer<typeof variantOptionAssignmentSchema>;
export type SimpleVariant = z.infer<typeof simpleVariantSchema>;
export type VariableVariant = z.infer<typeof variableVariantSchema>;
export type ProductSpecsInput = z.infer<typeof productSpecsSchema>;
export type CreateProductInput = z.infer<typeof createProductFormSchema>;
export type UpdateProductInput = z.infer<typeof updateProductFormSchema>;
export type CreateProductFormResolverInput = z.infer<typeof createProductFormResolverSchema>;

// Legacy exports
export type ProductVariantInput = SimpleVariant | VariableVariant;
export type VariantOptionValueInput = AttributeOption;
export type VariantOptionGroupInput = AttributeGroup;
