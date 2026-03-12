import Product from "../models/Product.model.js";
import Category from "../models/Category.model.js";
import Review from "../models/Review.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { apiResponse, createError } from "../utils/apiResponse.js";
import {
  getPaginationParams,
  buildPaginationMeta,
  buildSearchQuery,
} from "../utils/paginate.js";
import { ROLES } from "../../shared/constants.js";

/* ── GET /api/products ─────────────────────────────────────────────────────── */
export const getProducts = asyncHandler(async (req, res) => {
  const { page, limit, skip, sort, search } = getPaginationParams(req);

  // Build filter
  const filter = { isActive: true, isDeleted: false };

  if (search) {
    const textQuery = buildSearchQuery(search, ["name", "description", "tags"]);
    Object.assign(filter, textQuery);
  }

  if (req.query.category) filter.category = req.query.category;
  if (req.query.vendor)   filter.vendor   = req.query.vendor;
  if (req.query.featured === "true") filter.isFeatured = true;

  if (req.query.minPrice || req.query.maxPrice) {
    filter.price = {};
    if (req.query.minPrice) filter.price.$gte = Number(req.query.minPrice);
    if (req.query.maxPrice) filter.price.$lte = Number(req.query.maxPrice);
  }

  if (req.query.inStock === "true") filter.stock = { $gt: 0 };

  if (req.query.flashSale === "true") {
    const now = new Date();
    filter["flashSale.isActive"]  = true;
    filter["flashSale.salePrice"] = { $ne: null };
    filter.$or = [
      { "flashSale.endsAt": null },
      { "flashSale.endsAt": { $gt: now } },
    ];
  }

  // Resolve sort
  const sortMap = {
    price_asc:  { price: 1 },
    price_desc: { price: -1 },
    newest:     { createdAt: -1 },
    rating:     { "ratings.avg": -1 },
    name_asc:   { name: 1 },
  };
  const resolvedSort = sortMap[req.query.sort] || { createdAt: -1 };

  const [products, total] = await Promise.all([
    Product.find(filter)
      .populate("category", "name slug")
      .populate("vendor", "storeName storeSlug logo")
      .sort(resolvedSort)
      .skip(skip)
      .limit(limit)
      .lean(),
    Product.countDocuments(filter),
  ]);

  apiResponse(
    res, 200, products, "Products fetched",
    buildPaginationMeta(total, page, limit)
  );
});

/* ── GET /api/products/categories ─────────────────────────────────────────── */
export const getCategories = asyncHandler(async (_req, res) => {
  const categories = await Category.find({ isActive: true })
    .sort({ sortOrder: 1, name: 1 })
    .lean();
  apiResponse(res, 200, categories, "Categories fetched");
});

/* ── GET /api/products/:slug ───────────────────────────────────────────────── */
export const getProductBySlug = asyncHandler(async (req, res) => {
  const product = await Product.findOne({
    slug: req.params.slug,
    isActive: true,
    isDeleted: false,
  })
    .populate("category", "name slug")
    .populate("vendor",   "storeName storeSlug logo description");

  if (!product) throw createError(404, "Product not found");
  apiResponse(res, 200, product, "Product fetched");
});

/* ── GET /api/products/:id/reviews ────────────────────────────────────────── */
export const getProductReviews = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPaginationParams(req);

  const filter = { product: req.params.id, isVisible: true };

  const [reviews, total] = await Promise.all([
    Review.find(filter)
      .populate("user", "name avatar")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Review.countDocuments(filter),
  ]);

  apiResponse(res, 200, reviews, "Reviews fetched", buildPaginationMeta(total, page, limit));
});

/* ── POST /api/products/:id/reviews ───────────────────────────────────────── */
export const createReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;
  const productId = req.params.id;

  const product = await Product.findById(productId);
  if (!product) throw createError(404, "Product not found");

  const existing = await Review.findOne({ product: productId, user: req.user._id });
  if (existing) throw createError(409, "You have already reviewed this product");

  const review = await Review.create({
    product:    productId,
    user:       req.user._id,
    userName:   req.user.name,
    userAvatar: req.user.avatar,
    rating:     Number(rating),
    comment,
  });

  apiResponse(res, 201, review, "Review submitted");
});

