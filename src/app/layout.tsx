import type { Metadata } from "next";
import { Jost } from "next/font/google";
import "./globals.css";
import { Navbar, Footer } from "@/components";
import CartDrawer from "@/components/cart/CartDrawer";
import { Toaster } from "sonner";

const jost = Jost({
  variable: "--font-jost",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "KBSK Trading - Your Reliable Shop for Tools & PPE",
  description:
    "High-quality power tools, hand tools, and personal protective equipment for professionals and DIY enthusiasts.",
};

export default function RootShell({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${jost.className} antialiased flex min-h-screen flex-col`}>
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
        <CartDrawer />
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
