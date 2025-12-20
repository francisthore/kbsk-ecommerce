#!/usr/bin/env tsx
/**
 * Migration Script: Single Category → Multi-Category
 * 
 * This script migrates existing product category data from the old `category_id`
 * column to the new `product_to_categories` junction table.
 * 
 * Usage: npx tsx scripts/migrate-categories.ts
 */

import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { eq, isNotNull, count } from 'drizzle-orm';
import * as schema from '../src/lib/db/schema/index';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

interface MigrationStats {
  totalProducts: number;
  productsWithCategory: number;
  migrated: number;
  skipped: number;
  errors: number;
}

async function migrateCategories() {
  console.log('🚀 Starting category migration...\n');

  const stats: MigrationStats = {
    totalProducts: 0,
    productsWithCategory: 0,
    migrated: 0,
    skipped: 0,
    errors: 0,
  };

  try {
    // Step 1: Count total products
    console.log('📊 Gathering statistics...');
    const totalResult = await db
      .select({ count: count() })
      .from(schema.products);
    stats.totalProducts = totalResult[0]?.count || 0;
    console.log(`   Total products: ${stats.totalProducts}`);

    // Step 2: Fetch all products with category_id
    console.log('\n🔍 Fetching products with categories...');
    const productsWithCategories = await db
      .select({
        id: schema.products.id,
        name: schema.products.name,
        categoryId: schema.products.categoryId,
      })
      .from(schema.products)
      .where(isNotNull(schema.products.categoryId));

    stats.productsWithCategory = productsWithCategories.length;
    console.log(`   Found ${stats.productsWithCategory} products with categories\n`);

    if (stats.productsWithCategory === 0) {
      console.log('✅ No products to migrate. All done!');
      return stats;
    }

    // Step 3: Migrate each product
    console.log('🔄 Starting migration...\n');
    const batchSize = 10;
    
    for (let i = 0; i < productsWithCategories.length; i++) {
      const product = productsWithCategories[i];
      
      try {
        // Check if mapping already exists (in case script is run multiple times)
        const existing = await db
          .select()
          .from(schema.productToCategories)
          .where(eq(schema.productToCategories.productId, product.id))
          .limit(1);

        if (existing.length > 0) {
          stats.skipped++;
          console.log(`   ⏭️  Skipped: "${product.name}" (already migrated)`);
          continue;
        }

        // Insert into junction table
        await db
          .insert(schema.productToCategories)
          .values({
            productId: product.id,
            categoryId: product.categoryId!,
          });

        stats.migrated++;
        console.log(`   ✅ Migrated: "${product.name}" (${stats.migrated}/${stats.productsWithCategory})`);

      } catch (error) {
        stats.errors++;
        console.error(`   ❌ Error migrating "${product.name}":`, error);
      }

      // Progress update every batch
      if ((i + 1) % batchSize === 0) {
        console.log(`\n   Progress: ${i + 1}/${stats.productsWithCategory} processed\n`);
      }
    }

    // Step 4: Verification
    console.log('\n\n🔍 Verifying migration...');
    const junctionCount = await db
      .select({ count: count() })
      .from(schema.productToCategories);
    const migratedCount = junctionCount[0]?.count || 0;

    console.log(`   Products with categories: ${stats.productsWithCategory}`);
    console.log(`   Rows in junction table: ${migratedCount}`);

    // Step 5: Summary
    console.log('\n\n📋 Migration Summary');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`   Total products:          ${stats.totalProducts}`);
    console.log(`   Products with category:  ${stats.productsWithCategory}`);
    console.log(`   Successfully migrated:   ${stats.migrated}`);
    console.log(`   Skipped (already exist): ${stats.skipped}`);
    console.log(`   Errors:                  ${stats.errors}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    if (stats.migrated + stats.skipped === stats.productsWithCategory && stats.errors === 0) {
      console.log('✅ Migration completed successfully!\n');
      console.log('📝 Next steps:');
      console.log('   1. Verify data in database');
      console.log('   2. Update application code to use new table');
      console.log('   3. Test thoroughly');
      console.log('   4. Generate migration to drop category_id column');
      console.log('   5. Deploy changes\n');
    } else {
      console.warn('⚠️  Migration completed with warnings. Please review the errors above.\n');
    }

    return stats;

  } catch (error) {
    console.error('\n❌ Fatal error during migration:', error);
    throw error;
  }
}

// Run the migration
migrateCategories()
  .then(() => {
    console.log('🎉 Migration script finished.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Migration script failed:', error);
    process.exit(1);
  });
