# KBSK Trading - Quick Reference Card

## 🚀 Import & Use (Copy-Paste Ready)

### Complete Page Template
```tsx
import { Navbar, Card, Footer } from "@/components";

export default function Page() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar 
        showUtilityBar={true}
        cartItemCount={0}
        onSearchClick={() => {}}
        onCartClick={() => {}}
      />
      
      <main className="flex-1 bg-light-200">
        <div className="mx-auto max-w-7xl px-4 py-12">
          {/* Your content */}
        </div>
      </main>
      
      <Footer showPayments={true} showNewsletter={true} />
    </div>
  );
}
```

---

## 📦 Component Props (Essential)

### Navbar
```tsx
<Navbar 
  showUtilityBar={true}           // Optional top bar
  cartItemCount={3}                // Badge number
  onSearchClick={() => {}}         // Search handler
  onCartClick={() => {}}           // Cart handler
/>
```

### Card
```tsx
<Card
  title="Product Name"             // Required
  imageSrc="/products/item.svg"    // Required
  price={99.99}                    // Number
  originalPrice={149.99}           // For discounts
  rating={4.5}                     // 0-5 stars
  reviewCount={127}                // Number of reviews
  badge="Bestseller"               // New|Sale|PPE|Limited
  href="/products/123"             // Link URL
  onAddToCart={() => {}}           // Cart callback
  compact={false}                  // Sidebar mode
/>
```

### Footer
```tsx
<Footer 
  showPayments={true}              // Payment icons
  showNewsletter={true}            // Newsletter form
  copyrightYear={2025}             // Copyright year
  companyName="KBSK Trading"       // Company name
/>
```

---

## 🎨 Common Layouts

### Product Grid (4 columns)
```tsx
<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
  {products.map(p => <Card key={p.id} {...p} />)}
</div>
```

### Product Grid (3 columns)
```tsx
<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
  {products.map(p => <Card key={p.id} {...p} />)}
</div>
```

### Sidebar with Compact Cards
```tsx
<aside className="w-64 space-y-4">
  {items.map(i => <Card key={i.id} compact={true} {...i} />)}
</aside>
```

---

## 🎯 Badge Types
- `"New"` - Green
- `"Bestseller"` - Orange  
- `"Sale"` - Red
- `"PPE"` - Dark gray
- `"Limited"` - Light gray

---

## 🎨 Color Classes (from globals.css)

### Text Colors
```tsx
text-dark-900    // Primary text
text-dark-700    // Secondary text
text-dark-500    // Tertiary text
text-light-100   // White text
text-light-400   // Muted text
text-green       // Success/primary action
text-red         // Error/sale
text-orange      // Warning/highlight
```

### Background Colors
```tsx
bg-dark-900      // Dark background
bg-light-100     // White background
bg-light-200     // Light gray background
bg-light-300     // Borders/dividers
bg-green         // Primary action
bg-red           // Error/sale
bg-orange        // Warning
```

---

## 📏 Typography Classes

```tsx
text-heading-1   // 72px, very large headings
text-heading-2   // 56px, large headings  
text-heading-3   // 24px, section headings
text-lead        // 20px, emphasized text
text-body        // 16px, regular text
text-body-medium // 16px, medium weight
text-caption     // 14px, small text
text-footnote    // 12px, tiny text
```

---

## 🖼️ Asset Paths Reference

### Icons
```
/icons/menu.svg
/icons/close.svg
/icons/cart.svg
/icons/search.svg
/icons/star.svg
/icons/star-half.svg
/icons/linkedin.svg
```

### Payments
```
/payments/visa.svg
/payments/mastercard.svg
/payments/amex.svg
/payments/paypal.svg
```

### Branding
```
/logo-kbsk.svg
```

### Sample Products
```
/products/drill-01.svg
/products/wrench-01.svg
/products/battery-01.svg
/ppe/helmet-01.svg
/ppe/goggles-01.svg
```

---

## 🔗 Category Links (for custom menus)

```tsx
const categories = [
  { label: "Power Tools", href: "/products?category=power-tools" },
  { label: "Hand Tools", href: "/products?category=hand-tools" },
  { label: "PPE", href: "/products?category=ppe" },
  { label: "Safety", href: "/products?category=safety" },
  { label: "Accessories", href: "/products?category=accessories" },
  { label: "Brands", href: "/brands" },
  { label: "Deals", href: "/deals" },
];
```

---

## 📱 Responsive Breakpoints

```tsx
// Mobile: default (< 640px)
// Tablet: sm: (640px+)
// Laptop: lg: (1024px+)
// Desktop: xl: (1280px+)

className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
```

---

## ⌨️ Common Patterns

### Add to Cart Handler
```tsx
const handleAddToCart = (productId: number) => {
  // Your cart logic
  console.log(`Added product ${productId} to cart`);
};

<Card onAddToCart={() => handleAddToCart(product.id)} {...product} />
```

### Search Handler
```tsx
const handleSearch = () => {
  // Open search modal or redirect
  router.push('/search');
};

<Navbar onSearchClick={handleSearch} />
```

### Custom Footer Links
```tsx
const shopLinks = [
  { label: "New Arrivals", href: "/new" },
  { label: "Clearance", href: "/clearance" },
];

<Footer shopLinks={shopLinks} />
```

---

## ✅ Checklist Before Deploy

- [ ] All product images exist in `/public`
- [ ] Image paths are correct (case-sensitive)
- [ ] Links point to valid routes
- [ ] Cart and search handlers implemented
- [ ] Mobile tested on real devices
- [ ] Keyboard navigation works
- [ ] Screen reader tested (optional but recommended)
- [ ] TypeScript compiles without errors

---

## 🐛 Quick Troubleshooting

**Images not showing?**
- Check path starts from `/public` root
- Verify file extension matches exactly
- Ensure file exists in public directory

**Styles not working?**
- Verify `globals.css` is imported
- Check Tailwind config is correct
- Clear Next.js cache: `rm -rf .next`

**TypeScript errors?**
- Run `npm run build` to see all errors
- Check prop types match interfaces
- Ensure required props are provided

---

## 📚 Files to Read

1. **IMPLEMENTATION_SUMMARY.md** - Project overview
2. **COMPONENTS_README.md** - Detailed documentation  
3. **COMPONENT_USAGE_EXAMPLES.tsx** - 8 code examples
4. **This file** - Quick reference

---

**Print this card and keep it handy while coding!** 🎯
