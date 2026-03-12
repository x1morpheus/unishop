import { useQuery } from "@tanstack/react-query";
import { Heart } from "lucide-react";
import { ProductCard } from "@/components/store/ProductCard";
import { ProductCardSkeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { useWishlist } from "@/hooks/useWishlist";
import { useAuth } from "@/hooks/useAuth";
import { userService } from "@/services/user.service";
import { productService } from "@/services/product.service";

export function WishlistPage() {
  const { ids } = useWishlist();
  const { isAuthenticated } = useAuth();

  // If authenticated, use the server wishlist (accurate); else fall back to local IDs
  const { data: serverWishlist, isLoading: loadingServer } = useQuery({
    queryKey: ["wishlist-server"],
    queryFn: () => userService.getWishlist().then((r) => r.data),
    enabled: isAuthenticated,
  });

  const { data: localProducts, isLoading: loadingLocal } = useQuery({
    queryKey: ["wishlist-local", ids],
    queryFn: () => productService.getProducts({ limit: 100 }).then((r) =>
      r.data.filter((p) => ids.includes(p._id))
    ),
    enabled: !isAuthenticated && ids.length > 0,
  });

  const products = isAuthenticated ? (serverWishlist || []) : (localProducts || []);
  const isLoading = isAuthenticated ? loadingServer : loadingLocal;
  const empty = !isLoading && products.length === 0;

  return (
    <div className="container-app py-8">
      <h1 className="text-2xl font-bold text-[var(--color-text)] mb-6">
        Wishlist{" "}
        {products.length > 0 && (
          <span className="text-[var(--color-text-muted)] font-normal text-lg">
            ({products.length})
          </span>
        )}
      </h1>

      {empty ? (
        <EmptyState
          icon={<Heart size={28} strokeWidth={1.5} />}
          title="Your wishlist is empty"
          description="Heart products you love to save them here."
          className="py-24"
        />
      ) : isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((p) => <ProductCard key={p._id} product={p} />)}
        </div>
      )}
    </div>
  );
}
