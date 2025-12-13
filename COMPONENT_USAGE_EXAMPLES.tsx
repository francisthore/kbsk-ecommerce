/**
 * KBSK Trading - Component Usage Examples
 * 
 * This file demonstrates how to use the three main components:
 * - Navbar
 * - Card (Product Card)
 * - Footer
 * 
 * Copy these examples into your pages as needed.
 */

// ============================================
// Example 1: Basic Page Layout
// ============================================

import { Navbar, Card, Footer } from "@/components";

export default function HomePage() {
  return (
    <>
      <Navbar 
        showUtilityBar={true}
        cartItemCount={3}
        onSearchClick={() => console.log("Search clicked")}
        onCartClick={() => console.log("Cart clicked")}
      />
      
      <main className="min-h-screen bg-light-200">
        {/* Your page content here */}
      </main>
      
      <Footer 
        showPayments={true}
        showNewsletter={true}
      />
    </>
  );
}

// ============================================
// Example 2: Product Grid with Cards
// ============================================

export function ProductGrid() {
  const products = [
    {
      id: 1,
      title: "20V Cordless Drill Kit",
      description: "Professional-grade cordless drill with 2 batteries, charger, and carrying case",
      imageSrc: "/products/drill-01.svg",
      price: 149.99,
      originalPrice: 199.99,
      rating: 4.5,
      reviewCount: 127,
      badge: "Bestseller" as const,
      href: "/products/1",
    },
    {
      id: 2,
      title: "Industrial Safety Helmet",
      description: "ANSI-certified hard hat with adjustable suspension and ventilation",
      imageSrc: "/ppe/helmet-01.svg",
      price: 34.99,
      rating: 4.8,
      reviewCount: 89,
      badge: "PPE" as const,
      href: "/products/2",
    },
    {
      id: 3,
      title: "Adjustable Wrench Set",
      description: "3-piece chrome vanadium steel wrench set, 6-inch, 8-inch, and 10-inch",
      imageSrc: "/products/wrench-01.svg",
      price: 29.99,
      originalPrice: 39.99,
      rating: 4.3,
      reviewCount: 56,
      badge: "Sale" as const,
      href: "/products/3",
    },
    {
      id: 4,
      title: "Safety Goggles - Anti-Fog",
      description: "ANSI Z87.1 certified protective eyewear with anti-fog coating",
      imageSrc: "/ppe/goggles-01.svg",
      price: 12.99,
      rating: 4.6,
      reviewCount: 203,
      badge: "New" as const,
      href: "/products/4",
    },
    {
      id: 5,
      title: "20V Lithium-Ion Battery",
      description: "High-capacity 4.0Ah battery compatible with all 20V tools",
      imageSrc: "/products/battery-01.svg",
      price: 59.99,
      rating: 4.7,
      reviewCount: 145,
      badge: "Limited" as const,
      href: "/products/5",
    },
  ];

  const handleAddToCart = (productId: number, title: string) => {
    console.log(`Added ${title} to cart`);
    // Add your cart logic here
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h2 className="text-heading-2 mb-8 text-dark-900">
        Featured Products
      </h2>
      
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {products.map((product) => (
          <Card
            key={product.id}
            title={product.title}
            description={product.description}
            imageSrc={product.imageSrc}
            imageAlt={product.title}
            price={product.price}
            originalPrice={product.originalPrice}
            rating={product.rating}
            reviewCount={product.reviewCount}
            badge={product.badge}
            href={product.href}
            onAddToCart={() => handleAddToCart(product.id, product.title)}
          />
        ))}
      </div>
    </div>
  );
}

// ============================================
// Example 3: Compact Card View
// ============================================

export function CompactProductList() {
  const quickAccessProducts = [
    {
      title: "Safety Gloves - Medium",
      imageSrc: "/ppe/gloves-01.svg",
      price: 8.99,
      rating: 4.4,
      href: "/products/gloves",
    },
    {
      title: "Tape Measure 25ft",
      imageSrc: "/products/tape-01.svg",
      price: 14.99,
      originalPrice: 19.99,
      rating: 4.6,
      badge: "Sale" as const,
      href: "/products/tape",
    },
  ];

  return (
    <aside className="w-64">
      <h3 className="text-heading-3 mb-4 text-dark-900">Quick Access</h3>
      <div className="space-y-4">
        {quickAccessProducts.map((product, index) => (
          <Card
            key={index}
            compact={true}
            title={product.title}
            imageSrc={product.imageSrc}
            price={product.price}
            originalPrice={product.originalPrice}
            rating={product.rating}
            badge={product.badge}
            href={product.href}
          />
        ))}
      </div>
    </aside>
  );
}

// ============================================
// Example 4: Navbar with Custom Props
// ============================================

export function CustomNavbar() {
  return (
    <Navbar
      showUtilityBar={true}
      utilityPhone="+1 (800) 555-TOOL"
      utilityEmail="sales@kbsktrading.com"
      cartItemCount={5}
      onSearchClick={() => {
        // Open search modal
        console.log("Opening search");
      }}
      onCartClick={() => {
        // Navigate to cart page
        window.location.href = "/cart";
      }}
    />
  );
}

// ============================================
// Example 5: Footer with Custom Links
// ============================================

export function CustomFooter() {
  const customShopLinks = [
    { label: "New Arrivals", href: "/new" },
    { label: "Clearance", href: "/clearance" },
    { label: "Tool Bundles", href: "/bundles" },
    { label: "Industrial Supply", href: "/industrial" },
  ];

  const customSupportLinks = [
    { label: "Live Chat", href: "/chat" },
    { label: "Tool Guides", href: "/guides" },
    { label: "Safety Resources", href: "/safety" },
  ];

  return (
    <Footer
      shopLinks={customShopLinks}
      supportLinks={customSupportLinks}
      showPayments={true}
      showNewsletter={true}
      copyrightYear={2025}
      companyName="KBSK Trading Co."
    />
  );
}

// ============================================
// Example 6: Card with Add to Cart Only
// ============================================

export function CardWithCartButton() {
  const handleAddToCart = () => {
    alert("Product added to cart!");
  };

  return (
    <Card
      title="Circular Saw 7.25 inch"
      description="15-Amp corded circular saw with laser guide and dust port"
      imageSrc="/products/saw-01.svg"
      price={89.99}
      rating={4.5}
      reviewCount={78}
      badge="Bestseller"
      onAddToCart={handleAddToCart}
    />
  );
}

// ============================================
// Example 7: Card with Link Only (No Cart)
// ============================================

export function CardLinkOnly() {
  return (
    <Card
      title="Professional Tool Belt"
      description="Heavy-duty leather tool belt with 10 pockets"
      imageSrc="/products/belt-01.svg"
      price={49.99}
      rating={4.7}
      reviewCount={134}
      href="/products/tool-belt"
    />
  );
}

// ============================================
// Example 8: Full Page Example
// ============================================

export default function FullPageExample() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar 
        showUtilityBar={true}
        cartItemCount={2}
      />
      
      <main className="flex-1 bg-light-200">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <h1 className="text-heading-1 mb-4 text-dark-900">
            Professional Tools & PPE
          </h1>
          <p className="text-lead mb-12 text-dark-700">
            Discover our complete range of industrial-grade tools
            and safety equipment.
          </p>
          
          <ProductGrid />
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
