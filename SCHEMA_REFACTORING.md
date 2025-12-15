# Database Schema Refactoring - Tools/PPE E-commerce Platform

## Overview

This document describes the comprehensive schema refactoring to support a tools and PPE (Personal Protective Equipment) e-commerce platform with both B2C and B2B capabilities.

## Key Features

- **B2B & B2C Support**: Unified account model supporting individual consumers and business accounts
- **Multi-user Business Accounts**: Multiple users can be associated with a single business account with different roles
- **Request for Quote (RFQ)**: Full quotes workflow from draft to conversion to orders
- **Tools & PPE Catalog**: Specialized product types, specifications, standards, and compatibility
- **Gender-aware Products**: Genders table retained and properly scoped for PPE/workwear
- **Advanced Inventory**: Stock management with backorder support, restock dates, and low stock thresholds
- **B2B Pricing**: Custom price lists for business accounts with quantity breaks
- **Enhanced Commerce**: Shipping methods, payment terms, tax support, and PO numbers

## Schema Organization

```
schema/
├── enums.ts                    # Shared enum definitions
├── accounts/                   # Account management (B2B/B2C)
│   ├── accounts.ts
│   ├── userAccounts.ts
│   ├── businessProfiles.ts
│   └── individualProfiles.ts
├── catalog/                    # Product-related extensions
│   ├── productStandards.ts
│   ├── bundles.ts
│   └── compatibility.ts
├── commerce/                   # Commerce extensions
│   ├── shipping.ts
│   ├── priceLists.ts
│   └── priceListItems.ts
├── quotes/                     # RFQ domain
│   ├── quotes.ts
│   ├── quoteItems.ts
│   └── quoteEvents.ts
└── filters/                    # Product filters
    ├── genders.ts
    ├── colors.ts
    └── sizes.ts
```

## Domain Models

### 1. Accounts Domain

#### `accounts`
Primary account entity supporting both individual (B2C) and business (B2B) customers.

**Key Fields:**
- `type`: 'individual' | 'business'
- `email`: Unique account email
- `status`: 'active' | 'suspended'
- `default_billing_address_id`, `default_shipping_address_id`

#### `user_accounts`
Junction table linking users to accounts with role-based permissions.

**Roles:**
- `owner`: Full account access
- `admin`: Administrative privileges
- `buyer`: Can create orders/quotes
- `viewer`: Read-only access

#### `business_profiles`
Extended profile for business accounts.

**Key Fields:**
- `legal_name`, `trading_name`, `vat_number`, `company_reg_number`
- `credit_terms`: 'prepaid' | '30d' | '60d'
- `credit_limit`: Maximum credit allowed
- `price_list_id`: Custom pricing reference
- `vat_exempt`, `purchase_order_required`

#### `individual_profiles`
Extended profile for individual customers.

**Key Fields:**
- `first_name`, `last_name`, `date_of_birth`

### 2. Updated Addresses

**Changes:**
- Added `account_id` as primary reference (B2B/B2C unified)
- Kept `user_id` nullable for backward compatibility
- Added `contact_name` and `phone` fields
- `type`: 'billing' | 'shipping'

### 3. Enhanced Catalog

#### `products`
**New Fields:**
- `slug`: SEO-friendly unique identifier
- `product_type`: 'tool' | 'accessory' | 'consumable' | 'ppe'
- `gender_id`: **NULLABLE** - used only for PPE/workwear and gendered accessories
- `specs`: JSONB field for structured specifications (voltage, torque, rpm, safety_rating, material, etc.)
- `is_bundle`: Indicates if product is a bundle
- `hazmat`, `un_number`: Shipping compliance fields
- `seo_meta_title`, `seo_meta_description`: SEO optimization
- `deleted_at`: Soft delete support

**Gender Usage:**
- Required for PPE/workwear products (helmets, gloves, safety boots, etc.)
- Optional for gendered accessories
- NULL for non-wearable tools and unisex items

