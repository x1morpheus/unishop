/** @type {import('tailwindcss').Config} */

/**
 * THEME colors are injected here so Tailwind can generate utility classes
 * for every brand color defined in theme.config.js.
 * In Step 2 the ThemeContext will also map these to CSS custom properties.
 */
import { THEME } from "./src/config/theme.config.js";

export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: THEME.colors.primary,
          dark: THEME.colors.primaryDark,
          light: THEME.colors.primaryLight,
        },
        secondary: THEME.colors.secondary,
        accent: THEME.colors.accent,
        background: THEME.colors.background,
        surface: THEME.colors.surface,
        "text-base": THEME.colors.text,
        "text-muted": THEME.colors.textMuted,
        border: THEME.colors.border,
        error: THEME.colors.error,
        success: THEME.colors.success,
        warning: THEME.colors.warning,
        "admin-bg": THEME.colors.adminBg,
        "admin-surface": THEME.colors.adminSurface,
        "admin-text": THEME.colors.adminText,
      },
      fontFamily: {
        heading: THEME.fonts.heading,
        body: THEME.fonts.body,
        sans: ['"DM Sans"', "sans-serif"],
      },
      borderRadius: {
        theme: THEME.borderRadius,
      },
      boxShadow: {
        card: "0 1px 3px 0 rgb(0 0 0 / 0.08), 0 1px 2px -1px rgb(0 0 0 / 0.06)",
        "card-hover": "0 4px 12px 0 rgb(0 0 0 / 0.10)",
        dropdown: "0 10px 30px -5px rgb(0 0 0 / 0.15)",
      },
      screens: {
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1280px",
        "2xl": "1536px",
      },
      transitionTimingFunction: {
        smooth: "cubic-bezier(0.4, 0, 0.2, 1)",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "slide-up": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in-right": {
          "0%": { transform: "translateX(100%)" },
          "100%": { transform: "translateX(0)" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.2s ease-out",
        "slide-up": "slide-up 0.3s ease-out",
        "slide-in-right": "slide-in-right 0.3s ease-out",
        shimmer: "shimmer 1.5s infinite",
      },
    },
  },
  plugins: [],
};
