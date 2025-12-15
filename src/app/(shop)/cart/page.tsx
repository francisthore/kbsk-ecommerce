import { Suspense } from "react";
import { getCart } from "@/lib/actions/cart";
import CartPageClient from "./CartPageClient";
import { Loader2 } from "lucide-react";

export const metadata = {
  title: "My Cart | KBSK Trading",
  description: "Review your cart and proceed to checkout",
};

function CartLoading() {
  return (
    <div className="flex min-h-[400px] items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-[var(--color-primary)]" />
    </div>
  );
}

export default async function CartPage() {
  const cartData = await getCart();

  return (
    <Suspense fallback={<CartLoading />}>
      <CartPageClient initialCartData={cartData} />
    </Suspense>
  );
}
