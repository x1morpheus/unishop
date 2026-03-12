import PropTypes from "prop-types";
import { PackageOpen } from "lucide-react";
import { Button } from "./Button";
import { cn } from "@/utils/cn";

/**
 * @param {{
 *   icon?: React.ReactNode,
 *   title?: string,
 *   description?: string,
 *   action?: { label: string, onClick: () => void },
 *   className?: string,
 * }} props
 */
export function EmptyState({
  icon,
  title = "Nothing here yet",
  description,
  action,
  className,
}) {
  return (
    <div className={cn("empty-state gap-4", className)}>
      <span className="flex items-center justify-center h-16 w-16 rounded-2xl bg-[var(--color-primary-light)] text-[var(--color-primary)]">
        {icon ?? <PackageOpen size={28} strokeWidth={1.5} />}
      </span>
      <div className="space-y-1 max-w-xs">
        <p className="font-semibold text-[var(--color-text)] text-base">{title}</p>
        {description && (
          <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">{description}</p>
        )}
      </div>
      {action && (
        <Button variant="primary" size="sm" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
}

EmptyState.propTypes = {
  icon:        PropTypes.node,
  title:       PropTypes.string,
  description: PropTypes.string,
  action:      PropTypes.shape({ label: PropTypes.string, onClick: PropTypes.func }),
  className:   PropTypes.string,
};
