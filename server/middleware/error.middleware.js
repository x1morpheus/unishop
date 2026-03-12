/**
 * error.middleware.js — Central error handler.
 *
 * All errors thrown in controllers (via asyncHandler) reach here.
 * Never write try/catch in controllers — throw instead.
 *
 * Error shape expected:
 *   err.statusCode  — HTTP status (default 500)
 *   err.message     — Human-readable message
 *   err.errors      — Optional array for validation errors
 */

/**
 * @param {Error} err
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} _next
 */
export const errorHandler = (err, req, res, _next) => {
  let statusCode = err.statusCode || 500;
  let message    = err.message    || "Internal Server Error";
  let errors     = err.errors     || null;

  // ── Mongoose validation error ───────────────────────────────────────────
  if (err.name === "ValidationError") {
    statusCode = 422;
    message    = "Validation failed";
    errors = Object.values(err.errors).map((e) => ({
      field:   e.path,
      message: e.message,
    }));
  }

  // ── Mongoose duplicate key (unique index violation) ─────────────────────
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0] || "field";
    message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`;
  }

  // ── Mongoose cast error (invalid ObjectId) ──────────────────────────────
  if (err.name === "CastError") {
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  }

  // ── JWT errors ──────────────────────────────────────────────────────────
  if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid token";
  }

  if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Token expired";
  }

  // ── Multer file size error ──────────────────────────────────────────────
  if (err.code === "LIMIT_FILE_SIZE") {
    statusCode = 413;
    message = "File too large";
  }

  const body = {
    success: false,
    message,
    data: null,
    ...(errors && { errors }),
    // Stack trace only in development
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  };

  res.status(statusCode).json(body);
};

/**
 * 404 handler — mount AFTER all routes.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
    data: null,
  });
};
