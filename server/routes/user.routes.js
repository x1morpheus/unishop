import { Router } from "express";
import {
  getProfile, updateProfile, getMyOrders,
  getWishlist, toggleWishlist,
  addAddress, updateAddress, deleteAddress,
} from "../controllers/user.controller.js";
import { verifyToken } from "../middleware/auth.middleware.js";

const router = Router();

// All user routes require authentication
router.use(verifyToken);

router.get("/profile",    getProfile);
router.patch("/profile",  updateProfile);
router.get("/orders",     getMyOrders);

router.get("/wishlist",                  getWishlist);
router.post("/wishlist/:productId",      toggleWishlist);

router.post("/addresses",                addAddress);
router.put("/addresses/:addressId",      updateAddress);
router.delete("/addresses/:addressId",   deleteAddress);

export default router;
