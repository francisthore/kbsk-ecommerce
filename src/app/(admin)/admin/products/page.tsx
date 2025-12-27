import Link from 'next/link';
import { Plus } from 'lucide-react';
import ProductsTable from '@/components/admin/ProductsTable';
import { getProducts } from '@/lib/actions/admin-data';

export default async function ProductsPage() {
  const result = await getProducts();
  const products = result.success && result.data ? result.data : [];

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
          href="/admin/products/create"
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
