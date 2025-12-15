import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProduct, getProductReviews, getRecommendedProducts } from "@/lib/actions/products";
import ProductClient from "./ProductClient";

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}

// Generate metadata for SEO
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = await getProduct(slug);

  if (!data) {
    return {
      title: "Product Not Found",
    };
  }

  const { product, variants } = data;
  const primaryImage = product.images.find((img) => img.isPrimary)?.url || product.images[0]?.url;
  const defaultVariant = variants.find((v) => v.id === product.defaultVariantId) || variants[0];
  const price = defaultVariant ? Number(defaultVariant.salePrice ?? defaultVariant.price) : null;

  return {
    title: `${product.name} | ${product.brand?.name || "Shop"}`,
    description: product.description || `Buy ${product.name} online. ${product.brand?.name || "Quality products"} at competitive prices.`,
    openGraph: {
      title: product.name,
      description: product.description || undefined,
      images: primaryImage ? [{ url: primaryImage, width: 1200, height: 1200 }] : undefined,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: product.name,
      description: product.description || undefined,
      images: primaryImage ? [primaryImage] : undefined,
    },
    other: {
      // JSON-LD structured data for products
      "product:price:amount": price?.toFixed(2) || "",
      "product:price:currency": "ZAR",
    },
  };
}

export default async function ProductDetailPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { page: pageParam } = await searchParams;
  const reviewPage = pageParam ? parseInt(pageParam) : 1;

  const data = await getProduct(slug);

  if (!data) {
    notFound();
  }

  const { product, variants } = data;

  // Fetch reviews with pagination
  const reviewData = await getProductReviews(product.id, reviewPage, 10);

  // Fetch recommended products
  const recommendedProducts = await getRecommendedProducts(product.id);

  // Prepare data for client component
  const productData = {
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description,
    specs: (product.specs || {}) as Record<string, unknown>,
    brand: product.brand ? { id: product.brand.id, name: product.brand.name, slug: product.brand.slug } : null,
    category: product.category ? { id: product.category.id, name: product.category.name, slug: product.category.slug } : null,
    gender: product.gender ? { id: product.gender.id, label: product.gender.label } : null,
    images: product.images,
    variants: variants.map((v) => ({
      id: v.id,
      sku: v.sku,
      price: v.price,
      salePrice: v.salePrice,
      inStock: v.inStock,
      color: v.color,
      size: v.size,
    })),
    rating: product.rating,
    pricing: product.pricing,
    stock: product.stock,
  };

  // Generate JSON-LD structured data
  const defaultVariant = variants.find((v) => v.id === product.defaultVariantId) || variants[0];
  const price = defaultVariant ? Number(defaultVariant.salePrice ?? defaultVariant.price) : null;
  const primaryImage = product.images.find((img) => img.isPrimary)?.url || product.images[0]?.url;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description || "",
    image: primaryImage ? [primaryImage] : [],
    sku: defaultVariant?.sku || "",
    brand: product.brand
      ? {
          "@type": "Brand",
          name: product.brand.name,
        }
      : undefined,
    offers: {
      "@type": "Offer",
      url: `${process.env.NEXT_PUBLIC_APP_URL || ""}/products/${product.slug}`,
      priceCurrency: "ZAR",
      price: price?.toFixed(2) || "0.00",
      availability:
        product.stock.inStock
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      seller: {
        "@type": "Organization",
        name: "Your Store Name",
      },
    },
    aggregateRating:
      product.rating.count > 0
        ? {
            "@type": "AggregateRating",
            ratingValue: product.rating.average.toFixed(1),
            reviewCount: product.rating.count,
            bestRating: 5,
            worstRating: 1,
          }
        : undefined,
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: `${process.env.NEXT_PUBLIC_APP_URL || ""}/`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "All products",
        item: `${process.env.NEXT_PUBLIC_APP_URL || ""}/products`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: product.name,
        item: `${process.env.NEXT_PUBLIC_APP_URL || ""}/products/${product.slug}`,
      },
    ],
  };

  return (
    <main className="mx-auto w-[90%]">
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      {/* Product Content */}
      <Suspense
        fallback={
          <div className="flex min-h-[60vh] items-center justify-center">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-dark-900 border-t-transparent" />
          </div>
        }
      >
        <ProductClient
          product={productData}
          reviews={reviewData.reviews}
          reviewStats={reviewData.stats}
          reviewPage={reviewPage}
          reviewTotalPages={reviewData.pages}
          recommendedProducts={recommendedProducts}
        />
      </Suspense>
    </main>
  );
}
