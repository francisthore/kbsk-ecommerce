# Shop Settings Quick Reference

## Overview
Database-driven configuration system for shop-wide settings including pricing, tax, currency, and features.

## Quick Commands

```bash
# Seed default settings into database
npm run db:seed:settings

# Or run directly
npx tsx scripts/seed-shop-settings.ts

# View settings in Drizzle Studio
npm run db:studio
```

## Usage in Code

### Get Settings (Server Component/Action)
```typescript
import { getShopSettings } from '@/lib/actions/shop-settings';

// In a server component or action
const { data: settings, isDefault } = await getShopSettings();

console.log(settings.shopName);        // "KBSK E-commerce"
console.log(settings.taxRate);         // "0.1500"
console.log(settings.markupRate);      // "0.3000"
console.log(settings.currencySymbol);  // "R"
```

### Update Settings (Admin Only)
```typescript
import { updateShopSettings } from '@/lib/actions/shop-settings';

await updateShopSettings({
  taxRate: 0.15,
  markupRate: 0.35,
  freeShippingThreshold: 750.00,
});
```

### Use in Pricing Calculations
```typescript
const { data: settings } = await getShopSettings();

// Calculate final price with markup and VAT
function calculateFinalPrice(costPrice: number, vatIncluded: boolean) {
  const markup = parseFloat(settings.markupRate);
  const taxRate = parseFloat(settings.taxRate);
  
  if (vatIncluded) {
    return costPrice * (1 + markup);
  } else {
    return costPrice * (1 + markup) * (1 + taxRate);
  }
}

const finalPrice = calculateFinalPrice(100, false);
// Result: R149.50 (R100 + 30% markup + 15% VAT)
```

## Admin Interface

Navigate to: **`/admin/settings`**

### Features
- ✅ 4 tabbed sections (General, Pricing, Business, Features)
- ✅ Live price calculation preview
- ✅ Real-time form validation
- ✅ Toast notifications
- ✅ Responsive design

### Tabs

**1. General**
- Shop name, country, timezone
- Currency (code, symbol, locale)

**2. Pricing & Tax**
- VAT rate (15%)
- Default markup rate (30%)
- Free shipping threshold (R500)
- Live pricing calculator

**3. Business Info**
- Registration number
- VAT number
- Email and phone
- Physical address

**4. Features**
- Guest checkout toggle
- Wishlist toggle
- Product reviews toggle
- Quote requests toggle

## Default Values

```typescript
{
  shopName: 'KBSK E-commerce',
  shopCountry: 'South Africa',
  shopTimezone: 'Africa/Johannesburg',
  currencyCode: 'ZAR',
  currencySymbol: 'R',
  currencyLocale: 'en-ZA',
  taxRate: '0.1500',      // 15% VAT
  markupRate: '0.3000',   // 30% markup
  freeShippingThreshold: '500.00',
  enableGuestCheckout: true,
  enableWishlist: true,
  enableReviews: true,
  enableQuotes: true,
}
```

## Database Schema

```sql
CREATE TABLE "shop_settings" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "shop_name" text NOT NULL DEFAULT 'KBSK E-commerce',
  "shop_country" text NOT NULL DEFAULT 'South Africa',
  "shop_timezone" text NOT NULL DEFAULT 'Africa/Johannesburg',
  "currency_code" text NOT NULL DEFAULT 'ZAR',
  "currency_symbol" text NOT NULL DEFAULT 'R',
  "currency_locale" text NOT NULL DEFAULT 'en-ZA',
  "tax_rate" numeric(5,4) NOT NULL DEFAULT '0.1500',
  "markup_rate" numeric(5,4) NOT NULL DEFAULT '0.3000',
  "free_shipping_threshold" numeric(10,2) NOT NULL DEFAULT '500.00',
  "business_registration_number" text,
  "vat_number" text,
  "business_email" text,
  "business_phone" text,
  "business_address" text,
  "enable_guest_checkout" boolean NOT NULL DEFAULT true,
  "enable_wishlist" boolean NOT NULL DEFAULT true,
  "enable_reviews" boolean NOT NULL DEFAULT true,
  "enable_quotes" boolean NOT NULL DEFAULT true,
  "updated_at" timestamp NOT NULL DEFAULT now(),
  "updated_by" uuid
);
```

