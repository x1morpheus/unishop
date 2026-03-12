import { createContext, useState, useCallback, useMemo, useEffect, useContext } from "react";
import PropTypes from "prop-types";
import { userService } from "@/services/user.service";
import { AuthContext } from "@/context/AuthContext";

const STORAGE_KEY = "unishop_wishlist";

const load = () => {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); }
  catch { return []; }
};

export const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
  const auth = useContext(AuthContext);
  const isAuthenticated = auth?.isAuthenticated;

  const [ids, setIds] = useState(load);

  // Persist to localStorage
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(ids)); }
    catch { /* quota exceeded */ }
  }, [ids]);

  // When user logs in, sync wishlist from server (merge with local)
  useEffect(() => {
    if (!isAuthenticated) return;
    userService.getWishlist().then((res) => {
      const serverIds = (res.data || []).map((p) => p._id);
      setIds((prev) => {
        const merged = Array.from(new Set([...prev, ...serverIds]));
        return merged;
      });
    }).catch(() => {});
  }, [isAuthenticated]);

  const toggle = useCallback((productId) => {
    setIds((prev) => {
      const next = prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId];
      return next;
    });
    // Sync with server if authenticated
    if (isAuthenticated) {
      userService.toggleWishlist(productId).catch(() => {});
    }
  }, [isAuthenticated]);

  const isWishlisted = useCallback((productId) => ids.includes(productId), [ids]);

  const clear = useCallback(() => setIds([]), []);

  const value = useMemo(
    () => ({ ids, toggle, isWishlisted, clear, count: ids.length }),
    [ids, toggle, isWishlisted, clear]
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

WishlistProvider.propTypes = { children: PropTypes.node.isRequired };
