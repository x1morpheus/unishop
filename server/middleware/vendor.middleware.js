import { createError } from "../utils/apiResponse.js";
import { ROLES } from "../../shared/constants.js";
import Vendor from "../models/Vendor.model.js";

/**
 * requireVendor — ensures:
 * 1. STORE_MODE env var is set to "multi" (returns 403 in single-vendor mode)
 * 2. Authenticated user has the vendor role
 * 3. Vendor profile exists and is approved by admin
 *
 * Attaches the full Vendor document to req.vendor for downstream use.
 * Must be used AFTER verifyToken middleware.
 *
 * @example
 * router.post("/products", verifyToken, requireVendor, createVendorProduct);
 */
export const requireVendor = async (req, _res, next) => {
  // Guard: vendor features are disabled in single-vendor mode
  if (process.env.STORE_MODE !== "multi") {
    return next(createError(403, "Vendor features are disabled in single-store mode"));
  }

  if (!req.user) return next(createError(401, "Not authenticated"));

  if (req.user.role !== ROLES.VENDOR && req.user.role !== ROLES.ADMIN) {
    return next(createError(403, "Vendor access required"));
  }

  // Admins bypass vendor approval check
  if (req.user.role === ROLES.ADMIN) return next();

  const vendor = await Vendor.findOne({ user: req.user._id });

  if (!vendor) {
    return next(createError(404, "Vendor profile not found"));
  }

  if (!vendor.isApproved) {
    return next(createError(403, "Your vendor account is pending admin approval"));
  }

  if (!vendor.isActive) {
    return next(createError(403, "Your vendor account has been deactivated"));
  }

  req.vendor = vendor;
  next();
};

/**
 * requireMultiVendorMode — lightweight guard used on vendor-only routes
 * that don't need the full vendor profile (e.g. GET /vendors list).
 */
export const requireMultiVendorMode = (_req, _res, next) => {
  if (process.env.STORE_MODE !== "multi") {
    return next(createError(403, "This feature requires multi-vendor mode"));
  }
  next();
};
