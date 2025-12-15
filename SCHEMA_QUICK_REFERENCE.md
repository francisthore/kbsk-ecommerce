# Quick Reference - Schema Usage

## Common Patterns

### Creating a Business Account

```typescript
import { db } from '@/lib/db';
import { 
  accounts, 
  businessProfiles, 
  userAccounts,
  insertAccountSchema,
  insertBusinessProfileSchema,
  insertUserAccountSchema
} from '@/lib/db/schema';

// 1. Create account
const account = await db.insert(accounts).values({
  type: 'business',
  email: 'orders@acmecorp.com',
  phone: '+1234567890',
  status: 'active'
}).returning();

// 2. Create business profile
const profile = await db.insert(businessProfiles).values({
  accountId: account.id,
  legalName: 'ACME Corporation',
  tradingName: 'ACME',
  creditTerms: '30d',
  creditLimit: '50000.00',
  vatExempt: false,
  purchaseOrderRequired: true
}).returning();

// 3. Link user as owner
await db.insert(userAccounts).values({
  userId: currentUser.id,
  accountId: account.id,
  role: 'owner'
});
```

### Creating a PPE Product

```typescript
import { db } from '@/lib/db';
import { products, productStandards, insertProductSchema } from '@/lib/db/schema';

// 1. Create PPE product with gender
const product = await db.insert(products).values({
  name: 'Safety Helmet - Hard Hat',
  slug: 'safety-helmet-hard-hat',
  productType: 'ppe',
  genderId: unisexGenderId, // or specific gender
  categoryId: safetyEquipmentCategoryId,
  brandId: brandId,
  specs: {
    material: 'ABS',
    safety_rating: 'Type I',
    adjustable: true,
    weight_grams: 350,
    color_options: ['white', 'yellow', 'red']
  },
  isPublished: true
}).returning();

// 2. Add safety standards
await db.insert(productStandards).values([
  { productId: product.id, code: 'EN397', label: 'European Safety Standard' },
  { productId: product.id, code: 'ANSI Z89.1', label: 'American National Standard' }
]);
```

### Creating a Tool Product (No Gender)

```typescript
// Tool products don't need gender
const drill = await db.insert(products).values({
  name: 'Cordless Drill Driver 20V',
  slug: 'cordless-drill-driver-20v',
  productType: 'tool',
  genderId: null, // No gender for tools
  brandId: brandId,
  specs: {
    voltage: '20V',
    battery_type: 'Lithium-ion',
    max_torque: '600 in-lbs',
    no_load_speed: '0-2000 RPM',
    chuck_size: '1/2"',
    led_light: true
  },
  isPublished: true
}).returning();

// Add platform compatibility
await db.insert(productCompatibility).values({
  productId: drill.id,
  platform: '20V MAX'
});
```

### Creating a Product Bundle

```typescript
// 1. Create bundle product
const bundle = await db.insert(products).values({
  name: 'Complete Safety Starter Kit',
  slug: 'complete-safety-starter-kit',
  productType: 'ppe',
  isBundle: true,
  isPublished: true
}).returning();

// 2. Add bundle items
await db.insert(productBundleItems).values([
  { parentProductId: bundle.id, childProductId: helmetId, quantity: 1 },
  { parentProductId: bundle.id, childProductId: glovesId, quantity: 1 },
  { parentProductId: bundle.id, childProductId: safetyGlassesId, quantity: 1 },
  { parentProductId: bundle.id, childProductId: vestId, quantity: 1 }
]);
```

### Creating a Quote (RFQ)

```typescript
import { db } from '@/lib/db';
import { quotes, quoteItems, quoteEvents } from '@/lib/db/schema';

// 1. Create quote
const quote = await db.insert(quotes).values({
  accountId: businessAccount.id,
  requestedByUserId: currentUser.id,
  status: 'draft',
  currency: 'USD',
  source: 'self_service',
  notesFromCustomer: 'Need bulk pricing for construction project'
}).returning();

// 2. Add quote items
await db.insert(quoteItems).values([
  {
    quoteId: quote.id,
    productVariantId: helmetVariant.id,
    quantity: 50,
    targetPrice: '15.00' // Customer's desired price
  },
  {
    quoteId: quote.id,
    productVariantId: glovesVariant.id,
    quantity: 100,
    targetPrice: '8.00'
  }
]);

// 3. Submit quote
await db.update(quotes)
  .set({ status: 'submitted', updatedAt: new Date() })
  .where(eq(quotes.id, quote.id));

// 4. Log event
await db.insert(quoteEvents).values({
  quoteId: quote.id,
  eventType: 'submitted',
  byUserId: currentUser.id
});
```

### Creating an Order from Quote

```typescript
import { db } from '@/lib/db';
import { orders, orderItems, quotes } from '@/lib/db/schema';

// 1. Create order referencing quote
const order = await db.insert(orders).values({
  accountId: quote.accountId,
  userId: currentUser.id,
  quoteId: quote.id,
  status: 'pending',
  paymentTerm: '30d',
  poNumber: 'PO-2024-001',
  subtotal: '2500.00',
  taxTotal: '200.00',
  shippingCost: '50.00',
  totalAmount: '2750.00',
  shippingAddressId: shippingAddr.id,
  billingAddressId: billingAddr.id
}).returning();

// 2. Add order items (from quote items)
const items = await db.select().from(quoteItems).where(eq(quoteItems.quoteId, quote.id));

await db.insert(orderItems).values(
  items.map(item => ({
    orderId: order.id,
    productVariantId: item.productVariantId,
    quantity: item.quantity,
    priceAtPurchase: item.quotedUnitPrice,
    taxRate: '0.08',
    taxAmount: calculateTax(item.quotedUnitPrice, item.quantity)
  }))
);

// 3. Mark quote as converted
await db.update(quotes)
  .set({ status: 'converted', updatedAt: new Date() })
  .where(eq(quotes.id, quote.id));
```

