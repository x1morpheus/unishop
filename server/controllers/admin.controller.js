import User from "../models/User.model.js";
import Product from "../models/Product.model.js";
import Order from "../models/Order.model.js";
import Category from "../models/Category.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { apiResponse, createError } from "../utils/apiResponse.js";
import { getPaginationParams, buildPaginationMeta, buildSearchQuery } from "../utils/paginate.js";
import { ROLES_LIST } from "../../shared/constants.js";

/* ── GET /api/admin/users ──────────────────────────────────────────────────── */
export const getUsers = asyncHandler(async (req, res) => {
  const { page, limit, skip, search } = getPaginationParams(req);

  const filter = {};
  if (search) Object.assign(filter, buildSearchQuery(search, ["name", "email"]));
  if (req.query.role && ROLES_LIST.includes(req.query.role)) filter.role = req.query.role;
  if (req.query.isActive !== undefined) filter.isActive = req.query.isActive === "true";

  const [users, total] = await Promise.all([
    User.find(filter)
      .select("-password -refreshToken")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    User.countDocuments(filter),
  ]);

  apiResponse(res, 200, users, "Users fetched", buildPaginationMeta(total, page, limit));
});

/* ── GET /api/admin/users/:id ──────────────────────────────────────────────── */
export const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)
    .select("-password -refreshToken")
    .populate("vendor", "storeName isApproved");
  if (!user) throw createError(404, "User not found");
  apiResponse(res, 200, user, "User fetched");
});

/* ── PATCH /api/admin/users/:id ────────────────────────────────────────────── */
export const updateUser = asyncHandler(async (req, res) => {
  const { isActive, role } = req.body;

  const user = await User.findById(req.params.id);
  if (!user) throw createError(404, "User not found");

  // Prevent admin from deactivating themselves
  if (req.user._id.toString() === user._id.toString() && isActive === false) {
    throw createError(400, "You cannot deactivate your own account");
  }

  if (isActive !== undefined) user.isActive = Boolean(isActive);
  if (role && ROLES_LIST.includes(role)) user.role = role;

  await user.save({ validateBeforeSave: false });
  apiResponse(res, 200, user, "User updated");
});

/* ── DELETE /api/admin/users/:id ───────────────────────────────────────────── */
export const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw createError(404, "User not found");

  if (req.user._id.toString() === user._id.toString()) {
    throw createError(400, "You cannot delete your own account");
  }

  // Soft-delete: deactivate rather than purge (preserves order history)
  user.isActive = false;
  await user.save({ validateBeforeSave: false });
  apiResponse(res, 200, null, "User deactivated");
});

/* ── GET /api/admin/products ───────────────────────────────────────────────── */
export const getAdminProducts = asyncHandler(async (req, res) => {
  const { page, limit, skip, search } = getPaginationParams(req);

  const filter = { isDeleted: false };
  if (search) Object.assign(filter, buildSearchQuery(search, ["name", "description"]));
  if (req.query.category) filter.category = req.query.category;
  if (req.query.isActive !== undefined) filter.isActive = req.query.isActive === "true";

  const [products, total] = await Promise.all([
    Product.find(filter)
      .populate("category", "name")
      .populate("vendor",   "storeName")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Product.countDocuments(filter),
  ]);

  apiResponse(res, 200, products, "Products fetched", buildPaginationMeta(total, page, limit));
});

/* ── GET /api/admin/orders ─────────────────────────────────────────────────── */
export const getAdminOrders = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPaginationParams(req);

  const filter = {};
  if (req.query.status) filter.orderStatus = req.query.status;
  if (req.query.payment) filter["payment.status"] = req.query.payment;

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

/* ── GET /api/admin/categories ─────────────────────────────────────────────── */
export const getAdminCategories = asyncHandler(async (_req, res) => {
  const categories = await Category.find().sort({ sortOrder: 1, name: 1 }).lean();
  apiResponse(res, 200, categories, "Categories fetched");
});

/* ── POST /api/admin/categories ────────────────────────────────────────────── */
export const createCategory = asyncHandler(async (req, res) => {
  const { name, description, image, parent, sortOrder } = req.body;
  const category = await Category.create({ name, description, image, parent, sortOrder });
  apiResponse(res, 201, category, "Category created");
});

/* ── PUT /api/admin/categories/:id ─────────────────────────────────────────── */
export const updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) throw createError(404, "Category not found");

  const { name, description, image, isActive, sortOrder } = req.body;
  if (name !== undefined)        category.name        = name;
  if (description !== undefined) category.description = description;
  if (image !== undefined)       category.image       = image;
  if (isActive !== undefined)    category.isActive    = Boolean(isActive);
  if (sortOrder !== undefined)   category.sortOrder   = Number(sortOrder);

  await category.save();
  apiResponse(res, 200, category, "Category updated");
});

/* ── DELETE /api/admin/categories/:id ──────────────────────────────────────── */
export const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) throw createError(404, "Category not found");

  const productCount = await Product.countDocuments({ category: category._id, isDeleted: false });
  if (productCount > 0) {
    throw createError(400, `Cannot delete — ${productCount} product(s) are in this category`);
  }

  await category.deleteOne();
  apiResponse(res, 200, null, "Category deleted");
});
