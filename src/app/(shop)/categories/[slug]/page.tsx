import { db } from '@/lib/db';
import { categories } from '@/lib/db/schema';
import { eq, and, isNull } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import ProductCard from '@/components/ProductCard';
import { getProductsByCategory } from '@/lib/db/queries/products';

export default async function CategoryPage({ params, searchParams }: any) {
  let { segments } = params;
  const { page = '1', pageSize = '12', sort = 'newest' } = searchParams || {};

  if (!Array.isArray(segments)) segments = [segments];

  // Resolve category by segments
  let parentId: string | null = null;
  for (const slug of segments) {
    let category;
    if (parentId === null) {
      category = await db.query.categories.findFirst({ where: and(eq(categories.slug, slug), isNull(categories.parentId)) });
    } else {
      category = await db.query.categories.findFirst({ where: and(eq(categories.slug, slug), eq(categories.parentId, parentId)) });
    }
    if (!category) return notFound();
    parentId = category.id;
  }

  const pageNum = Number(page) || 1;
  const pageSizeNum = Number(pageSize) || 12;

  const { items, total } = await getProductsByCategory(parentId as string, pageNum, pageSizeNum, sort);

  return (
    <div className="mx-auto w-[90%] px-4 py-8">
      <h1 className="text-heading-2 mb-8 text-dark-900">Category: {segments.join(' > ')}</h1>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {items.map((product: any) => (
          <ProductCard 
            key={product.id} 
            title={product.name} 
            description={product.description || ''}
            imageSrc={product.image?.url || '/placeholder-product.svg'}
            price={product.minPrice}
            maxPrice={product.maxPrice}
            originalPrice={
              product.onSale && product.maxPrice > product.minPrice
                ? product.maxPrice
                : undefined
            }
            badge={
              product.onSale
                ? ("Sale" as const)
                : !product.inStock
                  ? ("Limited" as const)
                  : undefined
            }
            href={`/products/${product.slug}`}
            colorCount={product.colorCount}
            sizeCount={product.sizeCount}
          />
        ))}
      </div>
    </div>
  );
}
