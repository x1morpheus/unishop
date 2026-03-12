import PropTypes from "prop-types";
import { cn } from "@/utils/cn";

const sizes = {
  xs: "h-7 w-7 text-xs",
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-12 w-12 text-base",
  xl: "h-16 w-16 text-lg",
};

/**
 * Returns initials from a name string. "Jane Doe" → "JD"
 * @param {string} name
 */
const getInitials = (name = "") =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");

/**
 * @param {{
 *   src?: string,
 *   name?: string,
 *   size?: "xs"|"sm"|"md"|"lg"|"xl",
 *   className?: string,
 * }} props
 */
export function Avatar({ src, name, size = "md", className }) {
  const initials = getInitials(name);

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-full shrink-0 font-semibold select-none overflow-hidden",
        "bg-[var(--color-primary-light)] text-[var(--color-primary-dark)]",
        sizes[size],
        className
      )}
      aria-label={name}
    >
      {src ? (
        <img
          src={src}
          alt={name || "Avatar"}
          className="h-full w-full object-cover"
          onError={(e) => { e.currentTarget.style.display = "none"; }}
        />
      ) : (
        initials || "?"
      )}
    </span>
  );
}

Avatar.propTypes = {
  src:       PropTypes.string,
  name:      PropTypes.string,
  size:      PropTypes.oneOf(["xs", "sm", "md", "lg", "xl"]),
  className: PropTypes.string,
};
