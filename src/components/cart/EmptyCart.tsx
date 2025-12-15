"use client";

import { ShoppingBag, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function EmptyCart() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="mb-6 rounded-full bg-[var(--color-gray-light)] p-8">
        <ShoppingBag className="h-16 w-16 text-[var(--color-text-muted)]" strokeWidth={1.5} />
      </div>
      
      <h2 className="mb-2 text-heading-3 text-[var(--color-text-primary)]">
        Your cart is empty
      </h2>
      
      <p className="mb-8 max-w-md text-body text-[var(--color-text-secondary)]">
        Looks like you haven&apos;t added anything to your cart yet. Start shopping to find your perfect tools!
      </p>
      
      <Link
        href="/products"
        className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-cta)] px-6 py-3 text-body-medium text-white transition-colors hover:bg-[var(--color-cta-dark)] focus:outline-none focus:ring-2 focus:ring-[var(--color-cta)] focus:ring-offset-2"
      >
        Continue Shopping
        <ArrowRight className="h-5 w-5" />
      </Link>
    </div>
  );
}