#### `product_variants`
**New Fields:**
- `gender_id`: Variant-level gender for size differentiation (e.g., men's vs women's sizing)
- `backorderable`, `restock_date`: Inventory management
- `low_stock_threshold`: Alert threshold
- `weight`, `dimensions`: Shipping calculations
- `specs`: Per-variant specification overrides
- `deleted_at`: Soft delete

**Note:** `color_id` and `size_id` are now nullable (not all products have color/size variants)

#### `product_standards`
Safety and compliance standards (EN397, ANSI Z89.1, CE, OSHA, etc.)

#### `product_bundle_items`
Links parent products to child products for bundle kits.

#### `product_compatibility`
Platform compatibility for tools (M18, M12, 20V MAX, FlexVolt, etc.)

#### `product_images`
**New Fields:**
- `kind`: 'image' | 'video' | 'doc' (supports videos and documentation)

### 4. Enhanced Brands & Categories

#### `brands`
**Added:**
- `website`: Brand website URL
- `created_at`, `updated_at`: Timestamps

#### `categories`
**Added:**
- `description`: Category description
- `image_url`: Category banner/icon
- `seo_meta_title`, `seo_meta_description`: SEO fields

### 5. Genders Filter

**Retained and Enhanced:**
- `slug`: Unique slug for URL filtering
- Indexed on `slug` and `label` for performance
- Usage: PPE/workwear products and gendered accessories

### 6. Reviews Enhancement

**New Fields:**
- `status`: 'pending' | 'approved' | 'rejected' (moderation)
- `title`: Review title/headline
- `pros`, `cons`: Structured feedback

### 7. Updated Commerce

#### `carts`
**Added:**
- `account_id`: Link to account (B2B)

#### `orders`
**Major Changes:**
- `account_id`: **REQUIRED** - primary account reference
- `user_id`: Which user in the account created the order
- `po_number`: Purchase order reference (B2B)
- `payment_term`: 'prepaid' | '30d' | '60d' (B2B)
- `currency`: Multi-currency support
- Pricing breakdown: `subtotal`, `discount_total`, `tax_total`, `shipping_cost`, `total_amount`
- `shipping_method_id`: Link to shipping method
- `quote_id`: Link to quote if order originated from RFQ
- Indexed on `(account_id, status)` for performance

#### `order_items`
**Added:**
- `tax_rate`, `tax_amount`: Line-level tax calculation

#### `payments`
**Enhanced:**
- Added `bank_transfer` to payment methods
- Added `refunded` to payment status
- `meta`: JSONB for payment gateway metadata

#### `shipping_methods`
New table for shipping options.

**Fields:**
- `name`, `code` (unique), `flat_rate`, `active`

### 8. B2B Pricing

#### `price_lists`
Named price lists for business accounts.

**Fields:**
- `name`, `code` (unique), `description`, `currency`

#### `price_list_items`
Price list entries with quantity breaks.

**Fields:**
- `price_list_id`, `product_variant_id`, `min_qty`, `price`
- Unique constraint on `(price_list_id, product_variant_id, min_qty)`

### 9. Quotes Domain (RFQ)

#### `quotes`
Request for Quote workflow.

**Key Fields:**
- `account_id`, `requested_by_user_id`
- `status`: 'draft' | 'submitted' | 'in_review' | 'quoted' | 'accepted' | 'rejected' | 'expired' | 'converted'
- Pricing: `subtotal`, `discount_total`, `tax_total`, `shipping_cost`, `total`
- `notes_from_customer`, `internal_notes`
- `valid_until`: Quote expiration
- `cart_id`: Link to cart if quote created from cart
- `source`: 'self_service' | 'sales_agent' | 'import'
- Indexed on `(account_id, status)`

#### `quote_items`
Line items in a quote.

