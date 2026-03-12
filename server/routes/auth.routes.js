import { Router } from "express";
import {
  register,
  login,
  refresh,
  logout,
  getMe,
  changePassword,
} from "../controllers/auth.controller.js";
import { verifyToken } from "../middleware/auth.middleware.js";
import { authLimiter } from "../middleware/rateLimiter.middleware.js";

const router = Router();

/**
 * Public — rate-limited
 * POST /api/auth/register  → create account, accessToken + refresh cookie
 * POST /api/auth/login     → verify credentials, accessToken + refresh cookie
 * POST /api/auth/refresh   → read httpOnly cookie, issue new accessToken
 * POST /api/auth/logout    → clear cookie + invalidate stored token
 */
router.post("/register", authLimiter, register);
router.post("/login",    authLimiter, login);
router.post("/refresh",  refresh);
router.post("/logout",   logout);

/**
 * Protected — valid Bearer accessToken required
 * GET   /api/auth/me                → current user profile
 * PATCH /api/auth/change-password   → update password, invalidate all sessions
 */
router.get("/me",                verifyToken, getMe);
router.patch("/change-password", verifyToken, changePassword);

export default router;
