import { useContext } from "react";
import { ThemeContext } from "@/context/ThemeContext";

/**
 * Returns the full THEME object from ThemeContext.
 *
 * @returns {import("@/config/theme.config").THEME}
 *
 * @example
 * const { colors, brand, storeMode, currency } = useTheme();
 * {storeMode === "multi" && <VendorBadge />}
 */
export function useTheme() {
  const theme = useContext(ThemeContext);
  if (!theme) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return theme;
}
