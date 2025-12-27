"use server";

import { db } from "@/lib/db";
import { brands, categories, colors, sizes, genders, products, productToCategories } from "@/lib/db/schema";
import { eq, sql, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

// Helper to check if user is admin
async function requireAdmin() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user || session.user.role !== "admin") {
    throw new Error("Unauthorized: Admin access required");
  }

  return session.user;
}

// Helper to generate slug from name
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

// =============================================================================
// BRANDS ACTIONS
// =============================================================================

export async function getBrands() {
  try {
    const brandsWithCount = await db
      .select({
        id: brands.id,
        name: brands.name,
        slug: brands.slug,
        logoUrl: brands.logoUrl,
        website: brands.website,
        createdAt: brands.createdAt,
        productCount: sql<number>`count(${products.id})::int`,
      })
      .from(brands)
      .leftJoin(products, eq(brands.id, products.brandId))
      .groupBy(brands.id)
      .orderBy(desc(brands.createdAt));

    return { success: true, data: brandsWithCount };
  } catch (error) {
    console.error("Error fetching brands:", error);
    return { success: false, error: "Failed to fetch brands" };
  }
}

export async function createBrand(data: {
  name: string;
  logoUrl?: string;
  website?: string;
}) {
  try {
    await requireAdmin();

    const slug = generateSlug(data.name);

    // Check for existing slug
    const existing = await db.query.brands.findFirst({
      where: eq(brands.slug, slug),
    });

    if (existing) {
      return { success: false, error: "A brand with this name already exists" };
    }

    const [newBrand] = await db
      .insert(brands)
      .values({
        name: data.name,
        slug,
        logoUrl: data.logoUrl || null,
        website: data.website || null,
      })
      .returning();

    revalidatePath("/admin/brands");
    return { success: true, data: newBrand };
  } catch (error: unknown) {
    console.error("Error creating brand:", error);
    return { success: false, error: error instanceof Error ? error instanceof Error ? error.message : "Unknown error" : "Failed to create brand" };
  }
}

export async function updateBrand(
  id: string,
  data: {
    name: string;
    logoUrl?: string;
    website?: string;
  }
) {
  try {
    await requireAdmin();

    const slug = generateSlug(data.name);

    // Check for existing slug (excluding current brand)
    const existing = await db.query.brands.findFirst({
      where: eq(brands.slug, slug),
    });

    if (existing && existing.id !== id) {
      return { success: false, error: "A brand with this name already exists" };
    }

    const [updatedBrand] = await db
      .update(brands)
      .set({
        name: data.name,
        slug,
        logoUrl: data.logoUrl || null,
        website: data.website || null,
        updatedAt: new Date(),
      })
      .where(eq(brands.id, id))
      .returning();

    if (!updatedBrand) {
      return { success: false, error: "Brand not found" };
    }

    revalidatePath("/admin/brands");
    return { success: true, data: updatedBrand };
  } catch (error: unknown) {
    console.error("Error updating brand:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to update brand" };
  }
}

export async function deleteBrand(id: string) {
  try {
    await requireAdmin();

    // Check if brand has products
    const [productCount] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(products)
      .where(eq(products.brandId, id));

    if (productCount.count > 0) {
      return {
        success: false,
        error: `Cannot delete brand with ${productCount.count} associated products`,
      };
    }

    await db.delete(brands).where(eq(brands.id, id));

    revalidatePath("/admin/brands");
    return { success: true };
  } catch (error: unknown) {
    console.error("Error deleting brand:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to delete brand" };
  }
}

// =============================================================================
// CATEGORIES ACTIONS
// =============================================================================

export async function getCategories() {
  try {
    const allCategories = await db.query.categories.findMany({
      orderBy: [categories.name],
    });

    // Get product counts for each category from junction table
    const categoriesWithCount = await Promise.all(
      allCategories.map(async (category) => {
        const [productCount] = await db
          .select({ count: sql<number>`count(*)::int` })
          .from(productToCategories)
          .where(eq(productToCategories.categoryId, category.id));

        // Find parent name
        let parentName = null;
        if (category.parentId) {
          const parent = allCategories.find((c) => c.id === category.parentId);
          parentName = parent?.name || null;
        }

        return {
          ...category,
          parentName,
          productCount: productCount.count,
        };
      })
    );

    return { success: true, data: categoriesWithCount };
  } catch (error) {
    console.error("Error fetching categories:", error);
    return { success: false, error: "Failed to fetch categories" };
  }
}

