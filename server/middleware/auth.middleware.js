import { verifyAccessToken } from "../utils/generateTokens.js";
import { createError } from "../utils/apiResponse.js";
import User from "../models/User.model.js";

/**
 * verifyToken — protects any route that requires authentication.
 *
 * Reads the Bearer token from the Authorization header.
 * Decodes it, loads the full user from DB, and attaches to req.user.
 * On 401 the client api.js interceptor silently calls /auth/refresh and retries.
 */
export const verifyToken = async (req, _res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(createError(401, "No token provided"));
  }

  const token = authHeader.split(" ")[1];

  let decoded;
  try {
    decoded = verifyAccessToken(token);
  } catch {
    return next(createError(401, "Invalid or expired token"));
  }

  const user = await User.findById(decoded.id).select("-password -refreshToken");

  if (!user) return next(createError(401, "User not found"));
  if (!user.isActive) return next(createError(403, "Account is deactivated"));

  req.user = user;
  next();
};

/**
 * requireRole — role-based access guard.
 * Must be used AFTER verifyToken.
 *
 * @param {...string} roles - Allowed roles e.g. requireRole("admin") or requireRole("admin","vendor")
 * @returns {import('express').RequestHandler}
 *
 * @example
 * router.delete("/:id", verifyToken, requireRole("admin"), deleteProduct);
 */
export const requireRole = (...roles) =>
  (req, _res, next) => {
    if (!req.user) return next(createError(401, "Not authenticated"));
    if (!roles.includes(req.user.role)) {
      return next(createError(403, `Access denied — requires role: ${roles.join(" or ")}`));
    }
    next();
  };

/**
 * optionalAuth — attaches req.user if a valid token is present,
 * but never blocks the request if it's missing.
 * Used on routes like GET /products where guests can browse.
 */
export const optionalAuth = async (req, _res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) return next();

  const token = authHeader.split(" ")[1];
  try {
    const decoded = verifyAccessToken(token);
    const user = await User.findById(decoded.id).select("-password -refreshToken");
    if (user?.isActive) req.user = user;
  } catch {
    // Silently ignore invalid tokens on optional routes
  }
  next();
};
