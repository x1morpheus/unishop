import { THEME } from "@/config/theme.config";

const DEFAULT_LOCALE = THEME.currency.locale; // reuse locale from theme

/**
 * Formats a date to a human-readable string.
 *
 * @param {string | Date} date
 * @param {"short" | "medium" | "long" | "relative"} [style="medium"]
 * @returns {string}
 *
 * @example
 * formatDate("2024-03-15")           // "Mar 15, 2024"
 * formatDate("2024-03-15", "short")  // "3/15/2024"
 * formatDate("2024-03-15", "long")   // "March 15, 2024"
 * formatDate("2024-03-15", "relative") // "2 days ago"
 */
export function formatDate(date, style = "medium") {
  if (!date) return "—";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "Invalid date";

  if (style === "relative") return formatRelative(d);

  const options = {
    short:  { month: "numeric",  day: "numeric",  year: "numeric" },
    medium: { month: "short",    day: "numeric",  year: "numeric" },
    long:   { month: "long",     day: "numeric",  year: "numeric" },
  };

  return new Intl.DateTimeFormat(DEFAULT_LOCALE, options[style] ?? options.medium).format(d);
}

/**
 * Formats a date + time.
 *
 * @param {string | Date} date
 * @returns {string} e.g. "Mar 15, 2024, 3:42 PM"
 */
export function formatDateTime(date) {
  if (!date) return "—";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "Invalid date";

  return new Intl.DateTimeFormat(DEFAULT_LOCALE, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(d);
}

/**
 * Returns a relative time string.
 *
 * @param {Date} date
 * @returns {string} e.g. "2 days ago", "just now"
 */
function formatRelative(date) {
  const rtf = new Intl.RelativeTimeFormat(DEFAULT_LOCALE, { numeric: "auto" });
  const diffMs = date.getTime() - Date.now();
  const diffSec = Math.round(diffMs / 1000);
  const diffMin = Math.round(diffSec / 60);
  const diffHr  = Math.round(diffMin / 60);
  const diffDay = Math.round(diffHr / 24);
  const diffWk  = Math.round(diffDay / 7);
  const diffMo  = Math.round(diffDay / 30);
  const diffYr  = Math.round(diffDay / 365);

  if (Math.abs(diffSec) < 60)  return rtf.format(diffSec, "second");
  if (Math.abs(diffMin) < 60)  return rtf.format(diffMin, "minute");
  if (Math.abs(diffHr)  < 24)  return rtf.format(diffHr,  "hour");
  if (Math.abs(diffDay) < 7)   return rtf.format(diffDay, "day");
  if (Math.abs(diffWk)  < 5)   return rtf.format(diffWk,  "week");
  if (Math.abs(diffMo)  < 12)  return rtf.format(diffMo,  "month");
  return rtf.format(diffYr, "year");
}
