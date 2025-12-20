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
import { eq } from 'drizzle-orm';

/**
 * Verify admin role for protected actions
 */
async function verifyAdminRole() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user || session.user.role !== 'admin') {
    throw new Error('Unauthorized: Admin access required');
  }

  return session.user;
}

/**
 * Check if slug is available
 */
export async function checkSlugAvailability(slug: string, excludeProductId?: string) {
  try {
    const existing = await db.query.products.findFirst({
      where: (products, { eq, and, isNull, ne }) => 
        excludeProductId
          ? and(eq(products.slug, slug), ne(products.id, excludeProductId), isNull(products.deletedAt))
          : and(eq(products.slug, slug), isNull(products.deletedAt)),
    });

    return { available: !existing, slug };
  } catch (error) {
    console.error('Error checking slug availability:', error);
    return { available: false, slug, error: 'Failed to check slug availability' };
  }
}

/**
 * Generate unique slug from product name
 */
export async function generateUniqueSlug(name: string): Promise<string> {
  let slug = generateSlug(name);
  let counter = 1;
  
  while (true) {
    const result = await checkSlugAvailability(slug);
    if (result.available) {
      return slug;
    }
    slug = `${generateSlug(name)}-${counter}`;
    counter++;
  }
}

/**
 * Create a new product with variants (Transaction-safe)
 */
export async function createProduct(input: CreateProductInput) {
  try {
    // 1. Verify admin role
    await verifyAdminRole();

    // 2. Validate input
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
      // Insert product
      const [product] = await tx.insert(products).values({
        name: validatedData.name,
        slug: validatedData.slug,
        description: validatedData.description,
        brandId: validatedData.brandId,
        productType: validatedData.productType,
        genderId: validatedData.genderId,
        specs: validatedData.specs || {},
        isPublished: validatedData.isPublished,
        isBundle: validatedData.isBundle,
        hazmat: validatedData.hazmat,
        unNumber: validatedData.unNumber,
        seoMetaTitle: validatedData.seoMetaTitle,
        seoMetaDescription: validatedData.seoMetaDescription,
      }).returning();

      // Insert product-to-categories mappings (multi-category support)
      if (validatedData.categoryIds && validatedData.categoryIds.length > 0) {
        await tx.insert(productToCategories).values(
          validatedData.categoryIds.map(categoryId => ({
            productId: product.id,
            categoryId,
          }))
        );
      }

      // Insert product images
      if (validatedData.images.length > 0) {
        await tx.insert(productImages).values(
          validatedData.images.map((img, index) => ({
            productId: product.id,
            variantId: null, // Product-level images
            url: img.url,
            altText: img.altText || validatedData.name,
            displayOrder: img.displayOrder ?? index,
            isPrimary: img.isPrimary ?? index === 0,
          }))
        );
      }

      // Handle variant options if provided
      const optionGroupMap = new Map<string, string>(); // temp ID -> real ID
      const optionValueMap = new Map<string, string>(); // temp ID -> real ID

      if (validatedData.variantOptions && validatedData.variantOptions.length > 0) {
        // Insert option groups
        for (const optionGroup of validatedData.variantOptions) {
          const [insertedGroup] = await tx.insert(variantOptionGroups).values({
            name: optionGroup.name,
            displayOrder: optionGroup.displayOrder,
          }).returning();

          // Map temp ID to real ID
          if (optionGroup.id) {
            optionGroupMap.set(optionGroup.id, insertedGroup.id);
          }

          // Insert option values
          for (const value of optionGroup.values) {
            const [insertedValue] = await tx.insert(variantOptionValues).values({
              groupId: insertedGroup.id,
              value: value.value,
              displayOrder: value.displayOrder,
            }).returning();

            // Map temp ID to real ID
            if (value.id) {
              optionValueMap.set(value.id, insertedValue.id);
            }
          }

          // Link option group to product
          await tx.insert(productVariantOptions).values({
            productId: product.id,
            groupId: insertedGroup.id,
            required: optionGroup.required,
            displayOrder: optionGroup.displayOrder,
          });
        }
      }

      // Insert variants
      let defaultVariantId: string | null = null;
      
      for (let i = 0; i < validatedData.variants.length; i++) {
        const variant = validatedData.variants[i];
        
        const [insertedVariant] = await tx.insert(productVariants).values({
          productId: product.id,
          sku: variant.sku,
          price: variant.price,
          salePrice: variant.salePrice,
          inStock: variant.inStock,
          backorderable: variant.backorderable,
          weight: variant.weight,
          dimensions: variant.dimensions,
          specs: {},
        }).returning();

        // Set first variant as default
        if (i === 0) {
          defaultVariantId = insertedVariant.id;
        }

        // Insert variant option assignments
        if (variant.optionValues && variant.optionValues.length > 0) {
          for (const optionValue of variant.optionValues) {
            const realValueId = optionValueMap.get(optionValue.valueId) || optionValue.valueId;
            
            await tx.insert(variantOptionAssignments).values({
              variantId: insertedVariant.id,
              optionValueId: realValueId,
            });
          }
        }
      }

      // Update product with default variant ID
      if (defaultVariantId) {
        await tx.update(products)
          .set({ defaultVariantId })
          .where(eq(products.id, product.id));
      }

      return product;
    });

    // 5. Revalidate cache
    revalidatePath('/admin/products');
    revalidatePath('/shop');

    return {
      success: true,
      product: result,
      message: 'Product created successfully',
    };
  } catch (error) {
    console.error('Error creating product:', error);
    
    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      };
    }
    
    return {
      success: false,
      error: 'Failed to create product',
    };
  }
}

