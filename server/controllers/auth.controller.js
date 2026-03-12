import User from "../models/User.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { apiResponse, createError } from "../utils/apiResponse.js";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  refreshCookieOptions,
} from "../utils/generateTokens.js";
import { sendWelcomeEmail } from "../utils/sendEmail.js";
import { ROLES } from "../../shared/constants.js";

/* ── Helpers ───────────────────────────────────────────────────────────────── */

/**
 * Builds the safe user payload returned to the client.
 * Never exposes password, refreshToken, or __v.
 */
const sanitizeUser = (user) => ({
  _id:       user._id,
  name:      user.name,
  email:     user.email,
  role:      user.role,
  avatar:    user.avatar,
  phone:     user.phone,
  addresses: user.addresses,
  wishlist:  user.wishlist,
  vendor:    user.vendor,
  createdAt: user.createdAt,
});

/**
 * Issues both tokens, stores refresh token hash on user doc, sets cookie.
 */
const issueTokens = async (user, res) => {
  const accessToken  = generateAccessToken({ id: user._id, role: user.role });
  const refreshToken = generateRefreshToken({ id: user._id });

  // Persist refresh token on the user document for rotation validation
  user.refreshToken = refreshToken;
  user.lastLogin    = new Date();
  await user.save({ validateBeforeSave: false });

  // httpOnly cookie — JS cannot read this
  res.cookie("refreshToken", refreshToken, refreshCookieOptions());

  return accessToken;
};

/* ── POST /api/auth/register ───────────────────────────────────────────────── */
export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    throw createError(400, "Name, email and password are required");
  }

  const exists = await User.findOne({ email: email.toLowerCase() });
  if (exists) throw createError(409, "An account with that email already exists");

  const user = await User.create({ name, email, password, role: ROLES.CUSTOMER });

  // Fire-and-forget welcome email — don't block registration if it fails
  sendWelcomeEmail(user.email, user.name).catch(() => {});

  const accessToken = await issueTokens(user, res);

  apiResponse(res, 201, { user: sanitizeUser(user), accessToken }, "Account created successfully");
});

/* ── POST /api/auth/login ──────────────────────────────────────────────────── */
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw createError(400, "Email and password are required");
  }

  // Select password back in (excluded by default)
  const user = await User.findByEmailWithPassword(email);
  if (!user) throw createError(401, "Invalid email or password");

  const isMatch = await user.comparePassword(password);
  if (!isMatch) throw createError(401, "Invalid email or password");

  if (!user.isActive) throw createError(403, "Your account has been deactivated");

  const accessToken = await issueTokens(user, res);

  apiResponse(res, 200, { user: sanitizeUser(user), accessToken }, "Login successful");
});

/* ── POST /api/auth/refresh ────────────────────────────────────────────────── */
export const refresh = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken;

  if (!token) throw createError(401, "No refresh token");

  let decoded;
  try {
    decoded = verifyRefreshToken(token);
  } catch {
    throw createError(401, "Invalid or expired refresh token");
  }

  // Load user with stored refresh token for rotation validation
  const user = await User.findById(decoded.id).select("+refreshToken");
  if (!user || user.refreshToken !== token) {
    // Token reuse detected — clear cookie and force re-login
    res.clearCookie("refreshToken", refreshCookieOptions(true));
    throw createError(401, "Refresh token reuse detected — please log in again");
  }

  if (!user.isActive) throw createError(403, "Account is deactivated");

  const accessToken = await issueTokens(user, res);

  apiResponse(res, 200, { accessToken }, "Token refreshed");
});

/* ── POST /api/auth/logout ─────────────────────────────────────────────────── */
export const logout = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken;

  if (token) {
    // Clear stored token on user doc (invalidates future refresh attempts)
    await User.findOneAndUpdate(
      { refreshToken: token },
      { $set: { refreshToken: null } }
    );
  }

  res.clearCookie("refreshToken", refreshCookieOptions(true));
  apiResponse(res, 200, null, "Logged out successfully");
});

/* ── GET /api/auth/me ──────────────────────────────────────────────────────── */
export const getMe = asyncHandler(async (req, res) => {
  // req.user is already populated by verifyToken middleware
  const user = await User.findById(req.user._id).populate("wishlist", "name price images slug");
  if (!user) throw createError(404, "User not found");
  apiResponse(res, 200, sanitizeUser(user), "User fetched");
});

/* ── PATCH /api/auth/change-password ──────────────────────────────────────── */
export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    throw createError(400, "Current and new passwords are required");
  }

  if (newPassword.length < 8) {
    throw createError(400, "New password must be at least 8 characters");
  }

  const user = await User.findById(req.user._id).select("+password");
  if (!user) throw createError(404, "User not found");

  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) throw createError(401, "Current password is incorrect");

  user.password = newPassword; // pre-save hook hashes it
  // Invalidate all existing sessions by rotating the refresh token
  user.refreshToken = null;
  await user.save();

  res.clearCookie("refreshToken", refreshCookieOptions(true));
  apiResponse(res, 200, null, "Password changed — please log in again");
});
