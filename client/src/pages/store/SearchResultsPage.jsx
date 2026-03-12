import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { ProductCard } from "@/components/store/ProductCard";
import { ProductCardSkeleton } from "@/components/ui/Skeleton";
import { Pagination } from "@/components/ui/Pagination";
import { EmptyState } from "@/components/ui/EmptyState";
import { productService } from "@/services/product.service";
import { useState } from "react";

export default function SearchResultsPage() {
  const [sp, setSp] = useSearchParams();
  const q    = sp.get("q") || "";
  const page = parseInt(sp.get("page") || "1", 10);

  const { data, isLoading } = useQuery({
    queryKey: ["search", q, page],
    queryFn:  () => productService.getProducts({ search: q, page, limit: 20 }),
    enabled:  q.trim().length > 0,
    keepPreviousData: true,
  });

  const products   = data?.data            || [];
  const pagination = data?.pagination      || {};

  const setPage = (p) => { const n = new URLSearchParams(sp); n.set("page", String(p)); setSp(n); };

  return (
    <div className="container-app py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[var(--color-text)] flex items-center gap-2">
          <Search size={22} className="text-[var(--color-primary)]" />
          {q ? `Results for "${q}"` : "Search Products"}
        </h1>
        {!isLoading && q && (
          <p className="text-sm text-[var(--color-text-muted)] mt-1">
            {pagination.total ?? 0} result{pagination.total !== 1 ? "s" : ""}
          </p>
        )}
      </div>

      {!q ? (
        <EmptyState title="Enter a search term" description="Type in the search bar above to find products." className="py-24" />
      ) : isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => <ProductCardSkeleton key={i} />)}
        </div>
      ) : products.length === 0 ? (
        <EmptyState
          title={`No results for "${q}"`}
          description="Try a different search term or browse our categories."
          className="py-24"
        />
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {products.map(p => <ProductCard key={p._id} product={p} />)}
          </div>
          {pagination.pages > 1 && (
            <div className="flex justify-center mt-10">
              <Pagination page={page} pages={pagination.pages} onPageChange={setPage} />
            </div>
          )}
        </>
      )}
    </div>
  );
}
