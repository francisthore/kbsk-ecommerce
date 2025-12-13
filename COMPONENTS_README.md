# KBSK Trading - Component Documentation

This document provides comprehensive information about the three production-ready UI components built for the KBSK Trading tools and PPE ecommerce platform.

## 📦 Components Overview

1. **Navbar** - Responsive navigation bar with mobile menu
2. **Card** - Reusable product card for tools and PPE
3. **Footer** - Responsive footer with newsletter and payment methods

---

## 🎨 Design System

### Color Palette (from globals.css)

```css
/* Dark shades */
--color-dark-900: #111111;  /* Primary text, dark backgrounds */
--color-dark-700: #757575;  /* Secondary text */
--color-dark-500: #aaaaaa;  /* Tertiary text */

/* Light shades */
--color-light-100: #ffffff; /* White backgrounds, light text */
--color-light-200: #f5f5f5; /* Light backgrounds */
--color-light-300: #e5e5e5; /* Borders, dividers */
--color-light-400: #cccccc; /* Inactive elements */

/* Supporting colors */
--color-green: #007d48;     /* Primary action, success */
--color-red: #d33918;       /* Errors, sales, urgency */
--color-orange: #d37918;    /* Warnings, highlights */
```

### Typography Scale

- **Heading 1**: 72px / 78px line height / 700 weight
- **Heading 2**: 56px / 60px line height / 700 weight
- **Heading 3**: 24px / 30px line height / 500 weight
- **Lead**: 20px / 28px line height / 500 weight
- **Body**: 16px / 24px line height / 400 weight
- **Body Medium**: 16px / 24px line height / 500 weight
- **Caption**: 14px / 20px line height / 500 weight
- **Footnote**: 12px / 18px line height / 400 weight

---

## 🧭 Navbar Component

### Features

- ✅ Responsive design (mobile-first)
- ✅ Mobile hamburger menu with slide-in navigation
- ✅ Optional utility bar for contact info
- ✅ Tools/PPE focused categories
- ✅ Search and cart actions
- ✅ Accessibility features (ARIA, keyboard navigation)
- ✅ Body scroll lock when mobile menu is open

### Props

```typescript
interface NavbarProps {
  showUtilityBar?: boolean;      // Show top contact bar
  utilityPhone?: string;          // Phone number display
  utilityEmail?: string;          // Email display
  cartItemCount?: number;         // Cart badge count
  onSearchClick?: () => void;     // Search click handler
  onCartClick?: () => void;       // Cart click handler
}
```

### Default Categories

- Power Tools
- Hand Tools
- PPE
- Safety
- Accessories
- Brands
- Deals

### Usage

```tsx
import { Navbar } from "@/components";

<Navbar 
  showUtilityBar={true}
  utilityPhone="+1 (555) 123-4567"
  utilityEmail="support@kbsktrading.com"
  cartItemCount={3}
  onSearchClick={() => console.log("Search")}
  onCartClick={() => console.log("Cart")}
/>
```

---

## 🃏 Card Component

### Features

- ✅ Responsive product cards
- ✅ Price display with discount calculation
- ✅ Star ratings (full, half, empty)
- ✅ Badge system (New, Bestseller, Sale, PPE, Limited)
- ✅ Compact mode for sidebars
- ✅ Add to Cart callback
- ✅ Image hover zoom effect
- ✅ Accessible labels and ARIA attributes

### Props

```typescript
interface CardProps {
  title: string;                  // Product name
  description?: string;           // Product description
  imageSrc: string;               // Image path from /public
  imageAlt?: string;              // Alt text (defaults to title)
  href?: string;                  // Product detail page link
  price?: number;                 // Current price
  originalPrice?: number;         // Original price (for discount)
  currency?: string;              // Currency code (default: "USD")
  badge?: BadgeType;              // Badge label
  rating?: number;                // Star rating (0-5)
  reviewCount?: number;           // Number of reviews
  onAddToCart?: () => void;       // Add to cart handler
  compact?: boolean;              // Compact layout mode
  className?: string;             // Additional CSS classes
}
```

### Badge Types

