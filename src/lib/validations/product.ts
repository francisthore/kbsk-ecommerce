import { z } from 'zod';

/**
 * Product Form Validation Schemas
 * Comprehensive validation for admin product creation/editing
 */

// Image upload schema
export const productImageSchema = z.object({
  id: z.string().optional(), // For existing images
  url: z.string().url(),
  altText: z.string().optional(),
  displayOrder: z.number().int().nonnegative().default(0),
  isPrimary: z.boolean().default(false),
});

// Variant option value schema (for form input)
export const variantOptionValueSchema = z.object({
  id: z.string().optional(), // For existing values
  value: z.string().min(1, 'Value is required'),
  displayOrder: z.number().int().nonnegative().default(0),
});

// Variant option group schema (e.g., "Color" with values ["Red", "Blue"])
export const variantOptionGroupSchema = z.object({
  id: z.string().optional(), // For existing groups
  name: z.string().min(1, 'Option name is required'),
  values: z.array(variantOptionValueSchema).min(1, 'At least one value is required'),
  required: z.boolean().default(true),
  displayOrder: z.number().int().nonnegative().default(0),
});

// Individual variant schema (for the permutation table)
export const productVariantFormSchema = z.object({
  id: z.string().optional(), // For existing variants
  sku: z.string().min(1, 'SKU is required'),
  price: z.string().refine(
    (val) => {
      const num = parseFloat(val);
      return !isNaN(num) && num >= 0;
    },
    { message: 'Price must be a valid positive number' }
  ),
  salePrice: z.string().optional().refine(
    (val) => {
      if (!val) return true;
      const num = parseFloat(val);
      return !isNaN(num) && num >= 0;
    },
    { message: 'Sale price must be a valid positive number' }
  ),
  inStock: z.number().int().nonnegative().default(0),
  backorderable: z.boolean().default(false),
  vatIncluded: z.boolean().default(true), // Whether the price includes VAT
  weight: z.string().optional(),
  dimensions: z.object({
    length: z.number().nonnegative(),
    width: z.number().nonnegative(),
    height: z.number().nonnegative(),
    unit: z.enum(['cm', 'in']),
  }).optional(),
  // Option assignments (which values this variant has)
  optionValues: z.array(z.object({
    groupId: z.string(),
    valueId: z.string(),
  })),
});

// Product specifications schema
export const productSpecsSchema = z.object({
  // Tool specs
  voltage: z.string().optional(),
  power: z.string().optional(),
  torque: z.string().optional(),
  rpm: z.string().optional(),
  batteryType: z.string().optional(),
  batteryCapacity: z.string().optional(),
  
  // Physical specs
  weight: z.string().optional(),
  dimensions: z.string().optional(),
  material: z.string().optional(),
  
  // Safety specs
  ipRating: z.string().optional(),
  safetyRating: z.string().optional(),
  
  // PPE specs
  protectionLevel: z.string().optional(),
  standard: z.string().optional(),
  
  // Other
  packSize: z.string().optional(),
  warranty: z.string().optional(),
  
  // Allow custom fields
}).catchall(z.any());

// Main product form schema
export const createProductFormSchema = z.object({
  // Basic Info
  name: z.string().min(3, 'Product name must be at least 3 characters'),
  slug: z.string().min(3, 'Slug must be at least 3 characters').regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    'Slug must be lowercase alphanumeric with hyphens'
  ),
  description: z.string().optional(),
  
  // Categorization - MULTI-CATEGORY SUPPORT
  categoryIds: z.array(z.string().uuid('Invalid category')).min(1, 'Select at least one category'),
  brandId: z.string().uuid('Invalid brand').optional(),
  productType: z.enum(['tool', 'accessory', 'consumable', 'ppe']).default('tool'),
  genderId: z.string().uuid('Invalid gender').optional(),
  
  // Specifications
  specs: productSpecsSchema.optional(),
  
  // Media
  images: z.array(productImageSchema).min(1, 'At least one product image is required'),
  
  // Variant Options
  variantOptions: z.array(variantOptionGroupSchema).optional(),
  
  // Variants (generated from permutations or manually created)
  variants: z.array(productVariantFormSchema).min(1, 'At least one variant is required'),
  
  // Publishing
  isPublished: z.boolean().default(false),
  isBundle: z.boolean().default(false),
  
  // Shipping
  hazmat: z.boolean().default(false),
  unNumber: z.string().optional(),
  
  // SEO
  seoMetaTitle: z.string().max(60, 'Meta title should be under 60 characters').optional(),
  seoMetaDescription: z.string().max(160, 'Meta description should be under 160 characters').optional(),
}).refine(
  (data) => {
    // If variant options exist, ensure variants have option assignments
    if (data.variantOptions && data.variantOptions.length > 0) {
      return data.variants.every(v => v.optionValues.length > 0);
    }
    return true;
  },
  {
    message: 'All variants must have option value assignments',
    path: ['variants'],
  }
).refine(
  (data) => {
    // Validate sale price is less than regular price
    return data.variants.every(v => {
      if (v.salePrice) {
        const price = parseFloat(v.price);
        const salePrice = parseFloat(v.salePrice);
        return salePrice < price;
      }
      return true;
    });
  },
  {
    message: 'Sale price must be less than regular price',
    path: ['variants'],
  }
).refine(
  (data) => {
    // Ensure SKUs are unique
    const skus = data.variants.map(v => v.sku);
    return new Set(skus).size === skus.length;
  },
  {
    message: 'All variant SKUs must be unique',
    path: ['variants'],
  }
);

// Update product schema (allows partial updates)
export const updateProductFormSchema = createProductFormSchema.partial().extend({
  id: z.string().uuid(),
});

// Type exports
export type ProductImageInput = z.infer<typeof productImageSchema>;
export type VariantOptionValueInput = z.infer<typeof variantOptionValueSchema>;
export type VariantOptionGroupInput = z.infer<typeof variantOptionGroupSchema>;
export type ProductVariantInput = z.infer<typeof productVariantFormSchema>;
export type ProductSpecsInput = z.infer<typeof productSpecsSchema>;
export type CreateProductInput = z.infer<typeof createProductFormSchema>;
export type UpdateProductInput = z.infer<typeof updateProductFormSchema>;
