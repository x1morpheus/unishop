import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowRight, Zap } from "lucide-react";
import { ProductCard } from "@/components/store/ProductCard";
import { FlashSalesSection } from "@/components/store/FlashSalesSection";
import { ProductCardSkeleton } from "@/components/ui/Skeleton";
import { Button } from "@/components/ui/Button";
import { useTheme } from "@/hooks/useTheme";
import { productService } from "@/services/product.service";

const stagger = {
  container: { animate: { transition: { staggerChildren: 0.07 } } },
  item: { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0, transition: { duration: 0.4 } } },
};

export default function HomePage() {
  const { hero, brand } = useTheme();

  const { data: featuredData, isLoading: featLoading } = useQuery({
    queryKey: ["products", "featured"],
    queryFn:  () => productService.getProducts({ featured: true, limit: 8 }),
  });

  const { data: catsData } = useQuery({
    queryKey: ["categories"],
    queryFn:  productService.getCategories,
  });

  const featured   = featuredData?.data  || [];
  const categories = catsData?.data      || [];

  return (
    <div className="space-y-16 pb-16">
      {/* Hero */}
      <section
        className="relative overflow-hidden py-20 sm:py-28"
        style={
          hero.bgImage
            ? {
                backgroundImage: `url(${hero.bgImage})`,
                backgroundSize: "cover",
                backgroundPosition: hero.bgPosition || "center",
                backgroundRepeat: "no-repeat",
              }
            : {
                background: `linear-gradient(135deg, ${hero.bgColor} 0%, ${hero.bgColor}dd 60%, var(--color-primary-dark) 100%)`,
              }
        }
      >
        {/* Overlay — dark tint for image mode, decorative blobs for color mode */}
        {hero.bgImage ? (
          <div
            className="absolute inset-0"
            style={{ background: hero.bgOverlay || "rgba(0,0,0,0.45)" }}
            aria-hidden="true"
          />
        ) : (
          <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
            <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
            <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-white/5 blur-2xl" />
          </div>
        )}

        <div className="container-app relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-5"
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 text-white text-xs font-semibold backdrop-blur-sm">
              <Zap size={12} fill="currentColor" />
              {brand.tagline}
            </span>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight tracking-tight">
              {hero.headline}
            </h1>

            <p className="text-lg text-white/80 max-w-xl mx-auto leading-relaxed">
              {hero.subheadline}
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <Link to="/products">
                <Button size="lg" className="bg-white text-[var(--color-primary)] hover:bg-white/90 shadow-lg shadow-black/20 font-semibold">
                  {hero.ctaText}
                  <ArrowRight size={17} />
                </Button>
              </Link>
              <Link to="/products?view=categories">
                <Button size="lg" variant="ghost" className="text-white border border-white/30 hover:bg-white/10">
                  Browse Categories
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="container-app">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-[var(--color-text)]">Shop by Category</h2>
            <Link to="/products?view=categories" className="text-sm text-[var(--color-primary)] hover:underline flex items-center gap-1 font-medium">
              All categories <ArrowRight size={14} />
            </Link>
          </div>

          <motion.div
            variants={stagger.container}
            initial="initial"
            animate="animate"
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3"
          >
            {categories.slice(0, 6).map((cat) => (
              <motion.div key={cat._id} variants={stagger.item}>
                <Link
                  to={`/products?category=${cat._id}`}
                  className="flex flex-col items-center gap-2.5 p-4 card hover:border-[var(--color-primary)] hover:shadow-md transition-all duration-200 group text-center"
                >
                  {cat.image ? (
                    <img src={cat.image} alt={cat.name} className="h-12 w-12 object-cover rounded-xl" />
                  ) : (
                    <div className="h-12 w-12 rounded-xl bg-[var(--color-primary-light)] flex items-center justify-center text-xl">
                      🛍️
                    </div>
                  )}
                  <span className="text-sm font-medium text-[var(--color-text)] group-hover:text-[var(--color-primary)] transition-colors">
                    {cat.name}
                  </span>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </section>
      )}

      {/* Flash Sales */}
      <FlashSalesSection />

      {/* Featured Products */}
      <section className="container-app">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-[var(--color-text)]">Featured Products</h2>
          <Link to="/products" className="text-sm text-[var(--color-primary)] hover:underline flex items-center gap-1 font-medium">
            View all <ArrowRight size={14} />
          </Link>
        </div>

        <motion.div
          variants={stagger.container}
          initial="initial"
          animate="animate"
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4"
        >
          {featLoading
            ? Array.from({ length: 8 }).map((_, i) => (
                <motion.div key={i} variants={stagger.item}><ProductCardSkeleton /></motion.div>
              ))
            : featured.map((p) => (
                <motion.div key={p._id} variants={stagger.item}>
                  <ProductCard product={p} />
                </motion.div>
              ))
          }
        </motion.div>
      </section>

      {/* CTA banner */}
      <section className="container-app">
        <div
          className="rounded-2xl p-8 sm:p-12 flex flex-col sm:flex-row items-center justify-between gap-6"
          style={{ background: `linear-gradient(135deg, var(--color-primary-light), var(--color-surface))` }}
        >
          <div>
            <h2 className="text-2xl font-bold text-[var(--color-text)]">Ready to find something you love?</h2>
            <p className="text-[var(--color-text-muted)] mt-1">Thousands of products, free shipping over $50.</p>
          </div>
          <Link to="/products" className="shrink-0">
            <Button size="lg" rightIcon={<ArrowRight size={17} />}>Browse All Products</Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
