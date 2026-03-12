import Order from "../models/Order.model.js";
import Product from "../models/Product.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { apiResponse, createError } from "../utils/apiResponse.js";
import { getPaginationParams, buildPaginationMeta } from "../utils/paginate.js";
import { sendOrderConfirmation, sendOrderStatusUpdate } from "../utils/sendEmail.js";
import {
  ORDER_STATUS,
  ORDER_STATUS_TRANSITIONS,
  PAYMENT_STATUS,
  ROLES,
} from "../../shared/constants.js";

/* ── POST /api/orders ──────────────────────────────────────────────────────── */
export const createOrder = asyncHandler(async (req, res) => {
  const { items, shippingAddress, payment } = req.body;

  if (!items?.length) throw createError(400, "Order must contain at least one item");
  if (!shippingAddress)  throw createError(400, "Shipping address is required");
  if (!payment?.method)  throw createError(400, "Payment method is required");

  // Validate items and fetch live prices (never trust client prices)
  const resolvedItems = await Promise.all(
    items.map(async (item) => {
      const product = await Product.findById(item.product);
      if (!product || !product.isActive) {
        throw createError(400, `Product "${item.product}" is unavailable`);
      }
      if (product.stock < item.qty) {
        throw createError(400, `Insufficient stock for "${product.name}"`);
      }
      return {
        product:  product._id,
        name:     product.name,
        image:    product.images[0] || "",
        price:    product.price,
        qty:      item.qty,
        variant:  item.variant || "",
      };
    })
  );

  const subtotal = resolvedItems.reduce((sum, i) => sum + i.price * i.qty, 0);
  const shipping = subtotal >= 50 ? 0 : 9.99;   // free shipping over $50
  const tax      = +(subtotal * 0.1).toFixed(2); // 10% tax flat
  const total    = +(subtotal + shipping + tax).toFixed(2);

  // Determine initial payment status
  const paymentStatus =
    payment.method === "cod" ? PAYMENT_STATUS.PENDING : PAYMENT_STATUS.PENDING;

  const order = await Order.create({
    user:            req.user._id,
    items:           resolvedItems,
    shippingAddress,
    payment: {
      method:   payment.method,
      status:   paymentStatus,
      stripeId: payment.stripeId || null,
      paypalId: payment.paypalId || null,
    },
    subtotal: +subtotal.toFixed(2),
    shipping,
    tax,
    total,
  });

  // Decrement stock for each item
  await Promise.all(
    resolvedItems.map((item) =>
      Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.qty } })
    )
  );

  // Fire-and-forget confirmation email
  sendOrderConfirmation(req.user.email, {
    orderNumber: order.orderNumber,
    total:       `$${total.toFixed(2)}`,
    items:       resolvedItems.map((i) => ({ name: i.name, qty: i.qty, price: `$${i.price}` })),
  }).catch(() => {});

  await order.populate("items.product", "name images slug");
  apiResponse(res, 201, order, "Order placed successfully");
});

/* ── GET /api/orders (customer: own orders / admin: all orders) ────────────── */
export const getOrders = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPaginationParams(req);

  const filter =
    req.user.role === ROLES.ADMIN ? {} : { user: req.user._id };

  if (req.query.status) filter.orderStatus = req.query.status;

  const [orders, total] = await Promise.all([
    Order.find(filter)
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Order.countDocuments(filter),
  ]);

  apiResponse(res, 200, orders, "Orders fetched", buildPaginationMeta(total, page, limit));
});

/* ── GET /api/orders/:id ───────────────────────────────────────────────────── */
export const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate("user",           "name email")
    .populate("items.product",  "name images slug");

  if (!order) throw createError(404, "Order not found");

  // Customers can only see their own orders
  if (
    req.user.role !== ROLES.ADMIN &&
    order.user._id.toString() !== req.user._id.toString()
  ) {
    throw createError(403, "Not authorised to view this order");
  }

  apiResponse(res, 200, order, "Order fetched");
});

/* ── PATCH /api/orders/:id/status (admin only) ─────────────────────────────── */
export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!status) throw createError(400, "Status is required");

  const order = await Order.findById(req.params.id).populate("user", "email name");
  if (!order) throw createError(404, "Order not found");

  const allowed = ORDER_STATUS_TRANSITIONS[order.orderStatus];
  if (!allowed.includes(status)) {
    throw createError(
      400,
      `Cannot transition from "${order.orderStatus}" to "${status}". Allowed: ${allowed.join(", ") || "none"}`
    );
  }

  order.orderStatus = status;

  if (status === ORDER_STATUS.DELIVERED) {
    order.deliveredAt = new Date();
    order.payment.status  = PAYMENT_STATUS.PAID;
    order.payment.paidAt  = new Date();
  }

  await order.save();

  // Notify customer of status change
  sendOrderStatusUpdate(order.user.email, {
    orderNumber: order.orderNumber,
    status,
  }).catch(() => {});

  apiResponse(res, 200, order, `Order status updated to "${status}"`);
});

/* ── PATCH /api/orders/:id/pay — mark payment confirmed (Stripe/PayPal webhook) */
export const markOrderPaid = asyncHandler(async (req, res) => {
  const { stripeId, paypalId } = req.body;

  const order = await Order.findById(req.params.id);
  if (!order) throw createError(404, "Order not found");

  order.payment.status  = PAYMENT_STATUS.PAID;
  order.payment.paidAt  = new Date();
  if (stripeId) order.payment.stripeId = stripeId;
  if (paypalId) order.payment.paypalId = paypalId;

  if (order.orderStatus === ORDER_STATUS.PENDING) {
    order.orderStatus = ORDER_STATUS.CONFIRMED;
  }

  await order.save();
  apiResponse(res, 200, order, "Payment confirmed");
});

/* ── DELETE /api/orders/:id/cancel (customer self-cancel pending orders) ────── */
export const cancelOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) throw createError(404, "Order not found");

  if (
    req.user.role !== ROLES.ADMIN &&
    order.user.toString() !== req.user._id.toString()
  ) {
    throw createError(403, "Not authorised to cancel this order");
  }

  const allowed = ORDER_STATUS_TRANSITIONS[order.orderStatus];
  if (!allowed.includes(ORDER_STATUS.CANCELLED)) {
    throw createError(400, `Order cannot be cancelled at status "${order.orderStatus}"`);
  }

  // Restore stock
  await Promise.all(
    order.items.map((item) =>
      Product.findByIdAndUpdate(item.product, { $inc: { stock: item.qty } })
    )
  );

  order.orderStatus = ORDER_STATUS.CANCELLED;
  await order.save();

  apiResponse(res, 200, null, "Order cancelled");
});
