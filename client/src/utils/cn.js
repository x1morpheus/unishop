import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges Tailwind class names safely, resolving conflicts intelligently.
 * Wraps clsx (conditional classes) + tailwind-merge (conflict resolution).
 *
 * @param {...(string | undefined | null | boolean | Record<string, boolean>)} inputs
 * @returns {string}
 *
 * @example
 * cn("px-4 py-2", isActive && "bg-primary", "px-6")
 * // → "py-2 bg-primary px-6"  (px-4 correctly overridden by px-6)
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
