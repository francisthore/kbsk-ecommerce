/**
 * Checkout Page Client Component
 * Handles client-side checkout functionality including auth, cart syncing, and form submission
 * Supports both authenticated users and guest checkout
 */

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCartStore, CartItemData } from "@/store/cart.store";
import { ShippingForm, CartReview } from "@/components/checkout";
import Link from "next/link";

interface CheckoutPageClientProps {
  initialCartData: {
    items: CartItemData[];
    totals: {
      subtotal: number;
      savings: number;
      total: number;
    };
    itemCount: number;
    freeShipping: {
      eligible: boolean;
      threshold: number;
      amountRemaining: number;
    };
  };
  session: {
    user?: {
      id: string;
      email?: string | null;
      name?: string | null;
    };
  } | null;
  shippingFee: number;
}

export default function CheckoutPageClient({
  initialCartData,
  session,
  shippingFee,
}: CheckoutPageClientProps) {
  const router = useRouter();
  const { setCart, items, totals } = useCartStore();
  const [isClient, setIsClient] = useState(false);
  const [showGuestOption, setShowGuestOption] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // Sync server cart with client store
    setCart(initialCartData);
  }, [initialCartData, setCart]);

  // Handle post-login cleanup
  useEffect(() => {
    if (session?.user?.id) {
      const shouldMerge = sessionStorage.getItem("merge_cart_on_checkout");
      if (shouldMerge === "true") {
        // Cart was already merged in LoginForm, just clean up flags and refresh
        sessionStorage.removeItem("merge_cart_on_checkout");
        sessionStorage.removeItem("checkout_redirect");
        router.refresh();
      }
    }
  }, [session, router]);

  // Handle guest vs authenticated checkout
  useEffect(() => {
    if (isClient && !session?.user) {
      // Show guest checkout option only if NOT authenticated
      setShowGuestOption(true);
    }
  }, [session, isClient]);

  // Show loading state until client hydration completes
  if (!isClient) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--color-primary)] border-t-transparent" />
      </div>
    );
  }

  // Show guest checkout option for unauthenticated users ONLY
  if (showGuestOption && !session?.user) {
    return (
      <div className="mx-auto w-[90%] max-w-[600px] py-12">
        <div className="rounded-lg border-2 border-[var(--color-gray-dark)] bg-white p-8">
          <h2 className="mb-6 text-center text-2xl font-bold text-[var(--color-text-primary)]">
            Choose Checkout Method
          </h2>
          
          <div className="space-y-4">
            {/* Guest Checkout Button */}
            <button
              onClick={() => setShowGuestOption(false)}
              className="w-full rounded-lg bg-[var(--color-cta)] px-6 py-4 text-left text-white transition-colors hover:bg-[var(--color-cta-dark)]"
            >
              <div className="text-lg font-semibold">Continue as Guest</div>
              <div className="mt-1 text-sm opacity-90">
                Checkout quickly with just your email
              </div>
            </button>

            {/* Login Button */}
            <Link
              href="/login?redirect=/checkout"
              onClick={() => {
                sessionStorage.setItem("checkout_redirect", "true");
                sessionStorage.setItem("merge_cart_on_checkout", "true");
              }}
              className="block w-full rounded-lg border-2 border-[var(--color-primary)] bg-white px-6 py-4 text-left text-[var(--color-primary)] transition-colors hover:bg-[var(--color-gray-light)]"
            >
              <div className="text-lg font-semibold">Sign In to Your Account</div>
              <div className="mt-1 text-sm opacity-75">
                Access your saved addresses and order history
              </div>
            </Link>
          </div>

          <p className="mt-6 text-center text-sm text-[var(--color-text-secondary)]">
            Guest orders can be linked to an account after checkout
          </p>
        </div>
      </div>
    );
  }

  // Render checkout form for authenticated users or guests who chose to continue
  return (
    <div className="mx-auto w-[90%] max-w-[1400px] py-8">
      {/* Returning customer prompt for guest checkout */}
      {!session?.user && (
        <div className="mb-6 rounded-lg bg-[var(--color-gray-light)] p-4 text-center">
          <p className="text-sm text-[var(--color-text-secondary)]">
            Returning customer?{" "}
            <Link
              href="/login?redirect=/checkout"
              onClick={() => {
                sessionStorage.setItem("checkout_redirect", "true");
                sessionStorage.setItem("merge_cart_on_checkout", "true");
              }}
              className="font-semibold text-[var(--color-primary)] hover:underline"
            >
              Click here to log in
            </Link>
          </p>
        </div>
      )}
      
      <div className="grid gap-8 lg:grid-cols-[1fr_450px] grid-cols-1">
        {/* Left: Shipping Form */}
        <ShippingForm 
          userEmail={session?.user?.email || ""} 
          isGuest={!session}
          isSubmitting={isSubmitting}
          setIsSubmitting={setIsSubmitting}
        />

        {/* Right: Cart Review */}
        <CartReview 
          items={items} 
          totals={totals}
          shippingFee={shippingFee}
          isSubmitting={isSubmitting}
        />
      </div>
    </div>
  );
}
