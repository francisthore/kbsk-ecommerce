"use client";

/**
 * =====================================================
 * MASTER PRODUCT CREATION FORM (MERGED)
 * =====================================================
 */

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import type { Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { 
  Plus, X, Save, Loader2, 
  Package, Tags, DollarSign, Trash2, Copy, BarChart3, Image as ImageIcon 
} from 'lucide-react';
import { createProductFormResolverSchema } from '@/lib/validations/product';
import type {
  CreateProductFormResolverInput,
} from '@/lib/validations/product';

// Validation & Actions
import { 
  createProductFormSchema, 
  type CreateProductInput,
  type AttributeGroup,
  type AttributeOption,
} from '@/lib/validations/product';
import { 
  createProduct,
  updateProduct, 
  checkSlugAvailability,
} from '@/lib/actions/product';
import { createColor, createSize } from '@/lib/actions/admin-data';
import { deleteFile } from '@/lib/actions/s3';
import { 
  generateVariantCombinations,
  bulkUpdatePrice,
  bulkUpdateStock,
} from '@/lib/utils/variant-generator'; // Ensure you have this utility file
import { generateSlug } from '@/lib/utils/product';
import { calculateFinalPrice, shopConfig } from '@/lib/config/shop';

// UI Components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FileUpload } from '@/components/ui/file-upload';

// Types for form attributes
interface FormAttributesData {
  colors: Array<{ id: string; name: string; slug: string; hexCode: string }>;
  sizes: Array<{ id: string; name: string; slug: string; sortOrder: number }>;
  genders: Array<{ id: string; label: string; slug: string }>;
  brands: Array<{ id: string; name: string; slug: string }>;
  categories: Array<{ id: string; name: string; slug: string }>;
}

function buildDefaultValues(
  initialData?: InitialProductData
): CreateProductInput {
  if (!initialData) {
    return {
      productMode: 'simple',
      name: '',
      slug: '',
      description: '',
      productType: 'tool',
      categoryIds: [],
      brandId: undefined,
      genderId: undefined,
      specs: {},
      images: [],
      variants: [
        {
          variantType: 'simple',
          sku: '',
          price: '0',
          salePrice: undefined,
          inStock: 0,
          backorderable: false,
        },
      ],
      isPublished: false,
      isBundle: false,
      hazmat: false,
      unNumber: undefined,
      seoMetaTitle: undefined,
      seoMetaDescription: undefined,
    };
  }

  const productMode = initialData.productMode ?? 'simple';

  return {
    ...initialData,
    productMode,
    specs: initialData.specs ?? {},
    images: initialData.images ?? [],
    variants:
      productMode === 'variable'
        ? initialData.variants ?? []
        : initialData.variants?.slice(0, 1) ?? [
            {
              variantType: 'simple',
              sku: '',
              price: '0',
              salePrice: undefined,
              inStock: 0,
              backorderable: false,
            },
          ],
  } as CreateProductInput;
}

export type ProductMode = 'simple' | 'variable';

export interface InitialProductData {
  id?: string;
  productMode?: ProductMode;
  attributeGroups?: AttributeGroup[];
  variants?: CreateProductInput['variants'];
  specs?: Record<string, string>;
  images?: Array<{
    id?: string;
    url: string;
    displayOrder: number;
    isPrimary: boolean;
    altText?: string;
  }>;
}

interface Props {
  attributes: FormAttributesData;
  initialData?: InitialProductData; // Optional initial data for edit mode
  mode?: 'create' | 'edit'; // Form mode
}

export default function MasterProductCreateForm({ attributes, initialData, mode = 'create' }: Props) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [slugChecking, setSlugChecking] = useState(false);
  const [slugError, setSlugError] = useState<string | null>(null);
  
  // Product mode toggle
  const [productMode, setProductMode] = useState<'simple' | 'variable'>(initialData?.productMode || 'simple');
  
  // Attribute groups for variable products
  const [attributeGroups, setAttributeGroups] = useState<AttributeGroup[]>(initialData?.attributeGroups || []);
  
  // Generated variants
  type FormVariant = CreateProductInput['variants'][number];

  const [generatedVariants, setGeneratedVariants] =
    useState<FormVariant[]>(initialData?.variants ?? []);  
  // Specs (key-value pairs)
  const [specs, setSpecs] = useState<Record<string, string>>(initialData?.specs || {});
  const [newSpecKey, setNewSpecKey] = useState('');
  const [newSpecValue, setNewSpecValue] = useState('');
  
  // VAT and pricing
  const [vatIncluded, setVatIncluded] = useState(true);

  // Bulk operations state
  const [bulkPrice, setBulkPrice] = useState('');
  const [bulkStock, setBulkStock] = useState('');

  // Quick create dialogs
  const [showColorDialog, setShowColorDialog] = useState(false);
  const [showSizeDialog, setShowSizeDialog] = useState(false);
  const [quickCreateColorName, setQuickCreateColorName] = useState('');
  const [quickCreateColorHex, setQuickCreateColorHex] = useState('#000000');
  const [quickCreateSizeName, setQuickCreateSizeName] = useState('');
  const [quickCreateSizeOrder, setQuickCreateSizeOrder] = useState(0);
  const [isCreatingColor, setIsCreatingColor] = useState(false);
  const [isCreatingSize, setIsCreatingSize] = useState(false);

  // Image management state
  const [uploadedImages, setUploadedImages] = useState<Array<{
    id?: string;
    url: string;
    displayOrder: number;
    isPrimary: boolean;
    altText?: string;
  }>>(initialData?.images || []);

  // Form setup
  const form = useForm<CreateProductFormResolverInput>({
  resolver: zodResolver(createProductFormResolverSchema),
  defaultValues: buildDefaultValues(initialData),
});

  // Watch form values
  const watchedPrice = form.watch('variants.0.price');
  const watchedName = form.watch('name');
  const watchedBrandId = form.watch('brandId');

  // Initialize form state when in edit mode
  useEffect(() => {
    if (mode === 'edit' && initialData) {
      // Set product mode
      setProductMode(initialData.productMode || 'simple');
      
      // Set specs
      if (initialData.specs) {
        setSpecs(initialData.specs);
      }
      
      // Set attribute groups if variable product
      if (initialData.productMode === 'variable' && initialData.attributeGroups) {
        setAttributeGroups(initialData.attributeGroups);
      }
      
      // Set variants if variable product
      if (initialData.productMode === 'variable' && initialData.variants) {
        setGeneratedVariants(initialData.variants);
        // Also sync to form state so they appear in the table
        form.setValue('variants', initialData.variants);
        form.setValue('attributeGroups', initialData.attributeGroups || []);
      }
      
      // Set images
      if (initialData.images) {
        setUploadedImages(initialData.images);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ==================== SKU GENERATION ====================

  const generateSKU = (baseName: string, brandId?: string, suffix?: string): string => {
    // Get brand prefix if available
    const brand = brandId ? attributes.brands.find(b => b.id === brandId) : null;
    const brandPrefix = brand ? brand.name.substring(0, 3).toUpperCase() : 'PRD';
    
    // Get product name prefix (first 3-4 chars)
    const namePrefix = baseName
      .split(' ')
      .map(word => word[0])
      .join('')
      .substring(0, 3)
      .toUpperCase() || 'XXX';
    
    // Add random number for uniqueness
    const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    
    // Combine parts
    const sku = `${brandPrefix}-${namePrefix}-${randomNum}${suffix ? `-${suffix}` : ''}`;
    
    return sku;
  };

  // ==================== SLUG HANDLING ====================

  const handleNameChange = async (name: string) => {
    form.setValue('name', name);
    
    if (name.length >= 3) {
      const slug = generateSlug(name);
      form.setValue('slug', slug);
      
      // Auto-generate SKU for simple products only if brand is selected
      if (productMode === 'simple' && !form.getValues('variants.0.sku')) {
        const brandId = form.getValues('brandId');
        if (brandId) {
          const autoSKU = generateSKU(name, brandId);
          form.setValue('variants.0.sku', autoSKU);
        }
      }
      
      setSlugChecking(true);
      const result = await checkSlugAvailability(slug);
      setSlugChecking(false);
      
      if (!result.available) {
        setSlugError('Slug already exists');
      } else {
        setSlugError(null);
      }
    }
  };

  const handleBrandChange = (brandId: string | undefined) => {
    const actualBrandId = brandId === 'none' ? undefined : brandId;
    form.setValue('brandId', actualBrandId);
    
    // Regenerate SKU when brand changes (for simple products)
    if (productMode === 'simple' && actualBrandId) {
      const name = form.getValues('name');
      if (name && name.length >= 3) {
        const autoSKU = generateSKU(name, actualBrandId);
        form.setValue('variants.0.sku', autoSKU);
        toast.success('SKU updated for new brand');
      }
    }
  };

  const handleSlugChange = async (slug: string) => {
    form.setValue('slug', slug);
    
    if (slug.length >= 3) {
      setSlugChecking(true);
      const result = await checkSlugAvailability(slug, initialData?.id);
      setSlugChecking(false);
      
      if (!result.available) {
        setSlugError('Slug already exists');
      } else {
        setSlugError(null);
      }
    }
  };

  // ==================== SPECS MANAGEMENT ====================

  const addSpec = () => {
    if (!newSpecKey || !newSpecValue) {
      toast.error('Both key and value are required');
      return;
    }
    const updatedSpecs = { ...specs, [newSpecKey]: newSpecValue };
    setSpecs(updatedSpecs);
    form.setValue('specs', updatedSpecs);
    setNewSpecKey('');
    setNewSpecValue('');
    toast.success('Specification added');
  };

  const removeSpec = (key: string) => {
    const updatedSpecs = { ...specs };
    delete updatedSpecs[key];
    setSpecs(updatedSpecs);
    form.setValue('specs', updatedSpecs);
  };

  // ==================== ATTRIBUTE GROUP MANAGEMENT ====================

  const addAttributeGroup = () => {
    const newGroup: AttributeGroup = {
      id: `group-${Date.now()}`,
      name: '',
      type: 'custom',
      options: [],
      displayOrder: attributeGroups.length,
    };
    setAttributeGroups([...attributeGroups, newGroup]);
  };

  const updateAttributeGroup = (index: number, updates: Partial<AttributeGroup>) => {
    const updated = [...attributeGroups];
    updated[index] = { ...updated[index], ...updates };
    setAttributeGroups(updated);
  };

  const removeAttributeGroup = (index: number) => {
    setAttributeGroups(attributeGroups.filter((_, i) => i !== index));
  };

  const addAttributeOption = (groupIndex: number) => {
    const group = attributeGroups[groupIndex];
    if (group.type === 'custom') {
      const value = prompt('Enter option value:');
      if (!value) return;
      const newOption: AttributeOption = {
        value,
        displayOrder: group.options.length,
      };
      updateAttributeGroup(groupIndex, {
        options: [...group.options, newOption],
      });
    }
  };

  const removeAttributeOption = (groupIndex: number, optionIndex: number) => {
    const group = attributeGroups[groupIndex];
    const updated = group.options.filter((_, i) => i !== optionIndex);
    updateAttributeGroup(groupIndex, { options: updated });
  };

  const handleGroupTypeChange = (groupIndex: number, type: 'color' | 'size' | 'custom') => {
    // Don't auto-populate - let user select what they need
    if (type === 'color') {
      updateAttributeGroup(groupIndex, { type, name: 'Color', options: [] });
    } else if (type === 'size') {
      updateAttributeGroup(groupIndex, { type, name: 'Size', options: [] });
    } else {
      updateAttributeGroup(groupIndex, { type, name: '', options: [] });
    }
  };

  const toggleColorOption = (groupIndex: number, colorId: string) => {
    const group = attributeGroups[groupIndex];
    const color = attributes.colors.find(c => c.id === colorId);
    if (!color) return;

    const existingIndex = group.options.findIndex(opt => opt.colorId === colorId);
    let updatedOptions: AttributeOption[];
    
    if (existingIndex >= 0) {
      // Remove it
      updatedOptions = group.options.filter((_, i) => i !== existingIndex);
    } else {
      // Add it
      updatedOptions = [...group.options, {
        value: color.name,
        colorId: color.id,
        displayOrder: group.options.length,
      }];
    }
    
    updateAttributeGroup(groupIndex, { options: updatedOptions });
  };

  const toggleSizeOption = (groupIndex: number, sizeId: string) => {
    const group = attributeGroups[groupIndex];
    const size = attributes.sizes.find(s => s.id === sizeId);
    if (!size) return;

    const existingIndex = group.options.findIndex(opt => opt.sizeId === sizeId);
    let updatedOptions: AttributeOption[];
    
    if (existingIndex >= 0) {
      // Remove it
      updatedOptions = group.options.filter((_, i) => i !== existingIndex);
    } else {
      // Add it
      updatedOptions = [...group.options, {
        value: size.name,
        sizeId: size.id,
        displayOrder: size.sortOrder,
      }];
    }
    
    updateAttributeGroup(groupIndex, { options: updatedOptions });
  };

  const handleQuickCreateColor = async () => {
    if (!quickCreateColorName || !quickCreateColorHex) {
      toast.error('Please enter color name and hex code');
      return;
    }

    setIsCreatingColor(true);
    try {
      const result = await createColor({
        name: quickCreateColorName,
        hexCode: quickCreateColorHex,
      });

      if (result.success && result.data) {
        toast.success('Color created successfully');
        // Add to attributes list without page refresh
        attributes.colors.push({
          id: result.data.id,
          name: result.data.name,
          slug: result.data.slug,
          hexCode: result.data.hexCode,
        });
        // Reset dialog
        setQuickCreateColorName('');
        setQuickCreateColorHex('#000000');
        setShowColorDialog(false);
        // Force re-render by updating a dummy state
        setIsCreatingColor(false);
      } else {
        toast.error(result.error || 'Failed to create color');
      }
    } catch (error) {
      toast.error('Failed to create color');
    } finally {
      setIsCreatingColor(false);
    }
  };

  const handleQuickCreateSize = async () => {
    if (!quickCreateSizeName) {
      toast.error('Please enter size name');
      return;
    }

    setIsCreatingSize(true);
    try {
      const result = await createSize({
        name: quickCreateSizeName,
        sortOrder: quickCreateSizeOrder,
      });

      if (result.success && result.data) {
        toast.success('Size created successfully');
        // Add to attributes list without page refresh
        attributes.sizes.push({
          id: result.data.id,
          name: result.data.name,
          slug: result.data.slug,
          sortOrder: result.data.sortOrder,
        });
        // Reset dialog
        setQuickCreateSizeName('');
        setQuickCreateSizeOrder(0);
        setShowSizeDialog(false);
        // Force re-render by updating a dummy state
        setIsCreatingSize(false);
      } else {
        toast.error(result.error || 'Failed to create size');
      }
    } catch (error) {
      toast.error('Failed to create size');
    } finally {
      setIsCreatingSize(false);
    }
  };

  // ==================== VARIANT GENERATION ====================

  const generateVariants = () => {
    const validGroups = attributeGroups.filter(g => g.name && g.options.length > 0);
    if (validGroups.length === 0) {
      toast.error('Add at least one attribute group with options');
      return;
    }
    try {
      const brandId = form.getValues('brandId');
      const baseSKU = generateSKU(watchedName || 'PRODUCT', brandId);
      const variants = generateVariantCombinations(
        validGroups,
        watchedPrice || '0',
        baseSKU
      );
      
      // Update local state
      setGeneratedVariants(variants);
      
      // Sync both attributeGroups and variants to form state
      form.setValue('attributeGroups', validGroups);
      form.setValue('variants', variants);
      
      toast.success(`Generated ${variants.length} variant combinations`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to generate variants');
    }
  };

  // ==================== VARIANT TABLE OPERATIONS ====================

  const updateVariant = (index: number, updates: Partial<Record<string, unknown>>) => {
    const updated = [...generatedVariants];
    updated[index] = { ...updated[index], ...updates };
    setGeneratedVariants(updated);
  };

  // ==================== IMAGE MANAGEMENT ====================

  const handleImageUploadComplete = (newUrls: string[]) => {
    // FileUpload component calls this for each uploaded file with a single URL
    // We need to append to existing images, not replace them
    setUploadedImages((currentImages) => {
      const newImages = newUrls
        .filter(url => !currentImages.some(img => img.url === url)) // Avoid duplicates
        .map((url, index) => ({
          url,
          displayOrder: currentImages.length + index,
          isPrimary: currentImages.length === 0 && index === 0, // First image is primary
          altText: watchedName || 'Product image',
        }));
      
      const allImages = [...currentImages, ...newImages];
      form.setValue('images', allImages);
      return allImages;
    });
  };

  const removeImage = async (index: number) => {
    const imageToRemove = uploadedImages[index];
    
    // Delete from S3 if it's an existing image (in edit mode)
    if (mode === 'edit' && imageToRemove.url) {
      try {
        // Extract the file key from the URL
        const urlParts = imageToRemove.url.split('/');
        const fileKey = urlParts.slice(-2).join('/'); // e.g., "products/filename.jpg"
        await deleteFile(fileKey);
        toast.success('Image deleted from storage');
      } catch (error) {
        console.error('Failed to delete image from S3:', error);
        toast.error('Failed to delete image from storage');
      }
    }
    
    const updated = uploadedImages.filter((_, i) => i !== index);
    // Re-index display orders
    const reindexed = updated.map((img, i) => ({
      ...img,
      displayOrder: i,
      isPrimary: i === 0 ? true : img.isPrimary && i !== 0 ? false : img.isPrimary,
    }));
    setUploadedImages(reindexed);
    form.setValue('images', reindexed);
  };

  const setPrimaryImage = (index: number) => {
    const updated = uploadedImages.map((img, i) => ({
      ...img,
      isPrimary: i === index,
    }));
    setUploadedImages(updated);
    form.setValue('images', updated);
  };

  const updateImageAltText = (index: number, altText: string) => {
    const updated = [...uploadedImages];
    updated[index] = { ...updated[index], altText };
    setUploadedImages(updated);
    form.setValue('images', updated);
  };

  const moveImage = (index: number, direction: 'up' | 'down') => {
    const updated = [...uploadedImages];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (newIndex < 0 || newIndex >= updated.length) return;
    
    // Swap positions
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    
    // Update display orders
    const reindexed = updated.map((img, i) => ({
      ...img,
      displayOrder: i,
    }));
    
    setUploadedImages(reindexed);
    form.setValue('images', reindexed);
  };

  // ==================== VARIANT TABLE OPERATIONS (CONTINUED) ====================

  const handleBulkApplyPrice = () => {
    if (!bulkPrice) return;
    const updated = bulkUpdatePrice(generatedVariants, bulkPrice);
    setGeneratedVariants(updated);
    toast.success('Price applied to all variants');
  };

  const handleBulkApplyStock = () => {
    if (!bulkStock) return;
    const stock = parseInt(bulkStock);
    if (isNaN(stock)) return;
    const updated = bulkUpdateStock(generatedVariants, stock);
    setGeneratedVariants(updated);
    toast.success('Stock applied to all variants');
  };

  const duplicateVariant = (index: number) => {
    const variant = generatedVariants[index];
    const newVariant = {
      ...variant,
      combinationId: `${variant.combinationId}-copy-${Date.now()}`,
      sku: `${variant.sku}-COPY`,
    };
    setGeneratedVariants([...generatedVariants, newVariant]);
  };

  const deleteVariant = (index: number) => {
    setGeneratedVariants(generatedVariants.filter((_, i) => i !== index));
  };

  const toggleProductMode = () => {
    const newMode = productMode === 'simple' ? 'variable' : 'simple';
    setProductMode(newMode);
    form.setValue('productMode', newMode);
    if (newMode === 'simple') {
      setAttributeGroups([]);
      setGeneratedVariants([]);
    }
  };

  // ==================== FORM SUBMISSION ====================



  const onSubmit = async (data: CreateProductInput) => {
    // 🔍 BREAKPOINT 1: Log initial form data
    console.log('🔍 BREAKPOINT 1 - Form Submission Started');
    console.log('Form Data:', JSON.stringify(data, null, 2));
    console.log('Product Mode:', productMode);
    console.log('VAT Included:', vatIncluded);
    console.log('Specs from data:', data.specs);
    console.log('Specs from state:', specs);
    
    setIsSubmitting(true);
    try {
      let submitData: CreateProductInput;

      if (productMode === 'simple') {
        // 🔍 BREAKPOINT 2: Simple product processing
        console.log('🔍 BREAKPOINT 2 - Processing Simple Product');
        
        const variantData = data.variants[0];
        console.log('Variant Data:', variantData);
        
        const inputPrice = parseFloat(variantData.price);
        const finalPrice = calculateFinalPrice(inputPrice, vatIncluded);
        console.log('Price Calculation:', { inputPrice, finalPrice });
        
        let finalSalePrice: string | undefined = undefined;
        if (variantData.salePrice && variantData.salePrice.trim() !== '') {
          const inputSalePrice = parseFloat(variantData.salePrice);
          finalSalePrice = calculateFinalPrice(inputSalePrice, vatIncluded).toFixed(2);
          console.log('Sale Price Calculation:', { inputSalePrice, finalSalePrice });
        }

        submitData = {
          ...data,
          productMode: 'simple',
          specs: data.specs || {},
          variants: [{
            variantType: 'simple' as const,
            sku: variantData.sku,
            price: finalPrice.toFixed(2),
            salePrice: finalSalePrice,
            inStock: variantData.inStock,
            backorderable: variantData.backorderable || false,
            // Explicitly exclude colorId, sizeId, genderId for simple products
            colorId: undefined,
            sizeId: undefined,
            genderId: undefined,
          }],
        };
        
        // 🔍 BREAKPOINT 3: Simple product data prepared
        console.log('🔍 BREAKPOINT 3 - Simple Product Data:', JSON.stringify(submitData, null, 2));
      } else {
        // 🔍 BREAKPOINT 4: Variable product processing
        console.log('🔍 BREAKPOINT 4 - Processing Variable Product');
        console.log('Generated Variants Count:', generatedVariants.length);
        console.log('Attribute Groups:', attributeGroups);
        
        const processedVariants = generatedVariants.map(variant => {
          const inputPrice = parseFloat(variant.price);
          const finalPrice = calculateFinalPrice(inputPrice, vatIncluded);
          
          let finalSalePrice: string | undefined = undefined;
          if (variant.salePrice && variant.salePrice.toString().trim() !== '') {
            const inputSalePrice = parseFloat(variant.salePrice);
            finalSalePrice = calculateFinalPrice(inputSalePrice, vatIncluded).toFixed(2);
          }

          return {
            variantType: 'variable' as const,
            sku: variant.sku,
            price: finalPrice.toFixed(2),
            salePrice: finalSalePrice,
            colorId: variant.colorId || undefined,
            sizeId: variant.sizeId || undefined,
            genderId: undefined, // Will be inherited from product level if needed
            inStock: variant.inStock || 0,
            backorderable: variant.backorderable || false,
            combinationId: variant.combinationId,
            displayName: variant.displayName,
            attributes: variant.attributes,
          };
        });
        
        console.log('Processed Variants:', processedVariants);

        submitData = {
          ...data,
          productMode: 'variable',
          specs: data.specs || {},
          attributeGroups,
          variants: processedVariants,
        } as CreateProductInput;
        
        // 🔍 BREAKPOINT 5: Variable product data prepared
        console.log('🔍 BREAKPOINT 5 - Variable Product Data:', JSON.stringify(submitData, null, 2));
      }

      // 🔍 BREAKPOINT 6: Format images for submission
      console.log('🔍 BREAKPOINT 6 - Formatting Images');
      console.log('Images before formatting:', submitData.images);
      
      const formattedData = {
        ...submitData,
        images: submitData.images.map((image) => ({
          url: image.url,
          displayOrder: image.displayOrder || 0,
          isPrimary: image.isPrimary || false,
          id: image.id,
          altText: image.altText,
        })),
      };
      
      console.log('Images after formatting:', formattedData.images);

      // 🔍 BREAKPOINT 7: Send data to API
      console.log('🔍 BREAKPOINT 7 - Sending to API');
      console.log('Final Submit Data:', JSON.stringify(formattedData, null, 2));
      
      const result = mode === 'edit' && initialData?.id
        ? await updateProduct(initialData.id, formattedData)
        : await createProduct(formattedData);
      
      // 🔍 BREAKPOINT 8: API response received
      console.log('🔍 BREAKPOINT 8 - API Response:', result);

      if (result.success) {
        const successMessage = mode === 'edit' ? 'Product updated successfully!' : 'Product created successfully!';
        console.log(`✅ ${successMessage}`);
        toast.success(successMessage);
        router.push('/admin/products');
        router.refresh();
      } else {
        console.error('❌ API Error:', result.error);
        const errorMessage = mode === 'edit' ? 'Failed to update product' : 'Failed to create product';
        toast.error(result.error || errorMessage);
      }
    } catch (error) {
      // 🔍 BREAKPOINT 9: Error occurred
      console.error('🔍 BREAKPOINT 9 - Error Caught:', error);
      console.error('Error details:', error instanceof Error ? error.message : 'Unknown error');
      console.error('Error stack:', error instanceof Error ? error.stack : '');
      toast.error('An unexpected error occurred');
    } finally {
      console.log('🔍 Form submission completed');
      setIsSubmitting(false);
    }
  };

  // ==================== RENDER ====================

  return (
    <>
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pb-12">
      
      {/* Hidden field for productMode */}
      <input type="hidden" {...form.register('productMode')} value={productMode} />
      
      {/* Global Error Display */}
      {form.formState.errors.root && (
        <Alert variant="destructive">
          <AlertDescription>{form.formState.errors.root.message}</AlertDescription>
        </Alert>
      )}

      {/* ==================== GENERAL INFORMATION ==================== */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            General Information
          </CardTitle>
          <CardDescription>Basic product details and categorization</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Product Name *</Label>
              <Input
                id="name"
                placeholder="e.g., Cordless Drill Kit"
                {...form.register('name')}
                onChange={(e) => handleNameChange(e.target.value)}
              />
              {form.formState.errors.name && (
                <p className="text-sm text-[var(--color-error)]">{form.formState.errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">URL Slug *</Label>
              <div className="relative">
                <Input
                  id="slug"
                  placeholder="cordless-drill-kit"
                  {...form.register('slug')}
                  onChange={(e) => handleSlugChange(e.target.value)}
                  className={slugError ? 'border-[var(--color-error)]' : ''}
                />
                {slugChecking && (
                  <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin text-[var(--color-text-muted)]" />
                )}
              </div>
              {slugError && <p className="text-sm text-[var(--color-error)]">{slugError}</p>}
              {form.formState.errors.slug && (
                <p className="text-sm text-[var(--color-error)]">{form.formState.errors.slug.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              rows={4}
              placeholder="Professional-grade cordless drill with 20V battery..."
              {...form.register('description')}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="productType">Product Type *</Label>
              <Select
                value={form.watch('productType')}
                onValueChange={(value) => form.setValue('productType', value as 'tool' | 'accessory' | 'consumable' | 'ppe')}
              >
                <SelectTrigger id="productType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tool">Tool</SelectItem>
                  <SelectItem value="accessory">Accessory</SelectItem>
                  <SelectItem value="consumable">Consumable</SelectItem>
                  <SelectItem value="ppe">PPE</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="brand">Brand {productMode === 'simple' && '*'}</Label>
              <Select
                value={form.watch('brandId') || 'none'}
                onValueChange={handleBrandChange}
              >
                <SelectTrigger id="brand">
                  <SelectValue placeholder="Select Brand" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {attributes.brands.map(brand => (
                    <SelectItem key={brand.id} value={brand.id}>
                      {brand.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {productMode === 'simple' && !form.watch('brandId') && (
                <p className="text-xs text-[var(--color-warning)]">⚠️ Select a brand to auto-generate SKU</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <Select
                value={form.watch('genderId') || 'not-applicable'}
                onValueChange={(value) => form.setValue('genderId', value === 'not-applicable' ? undefined : value)}
              >
                <SelectTrigger id="gender">
                  <SelectValue placeholder="Not Applicable" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="not-applicable">Not Applicable</SelectItem>
                  {attributes.genders.map(gender => (
                    <SelectItem key={gender.id} value={gender.id}>
                      {gender.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="categories">Categories * (Hold Ctrl/Cmd for multiple)</Label>
            <select
              multiple
              id="categories"
              className="w-full min-h-[120px] rounded-md border border-[var(--color-light-300)] px-3 py-2"
              value={form.watch('categoryIds') || []}
              onChange={(e) => {
                const selected = Array.from(e.target.selectedOptions, option => option.value);
                form.setValue('categoryIds', selected);
              }}
            >
              {attributes.categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            {form.formState.errors.categoryIds && (
              <p className="text-sm text-[var(--color-error)]">{form.formState.errors.categoryIds.message}</p>
            )}
          </div>

          <div className="flex items-center gap-3">
            <Switch
              id="isPublished"
              checked={form.watch('isPublished')}
              onCheckedChange={(checked) => form.setValue('isPublished', checked)}
            />
            <Label htmlFor="isPublished" className="cursor-pointer">
              Publish immediately
            </Label>
          </div>
        </CardContent>
      </Card>

      {/* ==================== SPECIFICATIONS ==================== */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tags className="h-5 w-5" />
            Specifications
          </CardTitle>
          <CardDescription>Add technical specifications as key-value pairs</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          
          {Object.entries(specs).length > 0 && (
            <div className="space-y-2">
              {Object.entries(specs).map(([key, value]) => (
                <div key={key} className="flex gap-2 items-center p-2 bg-[var(--color-light-200)] rounded">
                  <Badge variant="secondary">{key}</Badge>
                  <span className="flex-1 text-sm">{value}</span>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    onClick={() => removeSpec(key)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-2">
            <Input
              placeholder="Key (e.g., Voltage)"
              value={newSpecKey}
              onChange={(e) => setNewSpecKey(e.target.value)}
              className="flex-1"
            />
            <Input
              placeholder="Value (e.g., 20V)"
              value={newSpecValue}
              onChange={(e) => setNewSpecValue(e.target.value)}
              className="flex-1"
            />
            <Button type="button" onClick={addSpec} size="icon">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ==================== PRODUCT IMAGES ==================== */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Product Images
          </CardTitle>
          <CardDescription>
            Upload product images. The first image will be the primary display image.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          
          <FileUpload
            folder="products"
            accept="image/*"
            multiple={true}
            maxFiles={10}
            maxSize={10 * 1024 * 1024} // 10MB
            onUploadComplete={handleImageUploadComplete}
          />

          {uploadedImages.length > 0 && (
            <div className="space-y-4 mt-6">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">
                  Uploaded Images ({uploadedImages.length})
                </Label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {uploadedImages.map((image, index) => (
                  <Card key={index} className="overflow-hidden group">
                    <div className="relative aspect-square bg-gray-100">
                      <img
                        src={image.url}
                        alt={image.altText || `Product image ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      {image.isPrimary && (
                        <Badge 
                          className="absolute top-2 left-2 bg-[var(--color-success)] text-white"
                        >
                          Primary
                        </Badge>
                      )}
                      {/* Delete overlay on hover */}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Button
                          type="button"
                          size="lg"
                          variant="destructive"
                          onClick={() => removeImage(index)}
                          className="gap-2"
                        >
                          <Trash2 className="h-5 w-5" />
                          Delete Image
                        </Button>
                      </div>
                    </div>
                    <CardContent className="p-3 space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          #{index + 1}
                        </Badge>
                        {!image.isPrimary && (
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="text-xs h-6"
                            onClick={() => setPrimaryImage(index)}
                          >
                            Set as Primary
                          </Button>
                        )}
                      </div>
                      <Input
                        placeholder="Alt text (optional)"
                        value={image.altText || ''}
                        onChange={(e) => updateImageAltText(index, e.target.value)}
                        className="text-xs"
                      />
                      <div className="flex gap-1">
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          disabled={index === 0}
                          onClick={() => moveImage(index, 'up')}
                          className="flex-1 h-7 text-xs"
                        >
                          ↑ Move Up
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          disabled={index === uploadedImages.length - 1}
                          onClick={() => moveImage(index, 'down')}
                          className="flex-1 h-7 text-xs"
                        >
                          ↓ Move Down
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {uploadedImages.length === 0 && (
            <Alert>
              <AlertDescription>
                No images uploaded yet. Add at least one product image to improve visibility.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* ==================== PRICING & VARIANTS ==================== */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Pricing & Variants
          </CardTitle>
          <CardDescription>Configure product variants and inventory</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          
          <div className="p-4 bg-[var(--color-light-200)] border border-[var(--color-light-300)] rounded-lg">
            <div className="flex items-start gap-3">
              <Switch
                id="vatIncluded"
                checked={vatIncluded}
                onCheckedChange={setVatIncluded}
              />
              <div className="flex-1">
                <Label htmlFor="vatIncluded" className="font-semibold cursor-pointer">
                  VAT Included in Prices
                </Label>
                <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
                  {vatIncluded ? (
                    <>
                      ✓ Prices include 15% VAT. Stored as-is in database.
                    </>
                  ) : (
                    <>
                      ✗ Cost prices only. System will apply {shopConfig.markupRate * 100}% markup + 15% VAT.
                    </>
                  )}
                </p>
              </div>
            </div>
          </div>

          <Separator />

          <div className="flex items-center justify-between p-4 bg-[var(--color-light-200)] rounded-lg">
            <div>
              <Label className="font-semibold text-base">Product has variants?</Label>
              <p className="text-sm text-[var(--color-text-secondary)] mt-1">
                {productMode === 'simple' 
                  ? 'Single SKU with one price point'
                  : 'Multiple variants with different attributes (color, size, etc.)'
                }
              </p>
            </div>
            <Switch
              checked={productMode === 'variable'}
              onCheckedChange={toggleProductMode}
            />
          </div>

          {/* ==================== SIMPLE PRODUCT MODE ==================== */}
          {productMode === 'simple' && (
            <div className="space-y-4 border-t pt-4">
              <h3 className="font-semibold text-lg">Single Variant Details</h3>
              {/* Hidden field for variantType */}
              <input type="hidden" {...form.register('variants.0.variantType')} value="simple" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">
                    {vatIncluded ? 'Price (incl. VAT) *' : 'Cost Price *'}
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-3 text-[var(--color-text-secondary)]">R</span>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      className="pl-8"
                      {...form.register('variants.0.price')}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="salePrice">Sale Price</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-3 text-[var(--color-text-secondary)]">R</span>
                    <Input
                      id="salePrice"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      className="pl-8"
                      {...form.register('variants.0.salePrice')}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="stock">Stock Quantity *</Label>
                  <Input
                    id="stock"
                    type="number"
                    placeholder="0"
                    {...form.register('variants.0.inStock', { valueAsNumber: true })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sku">SKU *</Label>
                  <div className="flex gap-2">
                    <Input
                      id="sku"
                      placeholder="e.g., DRL-001"
                      {...form.register('variants.0.sku')}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        const name = form.getValues('name');
                        const brandId = form.getValues('brandId');
                        if (!name) {
                          toast.error('Enter product name first');
                          return;
                        }
                        if (!brandId) {
                          toast.error('Select a brand first');
                          return;
                        }
                        const autoSKU = generateSKU(name, brandId);
                        form.setValue('variants.0.sku', autoSKU);
                        toast.success('SKU generated');
                      }}
                      title="Generate SKU"
                    >
                      <BarChart3 className="h-4 w-4" />
                    </Button>
                  </div>
                  {form.formState.errors.variants?.[0]?.sku && (
                    <p className="text-sm text-[var(--color-error)]">
                      {form.formState.errors.variants[0].sku.message}
                    </p>
                  )}
                </div>

                <div className="flex items-end">
                  <div className="flex items-center gap-2">
                    <Switch
                      id="backorderable"
                      checked={form.watch('variants.0.backorderable')}
                      onCheckedChange={(checked) => 
                        form.setValue('variants.0.backorderable', checked)
                      }
                    />
                    <Label htmlFor="backorderable" className="cursor-pointer">
                      Allow backorders
                    </Label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ==================== VARIABLE PRODUCT MODE ==================== */}
          {productMode === 'variable' && (
            <div className="space-y-6 border-t pt-4">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-lg">Attribute Groups</h3>
                  <Button type="button" onClick={addAttributeGroup} size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Group
                  </Button>
                </div>

                {attributeGroups.length === 0 ? (
                  <Alert>
                    <AlertDescription>
                      Add attribute groups (Color, Size, or Custom) to create variant combinations.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <div className="space-y-4">
                    {attributeGroups.map((group, groupIndex) => (
                      <Card key={group.id}>
                        <CardContent className="pt-6 space-y-4">
                          <div className="flex items-start gap-4">
                            <div className="flex-1 space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label>Attribute Type *</Label>
                                  <Select
                                    value={group.type}
                                    onValueChange={(value: 'color' | 'size' | 'custom') =>
                                      handleGroupTypeChange(groupIndex, value)
                                    }
                                  >
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="color">Color</SelectItem>
                                      <SelectItem value="size">Size</SelectItem>
                                      <SelectItem value="custom">Custom</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="space-y-2">
                                  <Label>Group Name *</Label>
                                  <Input
                                    value={group.name}
                                    onChange={(e) => updateAttributeGroup(groupIndex, { name: e.target.value })}
                                    disabled={group.type !== 'custom'}
                                  />
                                </div>
                              </div>
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <Label>Options ({group.options.length} selected)</Label>
                                  {group.type === 'custom' && (
                                    <Button
                                      type="button"
                                      size="sm"
                                      variant="outline"
                                      onClick={() => addAttributeOption(groupIndex)}
                                    >
                                      <Plus className="h-3 w-3 mr-1" /> Add Option
                                    </Button>
                                  )}
                                </div>

                                {/* Color type - show color checkboxes */}
                                {group.type === 'color' && (
                                  <>
                                    <div className="flex justify-end mb-2">
                                      <Button
                                        type="button"
                                        size="sm"
                                        variant="outline"
                                        onClick={() => setShowColorDialog(true)}
                                      >
                                        <Plus className="h-3 w-3 mr-1" /> Add New Color
                                      </Button>
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 p-3 border rounded-lg max-h-60 overflow-y-auto">
                                    {attributes.colors.map((color) => {
                                      const isSelected = group.options.some(opt => opt.colorId === color.id);
                                      return (
                                        <div key={color.id} className="flex items-center gap-2">
                                          <input
                                            type="checkbox"
                                            id={`color-${groupIndex}-${color.id}`}
                                            checked={isSelected}
                                            onChange={() => toggleColorOption(groupIndex, color.id)}
                                            className="w-4 h-4 rounded border-gray-300"
                                          />
                                          <label 
                                            htmlFor={`color-${groupIndex}-${color.id}`}
                                            className="flex items-center gap-2 cursor-pointer flex-1"
                                          >
                                            <div 
                                              className="w-5 h-5 rounded border border-gray-300"
                                              style={{ backgroundColor: color.hexCode }}
                                            />
                                            <span className="text-sm">{color.name}</span>
                                          </label>
                                        </div>
                                      );
                                    })}
                                    </div>
                                  </>
                                )}

                                {/* Size type - show size checkboxes */}
                                {group.type === 'size' && (
                                  <>
                                    <div className="flex justify-end mb-2">
                                      <Button
                                        type="button"
                                        size="sm"
                                        variant="outline"
                                        onClick={() => setShowSizeDialog(true)}
                                      >
                                        <Plus className="h-3 w-3 mr-1" /> Add New Size
                                      </Button>
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 p-3 border rounded-lg max-h-60 overflow-y-auto">
                                    {attributes.sizes.map((size) => {
                                      const isSelected = group.options.some(opt => opt.sizeId === size.id);
                                      return (
                                        <div key={size.id} className="flex items-center gap-2">
                                          <input
                                            type="checkbox"
                                            id={`size-${groupIndex}-${size.id}`}
                                            checked={isSelected}
                                            onChange={() => toggleSizeOption(groupIndex, size.id)}
                                            className="w-4 h-4 rounded border-gray-300"
                                          />
                                          <label 
                                            htmlFor={`size-${groupIndex}-${size.id}`}
                                            className="cursor-pointer text-sm flex-1"
                                          >
                                            {size.name}
                                          </label>
                                        </div>
                                      );
                                    })}
                                    </div>
                                  </>
                                )}

                                {/* Custom type - show badges */}
                                {group.type === 'custom' && (
                                  <div className="flex flex-wrap gap-2">
                                    {group.options.map((option, optionIndex) => (
                                      <Badge key={optionIndex} variant="secondary" className="flex items-center gap-2">
                                        {option.value}
                                        <button
                                          type="button"
                                          onClick={() => removeAttributeOption(groupIndex, optionIndex)}
                                          className="ml-1 hover:text-[var(--color-error)]"
                                        >
                                          <X className="h-3 w-3" />
                                        </button>
                                      </Badge>
                                    ))}
                                  </div>
                                )}

                                {/* Show selected options summary */}
                                {group.options.length > 0 && group.type !== 'custom' && (
                                  <div className="flex flex-wrap gap-2 mt-2">
                                    <span className="text-xs text-muted-foreground">Selected:</span>
                                    {group.options.map((option, optionIndex) => (
                                      <Badge key={optionIndex} variant="outline" className="text-xs">
                                        {option.value}
                                      </Badge>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                            <Button
                              type="button"
                              size="icon"
                              variant="ghost"
                              onClick={() => removeAttributeGroup(groupIndex)}
                            >
                              <Trash2 className="h-4 w-4 text-[var(--color-error)]" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>

              {attributeGroups.length > 0 && (
                <div className="flex justify-center">
                  <Button type="button" onClick={generateVariants} size="lg" variant="default">
                    <BarChart3 className="h-5 w-5 mr-2" />
                    Generate Variant Combinations
                  </Button>
                </div>
              )}

              {generatedVariants.length > 0 && (
                <div className="space-y-4">
                  <Separator />
                  <div className="flex items-end gap-4 p-4 bg-[var(--color-light-200)] rounded-lg">
                    <div className="flex-1 space-y-2">
                      <Label htmlFor="bulkPrice">Bulk Apply Price</Label>
                      <div className="flex gap-2">
                        <Input
                          id="bulkPrice"
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          value={bulkPrice}
                          onChange={(e) => setBulkPrice(e.target.value)}
                        />
                        <Button type="button" onClick={handleBulkApplyPrice}>Apply</Button>
                      </div>
                    </div>
                    <div className="flex-1 space-y-2">
                      <Label htmlFor="bulkStock">Bulk Apply Stock</Label>
                      <div className="flex gap-2">
                        <Input
                          id="bulkStock"
                          type="number"
                          placeholder="0"
                          value={bulkStock}
                          onChange={(e) => setBulkStock(e.target.value)}
                        />
                        <Button type="button" onClick={handleBulkApplyStock}>Apply</Button>
                      </div>
                    </div>
                  </div>

                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[200px]">Variant</TableHead>
                          <TableHead>SKU</TableHead>
                          <TableHead>Price</TableHead>
                          <TableHead>Stock</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {generatedVariants.map((variant, index) => (
                          <TableRow key={variant.combinationId}>
                            <TableCell className="font-medium">{variant.displayName}</TableCell>
                            <TableCell>
                              <Input
                                value={variant.sku}
                                onChange={(e) => updateVariant(index, { sku: e.target.value })}
                                className="max-w-[150px]"
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                step="0.01"
                                value={variant.price}
                                onChange={(e) => updateVariant(index, { price: e.target.value })}
                                className="max-w-[100px]"
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                value={variant.inStock}
                                onChange={(e) => updateVariant(index, { inStock: parseInt(e.target.value) || 0 })}
                                className="max-w-[80px]"
                              />
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-1">
                                <Button type="button" size="icon" variant="ghost" onClick={() => duplicateVariant(index)}>
                                  <Copy className="h-4 w-4" />
                                </Button>
                                <Button type="button" size="icon" variant="ghost" onClick={() => deleteVariant(index)}>
                                  <Trash2 className="h-4 w-4 text-[var(--color-error)]" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ==================== FORM ACTIONS ==================== */}
      <div className="flex justify-end gap-4 sticky bottom-0 bg-white py-4 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting || slugError !== null}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              {mode === 'edit' ? 'Updating...' : 'Creating...'}
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              {mode === 'edit' ? 'Update Product' : 'Create Product'}
            </>
          )}
        </Button>
      </div>
    </form>

    {/* Quick Create Color Dialog */}
    <Dialog open={showColorDialog} onOpenChange={setShowColorDialog}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Color</DialogTitle>
          <DialogDescription>
            Create a new global color that can be used across all products.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="colorName">Color Name *</Label>
            <Input
              id="colorName"
              placeholder="e.g., Navy Blue"
              value={quickCreateColorName}
              onChange={(e) => setQuickCreateColorName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="colorHex">Hex Code *</Label>
            <div className="flex gap-2">
              <Input
                id="colorHex"
                type="color"
                value={quickCreateColorHex}
                onChange={(e) => setQuickCreateColorHex(e.target.value)}
                className="w-20 h-10 p-1 cursor-pointer"
              />
              <Input
                placeholder="#000000"
                value={quickCreateColorHex}
                onChange={(e) => setQuickCreateColorHex(e.target.value)}
                className="flex-1"
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowColorDialog(false)}
            disabled={isCreatingColor}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleQuickCreateColor}
            disabled={isCreatingColor}
          >
            {isCreatingColor ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Create Color
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    {/* Quick Create Size Dialog */}
    <Dialog open={showSizeDialog} onOpenChange={setShowSizeDialog}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Size</DialogTitle>
          <DialogDescription>
            Create a new global size that can be used across all products.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="sizeName">Size Name *</Label>
            <Input
              id="sizeName"
              placeholder="e.g., XXL"
              value={quickCreateSizeName}
              onChange={(e) => setQuickCreateSizeName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sizeOrder">Sort Order</Label>
            <Input
              id="sizeOrder"
              type="number"
              placeholder="0"
              value={quickCreateSizeOrder}
              onChange={(e) => setQuickCreateSizeOrder(parseInt(e.target.value) || 0)}
            />
            <p className="text-xs text-muted-foreground">
              Lower numbers appear first (e.g., 0 for XS, 1 for S, 2 for M)
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowSizeDialog(false)}
            disabled={isCreatingSize}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleQuickCreateSize}
            disabled={isCreatingSize}
          >
            {isCreatingSize ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Create Size
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  );
}
