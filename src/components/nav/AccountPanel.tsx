"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { signOut } from "@/lib/auth/actions";
import { User, Package, Heart, MapPin, Settings, LogOut, CheckCircle } from "lucide-react";

export interface AccountPanelProps {
  isOpen: boolean;
  onClose: () => void;
  isSignedIn?: boolean;
  userName?: string;
}

export default function AccountPanel({
  isOpen,
  onClose,
  isSignedIn = false,
  userName,
}: AccountPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success("Signed out successfully");
      onClose();
      router.push("/");
    } catch (error) {
      console.error("Sign out error:", error);
      toast.error("Failed to sign out");
    }
  };

  useEffect(() => {
    if (isOpen) {
      // Disable body scroll
      document.body.style.overflow = "hidden";

      // Focus close button
      closeButtonRef.current?.focus();

      // Handle Escape key
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          onClose();
        }
      };

      document.addEventListener("keydown", handleEscape);

      return () => {
        document.body.style.overflow = "";
        document.removeEventListener("keydown", handleEscape);
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-50 bg-dark-900/50 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="My Account"
        className="fixed right-0 top-0 z-50 h-full w-full max-w-[360px] bg-white shadow-xl sm:max-w-md"
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-light-300 px-6 py-4">
            <h2 className="text-heading-3 text-dark-900">My Account</h2>
            <button
              ref={closeButtonRef}
              onClick={onClose}
              className="rounded-full p-2 text-dark-700 transition-colors hover:bg-light-200 hover:text-dark-900 focus:outline-none focus:ring-2 focus:ring-[--color-primary]"
              aria-label="Close account panel"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-6 py-6">
            {isSignedIn ? (
              <div className="space-y-6">
                <div className="rounded-lg bg-light-200 p-4">
                  <p className="text-lead font-medium text-dark-900">
                    Welcome back, {userName || "User"}!
                  </p>
                </div>

                <nav className="space-y-1">
                  <Link
                    href="/account"
                    className="flex items-center gap-3 rounded-lg px-4 py-3 text-body-medium text-dark-900 transition-colors hover:bg-light-200 focus:outline-none focus:ring-2 focus:ring-[--color-primary] focus:ring-inset"
                    onClick={onClose}
                  >
                    <User className="h-5 w-5 text-dark-700" />
                    Account Details
                  </Link>
                  <Link
                    href="/account/orders"
                    className="flex items-center gap-3 rounded-lg px-4 py-3 text-body-medium text-dark-900 transition-colors hover:bg-light-200 focus:outline-none focus:ring-2 focus:ring-[--color-primary] focus:ring-inset"
                    onClick={onClose}
                  >
                    <Package className="h-5 w-5 text-dark-700" />
                    Order History
                  </Link>
                  <Link
                    href="/account/wishlist"
                    className="flex items-center gap-3 rounded-lg px-4 py-3 text-body-medium text-dark-900 transition-colors hover:bg-light-200 focus:outline-none focus:ring-2 focus:ring-[--color-primary] focus:ring-inset"
                    onClick={onClose}
                  >
                    <Heart className="h-5 w-5 text-dark-700" />
                    Wishlist
                  </Link>
                  <Link
                    href="/account/addresses"
                    className="flex items-center gap-3 rounded-lg px-4 py-3 text-body-medium text-dark-900 transition-colors hover:bg-light-200 focus:outline-none focus:ring-2 focus:ring-[--color-primary] focus:ring-inset"
                    onClick={onClose}
                  >
                    <MapPin className="h-5 w-5 text-dark-700" />
                    Addresses
                  </Link>
                  <Link
                    href="/account/settings"
                    className="flex items-center gap-3 rounded-lg px-4 py-3 text-body-medium text-dark-900 transition-colors hover:bg-light-200 focus:outline-none focus:ring-2 focus:ring-[--color-primary] focus:ring-inset"
                    onClick={onClose}
                  >
                    <Settings className="h-5 w-5 text-dark-700" />
                    Settings
                  </Link>
                </nav>

                <div className="border-t border-light-300 pt-4">
                  <button
                    onClick={handleSignOut}
                    className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-[--color-primary] px-4 py-3 text-body-medium font-medium text-[var(--color-primary)] transition-colors hover:bg-[var(--color-primary)] hover:text-white focus:outline-none focus:ring-2 focus:ring-[--color-primary] focus:ring-offset-2"
                  >
                    <LogOut className="h-5 w-5" />
                    Sign Out
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <p className="mb-4 text-body text-dark-700">
                    Sign in to access your account and enjoy exclusive benefits.
                  </p>
                  <Link
                    href="/login"
                    className="block w-full rounded-lg bg-[var(--color-cta)] px-4 py-3.5 text-center text-body-medium font-medium text-white transition-colors hover:bg-[--color-cta-dark] focus:outline-none focus:ring-2 focus:ring-[--color-cta] focus:ring-offset-2"
                    onClick={onClose}
                  >
                    Sign In
                  </Link>
                </div>

                <div className="border-t border-light-300 pt-4">
                  <p className="mb-3 text-caption text-dark-700">
                    New to KBSK Trading?
                  </p>
                  <Link
                    href="/signup"
                    className="block w-full rounded-lg border-2 border-[var(--color-primary)] px-4 py-3 text-center text-body-medium font-medium text-[var(--color-primary)] transition-colors hover:bg-[var(--color-primary)] hover:text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-offset-2"
                    onClick={onClose}
                  >
                    Create Account
                  </Link>
                </div>

                {/* Benefits List */}
                <div className="space-y-3 border-t border-light-300 pt-4">
                  <p className="text-caption font-medium text-dark-900">
                    Why create an account?
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2 text-caption text-dark-700">
                      <CheckCircle className="h-4 w-4 flex-shrink-0 text-success" />
                      Track your orders
                    </li>
                    <li className="flex items-start gap-2 text-caption text-dark-700">
                      <CheckCircle className="h-4 w-4 flex-shrink-0 text-success" />
                      Save cart across devices
                    </li>
                    <li className="flex items-start gap-2 text-caption text-dark-700">
                      <CheckCircle className="h-4 w-4 flex-shrink-0 text-success" />
                      Quick checkout
                    </li>
                    <li className="flex items-start gap-2 text-caption text-dark-700">
                      <CheckCircle className="h-4 w-4 flex-shrink-0 text-success" />
                      Exclusive deals
                    </li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
