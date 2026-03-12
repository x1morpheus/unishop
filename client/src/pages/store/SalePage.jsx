import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Zap, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { ProductCard } from "@/components/store/ProductCard";
import { ProductCardSkeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { productService } from "@/services/product.service";

function FlashCountdownBanner({ products }) {
  // Show the soonest-ending sale as the hero countdown
  const soonest = products
    .filter(p => p.flashSale?.endsAt)
    .sort((a, b) => new Date(a.flashSale.endsAt) - new Date(b.flashSale.endsAt))[0];

  const [now, setNow] = useState(Date.now());
  // refresh every second
  if (soonest) {
    setTimeout(() => setNow(Date.now()), 1000);
  }

  if (!soonest) return null;

  const diff = new Date(soonest.flashSale.endsAt) - now;
  if (diff <= 0) return null;

  const h = Math.floor(diff / 3_600_000);
  const m = Math.floor((diff % 3_600_000) / 60_000);
  const s = Math.floor((diff % 60_000) / 1_000);

  const pad = (n) => String(n).padStart(2, "0");

  return (
    <div className="bg-rose-600 text-white rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center">
          <Zap size={22} fill="currentColor" />
        </div>
        <div>
          <p className="font-bold text-lg">Flash Sale is LIVE</p>
          <p className="text-rose-100 text-sm">Grab these deals before the timer runs out!</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Clock size={16} className="text-rose-200" />
        <span className="text-rose-100 text-sm mr-2">Next sale ends in:</span>
        {[[pad(h),"H"],[pad(m),"M"],[pad(s),"S"]].map(([val, unit]) => (
          <div key={unit} className="flex flex-col items-center bg-white/20 rounded-xl px-3 py-2 min-w-[52px]">
            <span className="text-2xl font-bold font-mono tabular-nums leading-none">{val}</span>
            <span className="text-xs text-rose-200 mt-0.5">{unit}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function SalePage() {
  const { data, isLoading } = useQuery({
    queryKey: ["flash-sales-page"],
    queryFn:  () => productService.getFlashSales({ limit: 50 }),
    refetchInterval: 30_000,
  });

  const products = data?.data || [];

  return (
    <div className="container-app py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-100 text-rose-700 text-sm font-bold">
          <Zap size={14} fill="currentColor" /> Flash Sales
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-[var(--color-text)]">Today's Best Deals</h1>
        <p className="text-[var(--color-text-muted)] max-w-lg mx-auto">
          Limited-time offers on your favourite products. Prices drop fast — act now!
        </p>
      </div>

      {/* Countdown banner */}
      {!isLoading && products.length > 0 && (
        <FlashCountdownBanner products={products} />
      )}

      {/* Product grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)}
        </div>
      ) : products.length === 0 ? (
        <EmptyState
          icon={<Zap size={28} strokeWidth={1.5} />}
          title="No flash sales right now"
          description="Check back later — new deals drop every day!"
          className="py-24"
        />
      ) : (
        <motion.div
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4"
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
        >
          {products.map(p => (
            <motion.div key={p._id}
              variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }}>
              <ProductCard product={p} />
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
