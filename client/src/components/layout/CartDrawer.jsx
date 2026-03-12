import { Link, useNavigate } from "react-router-dom";
import { Trash2, Plus, Minus, ShoppingBag } from "lucide-react";
import PropTypes from "prop-types";
import { Drawer } from "@/components/ui/Drawer";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { useCart } from "@/hooks/useCart";
import { formatCurrency } from "@/utils/formatCurrency";

/**
 * @param {{ isOpen: boolean, onClose: () => void }} props
 */
export function CartDrawer({ isOpen, onClose }) {
  const { items, subtotal, updateQty, removeItem, clearCart } = useCart();
  const navigate = useNavigate();

  const handleCheckout = () => {
    onClose();
    navigate("/checkout");
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={`Your Cart (${items.length})`}
      size="md"
      footer={
        items.length > 0 ? (
          <div className="w-full space-y-3">
            <div className="flex justify-between text-sm font-medium text-[var(--color-text-muted)]">
              <span>Subtotal</span>
              <span className="text-[var(--color-text)] font-semibold text-base">
                {formatCurrency(subtotal)}
              </span>
            </div>
            <p className="text-xs text-[var(--color-text-muted)]">
              Shipping and taxes calculated at checkout
            </p>
            <Button fullWidth onClick={handleCheckout}>
              Proceed to Checkout
            </Button>
            <Button fullWidth variant="ghost" size="sm" onClick={clearCart}>
              Clear cart
            </Button>
          </div>
        ) : null
      }
    >
      {items.length === 0 ? (
        <div className="h-full flex items-center justify-center">
          <EmptyState
            icon={<ShoppingBag size={28} strokeWidth={1.5} />}
            title="Your cart is empty"
            description="Add some products to get started."
            action={{ label: "Browse Products", onClick: () => { onClose(); navigate("/products"); } }}
          />
        </div>
      ) : (
        <ul className="divide-y divide-[var(--color-border)]">
          {items.map((item) => (
            <li key={`${item._id}-${item.variant}`} className="flex gap-4 px-5 py-4">
              {/* Product image */}
              <Link
                to={`/products/${item.slug}`}
                onClick={onClose}
                className="shrink-0 h-20 w-20 rounded-xl overflow-hidden bg-[var(--color-background)]"
              >
                <img
                  src={item.image || "/placeholder.png"}
                  alt={item.name}
                  className="h-full w-full object-cover hover:scale-105 transition-transform duration-200"
                />
              </Link>

              {/* Details */}
              <div className="flex-1 min-w-0 space-y-1.5">
                <Link
                  to={`/products/${item.slug}`}
                  onClick={onClose}
                  className="text-sm font-medium text-[var(--color-text)] line-clamp-2 hover:text-[var(--color-primary)] transition-colors"
                >
                  {item.name}
                </Link>
                {item.variant && (
                  <p className="text-xs text-[var(--color-text-muted)]">{item.variant}</p>
                )}
                <p className="text-sm font-semibold text-[var(--color-primary)]">
                  {formatCurrency(item.price)}
                </p>

                {/* Qty controls */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center border border-[var(--color-border)] rounded-lg overflow-hidden">
                    <button
                      onClick={() => updateQty(item._id, item.qty - 1, item.variant)}
                      disabled={item.qty <= 1}
                      className="px-2 py-1 hover:bg-[var(--color-background)] transition-colors disabled:opacity-40 text-[var(--color-text-muted)]"
                      aria-label="Decrease quantity"
                    >
                      <Minus size={13} />
                    </button>
                    <span className="px-3 text-sm font-medium text-[var(--color-text)] select-none">
                      {item.qty}
                    </span>
                    <button
                      onClick={() => updateQty(item._id, item.qty + 1, item.variant)}
                      className="px-2 py-1 hover:bg-[var(--color-background)] transition-colors text-[var(--color-text-muted)]"
                      aria-label="Increase quantity"
                    >
                      <Plus size={13} />
                    </button>
                  </div>

                  <button
                    onClick={() => removeItem(item._id, item.variant)}
                    className="p-1 text-[var(--color-text-muted)] hover:text-[var(--color-error)] transition-colors"
                    aria-label="Remove item"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Drawer>
  );
}

CartDrawer.propTypes = {
  isOpen:  PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};
