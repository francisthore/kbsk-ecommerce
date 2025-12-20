"use client";

import Link from "next/link";
import Image from "next/image";

export interface AdminFooterProps {
  copyrightYear?: number;
  companyName?: string;
}

const ADMIN_LINKS = [
  { label: "Dashboard", href: "/admin" },
  { label: "Products", href: "/admin/products" },
  { label: "Orders", href: "/admin/orders" },
  { label: "Customers", href: "/admin/customers" },
];

const SUPPORT_LINKS = [
  { label: "Documentation", href: "/admin/docs" },
  { label: "Help Center", href: "/admin/help" },
  { label: "System Status", href: "/admin/status" },
];

export default function AdminFooter({
  copyrightYear = new Date().getFullYear(),
  companyName = "KBSK Trading",
}: AdminFooterProps) {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-auto">
      <div className="mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* Logo & Description */}
          <div>
            <Link
              href="/admin"
              className="inline-block rounded-lg bg-white p-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-offset-2 focus:ring-offset-gray-50"
              aria-label={`${companyName} Admin`}
            >
              <Image
                src="/logo-kbsk.svg"
                alt={companyName}
                width={100}
                height={50}
                className="h-10 w-auto"
              />
            </Link>
            <p className="mt-4 text-sm text-gray-600 max-w-xs">
              Admin Dashboard for managing products, orders, and store operations.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-4">
              Quick Links
            </h3>
            <ul className="space-y-2">
              {ADMIN_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-600 hover:text-gray-900 transition-colors focus:outline-none focus:underline focus:decoration-[var(--color-primary)] focus:decoration-2 focus:underline-offset-4"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-4">
              Support
            </h3>
            <ul className="space-y-2">
              {SUPPORT_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-600 hover:text-gray-900 transition-colors focus:outline-none focus:underline focus:decoration-[var(--color-primary)] focus:decoration-2 focus:underline-offset-4"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-8 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-500">
              &copy; {copyrightYear} {companyName}. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-sm text-gray-500">
              <Link
                href="/privacy"
                className="hover:text-gray-900 transition-colors focus:outline-none focus:underline focus:decoration-[var(--color-primary)] focus:decoration-2 focus:underline-offset-4"
              >
                Privacy
              </Link>
              <Link
                href="/terms"
                className="hover:text-gray-900 transition-colors focus:outline-none focus:underline focus:decoration-[var(--color-primary)] focus:decoration-2 focus:underline-offset-4"
              >
                Terms
              </Link>
              <Link
                href="/"
                className="hover:text-gray-900 transition-colors focus:outline-none focus:underline focus:decoration-[var(--color-primary)] focus:decoration-2 focus:underline-offset-4"
              >
                View Store
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
