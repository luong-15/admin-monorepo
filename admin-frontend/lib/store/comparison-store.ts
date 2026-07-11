import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product } from "@/lib/types";

interface ComparisonState {
  products: Product[];
  isOpen: boolean;

  // Actions
  addProduct: (product: Product) => void;
  removeProduct: (productId: string) => void;
  clearComparison: () => void;
  toggleComparison: () => void;
  openComparison: () => void;
  closeComparison: () => void;

  // Computed
  getProductCount: () => number;
  isProductInComparison: (productId: string) => boolean;
  canAddProduct: (product: Product) => boolean;
}

export const useComparisonStore = create<ComparisonState>()(
  persist(
    (set, get) => ({
      products: [],
      isOpen: false,

      addProduct: (product) => {
        const products = get().products;
        const isAlreadyAdded = products.some((p) => p.id === product.id);

        if (!isAlreadyAdded && products.length < 4) {
          set({ products: [...products, product] });
          set({ isOpen: true });
        }
      },

      removeProduct: (productId) => {
        set({ products: get().products.filter((p) => p.id !== productId) });
      },

      clearComparison: () => set({ products: [] }),
      toggleComparison: () => set({ isOpen: !get().isOpen }),
      openComparison: () => set({ isOpen: true }),
      closeComparison: () => set({ isOpen: false }),

      getProductCount: () => get().products.length,

      isProductInComparison: (productId) => {
        return get().products.some((p) => p.id === productId);
      },

      canAddProduct: (product) => {
        const products = get().products;
        return (
          !products.some((p) => p.id === product.id) && products.length < 4
        );
      },
    }),
    {
      name: "technova-comparison",
    },
  ),
);
