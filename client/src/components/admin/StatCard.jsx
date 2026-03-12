import PropTypes from "prop-types";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/utils/cn";

/**
 * @param {{
 *   title: string,
 *   value: string | number,
 *   icon: React.ReactNode,
 *   trend?: number,      // percent change, positive = up
 *   trendLabel?: string,
 *   color?: string,      // tailwind bg class for icon container
 *   loading?: boolean,
 * }} props
 */
export function StatCard({ title, value, icon, trend, trendLabel, color = "bg-[var(--color-primary-light)]", loading, onClick }) {
  const TrendIcon = trend > 0 ? TrendingUp : trend < 0 ? TrendingDown : Minus;
  const trendColor = trend > 0
    ? "text-[var(--color-success)]"
    : trend < 0
    ? "text-[var(--color-error)]"
    : "text-[var(--color-text-muted)]";

  if (loading) {
    return (
      <div className="card p-6 space-y-3">
        <div className="flex justify-between">
          <div className="skeleton h-4 w-28 rounded" />
          <div className="skeleton h-10 w-10 rounded-xl" />
        </div>
        <div className="skeleton h-8 w-24 rounded" />
        <div className="skeleton h-3 w-36 rounded" />
      </div>
    );
  }

  return (
    <motion.div
      className={cn("card p-6 flex flex-col gap-3", onClick && "cursor-pointer hover:shadow-md transition-shadow")}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <p className="text-sm font-medium text-[var(--color-text-muted)]">{title}</p>
        <span className={cn("flex items-center justify-center h-10 w-10 rounded-xl", color)}>
          {icon}
        </span>
      </div>

      <p className="text-2xl font-semibold text-[var(--color-text)] tracking-tight">{value}</p>

      {(trend !== undefined || trendLabel) && (
        <div className={cn("flex items-center gap-1 text-xs font-medium", trendColor)}>
          <TrendIcon size={13} />
          {trend !== undefined && <span>{Math.abs(trend)}%</span>}
          {trendLabel && <span className="text-[var(--color-text-muted)] font-normal">{trendLabel}</span>}
        </div>
      )}
    </motion.div>
  );
}

StatCard.propTypes = {
  title:      PropTypes.string.isRequired,
  value:      PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  icon:       PropTypes.node.isRequired,
  trend:      PropTypes.number,
  trendLabel: PropTypes.string,
  color:      PropTypes.string,
  loading:    PropTypes.bool,
  onClick:    PropTypes.func,
};
