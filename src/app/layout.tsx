import type { Metadata } from "next";
import { Jost } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import RootLayoutClient from "./RootLayoutClient";

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
        <RootLayoutClient>{children}</RootLayoutClient>
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
