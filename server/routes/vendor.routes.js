import { Router } from "express";
import {
  getVendors, getVendorBySlug, registerVendor,
  updateVendorProfile, getVendorDashboard, getVendorProducts,
  getAllVendorsAdmin, approveVendor, suspendVendor,
} from "../controllers/vendor.controller.js";
import { verifyToken } from "../middleware/auth.middleware.js";
import { requireAdmin } from "../middleware/admin.middleware.js";
import { requireVendor, requireMultiVendorMode } from "../middleware/vendor.middleware.js";

const router = Router();

// All vendor routes: must be in multi-vendor mode
router.use(requireMultiVendorMode);

// Public store directory
router.get("/",          getVendors);
router.get("/:slug",     getVendorBySlug);

// Authenticated: apply to become a vendor
router.post("/register", verifyToken, registerVendor);

// Vendor-only routes (approved vendors)
router.get("/dashboard",  verifyToken, requireVendor, getVendorDashboard);
router.get("/products",   verifyToken, requireVendor, getVendorProducts);
router.patch("/profile",  verifyToken, requireVendor, updateVendorProfile);

// Admin-only vendor management
router.get("/admin/all",           verifyToken, requireAdmin, getAllVendorsAdmin);
router.patch("/:id/approve",       verifyToken, requireAdmin, approveVendor);
router.patch("/:id/suspend",       verifyToken, requireAdmin, suspendVendor);

export default router;
