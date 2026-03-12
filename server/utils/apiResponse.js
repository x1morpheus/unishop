/**
 * apiResponse — standardises every HTTP response in the application.
 *
 * Shape:
 *   { success: boolean, message: string, data: any, pagination?: object }
 *
 * @param {import('express').Response} res
 * @param {number} statusCode  - HTTP status code
 * @param {*} [data]           - Response payload (null for errors)
 * @param {string} [message]   - Human-readable message
 * @param {object} [pagination] - Optional pagination metadata
 *
 * @example
 * // Success
 * apiResponse(res, 200, products, "Products fetched", { page:1, limit:12, total:80, pages:7 });
 *
 * // Created
 * apiResponse(res, 201, newUser, "Account created");
 *
 * // No content (delete)
 * apiResponse(res, 200, null, "Product deleted");
 */
export const apiResponse = (res, statusCode, data = null, message = "", pagination = null) => {
  const success = statusCode >= 200 && statusCode < 300;

  const body = { success, message, data };
  if (pagination) body.pagination = pagination;

  return res.status(statusCode).json(body);
};

/**
 * Creates a standardised API error object.
 * Throw this inside a controller — asyncHandler + error.middleware will catch it.
 *
 * @param {number} statusCode
 * @param {string} message
 * @returns {Error}
 *
 * @example
 * throw createError(404, "Product not found");
 */
export const createError = (statusCode, message) => {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
};
