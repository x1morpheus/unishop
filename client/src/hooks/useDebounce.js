import { useState, useEffect } from "react";

/**
 * Returns a debounced version of `value` that only updates after `delay` ms
 * of no new changes. Used to prevent firing API calls on every keystroke.
 *
 * @template T
 * @param {T} value
 * @param {number} [delay=400]
 * @returns {T}
 *
 * @example
 * const [q, setQ] = useState("");
 * const debouncedQ = useDebounce(q, 400);
 * // fire search only when user stops typing for 400ms
 * useEffect(() => { search(debouncedQ); }, [debouncedQ]);
 */
export function useDebounce(value, delay = 400) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
