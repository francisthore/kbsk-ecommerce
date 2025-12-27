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
 * Create a new product with variants (No transaction - compatible with neon-http)
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

    // 4. Insert Product (no transaction)
    const [product] = await db.insert(products).values({
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

    // 5. Category Mappings
    if (validatedData.categoryIds && validatedData.categoryIds.length > 0) {
      await db.insert(productToCategories).values(
        validatedData.categoryIds.map(categoryId => ({
          productId: product.id,
          categoryId,
        }))
      );
    }

    // 6. Product Images
    if (validatedData.images.length > 0) {
      await db.insert(productImages).values(
        validatedData.images.map((img, index) => ({
          productId: product.id,
          variantId: null, // Product-level images
          url: img.url,
          kind: 'image' as const,
          sortOrder: img.displayOrder ?? index,
          isPrimary: img.isPrimary ?? index === 0,
        }))
      );
    }

    // 7. Handle Variants (Simple or Variable)
    if (validatedData.productMode === 'simple') {
      // Simple product - insert single variant
      const variantData = validatedData.variants[0];
      await db.insert(productVariants).values({
        productId: product.id,
        sku: variantData.sku,
        price: variantData.price,
        salePrice: variantData.salePrice,
        inStock: variantData.inStock,
        backorderable: variantData.backorderable,
        weight: variantData.weight,
        colorId: null,
        sizeId: null,
        specs: {},
      });
    } else {
      // Variable product - handle attribute groups and variants
      const optionGroupMap = new Map<string, string>();
      const optionValueMap = new Map<string, string>();

      // Create attribute groups if any
      if (validatedData.attributeGroups && validatedData.attributeGroups.length > 0) {
        for (const optionGroup of validatedData.attributeGroups) {
          const [insertedGroup] = await db.insert(variantOptionGroups).values({
            name: optionGroup.name,
            displayOrder: optionGroup.displayOrder,
          }).returning();

          if (optionGroup.id) optionGroupMap.set(optionGroup.id, insertedGroup.id);

          await db.insert(productVariantOptions).values({
            productId: product.id,
            groupId: insertedGroup.id,
            required: true,
            displayOrder: optionGroup.displayOrder,
          });

          for (const value of optionGroup.options) {
            const [insertedValue] = await db.insert(variantOptionValues).values({
              groupId: insertedGroup.id,
              value: value.value,
              displayOrder: value.displayOrder,
            }).returning();

            optionValueMap.set(value.value, insertedValue.id);
          }
        }
      }

      // Insert variants
      for (const variantData of validatedData.variants) {
        let colorId: string | null = null;
        let sizeId: string | null = null;

        // Extract colorId and sizeId directly from variant data (for variable products)
        if ('colorId' in variantData && variantData.colorId) {
          colorId = variantData.colorId;
        }
        if ('sizeId' in variantData && variantData.sizeId) {
          sizeId = variantData.sizeId;
        }

        // If not found directly, try to extract from attributes (legacy support)
        if ('attributes' in variantData && variantData.attributes) {
          for (const attr of variantData.attributes) {
            if (attr.groupType === 'color' && attr.colorId && !colorId) {
              colorId = attr.colorId;
            } else if (attr.groupType === 'size' && attr.sizeId && !sizeId) {
              sizeId = attr.sizeId;
            }
          }
        }

        const [insertedVariant] = await db.insert(productVariants).values({
          productId: product.id,
          sku: variantData.sku,
          price: variantData.price,
          salePrice: variantData.salePrice,
          inStock: variantData.inStock,
          backorderable: variantData.backorderable,
          weight: variantData.weight,
          colorId: colorId,
          sizeId: sizeId,
          specs: {},
        }).returning();

        // Create variant option assignments for custom attributes
        if ('attributes' in variantData && variantData.attributes) {
          for (const attr of variantData.attributes) {
            if (attr.groupType === 'custom') {
              const valueId = optionValueMap.get(attr.value);
              if (valueId) {
                await db.insert(variantOptionAssignments).values({
                  variantId: insertedVariant.id,
                  optionValueId: valueId,
                });
              }
            }
          }
        }
      }
    }

    // 8. Revalidate and return success
    revalidatePath('/admin/products');
    revalidatePath('/products');

    return {
      success: true,
      productId: product.id,
    };
  } catch (error) {
    console.error('Error creating product:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create product',
    };
  }
}

/**
 * Get product by ID for editing
 */
