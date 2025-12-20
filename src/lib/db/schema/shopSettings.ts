import { pgTable, text, uuid, timestamp, numeric, boolean } from 'drizzle-orm/pg-core';
import { z } from 'zod';

/**
 * Shop Settings Table
 * Stores configurable shop-wide settings that can be modified from admin panel
 */
export const shopSettings = pgTable('shop_settings', {
  id: uuid('id').primaryKey().defaultRandom(),
  
  // Shop Information
  shopName: text('shop_name').notNull().default('KBSK E-commerce'),
  shopCountry: text('shop_country').notNull().default('South Africa'),
  shopTimezone: text('shop_timezone').notNull().default('Africa/Johannesburg'),
  
  // Currency Settings
  currencyCode: text('currency_code').notNull().default('ZAR'),
  currencySymbol: text('currency_symbol').notNull().default('R'),
  currencyLocale: text('currency_locale').notNull().default('en-ZA'),
  
  // Tax & Pricing
  taxRate: numeric('tax_rate', { precision: 5, scale: 4 }).notNull().default('0.1500'), // 15% VAT
  markupRate: numeric('markup_rate', { precision: 5, scale: 4 }).notNull().default('0.3000'), // 30% markup
  
  // Shipping
  freeShippingThreshold: numeric('free_shipping_threshold', { precision: 10, scale: 2 }).notNull().default('500.00'),
  
  // Business Information
  businessRegistrationNumber: text('business_registration_number'),
  vatNumber: text('vat_number'),
  businessEmail: text('business_email'),
  businessPhone: text('business_phone'),
  businessAddress: text('business_address'),
  
  // Feature Flags
  enableGuestCheckout: boolean('enable_guest_checkout').notNull().default(true),
  enableWishlist: boolean('enable_wishlist').notNull().default(true),
  enableReviews: boolean('enable_reviews').notNull().default(true),
  enableQuotes: boolean('enable_quotes').notNull().default(true),
  
  // Metadata
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  updatedBy: uuid('updated_by'), // Reference to admin user who made the change
});

// Validation schemas
export const updateShopSettingsSchema = z.object({
  // Shop Information
  shopName: z.string().min(1, 'Shop name is required').optional(),
  shopCountry: z.string().min(1, 'Country is required').optional(),
  shopTimezone: z.string().min(1, 'Timezone is required').optional(),
  
  // Currency Settings
  currencyCode: z.string().length(3, 'Currency code must be 3 characters').optional(),
  currencySymbol: z.string().min(1, 'Currency symbol is required').optional(),
  currencyLocale: z.string().min(1, 'Currency locale is required').optional(),
  
  // Tax & Pricing
  taxRate: z.number().min(0).max(1, 'Tax rate must be between 0 and 1').optional(),
  markupRate: z.number().min(0).max(5, 'Markup rate must be between 0 and 5').optional(),
  
  // Shipping
  freeShippingThreshold: z.number().min(0, 'Threshold must be positive').optional(),
  
  // Business Information
  businessRegistrationNumber: z.string().optional().nullable(),
  vatNumber: z.string().optional().nullable(),
  businessEmail: z.string().email('Invalid email').optional().nullable(),
  businessPhone: z.string().optional().nullable(),
  businessAddress: z.string().optional().nullable(),
  
  // Feature Flags
  enableGuestCheckout: z.boolean().optional(),
  enableWishlist: z.boolean().optional(),
  enableReviews: z.boolean().optional(),
  enableQuotes: z.boolean().optional(),
});

export type ShopSettings = typeof shopSettings.$inferSelect;
export type UpdateShopSettings = z.infer<typeof updateShopSettingsSchema>;
