import PropTypes from "prop-types";
import { cn } from "@/utils/cn";

const variants = {
  primary:  "badge badge-primary",
  success:  "badge badge-success",
  warning:  "badge badge-warning",
  error:    "badge badge-error",
  muted:    "badge badge-muted",
};

/** Maps order/payment statuses to badge color variants */
export const statusVariant = {
  pending:    "warning",
  confirmed:  "primary",
  processing: "primary",
  shipped:    "primary",
  delivered:  "success",
  cancelled:  "error",
  refunded:   "muted",
  paid:       "success",
  failed:     "error",
};

/**
 * @param {{
 *   variant?: "primary"|"success"|"warning"|"error"|"muted",
 *   children: React.ReactNode,
 *   icon?: React.ReactNode,
 *   className?: string,
 * }} props
 */
export function Badge({ variant = "primary", children, icon, className }) {
  return (
    <span className={cn(variants[variant], className)}>
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </span>
  );
}

Badge.propTypes = {
  variant:  PropTypes.oneOf(Object.keys(variants)),
  children: PropTypes.node.isRequired,
  icon:     PropTypes.node,
  className: PropTypes.string,
};