## Files Structure

```
src/
├── lib/
│   ├── actions/
│   │   └── shop-settings.ts          # Server actions
│   ├── db/
│   │   └── schema/
│   │       └── shopSettings.ts       # Database schema
│   └── config/
│       └── shop.ts                   # Fallback config
├── components/
│   └── admin/
│       └── ShopSettingsForm.tsx      # Form component
└── app/
    └── (admin)/
        └── admin/
            └── settings/
                └── page.tsx          # Settings page

scripts/
└── seed-shop-settings.ts             # Seeding script
```

## Common Tasks

### Change Tax Rate
1. Go to `/admin/settings`
2. Click "Pricing & Tax" tab
3. Update "VAT Rate" field
4. Click "Save Settings"

### Add Business Information
1. Go to `/admin/settings`
2. Click "Business Info" tab
3. Fill in registration, VAT number, contact details
4. Click "Save Settings"

### Toggle Features
1. Go to `/admin/settings`
2. Click "Features" tab
3. Toggle switches on/off
4. Click "Save Settings"

### Reset to Defaults
```bash
# Run seeding script and choose "yes" when prompted
npm run db:seed:settings
```

## API

### getShopSettings()
```typescript
export async function getShopSettings(): Promise<{
  data: ShopSettings;
  isDefault: boolean;
}>
```
Returns settings from database, or defaults if none exist.

### updateShopSettings(data)
```typescript
export async function updateShopSettings(
  data: UpdateShopSettings
): Promise<{ success: boolean; error?: string }>
```
Updates settings (admin only). Tracks `updatedBy` and `updatedAt`.

### initializeShopSettings()
```typescript
export async function initializeShopSettings(): Promise<{
  success: boolean;
  data?: ShopSettings;
  error?: string;
}>
```
Seeds initial settings into database.

## Environment Variables

No additional environment variables needed. Uses existing database connection.

## Security

- All update operations require admin authentication
- Uses `verifyAdminRole()` middleware
- Tracks who made changes (`updated_by` field)
- Settings page only accessible to admin users

## Tips

1. **Always seed after fresh database setup**
   ```bash
   npm run db:push
   npm run db:seed:settings
   ```

2. **Check if using defaults**
   ```typescript
   const { isDefault } = await getShopSettings();
   if (isDefault) {
     console.log('⚠️ Using fallback defaults!');
   }
   ```

3. **Cache settings for performance**
   ```typescript
   import { unstable_cache } from 'next/cache';
   
   const getCachedSettings = unstable_cache(
     async () => getShopSettings(),
     ['shop-settings'],
     { revalidate: 300 } // 5 minutes
   );
   ```

4. **Type-safe access**
   ```typescript
   import type { ShopSettings } from '@/lib/db/schema/shopSettings';
   
   function useSettings(settings: ShopSettings) {
     // Full TypeScript support
     const rate = parseFloat(settings.taxRate);
   }
   ```

## Troubleshooting

**Settings not saving?**
- Check you're logged in as admin
- Verify database connection
- Check browser console for errors

**Using defaults instead of database?**
- Run seeding script: `npm run db:seed:settings`
- Check database has `shop_settings` table
- Verify settings exist: `SELECT * FROM shop_settings;`

**Price calculations incorrect?**
- Verify tax rate is decimal (0.15 = 15%)
- Check markup rate format
- Ensure using `parseFloat()` on numeric strings

---

**Last Updated**: December 20, 2024  
**Version**: 1.0.0
