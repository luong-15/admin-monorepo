import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product, CartItem } from "@/lib/types";

interface CartState {
  cartItems: CartItem[];
  isOpen: boolean;
  isSyncing: boolean;
  lastSynced: number;
  // internal only: prevent merge loop
  _lastMergedUserId?: string | null;

  // Actions
  addToCart: (product: Product) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  clearCart: () => void;
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;

  // Server sync
  syncCart: () => Promise<void>;
  hydrateFromServer: () => Promise<void>;
  mergeLocalCartToServer: () => Promise<void>;

  // Computed
  getTotalItems: () => number;
  getItemCount: () => number;
  getSubtotal: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      cartItems: [],
      isOpen: false,
      isSyncing: false,
      lastSynced: 0,
      // user merge guard to avoid merging local cart multiple times per login
      _lastMergedUserId: null,



      addToCart: async (product: Product) => {
        set({ isSyncing: true });

        // Optimistic client update
        const items = get().cartItems;
        const existingItem = items.find(
          (item) => item.product.id === product.id,
        );
        if (existingItem) {
          set({
            cartItems: items.map((item) =>
              item.product.id === product.id
                ? { ...item, quantity: item.quantity + 1 }
                : item,
            ),
          });
        } else {
          set({ cartItems: [...items, { product, quantity: 1 }] });
        }
        set({ isOpen: true });

        try {
          await fetch("/api/cart", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ product_id: product.id }),
          });
        } catch (e) {
          console.warn("Cart sync failed, continuing offline", e);
        } finally {
          set({ isSyncing: false, lastSynced: Date.now() });
        }
      },

      removeItem: async (productId: string) => {
        set({ isSyncing: true });
        const items = get().cartItems.filter(
          (item) => item.product.id !== productId,
        );
        set({ cartItems: items });

        try {
          await fetch(`/api/cart?product_id=${productId}`, {
            method: "DELETE",
          });
        } catch (e) {
          console.warn("Remove sync failed");
        } finally {
          set({ isSyncing: false, lastSynced: Date.now() });
        }
      },

      updateQuantity: async (productId: string, quantity: number) => {
        if (quantity <= 0) {
          await get().removeItem(productId);
          return;
        }

        set({ isSyncing: true });
        set({
          cartItems: get().cartItems.map((item) =>
            item.product.id === productId ? { ...item, quantity } : item,
          ),
        });

        try {
          await fetch("/api/cart", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ product_id: productId, quantity }),
          });
        } catch (e) {
          console.warn("Update sync failed");
        } finally {
          set({ isSyncing: false, lastSynced: Date.now() });
        }
      },

      clearCart: () => set({ cartItems: [] }),

      toggleCart: () => set({ isOpen: !get().isOpen }),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),

      syncCart: async () => {
        set({ isSyncing: true });
        try {
          const res = await fetch("/api/cart");
          if (res.ok) {
            const { data } = await res.json();
            // reset merge guard to allow re-merge only after a different user login; for now we keep it as-is.

            const cartItems = data.map(
              (row: any) =>
                ({
                  product: {
                    id: row.products.id,
                    name: row.products.name,
                    slug: row.products.slug,
                    price: row.products.price,
                    image_url: row.products.image_url,
                    brand: row.products.brand,
                    stock: row.products.stock,
                    original_price: row.products.original_price || undefined,
                  } as Product,
                  quantity: row.quantity,
                }) as CartItem,
            );
            set({ cartItems });
          }
        } catch (e) {
          console.warn("Sync failed");
        } finally {
          set({ isSyncing: false, lastSynced: Date.now() });
        }
      },

      mergeLocalCartToServer: async () => {
        const userMergedGuard = get()._lastMergedUserId;
        if (userMergedGuard) return;


        // Merge by upserting each local item (API will create/update cart_items for this user)
        const items = get().cartItems;
        if (items.length === 0) {
          // Still update guard to prevent repeated calls
          set({ _lastMergedUserId: "empty" });
          return;
        }

        try {
          // Sequential to keep behavior predictable
          for (const item of items) {
            await fetch("/api/cart", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ product_id: item.product.id, quantity: item.quantity }),
            });
          }
        } catch (e) {
          console.warn("mergeLocalCartToServer failed", e);
        }

        // After merge attempt, we will set guard to avoid infinite merge attempts.
        set({ _lastMergedUserId: "merged" });
      },


      hydrateFromServer: async () => {
        await get().syncCart();
      },


      getTotalItems: () =>
        get().cartItems.reduce((sum, item) => sum + item.quantity, 0),
      getItemCount: () => get().cartItems.length,

      getSubtotal: () =>
        get().cartItems.reduce(
          (sum, item) => sum + item.product.price * item.quantity,
          0,
        ),
    }),
    {
      name: "technova-cart",
    },
  ),
);
