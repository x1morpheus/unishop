import { createError } from "../utils/apiResponse.js";
import { ROLES } from "../../shared/constants.js";

/**
 * requireAdmin — ensures the authenticated user has the admin role.
 * Must be used AFTER verifyToken middleware.
 *
 * @example
 * router.get("/stats", verifyToken, requireAdmin, getStats);
 */
export const requireAdmin = (req, _res, next) => {
  if (!req.user) return next(createError(401, "Not authenticated"));
  if (req.user.role !== ROLES.ADMIN) {
    return next(createError(403, "Admin access required"));
  }
  next();
};
