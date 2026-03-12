import { useRef } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Zap, ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { ProductCard } from "@/components/store/ProductCard";
import { ProductCardSkeleton } from "@/components/ui/Skeleton";
import { productService } from "@/services/product.service";

export function FlashSalesSection() {
  const scrollRef = useRef(null);

  const { data, isLoading } = useQuery({
    queryKey: ["flash-sales"],
    queryFn:  () => productService.getFlashSales({ limit: 10 }),
    refetchInterval: 60_000, // re-check every minute
  });

  const products = data?.data || [];

  if (!isLoading && products.length === 0) return null;

  const scroll = (dir) => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: dir * 280, behavior: "smooth" });
  };

  return (
    <section className="container-app">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-600 text-white text-sm font-bold shadow-lg shadow-rose-600/30">
            <Zap size={14} fill="currentColor" />
            Flash Sales
          </div>
          <p className="text-sm text-[var(--color-text-muted)] hidden sm:block">Limited-time deals — grab them before they're gone!</p>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={() => scroll(-1)}
            className="h-8 w-8 rounded-full border border-[var(--color-border)] flex items-center justify-center hover:bg-[var(--color-background)] transition-colors">
            <ChevronLeft size={15} />
          </button>
          <button onClick={() => scroll(1)}
            className="h-8 w-8 rounded-full border border-[var(--color-border)] flex items-center justify-center hover:bg-[var(--color-background)] transition-colors">
            <ChevronRight size={15} />
          </button>
          <Link to="/products?flashSale=true" className="hidden sm:flex items-center gap-1 text-sm text-[var(--color-primary)] font-medium hover:underline ml-1">
            View all <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      {/* Scrollable row */}
      <div ref={scrollRef}
        className="flex gap-4 overflow-x-auto no-scrollbar pb-2 snap-x snap-mandatory">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="shrink-0 w-[220px] snap-start">
                <ProductCardSkeleton />
              </div>
            ))
          : products.map((p) => (
              <motion.div key={p._id} className="shrink-0 w-[220px] snap-start"
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}>
                <ProductCard product={p} />
              </motion.div>
            ))
        }
      </div>
    </section>
  );
}
