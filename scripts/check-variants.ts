import { db } from '@/lib/db';
import { productVariants } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

const productId = '9ab64aed-fa8b-4a01-8f53-f712c25f90bf';

async function checkVariants() {
  console.log('Checking variants for product:', productId);
  
  // Check all variants (including soft-deleted)
  const allVariants = await db.select().from(productVariants).where(eq(productVariants.productId, productId));
  
  console.log('\n📊 Total variants in database:', allVariants.length);
  console.log('\n📋 All variants:');
  allVariants.forEach((v, i) => {
    console.log(`\n${i + 1}. Variant ID: ${v.id}`);
    console.log(`   SKU: ${v.sku}`);
    console.log(`   Price: ${v.price}`);
    console.log(`   Color ID: ${v.colorId}`);
    console.log(`   Size ID: ${v.sizeId}`);
    console.log(`   Stock: ${v.inStock}`);
    console.log(`   Deleted At: ${v.deletedAt}`);
  });
  
  process.exit(0);
}

checkVariants().catch(console.error);
