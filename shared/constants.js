/**
 * @fileoverview Shared constants used by both client and server.
 * Import from this file — never redefine these values elsewhere.
 */

export const ORDER_STATUS = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  PROCESSING: "processing",
  SHIPPED: "shipped",
  DELIVERED: "delivered",
  CANCELLED: "cancelled",
  REFUNDED: "refunded",
};

export const ORDER_STATUS_LIST = Object.values(ORDER_STATUS);

/** Human-readable labels for each status */
export const ORDER_STATUS_LABELS = {
  [ORDER_STATUS.PENDING]: "Pending",
  [ORDER_STATUS.CONFIRMED]: "Confirmed",
  [ORDER_STATUS.PROCESSING]: "Processing",
  [ORDER_STATUS.SHIPPED]: "Shipped",
  [ORDER_STATUS.DELIVERED]: "Delivered",
  [ORDER_STATUS.CANCELLED]: "Cancelled",
  [ORDER_STATUS.REFUNDED]: "Refunded",
};

/** Allowed next statuses for each current status (admin flow) */
export const ORDER_STATUS_TRANSITIONS = {
  [ORDER_STATUS.PENDING]: [ORDER_STATUS.CONFIRMED, ORDER_STATUS.CANCELLED],
  [ORDER_STATUS.CONFIRMED]: [ORDER_STATUS.PROCESSING, ORDER_STATUS.CANCELLED],
  [ORDER_STATUS.PROCESSING]: [ORDER_STATUS.SHIPPED, ORDER_STATUS.CANCELLED],
  [ORDER_STATUS.SHIPPED]: [ORDER_STATUS.DELIVERED],
  [ORDER_STATUS.DELIVERED]: [ORDER_STATUS.REFUNDED],
  [ORDER_STATUS.CANCELLED]: [],
  [ORDER_STATUS.REFUNDED]: [],
};

// ─────────────────────────────────────────────────────────────
export const ROLES = {
  ADMIN: "admin",
  VENDOR: "vendor",
  CUSTOMER: "customer",
};

export const ROLES_LIST = Object.values(ROLES);

// ─────────────────────────────────────────────────────────────
export const PAYMENT_METHODS = {
  STRIPE: "stripe",
  PAYPAL: "paypal",
  COD: "cod",
};

export const PAYMENT_METHODS_LIST = Object.values(PAYMENT_METHODS);

export const PAYMENT_METHOD_LABELS = {
  [PAYMENT_METHODS.STRIPE]: "Credit / Debit Card",
  [PAYMENT_METHODS.PAYPAL]: "PayPal",
  [PAYMENT_METHODS.COD]: "Cash on Delivery",
};

// ─────────────────────────────────────────────────────────────
export const PAYMENT_STATUS = {
  PENDING: "pending",
  PAID: "paid",
  FAILED: "failed",
  REFUNDED: "refunded",
};

export const PAYMENT_STATUS_LIST = Object.values(PAYMENT_STATUS);

// ─────────────────────────────────────────────────────────────
export const STORE_MODES = {
  SINGLE: "single",
  MULTI: "multi",
};

export const STORE_MODES_LIST = Object.values(STORE_MODES);

// ─────────────────────────────────────────────────────────────
export const SORT_OPTIONS = {
  PRICE_ASC: "price_asc",
  PRICE_DESC: "price_desc",
  NEWEST: "newest",
  RATING: "rating",
  NAME_ASC: "name_asc",
};

export const SORT_LABELS = {
  [SORT_OPTIONS.PRICE_ASC]: "Price: Low to High",
  [SORT_OPTIONS.PRICE_DESC]: "Price: High to Low",
  [SORT_OPTIONS.NEWEST]: "Newest First",
  [SORT_OPTIONS.RATING]: "Highest Rated",
  [SORT_OPTIONS.NAME_ASC]: "Name A–Z",
};

// ─────────────────────────────────────────────────────────────
/** Default pagination values */
export const PAGINATION_DEFAULTS = {
  PAGE: 1,
  LIMIT: 12,
};

// ─────────────────────────────────────────────────────────────
/** Max file upload size in bytes (5 MB) */
export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