- `"New"` - Green background
- `"Bestseller"` - Orange background
- `"Sale"` - Red background
- `"PPE"` - Dark background
- `"Limited"` - Gray background
- Custom strings - Default gray background

### Price Formatting

The component uses `Intl.NumberFormat` for internationalized currency formatting:

```typescript
const formatPrice = (amount: number): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD", // or your specified currency
  }).format(amount);
};
```

### Star Rating System

- Full stars: `rating >= n`
- Half star: `0.5 <= rating % 1 < 1`
- Empty stars: remaining to reach 5

### Usage Examples

**Standard Card:**
```tsx
<Card
  title="20V Cordless Drill Kit"
  description="Professional-grade drill with 2 batteries"
  imageSrc="/products/drill-01.svg"
  price={149.99}
  originalPrice={199.99}
  rating={4.5}
  reviewCount={127}
  badge="Bestseller"
  href="/products/drill"
  onAddToCart={() => addToCart("drill")}
/>
```

**Compact Card:**
```tsx
<Card
  compact={true}
  title="Safety Gloves"
  imageSrc="/ppe/gloves-01.svg"
  price={8.99}
  rating={4.4}
  href="/products/gloves"
/>
```

---

## 📄 Footer Component

### Features

- ✅ Responsive 3-column layout
- ✅ Logo and company description
- ✅ Social media links
- ✅ Newsletter subscription form
- ✅ Configurable link columns
- ✅ Payment method icons
- ✅ Mobile-first stacking
- ✅ Accessibility features

### Props

```typescript
interface FooterProps {
  shopLinks?: { label: string; href: string }[];
  supportLinks?: { label: string; href: string }[];
  companyLinks?: { label: string; href: string }[];
  showPayments?: boolean;         // Show payment icons
  showNewsletter?: boolean;       // Show newsletter form
  copyrightYear?: number;         // Copyright year
  companyName?: string;           // Company name
}
```

### Default Link Columns

**Shop:**
- Power Tools
- Hand Tools
- PPE & Safety
- Accessories
- Brands
- Deals & Offers

**Support:**
- Contact Us
- FAQs
- Shipping Info
- Returns
- Track Order
- Warranty

**Company:**
- About Us
- Careers
- Press
- Privacy Policy
- Terms of Service

### Social Media

- Facebook
- Instagram
- LinkedIn

### Payment Methods

- Visa
- Mastercard
- American Express
- PayPal

### Usage

```tsx
import { Footer } from "@/components";

<Footer 
  showPayments={true}
  showNewsletter={true}
  copyrightYear={2025}
  companyName="KBSK Trading"
/>
```

**Custom Links:**
```tsx
<Footer
  shopLinks={[
    { label: "New Arrivals", href: "/new" },
    { label: "Clearance", href: "/clearance" },
  ]}
  supportLinks={[
    { label: "Live Chat", href: "/chat" },
    { label: "Tool Guides", href: "/guides" },
  ]}
  showPayments={true}
/>
```

---

## 📁 Asset Requirements

All required assets have been created in `/public`:

### Icons (`/public/icons/`)
- ✅ `menu.svg` - Mobile menu icon
- ✅ `close.svg` - Close menu icon
- ✅ `cart.svg` - Shopping cart
- ✅ `search.svg` - Search icon
- ✅ `star.svg` - Full star
- ✅ `star-half.svg` - Half star
- ✅ `support.svg` - Support icon
- ✅ `linkedin.svg` - LinkedIn social icon

### Payments (`/public/payments/`)
- ✅ `visa.svg`
- ✅ `mastercard.svg`
- ✅ `amex.svg`
- ✅ `paypal.svg`

### Branding
- ✅ `/public/logo-kbsk.svg` - Main logo

### Sample Products
- ✅ `/public/products/drill-01.svg`
- ✅ `/public/products/wrench-01.svg`
- ✅ `/public/products/battery-01.svg`
- ✅ `/public/ppe/helmet-01.svg`
- ✅ `/public/ppe/goggles-01.svg`

---

## ♿ Accessibility Features

### Navbar
- Semantic HTML (`<nav>`, `<header>`)
- ARIA labels for screen readers
- `aria-expanded` for mobile menu state
- `aria-controls` for menu relationship
- Keyboard focus rings
- Skip to content pattern

