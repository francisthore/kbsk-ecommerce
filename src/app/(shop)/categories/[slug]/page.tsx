import { db } from '@/lib/db';
import { categories } from '@/lib/db/schema';
import { eq, and, isNull } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import Card from '@/components/Card';
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
    <div>
      <h1>Category: {segments.join(' > ')}</h1>
      <div>
        {items.map((product: any) => (
          <Card key={product.id} title={product.name} imageSrc={product.image?.url} />
        ))}
      </div>
    </div>
  );
}
