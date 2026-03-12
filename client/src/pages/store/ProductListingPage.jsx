import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { SlidersHorizontal, X, ChevronDown, ChevronUp, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ProductCard } from "@/components/store/ProductCard";
import { ProductCardSkeleton } from "@/components/ui/Skeleton";
import { Pagination } from "@/components/ui/Pagination";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { productService } from "@/services/product.service";
import { useDebounce } from "@/hooks/useDebounce";
import { SORT_OPTIONS, SORT_LABELS } from "@shared/constants";
import { cn } from "@/utils/cn";

const SORT_OPTS = Object.values(SORT_OPTIONS).map(v => ({ value: v, label: SORT_LABELS[v] }));

function FilterSection({ label, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-[var(--color-border)] pb-4">
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center justify-between w-full py-2 text-sm font-semibold text-[var(--color-text)]"
      >
        {label}
        {open ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="pt-3">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ProductListingPage() {
  const [params, setParams] = useSearchParams();
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Derive filter state from URL params
  const page     = parseInt(params.get("page")  || "1", 10);
  const sort     = params.get("sort")     || "";
  const category = params.get("category") || "";
  const minPrice = params.get("minPrice") || "";
  const maxPrice = params.get("maxPrice") || "";
  const inStock    = params.get("inStock")  === "true";
  const flashSale  = params.get("flashSale") === "true";
  const search     = params.get("q")        || "";

  const [priceMin, setPriceMin] = useState(minPrice);
  const [priceMax, setPriceMax] = useState(maxPrice);
  const debouncedMin = useDebounce(priceMin, 600);
  const debouncedMax = useDebounce(priceMax, 600);

  const setParam = (key, value) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value); else next.delete(key);
    next.set("page", "1");
    setParams(next);
  };

  useEffect(() => {
    if (debouncedMin !== minPrice) setParam("minPrice", debouncedMin);
  }, [debouncedMin]);
  useEffect(() => {
    if (debouncedMax !== maxPrice) setParam("maxPrice", debouncedMax);
  }, [debouncedMax]);

  const { data: catsData } = useQuery({ queryKey: ["categories"], queryFn: productService.getCategories });
  const categories = catsData?.data || [];

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["products", page, sort, category, minPrice, maxPrice, inStock, flashSale, search],
    queryFn:  () => productService.getProducts({ page, limit: 20, sort, category, minPrice, maxPrice, inStock: inStock || undefined, flashSale: flashSale || undefined, search }),
    keepPreviousData: true,
  });

  const products   = data?.data            || [];
  const pagination = data?.pagination      || {};
  const totalCount = pagination.total      || 0;

  const clearFilters = () => {
    setParams({ page: "1" });
    setPriceMin(""); setPriceMax("");
  };

  const hasFilters = !!(category || minPrice || maxPrice || inStock || flashSale || sort);

  const FilterPanel = () => (
    <div className="space-y-4">
      {/* Active filters */}
      {hasFilters && (
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">Active Filters</span>
          <button onClick={clearFilters} className="text-xs text-[var(--color-error)] hover:underline flex items-center gap-1">
            <X size={12} /> Clear all
          </button>
        </div>
      )}

      {/* Categories */}
      <FilterSection label="Category">
        <ul className="space-y-1">
          <li>
            <button
              onClick={() => setParam("category", "")}
              className={cn("text-sm w-full text-left px-2 py-1.5 rounded-lg transition-colors", !category ? "font-semibold text-[var(--color-primary)] bg-[var(--color-primary-light)]" : "text-[var(--color-text-muted)] hover:bg-[var(--color-background)]")}
            >All categories</button>
          </li>
          {categories.map(c => (
            <li key={c._id}>
              <button
                onClick={() => setParam("category", c._id)}
                className={cn("text-sm w-full text-left px-2 py-1.5 rounded-lg transition-colors", category === c._id ? "font-semibold text-[var(--color-primary)] bg-[var(--color-primary-light)]" : "text-[var(--color-text-muted)] hover:bg-[var(--color-background)]")}
              >{c.name}</button>
            </li>
          ))}
        </ul>
      </FilterSection>

      {/* Price */}
      <FilterSection label="Price Range">
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Min"
            value={priceMin}
            onChange={e => setPriceMin(e.target.value)}
            className="input text-sm py-1.5 w-full"
          />
          <span className="text-[var(--color-text-muted)] text-sm shrink-0">–</span>
          <input
            type="number"
            placeholder="Max"
            value={priceMax}
            onChange={e => setPriceMax(e.target.value)}
            className="input text-sm py-1.5 w-full"
          />
        </div>
      </FilterSection>

      {/* Availability */}
      <FilterSection label="Availability">
        <label className="flex items-center gap-2.5 cursor-pointer">
          <input
            type="checkbox"
            checked={inStock}
            onChange={e => setParam("inStock", e.target.checked ? "true" : "")}
            className="rounded accent-[var(--color-primary)]"
          />
          <span className="text-sm text-[var(--color-text)]">In stock only</span>
        </label>
      </FilterSection>
    </div>
  );

  return (
    <div className="container-app py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text)]">
            {search ? `Results for "${search}"` : category ? (categories.find(c => c._id === category)?.name || "Products") : "All Products"}
          </h1>
          {!isLoading && <p className="text-sm text-[var(--color-text-muted)] mt-0.5">{totalCount} product{totalCount !== 1 ? "s" : ""}</p>}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<SlidersHorizontal size={14} />}
            onClick={() => setMobileFiltersOpen(true)}
            className="lg:hidden"
          >
            Filters {hasFilters && <Badge variant="primary" className="ml-1">!</Badge>}
          </Button>
          <Select
            options={[{ value: "", label: "Sort: Default" }, ...SORT_OPTS]}
            value={sort}
            onChange={e => setParam("sort", e.target.value)}
            containerClassName="w-44"
          />
        </div>
      </div>

      <div className="flex gap-8">
        {/* Desktop sidebar */}
        <aside className="hidden lg:block w-56 shrink-0">
          <FilterPanel />
        </aside>

        {/* Product grid */}
        <div className="flex-1 min-w-0">
          {isLoading || isFetching ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
              {Array.from({ length: 12 }).map((_, i) => <ProductCardSkeleton key={i} />)}
            </div>
          ) : products.length === 0 ? (
            <EmptyState
              title="No products found"
              description="Try adjusting your filters or search query."
              action={{ label: "Clear filters", onClick: clearFilters }}
              className="py-24"
            />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
              {products.map(p => <ProductCard key={p._id} product={p} />)}
            </div>
          )}

          {pagination.pages > 1 && (
            <div className="flex justify-center mt-10">
              <Pagination
                page={page}
                pages={pagination.pages}
                onPageChange={p => setParam("page", String(p))}
              />
            </div>
          )}
        </div>
      </div>

      {/* Mobile filter drawer */}
      <AnimatePresence>
        {mobileFiltersOpen && (
          <>
            <motion.div className="fixed inset-0 bg-black/40 z-40 lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMobileFiltersOpen(false)} />
            <motion.div
              className="fixed bottom-0 left-0 right-0 bg-[var(--color-surface)] z-50 rounded-t-2xl p-5 max-h-[80vh] overflow-y-auto lg:hidden"
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 30 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-[var(--color-text)]">Filters</h3>
                <Button size="icon" variant="ghost" onClick={() => setMobileFiltersOpen(false)}><X size={18} /></Button>
              </div>
              <FilterPanel />
              <Button fullWidth className="mt-5" onClick={() => setMobileFiltersOpen(false)}>Apply Filters</Button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
