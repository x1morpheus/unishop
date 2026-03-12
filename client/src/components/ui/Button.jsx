import PropTypes from "prop-types";
import { Loader2 } from "lucide-react";
import { cn } from "@/utils/cn";

const variants = {
  primary:   "btn btn-primary",
  secondary: "btn btn-secondary",
  ghost:     "btn btn-ghost",
  danger:    "btn btn-danger",
};

const sizes = {
  sm: "px-3 py-1.5 text-xs gap-1.5",
  md: "px-5 py-2.5 text-sm",
  lg: "px-7 py-3 text-base",
  icon: "p-2 aspect-square",
};

/**
 * @param {{
 *   variant?: "primary"|"secondary"|"ghost"|"danger",
 *   size?: "sm"|"md"|"lg"|"icon",
 *   loading?: boolean,
 *   fullWidth?: boolean,
 *   leftIcon?: React.ReactNode,
 *   rightIcon?: React.ReactNode,
 *   className?: string,
 *   children?: React.ReactNode,
 * } & React.ButtonHTMLAttributes<HTMLButtonElement>} props
 */
export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  className,
  children,
  disabled,
  ...rest
}) {
  return (
    <button
      className={cn(
        variants[variant],
        sizes[size],
        fullWidth && "w-full",
        className
      )}
      disabled={disabled || loading}
      {...rest}
    >
      {loading ? (
        <Loader2 size={16} className="animate-spin shrink-0" />
      ) : leftIcon ? (
        <span className="shrink-0">{leftIcon}</span>
      ) : null}
      {children}
      {!loading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
    </button>
  );
}

Button.propTypes = {
  variant:   PropTypes.oneOf(["primary", "secondary", "ghost", "danger"]),
  size:      PropTypes.oneOf(["sm", "md", "lg", "icon"]),
  loading:   PropTypes.bool,
  fullWidth: PropTypes.bool,
  leftIcon:  PropTypes.node,
  rightIcon: PropTypes.node,
  className: PropTypes.string,
  children:  PropTypes.node,
  disabled:  PropTypes.bool,
};
