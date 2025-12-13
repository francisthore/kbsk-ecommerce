"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export interface FooterColumn {
  title: string;
  links: { label: string; href: string }[];
}

export interface FooterProps {
  shopLinks?: { label: string; href: string }[];
  supportLinks?: { label: string; href: string }[];
  companyLinks?: { label: string; href: string }[];
  showPayments?: boolean;
  showNewsletter?: boolean;
  copyrightYear?: number;
  companyName?: string;
}

const DEFAULT_SHOP_LINKS = [
  { label: "Power Tools", href: "/products?category=power-tools" },
  { label: "Hand Tools", href: "/products?category=hand-tools" },
  { label: "PPE & Safety", href: "/products?category=ppe" },
  { label: "Accessories", href: "/products?category=accessories" },
  { label: "Brands", href: "/brands" },
  { label: "Deals & Offers", href: "/deals" },
];

const DEFAULT_SUPPORT_LINKS = [
  { label: "Contact Us", href: "/contact" },
  { label: "FAQs", href: "/faq" },
  { label: "Shipping Info", href: "/shipping" },
  { label: "Returns", href: "/returns" },
  { label: "Track Order", href: "/track" },
  { label: "Warranty", href: "/warranty" },
];

const DEFAULT_COMPANY_LINKS = [
  { label: "About Us", href: "/about" },
  { label: "Careers", href: "/careers" },
  { label: "Press", href: "/press" },
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Service", href: "/terms" },
];

const SOCIAL_LINKS = [
  {
    name: "Facebook",
    href: "https://facebook.com",
    icon: "/facebook.svg",
  },
  {
    name: "Instagram",
    href: "https://instagram.com",
    icon: "/instagram.svg",
  },
  {
    name: "LinkedIn",
    href: "https://linkedin.com",
    icon: "/icons/linkedin.svg",
  },
];

const PAYMENT_METHODS = [
  { name: "Visa", icon: "/payments/visa.svg" },
  { name: "Mastercard", icon: "/payments/mastercard.svg" },
  { name: "American Express", icon: "/payments/amex.svg" },
  { name: "PayPal", icon: "/payments/paypal.svg" },
];

export default function Footer({
  shopLinks = DEFAULT_SHOP_LINKS,
  supportLinks = DEFAULT_SUPPORT_LINKS,
  companyLinks = DEFAULT_COMPANY_LINKS,
  showPayments = true,
  showNewsletter = true,
  copyrightYear = new Date().getFullYear(),
  companyName = "KBSK Trading",
}: FooterProps) {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubscribed(true);
    setEmail("");
    setTimeout(() => setSubscribed(false), 3000);
  };

  return (
    <footer className="bg-dark-900 text-light-100">
      <div className="mx-auto w-[90%] px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-4">
            <Link
              href="/"
              className="inline-block rounded-lg bg-white p-2 focus:outline-none focus:ring-2 focus:ring-light-100 focus:ring-offset-2 focus:ring-offset-dark-900"
              aria-label={`${companyName} Home`}
            >
              <Image
                src="/logo-kbsk.svg"
                alt={companyName}
                width={140}
                height={70}
                className="h-14 w-auto"
              />
            </Link>
            <p className="mt-4 text-body text-light-400 max-w-xs">
              Your trusted partner for professional tools,
              equipment, and PPE since 20026. Quality you can
              count on.
            </p>
            <div className="mt-6 flex items-center gap-4">
              {SOCIAL_LINKS.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-light-400 bg-opacity-10 transition-colors hover:bg-opacity-20 focus:outline-none focus:ring-2 focus:ring-light-100 focus:ring-offset-2 focus:ring-offset-dark-900"
                  aria-label={`Visit our ${social.name}`}
                >
                  <Image
                    src={social.icon}
                    alt=""
                    width={20}
                    height={20}
                    className="h-5 w-5 brightness-0 invert"
                  />
                </a>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-8">
            <nav aria-labelledby="footer-shop-heading">
              <h3
                id="footer-shop-heading"
                className="text-heading-3 mb-4 font-medium"
              >
                Shop
              </h3>
              <ul className="space-y-3">
                {shopLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-body text-light-400 transition-colors hover:text-light-100 focus:outline-none focus:underline focus:decoration-light-100 focus:decoration-2 focus:underline-offset-4"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <nav aria-labelledby="footer-support-heading">
              <h3
                id="footer-support-heading"
                className="text-heading-3 mb-4 font-medium"
              >
                Support
              </h3>
              <ul className="space-y-3">
                {supportLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-body text-light-400 transition-colors hover:text-light-100 focus:outline-none focus:underline focus:decoration-light-100 focus:decoration-2 focus:underline-offset-4"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <nav
              aria-labelledby="footer-company-heading"
              className="col-span-2 sm:col-span-1"
            >
              <h3
                id="footer-company-heading"
                className="text-heading-3 mb-4 font-medium"
              >
                Company
              </h3>
              <ul className="space-y-3">
                {companyLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-body text-light-400 transition-colors hover:text-light-100 focus:outline-none focus:underline focus:decoration-light-100 focus:decoration-2 focus:underline-offset-4"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>

        {showNewsletter && (
          <div className="mt-12 border-t border-light-400 border-opacity-20 pt-8">
            <div className="max-w-md">
              <h3 className="text-heading-3 mb-2 font-medium">
                Stay Updated
              </h3>
              <p className="mb-4 text-body text-light-400">
                Subscribe to get special offers, new product
                alerts, and industry tips.
              </p>
              <form
                onSubmit={handleNewsletterSubmit}
                className="flex gap-2"
              >
                <label htmlFor="email-subscribe" className="sr-only">
                  Email address
                </label>
                <input
                  type="email"
                  id="email-subscribe"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="flex-1 rounded-md border border-light-400 border-opacity-30 bg-light-400 bg-opacity-10 px-4 py-2 text-body text-light-100 placeholder:text-light-400 focus:border-[--color-primary] focus:outline-none focus:ring-2 focus:ring-[--color-primary] focus:ring-offset-2 focus:ring-offset-dark-900"
                />
                <button
                  type="submit"
                  className="rounded-md bg-[--color-cta] px-6 py-2 text-body-medium font-medium text-light-100 transition-colors hover:bg-[--color-cta-dark] focus:outline-none focus:ring-2 focus:ring-[--color-cta] focus:ring-offset-2 focus:ring-offset-dark-900"
                >
                  {subscribed ? "Subscribed!" : "Subscribe"}
                </button>
              </form>
            </div>
          </div>
        )}

        <div className="mt-12 border-t border-light-400 border-opacity-20 pt-8">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <p className="text-caption text-light-400">
              © {copyrightYear} {companyName}. All rights
              reserved.
            </p>
            {showPayments && (
              <div
                className="flex items-center gap-3"
                aria-label="Accepted payment methods"
              >
                {PAYMENT_METHODS.map((method) => (
                  <div
                    key={method.name}
                    className="flex h-8 items-center"
                    title={method.name}
                  >
                    <Image
                      src={method.icon}
                      alt={method.name}
                      width={48}
                      height={32}
                      className="h-8 w-auto"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
