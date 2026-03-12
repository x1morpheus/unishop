import { createContext, useReducer, useEffect, useCallback, useMemo } from "react";
import PropTypes from "prop-types";

const STORAGE_KEY = "unishop_cart";

/* ── Helpers ───────────────────────────────────────────────────────────────── */
const loadFromStorage = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveToStorage = (items) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // Storage quota exceeded — fail silently
  }
};

const itemKey = (id, variant = "") => `${id}__${variant}`;

/* ── Reducer ───────────────────────────────────────────────────────────────── */
const cartReducer = (state, action) => {
  switch (action.type) {
    case "ADD": {
      const { item } = action.payload;
      const key = itemKey(item._id, item.variant);
      const existing = state.find((i) => itemKey(i._id, i.variant) === key);

      if (existing) {
        return state.map((i) =>
          itemKey(i._id, i.variant) === key ? { ...i, qty: i.qty + item.qty } : i
        );
      }
      return [...state, { ...item, qty: item.qty || 1 }];
    }

    case "UPDATE_QTY": {
      const { id, qty, variant } = action.payload;
      if (qty <= 0) {
        return state.filter((i) => itemKey(i._id, i.variant) !== itemKey(id, variant));
      }
      return state.map((i) =>
        itemKey(i._id, i.variant) === itemKey(id, variant) ? { ...i, qty } : i
      );
    }

    case "REMOVE":
      return state.filter(
        (i) => itemKey(i._id, i.variant) !== itemKey(action.payload.id, action.payload.variant)
      );

    case "CLEAR":
      return [];

    case "MERGE": {
      // Called on login: merge local cart with any server-side saved cart
      const serverItems = action.payload.items;
      const merged = [...state];
      serverItems.forEach((serverItem) => {
        const key = itemKey(serverItem._id, serverItem.variant);
        const exists = merged.find((i) => itemKey(i._id, i.variant) === key);
        if (!exists) merged.push(serverItem);
      });
      return merged;
    }

    default:
      return state;
  }
};

/* ── Context ───────────────────────────────────────────────────────────────── */
export const CartContext = createContext(null);

/**
 * @param {{ children: React.ReactNode }} props
 */
export function CartProvider({ children }) {
  const [items, dispatch] = useReducer(cartReducer, [], loadFromStorage);

  // Persist to localStorage on every change
  useEffect(() => {
    saveToStorage(items);
  }, [items]);

  /* ── Actions ─────────────────────────────────────────────────────────────── */
  const addItem = useCallback((item) => {
    dispatch({ type: "ADD", payload: { item } });
  }, []);

  const updateQty = useCallback((id, qty, variant = "") => {
    dispatch({ type: "UPDATE_QTY", payload: { id, qty, variant } });
  }, []);

  const removeItem = useCallback((id, variant = "") => {
    dispatch({ type: "REMOVE", payload: { id, variant } });
  }, []);

  const clearCart = useCallback(() => {
    dispatch({ type: "CLEAR" });
  }, []);

  const mergeCart = useCallback((serverItems = []) => {
    dispatch({ type: "MERGE", payload: { items: serverItems } });
  }, []);

  /* ── Derived values ──────────────────────────────────────────────────────── */
  const subtotal  = useMemo(() => items.reduce((s, i) => s + i.price * i.qty, 0), [items]);
  const itemCount = useMemo(() => items.reduce((s, i) => s + i.qty, 0),          [items]);

  const value = useMemo(
    () => ({ items, subtotal, itemCount, addItem, updateQty, removeItem, clearCart, mergeCart }),
    [items, subtotal, itemCount, addItem, updateQty, removeItem, clearCart, mergeCart]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

CartProvider.propTypes = { children: PropTypes.node.isRequired };
