import { PAGINATION_DEFAULTS } from "../../shared/constants.js";

/**
 * Extracts and validates pagination / sorting / search params from req.query.
 *
 * @param {import('express').Request} req
 * @returns {{ page: number, limit: number, skip: number, sort: object, search: string }}
 *
 * @example
 * // GET /api/products?page=2&limit=12&sort=price&order=asc&search=shoes
 * const { page, limit, skip, sort, search } = getPaginationParams(req);
 * const products = await Product.find(query).sort(sort).skip(skip).limit(limit);
 */
export const getPaginationParams = (req) => {
  const page  = Math.max(1, parseInt(req.query.page,  10) || PAGINATION_DEFAULTS.PAGE);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || PAGINATION_DEFAULTS.LIMIT));
  const skip  = (page - 1) * limit;

  // Sort: ?sort=price&order=asc  →  { price: 1 }
  const sortField = req.query.sort  || "createdAt";
  const sortOrder = req.query.order === "asc" ? 1 : -1;
  const sort = { [sortField]: sortOrder };

  const search = (req.query.search || "").trim();

  return { page, limit, skip, sort, search };
};

/**
 * Builds the pagination metadata object for apiResponse.
 *
 * @param {number} total   - Total document count from DB
 * @param {number} page    - Current page
 * @param {number} limit   - Items per page
 * @returns {{ page: number, limit: number, total: number, pages: number }}
 */
export const buildPaginationMeta = (total, page, limit) => ({
  page,
  limit,
  total,
  pages: Math.ceil(total / limit),
});

/**
 * Builds a MongoDB case-insensitive text search condition across multiple fields.
 *
 * @param {string} search        - The search string from req.query
 * @param {string[]} fields      - Fields to search across
 * @returns {object}             - Mongoose $or / $regex query fragment, or {}
 *
 * @example
 * const textQuery = buildSearchQuery(search, ["name", "description", "tags"]);
 * const filter = { isActive: true, ...textQuery };
 */
export const buildSearchQuery = (search, fields = []) => {
  if (!search || !fields.length) return {};
  const regex = new RegExp(search, "i");
  return { $or: fields.map((f) => ({ [f]: regex })) };
};
