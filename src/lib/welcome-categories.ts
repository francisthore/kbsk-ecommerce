import type { CategoryCard } from "@/types/welcome-section";

export const categories: CategoryCard[] = [
  {
    key: "power-tools",
    title: "Power Tools",
    href: "/category/power-tools",
    variant: "list",
    items: [
      { label: "Drills & Drivers", href: "/category/power-tools/drills" },
      { label: "Saws & Cutting", href: "/category/power-tools/saws" },
      { label: "Sanders & Grinders", href: "/category/power-tools/sanders" },
      { label: "Impact Wrenches", href: "/category/power-tools/impact-wrenches" },
      { label: "Rotary Hammers", href: "/category/power-tools/rotary-hammers" },
    ],
  },
  {
    key: "power-tools-hero",
    title: "Power Tools",
    href: "/category/power-tools",
    variant: "hero-tall",
    imageSrc: "/categories/drill-hero.jpg",
    imageAlt: "Professional power drill",
  },
  {
    key: "hand-tools",
    title: "Hand Tools",
    href: "/category/hand-tools",
    variant: "tile",
    imageSrc: "/categories/hand-tools.jpg",
    imageAlt: "Hand tools collection",
  },
  {
    key: "accessories",
    title: "Accessories",
    href: "/category/accessories",
    variant: "tile",
    imageSrc: "/categories/accessories.jpg",
    imageAlt: "Tool accessories and parts",
  },
  {
    key: "safety-ppe",
    title: "Safety & PPE",
    href: "/category/safety-ppe",
    variant: "tile",
    imageSrc: "/categories/safety-gloves.jpg",
    imageAlt: "Safety gloves and protective equipment",
  },
];
