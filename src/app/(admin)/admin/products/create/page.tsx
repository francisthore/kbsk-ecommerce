import { getFormAttributes } from '@/lib/actions/product';
import MasterProductCreateForm from '@/components/admin/MasterProductCreateForm';

export const metadata = {
  title: 'Create Product | Admin Dashboard',
  description: 'Add a new product to your inventory',
};

export default async function CreateProductPage() {
  const attributesResult = await getFormAttributes();

  if (!attributesResult.success || !attributesResult.data) {
    return (
      <div className="p-8">
        <div className="rounded-lg bg-red-50 p-4 text-red-800">
          Failed to load form data. Please try refreshing the page.
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Create New Product</h1>
        <p className="mt-2 text-sm text-gray-600">
          Add a new product with variants, specifications, and media
        </p>
      </div>

      <MasterProductCreateForm attributes={attributesResult.data} />
    </div>
  );
}
