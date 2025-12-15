"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import MegaMenu, { MegaMenuColumn } from "./nav/MegaMenu";
import AccountPanel from "./nav/AccountPanel";
import { useCartStore } from "@/store/cart";
import { getCart, addToCart } from "@/lib/actions/cart";

export interface NavbarProps {
  onSearch?: (query: string) => void;
  accountOpenDefault?: boolean;
  isSignedIn?: boolean;
  userName?: string;
}

type MegaMenuType = "power-tools" | "hand-tools" | "accessories" | "ppe" | null;

// Mega menu data
const MEGA_MENUS: Record<
  Exclude<MegaMenuType, null>,
  { columns: MegaMenuColumn[]; promo?: { image: string; title: string; href: string } }
> = {
  "power-tools": {
    columns: [
      {
        title: "Drills & Drivers",
        links: [
          { label: "Cordless Drills", href: "/category/cordless-drills" },
          { label: "Impact Drivers", href: "/category/impact-drivers" },
          { label: "Hammer Drills", href: "/category/hammer-drills" },
          { label: "Drill Bits", href: "/category/drill-bits" },
        ],
      },
      {
        title: "Saws & Cutting",
        links: [
          { label: "Circular Saws", href: "/category/circular-saws" },
          { label: "Jigsaws", href: "/category/jigsaws" },
          { label: "Reciprocating Saws", href: "/category/reciprocating-saws" },
          { label: "Miter Saws", href: "/category/miter-saws" },
        ],
      },
      {
        title: "Grinders & Sanders",
        links: [
          { label: "Angle Grinders", href: "/category/angle-grinders" },
          { label: "Orbital Sanders", href: "/category/orbital-sanders" },
          { label: "Belt Sanders", href: "/category/belt-sanders" },
          { label: "Polishers", href: "/category/polishers" },
        ],
      },
      {
        title: "Batteries & Power",
        links: [
          { label: "20V Batteries", href: "/category/20v-batteries" },
          { label: "Chargers", href: "/category/chargers" },
          { label: "Combo Kits", href: "/category/combo-kits" },
          { label: "Generators", href: "/category/generators" },
        ],
      },
    ],
  },
  "hand-tools": {
    columns: [
      {
        title: "Wrenches & Sockets",
        links: [
          { label: "Combination Wrenches", href: "/category/combination-wrenches" },
          { label: "Socket Sets", href: "/category/socket-sets" },
          { label: "Adjustable Wrenches", href: "/category/adjustable-wrenches" },
          { label: "Torque Wrenches", href: "/category/torque-wrenches" },
        ],
      },
      {
        title: "Screwdrivers & Pliers",
        links: [
          { label: "Screwdriver Sets", href: "/category/screwdriver-sets" },
          { label: "Pliers", href: "/category/pliers" },
          { label: "Wire Strippers", href: "/category/wire-strippers" },
          { label: "Nut Drivers", href: "/category/nut-drivers" },
        ],
      },
      {
        title: "Hammers & Striking",
        links: [
          { label: "Claw Hammers", href: "/category/claw-hammers" },
          { label: "Sledge Hammers", href: "/category/sledge-hammers" },
          { label: "Mallets", href: "/category/mallets" },
          { label: "Pry Bars", href: "/category/pry-bars" },
        ],
      },
      {
        title: "Measuring Tools",
        links: [
          { label: "Tape Measures", href: "/category/tape-measures" },
          { label: "Levels", href: "/category/levels" },
          { label: "Squares", href: "/category/squares" },
          { label: "Calipers", href: "/category/calipers" },
        ],
      },
    ],
  },
  accessories: {
    columns: [
      {
        title: "Bits & Blades",
        links: [
          { label: "Drill Bits", href: "/category/drill-bits" },
          { label: "Saw Blades", href: "/category/saw-blades" },
          { label: "Sanding Discs", href: "/category/sanding-discs" },
          { label: "Cutting Wheels", href: "/category/cutting-wheels" },
        ],
      },
      {
        title: "Abrasives",
        links: [
          { label: "Sandpaper", href: "/category/sandpaper" },
          { label: "Grinding Wheels", href: "/category/grinding-wheels" },
          { label: "Polishing Pads", href: "/category/polishing-pads" },
          { label: "Wire Brushes", href: "/category/wire-brushes" },
        ],
      },
      {
        title: "Fasteners",
        links: [
          { label: "Screws", href: "/category/screws" },
          { label: "Bolts & Nuts", href: "/category/bolts-nuts" },
          { label: "Anchors", href: "/category/anchors" },
          { label: "Nails", href: "/category/nails" },
        ],
      },
      {
        title: "Storage",
        links: [
          { label: "Tool Boxes", href: "/category/tool-boxes" },
          { label: "Tool Bags", href: "/category/tool-bags" },
          { label: "Organizers", href: "/category/organizers" },
          { label: "Cabinets", href: "/category/cabinets" },
        ],
      },
    ],
  },
  ppe: {
    columns: [
      {
        title: "Head Protection",
        links: [
          { label: "Hard Hats", href: "/category/hard-hats" },
          { label: "Bump Caps", href: "/category/bump-caps" },
          { label: "Face Shields", href: "/category/face-shields" },
          { label: "Welding Helmets", href: "/category/welding-helmets" },
        ],
      },
      {
        title: "Eye & Hearing",
        links: [
          { label: "Safety Glasses", href: "/category/safety-glasses" },
          { label: "Goggles", href: "/category/goggles" },
          { label: "Ear Plugs", href: "/category/ear-plugs" },
          { label: "Ear Muffs", href: "/category/ear-muffs" },
        ],
      },
      {
        title: "Hand & Foot",
        links: [
          { label: "Work Gloves", href: "/category/work-gloves" },
          { label: "Cut-Resistant Gloves", href: "/category/cut-resistant-gloves" },
          { label: "Safety Boots", href: "/category/safety-boots" },
          { label: "Shoe Covers", href: "/category/shoe-covers" },
        ],
      },
      {
        title: "Body & Respiratory",
        links: [
          { label: "High-Vis Vests", href: "/category/high-vis-vests" },
          { label: "Safety Harnesses", href: "/category/safety-harnesses" },
          { label: "Dust Masks", href: "/category/dust-masks" },
          { label: "Respirators", href: "/category/respirators" },
        ],
      },
    ],
  },
};

