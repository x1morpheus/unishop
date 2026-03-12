import { useState, useEffect } from "react";

/**
 * Returns true when the window matches the given CSS media query.
 * SSR-safe: defaults to false until mounted.
 *
 * @param {string} query - e.g. "(min-width: 768px)"
 * @returns {boolean}
 *
 * @example
 * const isDesktop = useMediaQuery("(min-width: 1024px)");
 */
export function useMediaQuery(query) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia(query);
    setMatches(mql.matches);

    const handler = (e) => setMatches(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, [query]);

  return matches;
}

/* ── Convenience hooks matching Tailwind breakpoints ───────────────────────── */

/** @returns {boolean} true when viewport ≥ 640px (sm) */
export const useIsSm  = () => useMediaQuery("(min-width: 640px)");

/** @returns {boolean} true when viewport ≥ 768px (md) */
export const useIsMd  = () => useMediaQuery("(min-width: 768px)");

/** @returns {boolean} true when viewport ≥ 1024px (lg) */
export const useIsLg  = () => useMediaQuery("(min-width: 1024px)");

/** @returns {boolean} true when viewport ≥ 1280px (xl) */
export const useIsXl  = () => useMediaQuery("(min-width: 1280px)");

/** @returns {boolean} true when viewport < 768px (mobile) */
export const useIsMobile = () => useMediaQuery("(max-width: 767px)");
