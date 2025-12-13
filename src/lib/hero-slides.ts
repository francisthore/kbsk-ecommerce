import { HeroSlide } from "@/components/hero/HeroSlider";

/**
 * Hero slider configuration
 * 
 * Images are stored in public/hero/ with embedded titles/headlines.
 * The component renders only the image and overlays a CTA button.
 */
export const heroSlides: HeroSlide[] = [
  {
    id: "drill-01",
    imageSrc: "/hero/drill-01.png",
    imageAlt: "Premium Cordless Drill Kit - Professional Power Tools",
    ctaLabel: "View Product",
    ctaHref: "/products/1", // Link to actual drill product
    ctaPosition: "bottom-center",
  },
  {
    id: "grinder-01",
    imageSrc: "/hero/grinder-01.png",
    imageAlt: "Professional Angle Grinder - Precision Cutting & Grinding",
    ctaLabel: "View Product",
    ctaHref: "/products/3", // Link to actual grinder product
    ctaPosition: "bottom-center",
  },
];