**Fields:**
- `quantity`, `target_price` (customer's desired price)
- `quoted_unit_price` (sales team's quoted price)
- `line_discount`, `line_notes`

#### `quote_events`
Audit trail for quote lifecycle.

**Fields:**
- `event_type`: 'created' | 'submitted' | 'reviewed' | 'quoted' | 'accepted' | 'rejected' | 'expired' | 'converted' | 'updated' | 'commented'
- `by_user_id`, `at` (timestamp), `payload` (JSONB)

## Migration Strategy

### Prerequisites
1. Install dependencies: `npm install drizzle-orm drizzle-kit zod`
2. Configure Drizzle Kit in `drizzle.config.ts`

### Steps

1. **Generate Migration**
   ```bash
   npm run db:generate
   ```

2. **Review Migration SQL**
   - Check `drizzle/migrations/` for generated SQL
   - Verify enum additions, table alterations, and new tables

3. **Run Migration**
   ```bash
   npm run db:migrate
   ```

4. **Seed Data** (Optional)
   ```bash
   npm run db:seed
   ```

### Breaking Changes

#### Required Changes
1. **Orders**: Now require `account_id` instead of just `user_id`
2. **Products**: `description` is now nullable (not all tools need long descriptions)
3. **Variants**: `color_id` and `size_id` are now nullable

#### Backward Compatibility
1. **Addresses**: Keep `user_id` nullable for existing data
2. **Carts**: Support both `account_id` and `user_id`

## Validation with Zod

All schemas include Zod validators for insert and select operations:

```typescript
// Example: Creating a business account
const accountData = insertAccountSchema.parse({
  type: 'business',
  email: 'orders@acmecorp.com',
  phone: '+1234567890'
});

const profileData = insertBusinessProfileSchema.parse({
  accountId: account.id,
  legalName: 'ACME Corporation',
  creditTerms: '30d',
  creditLimit: '50000.00'
});
```

## Indexes

### Performance Critical Indexes
- `products.slug` (unique)
- `product_variants.sku` (unique)
- `product_images(product_id, sort_order)`
- `orders(account_id, status)`
- `quotes(account_id, status)`
- `genders.slug` (unique)
- `accounts.email` (unique)
- `price_list_items(price_list_id, product_variant_id, min_qty)` (unique)

## Best Practices

### Gender Usage
```typescript
// PPE Product - gender is relevant
{
  name: "Safety Helmet",
  product_type: "ppe",
  gender_id: "uuid-for-unisex", // or specific gender
  specs: {
    safety_rating: "EN397",
    material: "ABS",
    adjustable: true
  }
}

// Tool Product - gender is null
{
  name: "Cordless Drill",
  product_type: "tool",
  gender_id: null, // Not applicable
  specs: {
    voltage: "20V",
    torque: "600 in-lbs",
    battery_type: "Lithium-ion"
  }
}
```

### Specs Field Examples
```typescript
// Power Tool
specs: {
  voltage: "20V",
  rpm: "0-2000",
  torque: "600 in-lbs",
  battery_type: "Lithium-ion",
  battery_included: true,
  platform: "20V MAX"
}

// PPE
specs: {
  safety_rating: "ANSI Z89.1",
  material: "Polycarbonate",
  ip_rating: "IP54",
  sizes_available: ["S", "M", "L", "XL"]
}

// Consumable
specs: {
  pack_size: 100,
  material: "Steel",
  coating: "Zinc",
  diameter: "6mm"
}
```

## Testing Checklist

- [ ] Individual customer can create account and place orders
- [ ] Business account with multiple users works correctly
- [ ] User roles (owner, admin, buyer, viewer) enforce permissions
- [ ] Quote workflow from draft to converted order
- [ ] Gender filtering works for PPE products
- [ ] Product bundles display correctly
- [ ] Price lists apply to business accounts
- [ ] Shipping methods calculate correctly
- [ ] Tax calculations on orders
- [ ] Soft delete for products/variants

## Next Steps

1. Update application code to use new account-based architecture
2. Create migration scripts for existing user data to accounts
3. Implement RFQ UI workflows
4. Add business account management dashboard
5. Create price list management interface
6. Implement specs-based product filtering
7. Add standards/compliance badges to product displays

## Support

For questions or issues with the schema:
1. Check this documentation
2. Review Zod validation errors for data requirements
3. Check Drizzle ORM relations for query patterns
4. Consult TypeScript types exported from schema files
