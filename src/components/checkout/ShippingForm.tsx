"use client";

import { useState } from "react";
import { Truck, Package } from "lucide-react";
import { toast } from "sonner";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { createOrder } from "@/lib/actions/order";
import { createPayfastCheckoutPayload, type PayfastPayloadArray } from "@/lib/actions/payfast";
import { useRouter } from "next/navigation";
import PayfastRedirectForm from "./PayfastRedirectForm";

interface ShippingFormProps {
  userEmail: string;
  isGuest?: boolean;
  isSubmitting: boolean;
  setIsSubmitting: (value: boolean) => void;
}

export default function ShippingForm({ userEmail, isGuest = false, isSubmitting, setIsSubmitting }: ShippingFormProps) {
  const router = useRouter();
  const [shippingMethod, setShippingMethod] = useState<"delivery" | "pickup">("delivery");
  const [sameBillingAddress, setSameBillingAddress] = useState(true);
  const [payfastPayload, setPayfastPayload] = useState<PayfastPayloadArray | null>(null);
  const [formData, setFormData] = useState({
    fullName: "",
    email: userEmail,
    phone: "",
    line1: "",
    line2: "",
    country: "ZA",
    city: "",
    state: "",
    zipCode: "",
    billingFullName: "",
    billingPhone: "",
    billingLine1: "",
    billingLine2: "",
    billingCity: "",
    billingState: "",
    billingZipCode: "",
    saveAddress: false,
    agreeToTerms: false,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.agreeToTerms) {
      toast.error("Please agree to the Terms and Conditions");
      return;
    }

    const requiredShippingFields = ["fullName", "email", "phone", "line1", "city", "state", "zipCode"];
    const missingShippingFields = requiredShippingFields.filter((field) => !formData[field as keyof typeof formData]);

    if (missingShippingFields.length > 0) {
      toast.error("Please fill in all required shipping fields");
      return;
    }

    if (!sameBillingAddress) {
      const requiredBillingFields = ["billingFullName", "billingLine1", "billingCity", "billingState", "billingZipCode"];
      const missingBillingFields = requiredBillingFields.filter((field) => !formData[field as keyof typeof formData]);

      if (missingBillingFields.length > 0) {
        toast.error("Please fill in all required billing address fields");
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const result = await createOrder({
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        line1: formData.line1,
        line2: formData.line2,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode,
        sameBillingAddress,
        billingFullName: formData.billingFullName,
        billingPhone: formData.billingPhone,
        billingLine1: formData.billingLine1,
        billingLine2: formData.billingLine2,
        billingCity: formData.billingCity,
        billingState: formData.billingState,
        billingZipCode: formData.billingZipCode,
        shippingMethod,
        saveAddress: formData.saveAddress,
      });

      if (result.ok && result.order) {
        toast.success("Order created! Redirecting to payment...");
        
        // Generate Payfast payload and redirect
        const paymentResult = await createPayfastCheckoutPayload(result.order.id);
        
        if (paymentResult.ok && paymentResult.payload) {
          // Set payload to trigger redirect
          setPayfastPayload(paymentResult.payload);
        } else {
          const error = !paymentResult.ok ? paymentResult.error : "Failed to initiate payment";
          toast.error(error);
          setIsSubmitting(false);
        }
      } else {
        toast.error(result.error || "Failed to create order");
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error("An error occurred during checkout");
      setIsSubmitting(false);
    }
  };

  // If we have a Payfast payload, show the redirect form
  if (payfastPayload) {
    return <PayfastRedirectForm payload={payfastPayload} />;
  }

  return (
    <div className="rounded-lg bg-white">
      <h1 className="mb-6 text-3xl font-bold text-[var(--color-text-primary)]">Checkout</h1>

      <form id="checkout-form" onSubmit={handleSubmit}>
        {/* SHIPPING METHOD */}
        <div className="mb-6">
          <h2 className="mb-4 text-lg font-medium text-[var(--color-text-primary)]">Shipping Method</h2>

          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setShippingMethod("delivery")}
              className={`flex items-center gap-3 rounded-lg border-2 p-4 transition-colors ${
                shippingMethod === "delivery"
                  ? "border-[var(--color-primary)] bg-[var(--color-primary)]/5"
                  : "border-[var(--color-border)] bg-white hover:border-[var(--color-gray-dark)]"
              }`}
            >
              <Truck className={`h-5 w-5 ${shippingMethod === "delivery" ? "text-[var(--color-primary)]" : "text-[var(--color-text-secondary)]"}`} />
              <span className={`text-sm font-medium ${shippingMethod === "delivery" ? "text-[var(--color-text-primary)]" : "text-[var(--color-text-secondary)]"}`}>
                Delivery
              </span>
            </button>

            <button
              type="button"
              onClick={() => setShippingMethod("pickup")}
              className={`flex items-center gap-3 rounded-lg border-2 p-4 transition-colors ${
                shippingMethod === "pickup"
                  ? "border-[var(--color-primary)] bg-[var(--color-primary)]/5"
                  : "border-[var(--color-border)] bg-white hover:border-[var(--color-gray-dark)]"
              }`}
            >
              <Package className={`h-5 w-5 ${shippingMethod === "pickup" ? "text-[var(--color-primary)]" : "text-[var(--color-text-secondary)]"}`} />
              <span className={`text-sm font-medium ${shippingMethod === "pickup" ? "text-[var(--color-text-primary)]" : "text-[var(--color-text-secondary)]"}`}>
                Pick up
              </span>
            </button>
          </div>
        </div>

        {/* SHIPPING ADDRESS SECTION */}
        <div className="mb-6">
          <h2 className="mb-4 text-lg font-medium text-[var(--color-text-primary)]">Shipping Address</h2>

          <div className="space-y-4">
            <div>
              <label htmlFor="fullName" className="mb-2 block text-sm font-medium text-[var(--color-text-primary)]">
                Full Name <span className="text-[var(--color-error)]">*</span>
              </label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                placeholder="Enter full name"
                className="w-full rounded-lg border border-[var(--color-border)] px-4 py-3 text-sm placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
                required
              />
            </div>

            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-medium text-[var(--color-text-primary)]">
                Email Address <span className="text-[var(--color-error)]">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter email address"
                disabled={!isGuest && userEmail !== ""}
                className="w-full rounded-lg border border-[var(--color-border)] px-4 py-3 text-sm placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)] disabled:bg-[var(--color-gray-light)] disabled:cursor-not-allowed"
                required
              />
              {!isGuest && userEmail && (
                <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
                  Using your account email
                </p>
              )}
            </div>

            <div>
              <label htmlFor="phone" className="mb-2 block text-sm font-medium text-[var(--color-text-primary)]">
                Phone Number <span className="text-[var(--color-error)]">*</span>
              </label>
              <PhoneInput
                country="za"
                value={formData.phone}
                onChange={(phone) => setFormData((prev) => ({ ...prev, phone }))}
                inputProps={{
                  name: "phone",
                  required: true,
                  id: "phone",
                }}
                containerClass="phone-input-container"
                inputClass="phone-input"
                buttonClass="phone-input-button"
                dropdownClass="phone-input-dropdown"
                searchClass="phone-input-search"
                enableSearch
                countryCodeEditable={false}
              />
            </div>

            <div>
              <label htmlFor="line1" className="mb-2 block text-sm font-medium text-[var(--color-text-primary)]">
                Street Address <span className="text-[var(--color-error)]">*</span>
              </label>
              <input
                type="text"
                id="line1"
                name="line1"
                value={formData.line1}
                onChange={handleInputChange}
                placeholder="Enter street address"
                className="w-full rounded-lg border border-[var(--color-border)] px-4 py-3 text-sm placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
                required
              />
            </div>

            <div>
              <label htmlFor="line2" className="mb-2 block text-sm font-medium text-[var(--color-text-primary)]">
                Apartment, Suite, Building (Optional)
              </label>
              <input
                type="text"
                id="line2"
                name="line2"
                value={formData.line2}
                onChange={handleInputChange}
                placeholder="Enter apartment/suite/building number"
                className="w-full rounded-lg border border-[var(--color-border)] px-4 py-3 text-sm placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label htmlFor="city" className="mb-2 block text-sm font-medium text-[var(--color-text-primary)]">
                  City <span className="text-[var(--color-error)]">*</span>
                </label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  placeholder="Enter city"
                  className="w-full rounded-lg border border-[var(--color-border)] px-4 py-3 text-sm placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
                  required
                />
              </div>

              <div>
                <label htmlFor="state" className="mb-2 block text-sm font-medium text-[var(--color-text-primary)]">
                  Province <span className="text-[var(--color-error)]">*</span>
                </label>
                <input
                  type="text"
                  id="state"
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  placeholder="Enter province"
                  className="w-full rounded-lg border border-[var(--color-border)] px-4 py-3 text-sm placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
                  required
                />
              </div>

              <div>
                <label htmlFor="zipCode" className="mb-2 block text-sm font-medium text-[var(--color-text-primary)]">
                  ZIP Code <span className="text-[var(--color-error)]">*</span>
                </label>
                <input
                  type="text"
                  id="zipCode"
                  name="zipCode"
                  value={formData.zipCode}
                  onChange={handleInputChange}
                  placeholder="Enter ZIP code"
                  className="w-full rounded-lg border border-[var(--color-border)] px-4 py-3 text-sm placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
                  required
                />
              </div>
            </div>
          </div>
        </div>

        {/* BILLING ADDRESS SECTION */}
        <div className="mb-6 border-t border-[var(--color-border)] pt-6">
          <h2 className="mb-4 text-lg font-medium text-[var(--color-text-primary)]">Billing Address</h2>

          <div className="mb-4 flex items-center gap-3">
            <input
              type="checkbox"
              id="sameBillingAddress"
              checked={sameBillingAddress}
              onChange={(e) => setSameBillingAddress(e.target.checked)}
              className="h-4 w-4 rounded border-[var(--color-border)] text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
            />
            <label htmlFor="sameBillingAddress" className="text-sm text-[var(--color-text-secondary)]">
              Billing address same as shipping
            </label>
          </div>

          {!sameBillingAddress && (
            <div className="space-y-4 rounded-lg bg-[var(--color-gray-light)] p-4">
              <div>
                <label htmlFor="billingFullName" className="mb-2 block text-sm font-medium text-[var(--color-text-primary)]">
                  Full Name <span className="text-[var(--color-error)]">*</span>
                </label>
                <input
                  type="text"
                  id="billingFullName"
                  name="billingFullName"
                  value={formData.billingFullName}
                  onChange={handleInputChange}
                  placeholder="Enter full name"
                  className="w-full rounded-lg border border-[var(--color-border)] px-4 py-3 text-sm placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
                  required={!sameBillingAddress}
                />
              </div>

              <div>
                <label htmlFor="billingPhone" className="mb-2 block text-sm font-medium text-[var(--color-text-primary)]">
                  Phone (Optional)
                </label>
                <input
                  type="tel"
                  id="billingPhone"
                  name="billingPhone"
                  value={formData.billingPhone}
                  onChange={handleInputChange}
                  placeholder="Enter phone number"
                  className="w-full rounded-lg border border-[var(--color-border)] px-4 py-3 text-sm placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
                />
              </div>

              <div>
                <label htmlFor="billingLine1" className="mb-2 block text-sm font-medium text-[var(--color-text-primary)]">
                  Street Address <span className="text-[var(--color-error)]">*</span>
                </label>
                <input
                  type="text"
                  id="billingLine1"
                  name="billingLine1"
                  value={formData.billingLine1}
                  onChange={handleInputChange}
                  placeholder="Enter street address"
                  className="w-full rounded-lg border border-[var(--color-border)] px-4 py-3 text-sm placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
                  required={!sameBillingAddress}
                />
              </div>

              <div>
                <label htmlFor="billingLine2" className="mb-2 block text-sm font-medium text-[var(--color-text-primary)]">
                  Apartment, Suite, Building (Optional)
                </label>
                <input
                  type="text"
                  id="billingLine2"
                  name="billingLine2"
                  value={formData.billingLine2}
                  onChange={handleInputChange}
                  placeholder="Enter apartment/suite/building number"
                  className="w-full rounded-lg border border-[var(--color-border)] px-4 py-3 text-sm placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="billingCity" className="mb-2 block text-sm font-medium text-[var(--color-text-primary)]">
                    City <span className="text-[var(--color-error)]">*</span>
                  </label>
                  <input
                    type="text"
                    id="billingCity"
                    name="billingCity"
                    value={formData.billingCity}
                    onChange={handleInputChange}
                    placeholder="Enter city"
                    className="w-full rounded-lg border border-[var(--color-border)] px-4 py-3 text-sm placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
                    required={!sameBillingAddress}
                  />
                </div>

                <div>
                  <label htmlFor="billingState" className="mb-2 block text-sm font-medium text-[var(--color-text-primary)]">
                    Province <span className="text-[var(--color-error)]">*</span>
                  </label>
                  <input
                    type="text"
                    id="billingState"
                    name="billingState"
                    value={formData.billingState}
                    onChange={handleInputChange}
                    placeholder="Enter province"
                    className="w-full rounded-lg border border-[var(--color-border)] px-4 py-3 text-sm placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
                    required={!sameBillingAddress}
                  />
                </div>

                <div>
                  <label htmlFor="billingZipCode" className="mb-2 block text-sm font-medium text-[var(--color-text-primary)]">
                    ZIP Code <span className="text-[var(--color-error)]">*</span>
                  </label>
                  <input
                    type="text"
                    id="billingZipCode"
                    name="billingZipCode"
                    value={formData.billingZipCode}
                    onChange={handleInputChange}
                    placeholder="Enter ZIP code"
                    className="w-full rounded-lg border border-[var(--color-border)] px-4 py-3 text-sm placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
                    required={!sameBillingAddress}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* SAVE ADDRESS PREFERENCE */}
        <div className="mb-4 flex items-start gap-3">
          <input
            type="checkbox"
            id="saveAddress"
            name="saveAddress"
            checked={formData.saveAddress}
            onChange={handleInputChange}
            className="mt-1 h-4 w-4 rounded border-[var(--color-border)] text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
          />
          <label htmlFor="saveAddress" className="text-sm text-[var(--color-text-secondary)]">
            Save this address for next purchase
          </label>
        </div>

        {/* TERMS AGREEMENT */}
        <div className="mb-6 flex items-start gap-3">
          <input
            type="checkbox"
            id="agreeToTerms"
            name="agreeToTerms"
            checked={formData.agreeToTerms}
            onChange={handleInputChange}
            className="mt-1 h-4 w-4 rounded border-[var(--color-border)] text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
            required
          />
          <label htmlFor="agreeToTerms" className="text-sm text-[var(--color-text-secondary)]">
            I have read and agree to the Terms and Conditions.
          </label>
        </div>
      </form>
    </div>
  );
}
