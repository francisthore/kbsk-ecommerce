import { notFound } from 'next/navigation';
import { getFormAttributes, getProductForEdit } from '@/lib/actions/product';
import MasterProductCreateForm from '@/components/admin/MasterProductCreateForm';

export const metadata = {
  title: 'Edit Product | Admin Dashboard',
  description: 'Update product details',
};

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditProductPage({ params }: PageProps) {
  const { id } = await params;
  
  const [attributesResult, productResult] = await Promise.all([
    getFormAttributes(),
    getProductForEdit(id),
  ]);

  if (!attributesResult.success || !attributesResult.data) {
    return (
      <div className="p-8">
        <div className="rounded-lg bg-red-50 p-4 text-red-800">
          Failed to load form data. Please try refreshing the page.
        </div>
      </div>
    );
  }

  if (!productResult.success || !productResult.data) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-7xl p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Edit Product</h1>
        <p className="mt-2 text-sm text-gray-600">
          Update product details, variants, specifications, and media
        </p>
        <p className="mt-1 text-xs text-gray-500">
          Product ID: <code className="bg-gray-100 px-2 py-0.5 rounded">{id}</code>
        </p>
      </div>

      <MasterProductCreateForm 
        attributes={attributesResult.data} 
        initialData={productResult.data}
        mode="edit"
      />
    </div>
  );
}
