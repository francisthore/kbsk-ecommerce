# 🚀 Master Product Creation Flow - Quick Reference

## 🎯 Core Concepts

### 1. Product Modes (Discriminated Union)

```typescript
// SIMPLE: Single variant, no attribute selection
{
  productMode: 'simple',
  variants: [{ variantType: 'simple', sku, price, ... }]
}

// VARIABLE: Multiple variants with attributes
{
  productMode: 'variable',
  attributeGroups: [{ name, type, options }],
  variants: [{ variantType: 'variable', attributes: [...], sku, price, ... }]
}
```

### 2. Attribute Types

| Type | Source | ID Tracking | Use Case |
|------|--------|-------------|----------|
| `color` | Database (`colors` table) | `colorId` → `product_variants.color_id` | Apparel, accessories |
| `size` | Database (`sizes` table) | `sizeId` → `product_variants.size_id` | Clothing, footwear |
| `custom` | User input | Via `variant_option_assignments` | Material, compatibility, etc. |

### 3. Variant Combination Flow

```
Attribute Groups → Cartesian Product → Editable Table → Database Insert
      [Color: Red, Blue]              Red/S, Red/M,        INSERT INTO
      [Size: S, M, L]        →        Blue/S, Blue/M, ...  product_variants
                                                           WITH color_id, size_id
```

---

## 📋 Component Props

### MasterProductCreateForm

```typescript
interface Props {
  attributes: {
    colors: Array<{ id, name, slug, hexCode }>;
    sizes: Array<{ id, name, slug, sortOrder }>;
    genders: Array<{ id, label, slug }>;
    brands: Array<{ id, name, slug }>;
    categories: Array<{ id, name, slug }>;
  }
}
```

**Fetch via:** `getFormAttributes()` in page component

---

## 🔑 Key Functions

### Variant Generator

```typescript
import { generateVariantCombinations } from '@/lib/utils/variant-generator';

const variants = generateVariantCombinations(
  attributeGroups,  // [{ name, type, options }]
  '99.99',         // Base price
  'PRODUCT-SKU'    // SKU prefix
);

// Returns: Array<GeneratedVariant> with combinationId, attributes, sku, etc.
```

### Price Calculation

```typescript
import { calculateFinalPrice, calculatePriceBreakdown } from '@/lib/config/shop';

// If VAT included: returns input as-is
// If cost price: applies markup (30%) + VAT (15%)
const finalPrice = calculateFinalPrice(100, vatIncluded);

// Get breakdown: costPrice, markupAmount, vatAmount, finalPrice
const breakdown = calculatePriceBreakdown(100, false);
```

### Server Actions

```typescript
import {
  createProduct,
  getFormAttributes,
  checkSlugAvailability,
  quickCreateBrand,
  quickCreateCategory,
} from '@/lib/actions/product-master';

// Form submission
const result = await createProduct(submitData);
if (result.success) { /* handle success */ }

// Real-time slug check
const { available } = await checkSlugAvailability('my-product');
```

---

## 🎨 Form State Management

### Simple Product State

```typescript
const [productMode, setProductMode] = useState('simple');

form.setValue('variants', [{
  variantType: 'simple',
  sku: 'PROD-001',
  price: '99.99',
  inStock: 10,
  backorderable: false,
}]);
```

### Variable Product State

```typescript
const [productMode, setProductMode] = useState('variable');
const [attributeGroups, setAttributeGroups] = useState<AttributeGroup[]>([]);
const [generatedVariants, setGeneratedVariants] = useState<GeneratedVariant[]>([]);

// Add predefined color group
setAttributeGroups([{
  id: 'group-1',
  name: 'Color',
  type: 'color',
  options: colors.map(c => ({ value: c.name, colorId: c.id })),
  displayOrder: 0,
}]);

// Generate combinations
const variants = generateVariantCombinations(attributeGroups, price, sku);
setGeneratedVariants(variants);
```

---

## 🔍 Validation Schema

### Zod Schema Hierarchy

```
createProductFormSchema (discriminated union on 'productMode')
├── simpleProductSchema
│   └── variants: [simpleVariantSchema] (length === 1)
└── variableProductSchema
    ├── attributeGroups: [attributeGroupSchema] (min 1)
    └── variants: [variableVariantSchema] (min 1)
```

