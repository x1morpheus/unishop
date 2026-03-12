import { Router } from "express";
import { uploadImage, uploadImages, deleteImage } from "../controllers/upload.controller.js";
import { verifyToken } from "../middleware/auth.middleware.js";
import { requireAdmin } from "../middleware/admin.middleware.js";
import { uploadSingle, uploadMultiple } from "../middleware/upload.middleware.js";
import { uploadLimiter } from "../middleware/rateLimiter.middleware.js";

const router = Router();

// All upload routes require authentication + rate limit
router.use(verifyToken, uploadLimiter);

router.post("/image",    uploadSingle,   uploadImage);
router.post("/images",   uploadMultiple, uploadImages);
router.delete("/:filename", requireAdmin, deleteImage);

export default router;
