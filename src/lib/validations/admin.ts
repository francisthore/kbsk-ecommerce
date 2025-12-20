import { z } from "zod";

// =============================================================================
// BRAND SCHEMAS
// =============================================================================

export const brandSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name is too long"),
  logoUrl: z
    .string()
    .transform((val) => {
      // Convert empty/whitespace to undefined
      if (!val || val.trim() === "") return undefined;
      return val;
    })
    .pipe(z.string().url("Invalid logo URL").optional())
    .optional(),
  website: z
    .string()
    .transform((val) => {
      // Convert empty/whitespace to undefined
      if (!val || val.trim() === "") return undefined;
      return val;
    })
    .pipe(z.string().url("Invalid website URL").optional())
    .optional(),
});

export type BrandFormData = z.infer<typeof brandSchema>;

// =============================================================================
// CATEGORY SCHEMAS
// =============================================================================

export const categorySchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name is too long"),
  description: z
    .string()
    .transform((val) => (!val || val.trim() === "" ? undefined : val))
    .pipe(z.string().max(500, "Description is too long").optional())
    .optional(),
  imageUrl: z
    .string()
    .transform((val) => {
      // Convert empty/whitespace to undefined
      if (!val || val.trim() === "") return undefined;
      return val;
    })
    .pipe(z.string().url("Invalid image URL").optional())
    .optional(),
  parentId: z
    .string()
    .nullable()
    .transform((val) => {
      if (!val || val === "") return null;
      return val;
    })
    .pipe(z.string().uuid("Invalid parent category").nullable())
    .nullable(),
  seoMetaTitle: z
    .string()
    .transform((val) => (!val || val.trim() === "" ? undefined : val))
    .pipe(z.string().max(60, "Meta title is too long").optional())
    .optional(),
  seoMetaDescription: z
    .string()
    .transform((val) => (!val || val.trim() === "" ? undefined : val))
    .pipe(z.string().max(160, "Meta description is too long").optional())
    .optional(),
});

export type CategoryFormData = z.infer<typeof categorySchema>;

// =============================================================================
// COLOR SCHEMAS
// =============================================================================

export const colorSchema = z.object({
  name: z.string().min(1, "Name is required").max(50, "Name is too long"),
  hexCode: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Invalid hex color code (e.g., #FF5733)"),
});

export type ColorFormData = z.infer<typeof colorSchema>;

// =============================================================================
// SIZE SCHEMAS
// =============================================================================

export const sizeSchema = z.object({
  name: z.string().min(1, "Name is required").max(50, "Name is too long"),
  sortOrder: z
    .number()
    .int("Must be a whole number")
    .min(0, "Must be 0 or greater")
    .or(
      z
        .string()
        .transform((val) => parseInt(val, 10))
        .pipe(z.number().int().min(0))
    ),
});

export type SizeFormData = z.infer<typeof sizeSchema>;

// =============================================================================
// GENDER SCHEMAS
// =============================================================================

export const genderSchema = z.object({
  label: z.string().min(1, "Label is required").max(50, "Label is too long"),
});

export type GenderFormData = z.infer<typeof genderSchema>;
