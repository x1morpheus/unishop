import { useContext } from "react";
import { WishlistContext } from "@/context/WishlistContext";

/**
 * Returns wishlist state and actions.
 *
 * @returns {{
 *   ids: string[],
 *   count: number,
 *   toggle: (productId: string) => void,
 *   isWishlisted: (productId: string) => boolean,
 *   clear: () => void,
 * }}
 */
export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within a WishlistProvider");
  return ctx;
}
