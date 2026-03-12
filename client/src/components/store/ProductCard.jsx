import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Heart, ShoppingCart, Star, Zap } from "lucide-react";
import { motion } from "framer-motion";
import PropTypes from "prop-types";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useCart } from "@/hooks/useCart";
import { useWishlist } from "@/hooks/useWishlist";
import { formatCurrency } from "@/utils/formatCurrency";
import { cn } from "@/utils/cn";

function useCountdown(endsAt) {
  const calc = () => {
    if (!endsAt) return null;
    const diff = new Date(endsAt) - Date.now();
    if (diff <= 0) return null;
    return {
      h: Math.floor(diff / 3_600_000),
      m: Math.floor((diff % 3_600_000) / 60_000),
      s: Math.floor((diff % 60_000) / 1_000),
    };
  };
  const [time, setTime] = useState(calc);
  useEffect(() => {
    if (!endsAt) return;
    const id = setInterval(() => setTime(calc()), 1_000);
    return () => clearInterval(id);
  }, [endsAt]);
  return time;
}

const BADGE_STYLE = {
  "new":         "bg-blue-500 text-white",
  "best-seller": "bg-amber-500 text-white",
  "limited":     "bg-violet-500 text-white",
  "hot":         "bg-rose-500 text-white",
};
const BADGE_LABEL = {
  "new": "New", "best-seller": "Best Seller", "limited": "Limited", "hot": "🔥 Hot",
};

export function ProductCard({ product, className }) {
  const { addItem } = useCart();
  const { toggle, isWishlisted } = useWishlist();
  const [added, setAdded] = useState(false);

  const fs = product.flashSale;
  const flashActive = fs?.isActive && fs?.salePrice != null && (!fs.endsAt || new Date(fs.endsAt) > Date.now());
  const displayPrice  = flashActive ? fs.salePrice : product.price;
  const originalPrice = flashActive ? product.price : (product.comparePrice > product.price ? product.comparePrice : null);
  const discount      = originalPrice ? Math.round(((originalPrice - displayPrice) / originalPrice) * 100) : null;
  const countdown     = useCountdown(flashActive && fs?.endsAt ? fs.endsAt : null);
  const wishlisted    = isWishlisted(product._id);
  const outOfStock    = product.stock === 0;

  const handleAdd = (e) => {
    e.preventDefault();
    if (outOfStock) return;
    addItem({ _id: product._id, slug: product.slug, name: product.name, price: displayPrice, image: product.images?.[0] || "", qty: 1 });
    setAdded(true);
    setTimeout(() => setAdded(false), 1400);
  };

  return (
    <motion.div
      className={cn("card overflow-hidden group flex flex-col", className)}
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }} whileHover={{ y: -2 }}
    >
      <Link to={`/products/${product.slug}`} className="relative block overflow-hidden aspect-product bg-[var(--color-background)] shrink-0">
        <img src={product.images?.[0] || "/placeholder.png"} alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />

        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5">
          {flashActive && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-rose-600 text-white shadow">
              <Zap size={10} fill="currentColor" /> {fs.label || "Flash Sale"}
            </span>
          )}
          {discount != null && (
            <span className={cn("inline-flex px-2 py-0.5 rounded-full text-xs font-bold", flashActive ? "bg-rose-100 text-rose-700" : "bg-red-100 text-red-700")}>
              {discount}% off
            </span>
          )}
          {product.badge && BADGE_STYLE[product.badge] && !flashActive && (
            <span className={cn("inline-flex px-2 py-0.5 rounded-full text-xs font-bold", BADGE_STYLE[product.badge])}>
              {BADGE_LABEL[product.badge]}
            </span>
          )}
          {outOfStock && <Badge variant="muted">Out of stock</Badge>}
        </div>

        <button onClick={(e) => { e.preventDefault(); toggle(product._id); }}
          className={cn(
            "absolute top-2.5 right-2.5 h-8 w-8 rounded-full flex items-center justify-center transition-all duration-200 shadow-sm",
            "opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0",
            wishlisted ? "bg-[var(--color-secondary)] text-white opacity-100 translate-y-0"
              : "bg-white text-[var(--color-text-muted)] hover:text-[var(--color-secondary)]"
          )} aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}>
          <Heart size={14} fill={wishlisted ? "currentColor" : "none"} />
        </button>
      </Link>

      {flashActive && countdown && (
        <div className="flex items-center justify-between px-3 py-1.5 bg-rose-600 text-white text-xs font-semibold">
          <span className="flex items-center gap-1 opacity-80"><Zap size={10} /> Ends in</span>
          <span className="font-mono tabular-nums">
            {String(countdown.h).padStart(2,"0")}:{String(countdown.m).padStart(2,"0")}:{String(countdown.s).padStart(2,"0")}
          </span>
        </div>
      )}

      <div className="p-4 flex flex-col flex-1 gap-2">
        {product.category?.name && (
          <p className="text-xs font-medium text-[var(--color-primary)] uppercase tracking-wider">{product.category.name}</p>
        )}
        <Link to={`/products/${product.slug}`}>
          <h3 className="text-sm font-semibold text-[var(--color-text)] line-clamp-2 hover:text-[var(--color-primary)] transition-colors leading-snug">{product.name}</h3>
        </Link>
        {product.ratings?.count > 0 && (
          <div className="flex items-center gap-1.5">
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={11}
                  className={i < Math.round(product.ratings.avg) ? "text-amber-400 fill-amber-400" : "text-[var(--color-border)] fill-[var(--color-border)]"} />
              ))}
            </div>
            <span className="text-xs text-[var(--color-text-muted)]">({product.ratings.count})</span>
          </div>
        )}
        <div className="flex items-center justify-between mt-auto pt-1">
          <div className="flex items-baseline gap-1.5">
            <span className={cn("text-base font-bold", flashActive ? "text-rose-600" : "text-[var(--color-text)]")}>
              {formatCurrency(displayPrice)}
            </span>
            {originalPrice && (
              <span className="text-xs text-[var(--color-text-muted)] line-through">{formatCurrency(originalPrice)}</span>
            )}
          </div>
          <Button size="icon" variant={added ? "secondary" : "primary"} disabled={outOfStock}
            onClick={handleAdd} aria-label="Add to cart"
            className={cn("shrink-0 transition-all", added && "scale-110")}>
            <ShoppingCart size={15} />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

ProductCard.propTypes = { product: PropTypes.object.isRequired, className: PropTypes.string };
