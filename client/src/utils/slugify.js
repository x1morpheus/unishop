/**
 * Converts a string into a URL-safe slug.
 *
 * @param {string} str
 * @returns {string}
 *
 * @example
 * slugify("Hello World!")         // "hello-world"
 * slugify("DM Sans  — Bold 700")  // "dm-sans-bold-700"
 */
export function slugify(str) {
  if (!str) return "";
  return str
    .toString()
    .toLowerCase()
    .normalize("NFD")                        // decompose accented chars
    .replace(/[\u0300-\u036f]/g, "")         // strip accent marks
    .replace(/[^a-z0-9\s-]/g, "")           // remove non-alphanumeric
    .trim()
    .replace(/\s+/g, "-")                    // spaces → hyphens
    .replace(/-+/g, "-");                    // collapse multiple hyphens
}

/**
 * Converts a slug back to a readable title.
 *
 * @param {string} slug
 * @returns {string}
 *
 * @example
 * deslugify("hello-world") // "Hello World"
 */
export function deslugify(slug) {
  if (!slug) return "";
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
