export type CategoryVariant = "list" | "tile" | "hero-tall";

export interface CategoryItem {
  label: string;
  href: string;
}

export interface CategoryCard {
  key: string;
  title: string;
  href: string;
  variant: CategoryVariant;
  imageSrc?: string;
  imageAlt?: string;
  items?: CategoryItem[];
}

export interface BrandLogo {
  name: string;
  slug: string;
  logoBwSrc: string;
  logoColorSrc: string;
  alt?: string;
}
