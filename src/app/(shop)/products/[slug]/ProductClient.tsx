"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Star, Heart, Truck, Shield, Package, Share2 } from "lucide-react";
import { Card, CollapsibleSection } from "@/components";
import ImageGallery from "@/components/product/ImageGallery";
import VariantSelector from "@/components/product/VariantSelector";
import QuantitySelector from "@/components/product/QuantitySelector";
import AddToCartButton from "@/components/product/AddToCartButton";
import BuyNowButton from "@/components/product/BuyNowButton";
import ProductReviews from "@/components/product/ProductReviews";
import { useVariantStore } from "@/store/variant";
import type { Review, ReviewStats, RecommendedProduct } from "@/lib/actions/products";

interface Variant {
  id: string;
  sku: string;
  price: string;
  salePrice: string | null;
  inStock: number;
  color: { id: string; name: string; hexCode: string | null } | null;
  size: { id: string; name: string } | null;
}

interface ProductData {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  specs: Record<string, unknown> | Record<string, never>;
  brand: { id: string; name: string; slug: string } | null;
  category: { id: string; name: string; slug: string } | null;
  gender: { id: string; label: string } | null;
  images: { url: string; variantId: string | null; isPrimary: boolean; sortOrder: number | null }[];
  variants: Variant[];
  rating: { average: number; count: number };
  pricing: { minPrice: number; maxPrice: number };
  stock: { inStock: boolean; totalStock: number };
}

interface ProductClientProps {
  product: ProductData;
  reviews: Review[];
  reviewStats: ReviewStats;
  reviewPage: number;
  reviewTotalPages: number;
  recommendedProducts: RecommendedProduct[];
}

