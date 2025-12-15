"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Calculator } from "lucide-react";
import { estimateShipping } from "@/lib/actions/cart";
import { formatPrice } from "@/lib/utils/cart";
import { toast } from "sonner";

export default function EstimateShipping() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [country, setCountry] = useState("ZA");
  const [province, setProvince] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [estimate, setEstimate] = useState<{ cost: number; estimatedDays: string } | null>(null);

  const provinces = [
    { value: "GP", label: "Gauteng" },
    { value: "WC", label: "Western Cape" },
    { value: "KZN", label: "KwaZulu-Natal" },
    { value: "EC", label: "Eastern Cape" },
    { value: "FS", label: "Free State" },
    { value: "LP", label: "Limpopo" },
    { value: "MP", label: "Mpumalanga" },
    { value: "NC", label: "Northern Cape" },
    { value: "NW", label: "North West" },
  ];

  const handleCalculate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setEstimate(null);

    try {
      const result = await estimateShipping({
        country,
        province,
        postalCode,
      });

      if (result.success && 'cost' in result && 'estimatedDays' in result) {
        setEstimate({
          cost: result.cost,
          estimatedDays: result.estimatedDays,
        });
        toast.success("Shipping estimated successfully");
      } else {
        toast.error(result.error || "Failed to estimate shipping");
      }
    } catch {
      toast.error("Failed to estimate shipping");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="border-b border-[var(--color-gray-dark)]">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between py-4 text-left text-body-medium font-semibold text-[var(--color-text-primary)] transition-colors hover:text-[var(--color-cta)] focus:outline-none"
        aria-expanded={isOpen}
      >
        <span>Estimate shipping</span>
        {isOpen ? (
          <ChevronUp className="h-5 w-5" />
        ) : (
          <ChevronDown className="h-5 w-5" />
        )}
      </button>

      {isOpen && (
        <div className="pb-6">
          <form onSubmit={handleCalculate} className="space-y-4">
            {/* Country */}
            <div>
              <label htmlFor="country" className="mb-2 block text-caption font-medium text-[var(--color-text-primary)]">
                Country
              </label>
              <select
                id="country"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full rounded-lg border border-[var(--color-gray-dark)] bg-white px-4 py-2.5 text-body text-[var(--color-text-primary)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              >
                <option value="ZA">South Africa</option>
              </select>
            </div>

            {/* Province */}
            <div>
              <label htmlFor="province" className="mb-2 block text-caption font-medium text-[var(--color-text-primary)]">
                Province
              </label>
              <select
                id="province"
                value={province}
                onChange={(e) => setProvince(e.target.value)}
                className="w-full rounded-lg border border-[var(--color-gray-dark)] bg-white px-4 py-2.5 text-body text-[var(--color-text-primary)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              >
                <option value="">Select province</option>
                {provinces.map((prov) => (
                  <option key={prov.value} value={prov.value}>
                    {prov.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Postal Code */}
            <div>
              <label htmlFor="postalCode" className="mb-2 block text-caption font-medium text-[var(--color-text-primary)]">
                Postal Code
              </label>
              <input
                type="text"
                id="postalCode"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                placeholder="1234"
                className="w-full rounded-lg border border-[var(--color-gray-dark)] bg-white px-4 py-2.5 text-body text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              />
            </div>

            {/* Calculate Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--color-primary)] px-6 py-2.5 text-body-medium font-semibold text-white transition-colors hover:bg-[var(--color-primary-dark)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-offset-2 disabled:opacity-50"
            >
              <Calculator className="h-5 w-5" />
              {isLoading ? "Calculating..." : "Calculate Shipping"}
            </button>
          </form>

          {/* Estimate Result */}
          {estimate && (
            <div className="mt-4 rounded-lg bg-[var(--color-gray-light)] p-4">
              <div className="flex items-center justify-between">
                <span className="text-body text-[var(--color-text-secondary)]">
                  Estimated shipping
                </span>
                <span className="text-body-medium font-semibold text-[var(--color-text-primary)]">
                  {estimate.cost === 0 ? "FREE" : formatPrice(estimate.cost)}
                </span>
              </div>
              <p className="mt-2 text-caption text-[var(--color-text-secondary)]">
                Delivery: {estimate.estimatedDays}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