export async function getProductForEdit(productId: string) {
  try {
    // Fetch product with basic relations
    const product = await db.query.products.findFirst({
      where: (products, { eq, and, isNull }) => 
        and(eq(products.id, productId), isNull(products.deletedAt)),
      with: {
        brand: true,
        gender: true,
      },
    });

    if (!product) {
      return { success: false, error: 'Product not found' };
    }

    // Fetch categories separately
    const productCategories = await db.query.productToCategories.findMany({
      where: (ptc, { eq }) => eq(ptc.productId, productId),
      with: {
        category: true,
      },
    });

    // Fetch images separately
    const productImagesData = await db.query.productImages.findMany({
      where: (images, { eq, and, isNull }) => 
        and(eq(images.productId, productId), isNull(images.variantId)),
      orderBy: (images, { asc }) => [asc(images.sortOrder)],
    });

    // Fetch variants separately
    const productVariantsData = await db.query.productVariants.findMany({
      where: (variants, { eq, and, isNull }) => 
        and(eq(variants.productId, productId), isNull(variants.deletedAt)),
      with: {
        color: true,
        size: true,
      },
    });

    // Fetch variant options separately
    const productVariantOptionsData = await db.query.productVariantOptions.findMany({
      where: (pvo, { eq }) => eq(pvo.productId, productId),
      with: {
        group: true,
      },
      orderBy: (options, { asc }) => [asc(options.displayOrder)],
    });

    // Fetch option values for each group
    const variantGroups = await Promise.all(
      productVariantOptionsData.map(async (pvo) => {
        const values = await db.query.variantOptionValues.findMany({
          where: (values, { eq }) => eq(values.groupId, pvo.group.id),
          orderBy: (values, { asc }) => [asc(values.displayOrder)],
        });
        return {
          ...pvo,
          group: {
            ...pvo.group,
            values,
          },
        };
      })
    );

    // Transform data to match form structure
    const productMode = productVariantsData.length > 1 || variantGroups.length > 0 
      ? 'variable' 
      : 'simple';

    const categoryIds = productCategories.map(pc => pc.category.id);
    
    const images = productImagesData.map(img => ({
      id: img.id,
      url: img.url,
      altText: img.url,
      displayOrder: img.sortOrder,
      isPrimary: img.isPrimary,
    }));

    const attributeGroups = variantGroups.map(vo => ({
      id: vo.group.id,
      name: vo.group.name,
      type: vo.group.name.toLowerCase() === 'color' ? 'color' as const :
            vo.group.name.toLowerCase() === 'size' ? 'size' as const : 
            'custom' as const,
      options: vo.group.values.map(v => ({
        value: v.value,
        displayOrder: v.displayOrder,
        colorId: undefined,
        sizeId: undefined,
      })),
      displayOrder: vo.displayOrder,
    }));

    const variants = productVariantsData.map(v => {
      if (productMode === 'simple') {
        return {
          id: v.id,
          variantType: 'simple' as const,
          sku: v.sku,
          price: v.price,
          salePrice: v.salePrice || undefined,
          inStock: v.inStock,
          backorderable: v.backorderable,
        };
      } else {
        const attributes = [
          ...(v.color ? [{ 
            groupName: 'Color', 
            groupType: 'color' as const, 
            value: v.color.name,
            colorId: v.color.id,
          }] : []),
          ...(v.size ? [{
            groupName: 'Size',
            groupType: 'size' as const,
            value: v.size.name,
            sizeId: v.size.id,
          }] : []),
        ];

        return {
          id: v.id,
          variantType: 'variable' as const,
          combinationId: v.id,
          displayName: attributes.map(a => a.value).join(' / ') || v.sku,
          sku: v.sku,
          price: v.price,
          salePrice: v.salePrice || undefined,
          colorId: v.colorId || undefined,
          sizeId: v.sizeId || undefined,
          genderId: v.genderId || undefined,
          inStock: v.inStock,
          backorderable: v.backorderable,
          attributes,
          isEnabled: true,
        };
      }
    });

    return {
      success: true,
      data: {
        id: product.id,
        productMode,
        name: product.name,
        slug: product.slug,
        description: product.description || undefined,
        categoryIds,
        brandId: product.brandId || undefined,
        productType: product.productType,
        genderId: product.genderId || undefined,
        specs: product.specs || {},
        images,
        variants,
        attributeGroups: productMode === 'variable' ? attributeGroups : [],
        isPublished: product.isPublished,
        isBundle: product.isBundle,
        hazmat: product.hazmat,
        unNumber: product.unNumber || undefined,
        seoMetaTitle: product.seoMetaTitle || undefined,
        seoMetaDescription: product.seoMetaDescription || undefined,
      },
    };
  } catch (error) {
    console.error('Error fetching product for edit:', error);
    return { success: false, error: 'Failed to fetch product' };
  }
}

/**
 * Update an existing product
 */
