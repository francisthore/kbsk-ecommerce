import { create } from 'zustand';

export interface CartItemData {
  id: string;
  cartItemId: string;
  productId: string;
  productName: string;
  brand: string | null;
  variantId: string;
  sku: string;
  price: string;
  salePrice: string | null;
  quantity: number;
  inStock: number;
  image: string | null;
  colorName: string | null;
  colorHex: string | null;
  sizeName: string | null;
  isSupplierWarehouse?: boolean;
}

export interface CartTotals {
  subtotal: number;
  savings: number;
  total: number;
}

export interface FreeShippingInfo {
  eligible: boolean;
  threshold: number;
  amountRemaining: number;
}

interface CartState {
  // Data
  items: CartItemData[];
  totals: CartTotals;
  itemCount: number;
  freeShipping: FreeShippingInfo;
  
  // Drawer state
  isDrawerOpen: boolean;
  
  // Loading states
  isLoading: boolean;
  
  // Actions
  setCart: (data: {
    items: CartItemData[];
    totals: CartTotals;
    itemCount: number;
    freeShipping: FreeShippingInfo;
  }) => void;
  
  addItem: (item: CartItemData) => void;
  updateItemQuantity: (cartItemId: string, quantity: number) => void;
  removeItem: (cartItemId: string) => void;
  clearCart: () => void;
  
  // Drawer controls
  openDrawer: () => void;
  closeDrawer: () => void;
  toggleDrawer: () => void;
  
  // Loading controls
  setLoading: (loading: boolean) => void;
  
  // Computed
  getItemCount: () => number;
}

const initialTotals: CartTotals = {
  subtotal: 0,
  savings: 0,
  total: 0,
};

const initialFreeShipping: FreeShippingInfo = {
  eligible: false,
  threshold: 1000, // R1000 default threshold
  amountRemaining: 1000,
};

export const useCartStore = create<CartState>((set, get) => ({
  // Initial state
  items: [],
  totals: initialTotals,
  itemCount: 0,
  freeShipping: initialFreeShipping,
  isDrawerOpen: false,
  isLoading: false,
  
  // Set entire cart from server
  setCart: (data) => {
    set({
      items: data.items,
      totals: data.totals,
      itemCount: data.itemCount,
      freeShipping: data.freeShipping,
    });
  },
  
  // Add or update item
  addItem: (item) => {
    const { items } = get();
    const existingIndex = items.findIndex((i) => i.cartItemId === item.cartItemId);
    
    let newItems: CartItemData[];
    if (existingIndex >= 0) {
      // Update existing item
      newItems = [...items];
      newItems[existingIndex] = item;
    } else {
      // Add new item
      newItems = [...items, item];
    }
    
    // Recalculate totals
    let subtotal = 0;
    let savings = 0;
    let itemCount = 0;
    
    newItems.forEach((item) => {
      const price = parseFloat(item.salePrice || item.price);
      const originalPrice = parseFloat(item.price);
      
      subtotal += price * item.quantity;
      
      if (item.salePrice) {
        savings += (originalPrice - price) * item.quantity;
      }
      
      itemCount += item.quantity;
    });
    
    const total = subtotal;
    const threshold = 1000;
    const eligible = total >= threshold;
    const amountRemaining = eligible ? 0 : threshold - total;
    
    set({
      items: newItems,
      totals: { subtotal, savings, total },
      itemCount,
      freeShipping: { eligible, threshold, amountRemaining },
    });
  },
  
  // Update item quantity (optimistic update)
  updateItemQuantity: (cartItemId, quantity) => {
    const { items } = get();
    const newItems = items.map((item) =>
      item.cartItemId === cartItemId ? { ...item, quantity } : item
    );
    
    // Recalculate totals
    let subtotal = 0;
    let savings = 0;
    let itemCount = 0;
    
    newItems.forEach((item) => {
      const price = parseFloat(item.salePrice || item.price);
      const originalPrice = parseFloat(item.price);
      
      subtotal += price * item.quantity;
      
      if (item.salePrice) {
        savings += (originalPrice - price) * item.quantity;
      }
      
      itemCount += item.quantity;
    });
    
    const total = subtotal;
    const threshold = 1000;
    const eligible = total >= threshold;
    const amountRemaining = eligible ? 0 : threshold - total;
    
    set({
      items: newItems,
      totals: { subtotal, savings, total },
      itemCount,
      freeShipping: { eligible, threshold, amountRemaining },
    });
  },
  
  // Remove item (optimistic update)
  removeItem: (cartItemId) => {
    const { items } = get();
    const newItems = items.filter((item) => item.cartItemId !== cartItemId);
    
    // Recalculate totals
    let subtotal = 0;
    let savings = 0;
    let itemCount = 0;
    
    newItems.forEach((item) => {
      const price = parseFloat(item.salePrice || item.price);
      const originalPrice = parseFloat(item.price);
      
      subtotal += price * item.quantity;
      
      if (item.salePrice) {
        savings += (originalPrice - price) * item.quantity;
      }
      
      itemCount += item.quantity;
    });
    
    const total = subtotal;
    const threshold = 1000;
    const eligible = total >= threshold;
    const amountRemaining = eligible ? 0 : threshold - total;
    
    set({
      items: newItems,
      totals: { subtotal, savings, total },
      itemCount,
      freeShipping: { eligible, threshold, amountRemaining },
    });
  },
  
  // Clear entire cart
  clearCart: () => {
    set({
      items: [],
      totals: initialTotals,
      itemCount: 0,
      freeShipping: initialFreeShipping,
    });
  },
  
  // Drawer controls
  openDrawer: () => set({ isDrawerOpen: true }),
  closeDrawer: () => set({ isDrawerOpen: false }),
  toggleDrawer: () => set((state) => ({ isDrawerOpen: !state.isDrawerOpen })),
  
  // Loading controls
  setLoading: (loading) => set({ isLoading: loading }),
  
  // Get item count
  getItemCount: () => {
    return get().itemCount;
  },
}));
