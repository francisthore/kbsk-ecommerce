/**
 * Product Utilities
 * Helper functions for product management
 */

/**
 * Generate a URL-friendly slug from a string
 * @param text - The text to convert to a slug
 * @returns A URL-friendly slug
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

/**
 * Generate SKU from product name and variant options
 * @param productName - The product name
 * @param optionValues - Array of option values (e.g., ["Red", "M"])
 * @returns A SKU string
 */
export function generateSKU(productName: string, optionValues: string[] = []): string {
  const baseCode = productName
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .join('')
    .substring(0, 3);
  
  const optionCode = optionValues
    .map(val => val.substring(0, 2).toUpperCase())
    .join('-');
  
  const timestamp = Date.now().toString(36).substring(-4);
  
  return optionCode 
    ? `${baseCode}-${optionCode}-${timestamp}`
    : `${baseCode}-${timestamp}`;
}

/**
 * Generate all permutations of variant options
 * @param optionGroups - Array of option groups with their values
 * @returns Array of all possible combinations
 */
export interface VariantOptionGroup {
  groupId: string;
  groupName: string;
  values: Array<{ valueId: string; value: string }>;
}

export interface VariantPermutation {
  options: Array<{
    groupId: string;
    groupName: string;
    valueId: string;
    value: string;
  }>;
  sku: string;
}

export function generateVariantPermutations(
  productName: string,
  optionGroups: VariantOptionGroup[]
): VariantPermutation[] {
  if (optionGroups.length === 0) {
    return [{
      options: [],
      sku: generateSKU(productName),
    }];
  }

  // Recursive function to generate permutations
  function permute(
    groups: VariantOptionGroup[],
    current: VariantPermutation['options'] = []
  ): VariantPermutation[] {
    if (groups.length === 0) {
      const optionValues = current.map(opt => opt.value);
      return [{
        options: current,
        sku: generateSKU(productName, optionValues),
      }];
    }

    const [firstGroup, ...restGroups] = groups;
    const results: VariantPermutation[] = [];

    for (const value of firstGroup.values) {
      const newCurrent = [
        ...current,
        {
          groupId: firstGroup.groupId,
          groupName: firstGroup.groupName,
          valueId: value.valueId,
          value: value.value,
        },
      ];
      results.push(...permute(restGroups, newCurrent));
    }

    return results;
  }

  return permute(optionGroups);
}

/**
 * Validate if a slug is unique (client-side check)
 * @param slug - The slug to validate
 * @param existingSlug - The current slug (for updates)
 * @returns boolean
 */
export function isSlugValid(slug: string, existingSlug?: string): boolean {
  if (existingSlug && slug === existingSlug) {
    return true;
  }
  
  // Basic validation
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) && slug.length >= 3;
}

/**
 * Format price for display
 * @param price - Price as string or number
 * @returns Formatted price string
 */
export function formatPrice(price: string | number): string {
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(numPrice);
}

/**
 * Calculate sale percentage
 * @param price - Original price
 * @param salePrice - Sale price
 * @returns Percentage off as number
 */
export function calculateSalePercentage(
  price: string | number,
  salePrice: string | number
): number {
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;
  const numSalePrice = typeof salePrice === 'string' ? parseFloat(salePrice) : salePrice;
  
  if (numPrice <= 0 || numSalePrice >= numPrice) {
    return 0;
  }
  
  return Math.round(((numPrice - numSalePrice) / numPrice) * 100);
}
