import { Router } from "express";
import {
  getProducts, getCategories, getProductBySlug,
  getProductReviews, createReview, deleteReview,
  createProduct, updateProduct, deleteProduct, getFlashSaleProducts,
} from "../controllers/product.controller.js";
import { verifyToken, optionalAuth } from "../middleware/auth.middleware.js";
import { requireAdmin } from "../middleware/admin.middleware.js";

const router = Router();

// Public / optional-auth
router.get("/",              optionalAuth, getProducts);
router.get("/categories",    getCategories);
router.get("/flash-sales",   getFlashSaleProducts);   // must be before /:slug
router.get("/:slug",         optionalAuth, getProductBySlug);
router.get("/:id/reviews",   getProductReviews);

// Authenticated customers
router.post("/:id/reviews",                    verifyToken, createReview);
router.delete("/:productId/reviews/:reviewId", verifyToken, deleteReview);

// Admin only
router.post("/",   verifyToken, requireAdmin, createProduct);
router.put("/:id", verifyToken, requireAdmin, updateProduct);
router.delete("/:id", verifyToken, requireAdmin, deleteProduct);

export default router;
