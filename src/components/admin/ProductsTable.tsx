'use client';

import Link from 'next/link';
import { Edit, Trash2 } from 'lucide-react';
import { formatProductPrice } from '@/lib/utils/product';

interface Product {
  id: string;
  name: string;
  slug: string;
  isPublished: boolean;
  brand?: { name: string } | null;
  categories?: Array<{
    category: { name: string };
  }>;
  variants: Array<{
    price: string;
    inStock: number;
  }>;
}

interface ProductsTableProps {
  products: Product[];
}

export default function ProductsTable({ products }: ProductsTableProps) {
  if (products.length === 0) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-500">No products found. Create your first product to get started.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="border-b border-gray-200 bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Product
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Category
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Brand
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Price
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Stock
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {products.map((product) => (
            <tr key={product.id} className="hover:bg-gray-50">
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="text-sm font-medium text-gray-900">
                    {product.name}
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 text-sm text-gray-500">
                {product.categories && product.categories.length > 0
                  ? product.categories.map(c => c.category.name).join(', ')
                  : '—'}
              </td>
              <td className="px-6 py-4 text-sm text-gray-500">
                {product.brand?.name || '—'}
              </td>
              <td className="px-6 py-4 text-sm text-gray-900">
                {product.variants[0] ? formatProductPrice(product.variants[0].price) : '—'}
              </td>
              <td className="px-6 py-4 text-sm text-gray-900">
                {product.variants[0]?.inStock || 0}
              </td>
              <td className="px-6 py-4">
                <span
                  className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                    product.isPublished
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {product.isPublished ? 'Published' : 'Draft'}
                </span>
              </td>
              <td className="px-6 py-4 text-right text-sm font-medium">
                <div className="flex items-center justify-end gap-2">
                  <Link
                    href={`/admin/products/${product.id}/edit`}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    <Edit className="h-4 w-4" />
                  </Link>
                  <button className="text-red-600 hover:text-red-900">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
