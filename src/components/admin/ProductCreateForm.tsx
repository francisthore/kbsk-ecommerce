"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Plus, X, Save, Eye, EyeOff, Calculator } from 'lucide-react';
import { createProductFormSchema, type CreateProductInput } from '@/lib/validations/product';
import { createProduct, quickCreateBrand, quickCreateCategory } from '@/lib/actions/product';
import { generateSlug as utilGenerateSlug } from '@/lib/utils/product';
import { calculateFinalPrice, calculatePriceBreakdown, shopConfig } from '@/lib/config/shop';

// Types
interface FormAttributes {
  categories: Array<{ id: string; name: string; slug: string }>;
  brands: Array<{ id: string; name: string; slug: string }>;
  colors: Array<{ id: string; name: string; hexCode: string | null }>;
  sizes: Array<{ id: string; name: string; sortOrder: number }>;
  genders: Array<{ id: string; label: string; slug: string }>;
}

interface Props {
  attributes: FormAttributes;
}

// Helper: Generate combinations (Cartesian product)
type AttributeOption = {
  groupName: string;
  groupType: 'color' | 'size' | 'custom';
  value: string;
  colorId?: string;
  sizeId?: string;
};

function generateCombinations(
  groups: Array<{
    name: string;
    type: 'color' | 'size' | 'custom';
    options: AttributeOption[];
  }>
): Array<{
  combinationId: string;
  displayName: string;
  attributes: AttributeOption[];
}> {
  if (groups.length === 0) return [];

  function cartesian(arrays: AttributeOption[][]): AttributeOption[][] {
    return arrays.reduce(
      (acc, curr) => acc.flatMap(a => curr.map(b => [...a, b])),
      [[]] as AttributeOption[][]
    );
  }

  const optionArrays = groups.map(g => g.options);
  const combinations = cartesian(optionArrays);

  return combinations.map(combo => ({
    combinationId: combo.map(attr => `${attr.groupType}:${attr.value}`).join('|'),
    displayName: combo.map(attr => attr.value).join(' / '),
    attributes: combo,
  }));
}

