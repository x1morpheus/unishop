import mongoose from "mongoose";

const { Schema } = mongoose;

/* ── Variant sub-schema (size, color, etc.) ────────────────────────────────── */
const variantSchema = new Schema(
  {
    name:  { type: String, required: true, trim: true }, // e.g. "Size", "Color"
    value: { type: String, required: true, trim: true }, // e.g. "XL", "Red"
    stock: { type: Number, default: 0, min: 0 },
    priceModifier: { type: Number, default: 0 },         // added to base price
  },
  { _id: true }
);

/* ── Product schema ────────────────────────────────────────────────────────── */
const productSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      minlength: [3,   "Name must be at least 3 characters"],
      maxlength: [200, "Name cannot exceed 200 characters"],
    },

    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },

    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      minlength: [10,   "Description must be at least 10 characters"],
      maxlength: [5000, "Description cannot exceed 5000 characters"],
    },

    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },

    /** Original price shown with strikethrough when there is a discount */
    comparePrice: {
      type: Number,
      default: null,
      min: [0, "Compare price cannot be negative"],
    },

    images: {
      type: [String],
      default: [],
      validate: {
        validator: (arr) => arr.length <= 10,
        message: "A product cannot have more than 10 images",
      },
    },

    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Category is required"],
    },

    /** Only populated when STORE_MODE=multi */
    vendor: {
      type: Schema.Types.ObjectId,
      ref: "Vendor",
      default: null,
    },

    stock: {
      type: Number,
      required: true,
      default: 0,
      min: [0, "Stock cannot be negative"],
      validate: {
        validator: Number.isInteger,
        message: "Stock must be a whole number",
      },
    },

    variants: [variantSchema],

    ratings: {
      avg:   { type: Number, default: 0, min: 0, max: 5 },
      count: { type: Number, default: 0, min: 0 },
    },

    tags: {
      type: [String],
      default: [],
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    /** Soft-delete flag — keeps order history intact */
    isDeleted: {
      type: Boolean,
      default: false,
      select: false,
    },

    /** Featured products shown in Home hero section */
    isFeatured: {
      type: Boolean,
      default: false,
    },
    /** Flash / limited-time sale */
    flashSale: {
      isActive:  { type: Boolean, default: false },
      salePrice: { type: Number, default: null },      // overrides price display
      endsAt:    { type: Date,   default: null },       // null = no expiry
      label:     { type: String, default: "Flash Sale" }, // e.g. "Limited Time"
    },

    /** Curated badge shown on product card (e.g. "New", "Best Seller") */
    badge: {
      type: String,
      enum: ["", "new", "best-seller", "limited", "hot"],
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
productSchema.index({ slug: 1 },        { unique: true });
productSchema.index({ category: 1 });
productSchema.index({ vendor: 1 });
productSchema.index({ price: 1 });
productSchema.index({ "ratings.avg": -1 });
productSchema.index({ isActive: 1, isDeleted: 1 });
productSchema.index({ isFeatured: 1 });
productSchema.index({ createdAt: -1 });
// Text index for full-text search across name, description, tags
productSchema.index(
  { name: "text", description: "text", tags: "text" },
  { weights: { name: 10, tags: 5, description: 1 } }
);

/* ── Pre-save: auto-generate slug ─────────────────────────────────────────── */
productSchema.pre("save", async function (next) {
  if (!this.isModified("name") && this.slug) return next();

  const base = this.name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

  // Ensure uniqueness by appending ObjectId suffix if slug already exists
  const existing = await mongoose.models.Product.findOne({
    slug: base,
    _id: { $ne: this._id },
  });

  this.slug = existing ? `${base}-${this._id.toString().slice(-4)}` : base;
  next();
});


/* ── Virtual: effective sale price (flash sale overrides comparePrice) ──────── */
productSchema.virtual("effectivePrice").get(function () {
  if (
    this.flashSale?.isActive &&
    this.flashSale?.salePrice != null &&
    (!this.flashSale.endsAt || this.flashSale.endsAt > new Date())
  ) {
    return this.flashSale.salePrice;
  }
  return this.price;
});

/* ── Virtual: is flash sale currently active ───────────────────────────────── */
productSchema.virtual("flashSaleActive").get(function () {
  return (
    this.flashSale?.isActive &&
    this.flashSale?.salePrice != null &&
    (!this.flashSale.endsAt || this.flashSale.endsAt > new Date())
  );
});

/* ── Virtual: discount percentage ─────────────────────────────────────────── */
productSchema.virtual("discountPct").get(function () {
  if (!this.comparePrice || this.comparePrice <= this.price) return 0;
  return Math.round(((this.comparePrice - this.price) / this.comparePrice) * 100);
});

/* ── Virtual: in-stock flag ───────────────────────────────────────────────── */
productSchema.virtual("inStock").get(function () {
  return this.stock > 0;
});

/* ── Static: recalculate ratings after a review is saved/deleted ──────────── */
/**
 * Call after creating or deleting a Review document.
 * Aggregates all reviews for a product and updates ratings.avg + ratings.count.
 *
 * @param {string} productId
 */
productSchema.statics.recalculateRatings = async function (productId) {
  const Review = mongoose.model("Review");
  const result = await Review.aggregate([
    { $match: { product: new mongoose.Types.ObjectId(productId) } },
    { $group: { _id: "$product", avg: { $avg: "$rating" }, count: { $sum: 1 } } },
  ]);

  if (result.length > 0) {
    await this.findByIdAndUpdate(productId, {
      "ratings.avg":   Math.round(result[0].avg * 10) / 10,
      "ratings.count": result[0].count,
    });
  } else {
    await this.findByIdAndUpdate(productId, {
      "ratings.avg":   0,
      "ratings.count": 0,
    });
  }
};

const Product = mongoose.model("Product", productSchema);
export default Product;
// Flash sale fields added below productSchema.statics
