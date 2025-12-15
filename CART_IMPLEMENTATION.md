# Cart System Implementation Guide

## Overview

A complete, production-ready cart system with both a popup drawer and dedicated cart page, integrated with authenticated users and guest sessions.

## Architecture

### Tech Stack
- **Framework**: Next.js 14 (App Router)
- **Database ORM**: Drizzle ORM with PostgreSQL
- **State Management**: Zustand
- **Styling**: Tailwind CSS
- **Icons**: Lucide Icons
- **Notifications**: Sonner (toast notifications)

## File Structure

```
src/
├── app/
│   ├── layout.tsx                    # Added CartDrawer and Toaster
│   └── (shop)/
│       └── cart/
│           ├── page.tsx              # Server-side cart page
│           └── CartPageClient.tsx    # Client cart page component
│
├── components/
│   └── cart/
│       ├── CartDrawer.tsx            # Slide-in drawer component
│       ├── CartItemRow.tsx           # Single cart item display
│       ├── CartQuantitySelector.tsx  # Quantity input with +/- buttons
│       ├── CartSummary.tsx           # Totals and checkout button
│       ├── EstimateShipping.tsx      # Shipping estimation form
│       ├── OrderInstructions.tsx     # Order notes textarea
│       ├── EmptyCart.tsx             # Empty cart state
│       └── index.ts                  # Barrel export
│
├── lib/
│   ├── actions/
│   │   └── cart.ts                   # Server actions (CRUD + shipping)
│   └── utils/
│       └── cart.ts                   # Helper functions
│
├── store/
│   ├── cart.store.ts                 # Zustand cart state (new)
│   └── cart.ts                       # Deprecated, re-exports new store
│
└── hooks/
    └── useDebounce.ts                # Debounce hook for inputs
```

## Core Features

### 1. Cart Drawer (Popup)

**Location**: `src/components/cart/CartDrawer.tsx`

**Features**:
- Slides in from right (400px width on desktop, full width on mobile)
- Opens when cart icon clicked (except on cart page)
- Closes via X button, backdrop click, or ESC key
- Prevents body scroll when open
- Shows free shipping eligibility banner
- Displays all cart items with quantity selectors
- Shows supplier warehouse notice for applicable items
- Footer with totals and checkout/view cart buttons

**Usage**:
```tsx
// Already added to src/app/layout.tsx
<CartDrawer />
```

### 2. Cart Page

**Location**: `src/app/(shop)/cart/page.tsx` + `CartPageClient.tsx`

**Features**:
- Server-side rendering for SEO
- Responsive layout (desktop table, mobile cards)
- Free shipping eligibility banner
- Cart items with inline quantity editing
- Collapsible sections:
  - Estimate shipping with province/postal code
  - Order instructions with auto-save
- Sidebar summary with totals and checkout button
- Empty cart state with CTA
- Supplier warehouse notices

**Layout**:
- Desktop: 2-column grid (items left, summary right)
- Mobile: Stacked layout

### 3. Cart Icon Behavior

**Location**: `src/components/Navbar.tsx`

**Behavior**:
- **On cart page**: Refresh page and scroll to top
- **On other pages**: Open cart drawer
- **Badge**: Shows item count (up to 99+)
- **Color**: Orange/gold (`var(--color-cta)`)

### 4. Global State Management

**Location**: `src/store/cart.store.ts`

**State Structure**:
```typescript
{
  items: CartItemData[];        // Cart items array
  totals: CartTotals;           // Subtotal, savings, total
  itemCount: number;            // Total quantity
  freeShipping: FreeShippingInfo; // Eligibility info
  isDrawerOpen: boolean;        // Drawer state
  isLoading: boolean;           // Loading state
}
```

**Key Methods**:
- `setCart()` - Sync cart from server
- `addItem()` - Add/update item
- `updateItemQuantity()` - Update quantity (optimistic)
- `removeItem()` - Remove item (optimistic)
- `clearCart()` - Empty cart
- `openDrawer()` / `closeDrawer()` - Toggle drawer
- `getItemCount()` - Get total item count

### 5. Server Actions

**Location**: `src/lib/actions/cart.ts`

**Available Actions**:

#### `getCart()`
Fetches complete cart with optimized single query joining:
- Cart items
- Product variants
- Products
- Brands
- Colors/sizes
- Images

