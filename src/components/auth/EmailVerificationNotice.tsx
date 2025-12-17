"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Loader2, Mail, RefreshCw } from "lucide-react";
import { toast } from "sonner";

interface EmailVerificationNoticeProps {
  email: string;
}

export default function EmailVerificationNotice({
  email,
}: EmailVerificationNoticeProps) {
  const [isResending, setIsResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const handleResend = async () => {
    if (cooldown > 0) return;

    setIsResending(true);

    try {
      // Use Better Auth's native resend verification API endpoint
      const response = await fetch("/api/auth/send-verification-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          email,
          callbackURL: "/verify-email"
        }),
      });

      // Try to parse JSON response if available
      let data = null;
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        try {
          data = await response.json();
        } catch {
          // Failed to parse JSON, that's ok
        }
      }

      if (!response.ok) {
        const errorMsg = data?.error?.message || data?.message || "Failed to resend email. Please try again.";
        console.error("Resend verification error:", { status: response.status, error: data });
        toast.error(errorMsg);
      } else {
        toast.success("Verification email sent!");
        
        // Start 60-second cooldown
        setCooldown(60);
        const interval = setInterval(() => {
          setCooldown((prev) => {
            if (prev <= 1) {
              clearInterval(interval);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }
    } catch (error) {
      console.error("Resend verification error:", error);
      toast.error("Failed to resend email. Please try again.");
    } finally {
      setIsResending(false);
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
        <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
          <div className="mb-6 flex justify-center">
            <div className="rounded-full bg-[var(--color-cta)]/10 p-4">
              <Mail className="h-12 w-12 text-[--color-cta]" />
            </div>
          </div>

          <h1 className="mb-3 text-heading-3 text-dark-900">
            Verify Your Email
          </h1>
          <p className="mb-6 text-body text-dark-700">
            We&apos;ve sent a verification email to:
          </p>
          <p className="mb-8 text-body-medium text-dark-900">{email}</p>

          <div className="space-y-4">
            <p className="text-caption text-dark-700">
              Click the link in the email to verify your account and get started with KBSK Trading.
            </p>

            <button
              onClick={handleResend}
              disabled={isResending || cooldown > 0}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-[--color-primary] bg-white px-6 py-3 text-body-medium text-[var(--color-primary)] transition-all hover:bg-[var(--color-primary)] hover:text-white focus:outline-none focus:ring-2 focus:ring-[--color-primary]/20 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isResending ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Sending...
                </>
              ) : cooldown > 0 ? (
                <>
                  <RefreshCw className="h-5 w-5" />
                  Resend in {cooldown}s
                </>
              ) : (
                <>
                  <RefreshCw className="h-5 w-5" />
                  Resend Verification Email
                </>
              )}
            </button>
          </div>

          <div className="mt-8 space-y-2 rounded-lg bg-light-200 p-4">
            <p className="text-caption font-medium text-dark-900">
              Didn&apos;t receive the email?
            </p>
            <ul className="space-y-1 text-caption text-dark-700">
              <li>• Check your spam or junk folder</li>
              <li>• Make sure {email} is correct</li>
              <li>• Add no-reply@kbsktrading.net to your contacts</li>
            </ul>
          </div>

          <div className="mt-6 flex items-center justify-center gap-2 text-caption text-dark-700">
            <span>Wrong email?</span>
            <Link
              href="/signup"
              className="font-medium text-[var(--color-primary)] hover:underline"
            >
              Sign up again
            </Link>
          </div>
        </div>

        {/* Help */}
        <div className="rounded-xl bg-white p-6 text-center shadow-sm">
          <p className="text-caption text-dark-700">
            Need help?{" "}
            <a
              href="mailto:support@kbsktrading.com"
              className="font-medium text-[var(--color-primary)] hover:underline"
            >
              Contact support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
