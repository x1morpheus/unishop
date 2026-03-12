import { Router } from "express";
import {
  createOrder, getOrders, getOrderById,
  updateOrderStatus, markOrderPaid, cancelOrder,
} from "../controllers/order.controller.js";
import { verifyToken } from "../middleware/auth.middleware.js";
import { requireAdmin } from "../middleware/admin.middleware.js";

const router = Router();

// All order routes require authentication
router.use(verifyToken);

router.post("/",               createOrder);
router.get("/",                getOrders);
router.get("/:id",             getOrderById);
router.delete("/:id/cancel",   cancelOrder);

// Admin only
router.patch("/:id/status",    requireAdmin, updateOrderStatus);
router.patch("/:id/pay",       requireAdmin, markOrderPaid);

export default router;
