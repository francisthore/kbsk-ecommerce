"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { signIn as authSignIn } from "@/lib/auth/actions";
import { validateEmail } from "@/lib/utils/validation";
import OAuthButtons from "./OAuthButtons";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validateForm = (): boolean => {
    const newErrors: { email?: string; password?: string } = {};

    if (!email) {
      newErrors.email = "Email is required";
    } else if (!validateEmail(email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!password) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("email", email);
      formData.append("password", password);

      const result = await authSignIn(formData);

      if (result?.ok) {
        toast.success("Welcome back!");
        router.push(redirectTo);
      } else {
        toast.error("Invalid email or password");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
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
            <h1 className="text-heading-2 text-dark-900">Welcome Back</h1>
            <p className="mt-2 text-body text-dark-700">
              Sign in to continue shopping at KBSK Trading
            </p>
          </div>

          {/* OAuth Buttons */}
          <OAuthButtons redirectTo={redirectTo} />

          {/* Divider */}
          <div className="my-6 flex items-center gap-4">
            <hr className="h-px w-full border-0 bg-light-300" />
            <span className="shrink-0 text-caption text-dark-700">
              Or continue with email
            </span>
            <hr className="h-px w-full border-0 bg-light-300" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-caption text-dark-900">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setErrors((prev) => ({ ...prev, email: undefined }));
                }}
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
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setErrors((prev) => ({ ...prev, password: undefined }));
                  }}
                  className={`w-full rounded-xl border ${
                    errors.password ? "border-error" : "border-light-300"
                  } bg-light-100 px-4 py-3 pr-12 text-body text-dark-900 placeholder:text-dark-500 focus:border-[--color-primary] focus:outline-none focus:ring-2 focus:ring-[--color-primary]/20`}
                  placeholder="Enter your password"
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
              {errors.password && (
                <p className="text-caption text-error">{errors.password}</p>
              )}
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-light-300 text-[--color-primary] focus:ring-2 focus:ring-[--color-primary]/20"
                  disabled={isLoading}
                />
                <span className="text-caption text-dark-700">Remember me</span>
              </label>
              <Link
                href="/forgot-password"
                className="text-caption text-[--color-primary] hover:underline"
              >
                Forgot password?
              </Link>
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
                  Signing in...
                </span>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          {/* Sign Up Link */}
          <p className="mt-6 text-center text-caption text-dark-700">
            Don&apos;t have an account?{" "}
            <Link
              href="/signup"
              className="font-medium text-[--color-primary] hover:underline"
            >
              Create an account
            </Link>
          </p>
        </div>

        {/* Benefits */}
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <h3 className="mb-3 text-center text-body-medium text-dark-900">
            Why sign in?
          </h3>
          <ul className="space-y-2 text-caption text-dark-700">
            <li className="flex items-center gap-2">
              <svg className="h-5 w-5 flex-shrink-0 text-[--color-primary]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Track your orders in real-time
            </li>
            <li className="flex items-center gap-2">
              <svg className="h-5 w-5 flex-shrink-0 text-[--color-primary]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Save your cart across devices
            </li>
            <li className="flex items-center gap-2">
              <svg className="h-5 w-5 flex-shrink-0 text-[--color-primary]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Quick and easy checkout
            </li>
            <li className="flex items-center gap-2">
              <svg className="h-5 w-5 flex-shrink-0 text-[--color-primary]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Access exclusive deals and offers
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