Returns:
```typescript
{
  items: CartItemData[];
  totals: CartTotals;
  itemCount: number;
  freeShipping: FreeShippingInfo;
}
```

#### `addToCart(variantId, quantity)`
- Validates stock availability
- Creates cart if doesn't exist
- Adds new item or increments quantity
- Handles both guest and authenticated users

#### `updateCartItemQuantity(cartItemId, quantity)`
- Validates quantity against stock
- Removes item if quantity < 1
- Returns error if exceeds stock

#### `removeFromCart(cartItemId)`
- Removes item from cart
- Revalidates cart page

#### `clearCart()`
- Empties entire cart
- Maintains cart record

#### `getCartCount()`
- Returns total item quantity
- Used for navbar badge

#### `estimateShipping(country, province, postalCode)`
- Calculates shipping cost based on location
- Returns cost and estimated delivery time
- Free shipping if cart total ≥ R1000

#### `saveOrderInstructions(instructions)`
- Saves customer notes
- TODO: Requires schema update to add `orderInstructions` field

#### `mergeGuestCartToUser(userId)`
- Merges guest cart into user cart on login
- Combines quantities for existing items
- Deletes guest cart after merge

### 6. Utility Functions

**Location**: `src/lib/utils/cart.ts`

**Functions**:
- `calculateCartTotals()` - Compute subtotal, savings, total
- `isFreeShippingEligible()` - Check threshold (R1000)
- `formatPrice()` - Format with R symbol (e.g., R 3,849.00)
- `validateQuantity()` - Validate against stock
- `calculateSavingsPercent()` - Discount percentage
- `groupItemsBySupplier()` - Group by warehouse
- `calculateItemCount()` - Total quantity
- `getVariantDisplay()` - Format variant text (color • size)
- `estimateShipping()` - Calculate shipping cost

### 7. Component Details

#### CartItemRow
**Props**:
```typescript
{
  item: CartItemData;
  showRemoveButton?: boolean;
  compact?: boolean;
}
```

**Features**:
- Product thumbnail (clickable to product page)
- Brand name (uppercase, small)
- Product name (clickable)
- Variant info (color • size)
- Price display (sale price in orange, original strikethrough)
- Quantity selector
- Remove button
- Responsive layout

#### CartQuantitySelector
**Props**:
```typescript
{
  cartItemId: string;
  initialQuantity: number;
  maxStock: number;
  onUpdate?: (newQuantity: number) => void;
}
```

**Features**:
- Increment/decrement buttons
- Direct input with validation
- Min: 1, Max: stock
- Debounced updates (300ms)
- Optimistic UI with rollback on error
- Loading state during API call
- Toast notifications for errors

#### CartSummary
**Props**:
```typescript
{
  subtotal: number;
  savings: number;
  total: number;
  showCheckoutButton?: boolean;
  isDrawer?: boolean;
  onViewCart?: () => void;
}
```

**Features**:
- Subtotal display
- Savings display (if any)
- Total with tax note
- View Cart button (drawer only)
- Checkout button
- Secure payments badge

#### EstimateShipping
**Features**:
- Collapsible accordion
- Country selector (South Africa)
- Province dropdown (9 provinces)
- Postal code input
- Calculate button
- Results display with cost and delivery time

#### OrderInstructions
**Features**:
- Collapsible accordion
- Textarea (500 char limit)
- Auto-save with debounce (300ms)
- Character counter
- Saving indicator

#### EmptyCart
**Features**:
- Shopping bag icon
- "Your cart is empty" message
- "Continue Shopping" CTA button

## Guest Session Handling

### How it Works

1. **Guest User**:
   - Session created with unique token
   - Stored in HTTP-only cookie (7 days)
   - Cart linked to guest session ID

2. **User Signup/Login**:
   - Guest cart automatically merged into user cart
   - Quantities combined for duplicate items
   - Guest session and cart deleted

3. **Implementation**:
```typescript
// Already handled in auth actions
migrateGuestToUser() // Called on signup/login
```

## Checkout Flow

### Guest User:
1. Click "Checkout"
2. Redirect to `/login?redirect=/checkout`
3. After authentication, cart merges
4. Redirect to checkout

### Authenticated User:
1. Click "Checkout"
2. Direct redirect to `/checkout`
3. Validate cart (stock, prices)
4. Proceed to checkout

## Free Shipping Logic

**Threshold**: R1,000

