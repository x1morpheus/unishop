/**
 * asyncHandler — wraps an async Express controller function.
 *
 * Catches any rejected promise or thrown error and forwards it to
 * Express's next(err) pipeline, which routes to error.middleware.js.
 * Controllers never need try/catch blocks.
 *
 * @param {(req: import('express').Request, res: import('express').Response, next: import('express').NextFunction) => Promise<void>} fn
 * @returns {import('express').RequestHandler}
 *
 * @example
 * export const getProducts = asyncHandler(async (req, res) => {
 *   const products = await Product.find();
 *   apiResponse(res, 200, products);
 * });
 */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
