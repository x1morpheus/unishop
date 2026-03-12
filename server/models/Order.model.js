import mongoose from "mongoose";
import {
  ORDER_STATUS,
  ORDER_STATUS_LIST,
  PAYMENT_METHODS_LIST,
  PAYMENT_STATUS,
  PAYMENT_STATUS_LIST,
} from "../../shared/constants.js";

const { Schema } = mongoose;

/* ── Order item sub-schema ─────────────────────────────────────────────────── */
const orderItemSchema = new Schema(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    /** Snapshot fields — preserved even if the product is later edited/deleted */
    name:  { type: String, required: true },
    image: { type: String, default: "" },
    price: { type: Number, required: true, min: 0 },
    qty:   { type: Number, required: true, min: 1, validate: { validator: Number.isInteger } },
    /** Variant snapshot, if applicable */
    variant: { type: String, default: "" },
  },
  { _id: true }
);

/* ── Shipping address sub-schema ───────────────────────────────────────────── */
const shippingAddressSchema = new Schema(
  {
    name:    { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    city:    { type: String, required: true, trim: true },
    zip:     { type: String, required: true, trim: true },
    country: { type: String, required: true, trim: true },
    phone:   { type: String, trim: true, default: "" },
  },
  { _id: false }
);

/* ── Payment sub-schema ────────────────────────────────────────────────────── */
const paymentSchema = new Schema(
  {
    method: {
      type: String,
      enum: { values: PAYMENT_METHODS_LIST, message: "{VALUE} is not a valid payment method" },
      required: true,
    },
    status: {
      type: String,
      enum: { values: PAYMENT_STATUS_LIST, message: "{VALUE} is not a valid payment status" },
      default: PAYMENT_STATUS.PENDING,
    },
    /** Stripe PaymentIntent ID */
    stripeId: { type: String, default: null },
    /** PayPal order/capture ID */
    paypalId:  { type: String, default: null },
    /** Timestamp when payment was confirmed */
    paidAt: { type: Date, default: null },
  },
  { _id: false }
);

/* ── Order schema ──────────────────────────────────────────────────────────── */
const orderSchema = new Schema(
  {
    /** Auto-generated human-readable order number e.g. ORD-20240315-4X7K */
    orderNumber: {
      type: String,
      unique: true,
    },

    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Order must belong to a user"],
    },

    items: {
      type: [orderItemSchema],
      validate: {
        validator: (arr) => arr.length > 0,
        message: "Order must have at least one item",
      },
    },

    shippingAddress: {
      type: shippingAddressSchema,
      required: true,
    },

    payment: {
      type: paymentSchema,
      required: true,
    },

    orderStatus: {
      type: String,
      enum: { values: ORDER_STATUS_LIST, message: "{VALUE} is not a valid order status" },
      default: ORDER_STATUS.PENDING,
    },

    subtotal: { type: Number, required: true, min: 0 },
    shipping: { type: Number, default: 0,     min: 0 },
    tax:      { type: Number, default: 0,     min: 0 },
    total:    { type: Number, required: true, min: 0 },

    /** Fulfilled by a specific vendor — only set in multi-vendor mode */
    vendor: {
      type: Schema.Types.ObjectId,
      ref: "Vendor",
      default: null,
    },

    /** Internal notes (admin only) */
    notes: {
      type: String,
      default: "",
      maxlength: 1000,
    },

    /** Timestamp when order was delivered */
    deliveredAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON:  { virtuals: true },
    toObject: { virtuals: true },
  }
);

/* ── Indexes ───────────────────────────────────────────────────────────────── */
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ orderStatus: 1 });
orderSchema.index({ "payment.status": 1 });
orderSchema.index({ orderNumber: 1 }, { unique: true });
orderSchema.index({ vendor: 1 });
orderSchema.index({ createdAt: -1 });

/* ── Pre-save: generate order number ──────────────────────────────────────── */
orderSchema.pre("save", function (next) {
  if (this.isNew && !this.orderNumber) {
    const date   = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    this.orderNumber = `ORD-${date}-${random}`;
  }
  next();
});

/* ── Virtual: item count ──────────────────────────────────────────────────── */
orderSchema.virtual("itemCount").get(function () {
  return this.items.reduce((sum, item) => sum + item.qty, 0);
});

/* ── Virtual: is paid ─────────────────────────────────────────────────────── */
orderSchema.virtual("isPaid").get(function () {
  return this.payment?.status === "paid";
});

const Order = mongoose.model("Order", orderSchema);
export default Order;