export default function ProductCreateForm({ attributes }: Props) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasVariants, setHasVariants] = useState(false);
  
  // Attribute groups state (for variable products)
  const [attributeGroups, setAttributeGroups] = useState<
    Array<{
      id: string;
      name: string;
      type: 'color' | 'size' | 'custom';
      options: AttributeOption[];
    }>
  >([]);
  
  // Generated variants state
  const [generatedVariants, setGeneratedVariants] = useState<Array<any>>([]);
  
  // Specs state (key-value pairs)
  const [specs, setSpecs] = useState<Record<string, string>>({});
  
  // VAT and pricing state
  const [vatIncluded, setVatIncluded] = useState(true);
  const [showPriceBreakdown, setShowPriceBreakdown] = useState(false);
  
  const form = useForm<CreateProductInput>({
    resolver: zodResolver(createProductFormSchema),
    defaultValues: {
      name: '',
      slug: '',
      description: '',
      productType: 'tool',
      categoryIds: [],
      brandId: undefined,
      genderId: undefined,
      specs: {},
      images: [],
      variantOptions: [],
      variants: [{
        sku: '',
        price: '0',
        salePrice: undefined,
        inStock: 0,
        backorderable: false,
        optionValues: [],
      }],
      isPublished: false,
      isBundle: false,
      hazmat: false,
      unNumber: undefined,
      seoMetaTitle: undefined,
      seoMetaDescription: undefined,
    },
  });

  // Auto-generate slug from name
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    form.setValue('name', name);
    
    const slug = utilGenerateSlug(name);
    form.setValue('slug', slug);
  };

  // Add spec
  const addSpec = (key: string, value: string) => {
    if (!key || !value) return;
    setSpecs(prev => ({ ...prev, [key]: value }));
    form.setValue('specs', { ...specs, [key]: value });
  };

  // Remove spec
  const removeSpec = (key: string) => {
    const newSpecs = { ...specs };
    delete newSpecs[key];
    setSpecs(newSpecs);
    form.setValue('specs', newSpecs);
  };

  // Add attribute group
  const addAttributeGroup = () => {
    setAttributeGroups(prev => [
      ...prev,
      {
        id: `group-${Date.now()}`,
        name: '',
        type: 'custom',
        options: [],
      },
    ]);
  };

  // Update attribute group
  const updateAttributeGroup = (
    id: string,
    updates: Partial<typeof attributeGroups[0]>
  ) => {
    setAttributeGroups(prev =>
      prev.map(g => (g.id === id ? { ...g, ...updates } : g))
    );
  };

  // Remove attribute group
  const removeAttributeGroup = (id: string) => {
    setAttributeGroups(prev => prev.filter(g => g.id !== id));
  };

  // Add option to group
  const addOptionToGroup = (groupId: string, option: AttributeOption) => {
    setAttributeGroups(prev =>
      prev.map(g =>
        g.id === groupId
          ? { ...g, options: [...g.options, option] }
          : g
      )
    );
  };

  // Remove option from group
  const removeOptionFromGroup = (groupId: string, optionValue: string) => {
    setAttributeGroups(prev =>
      prev.map(g =>
        g.id === groupId
          ? { ...g, options: g.options.filter(o => o.value !== optionValue) }
          : g
      )
    );
  };

  // Generate variants from combinations
  const generateVariants = () => {
    const validGroups = attributeGroups.filter(
      g => g.name && g.options.length > 0
    );

    if (validGroups.length === 0) {
      toast.error('Add at least one attribute group with options');
      return;
    }

    const combinations = generateCombinations(validGroups);
    
    const variants = combinations.map(combo => ({
      id: combo.combinationId,
      combinationId: combo.combinationId,
      displayName: combo.displayName,
      attributes: combo.attributes,
      sku: `SKU-${combo.combinationId.replace(/[:|]/g, '-')}`,
      price: '0',
      salePrice: undefined,
      inStock: 0,
      backorderable: false,
      isEnabled: true,
      optionValues: combo.attributes.map(attr => ({
        groupId: attr.groupName,
        valueId: attr.value,
      })),
    }));

    setGeneratedVariants(variants);
    toast.success(`Generated ${variants.length} variant combinations`);
  };

  // Update variant in table
  const updateVariant = (id: string, updates: Partial<typeof generatedVariants[0]>) => {
    setGeneratedVariants(prev =>
      prev.map(v => (v.id === id ? { ...v, ...updates } : v))
    );
  };

  // Bulk apply to all variants
  const bulkApplyPrice = (price: string) => {
    setGeneratedVariants(prev => prev.map(v => ({ ...v, price })));
  };

  const bulkApplyStock = (stock: number) => {
    setGeneratedVariants(prev => prev.map(v => ({ ...v, inStock: stock })));
  };

  // Handle form submission
  const onSubmit = async (data: CreateProductInput) => {
    setIsSubmitting(true);

    try {
      // Calculate final prices for all variants based on VAT inclusion
      const processedVariants = (hasVariants ? generatedVariants : data.variants).map(variant => {
        const inputPrice = parseFloat(variant.price);
        const finalPrice = calculateFinalPrice(inputPrice, vatIncluded);
        
        // Also process sale price if it exists
        let finalSalePrice = variant.salePrice;
        if (variant.salePrice) {
          const inputSalePrice = parseFloat(variant.salePrice);
          finalSalePrice = calculateFinalPrice(inputSalePrice, vatIncluded).toString();
        }

        return {
          ...variant,
          price: finalPrice.toFixed(2),
          salePrice: finalSalePrice,
          vatIncluded, // Store whether VAT was included in input
        };
      });

      // Transform data based on hasVariants toggle
      const submitData: CreateProductInput = {
        ...data,
        specs: specs,
        variants: processedVariants,
      };

      const result = await createProduct(submitData);

      if (result.success) {
        toast.success('Product created successfully!');
        router.push('/admin/products');
        router.refresh();
      } else {
        toast.error(result.error || 'Failed to create product');
      }
    } catch (error) {
      console.error('Error creating product:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
      {/* General Information Section */}
      <section className="rounded-lg bg-white shadow p-6">
        <h2 className="text-xl font-semibold mb-4">General Information</h2>
        
        {/* Product Name & Slug */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Product Name *
            </label>
            <input
              type="text"
              {...form.register('name')}
              onChange={handleNameChange}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="e.g., Cordless Drill Kit"
            />
            {form.formState.errors.name && (
              <p className="mt-1 text-sm text-red-600">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              URL Slug *
            </label>
            <input
              type="text"
              {...form.register('slug')}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="cordless-drill-kit"
            />
            {form.formState.errors.slug && (
              <p className="mt-1 text-sm text-red-600">
                {form.formState.errors.slug.message}
              </p>
            )}
          </div>
        </div>

        {/* Description */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            {...form.register('description')}
            rows={4}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="Professional-grade cordless drill with 20V battery, perfect for construction and DIY projects..."
          />
        </div>

        {/* Product Type, Brand, Gender */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Product Type *
            </label>
            <select
              {...form.register('productType')}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="tool">Tool</option>
              <option value="accessory">Accessory</option>
              <option value="consumable">Consumable</option>
              <option value="ppe">PPE</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Brand
            </label>
            <select
              {...form.register('brandId')}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Select Brand</option>
              {attributes.brands.map(brand => (
                <option key={brand.id} value={brand.id}>
                  {brand.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Gender
            </label>
            <select
              {...form.register('genderId')}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Not Applicable</option>
              {attributes.genders.map(gender => (
                <option key={gender.id} value={gender.id}>
                  {gender.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Categories (Multi-Select) - Placeholder for now */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Categories * (Select multiple with Ctrl/Cmd)
          </label>
          <select
            multiple
            {...form.register('categoryIds')}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 min-h-[120px]"
          >
            {attributes.categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          {form.formState.errors.categoryIds && (
            <p className="mt-1 text-sm text-red-600">
              {form.formState.errors.categoryIds.message}
            </p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            Hold Ctrl (Windows) or Cmd (Mac) to select multiple categories
          </p>
        </div>

        {/* Publishing Status */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            {...form.register('isPublished')}
            id="isPublished"
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label htmlFor="isPublished" className="text-sm font-medium text-gray-700">
            Publish immediately
          </label>
        </div>
      </section>

      {/* Specifications Section */}
      <section className="rounded-lg bg-white shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Specifications</h2>
        <p className="text-sm text-gray-600 mb-4">
          Add technical specifications as key-value pairs (e.g., Voltage: 20V, Weight: 2.5kg)
        </p>

        <div className="space-y-3">
          {Object.entries(specs).map(([key, value]) => (
            <div key={key} className="flex gap-2">
              <input
                type="text"
                value={key}
                disabled
                className="flex-1 rounded-md border-gray-300 bg-gray-50"
              />
              <input
                type="text"
                value={value}
                disabled
                className="flex-1 rounded-md border-gray-300 bg-gray-50"
              />
              <button
                type="button"
                onClick={() => removeSpec(key)}
                className="p-2 text-red-600 hover:bg-red-50 rounded"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          ))}

          <div className="flex gap-2">
            <input
              type="text"
              id="newSpecKey"
              placeholder="Key (e.g., Voltage)"
              className="flex-1 rounded-md border-gray-300"
            />
            <input
              type="text"
              id="newSpecValue"
              placeholder="Value (e.g., 20V)"
              className="flex-1 rounded-md border-gray-300"
            />
            <button
              type="button"
              onClick={() => {
                const key = (document.getElementById('newSpecKey') as HTMLInputElement).value;
                const value = (document.getElementById('newSpecValue') as HTMLInputElement).value;
                if (key && value) {
                  addSpec(key, value);
                  (document.getElementById('newSpecKey') as HTMLInputElement).value = '';
                  (document.getElementById('newSpecValue') as HTMLInputElement).value = '';
                }
              }}
              className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              <Plus className="h-5 w-5" />
            </button>
          </div>
        </div>
      </section>

      {/* Pricing & Variants Section */}
      <section className="rounded-lg bg-white shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Pricing & Inventory</h2>
        
        {/* VAT Inclusion Toggle */}
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="vatIncluded"
              checked={vatIncluded}
              onChange={(e) => setVatIncluded(e.target.checked)}
              className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <div className="flex-1">
              <label htmlFor="vatIncluded" className="text-sm font-semibold text-gray-900 cursor-pointer">
                VAT Included in Prices
              </label>
              <p className="mt-1 text-xs text-gray-600">
                {vatIncluded ? (
                  <>
                    ✓ Prices you enter already include 15% VAT. They will be stored as-is in the database.
                  </>
                ) : (
                  <>
                    ✗ Prices you enter are cost prices. System will apply {shopConfig.markupRate * 100}% markup + 15% VAT automatically.
                    <br />
                    <span className="text-blue-700 font-medium">
                      Example: R100 cost → R{calculateFinalPrice(100, false).toFixed(2)} final price
                    </span>
                  </>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Simple Product Pricing */}
        {!hasVariants && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {vatIncluded ? 'Price (incl. VAT) *' : 'Cost Price *'}
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-gray-500">R</span>
                  <input
                    type="number"
                    step="0.01"
                    {...form.register('variants.0.price')}
                    className="w-full pl-8 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="0.00"
                  />
                </div>
                {!vatIncluded && (
                  <p className="mt-1 text-xs text-green-600">
                    Final: R{calculateFinalPrice(parseFloat(form.watch('variants.0.price') || '0'), false).toFixed(2)}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sale Price
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-gray-500">R</span>
                  <input
                    type="number"
                    step="0.01"
                    {...form.register('variants.0.salePrice')}
                    className="w-full pl-8 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Stock Quantity *
                </label>
                <input
                  type="number"
                  {...form.register('variants.0.inStock', { valueAsNumber: true })}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="0"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  SKU (Stock Keeping Unit) *
                </label>
                <input
                  type="text"
                  {...form.register('variants.0.sku')}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="e.g., DRL-001"
                />
              </div>

              <div className="flex items-end">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    {...form.register('variants.0.backorderable')}
                    id="backorderable"
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="backorderable" className="text-sm text-gray-700">
                    Allow backorders
                  </label>
                </div>
              </div>
            </div>

            {/* Price Breakdown Button */}
            {!vatIncluded && parseFloat(form.watch('variants.0.price') || '0') > 0 && (
              <button
                type="button"
                onClick={() => setShowPriceBreakdown(!showPriceBreakdown)}
                className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
              >
                <Calculator className="h-4 w-4" />
                {showPriceBreakdown ? 'Hide' : 'Show'} Price Breakdown
              </button>
            )}

            {/* Price Breakdown Display */}
            {showPriceBreakdown && !vatIncluded && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Price Calculation Breakdown</h4>
                {(() => {
                  const breakdown = calculatePriceBreakdown(
                    parseFloat(form.watch('variants.0.price') || '0'),
                    vatIncluded
                  );
                  return (
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Cost Price:</span>
                        <span className="font-medium">R{breakdown.costPrice.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Markup ({shopConfig.markupRate * 100}%):</span>
                        <span className="font-medium text-green-600">+R{breakdown.markupAmount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Price after Markup:</span>
                        <span className="font-medium">R{breakdown.priceAfterMarkup.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">VAT (15%):</span>
                        <span className="font-medium text-orange-600">+R{breakdown.vatAmount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between pt-2 border-t border-gray-300">
                        <span className="text-gray-900 font-semibold">Final Price (Stored):</span>
                        <span className="font-bold text-lg">R{breakdown.finalPrice.toFixed(2)}</span>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        )}

        {/* Note about variant pricing */}
        {hasVariants && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-sm text-amber-800">
              <strong>Note:</strong> After generating variants below, you can set individual prices for each variant combination.
              The VAT setting above will apply to all variant prices.
            </p>
          </div>
        )}
      </section>

      {/* Submit Buttons */}
      <div className="flex justify-end gap-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
        >
          {isSubmitting ? (
            <>
              <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Creating...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Create Product
            </>
          )}
        </button>
      </div>
    </form>
  );
}
