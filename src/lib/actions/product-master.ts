'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { 
  products, 
  productImages, 
  productVariants,
  variantOptionGroups,
  variantOptionValues,
  productVariantOptions,
  variantOptionAssignments,
  productToCategories,
  colors,
  sizes,
  genders,
  brands,
  categories,
} from '@/lib/db/schema';
import { createProductFormSchema, type CreateProductInput } from '@/lib/validations/product';
import { generateSlug } from '@/lib/utils/product';
import { eq, and, isNull, sql } from 'drizzle-orm';

/**
 * =====================================================
 * MASTER PRODUCT CREATION FLOW - Server Actions
 * =====================================================
 * 
 * Handles both Simple (single variant) and Variable (multi-variant) products
 * with full support for Predefined (Color/Size) and Custom attributes
 */

// ==================== AUTHENTICATION ====================

async function verifyAdminRole() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user || session.user.role !== 'admin') {
    throw new Error('Unauthorized: Admin access required');
  }

  return session.user;
}

// ==================== FORM HYDRATION ====================

/**
 * Fetch all attributes needed for form initialization
 * Returns parallel fetches for optimal performance
 */
export async function getFormAttributes() {
  try {
    const [colorsList, sizesList, gendersList, brandsList, categoriesList] = await Promise.all([
      // Colors (Predefined)
      db.select({
        id: colors.id,
        name: colors.name,
        slug: colors.slug,
        hexCode: colors.hexCode,
      }).from(colors).orderBy(colors.name),
      
      // Sizes (Predefined)
      db.select({
        id: sizes.id,
        name: sizes.name,
        slug: sizes.slug,
        sortOrder: sizes.sortOrder,
      }).from(sizes).orderBy(sizes.sortOrder),
      
      // Genders
      db.select({
        id: genders.id,
        label: genders.label,
        slug: genders.slug,
      }).from(genders),
      
      // Brands
      db.select({
        id: brands.id,
        name: brands.name,
        slug: brands.slug,
        logoUrl: brands.logoUrl,
      }).from(brands).orderBy(brands.name),
      
      // Categories
      db.select({
        id: categories.id,
        name: categories.name,
        slug: categories.slug,
      }).from(categories).orderBy(categories.name),
    ]);

    return {
      success: true,
      data: {
        colors: colorsList,
        sizes: sizesList,
        genders: gendersList,
        brands: brandsList,
        categories: categoriesList,
      },
    };
  } catch (error) {
    console.error('Error fetching form attributes:', error);
    return {
      success: false,
      error: 'Failed to load form data',
    };
  }
}

// ==================== QUICK CREATE HELPERS ====================

/**
 * Quick-create brand (for CreatableCombobox)
 */
export async function quickCreateBrand(name: string) {
  try {
    await verifyAdminRole();

    const slug = generateSlug(name);
    
    // Check if exists
    const existing = await db.query.brands.findFirst({
      where: eq(brands.slug, slug),
    });

    if (existing) {
      return {
        success: false,
        error: 'Brand with this name already exists',
      };
    }

    const [brand] = await db.insert(brands).values({
      name,
      slug,
    }).returning();

    revalidatePath('/admin/products');
    
    return {
      success: true,
      data: brand,
    };
  } catch (error) {
    console.error('Error creating brand:', error);
    return {
      success: false,
      error: 'Failed to create brand',
    };
  }
}

/**
 * Quick-create category (for CreatableMultiSelect)
 */
export async function quickCreateCategory(name: string) {
  try {
    await verifyAdminRole();

    const slug = generateSlug(name);
    
    // Check if exists
    const existing = await db.query.categories.findFirst({
      where: eq(categories.slug, slug),
    });

    if (existing) {
      return {
        success: false,
        error: 'Category with this name already exists',
      };
    }

    const [category] = await db.insert(categories).values({
      name,
      slug,
    }).returning();

    revalidatePath('/admin/products');
    
    return {
      success: true,
      data: category,
    };
  } catch (error) {
    console.error('Error creating category:', error);
    return {
      success: false,
      error: 'Failed to create category',
    };
  }
}

// ==================== SLUG VALIDATION ====================

export async function checkSlugAvailability(slug: string, excludeProductId?: string) {
  try {
    const existing = await db.query.products.findFirst({
      where: excludeProductId
        ? and(eq(products.slug, slug), sql`${products.id} != ${excludeProductId}`, isNull(products.deletedAt))
        : and(eq(products.slug, slug), isNull(products.deletedAt)),
    });

    return { available: !existing, slug };
  } catch (error) {
    console.error('Error checking slug:', error);
    return { available: false, slug, error: 'Failed to check slug' };
  }
}

// ==================== MAIN PRODUCT CREATION ====================

/**
 * Create product with full transaction support
 * Handles both Simple and Variable product modes
 */
