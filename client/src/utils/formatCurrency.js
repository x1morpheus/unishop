import { THEME } from "@/config/theme.config";

/**
 * Formats a number as currency using the locale and code from THEME.currency.
 * No hardcoded symbols or locales anywhere else in the codebase.
 *
 * @param {number} amount - The numeric amount to format
 * @param {object} [overrides] - Optional overrides for currency options
 * @param {string} [overrides.locale] - e.g. "en-US"
 * @param {string} [overrides.code]   - e.g. "USD"
 * @returns {string} Formatted currency string e.g. "$1,234.99"
 *
 * @example
 * formatCurrency(1234.5)         // "$1,234.50"
 * formatCurrency(0)              // "$0.00"
 * formatCurrency(99.9, { code: "EUR", locale: "de-DE" }) // "99,90 €"
 */
export function formatCurrency(amount, overrides = {}) {
  const locale = overrides.locale ?? THEME.currency.locale;
  const currency = overrides.code ?? THEME.currency.code;

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount ?? 0);
}

/**
 * Returns just the currency symbol from THEME (e.g. "$").
 * Use when you need the symbol without formatting a number.
 *
 * @returns {string}
 */
export function getCurrencySymbol() {
  return THEME.currency.symbol;
}

/**
 * Formats a discount percentage.
 *
 * @param {number} original - Original price
 * @param {number} sale     - Sale price
 * @returns {string} e.g. "20% off"
 */
export function formatDiscount(original, sale) {
  if (!original || !sale || sale >= original) return "";
  const pct = Math.round(((original - sale) / original) * 100);
  return `${pct}% off`;
}
