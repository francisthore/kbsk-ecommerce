"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";

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

                <nav className="space-y-2">
                  <Link
                    href="/account"
                    className="block rounded-md px-4 py-3 text-body-medium text-dark-900 transition-colors hover:bg-light-200 focus:outline-none focus:ring-2 focus:ring-[--color-primary] focus:ring-inset"
                    onClick={onClose}
                  >
                    Account Details
                  </Link>
                  <Link
                    href="/account/orders"
                    className="block rounded-md px-4 py-3 text-body-medium text-dark-900 transition-colors hover:bg-light-200 focus:outline-none focus:ring-2 focus:ring-[--color-primary] focus:ring-inset"
                    onClick={onClose}
                  >
                    My Orders
                  </Link>
                  <Link
                    href="/account/wishlist"
                    className="block rounded-md px-4 py-3 text-body-medium text-dark-900 transition-colors hover:bg-light-200 focus:outline-none focus:ring-2 focus:ring-[--color-primary] focus:ring-inset"
                    onClick={onClose}
                  >
                    Wishlist
                  </Link>
                  <Link
                    href="/account/addresses"
                    className="block rounded-md px-4 py-3 text-body-medium text-dark-900 transition-colors hover:bg-light-200 focus:outline-none focus:ring-2 focus:ring-[--color-primary] focus:ring-inset"
                    onClick={onClose}
                  >
                    Saved Addresses
                  </Link>
                </nav>

                <div className="border-t border-light-300 pt-4">
                  <button
                    className="w-full rounded-md border-2 border-[--color-primary] px-4 py-2 text-body-medium font-medium text-[--color-primary] transition-colors hover:bg-[--color-primary] hover:text-white focus:outline-none focus:ring-2 focus:ring-[--color-primary] focus:ring-offset-2"
                    onClick={onClose}
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <p className="mb-4 text-body text-dark-700">
                    Sign in to access your account, track orders, and manage
                    your preferences.
                  </p>
                  <Link
                    href="/auth/sign-in"
                    className="block w-full rounded-md bg-[--color-cta] px-4 py-3 text-center text-body-medium font-medium text-white transition-colors hover:bg-[--color-cta-dark] focus:outline-none focus:ring-2 focus:ring-[--color-cta] focus:ring-offset-2"
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
                    href="/auth/sign-up"
                    className="block w-full rounded-md border-2 border-[--color-primary] px-4 py-3 text-center text-body-medium font-medium text-[--color-primary] transition-colors hover:bg-[--color-primary] hover:text-white focus:outline-none focus:ring-2 focus:ring-[--color-primary] focus:ring-offset-2"
                    onClick={onClose}
                  >
                    Create Account
                  </Link>
                </div>

                <div className="space-y-2 border-t border-light-300 pt-4">
                  <Link
                    href="/track-order"
                    className="block rounded-md px-4 py-3 text-body-medium text-dark-900 transition-colors hover:bg-light-200 focus:outline-none focus:ring-2 focus:ring-[--color-primary] focus:ring-inset"
                    onClick={onClose}
                  >
                    Track Order
                  </Link>
                  <Link
                    href="/help"
                    className="block rounded-md px-4 py-3 text-body-medium text-dark-900 transition-colors hover:bg-light-200 focus:outline-none focus:ring-2 focus:ring-[--color-primary] focus:ring-inset"
                    onClick={onClose}
                  >
                    Help & Support
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
