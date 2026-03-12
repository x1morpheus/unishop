import { useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import PropTypes from "prop-types";
import { cn } from "@/utils/cn";

const widths = { sm: "max-w-xs", md: "max-w-md", lg: "max-w-lg" };

/**
 * @param {{
 *   isOpen: boolean,
 *   onClose: () => void,
 *   title?: string,
 *   size?: "sm"|"md"|"lg",
 *   children: React.ReactNode,
 *   footer?: React.ReactNode,
 *   side?: "right"|"left",
 * }} props
 */
export function Drawer({ isOpen, onClose, title, size = "md", children, footer, side = "right" }) {
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    if (isOpen) document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  const slideFrom = side === "right" ? { x: "100%" } : { x: "-100%" };

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="overlay z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            className={cn(
              "fixed top-0 bottom-0 z-50 flex flex-col w-full bg-[var(--color-surface)] shadow-2xl",
              widths[size],
              side === "right" ? "right-0" : "left-0"
            )}
            initial={slideFrom}
            animate={{ x: 0 }}
            exit={slideFrom}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? "drawer-title" : undefined}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-border)] shrink-0">
              {title && (
                <h2 id="drawer-title" className="text-lg font-semibold text-[var(--color-text)]">
                  {title}
                </h2>
              )}
              <button
                onClick={onClose}
                className="ml-auto p-1.5 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-background)] transition-colors"
                aria-label="Close drawer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto">{children}</div>

            {/* Footer */}
            {footer && (
              <div className="px-5 py-4 border-t border-[var(--color-border)] shrink-0">
                {footer}
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}

Drawer.propTypes = {
  isOpen:   PropTypes.bool.isRequired,
  onClose:  PropTypes.func.isRequired,
  title:    PropTypes.string,
  size:     PropTypes.oneOf(["sm", "md", "lg"]),
  children: PropTypes.node.isRequired,
  footer:   PropTypes.node,
  side:     PropTypes.oneOf(["right", "left"]),
};
