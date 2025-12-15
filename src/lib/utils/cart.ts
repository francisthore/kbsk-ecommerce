import { CartItemData, CartTotals, FreeShippingInfo } from '@/store/cart.store';

// Free shipping threshold in ZAR
export const FREE_SHIPPING_THRESHOLD = 1000;

/**
 * Calculate cart totals from items array
 */
export function calculateCartTotals(items: CartItemData[]): CartTotals {
  let subtotal = 0;
  let savings = 0;

  items.forEach((item) => {
    const currentPrice = parseFloat(item.salePrice || item.price);
    const originalPrice = parseFloat(item.price);
    
    subtotal += currentPrice * item.quantity;
    
    // Calculate savings if on sale
    if (item.salePrice) {
      const savingsPerItem = originalPrice - currentPrice;
      savings += savingsPerItem * item.quantity;
    }
  });

  const total = subtotal;

  return {
    subtotal,
    savings,
    total,
  };
}

/**
 * Check if cart is eligible for free shipping
 */
export function isFreeShippingEligible(total: number): FreeShippingInfo {
  const eligible = total >= FREE_SHIPPING_THRESHOLD;
  const amountRemaining = eligible ? 0 : FREE_SHIPPING_THRESHOLD - total;

  return {
    eligible,
    threshold: FREE_SHIPPING_THRESHOLD,
    amountRemaining,
  };
}

/**
 * Format price with R currency symbol
 */
export function formatPrice(price: number | string): string {
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;
  
  if (isNaN(numPrice)) {
    return 'R 0.00';
  }
  
  return `R ${numPrice.toLocaleString('en-ZA', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * Format price without currency symbol (for inputs)
 */
export function formatPriceNumber(price: number | string): string {
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;
  
  if (isNaN(numPrice)) {
    return '0.00';
  }
  
  return numPrice.toFixed(2);
}

/**
 * Validate quantity against available stock
 */
export function validateQuantity(
  requested: number,
  available: number
): { valid: boolean; quantity: number; message?: string } {
  if (requested < 1) {
    return {
      valid: false,
      quantity: 1,
      message: 'Quantity must be at least 1',
    };
  }

  if (requested > available) {
    return {
      valid: false,
      quantity: available,
      message: `Only ${available} items available in stock`,
    };
  }

  return {
    valid: true,
    quantity: requested,
  };
}

/**
 * Calculate savings percentage
 */
export function calculateSavingsPercent(
  originalPrice: number | string,
  salePrice: number | string
): number {
  const original = typeof originalPrice === 'string' ? parseFloat(originalPrice) : originalPrice;
  const sale = typeof salePrice === 'string' ? parseFloat(salePrice) : salePrice;

  if (isNaN(original) || isNaN(sale) || original <= 0) {
    return 0;
  }

  const savings = ((original - sale) / original) * 100;
  return Math.round(savings);
}

/**
 * Group cart items by supplier/warehouse
 */
export function groupItemsBySupplier(items: CartItemData[]): {
  regular: CartItemData[];
  supplier: CartItemData[];
} {
  const regular: CartItemData[] = [];
  const supplier: CartItemData[] = [];

  items.forEach((item) => {
    if (item.isSupplierWarehouse) {
      supplier.push(item);
    } else {
      regular.push(item);
    }
  });

  return { regular, supplier };
}

/**
 * Calculate total item count
 */
export function calculateItemCount(items: CartItemData[]): number {
  return items.reduce((total, item) => total + item.quantity, 0);
}

/**
 * Get variant display text
 */
export function getVariantDisplay(item: CartItemData): string {
  const parts: string[] = [];
  
  if (item.colorName) {
    parts.push(item.colorName);
  }
  
  if (item.sizeName) {
    parts.push(item.sizeName);
  }
  
  return parts.length > 0 ? parts.join(' • ') : '';
}

/**
 * Estimate shipping based on location
 */
export function estimateShipping(params: {
  country: string;
  province?: string;
  postalCode?: string;
  cartTotal: number;
}): { cost: number; estimatedDays: string } {
  const { country, province, cartTotal } = params;

  // Free shipping if eligible
  if (cartTotal >= FREE_SHIPPING_THRESHOLD) {
    return {
      cost: 0,
      estimatedDays: '3-5 business days',
    };
  }

  // South Africa domestic shipping
  if (country === 'ZA') {
    // Major cities - faster delivery
    const majorCities = ['GP', 'WC', 'KZN']; // Gauteng, Western Cape, KwaZulu-Natal
    if (province && majorCities.includes(province)) {
      return {
        cost: 99,
        estimatedDays: '2-3 business days',
      };
    }
    
    // Other provinces
    return {
      cost: 149,
      estimatedDays: '3-5 business days',
    };
  }

  // International shipping (not implemented yet)
  return {
    cost: 0,
    estimatedDays: 'Contact us for quote',
  };
}
