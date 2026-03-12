import mongoose from "mongoose";

const { Schema } = mongoose;

const vendorSchema = new Schema(
  {
    /** One-to-one link to the User with role === 'vendor' */
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Vendor must be linked to a user account"],
      unique: true,
    },

    storeName: {
      type: String,
      required: [true, "Store name is required"],
      trim: true,
      minlength: [3,   "Store name must be at least 3 characters"],
      maxlength: [100, "Store name cannot exceed 100 characters"],
    },

    storeSlug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },

    logo: {
      type: String,
      default: "",
    },

    banner: {
      type: String,
      default: "",
    },

    description: {
      type: String,
      trim: true,
      default: "",
      maxlength: [2000, "Description cannot exceed 2000 characters"],
    },

    /**
     * Admin must approve a vendor before they can list products.
     * Guards the vendor dashboard and product creation routes.
     */
    isApproved: {
      type: Boolean,
      default: false,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    /** Aggregate revenue — updated whenever an order is paid */
    totalRevenue: {
      type: Number,
      default: 0,
      min: 0,
    },

    /** Total orders fulfilled by this vendor */
    totalOrders: {
      type: Number,
      default: 0,
      min: 0,
    },

    /** Vendor's average rating, derived from their products' reviews */
    rating: {
      avg:   { type: Number, default: 0, min: 0, max: 5 },
      count: { type: Number, default: 0, min: 0 },
    },

    /** PayPal or Stripe Connect account ID for payouts */
    payoutAccountId: {
      type: String,
      default: null,
      select: false,
    },

    contactEmail: {
      type: String,
      trim: true,
      lowercase: true,
      default: "",
    },

    contactPhone: {
      type: String,
      trim: true,
      default: "",
    },

    address: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
    toJSON:  { virtuals: true },
    toObject: { virtuals: true },
  }
);

/* ── Indexes ───────────────────────────────────────────────────────────────── */
vendorSchema.index({ user: 1 },       { unique: true });
vendorSchema.index({ storeSlug: 1 },  { unique: true, sparse: true });
vendorSchema.index({ isApproved: 1 });
vendorSchema.index({ isActive: 1 });
vendorSchema.index({ createdAt: -1 });

/* ── Pre-save: auto-generate storeSlug ────────────────────────────────────── */
vendorSchema.pre("save", async function (next) {
  if (!this.isModified("storeName") && this.storeSlug) return next();

  const base = this.storeName
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

  const existing = await mongoose.models.Vendor.findOne({
    storeSlug: base,
    _id: { $ne: this._id },
  });

  this.storeSlug = existing ? `${base}-${this._id.toString().slice(-4)}` : base;
  next();
});

/* ── Virtual: product count ───────────────────────────────────────────────── */
vendorSchema.virtual("productCount", {
  ref:          "Product",
  localField:   "_id",
  foreignField: "vendor",
  count:        true,
});

const Vendor = mongoose.model("Vendor", vendorSchema);
export default Vendor;
