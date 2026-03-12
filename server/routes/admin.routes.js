import { Router } from "express";
import {
  getUsers, getUserById, updateUser, deleteUser,
  getAdminProducts,
  getAdminOrders,
  getAdminCategories, createCategory, updateCategory, deleteCategory,
} from "../controllers/admin.controller.js";
import {
  getOverview, getRevenueChart, getOrdersByStatus,
  getTopProducts, getTrafficChart, getRevenueByCategory,
} from "../controllers/analytics.controller.js";
import { verifyToken } from "../middleware/auth.middleware.js";
import { requireAdmin } from "../middleware/admin.middleware.js";

const router = Router();

// All admin routes require auth + admin role
router.use(verifyToken, requireAdmin);

// Users
router.get("/users",        getUsers);
router.get("/users/:id",    getUserById);
router.patch("/users/:id",  updateUser);
router.delete("/users/:id", deleteUser);

// Products (read — writes go through /api/products)
router.get("/products", getAdminProducts);

// Orders (read — status updates go through /api/orders)
router.get("/orders", getAdminOrders);

// Categories
router.get("/categories",        getAdminCategories);
router.post("/categories",       createCategory);
router.put("/categories/:id",    updateCategory);
router.delete("/categories/:id", deleteCategory);

// Analytics
router.get("/analytics/overview",             getOverview);
router.get("/analytics/revenue",              getRevenueChart);
router.get("/analytics/orders-by-status",     getOrdersByStatus);
router.get("/analytics/top-products",         getTopProducts);
router.get("/analytics/traffic",              getTrafficChart);
router.get("/analytics/revenue-by-category",  getRevenueByCategory);

export default router;
