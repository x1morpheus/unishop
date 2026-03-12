import PropTypes from "prop-types";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/utils/cn";

/**
 * Builds an array of page numbers + ellipsis strings to display.
 * e.g. [1, "...", 4, 5, 6, "...", 12]
 */
function buildPages(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 4) return [1, 2, 3, 4, 5, "...", total];
  if (current >= total - 3) return [1, "...", total - 4, total - 3, total - 2, total - 1, total];
  return [1, "...", current - 1, current, current + 1, "...", total];
}

/**
 * @param {{
 *   page: number,
 *   pages: number,
 *   onPageChange: (page: number) => void,
 *   className?: string,
 * }} props
 */
export function Pagination({ page, pages, onPageChange, className }) {
  if (pages <= 1) return null;

  const pageList = buildPages(page, pages);

  const btnBase =
    "inline-flex items-center justify-center h-9 w-9 rounded-lg text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-[var(--color-primary)]";

  return (
    <nav aria-label="Pagination" className={cn("flex items-center gap-1", className)}>
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        className={cn(btnBase, "text-[var(--color-text-muted)] hover:bg-[var(--color-background)] disabled:opacity-40 disabled:pointer-events-none")}
        aria-label="Previous page"
      >
        <ChevronLeft size={16} />
      </button>

      {pageList.map((p, i) =>
        p === "..." ? (
          <span key={`ellipsis-${i}`} className="px-1 text-[var(--color-text-muted)] text-sm select-none">
            …
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            aria-current={p === page ? "page" : undefined}
            className={cn(
              btnBase,
              p === page
                ? "bg-[var(--color-primary)] text-white font-semibold"
                : "text-[var(--color-text-muted)] hover:bg-[var(--color-background)]"
            )}
          >
            {p}
          </button>
        )
      )}

      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page === pages}
        className={cn(btnBase, "text-[var(--color-text-muted)] hover:bg-[var(--color-background)] disabled:opacity-40 disabled:pointer-events-none")}
        aria-label="Next page"
      >
        <ChevronRight size={16} />
      </button>
    </nav>
  );
}

Pagination.propTypes = {
  page:         PropTypes.number.isRequired,
  pages:        PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
  className:    PropTypes.string,
};
