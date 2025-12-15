# Welcome Section Components

A complete, data-driven section for the KBSK Trading homepage featuring a welcome headline, category promo grid, and autoplay brands marquee.

## Components Overview

### WelcomeCategoriesAndBrands
Main component that combines all three elements:
- Dark green welcome band with emphasized headline
- Elevated category grid
- Autoplay brands marquee

### CategoryGrid
Responsive grid supporting three category variants:
- **list**: Bulleted sublinks with "View All" CTA
- **tile**: Horizontal image tiles with overlay text
- **hero-tall**: Large vertical image tile (2-row span on desktop)

### BrandsMarquee
Autoplay carousel for brand logos featuring:
- Black & white logos by default
- Full color on hover
- Smooth transitions
- Keyboard navigation (left/right arrows)
- Pause on hover and when tab hidden
- Responsive: 3-6 visible logos based on screen size

## Usage

```tsx
import WelcomeCategoriesAndBrands from "@/components/welcome/WelcomeCategoriesAndBrands";
import { categories } from "@/lib/welcome-categories";
import { brands } from "@/lib/welcome-brands";

<WelcomeCategoriesAndBrands
  welcomeHeadline="Welcome to FIRST CLASS"
  categories={categories}
  brands={brands}
  autoplay={true}
  intervalMs={3000}
  showArrows={true}
/>
```

## Data Structure

### Categories (`CategoryCard[]`)

```typescript
{
  key: string;              // Unique identifier
  title: string;            // Display title
  href: string;             // Link destination
  variant: "list" | "tile" | "hero-tall";
  imageSrc?: string;        // Image path (for tile/hero-tall)
  imageAlt?: string;        // Image alt text
  items?: {                 // Subitems (for list variant)
    label: string;
    href: string;
  }[];
}
```

### Brands (`BrandLogo[]`)

```typescript
{
  name: string;             // Brand name
  slug: string;             // URL slug (e.g., "milwaukee")
  logoBwSrc: string;        // Black & white logo path
  logoColorSrc: string;     // Color logo path
  alt?: string;             // Alt text (defaults to "{name} logo")
}
```

## Adding New Categories

Edit `/src/lib/welcome-categories.ts`:

```typescript
export const categories: CategoryCard[] = [
  {
    key: "new-category",
    title: "New Category",
    href: "/category/new-category",
    variant: "tile",
    imageSrc: "/categories/new-category.jpg",
    imageAlt: "Description of category",
  },
  // ... existing categories
];
```

## Adding New Brands

Edit `/src/lib/welcome-brands.ts`:

```typescript
export const brands: BrandLogo[] = [
  {
    name: "NewBrand",
    slug: "newbrand",
    logoBwSrc: "/brands/bw/newbrand.svg",
    logoColorSrc: "/brands/color/newbrand.svg",
  },
  // ... existing brands
];
```

Then add the logo files:
- `/public/brands/bw/newbrand.svg` (grayscale)
- `/public/brands/color/newbrand.svg` (full color)

## Asset Requirements

### Category Images
- Location: `/public/categories/`
- Formats: JPG, PNG, or SVG
- Recommended sizes:
  - List variant: No image needed
  - Tile variant: 600×400px (16:9 or 4:3)
  - Hero-tall variant: 400×600px (3:4)

### Brand Logos
- Location: `/public/brands/bw/` and `/public/brands/color/`
- Format: SVG recommended (or PNG)
- Recommended size: 160×80px
- Two versions required per brand:
  - BW: Grayscale/monochrome
  - Color: Full brand colors

## Accessibility Features

✅ ARIA labels on all sections and interactive elements  
✅ Keyboard navigation (arrow keys for brand carousel)  
✅ Focus-visible rings for keyboard users  
✅ Screen reader announcements for carousel changes  
✅ Semantic HTML (section, nav, etc.)  
✅ Proper heading hierarchy  
✅ Large tap targets on mobile  

## Responsive Behavior

**Mobile (< 640px)**
- Category grid: Single column
- Brands visible: 3 logos

**Tablet (640px - 1024px)**
- Category grid: 2 columns
- Brands visible: 4 logos

**Desktop (> 1024px)**
- Category grid: 4 columns
- Brands visible: 6 logos
- Hero-tall spans 2 rows

## Customization Props

### WelcomeCategoriesAndBrands

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `welcomeHeadline` | string | "Welcome to FIRST CLASS" | Main headline text |
| `categories` | CategoryCard[] | required | Array of category objects |
| `brands` | BrandLogo[] | required | Array of brand objects |
| `autoplay` | boolean | true | Enable brand carousel autoplay |
| `intervalMs` | number | 3000 | Autoplay interval in milliseconds |
| `showArrows` | boolean | true | Show navigation arrows |
| `className` | string | "" | Additional CSS classes |

## Styling

All components use:
- Tailwind CSS utility classes
- CSS custom properties from `globals.css`
- Primary color: `var(--color-primary)` (dark green)
- CTA color: `var(--color-cta)` (orange)

Key color tokens used:
```css
--color-primary: #1E4620;
--color-primary-dark: #152f17;
--color-cta: #FF7A00;
--color-cta-dark: #e66d00;
```

## Performance Optimizations

- Uses `next/image` for optimized images
- Lazy loading for off-screen brand logos
- CSS transforms for smooth animations
- Pauses carousel when tab is hidden
- Debounced resize handlers

## Browser Support

✅ Modern browsers (Chrome, Firefox, Safari, Edge)  
✅ Mobile Safari / Chrome  
✅ Supports reduced motion preferences  

## Future Enhancements

- [ ] Add swipe gestures for mobile
- [ ] Implement infinite loop marquee animation
- [ ] Add category filtering/search
- [ ] Support video backgrounds for hero tiles
- [ ] Add analytics tracking events
