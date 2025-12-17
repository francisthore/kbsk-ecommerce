"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";

export interface MegaMenuColumn {
  title: string;
  links: { label: string; href: string }[];
}

export interface MegaMenuProps {
  isOpen: boolean;
  onClose: () => void;
  columns: MegaMenuColumn[];
  promoImage?: string;
  promoTitle?: string;
  promoHref?: string;
}

export default function MegaMenu({
  isOpen,
  onClose,
  columns,
  promoImage,
  promoTitle,
  promoHref,
}: MegaMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={menuRef}
      className="absolute left-0 right-0 top-full z-50 border-t border-light-300 bg-white shadow-lg"
      role="menu"
      aria-label="Product categories"
      onMouseLeave={onClose}
    >
      <div className="mx-auto w-[90%] px-4 py-8 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-3 lg:grid-cols-4">
          {columns.map((column, idx) => (
            <div key={idx}>
              <h3 className="mb-4 text-body-medium font-semibold text-dark-900">
                {column.title}
              </h3>
              <ul className="space-y-2">
                {column.links.map((link, linkIdx) => (
                  <li key={linkIdx}>
                    <Link
                      href={link.href}
                      className="block text-body text-dark-700 transition-colors hover:text-[var(--color-primary)] focus:outline-none focus:text-[var(--color-primary)]"
                      role="menuitem"
                      onClick={onClose}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {promoImage && promoTitle && promoHref && (
            <div className="hidden lg:block">
              <Link
                href={promoHref}
                className="group block overflow-hidden rounded-lg border border-light-300 transition-shadow hover:shadow-md"
                onClick={onClose}
              >
                <div className="relative aspect-square">
                  <Image
                    src={promoImage}
                    alt={promoTitle}
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                  />
                </div>
                <div className="bg-light-200 p-3">
                  <p className="text-body-medium font-medium text-dark-900">
                    {promoTitle}
                  </p>
                </div>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
