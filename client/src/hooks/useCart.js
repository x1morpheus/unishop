import { useContext } from "react";
import { CartContext } from "@/context/CartContext";

/**
 * Returns cart state and actions.
 *
 * @returns {{
 *   items: Array,
 *   subtotal: number,
 *   itemCount: number,
 *   addItem: (item: object) => void,
 *   updateQty: (id: string, qty: number, variant?: string) => void,
 *   removeItem: (id: string, variant?: string) => void,
 *   clearCart: () => void,
 *   mergeCart: (serverItems: Array) => void,
 * }}
 */
export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}
