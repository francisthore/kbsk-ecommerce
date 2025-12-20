"use client";

import { usePathname } from "next/navigation";
import { Navbar, Footer } from "@/components";
import CartDrawer from "@/components/cart/CartDrawer";

export default function RootLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  
  // Don't render main Navbar/Footer for admin routes
  const isAdminRoute = pathname?.startsWith("/admin");

  if (isAdminRoute) {
    return <>{children}</>;
  }

  return (
    <>
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <CartDrawer />
    </>
  );
}
