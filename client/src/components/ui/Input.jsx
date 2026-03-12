import { forwardRef } from "react";
import PropTypes from "prop-types";
import { cn } from "@/utils/cn";

/**
 * Fully-accessible Input with label, error, helper text, and addons.
 * Uses forwardRef so React Hook Form's register() ref works correctly.
 */
export const Input = forwardRef(function Input(
  {
    label,
    error,
    helper,
    required,
    leftAddon,
    rightAddon,
    className,
    containerClassName,
    id,
    ...rest
  },
  ref
) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className={cn("flex flex-col gap-1.5", containerClassName)}>
      {label && (
        <label htmlFor={inputId} className={cn("label", required && "label-required")}>
          {label}
        </label>
      )}

      <div className="relative flex items-center">
        {leftAddon && (
          <span className="absolute left-3 flex items-center text-[var(--color-text-muted)] pointer-events-none">
            {leftAddon}
          </span>
        )}

        <input
          ref={ref}
          id={inputId}
          className={cn(
            "input",
            leftAddon  && "pl-9",
            rightAddon && "pr-9",
            error      && "input-error",
            className
          )}
          aria-invalid={!!error}
          aria-describedby={
            error ? `${inputId}-error` : helper ? `${inputId}-helper` : undefined
          }
          {...rest}
        />

        {rightAddon && (
          <span className="absolute right-3 flex items-center text-[var(--color-text-muted)]">
            {rightAddon}
          </span>
        )}
      </div>

      {error && (
        <p id={`${inputId}-error`} className="text-xs text-[var(--color-error)] flex items-center gap-1">
          {error}
        </p>
      )}
      {!error && helper && (
        <p id={`${inputId}-helper`} className="text-xs text-[var(--color-text-muted)]">
          {helper}
        </p>
      )}
    </div>
  );
});

Input.displayName = "Input";

Input.propTypes = {
  label:              PropTypes.string,
  error:              PropTypes.string,
  helper:             PropTypes.string,
  required:           PropTypes.bool,
  leftAddon:          PropTypes.node,
  rightAddon:         PropTypes.node,
  className:          PropTypes.string,
  containerClassName: PropTypes.string,
  id:                 PropTypes.string,
};
