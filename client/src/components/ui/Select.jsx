import { forwardRef } from "react";
import PropTypes from "prop-types";
import { ChevronDown } from "lucide-react";
import { cn } from "@/utils/cn";

/**
 * Accessible Select with label and error.
 * Uses forwardRef so React Hook Form's register() ref works correctly.
 */
export const Select = forwardRef(function Select(
  {
    label,
    error,
    required,
    options = [],
    placeholder,
    className,
    containerClassName,
    id,
    ...rest
  },
  ref
) {
  const selectId = id || label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className={cn("flex flex-col gap-1.5", containerClassName)}>
      {label && (
        <label htmlFor={selectId} className={cn("label", required && "label-required")}>
          {label}
        </label>
      )}

      <div className="relative">
        <select
          ref={ref}
          id={selectId}
          className={cn(
            "input pr-9 cursor-pointer appearance-none",
            error && "input-error",
            className
          )}
          aria-invalid={!!error}
          {...rest}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown
          size={16}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] pointer-events-none"
        />
      </div>

      {error && (
        <p className="text-xs text-[var(--color-error)]">{error}</p>
      )}
    </div>
  );
});

Select.displayName = "Select";

Select.propTypes = {
  label:              PropTypes.string,
  error:              PropTypes.string,
  required:           PropTypes.bool,
  options:            PropTypes.arrayOf(PropTypes.shape({ value: PropTypes.string, label: PropTypes.string })),
  placeholder:        PropTypes.string,
  className:          PropTypes.string,
  containerClassName: PropTypes.string,
  id:                 PropTypes.string,
};