**Banner Messages**:
- **Eligible**: "You are eligible for free shipping!"
- **Not Eligible**: "Add R [amount] more for free shipping!"

**Calculation**:
```typescript
const threshold = 1000;
const eligible = total >= threshold;
const amountRemaining = eligible ? 0 : threshold - total;
```

## Supplier Warehouse Items

**Notice**:
> *** These products will ship to you directly from our supplier warehouse
>
> _No additional delays expected_

**Detection**:
Currently set to `false` for all items. To enable:
1. Add `isSupplierWarehouse` field to product/variant schema
2. Update query in `getCart()` to include this field
3. Notice will automatically display for applicable items

## Responsive Design

### Breakpoints:
- **Mobile**: < 768px (stacked layout)
- **Tablet**: 768px - 1024px (single column)
- **Desktop**: > 1024px (two column)

### Cart Drawer:
- Mobile: Full width
- Desktop: 400px fixed width

### Cart Page:
- Mobile: Stacked items with cards
- Desktop: Table layout with columns

## Keyboard Accessibility

- **ESC**: Close cart drawer
- **Tab**: Navigate through items
- **Enter**: Activate buttons
- All interactive elements have focus styles
- ARIA labels on all buttons

## Error Handling

### Scenarios Covered:
1. **Product deleted**: Filtered out from cart
2. **Price changed**: Shows current price
3. **Out of stock**: Error message with max available
4. **Variant unavailable**: Filtered out
5. **API errors**: Toast notification with rollback

### Error Recovery:
- Optimistic UI updates
- Rollback on server error
- Clear error messages
- Toast notifications

## Performance Optimizations

1. **Single Query**: All cart data fetched in one optimized join
2. **Debounced Updates**: Quantity changes debounced (300ms)
3. **Optimistic Updates**: Instant UI feedback
4. **Server-side Rendering**: Cart page pre-rendered
5. **Lazy Loading**: Drawer only mounts when needed

## Testing Checklist

### ✅ Cart Operations:
- [ ] Add item to cart
- [ ] Update item quantity
- [ ] Remove item from cart
- [ ] Clear cart

### ✅ Guest Session:
- [ ] Create guest session
- [ ] Add items as guest
- [ ] Sign up and verify cart merge
- [ ] Log in and verify cart merge

### ✅ Stock Validation:
- [ ] Cannot exceed available stock
- [ ] Warning when adding more than available
- [ ] Update quantity respects stock limit

### ✅ UI/UX:
- [ ] Cart drawer opens/closes smoothly
- [ ] Cart icon badge updates in real-time
- [ ] Free shipping banner updates dynamically
- [ ] Toast notifications appear for all actions

### ✅ Responsive:
- [ ] Mobile cart drawer (full width)
- [ ] Tablet cart page (single column)
- [ ] Desktop cart page (two column)

### ✅ Edge Cases:
- [ ] Empty cart state
- [ ] Single item
- [ ] Multiple supplier items
- [ ] Large quantities (99+)
- [ ] Out of stock scenarios

## Next Steps

### Recommended Enhancements:

1. **Schema Updates**:
   - Add `orderInstructions` field to `carts` table
   - Add `isSupplierWarehouse` flag to products/variants

2. **Recently Viewed**:
   - Implement recently viewed products section on cart page
   - Store in localStorage or session

3. **Wishlist Integration**:
   - "Save for later" option
   - Move to wishlist button

4. **Advanced Features**:
   - Bulk quantity update
   - Apply coupon codes
   - Gift wrapping options
   - Delivery date selection

5. **Analytics**:
   - Track cart abandonment
   - Product removal reasons
   - Checkout funnel metrics

## Troubleshooting

### Cart not updating:
1. Check browser console for errors
2. Verify server actions are working
3. Check Zustand DevTools (install if needed)

### Guest cart not merging:
1. Verify `migrateGuestToUser()` is called in auth flow
2. Check cookies are enabled
3. Verify guest session exists before login

### Drawer not opening:
1. Check `isDrawerOpen` state in Zustand
2. Verify CartDrawer is rendered in layout
3. Check for CSS conflicts with `z-index`

## Support

For questions or issues:
1. Check this documentation
2. Review component props and examples
3. Check server action responses
4. Enable Zustand DevTools for state debugging

---

**Implementation Status**: ✅ Complete

All core features implemented and ready for testing.
