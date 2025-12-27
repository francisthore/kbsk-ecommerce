"use client";

import { Check } from "lucide-react";

interface CheckoutProgressProps {
  currentStep: "cart" | "review" | "checkout" | "success";
}

const steps = [
  { id: "cart", label: "Cart" },
  { id: "review", label: "Review" },
  { id: "checkout", label: "Checkout" },
];

export default function CheckoutProgress({ currentStep }: CheckoutProgressProps) {
  // If success, show all steps as completed
  const allCompleted = currentStep === "success";
  const currentIndex = allCompleted ? steps.length : steps.findIndex((step) => step.id === currentStep);

  return (
    <div className="flex items-center justify-center gap-2 sm:gap-3 md:gap-6 overflow-x-auto px-2">
      {steps.map((step, index) => {
        const isCompleted = allCompleted || index < currentIndex;
        const isCurrent = !allCompleted && index === currentIndex;
        const stepNumber = index + 1;

        return (
          <div key={step.id} className="flex items-center gap-4">
            {/* Step Circle */}
            <div className="flex items-center gap-2 sm:gap-3">
              <div
                className={`flex h-7 w-7 sm:h-9 sm:w-9 md:h-10 md:w-10 items-center justify-center rounded-full text-xs sm:text-sm font-medium transition-colors ${
                  isCompleted
                    ? "bg-[var(--color-primary)] text-white"
                    : isCurrent
                      ? "bg-[var(--color-cta)] text-white"
                      : "bg-[var(--color-gray-medium)] text-[var(--color-text-secondary)]"
                }`}
              >
                {isCompleted ? (
                  <Check className="h-4 w-4 sm:h-5 sm:w-5" />
                ) : (
                  stepNumber
                )}
              </div>
              <span
                className={`text-[10px] xs:text-xs sm:text-sm font-medium ${
                  isCurrent
                    ? "text-[var(--color-text-primary)]"
                    : "text-[var(--color-text-secondary)]"
                }`}
              >
                {step.label}
              </span>
            </div>

            {/* Connector Line */}
            {index < steps.length - 1 && (
              <div
                className={`h-[2px] w-6 sm:w-12 md:w-20 lg:w-28 ${
                  index < currentIndex
                    ? "bg-[var(--color-primary)]"
                    : "bg-[var(--color-gray-medium)]"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
