import Vendor from "../models/Vendor.model.js";
import User from "../models/User.model.js";
import Product from "../models/Product.model.js";
import Order from "../models/Order.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { apiResponse, createError } from "../utils/apiResponse.js";
import { getPaginationParams, buildPaginationMeta, buildSearchQuery } from "../utils/paginate.js";
import { ROLES, PAYMENT_STATUS } from "../../shared/constants.js";

/* ── GET /api/vendors ──────────────────────────────────────────────────────── */
export const getVendors = asyncHandler(async (req, res) => {
  const { page, limit, skip, search } = getPaginationParams(req);

  const filter = { isActive: true, isApproved: true };
  if (search) Object.assign(filter, buildSearchQuery(search, ["storeName", "description"]));

  const [vendors, total] = await Promise.all([
    Vendor.find(filter)
      .populate("user", "name email avatar")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Vendor.countDocuments(filter),
  ]);

  apiResponse(res, 200, vendors, "Vendors fetched", buildPaginationMeta(total, page, limit));
});

/* ── GET /api/vendors/:slug ────────────────────────────────────────────────── */
export const getVendorBySlug = asyncHandler(async (req, res) => {
  const vendor = await Vendor.findOne({
    storeSlug: req.params.slug,
    isActive:  true,
    isApproved: true,
  }).populate("user", "name avatar");

  if (!vendor) throw createError(404, "Vendor store not found");
  apiResponse(res, 200, vendor, "Vendor fetched");
});

/* ── POST /api/vendors/register ─────────────────────────────────────────────── */
export const registerVendor = asyncHandler(async (req, res) => {
  const { storeName, description, contactEmail, contactPhone, address } = req.body;

  // Check user doesn't already have a vendor profile
  const existing = await Vendor.findOne({ user: req.user._id });
  if (existing) throw createError(409, "You already have a vendor profile");

  const vendor = await Vendor.create({
    user: req.user._id,
    storeName,
    description,
    contactEmail: contactEmail || req.user.email,
    contactPhone,
    address,
  });

  // Update user role to vendor
  await User.findByIdAndUpdate(req.user._id, {
    role:   ROLES.VENDOR,
    vendor: vendor._id,
  });

  apiResponse(res, 201, vendor, "Vendor application submitted — pending admin approval");
});

/* ── PATCH /api/vendors/profile ─────────────────────────────────────────────── */
export const updateVendorProfile = asyncHandler(async (req, res) => {
  const vendor = req.vendor; // set by requireVendor middleware
  const { storeName, description, logo, banner, contactEmail, contactPhone, address } = req.body;

  if (storeName     !== undefined) vendor.storeName     = storeName;
  if (description   !== undefined) vendor.description   = description;
  if (logo          !== undefined) vendor.logo          = logo;
  if (banner        !== undefined) vendor.banner        = banner;
  if (contactEmail  !== undefined) vendor.contactEmail  = contactEmail;
  if (contactPhone  !== undefined) vendor.contactPhone  = contactPhone;
  if (address       !== undefined) vendor.address       = address;

  await vendor.save();
  apiResponse(res, 200, vendor, "Vendor profile updated");
});

/* ── GET /api/vendors/dashboard ─────────────────────────────────────────────── */
export const getVendorDashboard = asyncHandler(async (req, res) => {
  const vendorId = req.vendor._id;

  const [totalProducts, totalOrders, revenueResult, recentOrders] = await Promise.all([
    Product.countDocuments({ vendor: vendorId, isDeleted: false, isActive: true }),
    Order.countDocuments({ vendor: vendorId }),
    Order.aggregate([
      { $match: { vendor: vendorId, "payment.status": PAYMENT_STATUS.PAID } },
      { $group: { _id: null, total: { $sum: "$total" } } },
    ]),
    Order.find({ vendor: vendorId })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("user", "name email")
      .lean(),
  ]);

  apiResponse(res, 200, {
    totalProducts,
    totalOrders,
    totalRevenue: revenueResult[0]?.total ?? 0,
    recentOrders,
  }, "Vendor dashboard fetched");
});

/* ── GET /api/vendors/products ──────────────────────────────────────────────── */
export const getVendorProducts = asyncHandler(async (req, res) => {
  const { page, limit, skip, search } = getPaginationParams(req);
  const vendorId = req.vendor._id;

  const filter = { vendor: vendorId, isDeleted: false };
  if (search) Object.assign(filter, buildSearchQuery(search, ["name"]));

  const [products, total] = await Promise.all([
    Product.find(filter)
      .populate("category", "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Product.countDocuments(filter),
  ]);

  apiResponse(res, 200, products, "Vendor products fetched", buildPaginationMeta(total, page, limit));
});

/* ── Admin: GET /api/vendors/admin/all ──────────────────────────────────────── */
export const getAllVendorsAdmin = asyncHandler(async (req, res) => {
  const { page, limit, skip, search } = getPaginationParams(req);

  const filter = {};
  if (search) Object.assign(filter, buildSearchQuery(search, ["storeName"]));
  if (req.query.isApproved !== undefined) filter.isApproved = req.query.isApproved === "true";

  const [vendors, total] = await Promise.all([
    Vendor.find(filter)
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Vendor.countDocuments(filter),
  ]);

  apiResponse(res, 200, vendors, "All vendors fetched", buildPaginationMeta(total, page, limit));
});

/* ── Admin: PATCH /api/vendors/:id/approve ──────────────────────────────────── */
export const approveVendor = asyncHandler(async (req, res) => {
  const vendor = await Vendor.findById(req.params.id);
  if (!vendor) throw createError(404, "Vendor not found");

  vendor.isApproved = true;
  await vendor.save();

  apiResponse(res, 200, vendor, "Vendor approved");
});

/* ── Admin: PATCH /api/vendors/:id/suspend ──────────────────────────────────── */
export const suspendVendor = asyncHandler(async (req, res) => {
  const vendor = await Vendor.findById(req.params.id);
  if (!vendor) throw createError(404, "Vendor not found");

  vendor.isActive   = false;
  vendor.isApproved = false;
  await vendor.save();

  apiResponse(res, 200, null, "Vendor suspended");
});
