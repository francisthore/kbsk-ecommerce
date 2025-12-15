export const productsConfig = {
  // Products per page (easily adjustable)
  PRODUCTS_PER_PAGE: 16,
  
  // Grid columns per breakpoint
  GRID_COLS: {
    mobile: 1,
    tablet: 2,
    desktop: 3,
    wide: 4,
  },
  
  // Default sort
  DEFAULT_SORT: "newest" as const,
  
  // Enable features
  FEATURES: {
    filters: true,
    sorting: true,
    pagination: true,
    search: true,
  },
};