export async function createCategory(data: {
  name: string;
  description?: string;
  imageUrl?: string;
  parentId?: string | null;
  seoMetaTitle?: string;
  seoMetaDescription?: string;
}) {
  try {
    await requireAdmin();

    const slug = generateSlug(data.name);

    // Check for existing slug
    const existing = await db.query.categories.findFirst({
      where: eq(categories.slug, slug),
    });

    if (existing) {
      return {
        success: false,
        error: "A category with this name already exists",
      };
    }

    const [newCategory] = await db
      .insert(categories)
      .values({
        name: data.name,
        slug,
        description: data.description || null,
        imageUrl: data.imageUrl || null,
        parentId: data.parentId || null,
        seoMetaTitle: data.seoMetaTitle || null,
        seoMetaDescription: data.seoMetaDescription || null,
      })
      .returning();

    revalidatePath("/admin/categories");
    return { success: true, data: newCategory };
  } catch (error: unknown) {
    console.error("Error creating category:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create category",
    };
  }
}

export async function updateCategory(
  id: string,
  data: {
    name: string;
    description?: string;
    imageUrl?: string;
    parentId?: string | null;
    seoMetaTitle?: string;
    seoMetaDescription?: string;
  }
) {
  try {
    await requireAdmin();

    const slug = generateSlug(data.name);

    // Check for existing slug (excluding current category)
    const existing = await db.query.categories.findFirst({
      where: eq(categories.slug, slug),
    });

    if (existing && existing.id !== id) {
      return {
        success: false,
        error: "A category with this name already exists",
      };
    }

    // Prevent circular references
    if (data.parentId === id) {
      return {
        success: false,
        error: "A category cannot be its own parent",
      };
    }

    const [updatedCategory] = await db
      .update(categories)
      .set({
        name: data.name,
        slug,
        description: data.description || null,
        imageUrl: data.imageUrl || null,
        parentId: data.parentId || null,
        seoMetaTitle: data.seoMetaTitle || null,
        seoMetaDescription: data.seoMetaDescription || null,
      })
      .where(eq(categories.id, id))
      .returning();

    if (!updatedCategory) {
      return { success: false, error: "Category not found" };
    }

    revalidatePath("/admin/categories");
    return { success: true, data: updatedCategory };
  } catch (error: unknown) {
    console.error("Error updating category:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update category",
    };
  }
}

export async function deleteCategory(id: string) {
  try {
    await requireAdmin();

    // Check if category has products (via junction table)
    const [productCount] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(productToCategories)
      .where(eq(productToCategories.categoryId, id));

    if (productCount.count > 0) {
      return {
        success: false,
        error: `Cannot delete category with ${productCount.count} associated products`,
      };
    }

    // Check if category has child categories
    const [childCount] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(categories)
      .where(eq(categories.parentId, id));

    if (childCount.count > 0) {
      return {
        success: false,
        error: `Cannot delete category with ${childCount.count} subcategories`,
      };
    }

    await db.delete(categories).where(eq(categories.id, id));

    revalidatePath("/admin/categories");
    return { success: true };
  } catch (error: unknown) {
    console.error("Error deleting category:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete category",
    };
  }
}

// =============================================================================
// COLORS ACTIONS
// =============================================================================

export async function getColors() {
  try {
    const allColors = await db.query.colors.findMany({
      orderBy: [colors.name],
    });

    return { success: true, data: allColors };
  } catch (error) {
    console.error("Error fetching colors:", error);
    return { success: false, error: "Failed to fetch colors" };
  }
}

export async function createColor(data: {
  name: string;
  hexCode: string;
}) {
  try {
    await requireAdmin();

    const slug = generateSlug(data.name);

    // Check for existing slug
    const existing = await db.query.colors.findFirst({
      where: eq(colors.slug, slug),
    });

    if (existing) {
      return { success: false, error: "A color with this name already exists" };
    }

    const [newColor] = await db
      .insert(colors)
      .values({
        name: data.name,
        slug,
        hexCode: data.hexCode,
      })
      .returning();

    revalidatePath("/admin/attributes");
    return { success: true, data: newColor };
  } catch (error: unknown) {
    console.error("Error creating color:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to create color" };
  }
}

export async function updateColor(
  id: string,
  data: {
    name: string;
    hexCode: string;
  }
) {
  try {
    await requireAdmin();

    const slug = generateSlug(data.name);

    // Check for existing slug (excluding current color)
    const existing = await db.query.colors.findFirst({
      where: eq(colors.slug, slug),
    });

    if (existing && existing.id !== id) {
      return { success: false, error: "A color with this name already exists" };
    }

    const [updatedColor] = await db
      .update(colors)
      .set({
        name: data.name,
        slug,
        hexCode: data.hexCode,
      })
      .where(eq(colors.id, id))
      .returning();

    if (!updatedColor) {
      return { success: false, error: "Color not found" };
    }

    revalidatePath("/admin/attributes");
    return { success: true, data: updatedColor };
  } catch (error: unknown) {
    console.error("Error updating color:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to update color" };
  }
}

export async function deleteColor(id: string) {
  try {
    await requireAdmin();

    await db.delete(colors).where(eq(colors.id, id));

    revalidatePath("/admin/attributes");
    return { success: true };
  } catch (error: unknown) {
    console.error("Error deleting color:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to delete color" };
  }
}

// =============================================================================
// SIZES ACTIONS
// =============================================================================

