'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray, type UseFormRegister, type Control, type FieldErrors } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Trash2, Loader2 } from 'lucide-react';
import { createProduct } from '@/lib/actions/product';
import { createProductFormSchema, type CreateProductInput } from '@/lib/validations/product';
import { generateSlug, generateVariantPermutations, type VariantOptionGroup } from '@/lib/utils/product';
import { cn } from '@/lib/utils';

interface ProductFormProps {
  categories: Array<{ id: string; name: string }>;
  brands: Array<{ id: string; name: string }>;
  optionGroups: Array<{
    id: string;
    name: string;
    values: Array<{ id: string; value: string }>;
  }>;
}

type FormData = CreateProductInput;

export default function ProductForm({ categories, brands, optionGroups }: ProductFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [slugEdited, setSlugEdited] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    formState: { errors },
  } = useForm<CreateProductInput>({
    resolver: zodResolver(createProductFormSchema),
    defaultValues: {
      name: '',
      slug: '',
      description: '',
      productType: 'tool',
      isPublished: false,
      isBundle: false,
      hazmat: false,
      images: [],
      variantOptions: [],
      variants: [
        {
          sku: '',
          price: '',
          inStock: 0,
          backorderable: false,
          optionValues: [],
        },
      ],
    },
  });

  const { fields: imageFields, append: appendImage, remove: removeImage } = useFieldArray({
    control,
    name: 'images',
  });

  const { fields: optionFields, append: appendOption, remove: removeOption } = useFieldArray({
    control,
    name: 'variantOptions',
  });

  const { fields: variantFields, remove: removeVariant, replace: replaceVariants } = useFieldArray({
    control,
    name: 'variants',
  });

  // Watch form values
  const productName = watch('name');
  const slug = watch('slug');
  const selectedOptions = watch('variantOptions');

  // Auto-generate slug from name
  useEffect(() => {
    if (productName && !slugEdited) {
      setValue('slug', generateSlug(productName));
    }
  }, [productName, slugEdited, setValue]);

  // Generate variant permutations when options change
  useEffect(() => {
    if (selectedOptions && selectedOptions.length > 0) {
      const optionGroups: VariantOptionGroup[] = selectedOptions.map(opt => ({
        groupId: opt.id || `temp-${Math.random()}`,
        groupName: opt.name,
        values: opt.values.map(val => ({
          valueId: val.id || `temp-${Math.random()}`,
          value: val.value,
        })),
      }));

      const permutations = generateVariantPermutations(productName || 'Product', optionGroups);
      
      const newVariants = permutations.map(perm => ({
        sku: perm.sku,
        price: '',
        salePrice: '',
        inStock: 0,
        backorderable: false,
        optionValues: perm.options.map(opt => ({
          groupId: opt.groupId,
          valueId: opt.valueId,
        })),
      }));

      replaceVariants(newVariants);
    }
  }, [selectedOptions, productName, replaceVariants]);

  const onSubmit = async (data: CreateProductInput) => {
    try {
      setIsSubmitting(true);

      const result = await createProduct(data);

      if (result.success) {
        router.push('/admin/products');
        router.refresh();
      } else {
        alert(result.error || 'Failed to create product');
      }
    } catch (error) {
      console.error('Form submission error:', error);
      alert('An error occurred while creating the product');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Basic Information */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Product Name *
            </label>
            <input
              type="text"
              {...register('name')}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
              placeholder="Enter product name"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Slug *
            </label>
            <input
              type="text"
              {...register('slug')}
              onChange={(e) => {
                setSlugEdited(true);
                register('slug').onChange(e);
              }}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
              placeholder="product-url-slug"
            />
            {errors.slug && (
              <p className="mt-1 text-sm text-red-600">{errors.slug.message}</p>
            )}
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              {...register('description')}
              rows={4}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
              placeholder="Enter product description"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              {...register('categoryId')}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
            >
              <option value="">Select category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Brand
            </label>
            <select
              {...register('brandId')}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
            >
              <option value="">Select brand</option>
              {brands.map((brand) => (
                <option key={brand.id} value={brand.id}>
                  {brand.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Product Type
            </label>
            <select
              {...register('productType')}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
            >
              <option value="tool">Tool</option>
              <option value="accessory">Accessory</option>
              <option value="consumable">Consumable</option>
              <option value="ppe">PPE</option>
            </select>
          </div>
        </div>
      </section>

      {/* Images */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Product Images *</h2>
        <div className="space-y-3">
          {imageFields.map((field, index) => (
            <div key={field.id} className="flex gap-3 items-start">
              <input
                type="text"
                {...register(`images.${index}.url`)}
                className="flex-1 rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                placeholder="Image URL"
              />
              <input
                type="text"
                {...register(`images.${index}.altText`)}
                className="flex-1 rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                placeholder="Alt text (optional)"
              />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="rounded-lg border border-red-300 px-3 py-2 text-red-600 hover:bg-red-50"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => appendImage({ url: '', altText: '', displayOrder: imageFields.length, isPrimary: imageFields.length === 0 })}
            className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
          >
            <Plus className="h-4 w-4" />
            Add Image
          </button>
          {errors.images && (
            <p className="text-sm text-red-600">{errors.images.message}</p>
          )}
        </div>
      </section>

      {/* Variant Options */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Variant Options</h2>
        <p className="text-sm text-gray-600 mb-4">
          Add option groups (e.g., Color, Size) to create product variants automatically.
        </p>
        <div className="space-y-4">
          {optionFields.map((field, optionIndex) => (
            <VariantOptionGroup
              key={field.id}
              index={optionIndex}
              register={register}
              control={control}
              errors={errors}
              onRemove={() => removeOption(optionIndex)}
            />
          ))}
          <button
            type="button"
            onClick={() => appendOption({ name: '', values: [{ value: '' }], required: true, displayOrder: optionFields.length })}
            className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
          >
            <Plus className="h-4 w-4" />
            Add Option Group
          </button>
        </div>
      </section>

      {/* Variants Table */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Variants *</h2>
        <div className="overflow-x-auto">
          <table className="w-full border border-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="border-b px-4 py-2 text-left text-sm font-medium text-gray-700">SKU</th>
                <th className="border-b px-4 py-2 text-left text-sm font-medium text-gray-700">Price ($)</th>
                <th className="border-b px-4 py-2 text-left text-sm font-medium text-gray-700">Sale Price ($)</th>
                <th className="border-b px-4 py-2 text-left text-sm font-medium text-gray-700">Stock</th>
              </tr>
            </thead>
            <tbody>
              {variantFields.map((field, index) => (
                <tr key={field.id} className="border-b">
                  <td className="px-4 py-2">
                    <input
                      type="text"
                      {...register(`variants.${index}.sku`)}
                      className="w-full rounded border border-gray-300 px-2 py-1 text-sm"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <input
                      type="text"
                      {...register(`variants.${index}.price`)}
                      className="w-full rounded border border-gray-300 px-2 py-1 text-sm"
                      placeholder="0.00"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <input
                      type="text"
                      {...register(`variants.${index}.salePrice`)}
                      className="w-full rounded border border-gray-300 px-2 py-1 text-sm"
                      placeholder="0.00"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <input
                      type="number"
                      {...register(`variants.${index}.inStock`, { valueAsNumber: true })}
                      className="w-full rounded border border-gray-300 px-2 py-1 text-sm"
                      placeholder="0"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {errors.variants && (
            <p className="mt-2 text-sm text-red-600">{errors.variants.message}</p>
          )}
        </div>
      </section>

      {/* Publishing Options */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Publishing</h2>
        <div className="space-y-3">
          <label className="flex items-center gap-2">
            <input type="checkbox" {...register('isPublished')} className="rounded" />
            <span className="text-sm text-gray-700">Publish immediately</span>
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" {...register('hazmat')} className="rounded" />
            <span className="text-sm text-gray-700">Hazardous materials</span>
          </label>
        </div>
      </section>

      {/* Form Actions */}
      <div className="flex gap-3 pt-6 border-t">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {isSubmitting ? 'Creating...' : 'Create Product'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-lg border border-gray-300 px-6 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

// Variant Option Group Sub-component
function VariantOptionGroup({ index, register, control, errors, onRemove }: {
  index: number;
  register: UseFormRegister<FormData>;
  control: Control<FormData>;
  errors: FieldErrors<FormData>;
  onRemove: () => void;
}) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: `variantOptions.${index}.values`,
  });

  return (
    <div className="rounded-lg border border-gray-200 p-4">
      <div className="flex items-start gap-3 mb-3">
        <input
          type="text"
          {...register(`variantOptions.${index}.name`)}
          className="flex-1 rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
          placeholder="Option name (e.g., Color, Size)"
        />
        <button
          type="button"
          onClick={onRemove}
          className="rounded-lg border border-red-300 px-3 py-2 text-red-600 hover:bg-red-50"
        >
          <Trash2 className="h-5 w-5" />
        </button>
      </div>

      <div className="space-y-2 ml-4">
        <label className="block text-xs font-medium text-gray-600 mb-1">Values:</label>
        {fields.map((field, valueIndex) => (
          <div key={field.id} className="flex gap-2">
            <input
              type="text"
              {...register(`variantOptions.${index}.values.${valueIndex}.value`)}
              className="flex-1 rounded border border-gray-300 px-2 py-1 text-sm"
              placeholder="Value (e.g., Red, Small)"
            />
            {fields.length > 1 && (
              <button
                type="button"
                onClick={() => remove(valueIndex)}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={() => append({ value: '' })}
          className="text-xs text-blue-600 hover:text-blue-700"
        >
          + Add Value
        </button>
      </div>
    </div>
  );
}
