import PropTypes from "prop-types";
import { cn } from "@/utils/cn";

/**
 * @param {{ className?: string, style?: React.CSSProperties }} props
 */
export function Skeleton({ className, style }) {
  return <div className={cn("skeleton", className)} style={style} aria-hidden="true" />;
}

Skeleton.propTypes = { className: PropTypes.string, style: PropTypes.object };

/** Pre-built skeleton for a product card */
export function ProductCardSkeleton() {
  return (
    <div className="card overflow-hidden">
      <Skeleton className="w-full aspect-product" />
      <div className="p-4 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <div className="flex items-center justify-between pt-1">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
      </div>
    </div>
  );
}

/** Pre-built skeleton for a table row */
export function TableRowSkeleton({ cols = 5 }) {
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <Skeleton className="h-4 w-full" />
        </td>
      ))}
    </tr>
  );
}

TableRowSkeleton.propTypes = { cols: PropTypes.number };

/** Pre-built skeleton for stat card */
export function StatCardSkeleton() {
  return (
    <div className="card p-6 space-y-3">
      <div className="flex justify-between">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-10 w-10 rounded-xl" />
      </div>
      <Skeleton className="h-8 w-24" />
      <Skeleton className="h-3 w-36" />
    </div>
  );
}
