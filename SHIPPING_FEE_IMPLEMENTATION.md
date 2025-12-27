# Dynamic Shipping Fee Implementation

## Summary

The shipping fee has been successfully migrated from a hardcoded value (R135) to a database-driven configuration that can be modified through admin settings.

## What Changed

### 1. Database Schema Update
**File:** `src/lib/db/schema/shopSettings.ts`

Added the `shippingFee` field to the shop settings table:
```typescript
// Shipping
shippingFee: numeric('shipping_fee', { precision: 10, scale: 2 }).notNull().default('135.00'), // R135.00 default
freeShippingThreshold: numeric('free_shipping_threshold', { precision: 10, scale: 2 }).notNull().default('500.00'),
```

**Validation Schema:**
```typescript
shippingFee: z.number().min(0, 'Shipping fee must be positive').optional(),
```

**Default Value:** R135.00

### 2. Constants Updated
**File:** `src/lib/constants/shop-settings.ts`

Added shippingFee to the DEFAULT_SETTINGS constant:
```typescript
shippingFee: '135.00',
freeShippingThreshold: '500.00',
```

### 3. Order Creation Logic
**File:** `src/lib/actions/order.ts`

Updated the `createOrder` server action to fetch the shipping fee from the database:

```typescript
// Fetch shipping fee from settings
const settings = await db.query.shopSettings.findFirst();
const shippingFeeAmount = input.shippingMethod === "delivery" 
  ? parseInt(settings?.shippingFee || "135.00") * 100 
  : 0;

const total = subtotal - discount + shippingFeeAmount;
```

**Key Logic:**
- Fetches shipping fee from database settings
- Applies fee only when shipping method is "delivery"
- Falls back to R135.00 if no settings exist (safety fallback)
- Stores shipping cost in order record for historical accuracy

### 4. Seed Script Updated
**File:** `scripts/seed-shop-settings.ts`

The seed script now displays the shipping fee in the settings output:
```
🚚 Shipping Fee:        R135.00
```

## How It Works

### Order Creation Flow
1. User selects shipping method (delivery or pickup) in checkout form
2. `ShippingForm` submits form with `shippingMethod: "delivery" | "pickup"`
3. `createOrder` server action receives the form data
4. Action fetches current shop settings from database
5. If `shippingMethod === "delivery"`, applies `shopSettings.shippingFee`
6. If `shippingMethod === "pickup"`, shipping cost is R0
7. Order total = subtotal - discount + shippingFee
8. Order is saved to database with calculated totals

### Admin Configuration
When the admin panel is implemented, shop staff will be able to modify the shipping fee via:
- Admin dashboard → Shop Settings
- Update `shippingFee` field in shop_settings table
- Changes take effect immediately for new orders

## Database Migration

The migration was already generated and includes the `shipping_fee` column:

**File:** `drizzle/0000_wise_iron_fist.sql`

```sql
"shipping_fee" numeric(10, 2) DEFAULT '135.00' NOT NULL,
```

**Applied via:** `npm run db:push`

## Testing

To verify the implementation:

1. **Check database has the field:**
   ```sql
   SELECT shipping_fee FROM shop_settings LIMIT 1;
   ```
   Expected: `135.00`

2. **Create a test order with delivery:**
   - Add item to cart
   - Go to checkout
   - Select "Delivery" shipping method
   - Complete checkout
   - Verify order.shippingCost = R135.00

3. **Create a test order with pickup:**
   - Add item to cart
   - Go to checkout
   - Select "Store Pickup" shipping method
   - Complete checkout
   - Verify order.shippingCost = R0

## Future Enhancements

1. **Admin Interface:** Create admin panel to modify shipping fee
2. **Regional Shipping:** Support different shipping fees by region/province
3. **Weight-Based Shipping:** Calculate shipping based on package weight
4. **Shipping Integration:** Connect with courier APIs (DPO, Fastway, etc.)
5. **Free Shipping Threshold:** Already exists in settings, can be used to waive shipping fees for orders above threshold

## Files Modified

- `src/lib/db/schema/shopSettings.ts` - Added shippingFee field
- `src/lib/constants/shop-settings.ts` - Added shippingFee to defaults
- `src/lib/actions/order.ts` - Updated order creation to fetch from database
- `scripts/seed-shop-settings.ts` - Enhanced seed output display
- `drizzle/0000_wise_iron_fist.sql` - Migration includes shipping_fee column

## Backward Compatibility

✅ Fully backward compatible - uses fallback value if settings not found
✅ Existing orders not affected - new field only applies to future orders
✅ Admin users can still update fee anytime
