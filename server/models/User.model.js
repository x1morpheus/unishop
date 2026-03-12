import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { ROLES, ROLES_LIST } from "../../shared/constants.js";

const { Schema } = mongoose;

/* ── Address sub-schema ────────────────────────────────────────────────────── */
const addressSchema = new Schema(
  {
    name:    { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    city:    { type: String, required: true, trim: true },
    zip:     { type: String, required: true, trim: true },
    country: { type: String, required: true, trim: true },
    phone:   { type: String, trim: true, default: "" },
    isDefault: { type: Boolean, default: false },
  },
  { _id: true }
);

/* ── User schema ───────────────────────────────────────────────────────────── */
const userSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [80, "Name cannot exceed 80 characters"],
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"],
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
      select: false, // never returned in queries by default
    },

    role: {
      type: String,
      enum: { values: ROLES_LIST, message: "{VALUE} is not a valid role" },
      default: ROLES.CUSTOMER,
    },

    avatar: {
      type: String,
      default: "",
    },

    phone: {
      type: String,
      trim: true,
      default: "",
    },

    addresses: [addressSchema],

    wishlist: [
      {
        type: Schema.Types.ObjectId,
        ref: "Product",
      },
    ],

    /** Reference to vendor profile — only set when role === 'vendor' */
    vendor: {
      type: Schema.Types.ObjectId,
      ref: "Vendor",
      default: null,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    /** Refresh token stored server-side for rotation validation */
    refreshToken: {
      type: String,
      select: false,
      default: null,
    },

    lastLogin: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true, // createdAt, updatedAt
    toJSON:  { virtuals: true },
    toObject: { virtuals: true },
  }
);

/* ── Indexes ───────────────────────────────────────────────────────────────── */
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ createdAt: -1 });

/* ── Pre-save: hash password ───────────────────────────────────────────────── */
userSchema.pre("save", async function (next) {
  // Only hash if password field was modified
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

/* ── Instance method: compare password ────────────────────────────────────── */
/**
 * @param {string} candidatePassword - Plain text password from login form
 * @returns {Promise<boolean>}
 */
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

/* ── Virtual: full address count ───────────────────────────────────────────── */
userSchema.virtual("addressCount").get(function () {
  return this.addresses?.length ?? 0;
});

/* ── Static: find active by email (includes password) ─────────────────────── */
userSchema.statics.findByEmailWithPassword = function (email) {
  return this.findOne({ email: email.toLowerCase(), isActive: true }).select(
    "+password +refreshToken"
  );
};

const User = mongoose.model("User", userSchema);
export default User;
