import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getCart } from "@/lib/actions/cart";
import { getShopSettings } from "@/lib/actions/shop-settings";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { Loader2 } from "lucide-react";
import CheckoutPageClient from "./CheckoutPageClient";

export const metadata = {
  title: "Checkout | KBSK Trading",
  description: "Complete your order securely",
};

function CheckoutLoading() {
  return (
    <div className="flex min-h-[400px] items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-[var(--color-primary)]" />
    </div>
  );
}

export default async function CheckoutPage() {
  // Get auth session
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // Get cart data
  const cartData = await getCart();

  // Get shipping fee from settings
  const settingsResult = await getShopSettings();
  const shippingFee = settingsResult.success && settingsResult.data?.shippingFee
    ? parseFloat(settingsResult.data.shippingFee)
    : 135.00;

  // Redirect to cart if empty
  if (!cartData.items || cartData.items.length === 0) {
    redirect("/cart");
  }

  return (
    <Suspense fallback={<CheckoutLoading />}>
      <CheckoutPageClient 
        initialCartData={cartData} 
        session={session}
        shippingFee={shippingFee}
      />
    </Suspense>
  );
}
