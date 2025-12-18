"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Loader2, ArrowLeft, Mail } from "lucide-react";
import { toast } from "sonner";
import { validateEmail } from "@/lib/utils/validation";
import { forgetPassword } from "@/lib/auth/client";

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email) {
      setError("Email is required");
      return;
    }

    if (!validateEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/request-password-reset", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          redirectTo: "/reset-password",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message || "Failed to send reset email");
        return;
      }

      setEmailSent(true);
      toast.success("Password reset instructions sent!");
    } catch (err) {
      console.error("Unexpected error:", err);
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (emailSent) {
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

          {/* Success Card */}
          <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
            <div className="mb-6 flex justify-center">
              <div className="rounded-full bg-success/10 p-4">
                <Mail className="h-12 w-12 text-success" />
              </div>
            </div>
            
            <h1 className="mb-3 text-heading-3 text-dark-900">
              Check Your Email
            </h1>
            <p className="mb-6 text-body text-dark-700">
              We&apos;ve sent password reset instructions to:
            </p>
            <p className="mb-8 text-body-medium text-dark-900">{email}</p>
            
            <p className="mb-6 text-caption text-dark-700">
              Didn&apos;t receive the email? Check your spam folder or{" "}
              <button
                onClick={() => {
                  setEmailSent(false);
                  setEmail("");
                }}
                className="text-[var(--color-primary)] hover:underline"
              >
                try another email address
              </button>
            </p>

            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-caption text-[var(--color-primary)] hover:underline"
            >
              <ArrowLeft className="h-4 w-4" />
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
          <div className="mb-8">
            <Link
              href="/login"
              className="mb-4 inline-flex items-center gap-2 text-caption text-dark-700 hover:text-dark-900"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to sign in
            </Link>
            <h1 className="mt-4 text-heading-2 text-dark-900">
              Forgot Password?
            </h1>
            <p className="mt-2 text-body text-dark-700">
              No worries! Enter your email and we&apos;ll send you reset instructions.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
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
                  setError("");
                }}
                className={`w-full rounded-xl border ${
                  error ? "border-error" : "border-light-300"
                } bg-light-100 px-4 py-3 text-body text-dark-900 placeholder:text-dark-500 focus:border-[--color-primary] focus:outline-none focus:ring-2 focus:ring-[--color-primary]/20`}
                placeholder="your.email@example.com"
                disabled={isLoading}
                autoFocus
              />
              {error && <p className="text-caption text-error">{error}</p>}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-full bg-[var(--color-cta)] px-6 py-3.5 text-body-medium text-white transition-all hover:bg-[--color-cta-dark] focus:outline-none focus:ring-2 focus:ring-[--color-cta]/20 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Sending...
                </span>
              ) : (
                "Send Reset Instructions"
              )}
            </button>
          </form>
        </div>

        {/* Help Text */}
        <div className="rounded-xl bg-white p-6 text-center shadow-sm">
          <p className="text-caption text-dark-700">
            Remember your password?{" "}
            <Link
              href="/login"
              className="font-medium text-[var(--color-primary)] hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
