import Order from "../models/Order.model.js";
import Product from "../models/Product.model.js";
import User from "../models/User.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { apiResponse } from "../utils/apiResponse.js";
import { PAYMENT_STATUS, ORDER_STATUS } from "../../shared/constants.js";

/* ── GET /api/admin/analytics/overview ─────────────────────────────────────── */
export const getOverview = asyncHandler(async (_req, res) => {
  const [
    totalRevenue,
    totalOrders,
    totalProducts,
    totalCustomers,
    pendingOrders,
    recentOrders,
  ] = await Promise.all([
    // Sum of all paid orders
    Order.aggregate([
      { $match: { "payment.status": PAYMENT_STATUS.PAID } },
      { $group: { _id: null, total: { $sum: "$total" } } },
    ]),
    Order.countDocuments(),
    Product.countDocuments({ isDeleted: false, isActive: true }),
    User.countDocuments({ role: "customer" }),
    Order.countDocuments({ orderStatus: ORDER_STATUS.PENDING }),
    Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("user", "name email")
      .lean(),
  ]);

  apiResponse(res, 200, {
    totalRevenue:   totalRevenue[0]?.total ?? 0,
    totalOrders,
    totalProducts,
    totalCustomers,
    pendingOrders,
    recentOrders,
  }, "Overview fetched");
});

/* ── GET /api/admin/analytics/revenue?period=30 ─────────────────────────────── */
export const getRevenueChart = asyncHandler(async (req, res) => {
  const days = Math.min(365, Math.max(7, parseInt(req.query.period, 10) || 30));
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const data = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: since },
        "payment.status": PAYMENT_STATUS.PAID,
      },
    },
    {
      $group: {
        _id: {
          year:  { $year:  "$createdAt" },
          month: { $month: "$createdAt" },
          day:   { $dayOfMonth: "$createdAt" },
        },
        revenue: { $sum: "$total" },
        orders:  { $sum: 1 },
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
    {
      $project: {
        _id: 0,
        date: {
          $dateToString: {
            format: "%Y-%m-%d",
            date: {
              $dateFromParts: {
                year: "$_id.year", month: "$_id.month", day: "$_id.day",
              },
            },
          },
        },
        revenue: { $round: ["$revenue", 2] },
        orders: 1,
      },
    },
  ]);

  apiResponse(res, 200, data, "Revenue chart fetched");
});

/* ── GET /api/admin/analytics/orders-by-status ──────────────────────────────── */
export const getOrdersByStatus = asyncHandler(async (_req, res) => {
  const data = await Order.aggregate([
    { $group: { _id: "$orderStatus", count: { $sum: 1 } } },
    { $project: { _id: 0, status: "$_id", count: 1 } },
    { $sort: { count: -1 } },
  ]);

  apiResponse(res, 200, data, "Orders by status fetched");
});

/* ── GET /api/admin/analytics/top-products?limit=5 ─────────────────────────── */
export const getTopProducts = asyncHandler(async (req, res) => {
  const limit = Math.min(20, parseInt(req.query.limit, 10) || 5);

  const data = await Order.aggregate([
    { $match: { "payment.status": PAYMENT_STATUS.PAID } },
    { $unwind: "$items" },
    {
      $group: {
        _id:      "$items.product",
        name:     { $first: "$items.name" },
        image:    { $first: "$items.image" },
        revenue:  { $sum: { $multiply: ["$items.price", "$items.qty"] } },
        unitsSold: { $sum: "$items.qty" },
        orders:   { $sum: 1 },
      },
    },
    { $sort: { revenue: -1 } },
    { $limit: limit },
    {
      $project: {
        _id: 1,
        name: 1,
        image: 1,
        revenue: { $round: ["$revenue", 2] },
        unitsSold: 1,
        orders: 1,
      },
    },
  ]);

  apiResponse(res, 200, data, "Top products fetched");
});

/* ── GET /api/admin/analytics/traffic?period=30 ─────────────────────────────── */
export const getTrafficChart = asyncHandler(async (req, res) => {
  // Proxied via new user registrations as a traffic signal
  const days = Math.min(365, Math.max(7, parseInt(req.query.period, 10) || 30));
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const data = await User.aggregate([
    { $match: { createdAt: { $gte: since } } },
    {
      $group: {
        _id: {
          year:  { $year:  "$createdAt" },
          month: { $month: "$createdAt" },
          day:   { $dayOfMonth: "$createdAt" },
        },
        newUsers: { $sum: 1 },
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
    {
      $project: {
        _id: 0,
        date: {
          $dateToString: {
            format: "%Y-%m-%d",
            date: {
              $dateFromParts: {
                year: "$_id.year", month: "$_id.month", day: "$_id.day",
              },
            },
          },
        },
        newUsers: 1,
      },
    },
  ]);

  apiResponse(res, 200, data, "Traffic chart fetched");
});

/* ── GET /api/admin/analytics/revenue-by-category ───────────────────────────── */
export const getRevenueByCategory = asyncHandler(async (_req, res) => {
  const data = await Order.aggregate([
    { $match: { "payment.status": PAYMENT_STATUS.PAID } },
    { $unwind: "$items" },
    {
      $lookup: {
        from:         "products",
        localField:   "items.product",
        foreignField: "_id",
        as:           "productData",
      },
    },
    { $unwind: { path: "$productData", preserveNullAndEmpty: true } },
    {
      $lookup: {
        from:         "categories",
        localField:   "productData.category",
        foreignField: "_id",
        as:           "categoryData",
      },
    },
    { $unwind: { path: "$categoryData", preserveNullAndEmpty: true } },
    {
      $group: {
        _id:      "$categoryData._id",
        name:     { $first: "$categoryData.name" },
        revenue:  { $sum: { $multiply: ["$items.price", "$items.qty"] } },
        orders:   { $sum: 1 },
      },
    },
    { $sort: { revenue: -1 } },
    {
      $project: {
        _id: 1,
        name: { $ifNull: ["$name", "Uncategorised"] },
        revenue: { $round: ["$revenue", 2] },
        orders: 1,
      },
    },
  ]);

  apiResponse(res, 200, data, "Revenue by category fetched");
});