/* ── DELETE /api/products/:productId/reviews/:reviewId ────────────────────── */
export const deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.reviewId);
  if (!review) throw createError(404, "Review not found");

  // Only the author or an admin can delete
  const isAuthor = review.user.toString() === req.user._id.toString();
  const isAdmin  = req.user.role === ROLES.ADMIN;
  if (!isAuthor && !isAdmin) throw createError(403, "Not authorised to delete this review");

  await review.deleteOne();
  apiResponse(res, 200, null, "Review deleted");
});

/* ── Admin: POST /api/products ─────────────────────────────────────────────── */
export const createProduct = asyncHandler(async (req, res) => {
  const { name, description, price, comparePrice, stock, category, tags, isActive, isFeatured } = req.body;

  const cat = await Category.findById(category);
  if (!cat) throw createError(404, "Category not found");

  // In multi-vendor mode, vendor field comes from req.vendor (set by requireVendor middleware)
  // In single mode it stays null
  const vendorId = req.vendor?._id ?? req.body.vendor ?? null;

  const product = await Product.create({
    name,
    description,
    price:        Number(price),
    comparePrice: comparePrice ? Number(comparePrice) : null,
    stock:        Number(stock) || 0,
    category,
    vendor:       vendorId,
    tags:         tags ? tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
    isActive:     isActive !== undefined ? Boolean(isActive) : true,
    isFeatured:   isFeatured !== undefined ? Boolean(isFeatured) : false,
    images:       req.body.images || [],
    flashSale:    req.body.flashSale || undefined,
    badge:        req.body.badge || "",
  });

  await product.populate("category", "name slug");
  apiResponse(res, 201, product, "Product created");
});

/* ── Admin: PUT /api/products/:id ──────────────────────────────────────────── */
export const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ _id: req.params.id, isDeleted: false });
  if (!product) throw createError(404, "Product not found");

  // Vendor can only update their own products
  if (req.user.role === ROLES.VENDOR) {
    if (!product.vendor || product.vendor.toString() !== req.vendor?._id.toString()) {
      throw createError(403, "You can only edit your own products");
    }
  }

  const allowedFields = [
    "name","description","price","comparePrice","stock",
    "category","tags","isActive","isFeatured","images","variants",
    "flashSale","badge",
  ];

  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      if (field === "tags" && typeof req.body.tags === "string") {
        product.tags = req.body.tags.split(",").map((t) => t.trim()).filter(Boolean);
      } else {
        product[field] = req.body[field];
      }
    }
  });

  await product.save();
  await product.populate("category", "name slug");
  apiResponse(res, 200, product, "Product updated");
});

/* ── Admin: DELETE /api/products/:id ───────────────────────────────────────── */
export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ _id: req.params.id, isDeleted: false });
  if (!product) throw createError(404, "Product not found");

  // Soft delete — preserves order history
  product.isDeleted = true;
  product.isActive  = false;
  await product.save();

  apiResponse(res, 200, null, "Product deleted");
});

/* ── GET /api/products/flash-sales ─────────────────────────────────────────── */
export const getFlashSaleProducts = asyncHandler(async (req, res) => {
  const limit = Math.min(20, parseInt(req.query.limit, 10) || 8);
  const now   = new Date();

  const filter = {
    isActive:           true,
    isDeleted:          false,
    "flashSale.isActive": true,
    "flashSale.salePrice": { $ne: null },
    $or: [
      { "flashSale.endsAt": null },
      { "flashSale.endsAt": { $gt: now } },
    ],
  };

  const products = await Product.find(filter)
    .populate("category", "name slug")
    .sort({ "flashSale.endsAt": 1, createdAt: -1 }) // soonest-ending first
    .limit(limit)
    .lean();

  apiResponse(res, 200, products, "Flash sale products fetched");
});

