import { createContext, useCallback, useEffect, useState } from "react";
import PropTypes from "prop-types";
import { THEME } from "@/config/theme.config";

/**
 * Color modes supported by the app.
 * "system" follows the OS preference and auto-switches.
 * @typedef {"light" | "dark" | "dim" | "system"} ColorMode
 */

const STORAGE_KEY = "unishop-color-mode";

/* ── Per-mode CSS variable palettes ────────────────────────────────────────── */
function buildPalette(mode, brandColors) {
  // Always start with brand primaries — they don't change with mode
  const brand = {
    "--color-primary":       brandColors.primary,
    "--color-primary-dark":  brandColors.primaryDark,
    "--color-primary-light": brandColors.primaryLight,
    "--color-secondary":     brandColors.secondary,
    "--color-accent":        brandColors.accent,
    "--color-error":         brandColors.error,
    "--color-success":       brandColors.success,
    "--color-warning":       brandColors.warning,
    // Admin palette stays constant — it's always dark
    "--color-admin-bg":      brandColors.adminBg,
    "--color-admin-surface": brandColors.adminSurface,
    "--color-admin-text":    brandColors.adminText,
  };

  const palettes = {
    light: {
      ...brand,
      "--color-background":  brandColors.background  || "#F9FAFB",
      "--color-surface":     brandColors.surface      || "#FFFFFF",
      "--color-text":        brandColors.text         || "#1A1A2E",
      "--color-text-muted":  brandColors.textMuted    || "#6B7280",
      "--color-border":      brandColors.border       || "#E5E7EB",
    },
    dark: {
      ...brand,
      // Override primaryLight so tinted backgrounds look right on dark
      "--color-primary-light": `${brandColors.primary}22`,
      "--color-background":  "#0F172A",
      "--color-surface":     "#1E293B",
      "--color-text":        "#F1F5F9",
      "--color-text-muted":  "#94A3B8",
      "--color-border":      "#334155",
    },
    dim: {
      ...brand,
      "--color-primary-light": `${brandColors.primary}25`,
      "--color-background":  "#1C1C28",
      "--color-surface":     "#27273A",
      "--color-text":        "#E2E8F0",
      "--color-text-muted":  "#94A3B8",
      "--color-border":      "#3F3F5A",
    },
  };

  return palettes[mode] || palettes.light;
}

function applyPalette(palette) {
  const root = document.documentElement;
  Object.entries(palette).forEach(([prop, val]) => root.style.setProperty(prop, val));
}

function resolveMode(mode) {
  if (mode !== "system") return mode;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

/** @type {React.Context<{ mode: ColorMode, resolved: "light"|"dark"|"dim", setMode: (m: ColorMode) => void }>} */
export const ColorModeContext = createContext({
  mode:     "light",
  resolved: "light",
  setMode:  () => {},
});

export function ColorModeProvider({ children }) {
  const [mode, setModeState] = useState(() => {
    try { return localStorage.getItem(STORAGE_KEY) || "light"; } catch { return "light"; }
  });

  const resolved = resolveMode(mode);

  const applyMode = useCallback((m) => {
    const r = resolveMode(m);
    const palette = buildPalette(r, THEME.colors);
    applyPalette(palette);
    document.documentElement.setAttribute("data-mode", r);
  }, []);

  // Apply on mount and whenever mode changes
  useEffect(() => { applyMode(mode); }, [mode, applyMode]);

  // Listen for OS preference changes when mode === "system"
  useEffect(() => {
    if (mode !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => applyMode("system");
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [mode, applyMode]);

  const setMode = useCallback((m) => {
    setModeState(m);
    try { localStorage.setItem(STORAGE_KEY, m); } catch {}
  }, []);

  return (
    <ColorModeContext.Provider value={{ mode, resolved, setMode }}>
      {children}
    </ColorModeContext.Provider>
  );
}

ColorModeProvider.propTypes = { children: PropTypes.node.isRequired };