### Querying with Relations

```typescript
import { db } from '@/lib/db';
import { products, productVariants, brands, categories } from '@/lib/db/schema';

// Get product with all relations
const productWithDetails = await db.query.products.findFirst({
  where: eq(products.slug, 'safety-helmet-hard-hat'),
  with: {
    brand: true,
    category: true,
    gender: true,
    variants: {
      with: {
        color: true,
        size: true,
        images: true
      }
    },
    standards: true,
    bundleItems: {
      with: {
        childProduct: true
      }
    }
  }
});
```

### Filtering Products by Gender (PPE)

```typescript
import { db } from '@/lib/db';
import { products, genders } from '@/lib/db/schema';
import { eq, and, isNotNull } from 'drizzle-orm';

// Get all PPE products for a specific gender
const mensPPE = await db.query.products.findMany({
  where: and(
    eq(products.productType, 'ppe'),
    eq(products.genderId, mensGenderId),
    eq(products.isPublished, true)
  ),
  with: {
    gender: true,
    variants: true
  }
});

// Get unisex or gender-neutral tools (gender is null)
const tools = await db.query.products.findMany({
  where: and(
    eq(products.productType, 'tool'),
    isNull(products.genderId)
  )
});
```

### Applying Price Lists (B2B)

```typescript
import { db } from '@/lib/db';
import { businessProfiles, priceListItems } from '@/lib/db/schema';

// Get business pricing
const businessProfile = await db.query.businessProfiles.findFirst({
  where: eq(businessProfiles.accountId, accountId),
  with: {
    priceList: {
      with: {
        items: {
          where: eq(priceListItems.productVariantId, variantId)
        }
      }
    }
  }
});

// Calculate price based on quantity
const price = businessProfile?.priceList?.items
  .filter(item => quantity >= item.minQty)
  .sort((a, b) => b.minQty - a.minQty)[0]?.price || variant.price;
```

### Creating a Review

```typescript
import { db } from '@/lib/db';
import { reviews } from '@/lib/db/schema';

const review = await db.insert(reviews).values({
  productId: product.id,
  userId: currentUser.id,
  rating: 5,
  title: 'Excellent safety helmet',
  comment: 'Very comfortable and meets all safety standards',
  pros: 'Lightweight, adjustable, great visibility',
  cons: 'Could use better ventilation',
  status: 'pending' // Will be moderated
}).returning();
```

### Searching Products by Specs

```typescript
import { db } from '@/lib/db';
import { products } from '@/lib/db/schema';
import { sql } from 'drizzle-orm';

// Find all 20V cordless tools
const cordlessTools = await db.select()
  .from(products)
  .where(
    sql`${products.specs}->>'voltage' = '20V'`
  );

// Find products with specific safety rating
const safetyProducts = await db.select()
  .from(products)
  .where(
    sql`${products.specs}->'safety_rating' ? 'EN397'`
  );
```

## Important Notes

### Gender Field Usage

```typescript
// ✅ CORRECT: PPE product with gender
{
  name: "Women's Safety Boots",
  productType: 'ppe',
  genderId: womensGenderId
}

// ✅ CORRECT: Tool without gender
{
  name: "Impact Driver",
  productType: 'tool',
  genderId: null
}

// ✅ CORRECT: Unisex PPE
{
  name: "Safety Goggles",
  productType: 'ppe',
  genderId: unisexGenderId
}

// ❌ WRONG: Forcing gender on non-gendered product
{
  name: "Drill Bit Set",
  productType: 'consumable',
  genderId: mensGenderId // Makes no sense
}
```

### Account vs User

- **User**: Individual person with login credentials
- **Account**: Billing/ordering entity (can be individual or business)
- **UserAccount**: Links users to accounts with roles

```typescript
// B2C: One user, one account (owner)
User → UserAccount (owner) → Account (individual)

// B2B: Multiple users, one account (different roles)
User1 → UserAccount (owner) → Account (business)
User2 → UserAccount (admin) → Account (business)
User3 → UserAccount (buyer) → Account (business)
```

### Order Creation

Always create orders with:
1. `account_id` (required)
2. `user_id` (which user placed it)
3. Pricing breakdown (subtotal, tax, shipping, total)
4. Addresses
5. Optional: `quote_id` if from RFQ
6. Optional: `po_number` for B2B

## Validation Examples

```typescript
import { insertProductSchema, insertQuoteSchema } from '@/lib/db/schema';

// Validate product data
const validatedProduct = insertProductSchema.parse({
  name: 'Safety Helmet',
  slug: 'safety-helmet',
  productType: 'ppe',
  // ... other fields
});

// Will throw ZodError if invalid
try {
  const quote = insertQuoteSchema.parse(quoteData);
} catch (error) {
  if (error instanceof ZodError) {
    console.error(error.errors);
  }
}
```

## Performance Tips

1. **Use indexes**: Queries on `slug`, `sku`, `email` are indexed
2. **Batch inserts**: Use `.values([...])` for multiple records
3. **Select specific fields**: Don't select everything if you don't need it
4. **Use relations**: Drizzle relations are optimized

```typescript
// ❌ Slow: Multiple queries
const product = await db.select().from(products).where(eq(products.id, id));
const brand = await db.select().from(brands).where(eq(brands.id, product.brandId));

// ✅ Fast: Single query with relations
const product = await db.query.products.findFirst({
  where: eq(products.id, id),
  with: { brand: true }
});
```
