"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Eye, EyeOff, Loader2, Check, X } from "lucide-react";
import { toast } from "sonner";
import { signUp as authSignUp } from "@/lib/auth/actions";
import {
  validateEmail,
  validatePassword,
  validateName,
  passwordsMatch,
  getPasswordStrength,
} from "@/lib/utils/validation";
import OAuthButtons from "./OAuthButtons";

export default function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/";

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    terms?: string;
  }>({});

  const passwordStrength = getPasswordStrength(formData.password);
  const passwordValidation = validatePassword(formData.password);

  const getStrengthColor = (strength: number) => {
    if (strength === 0) return "bg-gray-300";
    if (strength <= 1) return "bg-error";
    if (strength === 2) return "bg-warning";
    if (strength === 3) return "bg-[--color-secondary]";
    return "bg-success";
  };

  const getStrengthText = (strength: number) => {
    if (strength === 0) return "";
    if (strength <= 1) return "Weak";
    if (strength === 2) return "Fair";
    if (strength === 3) return "Good";
    return "Strong";
  };

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    if (!formData.name) {
      newErrors.name = "Name is required";
    } else if (!validateName(formData.name)) {
      newErrors.name = "Please enter a valid name";
    }

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (!passwordValidation.valid) {
      newErrors.password = passwordValidation.errors[0];
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (!passwordsMatch(formData.password, formData.confirmPassword)) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (!acceptedTerms) {
      newErrors.terms = "You must accept the terms and conditions";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const formDataObj = new FormData();
      formDataObj.append("name", formData.name);
      formDataObj.append("email", formData.email);
      formDataObj.append("password", formData.password);

      const result = await authSignUp(formDataObj);

      if (result?.ok) {
        toast.success("Account created! Please check your email to verify your account.");
        router.push(`/verify-email?email=${encodeURIComponent(formData.email)}`);
      } else {
        toast.error("Failed to create account. Email may already be in use.");
      }
    } catch (error) {
      console.error("Signup error:", error);
      if (error instanceof Error && error.message?.includes("email")) {
        toast.error("This email is already registered");
      } else {
        toast.error("An error occurred. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const updateField = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-light-200 px-4 py-12">
      <div className="w-full max-w-[480px] space-y-8">
        {/* Logo */}
        <div className="flex justify-center">
          <Image
            src="/logo-kbsk.svg"
            alt="KBSK Trading"
            width={120}
            height={40}
            priority
          />
        </div>

        {/* Card */}
        <div className="rounded-2xl bg-white p-8 shadow-sm">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-heading-2 text-dark-900">Create Your Account</h1>
            <p className="mt-2 text-body text-dark-700">
              Join KBSK Trading today
            </p>
          </div>

          {/* OAuth Buttons */}
          <OAuthButtons redirectTo={redirectTo} />

          {/* Divider */}
          <div className="my-6 flex items-center gap-4">
            <hr className="h-px w-full border-0 bg-light-300" />
            <span className="shrink-0 text-caption text-dark-700">
              Or sign up with email
            </span>
            <hr className="h-px w-full border-0 bg-light-300" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name Field */}
            <div className="space-y-2">
              <label htmlFor="name" className="block text-caption text-dark-900">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => updateField("name", e.target.value)}
                className={`w-full rounded-xl border ${
                  errors.name ? "border-error" : "border-light-300"
                } bg-light-100 px-4 py-3 text-body text-dark-900 placeholder:text-dark-500 focus:border-[--color-primary] focus:outline-none focus:ring-2 focus:ring-[--color-primary]/20`}
                placeholder="John Doe"
                disabled={isLoading}
              />
              {errors.name && (
                <p className="text-caption text-error">{errors.name}</p>
              )}
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-caption text-dark-900">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => updateField("email", e.target.value)}
                className={`w-full rounded-xl border ${
                  errors.email ? "border-error" : "border-light-300"
                } bg-light-100 px-4 py-3 text-body text-dark-900 placeholder:text-dark-500 focus:border-[--color-primary] focus:outline-none focus:ring-2 focus:ring-[--color-primary]/20`}
                placeholder="your.email@example.com"
                disabled={isLoading}
              />
              {errors.email && (
                <p className="text-caption text-error">{errors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label htmlFor="password" className="block text-caption text-dark-900">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => updateField("password", e.target.value)}
                  className={`w-full rounded-xl border ${
                    errors.password ? "border-error" : "border-light-300"
                  } bg-light-100 px-4 py-3 pr-12 text-body text-dark-900 placeholder:text-dark-500 focus:border-[--color-primary] focus:outline-none focus:ring-2 focus:ring-[--color-primary]/20`}
                  placeholder="Create a strong password"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-dark-700 hover:text-dark-900"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              
              {/* Password Strength Indicator */}
              {formData.password && (
                <div className="space-y-2">
                  <div className="flex gap-1">
                    {[...Array(4)].map((_, i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-all ${
                          i < passwordStrength ? getStrengthColor(passwordStrength) : "bg-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  {passwordStrength > 0 && (
                    <p className="text-caption" style={{ color: getStrengthColor(passwordStrength).replace("bg-", "var(--color-") + ")" }}>
                      Password strength: {getStrengthText(passwordStrength)}
                    </p>
                  )}
                </div>
              )}

              {/* Password Requirements */}
              {formData.password && !passwordValidation.valid && (
                <div className="space-y-1 rounded-lg bg-light-200 p-3">
                  <p className="text-caption font-medium text-dark-900">
                    Password must contain:
                  </p>
                  <ul className="space-y-1">
                    <li className={`flex items-center gap-2 text-caption ${formData.password.length >= 8 ? "text-success" : "text-dark-700"}`}>
                      {formData.password.length >= 8 ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <X className="h-4 w-4" />
                      )}
                      At least 8 characters
                    </li>
                    <li className={`flex items-center gap-2 text-caption ${/[A-Z]/.test(formData.password) ? "text-success" : "text-dark-700"}`}>
                      {/[A-Z]/.test(formData.password) ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <X className="h-4 w-4" />
                      )}
                      One uppercase letter
                    </li>
                    <li className={`flex items-center gap-2 text-caption ${/[a-z]/.test(formData.password) ? "text-success" : "text-dark-700"}`}>
                      {/[a-z]/.test(formData.password) ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <X className="h-4 w-4" />
                      )}
                      One lowercase letter
                    </li>
                    <li className={`flex items-center gap-2 text-caption ${/\d/.test(formData.password) ? "text-success" : "text-dark-700"}`}>
                      {/\d/.test(formData.password) ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <X className="h-4 w-4" />
                      )}
                      One number
                    </li>
                    <li className={`flex items-center gap-2 text-caption ${/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(formData.password) ? "text-success" : "text-dark-700"}`}>
                      {/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(formData.password) ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <X className="h-4 w-4" />
                      )}
                      One special character
                    </li>
                  </ul>
                </div>
              )}

              {errors.password && (
                <p className="text-caption text-error">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="block text-caption text-dark-900">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={(e) => updateField("confirmPassword", e.target.value)}
                  className={`w-full rounded-xl border ${
                    errors.confirmPassword ? "border-error" : "border-light-300"
                  } bg-light-100 px-4 py-3 pr-12 text-body text-dark-900 placeholder:text-dark-500 focus:border-[--color-primary] focus:outline-none focus:ring-2 focus:ring-[--color-primary]/20`}
                  placeholder="Re-enter your password"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-dark-700 hover:text-dark-900"
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  disabled={isLoading}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-caption text-error">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Terms & Conditions */}
            <div className="space-y-2">
              <label className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(e) => {
                    setAcceptedTerms(e.target.checked);
                    setErrors((prev) => ({ ...prev, terms: undefined }));
                  }}
                  className={`mt-0.5 h-4 w-4 rounded border-light-300 text-[--color-primary] focus:ring-2 focus:ring-[--color-primary]/20 ${
                    errors.terms ? "border-error" : ""
                  }`}
                  disabled={isLoading}
                />
                <span className="text-caption text-dark-700">
                  I agree to the{" "}
                  <Link href="/terms" className="text-[--color-primary] hover:underline">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link href="/privacy" className="text-[--color-primary] hover:underline">
                    Privacy Policy
                  </Link>
                </span>
              </label>
              {errors.terms && (
                <p className="text-caption text-error">{errors.terms}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-full bg-[--color-cta] px-6 py-3.5 text-body-medium text-white transition-all hover:bg-[--color-cta-dark] focus:outline-none focus:ring-2 focus:ring-[--color-cta]/20 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Creating account...
                </span>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          {/* Sign In Link */}
          <p className="mt-6 text-center text-caption text-dark-700">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium text-[--color-primary] hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