export default function ProductClient({
  product,
  reviews,
  reviewStats,
  reviewPage,
  reviewTotalPages,
  recommendedProducts,
}: ProductClientProps) {
  // Use Zustand store for variant selection (persists across navigation)
  const variantIndex = useVariantStore((state) => state.getSelected(product.id, 0));
  const setVariantIndex = useVariantStore((state) => state.setSelected);
  
  const [selectedColorId, setSelectedColorId] = useState<string | undefined>();
  const [selectedSizeId, setSelectedSizeId] = useState<string | undefined>();
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
  const [galleryImages, setGalleryImages] = useState<string[]>([]);

  // Extract unique colors and sizes from variants
  const colors = Array.from(
    new Map(
      product.variants
        .filter((v) => v.color)
        .map((v) => [
          v.color!.id,
          {
            id: v.color!.id,
            name: v.color!.name,
            value: v.color!.name,
            hexCode: v.color!.hexCode,
            inStock: product.variants
              .filter((variant) => variant.color?.id === v.color!.id)
              .reduce((sum, variant) => sum + variant.inStock, 0),
          },
        ])
    ).values()
  );

  const sizes = Array.from(
    new Map(
      product.variants
        .filter((v) => v.size)
        .map((v) => [
          v.size!.id,
          {
            id: v.size!.id,
            name: v.size!.name,
            value: v.size!.name,
            inStock: product.variants
              .filter((variant) => variant.size?.id === v.size!.id)
              .reduce((sum, variant) => sum + variant.inStock, 0),
          },
        ])
    ).values()
  );

  // Find matching variant based on selections
  useEffect(() => {
    const matchingVariant = product.variants.find((v) => {
      const colorMatch = !selectedColorId || v.color?.id === selectedColorId;
      const sizeMatch = !selectedSizeId || v.size?.id === selectedSizeId;
      return colorMatch && sizeMatch;
    });

    const variant = matchingVariant || product.variants[0] || null;
    setSelectedVariant(variant);
    
    // Update variant store index when variant changes
    if (variant) {
      const index = product.variants.findIndex((v) => v.id === variant.id);
      if (index !== -1) {
        setVariantIndex(product.id, index);
      }
    }
  }, [selectedColorId, selectedSizeId, product.variants, product.id, setVariantIndex]);

  // Update gallery images based on selected color
  useEffect(() => {
    if (selectedColorId) {
      const variantImages = product.images
        .filter((img) => {
          const matchingVariant = product.variants.find(
            (v) => v.id === img.variantId && v.color?.id === selectedColorId
          );
          return matchingVariant;
        })
        .map((img) => img.url);

      if (variantImages.length > 0) {
        setGalleryImages(variantImages);
        return;
      }
    }

    // Fallback to generic images or primary image
    const genericImages = product.images
      .filter((img) => img.variantId === null)
      .sort((a, b) => {
        if (a.isPrimary && !b.isPrimary) return -1;
        if (!a.isPrimary && b.isPrimary) return 1;
        return (a.sortOrder ?? 0) - (b.sortOrder ?? 0);
      })
      .map((img) => img.url);

    setGalleryImages(
      genericImages.length > 0 ? genericImages : product.images.map((img) => img.url)
    );
  }, [selectedColorId, product.images, product.variants]);

  const currentPrice = selectedVariant?.salePrice
    ? Number(selectedVariant.salePrice)
    : selectedVariant
    ? Number(selectedVariant.price)
    : product.pricing.minPrice;

  const comparePrice =
    selectedVariant?.salePrice && selectedVariant.price
      ? Number(selectedVariant.price)
      : null;

  const discount =
    comparePrice && currentPrice < comparePrice
      ? Math.round(((comparePrice - currentPrice) / comparePrice) * 100)
      : null;

  const maxStock = selectedVariant?.inStock || 0;

  return (
    <>
      {/* Breadcrumb */}
      <nav className="py-4 text-caption text-dark-700">
        <Link href="/" className="hover:underline">
          Home
        </Link>
        {" / "}
        <Link href="/products" className="hover:underline">
          All products
        </Link>
        {" / "}
        <span className="text-dark-900">{product.name}</span>
      </nav>

      {/* Main Product Section */}
      <section className="grid grid-cols-1 gap-8 lg:grid-cols-[40%_1fr] lg:gap-12">
        {/* Image Gallery */}
        <div className="lg:sticky lg:top-6 lg:self-start">
          <ImageGallery images={galleryImages} productName={product.name} />
        </div>

        {/* Product Info */}
        <div className="flex flex-col gap-6">
          {/* Header */}
          <header>
            <h1 className="text-heading-2 text-dark-900">{product.name}</h1>
            {product.brand && (
              <Link
                href={`/brands/${product.brand.slug}`}
                className="mt-2 inline-block text-body text-dark-700 hover:text-dark-900 hover:underline"
              >
                {product.brand.name}
              </Link>
            )}
            {product.gender && (
              <p className="mt-1 text-body text-dark-700">{product.gender.label} Shoes</p>
            )}
          </header>

          {/* Rating */}
          {product.rating.count > 0 && (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-4 w-4 ${
                      star <= Math.round(product.rating.average)
                        ? "fill-dark-900 text-dark-900"
                        : "text-light-300"
                    }`}
                  />
                ))}
              </div>
              <a
                href="#reviews"
                className="text-body text-dark-700 hover:text-dark-900 hover:underline"
              >
                {product.rating.average.toFixed(1)} ({product.rating.count} reviews)
              </a>
            </div>
          )}

          {/* SKU & Stock */}
          <div className="flex flex-col gap-1 text-caption text-dark-700">
            {selectedVariant && <p>SKU: {selectedVariant.sku}</p>}
            {maxStock > 0 ? (
              <p className="text-green-600">
                ✓ In Stock ({maxStock} available) • Ships within 1-2 business days
              </p>
            ) : (
              <p className="text-red-600">Out of Stock</p>
            )}
          </div>

          {/* Badges */}
          <div className="flex flex-wrap gap-2">
            <div className="flex items-center gap-2 rounded-full border border-light-300 px-3 py-1 text-caption text-dark-900">
              <Shield className="h-4 w-4" />
              <span>1 Year Warranty</span>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-light-300 px-3 py-1 text-caption text-dark-900">
              <Truck className="h-4 w-4" />
              <span>Express Shipping</span>
            </div>
          </div>

          {/* Price */}
          <div className="flex items-center gap-3">
            <p className="text-lead text-dark-900">R{currentPrice.toFixed(2)}</p>
            {comparePrice && (
              <>
                <span className="text-body text-dark-700 line-through">
                  R{comparePrice.toFixed(2)}
                </span>
                {discount && (
                  <span className="rounded-full border border-light-300 px-2 py-1 text-caption text-green-600">
                    {discount}% off
                  </span>
                )}
              </>
            )}
          </div>

          {/* Variant Selectors */}
          <VariantSelector
            colors={colors}
            sizes={sizes}
            selectedColor={selectedColorId}
            selectedSize={selectedSizeId}
            onColorChange={setSelectedColorId}
            onSizeChange={setSelectedSizeId}
          />

          {/* Quantity */}
          <QuantitySelector
            initialQuantity={quantity}
            min={1}
            max={maxStock}
            onQuantityChange={setQuantity}
          />

          {/* Action Buttons */}
          <div className="flex flex-col gap-3 max-w-md">
            <AddToCartButton
              variantId={selectedVariant?.id || ""}
              variantSku={selectedVariant?.sku || ""}
              productName={product.name}
              price={currentPrice}
              imageUrl={galleryImages[0]}
              quantity={quantity}
              disabled={!selectedVariant || maxStock === 0}
            />
            <BuyNowButton
              variantId={selectedVariant?.id || ""}
              variantSku={selectedVariant?.sku || ""}
              productName={product.name}
              price={currentPrice}
              imageUrl={galleryImages[0]}
              quantity={quantity}
              disabled={!selectedVariant || maxStock === 0}
            />
            <button className="flex items-center justify-center gap-2 rounded-full border border-light-300 px-6 py-4 text-body-medium text-dark-900 transition hover:border-dark-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-dark-500">
              <Heart className="h-5 w-5" />
              Add to Wishlist
            </button>
          </div>

          {/* Payment Icons */}
          <div className="flex items-center gap-2 border-t border-light-300 pt-4">
            <Package className="h-5 w-5 text-dark-700" />
            <span className="text-caption text-dark-700">
              Safe & Secure Shopping Guaranteed
            </span>
          </div>

          {/* Social Share */}
          <div className="flex items-center gap-3 border-t border-light-300 pt-4">
            <span className="text-body-medium text-dark-900">Share:</span>
            <button
              className="rounded-full p-2 transition hover:bg-light-100"
              aria-label="Share on Facebook"
            >
              <Share2 className="h-5 w-5 text-dark-700" />
            </button>
          </div>

          {/* Product Details */}
          <CollapsibleSection title="Product Details" defaultOpen>
            <p className="text-body text-dark-700">{product.description}</p>

            {/* Specifications */}
            {product.specs && Object.keys(product.specs).length > 0 && (
              <div className="mt-4">
                <h4 className="mb-2 text-body-medium text-dark-900">Specifications</h4>
                <table className="w-full">
                  <tbody>
                    {Object.entries(product.specs).map(([key, value]) => (
                      <tr key={key} className="border-b border-light-200">
                        <td className="py-2 text-caption text-dark-700 capitalize">
                          {key.replace(/_/g, " ")}
                        </td>
                        <td className="py-2 text-caption text-dark-900">
                          {String(value)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CollapsibleSection>

          {/* Shipping & Returns */}
          <CollapsibleSection title="Shipping & Returns">
            <div className="space-y-3 text-body text-dark-700">
              <p>
                <strong>Express Shipping:</strong> Available for most items. Orders placed
                before 2 PM ship same day.
              </p>
              <p>
                <strong>Returns:</strong> Free 30-day returns. Items must be in original
                condition with tags attached.
              </p>
              <p>
                <strong>Pickup:</strong> Check availability at checkout for local pickup
                options.
              </p>
            </div>
          </CollapsibleSection>
        </div>
      </section>

      {/* Reviews Section */}
      <div id="reviews">
        <ProductReviews
          productId={product.id}
          reviews={reviews}
          stats={reviewStats}
          currentPage={reviewPage}
          totalPages={reviewTotalPages}
        />
      </div>

      {/* Recommended Products */}
      {recommendedProducts.length > 0 && (
        <section className="mt-16">
          <h2 className="mb-6 text-heading-3 text-dark-900">You Might Also Like</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {recommendedProducts.map((p) => (
              <Card
                key={p.id}
                title={p.title}
                imageSrc={p.imageUrl}
                price={p.price ?? undefined}
                href={`/products/${p.id}`}
              />
            ))}
          </div>
        </section>
      )}
    </>
  );
}