### Key Validations

```typescript
// Built-in checks:
✅ Product name min 3 chars
✅ Slug regex: /^[a-z0-9]+(?:-[a-z0-9]+)*$/
✅ At least 1 category selected
✅ Unique SKUs across variants
✅ Sale price < regular price
✅ Variable products have complete attribute assignments
```

---

## 🎨 UI Pattern Examples

### Attribute Group Type Selector

```tsx
<Select
  value={group.type}
  onValueChange={(type) => handleGroupTypeChange(groupIndex, type)}
>
  <SelectItem value="color">🎨 Color (Predefined)</SelectItem>
  <SelectItem value="size">📏 Size (Predefined)</SelectItem>
  <SelectItem value="custom">✏️ Custom</SelectItem>
</Select>
```

### Variant Table with Inline Editing

```tsx
<Table>
  <TableBody>
    {variants.map((variant, index) => (
      <TableRow key={variant.combinationId}>
        <TableCell>{variant.displayName}</TableCell>
        <TableCell>
          <Input
            value={variant.sku}
            onChange={(e) => updateVariant(index, { sku: e.target.value })}
          />
        </TableCell>
        <TableCell>
          <Input
            type="number"
            value={variant.price}
            onChange={(e) => updateVariant(index, { price: e.target.value })}
          />
        </TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>
```

### Bulk Operations

```tsx
<div className="flex gap-4">
  <Input
    placeholder="Price for all"
    value={bulkPrice}
    onChange={(e) => setBulkPrice(e.target.value)}
  />
  <Button onClick={() => {
    const updated = bulkUpdatePrice(variants, bulkPrice);
    setGeneratedVariants(updated);
  }}>
    Apply to All
  </Button>
</div>
```

---

## 🗄️ Database Insert Strategy

### Simple Product

```typescript
// 1 transaction:
await db.transaction(async (tx) => {
  const [product] = await tx.insert(products).values({ ... });
  await tx.insert(productToCategories).values([...]);
  const [variant] = await tx.insert(productVariants).values({
    productId: product.id,
    sku, price, inStock,
    colorId: null,  // No predefined attributes
    sizeId: null,
  });
  await tx.update(products).set({ defaultVariantId: variant.id });
});
```

### Variable Product with Predefined Attributes

```typescript
await db.transaction(async (tx) => {
  const [product] = await tx.insert(products).values({ ... });
  
  // For each variant:
  for (const variantData of variants) {
    // Extract predefined IDs
    const colorId = variantData.attributes.find(a => a.groupType === 'color')?.colorId;
    const sizeId = variantData.attributes.find(a => a.groupType === 'size')?.sizeId;
    
    const [variant] = await tx.insert(productVariants).values({
      productId: product.id,
      sku: variantData.sku,
      price: variantData.price,
      colorId,  // Direct FK to colors table
      sizeId,   // Direct FK to sizes table
      inStock: variantData.inStock,
    });
  }
});
```

### Variable Product with Custom Attributes

```typescript
await db.transaction(async (tx) => {
  const [product] = await tx.insert(products).values({ ... });
  
  // Create custom option groups
  for (const group of customAttributeGroups) {
    const [dbGroup] = await tx.insert(variantOptionGroups).values({
      name: group.name,
    });
    
    await tx.insert(productVariantOptions).values({
      productId: product.id,
      groupId: dbGroup.id,
    });
    
    for (const option of group.options) {
      const [dbValue] = await tx.insert(variantOptionValues).values({
        groupId: dbGroup.id,
        value: option.value,
      });
      
      // Track for later assignment
      customValueMap.set(`${group.name}:${option.value}`, dbValue.id);
    }
  }
  
  // Create variants and assignments
  for (const variantData of variants) {
    const [variant] = await tx.insert(productVariants).values({ ... });
    
    for (const attr of variantData.attributes) {
      if (attr.groupType === 'custom') {
        const valueId = customValueMap.get(`${attr.groupName}:${attr.value}`);
        await tx.insert(variantOptionAssignments).values({
          variantId: variant.id,
          optionValueId: valueId,
        });
      }
    }
  }
});
```

---

## 🎯 Common Patterns

### 1. Load Predefined Options on Type Change