export async function getSizes() {
  try {
    const allSizes = await db.query.sizes.findMany({
      orderBy: [sizes.sortOrder],
    });

    return { success: true, data: allSizes };
  } catch (error) {
    console.error("Error fetching sizes:", error);
    return { success: false, error: "Failed to fetch sizes" };
  }
}

export async function createSize(data: {
  name: string;
  sortOrder: number;
}) {
  try {
    await requireAdmin();

    const slug = generateSlug(data.name);

    // Check for existing slug
    const existing = await db.query.sizes.findFirst({
      where: eq(sizes.slug, slug),
    });

    if (existing) {
      return { success: false, error: "A size with this name already exists" };
    }

    const [newSize] = await db
      .insert(sizes)
      .values({
        name: data.name,
        slug,
        sortOrder: data.sortOrder,
      })
      .returning();

    revalidatePath("/admin/attributes");
    return { success: true, data: newSize };
  } catch (error: unknown) {
    console.error("Error creating size:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to create size" };
  }
}

export async function updateSize(
  id: string,
  data: {
    name: string;
    sortOrder: number;
  }
) {
  try {
    await requireAdmin();

    const slug = generateSlug(data.name);

    // Check for existing slug (excluding current size)
    const existing = await db.query.sizes.findFirst({
      where: eq(sizes.slug, slug),
    });

    if (existing && existing.id !== id) {
      return { success: false, error: "A size with this name already exists" };
    }

    const [updatedSize] = await db
      .update(sizes)
      .set({
        name: data.name,
        slug,
        sortOrder: data.sortOrder,
      })
      .where(eq(sizes.id, id))
      .returning();

    if (!updatedSize) {
      return { success: false, error: "Size not found" };
    }

    revalidatePath("/admin/attributes");
    return { success: true, data: updatedSize };
  } catch (error: unknown) {
    console.error("Error updating size:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to update size" };
  }
}

export async function deleteSize(id: string) {
  try {
    await requireAdmin();

    await db.delete(sizes).where(eq(sizes.id, id));

    revalidatePath("/admin/attributes");
    return { success: true };
  } catch (error: unknown) {
    console.error("Error deleting size:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to delete size" };
  }
}

// =============================================================================
// GENDERS ACTIONS
// =============================================================================

export async function getGenders() {
  try {
    const allGenders = await db.query.genders.findMany({
      orderBy: [genders.label],
    });

    return { success: true, data: allGenders };
  } catch (error) {
    console.error("Error fetching genders:", error);
    return { success: false, error: "Failed to fetch genders" };
  }
}

export async function createGender(data: { label: string }) {
  try {
    await requireAdmin();

    const slug = generateSlug(data.label);

    // Check for existing slug
    const existing = await db.query.genders.findFirst({
      where: eq(genders.slug, slug),
    });

    if (existing) {
      return {
        success: false,
        error: "A gender with this label already exists",
      };
    }

    const [newGender] = await db
      .insert(genders)
      .values({
        label: data.label,
        slug,
      })
      .returning();

    revalidatePath("/admin/attributes");
    return { success: true, data: newGender };
  } catch (error: unknown) {
    console.error("Error creating gender:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create gender",
    };
  }
}

export async function updateGender(id: string, data: { label: string }) {
  try {
    await requireAdmin();

    const slug = generateSlug(data.label);

    // Check for existing slug (excluding current gender)
    const existing = await db.query.genders.findFirst({
      where: eq(genders.slug, slug),
    });

    if (existing && existing.id !== id) {
      return {
        success: false,
        error: "A gender with this label already exists",
      };
    }

    const [updatedGender] = await db
      .update(genders)
      .set({
        label: data.label,
        slug,
      })
      .where(eq(genders.id, id))
      .returning();

    if (!updatedGender) {
      return { success: false, error: "Gender not found" };
    }

    revalidatePath("/admin/attributes");
    return { success: true, data: updatedGender };
  } catch (error: unknown) {
    console.error("Error updating gender:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update gender",
    };
  }
}

export async function deleteGender(id: string) {
  try {
    await requireAdmin();

    await db.delete(genders).where(eq(genders.id, id));

    revalidatePath("/admin/attributes");
    return { success: true };
  } catch (error: unknown) {
    console.error("Error deleting gender:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete gender",
    };
  }
}

// =============================================================================
// PRODUCTS ACTIONS
// =============================================================================

export async function getProducts() {
  try {
    const allProducts = await db.query.products.findMany({
      with: {
        brand: true,
        categories: {
          with: {
            category: true,
          },
        },
        variants: {
          limit: 1,
          orderBy: (variants, { asc }) => [asc(variants.createdAt)],
        },
      },
      where: (products, { isNull }) => isNull(products.deletedAt),
      orderBy: (products, { desc }) => [desc(products.createdAt)],
      limit: 100,
    });

    return { success: true, data: allProducts };
  } catch (error) {
    console.error("Error fetching products:", error);
    return { success: false, error: "Failed to fetch products" };
  }
}
