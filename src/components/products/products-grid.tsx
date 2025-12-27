"use client";

import { useState, useTransition } from "react";
import ProductCard from "@/components/ProductCard";
import { addToCart, getCart } from "@/lib/actions/cart";
import { toggleWishlist } from "@/lib/actions/products";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useCartStore } from "@/store/cart";

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  minPrice: number;
  maxPrice: number;
  inStock: boolean;
  onSale: boolean;
  image: { url: string } | null;
  brand: { name: string } | null;
  colorCount?: number;
  sizeCount?: number;
}

interface ProductsGridProps {
  products: Product[];
  userId?: string;
}

export function ProductsGrid({ products, userId }: ProductsGridProps) {
  const router = useRouter();
  const [_isPending, startTransition] = useTransition();
  const [_loadingProductId, setLoadingProductId] = useState<string | null>(null);
  const { setCart } = useCartStore();

  const _handleAddToCart = async (productId: string, defaultVariantId?: string) => {
    setLoadingProductId(productId);

    startTransition(async () => {
      try {
        // TODO: Get actual variant ID (for now using product ID as placeholder)
        // In real app, you'd have variant selector or use default variant
        const variantId = defaultVariantId || productId;

        const result = await addToCart(variantId, 1);

        if (result.success) {
          // Fetch updated cart and sync with store
          const cartData = await getCart();
          setCart(cartData);
          
          toast.success(result.message || "Added to cart!");
        } else {
          toast.error(result.error || "Failed to add to cart");
        }
      } catch (error) {
        console.error('Add to cart error:', error);
        toast.error("Something went wrong");
      } finally {
        setLoadingProductId(null);
      }
    });
  };

  const _handleToggleWishlist = async (productId: string) => {
    if (!userId) {
      toast.error("Please login to add to wishlist");
      router.push("/login");
      return;
    }

    startTransition(async () => {
      const result = await toggleWishlist(productId, userId);

      if (result.success) {
        toast.success(result.message || "Wishlist updated!");
      } else {
        toast.error(result.error || "Failed to update wishlist");
      }
    });
  };

  if (products.length === 0) {
    return (
      <div className="flex min-h-[400px] items-center justify-center rounded-lg border-2 border-dashed border-light-300 bg-light-50">
        <div className="text-center">
          <h3 className="text-heading-4 mb-2 text-dark-900">
            No products found
          </h3>
          <p className="text-body text-dark-700">
            Try adjusting your filters or search terms
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          title={product.name}
          description={product.description || ""}
          imageSrc={product.image?.url || "/placeholder-product.svg"}
          price={product.minPrice}
          maxPrice={product.maxPrice}
          originalPrice={
            product.onSale && product.maxPrice > product.minPrice
              ? product.maxPrice
              : undefined
          }
          rating={4.5}
          reviewCount={0}
          badge={
            product.onSale
              ? ("Sale" as const)
              : !product.inStock
                ? ("Limited" as const)
                : undefined
          }
          href={`/products/${product.slug}`}
          colorCount={product.colorCount}
          sizeCount={product.sizeCount}
        />
      ))}
    </div>
  );
}