export async function createProduct(input: CreateProductInput) {
  try {
    // 1. Verify admin role
    await verifyAdminRole();

    // 2. Validate input with discriminated union
    const validatedData = createProductFormSchema.parse(input);

    // 3. Check slug availability
    const slugCheck = await checkSlugAvailability(validatedData.slug);
    if (!slugCheck.available) {
      return {
        success: false,
        error: 'Slug already exists. Please use a different slug.',
      };
    }

    // 4. Execute transaction
    const result = await db.transaction(async (tx) => {
      // ==================== A. INSERT PRODUCT ====================
      const [product] = await tx.insert(products).values({
        name: validatedData.name,
        slug: validatedData.slug,
        description: validatedData.description,
        brandId: validatedData.brandId || null,
        productType: validatedData.productType,
        genderId: validatedData.genderId || null,
        specs: validatedData.specs || {},
        isPublished: validatedData.isPublished,
        isBundle: validatedData.isBundle,
        hazmat: validatedData.hazmat,
        unNumber: validatedData.unNumber,
        seoMetaTitle: validatedData.seoMetaTitle,
        seoMetaDescription: validatedData.seoMetaDescription,
      }).returning();

      // ==================== B. CATEGORY MAPPINGS ====================
      if (validatedData.categoryIds.length > 0) {
        await tx.insert(productToCategories).values(
          validatedData.categoryIds.map(categoryId => ({
            productId: product.id,
            categoryId,
          }))
        );
      }

      // ==================== C. PRODUCT IMAGES ====================
      if (validatedData.images && validatedData.images.length > 0) {
        await tx.insert(productImages).values(
          validatedData.images.map((img, index) => ({
            productId: product.id,
            variantId: null,
            url: img.url,
            kind: 'image',
            sortOrder: img.displayOrder ?? index,
            isPrimary: img.isPrimary ?? index === 0,
          }))
        );
      }

      // ==================== D. HANDLE VARIANTS ====================
      
      if (validatedData.productMode === 'simple') {
        // ---------- SIMPLE PRODUCT ----------
        // Single variant, no attribute groups
        
        const variantData = validatedData.variants[0];
        
        const [variant] = await tx.insert(productVariants).values({
          productId: product.id,
          sku: variantData.sku,
          price: variantData.price,
          salePrice: variantData.salePrice || null,
          inStock: variantData.inStock,
          backorderable: variantData.backorderable,
          weight: variantData.weight || null,
          dimensions: variantData.dimensions || null,
          colorId: null,
          sizeId: null,
          genderId: null,
        }).returning();

        // Set as default variant
        await tx.update(products)
          .set({ defaultVariantId: variant.id })
          .where(eq(products.id, product.id));

      } else {
        // ---------- VARIABLE PRODUCT ----------
        // Multiple variants with attribute groups
        
        // D1. Create custom attribute groups (for 'custom' type)
        // We'll track group IDs for later variant assignment
        const groupIdMap = new Map<string, string>(); // Form group name -> DB group ID
        const customValueMap = new Map<string, string>(); // Form value -> DB value ID
        
        for (const group of validatedData.attributeGroups) {
          if (group.type === 'custom') {
            // Create custom option group
            const [dbGroup] = await tx.insert(variantOptionGroups).values({
              name: group.name,
              displayOrder: group.displayOrder,
            }).returning();

            groupIdMap.set(group.name, dbGroup.id);

            // Link to product
            await tx.insert(productVariantOptions).values({
              productId: product.id,
              groupId: dbGroup.id,
              required: true,
              displayOrder: group.displayOrder,
            });

            // Create option values
            for (const option of group.options) {
              const [dbValue] = await tx.insert(variantOptionValues).values({
                groupId: dbGroup.id,
                value: option.value,
                displayOrder: option.displayOrder,
              }).returning();

              customValueMap.set(`${group.name}:${option.value}`, dbValue.id);
            }
          }
        }

        // D2. Insert variants with proper ID tracking
        let defaultVariantId: string | null = null;

        for (let i = 0; i < validatedData.variants.length; i++) {
          const variantData = validatedData.variants[i];

          // Extract predefined IDs from attributes
          let colorId: string | null = null;
          let sizeId: string | null = null;

          for (const attr of variantData.attributes) {
            if (attr.groupType === 'color' && attr.colorId) {
              colorId = attr.colorId;
            } else if (attr.groupType === 'size' && attr.sizeId) {
              sizeId = attr.sizeId;
            }
          }

          // Insert variant
          const [variant] = await tx.insert(productVariants).values({
            productId: product.id,
            sku: variantData.sku,
            price: variantData.price,
            salePrice: variantData.salePrice || null,
            colorId, // Predefined color
            sizeId, // Predefined size
            genderId: null,
            inStock: variantData.inStock,
            backorderable: variantData.backorderable,
            weight: variantData.weight || null,
            dimensions: variantData.dimensions || null,
          }).returning();

          if (i === 0) defaultVariantId = variant.id;

          // D3. Create variant option assignments for custom attributes
          for (const attr of variantData.attributes) {
            if (attr.groupType === 'custom') {
              const customValueId = customValueMap.get(`${attr.groupName}:${attr.value}`);
              if (customValueId) {
                await tx.insert(variantOptionAssignments).values({
                  variantId: variant.id,
                  optionValueId: customValueId,
                });
              }
            }
          }
        }

        // Set default variant
        if (defaultVariantId) {
          await tx.update(products)
            .set({ defaultVariantId })
            .where(eq(products.id, product.id));
        }
      }

      return product;
    });

    // 5. Revalidate and return success
    revalidatePath('/admin/products');
    revalidatePath('/shop');
    
    return {
      success: true,
      data: result,
    };

  } catch (error) {
    console.error('Error creating product:', error);
    
    // Better error messages
    if (error instanceof Error) {
      if (error.message.includes('unique constraint')) {
        return {
          success: false,
          error: 'A product with this SKU or slug already exists',
        };
      }
      return {
        success: false,
        error: error.message,
      };
    }
    
    return {
      success: false,
      error: 'Failed to create product. Please check your input and try again.',
    };
  }
}
