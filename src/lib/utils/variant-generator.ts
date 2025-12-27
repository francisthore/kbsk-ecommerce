/**
 * =====================================================
 * VARIANT COMBINATIONS GENERATOR
 * =====================================================
 * 
 * Generates all possible variant combinations (Cartesian product)
 * from attribute groups while properly tracking predefined IDs
 */

import type { AttributeGroup, AttributeOption, VariableVariant } from '@/lib/validations/product';

export interface GeneratedVariant extends Omit<VariableVariant, 'id'> {
  combinationId: string;
  displayName: string;
  variantType: 'variable';
  attributes: Array<{
    groupName: string;
    groupType: 'color' | 'size' | 'custom';
    value: string;
    colorId?: string;
    sizeId?: string;
  }>;
  colorId?: string;
  sizeId?: string;
  sku: string;
  price: string;
  salePrice?: string;
  inStock: number;
  backorderable: boolean;
  isEnabled: boolean;
}

/**
 * Generate Cartesian product of all attribute options
 * 
 * Example:
 * Input: [
 *   { name: "Color", options: [Red, Blue] },
 *   { name: "Size", options: [S, M] }
 * ]
 * Output: [Red/S, Red/M, Blue/S, Blue/M]
 */
function cartesianProduct<T>(arrays: T[][]): T[][] {
  if (arrays.length === 0) return [[]];
  if (arrays.length === 1) return arrays[0].map(item => [item]);

  return arrays.reduce<T[][]>(
    (acc, current) => {
      return acc.flatMap(accItem =>
        current.map(currentItem => [...accItem, currentItem])
      );
    },
    [[]]
  );
}

/**
 * Generate all variant combinations from attribute groups
 * 
 * @param attributeGroups - Array of attribute groups with their options
 * @param basePrice - Optional default price for all variants
 * @param baseSKU - Optional SKU prefix/pattern
 * @returns Array of fully-formed variant objects ready for form state
 */
export function generateVariantCombinations(
  attributeGroups: AttributeGroup[],
  basePrice: string = '0',
  baseSKU: string = 'SKU'
): GeneratedVariant[] {
  // Validate input
  if (!attributeGroups || attributeGroups.length === 0) {
    throw new Error('At least one attribute group is required');
  }

  const validGroups = attributeGroups.filter(
    group => group.name && group.options && group.options.length > 0
  );

  if (validGroups.length === 0) {
    throw new Error('No valid attribute groups with options found');
  }

  // Prepare arrays for Cartesian product
  const optionArrays = validGroups.map(group =>
    group.options.map(option => ({
      groupName: group.name,
      groupType: group.type,
      value: option.value,
      colorId: option.colorId,
      sizeId: option.sizeId,
      displayOrder: option.displayOrder,
    }))
  );

  // Generate combinations
  const combinations = cartesianProduct(optionArrays);

  // Transform into variant objects
  const variants: GeneratedVariant[] = combinations.map((combination, index) => {
    // Create unique combination ID (for React keys and tracking)
    const combinationId = combination
      .map(attr => `${attr.groupType}:${attr.value}`)
      .join('|');

    // Create human-readable display name
    const displayName = combination.map(attr => attr.value).join(' / ');

    // Generate SKU pattern
    const skuSuffix = combination
      .map(attr => {
        // Use first 3 chars of value, uppercase
        return attr.value.substring(0, 3).toUpperCase();
      })
      .join('-');
    
    const sku = `${baseSKU}-${skuSuffix}-${(index + 1).toString().padStart(3, '0')}`;

    // Extract colorId and sizeId from combination
    const colorAttr = combination.find(attr => attr.groupType === 'color');
    const sizeAttr = combination.find(attr => attr.groupType === 'size');

    // Build variant object
    return {
      variantType: 'variable' as const,
      combinationId,
      displayName,
      attributes: combination.map(attr => ({
        groupName: attr.groupName,
        groupType: attr.groupType,
        value: attr.value,
        colorId: attr.colorId,
        sizeId: attr.sizeId,
      })),
      colorId: colorAttr?.colorId,
      sizeId: sizeAttr?.sizeId,
      sku,
      price: basePrice,
      salePrice: undefined,
      inStock: 0,
      backorderable: false,
      isEnabled: true,
      weight: undefined,
      dimensions: undefined,
    };
  });

  return variants;
}

/**
 * Validate that all variants have complete attribute assignments
 * 
 * @param variants - Generated variants
 * @param expectedAttributeCount - Number of attribute groups
 * @returns Validation result
 */
export function validateVariantCompleteness(
  variants: GeneratedVariant[],
  expectedAttributeCount: number
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  variants.forEach((variant, index) => {
    if (variant.attributes.length !== expectedAttributeCount) {
      errors.push(
        `Variant ${index + 1} (${variant.displayName}) has incomplete attributes`
      );
    }

    if (!variant.sku || variant.sku.trim() === '') {
      errors.push(`Variant ${index + 1} (${variant.displayName}) has no SKU`);
    }

    const price = parseFloat(variant.price);
    if (isNaN(price) || price < 0) {
      errors.push(`Variant ${index + 1} (${variant.displayName}) has invalid price`);
    }
  });

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Check for duplicate SKUs in variant list
 * 
 * @param variants - Array of variants to check
 * @returns Object with duplicates found and list of duplicate SKUs
 */
export function findDuplicateSKUs(variants: GeneratedVariant[]): {
  hasDuplicates: boolean;
  duplicates: string[];
} {
  const skuCounts = new Map<string, number>();
  
  variants.forEach(variant => {
    const count = skuCounts.get(variant.sku) || 0;
    skuCounts.set(variant.sku, count + 1);
  });

  const duplicates = Array.from(skuCounts.entries())
    .filter(([_, count]) => count > 1)
    .map(([sku]) => sku);

  return {
    hasDuplicates: duplicates.length > 0,
    duplicates,
  };
}

/**
 * Bulk update price for all variants
 * 
 * @param variants - Variants to update
 * @param newPrice - New price to apply
 * @returns Updated variants
 */
export function bulkUpdatePrice(
  variants: GeneratedVariant[],
  newPrice: string
): GeneratedVariant[] {
  return variants.map(variant => ({
    ...variant,
    price: newPrice,
  }));
}

/**
 * Bulk update stock for all variants
 * 
 * @param variants - Variants to update
 * @param newStock - New stock quantity
 * @returns Updated variants
 */
export function bulkUpdateStock(
  variants: GeneratedVariant[],
  newStock: number
): GeneratedVariant[] {
  return variants.map(variant => ({
    ...variant,
    inStock: newStock,
  }));
}

/**
 * Apply markup percentage to all variant prices
 * 
 * @param variants - Variants to update
 * @param markupPercentage - Markup to apply (e.g., 20 for 20%)
 * @returns Updated variants with new prices
 */
export function applyMarkupToVariants(
  variants: GeneratedVariant[],
  markupPercentage: number
): GeneratedVariant[] {
  return variants.map(variant => {
    const currentPrice = parseFloat(variant.price);
    if (isNaN(currentPrice)) return variant;

    const newPrice = currentPrice * (1 + markupPercentage / 100);
    
    return {
      ...variant,
      price: newPrice.toFixed(2),
    };
  });
}