### Card
- Descriptive `aria-label` for buttons
- Alt text for images
- Accessible star rating with `aria-label`
- Semantic article structure
- Focus states on interactive elements

### Footer
- Semantic `<footer>` and `<nav>` elements
- `aria-labelledby` for navigation sections
- Form labels (including `sr-only` for screen readers)
- Focus rings on links and inputs
- Proper heading hierarchy

---

## 📱 Responsive Breakpoints

Following Tailwind CSS conventions:

- **sm**: 640px (tablets)
- **md**: 768px (small laptops)
- **lg**: 1024px (desktops)
- **xl**: 1280px (large desktops)

### Mobile-First Approach

All components are built mobile-first, progressively enhancing for larger screens:

```tsx
// Example from Navbar
className="hidden lg:flex"  // Hidden on mobile, visible on desktop
className="lg:hidden"       // Visible on mobile, hidden on desktop
```

---

## 🚀 Getting Started

### 1. Import Components

```tsx
import { Navbar, Card, Footer } from "@/components";
```

### 2. Basic Page Structure

```tsx
export default function Page() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar cartItemCount={0} />
      
      <main className="flex-1 bg-light-200">
        {/* Your content */}
      </main>
      
      <Footer />
    </div>
  );
}
```

### 3. Product Grid

```tsx
<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
  {products.map((product) => (
    <Card
      key={product.id}
      {...product}
      onAddToCart={() => handleAddToCart(product)}
    />
  ))}
</div>
```

---

## 🎯 Best Practices

1. **Always provide alt text** for product images
2. **Use semantic HTML** - the components already do this
3. **Test keyboard navigation** - all interactive elements are keyboard accessible
4. **Optimize images** - use Next.js Image component (already implemented)
5. **Handle loading states** - add loading indicators for async operations
6. **Error handling** - validate form inputs and API responses
7. **Mobile testing** - test on real devices, not just browser devtools

---

## 🔧 Customization

### Extending the Navbar

Add new categories by modifying `CATEGORY_LINKS` in `Navbar.tsx`:

```tsx
const CATEGORY_LINKS = [
  { label: "Your Category", href: "/category" },
  // ... existing categories
];
```

### Custom Card Badges

Add new badge styles in the `getBadgeStyles` function:

```tsx
const badgeMap: Record<string, string> = {
  New: "bg-green text-light-100",
  Custom: "bg-blue-500 text-white",
  // ... your custom badges
};
```

### Footer Customization

Pass custom props to override defaults:

```tsx
<Footer
  shopLinks={myCustomShopLinks}
  companyName="My Company"
  copyrightYear={2025}
/>
```

---

## 📊 Performance Considerations

1. **Images**: All images use Next.js `Image` component for optimization
2. **Code splitting**: Components can be lazy loaded if needed
3. **CSS**: Tailwind purges unused styles in production
4. **Accessibility**: Semantic HTML improves performance for assistive technologies

---

## 🐛 Troubleshooting

### Images not loading
- Verify image paths start from `/public` root
- Check file extensions match exactly (case-sensitive)
- Ensure images exist in the public directory

### Styles not applying
- Verify Tailwind CSS is properly configured
- Check `globals.css` is imported in your app
- Ensure class names don't have typos

### Mobile menu not working
- Check that JavaScript is enabled
- Verify `useState` is imported from React
- Ensure component is marked with `"use client"`

---

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Web Accessibility Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)

---

## ✅ Component Checklist

All components meet the following criteria:

- ✅ TypeScript with proper type definitions
- ✅ Responsive and mobile-first
- ✅ Accessible (ARIA, keyboard navigation, semantics)
- ✅ Using project's design tokens from `globals.css`
- ✅ Production-ready code quality
- ✅ Comprehensive prop interfaces
- ✅ Reusable and composable
- ✅ DRY (Don't Repeat Yourself) principle
- ✅ Proper error handling and validation
- ✅ Performance optimized

---

**Version**: 1.0.0  
**Last Updated**: December 2025  
**Maintained by**: KBSK Trading Development Team