export async function updateProduct(productId: string, input: CreateProductInput) {
  try {
    await verifyAdminRole();

    const validatedData = createProductFormSchema.parse(input);

    // Check slug availability (excluding current product)
    const slugCheck = await checkSlugAvailability(validatedData.slug, productId);
    if (!slugCheck.available) {
      return { success: false, error: 'Slug already exists' };
    }

    // Update product
    await db.update(products)
      .set({
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
      })
      .where(eq(products.id, productId));

    // Update categories
    await db.delete(productToCategories).where(eq(productToCategories.productId, productId));
    if (validatedData.categoryIds && validatedData.categoryIds.length > 0) {
      await db.insert(productToCategories).values(
        validatedData.categoryIds.map(categoryId => ({
          productId,
          categoryId,
        }))
      );
    }

    // Update images - delete existing and insert new
    await db.delete(productImages).where(eq(productImages.productId, productId));
    if (validatedData.images.length > 0) {
      await db.insert(productImages).values(
        validatedData.images.map((img, index) => ({
          productId,
          variantId: null,
          url: img.url,
          kind: 'image' as const,
          sortOrder: img.displayOrder ?? index,
          isPrimary: img.isPrimary ?? index === 0,
        }))
      );
    }

    // Safeguard: For variable products, ensure variants are provided before deleting existing ones
    if (validatedData.productMode === 'variable' && (!validatedData.variants || validatedData.variants.length === 0)) {
      return { 
        success: false, 
        error: 'Variable products must have at least one variant. Please generate variants before saving.' 
      };
    }

    // Hard delete existing variants (to avoid SKU unique constraint issues)
    await db.delete(productVariants)
      .where(eq(productVariants.productId, productId));

    // Insert updated variants (same logic as create)
    if (validatedData.productMode === 'simple') {
      const variantData = validatedData.variants[0];
      await db.insert(productVariants).values({
        productId,
        sku: variantData.sku,
        price: variantData.price,
        salePrice: variantData.salePrice,
        inStock: variantData.inStock,
        backorderable: variantData.backorderable,
        weight: variantData.weight,
        colorId: null,
        sizeId: null,
        specs: {},
      });
    } else {
      // Variable product logic - handle colorId/sizeId properly
      for (const variantData of validatedData.variants) {
        let colorId: string | null = null;
        let sizeId: string | null = null;

        // Extract colorId and sizeId directly from variant data (for variable products)
        if ('colorId' in variantData && variantData.colorId) {
          colorId = variantData.colorId;
        }
        if ('sizeId' in variantData && variantData.sizeId) {
          sizeId = variantData.sizeId;
        }

        // If not found directly, try to extract from attributes (legacy support)
        if ('attributes' in variantData && variantData.attributes) {
          for (const attr of variantData.attributes) {
            if (attr.groupType === 'color' && attr.colorId && !colorId) {
              colorId = attr.colorId;
            } else if (attr.groupType === 'size' && attr.sizeId && !sizeId) {
              sizeId = attr.sizeId;
            }
          }
        }

        await db.insert(productVariants).values({
          productId,
          sku: variantData.sku,
          price: variantData.price,
          salePrice: variantData.salePrice,
          inStock: variantData.inStock,
          backorderable: variantData.backorderable,
          weight: variantData.weight,
          colorId,
          sizeId,
          specs: {},
        });
      }
    }

    revalidatePath('/admin/products');
    revalidatePath(`/products/${validatedData.slug}`);

    return { success: true, productId };
  } catch (error) {
    console.error('Error updating product:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to update product' };
  }
}

/**
 * Get all variant option groups (for form dropdowns)
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
    const data = await db.query.categories.findMany({
      orderBy: (categories, { asc }) => [asc(categories.name)],
    });
    return { success: true, categories: data };
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
    const data = await db.query.brands.findMany({
      orderBy: (brands, { asc }) => [asc(brands.name)],
    });
    return { success: true, brands: data };
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
    const data = await db.query.colors.findMany({
      orderBy: (colors, { asc }) => [asc(colors.name)],
    });
    return { success: true, colors: data };
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
    const data = await db.query.sizes.findMany({
      orderBy: (sizes, { asc }) => [asc(sizes.sortOrder)],
    });
    return { success: true, sizes: data };
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
    const data = await db.query.genders.findMany({
      orderBy: (genders, { asc }) => [asc(genders.label)],
    });
    return { success: true, genders: data };
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
    const [categoriesResult, brandsResult, colorsResult, sizesResult, gendersResult] = await Promise.all([
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
    const slug = await generateUniqueSlug(name); // Use unique slug generator

    const [brand] = await db.insert(brands).values({
      name,
      slug,
      logoUrl: imageUrl || null, // Changed from imageUrl to logoUrl based on schema
    }).returning();

    revalidatePath('/admin/products');
    return { success: true, brand, message: 'Brand created successfully' };
  } catch (error) {
    console.error('Error creating brand:', error);
    return { success: false, error: 'Failed to create brand' };
  }
}

/**
 * Quick create category
 */
export async function quickCreateCategory(name: string, parentId?: string) {
  try {
    await verifyAdminRole();
    const slug = await generateUniqueSlug(name);

    const [category] = await db.insert(categories).values({
      name,
      slug,
      parentId: parentId || null,
    }).returning();

    revalidatePath('/admin/products');
    return { success: true, category, message: 'Category created successfully' };
  } catch (error) {
    console.error('Error creating category:', error);
    return { success: false, error: 'Failed to create category' };
  }
}
