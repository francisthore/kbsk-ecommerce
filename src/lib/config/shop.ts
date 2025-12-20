/**
 * Shop Configuration
 * 
 * IMPORTANT: These are DEFAULT/FALLBACK values only.
 * Actual shop settings are stored in the database (shop_settings table).
 * Use getShopSettings() from @/lib/actions/shop-settings to get live settings.
 * 
 * Admin can modify settings at: /admin/settings
 */

export const shopConfig = {
  /**
   * Currency settings
   * Default currency for the entire shop
   */
  currency: {
    code: 'ZAR',
    symbol: 'R',
    locale: 'en-ZA',
    name: 'South African Rand',
  },

  /**
   * Shop metadata
   */
  shop: {
    name: 'KBSK E-commerce',
    country: 'South Africa',
    timezone: 'Africa/Johannesburg',
  },

  /**
   * Free shipping threshold (in cents)
   */
  freeShippingThreshold: 500, // R500.00

  /**
   * Tax rate (VAT in South Africa is 15%)
   */
  taxRate: 0.15,

  /**
   * Default markup rate for pricing
   * Applied to cost price when VAT is not included
   */
  markupRate: 0.30, // 30% markup
} as const;

/**
 * Format price in shop currency
 * @param price - Price in cents or as decimal
 * @param showSymbol - Whether to show currency symbol
 */
export function formatShopPrice(
  price: number | string,
  showSymbol: boolean = true
): string {
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;

  if (isNaN(numPrice)) {
    return showSymbol ? 'R 0.00' : '0.00';
  }

  const formatted = new Intl.NumberFormat(shopConfig.currency.locale, {
    style: showSymbol ? 'currency' : 'decimal',
    currency: showSymbol ? shopConfig.currency.code : undefined,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numPrice);

  return formatted;
}

/**
 * Calculate VAT amount
 * @param amount - Amount to calculate VAT on
 */
export function calculateVAT(amount: number): number {
  return amount * shopConfig.taxRate;
}

/**
 * Calculate price including VAT
 * @param amount - Amount before VAT
 */
export function calculatePriceWithVAT(amount: number): number {
  return amount * (1 + shopConfig.taxRate);
}

/**
 * Calculate price excluding VAT (reverse calculation)
 * @param amount - Amount including VAT
 */
export function calculatePriceWithoutVAT(amount: number): number {
  return amount / (1 + shopConfig.taxRate);
}

/**
 * Apply markup to cost price
 * @param costPrice - Original cost price
 * @param markupRate - Markup rate (defaults to shop config)
 */
export function applyMarkup(
  costPrice: number,
  markupRate: number = shopConfig.markupRate
): number {
  return costPrice * (1 + markupRate);
}

/**
 * Calculate final selling price for database storage
 * This function handles both VAT-inclusive and VAT-exclusive scenarios
 * 
 * @param inputPrice - The price entered by the user
 * @param vatIncluded - Whether the input price already includes VAT
 * @returns Final price to store in database (always VAT-inclusive)
 * 
 * @example
 * // Scenario 1: Price entered DOES include VAT (R115 final price)
 * calculateFinalPrice(115, true) // Returns: 115.00
 * 
 * // Scenario 2: Price entered DOES NOT include VAT (R100 cost)
 * calculateFinalPrice(100, false) 
 * // Step 1: Apply 30% markup = R130
 * // Step 2: Add 15% VAT = R149.50
 * // Returns: 149.50
 */
export function calculateFinalPrice(
  inputPrice: number,
  vatIncluded: boolean
): number {
  if (vatIncluded) {
    // Price already includes VAT, store as-is
    return inputPrice;
  } else {
    // Price doesn't include VAT
    // Step 1: Apply markup to cost price
    const priceWithMarkup = applyMarkup(inputPrice);
    
    // Step 2: Add VAT to marked-up price
    const finalPrice = calculatePriceWithVAT(priceWithMarkup);
    
    return finalPrice;
  }
}

/**
 * Calculate breakdown of price components
 * Useful for displaying to admin what the final price includes
 * 
 * @param inputPrice - The price entered by the user
 * @param vatIncluded - Whether the input price includes VAT
 */
export function calculatePriceBreakdown(
  inputPrice: number,
  vatIncluded: boolean
) {
  if (vatIncluded) {
    const priceWithoutVAT = calculatePriceWithoutVAT(inputPrice);
    const vatAmount = calculateVAT(priceWithoutVAT);
    
    return {
      costPrice: inputPrice,
      markup: 0,
      markupAmount: 0,
      priceAfterMarkup: inputPrice,
      vatAmount,
      priceWithoutVAT,
      finalPrice: inputPrice,
      vatIncluded: true,
    };
  } else {
    const priceAfterMarkup = applyMarkup(inputPrice);
    const markupAmount = priceAfterMarkup - inputPrice;
    const vatAmount = calculateVAT(priceAfterMarkup);
    const finalPrice = priceAfterMarkup + vatAmount;
    
    return {
      costPrice: inputPrice,
      markup: shopConfig.markupRate,
      markupAmount,
      priceAfterMarkup,
      vatAmount,
      priceWithoutVAT: priceAfterMarkup,
      finalPrice,
      vatIncluded: false,
    };
  }
}

export type ShopConfig = typeof shopConfig;
