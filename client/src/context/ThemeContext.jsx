import { createContext, useEffect, useMemo } from "react";
import PropTypes from "prop-types";
import { THEME } from "@/config/theme.config";

/**
 * ThemeContext — exposes the full THEME object to every component tree.
 * Also injects all THEME values as CSS custom properties on :root so that
 * Tailwind utilities and raw CSS can both reference them.
 *
 * @type {React.Context<typeof THEME>}
 */
export const ThemeContext = createContext(THEME);

/**
 * Maps every THEME color to a CSS custom property on :root.
 * e.g. THEME.colors.primary → --color-primary: #6C63FF
 * Also sets font, border-radius, and currency for use in CSS.
 */
function injectCSSVars(theme) {
  const root = document.documentElement;

  // Colors
  const colorMap = {
    "--color-primary": theme.colors.primary,
    "--color-primary-dark": theme.colors.primaryDark,
    "--color-primary-light": theme.colors.primaryLight,
    "--color-secondary": theme.colors.secondary,
    "--color-accent": theme.colors.accent,
    "--color-background": theme.colors.background,
    "--color-surface": theme.colors.surface,
    "--color-text": theme.colors.text,
    "--color-text-muted": theme.colors.textMuted,
    "--color-border": theme.colors.border,
    "--color-error": theme.colors.error,
    "--color-success": theme.colors.success,
    "--color-warning": theme.colors.warning,
    "--color-admin-bg": theme.colors.adminBg,
    "--color-admin-surface": theme.colors.adminSurface,
    "--color-admin-text": theme.colors.adminText,
  };

  Object.entries(colorMap).forEach(([prop, value]) => {
    root.style.setProperty(prop, value);
  });

  // Typography
  root.style.setProperty("--font-heading", theme.fonts.heading);
  root.style.setProperty("--font-body", theme.fonts.body);

  // Shape
  root.style.setProperty("--border-radius", theme.borderRadius);

  // Hero
  root.style.setProperty("--hero-bg", theme.hero.bgColor);

  // Update document title with brand name
  document.title = theme.brand.name;

  // Update favicon if specified
  const favicon = document.querySelector("link[rel='icon']");
  if (favicon && theme.brand.favicon) {
    favicon.href = theme.brand.favicon;
  }
}

/**
 * @param {{ children: React.ReactNode }} props
 */
export function ThemeProvider({ children }) {
  // THEME is static at build time — memoize to preserve reference stability
  const value = useMemo(() => THEME, []);

  useEffect(() => {
    injectCSSVars(THEME);
  }, []);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

ThemeProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
