import { useState } from "react";
import { Star } from "lucide-react";
import PropTypes from "prop-types";
import { cn } from "@/utils/cn";

/**
 * Display-only star rating.
 * @param {{ value: number, max?: number, size?: number, className?: string }} props
 */
export function StarDisplay({ value = 0, max = 5, size = 14, className }) {
  return (
    <div className={cn("flex items-center gap-0.5", className)} aria-label={`${value.toFixed(1)} out of ${max} stars`}>
      {Array.from({ length: max }).map((_, i) => (
        <Star
          key={i}
          size={size}
          className={
            i < Math.floor(value)
              ? "text-amber-400 fill-amber-400"
              : i < value
              ? "text-amber-400 fill-amber-200"
              : "text-[var(--color-border)] fill-[var(--color-border)]"
          }
        />
      ))}
    </div>
  );
}

StarDisplay.propTypes = { value: PropTypes.number, max: PropTypes.number, size: PropTypes.number, className: PropTypes.string };

/**
 * Interactive star rating input.
 * @param {{ value: number, onChange: (n: number) => void, size?: number }} props
 */
export function StarInput({ value, onChange, size = 24 }) {
  const [hover, setHover] = useState(0);

  return (
    <div className="flex items-center gap-1" role="group" aria-label="Rate this product">
      {Array.from({ length: 5 }).map((_, i) => {
        const n = i + 1;
        const filled = n <= (hover || value);
        return (
          <button
            key={i}
            type="button"
            onClick={() => onChange(n)}
            onMouseEnter={() => setHover(n)}
            onMouseLeave={() => setHover(0)}
            aria-label={`Rate ${n} star${n !== 1 ? "s" : ""}`}
            className="transition-transform hover:scale-110"
          >
            <Star
              size={size}
              className={cn(
                "transition-colors",
                filled ? "text-amber-400 fill-amber-400" : "text-[var(--color-border)] fill-[var(--color-border)]"
              )}
            />
          </button>
        );
      })}
    </div>
  );
}

StarInput.propTypes = { value: PropTypes.number.isRequired, onChange: PropTypes.func.isRequired, size: PropTypes.number };
