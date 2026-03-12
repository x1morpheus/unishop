import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Home, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useTheme } from "@/hooks/useTheme";

export default function NotFoundPage() {
  const { brand } = useTheme();

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-background)] px-4">
      <motion.div
        className="text-center space-y-6 max-w-md"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Big 404 */}
        <motion.p
          className="text-[10rem] font-black leading-none select-none"
          style={{ color: "var(--color-primary)", opacity: 0.12 }}
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          404
        </motion.p>

        <div className="space-y-2 -mt-8">
          <h1 className="text-2xl font-bold text-[var(--color-text)]">Page not found</h1>
          <p className="text-[var(--color-text-muted)]">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button variant="ghost" onClick={() => history.back()} leftIcon={<ArrowLeft size={16} />}>
            Go Back
          </Button>
          <Link to="/">
            <Button leftIcon={<Home size={16} />}>Back to {brand.name}</Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
