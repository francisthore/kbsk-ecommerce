"use client";

import Link from "next/link";
import Image from "next/image";
import CheckoutProgress from "./CheckoutProgress";

interface CheckoutHeaderProps {
  currentStep?: "cart" | "review" | "checkout" | "success";
}

export default function CheckoutHeader({ currentStep = "checkout" }: CheckoutHeaderProps) {
  return (
    <header className="border-b border-[var(--color-border)] bg-white sticky top-0 z-50">
      <div className="mx-auto w-[90%] max-w-[1400px]">
        <div className="flex items-center justify-between py-3 sm:py-4 md:py-5">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <div className="relative h-8 w-20 sm:h-10 sm:w-28 md:h-12 md:w-36 lg:h-14 lg:w-40">
              <Image
                src="/logo-kbsk.svg"
                alt="KBSK Trading"
                fill
                className="object-contain"
                priority
              />
            </div>
          </Link>

          {/* Checkout Progress - Hidden on very small mobile */}
          <div className="hidden sm:block">
            <CheckoutProgress currentStep={currentStep} />
          </div>
        </div>

        {/* Mobile-only progress indicator below header */}
        <div className="block sm:hidden pb-3 border-t border-[var(--color-border)] pt-3">
          <CheckoutProgress currentStep={currentStep} />
        </div>
      </div>
    </header>
  );
}