```typescript
const handleGroupTypeChange = (index, type) => {
  if (type === 'color') {
    const options = attributes.colors.map(c => ({
      value: c.name,
      colorId: c.id,  // Critical: Track DB ID
    }));
    updateAttributeGroup(index, { type, name: 'Color', options });
  } else if (type === 'size') {
    const options = attributes.sizes.map(s => ({
      value: s.name,
      sizeId: s.id,  // Critical: Track DB ID
    }));
    updateAttributeGroup(index, { type, name: 'Size', options });
  }
};
```

### 2. Validate Before Submit

```typescript
const onSubmit = async (data) => {
  if (productMode === 'variable' && generatedVariants.length === 0) {
    toast.error('Generate variants before submitting');
    return;
  }
  
  // Check for duplicate SKUs
  const { hasDuplicates, duplicates } = findDuplicateSKUs(generatedVariants);
  if (hasDuplicates) {
    toast.error(`Duplicate SKUs found: ${duplicates.join(', ')}`);
    return;
  }
  
  // Proceed with submission
  const result = await createProduct(submitData);
};
```

### 3. Apply VAT to All Variants

```typescript
const processVariantsForSubmit = (variants) => {
  return variants.map(variant => {
    const inputPrice = parseFloat(variant.price);
    const finalPrice = calculateFinalPrice(inputPrice, vatIncluded);
    
    return {
      ...variant,
      price: finalPrice.toFixed(2),
    };
  });
};
```

---

## 🐛 Debugging Tips

### Check Generated Variants

```typescript
console.log('Generated Variants:', generatedVariants);
// Verify:
// - combinationId is unique
// - attributes array has correct length
// - colorId/sizeId present for predefined types
```

### Check Form State

```typescript
console.log('Form Values:', form.getValues());
console.log('Form Errors:', form.formState.errors);
```

### Check Submission Data

```typescript
const onSubmit = async (data) => {
  console.log('Submit Data:', JSON.stringify(data, null, 2));
  // Verify productMode matches expected schema
};
```

---

## 📊 Performance Considerations

- **Lazy Load**: Fetch attributes only when form mounts
- **Debounce**: Slug availability check (300ms)
- **Memoize**: Variant combinations if groups unchanged
- **Virtual Scroll**: For >100 variants in table
- **Transaction Timeout**: Set appropriate DB timeout for large variant inserts

---

## ✅ Testing Checklist

```bash
# Basic Flow
[ ] Create simple product with 1 variant
[ ] Create variable product with Color (2) x Size (3) = 6 variants
[ ] Generate variants → Edit table → Submit

# Validation
[ ] Empty required fields show errors
[ ] Duplicate slug rejected
[ ] Duplicate SKUs rejected
[ ] Sale price > regular price rejected

# Predefined Attributes
[ ] Color group loads colors from DB
[ ] Size group loads sizes from DB
[ ] Variant table shows color swatches
[ ] Submitted variants have color_id/size_id populated

# Custom Attributes
[ ] Add custom group (e.g., "Material")
[ ] Add custom options (e.g., "Wood", "Metal")
[ ] Generate variants with custom attributes
[ ] Verify variant_option_assignments created

# Bulk Operations
[ ] Bulk apply price updates all rows
[ ] Bulk apply stock updates all rows
[ ] Individual edits persist

# VAT Calculation
[ ] Toggle VAT → price breakdown updates
[ ] Cost price R100 → Final R149.50 (with 30% markup + 15% VAT)
```

---

## 🔗 Key Files Reference

```
/src/lib/validations/product.ts          ← Zod schemas
/src/lib/actions/product-master.ts       ← Server actions
/src/lib/utils/variant-generator.ts      ← Combination logic
/src/lib/config/shop.ts                  ← VAT/markup config
/src/components/admin/MasterProductCreateForm.tsx  ← Main form
/src/app/(admin)/admin/products/create/page.tsx    ← Page wrapper
```

---

## 🎓 Learning Resources

- **Discriminated Unions**: https://zod.dev/?id=discriminated-unions
- **React Hook Form**: https://react-hook-form.com/
- **Cartesian Product**: https://en.wikipedia.org/wiki/Cartesian_product
- **Shadcn UI**: https://ui.shadcn.com/docs/components

---

**Ready to create products? Start with a simple product, then graduate to variable!** 🚀
