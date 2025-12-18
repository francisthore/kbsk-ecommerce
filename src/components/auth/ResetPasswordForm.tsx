"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Eye, EyeOff, Loader2, Check, X } from "lucide-react";
import { toast } from "sonner";
import {
  validatePassword,
  passwordsMatch,
  getPasswordStrength,
} from "@/lib/utils/validation";
import { resetPassword } from "@/lib/auth/client";

export default function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{
    password?: string;
    confirmPassword?: string;
  }>({});

  const passwordStrength = getPasswordStrength(password);
  const passwordValidation = validatePassword(password);

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

    if (!password) {
      newErrors.password = "Password is required";
    } else if (!passwordValidation.valid) {
      newErrors.password = passwordValidation.errors[0];
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (!passwordsMatch(password, confirmPassword)) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm() || !token) {
      if (!token) {
        toast.error("Reset link is invalid");
      }
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          newPassword: password,
          token: token || "",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message || "Failed to reset password");
        return;
      }

      toast.success("Password reset successfully!");
      router.push("/login");
    } catch (err) {
      console.error("Unexpected error:", err);
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-light-200 px-4 py-12">
        <div className="w-full max-w-[480px] space-y-8">
          <div className="flex justify-center">
            <Image
              src="/logo-kbsk.svg"
              alt="KBSK Trading"
              width={120}
              height={40}
              priority
            />
          </div>

          <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
            <div className="mb-6 flex justify-center">
              <div className="rounded-full bg-error/10 p-4">
                <X className="h-12 w-12 text-error" />
              </div>
            </div>

            <h1 className="mb-3 text-heading-3 text-dark-900">
              Invalid or Expired Link
            </h1>
            <p className="mb-8 text-body text-dark-700">
              This password reset link is invalid or has expired. Please request a new one.
            </p>

            <Link
              href="/forgot-password"
              className="inline-block w-full rounded-full bg-[var(--color-cta)] px-6 py-3.5 text-body-medium text-white transition-all hover:bg-[--color-cta-dark]"
            >
              Request New Link
            </Link>

            <Link
              href="/login"
              className="mt-4 inline-block text-caption text-[var(--color-primary)] hover:underline"
            >
              Back to sign in
            </Link>
          </div>
        </div>
      </div>
    );
  }

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
            <h1 className="text-heading-2 text-dark-900">Reset Your Password</h1>
            <p className="mt-2 text-body text-dark-700">
              Enter your new password below
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Password Field */}
            <div className="space-y-2">
              <label htmlFor="password" className="block text-caption text-dark-900">
                New Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setErrors((prev) => ({ ...prev, password: undefined }));
                  }}
                  className={`w-full rounded-xl border ${
                    errors.password ? "border-error" : "border-light-300"
                  } bg-light-100 px-4 py-3 pr-12 text-body text-dark-900 placeholder:text-dark-500 focus:border-[--color-primary] focus:outline-none focus:ring-2 focus:ring-[--color-primary]/20`}
                  placeholder="Create a strong password"
                  disabled={isLoading}
                  autoFocus
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
              {password && (
                <div className="space-y-2">
                  <div className="flex gap-1">
                    {[...Array(4)].map((_, i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-all ${
                          i < passwordStrength
                            ? getStrengthColor(passwordStrength)
                            : "bg-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  {passwordStrength > 0 && (
                    <p className="text-caption text-dark-700">
                      Password strength: {getStrengthText(passwordStrength)}
                    </p>
                  )}
                </div>
              )}

              {/* Password Requirements */}
              {password && !passwordValidation.valid && (
                <div className="space-y-1 rounded-lg bg-light-200 p-3">
                  <p className="text-caption font-medium text-dark-900">
                    Password must contain:
                  </p>
                  <ul className="space-y-1">
                    <li
                      className={`flex items-center gap-2 text-caption ${
                        password.length >= 8 ? "text-success" : "text-dark-700"
                      }`}
                    >
                      {password.length >= 8 ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <X className="h-4 w-4" />
                      )}
                      At least 8 characters
                    </li>
                    <li
                      className={`flex items-center gap-2 text-caption ${
                        /[A-Z]/.test(password) ? "text-success" : "text-dark-700"
                      }`}
                    >
                      {/[A-Z]/.test(password) ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <X className="h-4 w-4" />
                      )}
                      One uppercase letter
                    </li>
                    <li
                      className={`flex items-center gap-2 text-caption ${
                        /[a-z]/.test(password) ? "text-success" : "text-dark-700"
                      }`}
                    >
                      {/[a-z]/.test(password) ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <X className="h-4 w-4" />
                      )}
                      One lowercase letter
                    </li>
                    <li
                      className={`flex items-center gap-2 text-caption ${
                        /\d/.test(password) ? "text-success" : "text-dark-700"
                      }`}
                    >
                      {/\d/.test(password) ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <X className="h-4 w-4" />
                      )}
                      One number
                    </li>
                    <li
                      className={`flex items-center gap-2 text-caption ${
                        /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
                          ? "text-success"
                          : "text-dark-700"
                      }`}
                    >
                      {/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password) ? (
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
              <label
                htmlFor="confirmPassword"
                className="block text-caption text-dark-900"
              >
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
                  }}
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
                  aria-label={
                    showConfirmPassword ? "Hide password" : "Show password"
                  }
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

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-full bg-[var(--color-cta)] px-6 py-3.5 text-body-medium text-white transition-all hover:bg-[--color-cta-dark] focus:outline-none focus:ring-2 focus:ring-[--color-cta]/20 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Resetting password...
                </span>
              ) : (
                "Reset Password"
              )}
            </button>
          </form>

          {/* Back Link */}
          <p className="mt-6 text-center text-caption text-dark-700">
            <Link
              href="/login"
              className="font-medium text-[var(--color-primary)] hover:underline"
            >
              Back to sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
