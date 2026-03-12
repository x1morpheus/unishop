import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { ShoppingCart, Heart, ChevronRight, Plus, Minus, Truck, ShieldCheck, RotateCcw } from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";
import { Avatar } from "@/components/ui/Avatar";
import { Pagination } from "@/components/ui/Pagination";
import { StarDisplay, StarInput } from "@/components/store/StarRating";
import { ProductCard } from "@/components/store/ProductCard";
import { useCart } from "@/hooks/useCart";
import { useWishlist } from "@/hooks/useWishlist";
import { useAuth } from "@/hooks/useAuth";
import { productService } from "@/services/product.service";
import { reviewSchema } from "@/utils/validators";
import { formatCurrency, formatDiscount } from "@/utils/formatCurrency";
import { formatDate } from "@/utils/formatDate";
import { cn } from "@/utils/cn";

const PERKS = [
  { icon: Truck,       label: "Free shipping over $50" },
  { icon: ShieldCheck, label: "Secure payments" },
  { icon: RotateCcw,   label: "30-day returns" },
];

export default function ProductDetailPage() {
  const { slug }    = useParams();
  const { addItem } = useCart();
  const { toggle, isWishlisted } = useWishlist();
  const { isAuthenticated }      = useAuth();
  const qc = useQueryClient();

  const [activeImg, setActiveImg] = useState(0);
  const [qty, setQty]             = useState(1);
  const [selectedVariant, setSelectedVariant] = useState("");
  const [reviewPage, setReviewPage] = useState(1);
  const [reviewRating, setReviewRating] = useState(5);

  const { data: pd, isLoading } = useQuery({
    queryKey: ["product", slug],
    queryFn:  () => productService.getBySlug(slug),
    select:   d  => d.data,
  });

  const { data: revData } = useQuery({
    queryKey: ["reviews", pd?._id, reviewPage],
    queryFn:  () => productService.getReviews(pd._id, { page: reviewPage, limit: 5 }),
    enabled:  !!pd?._id,
    select:   d => d,
  });

  const { data: relatedData } = useQuery({
    queryKey: ["products", "related", pd?.category?._id],
    queryFn:  () => productService.getProducts({ category: pd.category._id, limit: 4 }),
    enabled:  !!pd?.category?._id,
    select:   d => d.data.filter(p => p._id !== pd._id).slice(0, 4),
  });

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(reviewSchema),
    defaultValues: { rating: 5, comment: "" },
  });

  const reviewMutation = useMutation({
    mutationFn: (body) => productService.createReview(pd._id, body),
    onSuccess:  () => {
      toast.success("Review submitted!");
      qc.invalidateQueries({ queryKey: ["reviews", pd._id] });
      qc.invalidateQueries({ queryKey: ["product", slug] });
      reset(); setReviewRating(5);
    },
    onError: e => toast.error(e.response?.data?.message || "Could not submit review"),
  });

  const onReviewSubmit = (vals) => reviewMutation.mutate({ ...vals, rating: reviewRating });

  if (isLoading) return <div className="flex justify-center py-32"><Spinner size="xl" /></div>;
  if (!pd) return <div className="container-app py-20 text-center text-[var(--color-text-muted)]">Product not found.</div>;

  const images     = pd.images?.length ? pd.images : ["/placeholder.png"];
  const outOfStock = pd.stock === 0;
  const discount   = formatDiscount(pd.comparePrice, pd.price);
  const wishlisted = isWishlisted(pd._id);

  const handleAddToCart = () => {
    addItem({ _id: pd._id, slug: pd.slug, name: pd.name, price: pd.price, image: images[0], qty, variant: selectedVariant });
    toast.success("Added to cart");
  };

  return (
    <div className="container-app py-8 space-y-16">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-[var(--color-text-muted)]">
        <Link to="/" className="hover:text-[var(--color-primary)]">Home</Link>
        <ChevronRight size={13} />
        <Link to="/products" className="hover:text-[var(--color-primary)]">Products</Link>
        {pd.category && (<><ChevronRight size={13} /><Link to={`/products?category=${pd.category._id}`} className="hover:text-[var(--color-primary)]">{pd.category.name}</Link></>)}
        <ChevronRight size={13} />
        <span className="text-[var(--color-text)] truncate max-w-[200px]">{pd.name}</span>
      </nav>

      {/* Main product section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Gallery */}
        <div className="space-y-3">
          <motion.div
            key={activeImg}
            className="aspect-square rounded-2xl overflow-hidden bg-[var(--color-background)]"
            initial={{ opacity: 0.7 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.25 }}
          >
            <img src={images[activeImg]} alt={pd.name} className="w-full h-full object-cover" />
          </motion.div>
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(i)}
                  className={cn("h-16 w-16 rounded-xl overflow-hidden shrink-0 border-2 transition-colors", activeImg === i ? "border-[var(--color-primary)]" : "border-transparent opacity-60 hover:opacity-100")}
                >
                  <img src={img} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="space-y-5">
          {pd.category && <Link to={`/products?category=${pd.category._id}`} className="text-xs font-semibold uppercase tracking-wider text-[var(--color-primary)] hover:underline">{pd.category.name}</Link>}
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--color-text)] leading-snug">{pd.name}</h1>

          {/* Rating */}
          {pd.ratings?.count > 0 && (
            <div className="flex items-center gap-2">
              <StarDisplay value={pd.ratings.avg} size={16} />
              <span className="text-sm text-[var(--color-text-muted)]">{pd.ratings.avg.toFixed(1)} ({pd.ratings.count} reviews)</span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-bold text-[var(--color-text)]">{formatCurrency(pd.price)}</span>
            {pd.comparePrice > pd.price && (
              <span className="text-lg text-[var(--color-text-muted)] line-through">{formatCurrency(pd.comparePrice)}</span>
            )}
            {discount && <Badge variant="error">{discount} off</Badge>}
          </div>

          {/* Description */}
          {pd.description && (
            <p className="text-[var(--color-text-muted)] leading-relaxed text-sm">{pd.description}</p>
          )}

          {/* Variants */}
          {pd.variants?.length > 0 && (
            <div>
              <p className="text-sm font-semibold text-[var(--color-text)] mb-2">Variant</p>
              <div className="flex flex-wrap gap-2">
                {pd.variants.map(v => (
                  <button
                    key={v.value}
                    onClick={() => setSelectedVariant(v.value)}
                    className={cn(
                      "px-3.5 py-1.5 text-sm rounded-lg border transition-colors",
                      selectedVariant === v.value
                        ? "border-[var(--color-primary)] bg-[var(--color-primary-light)] text-[var(--color-primary)] font-semibold"
                        : "border-[var(--color-border)] text-[var(--color-text)] hover:border-[var(--color-primary)]"
                    )}
                  >{v.name}: {v.value}</button>
                ))}
              </div>
            </div>
          )}

          {/* Qty + CTA */}
          <div className="flex items-center gap-3 pt-1">
            <div className="flex items-center border border-[var(--color-border)] rounded-xl overflow-hidden">
              <button onClick={() => setQty(q => Math.max(1, q - 1))} className="px-3 py-2.5 hover:bg-[var(--color-background)] transition-colors text-[var(--color-text-muted)]"><Minus size={15} /></button>
              <span className="px-4 text-sm font-semibold text-[var(--color-text)] select-none min-w-[2.5rem] text-center">{qty}</span>
              <button onClick={() => setQty(q => Math.min(pd.stock, q + 1))} disabled={outOfStock} className="px-3 py-2.5 hover:bg-[var(--color-background)] transition-colors text-[var(--color-text-muted)] disabled:opacity-40"><Plus size={15} /></button>
            </div>

            <Button
              size="lg"
              fullWidth
              disabled={outOfStock}
              onClick={handleAddToCart}
              leftIcon={<ShoppingCart size={17} />}
            >
              {outOfStock ? "Out of Stock" : "Add to Cart"}
            </Button>

            <Button
              size="icon"
              variant={wishlisted ? "secondary" : "ghost"}
              onClick={() => toggle(pd._id)}
              aria-label="Toggle wishlist"
              className="shrink-0 h-11 w-11"
            >
              <Heart size={18} fill={wishlisted ? "currentColor" : "none"} />
            </Button>
          </div>

          {/* Stock indicator */}
          {pd.stock > 0 && pd.stock <= 10 && (
            <p className="text-xs text-amber-600 font-medium">Only {pd.stock} left in stock</p>
          )}

          {/* Perks */}
          <div className="grid grid-cols-3 gap-3 pt-2">
            {PERKS.map(({ icon: Icon, label }) => (
              <div key={label} className="flex flex-col items-center gap-1.5 text-center p-3 rounded-xl bg-[var(--color-background)]">
                <Icon size={18} className="text-[var(--color-primary)]" />
                <span className="text-xs text-[var(--color-text-muted)] leading-tight">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Reviews */}
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-[var(--color-text)]">Reviews {pd.ratings?.count > 0 && `(${pd.ratings.count})`}</h2>

        {/* Write review */}
        {isAuthenticated && (
          <div className="card p-5 space-y-4">
            <h3 className="font-semibold text-[var(--color-text)]">Write a Review</h3>
            <form onSubmit={handleSubmit(onReviewSubmit)} className="space-y-4">
              <div>
                <p className="text-sm text-[var(--color-text-muted)] mb-2">Your rating</p>
                <StarInput value={reviewRating} onChange={setReviewRating} />
              </div>
              <div>
                <textarea
                  className={cn("input min-h-[90px] resize-none", errors.comment && "input-error")}
                  placeholder="Share your thoughts about this product…"
                  {...register("comment")}
                />
                {errors.comment && <p className="text-xs text-[var(--color-error)] mt-1">{errors.comment.message}</p>}
              </div>
              <Button type="submit" loading={isSubmitting || reviewMutation.isPending} size="sm">Submit Review</Button>
            </form>
          </div>
        )}

        {/* Review list */}
        {revData?.data?.length > 0 ? (
          <div className="space-y-4">
            {revData.data.map(rev => (
              <div key={rev._id} className="card p-4 space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <Avatar src={rev.userAvatar} name={rev.userName} size="sm" />
                    <div>
                      <p className="text-sm font-semibold text-[var(--color-text)]">{rev.userName}</p>
                      <StarDisplay value={rev.rating} size={13} />
                    </div>
                  </div>
                  <span className="text-xs text-[var(--color-text-muted)] shrink-0">{formatDate(rev.createdAt, "short")}</span>
                </div>
                <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">{rev.comment}</p>
                {rev.isVerifiedPurchase && <Badge variant="success" className="text-xs">Verified Purchase</Badge>}
              </div>
            ))}
            {revData.pagination?.pages > 1 && (
              <Pagination page={reviewPage} pages={revData.pagination.pages} onPageChange={setReviewPage} />
            )}
          </div>
        ) : (
          <p className="text-sm text-[var(--color-text-muted)]">No reviews yet. Be the first!</p>
        )}
      </div>

      {/* Related products */}
      {relatedData?.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-[var(--color-text)] mb-5">You might also like</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {relatedData.map(p => <ProductCard key={p._id} product={p} />)}
          </div>
        </div>
      )}
    </div>
  );
}
