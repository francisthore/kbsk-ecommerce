# 🔄 Multi-Category Migration Guide

## Overview
This guide walks you through upgrading the product schema from **single category** to **multi-category** support without losing any data.

---

## ⚠️ Pre-Migration Checklist

- [ ] **Backup your database** (critical!)
- [ ] Verify you have a `.env.local` file with `DATABASE_URL`
- [ ] Ensure no production traffic during migration
- [ ] Review all schema changes below

---

## 📋 Migration Steps (Execute in Order)

### Step 1: Push New Schema to Database

Generate and apply the schema changes to create the new `product_to_categories` table:

```bash
# Generate migration
npx drizzle-kit generate

# Review the generated migration in drizzle/ folder
# It should create the product_to_categories table

# Apply migration to database
npx drizzle-kit push
```

**Expected outcome:**
- New table `product_to_categories` created
- Composite primary key on (`product_id`, `category_id`)
- Indexes created for both columns
- Old `category_id` column still exists in `products` table

---

### Step 2: Run Data Migration Script

Execute the migration script to copy data from `products.category_id` to `product_to_categories`:

```bash
npx tsx scripts/migrate-categories.ts
```

**What the script does:**
1. Connects to your database
2. Finds all products with `category_id` set
3. Creates corresponding rows in `product_to_categories`
4. Handles duplicates (safe to run multiple times)
5. Provides progress updates
6. Verifies data integrity

**Expected output:**
```
🚀 Starting category migration...

📊 Gathering statistics...
   Total products: 150

🔍 Fetching products with categories...
   Found 145 products with categories

🔄 Starting migration...

   ✅ Migrated: "Cordless Drill" (1/145)
   ✅ Migrated: "Hammer" (2/145)
   ...

📋 Migration Summary
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Total products:          150
   Products with category:  145
   Successfully migrated:   145
   Skipped (already exist): 0
   Errors:                  0
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ Migration completed successfully!
```

---

### Step 3: Verify Data Integrity

Connect to your database and verify the migration:

```sql
-- Check total rows in junction table
SELECT COUNT(*) FROM product_to_categories;

-- Compare with products that have categories
SELECT COUNT(*) FROM products WHERE category_id IS NOT NULL;

-- Sample verification: Check specific products
SELECT 
  p.name,
  p.category_id as old_category,
  ptc.category_id as new_category,
  c.name as category_name
FROM products p
LEFT JOIN product_to_categories ptc ON p.id = ptc.product_id
LEFT JOIN categories c ON ptc.category_id = c.id
LIMIT 10;

-- Check for orphaned mappings (should return 0)
SELECT COUNT(*) 
FROM product_to_categories ptc
LEFT JOIN products p ON ptc.product_id = p.id
WHERE p.id IS NULL;
```

**Expected results:**
- Row counts match between old and new tables
- All products with `category_id` have corresponding rows in junction table
- No orphaned records

---

### Step 4: Update Application Code

Update your queries to use the new many-to-many relationship:

#### Before (Single Category):
```typescript
// Fetching products with category
const products = await db.query.products.findMany({
  with: {
    category: true, // Old single relation
  }
});

// Creating a product
await db.insert(products).values({
  name: 'New Product',
  categoryId: 'category-uuid', // Old column
  // ...
});
```

#### After (Multi-Category):
```typescript
// Fetching products with categories
const products = await db.query.products.findMany({
  with: {
    categories: {
      with: {
        category: true, // New many-to-many relation
      }
    }
  }
});

// Creating a product with categories
const [product] = await db.insert(products).values({
  name: 'New Product',
  // categoryId is no longer used
  // ...
}).returning();

// Add categories separately
await db.insert(productToCategories).values([
  { productId: product.id, categoryId: 'category-uuid-1' },
  { productId: product.id, categoryId: 'category-uuid-2' },
]);
```

#### Helper Function for Backward Compatibility:
```typescript
// src/lib/db/helpers/products.ts
export async function getProductWithCategories(productId: string) {
  const product = await db.query.products.findFirst({
    where: eq(products.id, productId),
    with: {
      categories: {
        with: {
          category: true,
        }
      },
      brand: true,
      images: true,
      variants: true,
    }
  });

  // Transform to include categories array
  return product ? {
    ...product,
    categoryList: product.categories.map(pc => pc.category),
  } : null;
}
```