export default function Navbar({
  onSearch,
  accountOpenDefault = false,
  isSignedIn = false,
  userName,
}: NavbarProps) {
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const cartCount = useCartStore((state) => state.itemCount);
  const { openDrawer, setCart } = useCartStore();
  const [searchValue, setSearchValue] = useState("");
  const [activeMegaMenu, setActiveMegaMenu] = useState<MegaMenuType>(null);
  const [accountOpen, setAccountOpen] = useState(accountOpenDefault);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Migrate old localStorage cart data and sync
    const syncCart = async () => {
      // Check for old persisted cart data in localStorage
      const oldCartData = localStorage.getItem('cart');
      if (oldCartData) {
        try {
          const parsed = JSON.parse(oldCartData);
          const oldItems = parsed?.state?.items;
          
          if (oldItems && Array.isArray(oldItems) && oldItems.length > 0) {
            console.log('Migrating old cart data from localStorage...');
            
            // Add each old item to the new cart system
            for (const item of oldItems) {
              if (item.id && item.quantity) {
                await addToCart(item.id, item.quantity);
              }
            }
            
            // Clear old localStorage data after migration
            localStorage.removeItem('cart');
            console.log('Migration complete. Old cart data cleared.');
          }
        } catch (error) {
          console.error('Error migrating old cart data:', error);
          // Clear corrupted data
          localStorage.removeItem('cart');
        }
      }
      
      // Fetch and sync cart data from server
      const cartData = await getCart();
      console.log('🛒 Navbar getCart result:', cartData);
      console.log('🛒 Items:', cartData.items);
      console.log('🛒 Item count:', cartData.itemCount);
      setCart(cartData);
    };
    syncCart();
  }, [setCart]);

  const megaMenuTimeout = useRef<NodeJS.Timeout>();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch && searchValue.trim()) {
      onSearch(searchValue);
    }
  };

  const handleCartClick = (e: React.MouseEvent) => {
    e.preventDefault();
    
    // If on cart page, refresh and scroll to top
    if (pathname === "/cart") {
      router.refresh();
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      // Otherwise, open drawer
      openDrawer();
    }
  };

  const handleMegaMenuOpen = (menu: MegaMenuType) => {
    if (megaMenuTimeout.current) {
      clearTimeout(megaMenuTimeout.current);
    }
    setActiveMegaMenu(menu);
  };

  const handleMegaMenuClose = () => {
    megaMenuTimeout.current = setTimeout(() => {
      setActiveMegaMenu(null);
    }, 150);
  };

  const handleMegaMenuMouseEnter = () => {
    if (megaMenuTimeout.current) {
      clearTimeout(megaMenuTimeout.current);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white shadow-sm">
      {/* Top Bar - Dark Green */}
      <div className="bg-[var(--color-primary)] text-white">
        <div className="mx-auto w-[90%] px-4 lg:px-8">
          <div className="flex h-18 items-center justify-between gap-4">
            {/* Logo */}
            <Link
              href="/"
              className="flex-shrink-0 rounded-lg bg-white p-2 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[var(--color-primary)]"
              aria-label="KBSK Trading Home"
            >
              <Image
                src="/logo-kbsk.svg"
                alt="KBSK Trading"
                width={120}
                height={44}
                priority
                className="h-11 w-auto"
              />
            </Link>

            {/* Search - Desktop */}
            <form
              onSubmit={handleSearchSubmit}
              className="hidden flex-1 max-w-2xl lg:block"
            >
              <div className="relative">
                <input
                  type="search"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  placeholder="Search All Products..."
                  className="w-full rounded-full bg-white/95 py-3 pl-6 pr-12 text-[var(--color-text-primary)] placeholder:text-[var(--color-text-secondary)] focus:bg-white focus:outline-none focus:ring-2 focus:ring-white"
                  aria-label="Search products"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-2 text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-gray-medium)] hover:text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                  aria-label="Submit search"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.35-4.35" />
                  </svg>
                </button>
              </div>
            </form>

            {/* Right Actions */}
            <div className="flex items-center gap-3 lg:gap-4">
              {/* View Catalogues - Desktop */}
              <Link
                href="/catalogues"
                className="hidden text-body-medium text-white transition-opacity hover:opacity-80 focus:outline-none focus:underline lg:block"
              >
                View Catalogues
              </Link>

              {/* My Account - Desktop */}
              <button
                onClick={() => setAccountOpen(true)}
                className="hidden items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-body-medium text-white transition-colors hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white lg:flex"
                aria-expanded={accountOpen}
                aria-controls="account-panel"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                <span>My Account</span>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {/* My Account - Mobile Icon */}
              <button
                onClick={() => setAccountOpen(true)}
                className="flex items-center justify-center rounded-full p-2 text-white transition-colors hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white lg:hidden"
                aria-label="My Account"
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
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </button>

              {/* Cart */}
              <button
                onClick={handleCartClick}
                className="relative flex items-center gap-2 text-white transition-opacity hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-white rounded"
                aria-label={pathname === "/cart" ? "Refresh cart" : "Open cart"}
              >
                <div className="relative">
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
                    <circle cx="9" cy="21" r="1" />
                    <circle cx="20" cy="21" r="1" />
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                  </svg>
                  {mounted && cartCount > 0 && (
                    <span
                      className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--color-cta)] text-footnote font-bold text-white"
                      aria-live="polite"
                    >
                      {cartCount > 99 ? "99+" : cartCount}
                    </span>
                  )}
                </div>
                <span className="hidden text-body-medium lg:inline">Cart</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Search - Mobile */}
      <div className="border-b border-[var(--color-gray-dark)] bg-white px-4 py-3 lg:hidden">
        <form onSubmit={handleSearchSubmit}>
          <div className="relative">
            <input
              type="search"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="Search All Products..."
                  className="w-full rounded-full border border-[var(--color-gray-dark)] bg-[var(--color-gray-light)] py-2.5 pl-5 pr-12 text-body text-[var(--color-text-primary)] placeholder:text-[var(--color-text-secondary)] focus:border-[var(--color-primary)] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              aria-label="Search products"
            />
            <button
              type="submit"
              className="absolute right-1 top-1/2 -translate-y-1/2 rounded-full p-2 text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-gray-medium)] hover:text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              aria-label="Submit search"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
            </button>
          </div>
        </form>
      </div>

      {/* Secondary Navigation Bar */}
      <nav
        className="border-b border-light-300 bg-white"
        role="menubar"
        aria-label="Main navigation"
      >
        <div className="mx-auto w-[90%] px-4 lg:px-8">
          <div className="flex items-center gap-1 overflow-x-auto lg:gap-2">
            {/* Power Tools - With Mega Menu */}
            <div
              className="relative"
              onMouseEnter={() => handleMegaMenuOpen("power-tools")}
              onMouseLeave={handleMegaMenuClose}
            >
              <button
                className="flex items-center gap-1 whitespace-nowrap px-4 py-4 text-body-medium text-dark-900 transition-colors hover:text-[--color-primary] focus:outline-none focus:text-[--color-primary]"
                onClick={() =>
                  setActiveMegaMenu(
                    activeMegaMenu === "power-tools" ? null : "power-tools"
                  )
                }
                aria-expanded={activeMegaMenu === "power-tools"}
                aria-haspopup="true"
              >
                <span>Power Tools</span>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={`transition-transform ${
                    activeMegaMenu === "power-tools" ? "rotate-180" : ""
                  }`}
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
            </div>

            {/* Hand Tools - With Mega Menu */}
            <div
              className="relative"
              onMouseEnter={() => handleMegaMenuOpen("hand-tools")}
              onMouseLeave={handleMegaMenuClose}
            >
              <button
                className="flex items-center gap-1 whitespace-nowrap px-4 py-4 text-body-medium text-dark-900 transition-colors hover:text-[--color-primary] focus:outline-none focus:text-[--color-primary]"
                onClick={() =>
                  setActiveMegaMenu(
                    activeMegaMenu === "hand-tools" ? null : "hand-tools"
                  )
                }
                aria-expanded={activeMegaMenu === "hand-tools"}
                aria-haspopup="true"
              >
                <span>Hand Tools</span>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={`transition-transform ${
                    activeMegaMenu === "hand-tools" ? "rotate-180" : ""
                  }`}
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
            </div>

            {/* Accessories - With Mega Menu */}
            <div
              className="relative"
              onMouseEnter={() => handleMegaMenuOpen("accessories")}
              onMouseLeave={handleMegaMenuClose}
            >
              <button
                className="flex items-center gap-1 whitespace-nowrap px-4 py-4 text-body-medium text-dark-900 transition-colors hover:text-[--color-primary] focus:outline-none focus:text-[--color-primary]"
                onClick={() =>
                  setActiveMegaMenu(
                    activeMegaMenu === "accessories" ? null : "accessories"
                  )
                }
                aria-expanded={activeMegaMenu === "accessories"}
                aria-haspopup="true"
              >
                <span>Accessories</span>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={`transition-transform ${
                    activeMegaMenu === "accessories" ? "rotate-180" : ""
                  }`}
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
            </div>

            {/* PPE - With Mega Menu */}
            <div
              className="relative"
              onMouseEnter={() => handleMegaMenuOpen("ppe")}
              onMouseLeave={handleMegaMenuClose}
            >
              <button
                className="flex items-center gap-1 whitespace-nowrap px-4 py-4 text-body-medium text-dark-900 transition-colors hover:text-[--color-primary] focus:outline-none focus:text-[--color-primary]"
                onClick={() =>
                  setActiveMegaMenu(activeMegaMenu === "ppe" ? null : "ppe")
                }
                aria-expanded={activeMegaMenu === "ppe"}
                aria-haspopup="true"
              >
                <span>PPE</span>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={`transition-transform ${
                    activeMegaMenu === "ppe" ? "rotate-180" : ""
                  }`}
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
            </div>

            {/* Regular Links */}
            <Link
              href="/brands"
              className="whitespace-nowrap px-4 py-4 text-body-medium text-dark-900 transition-colors hover:text-[--color-primary] focus:outline-none focus:text-[--color-primary]"
            >
              Brands
            </Link>
            <Link
              href="/about"
              className="whitespace-nowrap px-4 py-4 text-body-medium text-dark-900 transition-colors hover:text-[--color-primary] focus:outline-none focus:text-[--color-primary]"
            >
              About Us
            </Link>
            <Link
              href="/contact"
              className="whitespace-nowrap px-4 py-4 text-body-medium text-dark-900 transition-colors hover:text-[--color-primary] focus:outline-none focus:text-[--color-primary]"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </nav>

      {/* Mega Menus */}
      <div
        className="relative"
        onMouseEnter={handleMegaMenuMouseEnter}
        onMouseLeave={handleMegaMenuClose}
      >
        {activeMegaMenu && (
          <MegaMenu
            isOpen={true}
            onClose={() => setActiveMegaMenu(null)}
            columns={MEGA_MENUS[activeMegaMenu].columns}
            promoImage={MEGA_MENUS[activeMegaMenu].promo?.image}
            promoTitle={MEGA_MENUS[activeMegaMenu].promo?.title}
            promoHref={MEGA_MENUS[activeMegaMenu].promo?.href}
          />
        )}
      </div>

      {/* Account Panel */}
      <AccountPanel
        isOpen={accountOpen}
        onClose={() => setAccountOpen(false)}
        isSignedIn={isSignedIn}
        userName={userName}
      />
    </header>
  );
}
