/**
 * theme.config.js — SINGLE SOURCE OF TRUTH
 *
 * To launch a new store, edit ONLY this file.
 * Every color, font, currency, brand string, payment method,
 * social links, and hero background is read from here.
 */

export const THEME = {
  brand: {
    name:         "UniShop",
    tagline:      "Everything you need.",
    logo:         "/logo.svg",
    favicon:      "/favicon.ico",
    supportEmail: "support@unishop.com",
    address:      "123 Commerce Street, San Francisco, CA 94102",
    phone:        "+1 (555) 000-0000",
  },

  /**
   * Social media links shown in the footer.
   * Set a value to "" or remove it to hide that platform.
   */
  social: {
    facebook:  "https://facebook.com",
    instagram: "https://instagram.com",
    twitter:   "https://twitter.com",
    youtube:   "",
    tiktok:    "",
    pinterest: "",
    linkedin:  "",
  },

  /**
   * Switch between 'single' and 'multi' to enable/disable vendor features.
   * Also set STORE_MODE in server/.env to match.
   * @type {"single" | "multi"}
   */
  storeMode: "single",

  colors: {
    primary:     "#6C63FF",
    primaryDark: "#574fd6",
    primaryLight:"#EEF2FF",
    secondary:   "#FF6584",
    accent:      "#43E97B",
    background:  "#F9FAFB",
    surface:     "#FFFFFF",
    text:        "#1A1A2E",
    textMuted:   "#6B7280",
    border:      "#E5E7EB",
    error:       "#EF4444",
    success:     "#10B981",
    warning:     "#F59E0B",
    adminBg:     "#0F172A",
    adminSurface:"#1E293B",
    adminText:   "#F1F5F9",
  },

  fonts: {
    heading: "'DM Sans', sans-serif",
    body:    "'DM Sans', sans-serif",
  },

  borderRadius: "0.75rem",

  currency: {
    symbol: "$",
    code:   "USD",
    locale: "en-US",
  },

  hero: {
    headline:    "Shop Everything.",
    subheadline: "The universal store for modern buyers.",
    ctaText:     "Shop Now",
    /**
     * Background options — only ONE should be active at a time.
     *
     * Option A — solid/gradient color (default):
     *   bgColor: "#6C63FF"        (bgImage should be "" or omitted)
     *
     * Option B — background image:
     *   bgImage: "/hero-bg.jpg"   (bgColor is used as the overlay tint)
     *   bgOverlay: "rgba(0,0,0,0.45)"  (optional, defaults to a dark overlay)
     *   bgPosition: "center"           (optional CSS background-position)
     */
    bgColor:    "#6C63FF",
    bgImage:    "",          // e.g. "/hero-bg.jpg" or a full https:// URL
    bgOverlay:  "rgba(0,0,0,0.40)",
    bgPosition: "center",
  },

  payments: {
    stripe: true,
    paypal: true,
    cod:    true,
  },
};
