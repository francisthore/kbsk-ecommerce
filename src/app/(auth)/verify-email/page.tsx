"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";
import { EmailVerificationNotice } from "@/components/auth";

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  const [status, setStatus] = useState<"verifying" | "success" | "error">("verifying");

  useEffect(() => {
    const verify = async () => {
      if (!token) {
        if (email) {
          // Show email verification notice if we only have email
          setStatus("success");
          return;
        }
        setStatus("error");
        return;
      }

      try {
        // Use Better Auth's native email verification API endpoint
        const response = await fetch("/api/auth/verify-email", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token }),
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
          console.error("Email verification error:", { status: response.status, error: data });
          toast.error("Verification failed. Please try again or request a new link.");
          setStatus("error");
        } else {
          setStatus("success");
          toast.success("Email verified successfully! You are now logged in.");
          // Refresh to update auth state, then redirect
          router.refresh();
          setTimeout(() => {
            router.push("/");
          }, 1500);
        }
      } catch (error) {
        console.error("Email verification error:", error);
        setStatus("error");
      }
    };

    verify();
  }, [token, email, router]);

  // Show verification notice if we only have email (coming from signup)
  if (!token && email) {
    return <EmailVerificationNotice email={email} />;
  }

  if (status === "verifying") {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-light-200">
        <div className="text-center">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-[var(--color-primary)]" />
          <p className="mt-4 text-body text-dark-700">Verifying your email...</p>
        </div>
      </div>
    );
  }

  if (status === "success") {
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
              <div className="rounded-full bg-success/10 p-4">
                <CheckCircle className="h-12 w-12 text-success" />
              </div>
            </div>

            <h1 className="mb-3 text-heading-3 text-dark-900">
              Email Verified!
            </h1>
            <p className="mb-8 text-body text-dark-700">
              Your email has been successfully verified. You are now signed in!
            </p>

            <Link
              href="/"
              className="inline-block w-full rounded-full bg-[var(--color-cta)] px-6 py-3.5 text-body-medium text-white transition-all hover:bg-[--color-cta-dark]"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

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
              <XCircle className="h-12 w-12 text-error" />
            </div>
          </div>

          <h1 className="mb-3 text-heading-3 text-dark-900">
            Verification Failed
          </h1>
          <p className="mb-8 text-body text-dark-700">
            This verification link is invalid or has expired. Please request a new verification email.
          </p>

          <Link
            href="/signup"
            className="inline-block w-full rounded-full bg-[var(--color-cta)] px-6 py-3.5 text-body-medium text-white transition-all hover:bg-[--color-cta-dark]"
          >
            Back to Sign Up
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
