import rateLimit from "express-rate-limit";

/**
 * General API rate limiter — applied globally.
 * 200 requests per IP per 15 minutes.
 */
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests, please try again later.",
    data: null,
  },
  skip: (req) => process.env.NODE_ENV === "test",
});

/**
 * Strict auth rate limiter — applied to /api/auth/login and /api/auth/register.
 * 10 attempts per IP per 15 minutes to slow brute-force attacks.
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many authentication attempts, please try again in 15 minutes.",
    data: null,
  },
  skip: (req) => process.env.NODE_ENV === "test",
});

/**
 * Upload rate limiter — applied to /api/upload routes.
 * 30 uploads per IP per hour.
 */
export const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Upload limit reached, please try again later.",
    data: null,
  },
  skip: (req) => process.env.NODE_ENV === "test",
});
