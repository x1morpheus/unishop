import User from "../models/User.model.js";
import Order from "../models/Order.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { apiResponse, createError } from "../utils/apiResponse.js";
import { getPaginationParams, buildPaginationMeta } from "../utils/paginate.js";

/* ── GET /api/users/profile ────────────────────────────────────────────────── */
export const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
    .populate("wishlist", "name price images slug ratings")
    .populate("vendor",   "storeName storeSlug isApproved");
  if (!user) throw createError(404, "User not found");
  apiResponse(res, 200, user, "Profile fetched");
});

/* ── PATCH /api/users/profile ──────────────────────────────────────────────── */
export const updateProfile = asyncHandler(async (req, res) => {
  const { name, phone, avatar } = req.body;

  const user = await User.findById(req.user._id);
  if (!user) throw createError(404, "User not found");

  if (name)   user.name   = name.trim();
  if (phone !== undefined) user.phone  = phone.trim();
  if (avatar !== undefined) user.avatar = avatar;

  await user.save({ validateBeforeSave: true });
  apiResponse(res, 200, user, "Profile updated");
});

/* ── GET /api/users/orders ─────────────────────────────────────────────────── */
export const getMyOrders = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPaginationParams(req);

  const filter = { user: req.user._id };
  if (req.query.status) filter.orderStatus = req.query.status;

  const [orders, total] = await Promise.all([
    Order.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Order.countDocuments(filter),
  ]);

  apiResponse(res, 200, orders, "Orders fetched", buildPaginationMeta(total, page, limit));
});

/* ── GET /api/users/wishlist ───────────────────────────────────────────────── */
export const getWishlist = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate(
    "wishlist",
    "name price comparePrice images slug ratings stock isActive"
  );
  if (!user) throw createError(404, "User not found");

  // Filter out deleted/inactive products
  const wishlist = user.wishlist.filter((p) => p.isActive);
  apiResponse(res, 200, wishlist, "Wishlist fetched");
});

/* ── POST /api/users/wishlist/:productId ───────────────────────────────────── */
export const toggleWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  const user = await User.findById(req.user._id);
  if (!user) throw createError(404, "User not found");

  const idx = user.wishlist.findIndex((id) => id.toString() === productId);

  let message;
  if (idx > -1) {
    user.wishlist.splice(idx, 1);
    message = "Removed from wishlist";
  } else {
    user.wishlist.push(productId);
    message = "Added to wishlist";
  }

  await user.save({ validateBeforeSave: false });
  apiResponse(res, 200, { wishlist: user.wishlist }, message);
});

/* ── POST /api/users/addresses ─────────────────────────────────────────────── */
export const addAddress = asyncHandler(async (req, res) => {
  const { name, address, city, zip, country, phone, isDefault } = req.body;

  const user = await User.findById(req.user._id);
  if (!user) throw createError(404, "User not found");

  if (user.addresses.length >= 5) {
    throw createError(400, "Maximum 5 addresses allowed");
  }

  // If new address is default, unset all others
  if (isDefault) {
    user.addresses.forEach((a) => { a.isDefault = false; });
  }

  user.addresses.push({ name, address, city, zip, country, phone, isDefault: !!isDefault });
  await user.save({ validateBeforeSave: false });
  apiResponse(res, 201, user.addresses, "Address added");
});

/* ── PUT /api/users/addresses/:addressId ───────────────────────────────────── */
export const updateAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) throw createError(404, "User not found");

  const addr = user.addresses.id(req.params.addressId);
  if (!addr) throw createError(404, "Address not found");

  const { name, address, city, zip, country, phone, isDefault } = req.body;

  if (isDefault) {
    user.addresses.forEach((a) => { a.isDefault = false; });
  }

  if (name)    addr.name    = name;
  if (address) addr.address = address;
  if (city)    addr.city    = city;
  if (zip)     addr.zip     = zip;
  if (country) addr.country = country;
  if (phone !== undefined) addr.phone = phone;
  if (isDefault !== undefined) addr.isDefault = isDefault;

  await user.save({ validateBeforeSave: false });
  apiResponse(res, 200, user.addresses, "Address updated");
});

/* ── DELETE /api/users/addresses/:addressId ─────────────────────────────────── */
export const deleteAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) throw createError(404, "User not found");

  const addr = user.addresses.id(req.params.addressId);
  if (!addr) throw createError(404, "Address not found");

  addr.deleteOne();
  await user.save({ validateBeforeSave: false });
  apiResponse(res, 200, user.addresses, "Address removed");
});