/**
 * Get all option groups with values (for form dropdowns)
 */
export async function getVariantOptionGroups() {
  try {
    const groups = await db.query.variantOptionGroups.findMany({
      with: {
        values: {
          orderBy: (values, { asc }) => [asc(values.displayOrder)],
        },
      },
      orderBy: (groups, { asc }) => [asc(groups.displayOrder)],
    });

    return { success: true, groups };
  } catch (error) {
    console.error('Error fetching option groups:', error);
    return { success: false, error: 'Failed to fetch option groups' };
  }
}

/**
 * Get all categories (for form dropdowns)
 */
export async function getCategories() {
  try {
    const categories = await db.query.categories.findMany({
      orderBy: (categories, { asc }) => [asc(categories.name)],
    });

    return { success: true, categories };
  } catch (error) {
    console.error('Error fetching categories:', error);
    return { success: false, error: 'Failed to fetch categories' };
  }
}

/**
 * Get all brands (for form dropdowns)
 */
export async function getBrands() {
  try {
    const brands = await db.query.brands.findMany({
      orderBy: (brands, { asc }) => [asc(brands.name)],
    });

    return { success: true, brands };
  } catch (error) {
    console.error('Error fetching brands:', error);
    return { success: false, error: 'Failed to fetch brands' };
  }
}

/**
 * Get all colors (for predefined variant attributes)
 */
export async function getColors() {
  try {
    const colors = await db.query.colors.findMany({
      orderBy: (colors, { asc }) => [asc(colors.name)],
    });

    return { success: true, colors };
  } catch (error) {
    console.error('Error fetching colors:', error);
    return { success: false, error: 'Failed to fetch colors' };
  }
}

/**
 * Get all sizes (for predefined variant attributes)
 */
export async function getSizes() {
  try {
    const sizes = await db.query.sizes.findMany({
      orderBy: (sizes, { asc }) => [asc(sizes.sortOrder)],
    });

    return { success: true, sizes };
  } catch (error) {
    console.error('Error fetching sizes:', error);
    return { success: false, error: 'Failed to fetch sizes' };
  }
}

/**
 * Get all genders (for product categorization)
 */
export async function getGenders() {
  try {
    const genders = await db.query.genders.findMany({
      orderBy: (genders, { asc }) => [asc(genders.label)],
    });

    return { success: true, genders };
  } catch (error) {
    console.error('Error fetching genders:', error);
    return { success: false, error: 'Failed to fetch genders' };
  }
}

/**
 * Get all attributes in parallel (for form hydration)
 */
export async function getFormAttributes() {
  try {
    const [
      categoriesResult,
      brandsResult,
      colorsResult,
      sizesResult,
      gendersResult,
    ] = await Promise.all([
      getCategories(),
      getBrands(),
      getColors(),
      getSizes(),
      getGenders(),
    ]);

    return {
      success: true,
      data: {
        categories: categoriesResult.success ? categoriesResult.categories : [],
        brands: brandsResult.success ? brandsResult.brands : [],
        colors: colorsResult.success ? colorsResult.colors : [],
        sizes: sizesResult.success ? sizesResult.sizes : [],
        genders: gendersResult.success ? gendersResult.genders : [],
      },
    };
  } catch (error) {
    console.error('Error fetching form attributes:', error);
    return { success: false, error: 'Failed to fetch form attributes' };
  }
}

/**
 * Quick create brand
 */
export async function quickCreateBrand(name: string, imageUrl?: string) {
  try {
    await verifyAdminRole();

    const slug = generateSlug(name);

    const [brand] = await db.insert(brands).values({
      name,
      slug,
      imageUrl: imageUrl || null,
    }).returning();

    revalidatePath('/admin/products');

    return {
      success: true,
      brand,
      message: 'Brand created successfully',
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
 * Quick create category
 */
export async function quickCreateCategory(name: string, parentId?: string) {
  try {
    await verifyAdminRole();

    const slug = generateSlug(name);

    const [category] = await db.insert(categories).values({
      name,
      slug,
      parentId: parentId || null,
    }).returning();

    revalidatePath('/admin/products');

    return {
      success: true,
      category,
      message: 'Category created successfully',
    };
  } catch (error) {
    console.error('Error creating category:', error);
    return {
      success: false,
      error: 'Failed to create category',
    };
  }
}
