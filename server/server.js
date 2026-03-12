/**
 * server.js — UniShop Express API Server
 *
 * Startup order:
 * 1. Load env vars (dotenv)
 * 2. Connect to MongoDB
 * 3. Configure Express middleware
 * 4. Mount all API routes
 * 5. 404 + central error handler
 * 6. Listen
 */

import "dotenv/config";
import "express-async-errors"; // patches Express to forward async errors to next()
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";

import { connectDB }        from "./config/db.js";
import { generalLimiter }   from "./middleware/rateLimiter.middleware.js";
import { errorHandler, notFoundHandler } from "./middleware/error.middleware.js";

// ── Route imports (controllers + models added in Steps 4-6) ────────────────
// Routes are stubbed here; each file will be populated in Step 5 & 6.
// Importing them now ensures server.js doesn't need to change later.
import authRoutes    from "./routes/auth.routes.js";
import productRoutes from "./routes/product.routes.js";
import orderRoutes   from "./routes/order.routes.js";
import userRoutes    from "./routes/user.routes.js";
import adminRoutes   from "./routes/admin.routes.js";
import uploadRoutes  from "./routes/upload.routes.js";
import paymentRoutes from "./routes/payment.routes.js";
import vendorRoutes  from "./routes/vendor.routes.js";

// ── Constants ───────────────────────────────────────────────────────────────
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT      = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

// ── App ─────────────────────────────────────────────────────────────────────
const app = express();

// ── Security & logging ───────────────────────────────────────────────────────
app.use(cors({
  origin:      CLIENT_URL,
  credentials: true,              // allow cookies (refresh token)
  methods:     ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
app.use(generalLimiter);

// ── Body parsers ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

// ── Static uploads ───────────────────────────────────────────────────────────
// Serve uploaded images at /uploads/filename.jpg
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ── Health check ─────────────────────────────────────────────────────────────
app.get("/api/health", (_req, res) => {
  res.json({
    success:   true,
    message:   "UniShop API is running",
    storeMode: process.env.STORE_MODE || "single",
    env:       process.env.NODE_ENV   || "development",
    timestamp: new Date().toISOString(),
  });
});

// ── API routes ───────────────────────────────────────────────────────────────
app.use("/api/auth",     authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders",   orderRoutes);
app.use("/api/users",    userRoutes);
app.use("/api/admin",    adminRoutes);
app.use("/api/upload",   uploadRoutes);
app.use("/api/payment",  paymentRoutes);
app.use("/api/vendors",  vendorRoutes);

// ── 404 + Error handler (must be last) ───────────────────────────────────────
app.use(notFoundHandler);
app.use(errorHandler);

// ── Boot ─────────────────────────────────────────────────────────────────────
const start = async () => {
  await connectDB();
  app.listen(PORT, () => {
    process.stdout.write(`UniShop server running on port ${PORT} [${process.env.NODE_ENV || "development"}]\n`);
    process.stdout.write(`Store mode: ${process.env.STORE_MODE || "single"}\n`);
  });
};

start();

export default app;
