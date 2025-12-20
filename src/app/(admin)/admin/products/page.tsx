import Link from 'next/link';
import { Plus } from 'lucide-react';
import { db } from '@/lib/db';
import ProductsTable from '@/components/admin/ProductsTable';

async function getProducts() {
  const products = await db.query.products.findMany({
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

  return products;
}

export default async function ProductsPage() {
  const products = await getProducts();

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Products</h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage your product catalog
          </p>
        </div>
        <Link
          href="/admin/products/new"
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-5 w-5" />
          Add Product
        </Link>
      </div>

      <div className="rounded-lg bg-white shadow">
        <ProductsTable products={products} />
      </div>
    </div>
  );
}