---

### Step 5: Test Everything

Run comprehensive tests:

```bash
# Run your test suite
npm test

# Manual testing checklist:
# - [ ] Create new product with multiple categories
# - [ ] View product details page (categories display correctly)
# - [ ] Filter products by category
# - [ ] Edit product categories
# - [ ] Delete a product (junction rows cascade delete)
# - [ ] Admin dashboard category management
```

---

### Step 6: Remove Old Category Column

Once everything is working and tested in production:

#### A. Remove from Schema

Edit [src/lib/db/schema/products.ts](src/lib/db/schema/products.ts):

```typescript
// REMOVE these lines:
categoryId: uuid('category_id').references(() => categories.id, { onDelete: 'set null' }),

// REMOVE from relations:
category: one(categories, {
  fields: [products.categoryId],
  references: [categories.id],
}),

// REMOVE from insertProductSchema:
categoryId: z.string().uuid().optional().nullable(),
```

#### B. Generate Drop Column Migration

```bash
# Generate new migration
npx drizzle-kit generate

# This will create a migration to drop the category_id column
# Review it carefully before applying!

# Apply the migration
npx drizzle-kit push
```

#### C. Verify Column is Dropped

```sql
-- Check products table structure
\d products

-- The category_id column should no longer exist
```

---

## 🚨 Rollback Plan (If Needed)

If you need to rollback before dropping the column:

1. **Stop the application**
2. **The old `category_id` column is still intact** - just revert code changes
3. **Delete junction table data** (optional):
   ```sql
   TRUNCATE TABLE product_to_categories;
   ```
4. **Restore previous code** from git
5. **Restart application**

After dropping the column, rollback becomes more complex and requires database restore.

---

## 📊 Database Schema Comparison

### Old Schema (Single Category)
```
products
  ├── id
  ├── name
  ├── category_id  ← Foreign key to categories
  └── ...

categories
  ├── id
  └── name
```

### New Schema (Multi-Category)
```
products                    product_to_categories           categories
  ├── id ─────────────────── product_id                      ├── id
  ├── name                   category_id ───────────────────  └── name
  └── ...                    (composite PK)
```

---

## 🎯 Benefits After Migration

✅ **Multi-category support** - Products can belong to multiple categories  
✅ **Better taxonomy** - "Cordless Drill" can be in both "Drills" and "Power Tools"  
✅ **Flexible filtering** - Users can filter by any combination of categories  
✅ **SEO improvements** - Products appear in multiple category pages  
✅ **Future-proof** - Enables advanced features like category hierarchies

---

## 📞 Troubleshooting

### Issue: Migration script fails with "duplicate key"
**Solution:** Safe to ignore - means data already migrated. Script will skip duplicates.

### Issue: Row counts don't match
**Solution:** 
1. Check for NULL category_id values (expected)
2. Verify junction table constraints
3. Run verification queries from Step 3

### Issue: Application errors after code update
**Solution:**
1. Check if you're using `product.category` instead of `product.categories`
2. Ensure all queries are updated to use new relation
3. Clear any cached queries

### Issue: Can't drop category_id column
**Solution:**
1. Verify no code is still using `categoryId`
2. Check for active database connections
3. Remove foreign key constraint first if needed

---

## ✅ Final Checklist

- [ ] Database backed up
- [ ] New table created successfully
- [ ] Migration script completed without errors
- [ ] Data verification passed
- [ ] All application code updated
- [ ] Tests pass
- [ ] Production testing completed
- [ ] Old column removed
- [ ] Documentation updated
- [ ] Team notified of changes

---

## 📚 Related Files

- Schema: [src/lib/db/schema/productToCategories.ts](src/lib/db/schema/productToCategories.ts)
- Migration Script: [scripts/migrate-categories.ts](scripts/migrate-categories.ts)
- Products Schema: [src/lib/db/schema/products.ts](src/lib/db/schema/products.ts)
- Categories Schema: [src/lib/db/schema/categories.ts](src/lib/db/schema/categories.ts)

---

**Need help?** Review the migration script logs and verification queries. The script is idempotent and safe to run multiple times.
