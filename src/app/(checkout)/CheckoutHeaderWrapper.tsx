"use client";

import CheckoutHeader from "@/components/checkout/CheckoutHeader";
import { usePathname } from "next/navigation";

export default function CheckoutHeaderWrapper() {
  const pathname = usePathname();
  
  // Determine current step based on URL
  let currentStep: "cart" | "review" | "checkout" | "success" = "checkout";
  
  if (pathname?.includes("/checkout-success")) {
    currentStep = "success";
  } else if (pathname?.includes("/checkout-cancel")) {
    currentStep = "checkout";
  } else if (pathname?.includes("/checkout")) {
    currentStep = "checkout";
  }
  
  return <CheckoutHeader currentStep={currentStep} />;
}
