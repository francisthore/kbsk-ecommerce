import { getCategories, getBrands, getVariantOptionGroups } from '@/lib/actions/product';
import ProductForm from '@/components/admin/ProductForm';

export default async function NewProductPage() {
  const [categoriesResult, brandsResult, optionGroupsResult] = await Promise.all([
    getCategories(),
    getBrands(),
    getVariantOptionGroups(),
  ]);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Add New Product</h1>
        <p className="mt-2 text-sm text-gray-600">
          Create a new product with variants and specifications
        </p>
      </div>

      <div className="rounded-lg bg-white shadow p-6">
        <ProductForm
          categories={categoriesResult.success ? categoriesResult.categories : []}
          brands={brandsResult.success ? brandsResult.brands : []}
          optionGroups={optionGroupsResult.success ? optionGroupsResult.groups : []}
        />
      </div>
    </div>
  );
}
