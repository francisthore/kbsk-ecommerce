import { db } from '@/lib/db';
import { productVariants } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

const productId = '7dc6b46e-e5de-4107-af0f-9065f86c032e';

async function restoreVariants() {
  console.log('Restoring variants for product:', productId);
  
  // Update all variants to remove deletedAt
  const result = await db.update(productVariants)
    .set({ deletedAt: null })
    .where(eq(productVariants.productId, productId));
  
  console.log('✅ Variants restored!');
  
  // Verify
  const variants = await db.select().from(productVariants).where(eq(productVariants.productId, productId));
  console.log(`\n📊 Total variants: ${variants.length}`);
  variants.forEach((v, i) => {
    console.log(`\n${i + 1}. ${v.sku}`);
    console.log(`   Price: R${v.price}`);
    console.log(`   Color ID: ${v.colorId}`);
    console.log(`   Size ID: ${v.sizeId}`);
    console.log(`   Stock: ${v.inStock}`);
    console.log(`   Deleted: ${v.deletedAt ? 'YES' : 'NO'}`);
  });
  
  process.exit(0);
}

restoreVariants().catch(console.error);
