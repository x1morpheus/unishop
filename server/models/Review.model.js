import mongoose from "mongoose";
import Product from "./Product.model.js";

const { Schema } = mongoose;

const reviewSchema = new Schema(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: [true, "Review must belong to a product"],
    },

    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Review must belong to a user"],
    },

    /** Snapshot of user name at review time */
    userName: {
      type: String,
      required: true,
      trim: true,
    },

    /** Snapshot of user avatar at review time */
    userAvatar: {
      type: String,
      default: "",
    },

    rating: {
      type: Number,
      required: [true, "Rating is required"],
      min: [1, "Rating must be at least 1"],
      max: [5, "Rating cannot exceed 5"],
      validate: {
        validator: Number.isInteger,
        message: "Rating must be a whole number",
      },
    },

    comment: {
      type: String,
      required: [true, "Review comment is required"],
      trim: true,
      minlength: [10,   "Comment must be at least 10 characters"],
      maxlength: [2000, "Comment cannot exceed 2000 characters"],
    },

    isVerifiedPurchase: {
      type: Boolean,
      default: false,
    },

    /** Admin can hide inappropriate reviews */
    isVisible: {
      type: Boolean,
      default: true,
    },

    helpfulVotes: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
    toJSON:  { virtuals: true },
    toObject: { virtuals: true },
  }
);

/* ── Indexes ───────────────────────────────────────────────────────────────── */
// Compound unique index — one review per user per product
reviewSchema.index({ product: 1, user: 1 }, { unique: true });
reviewSchema.index({ product: 1, createdAt: -1 });
reviewSchema.index({ user: 1 });
reviewSchema.index({ rating: 1 });

/* ── Post-save: recalculate product ratings ───────────────────────────────── */
reviewSchema.post("save", async function () {
  await Product.recalculateRatings(this.product);
});

/* ── Post-delete: recalculate product ratings ─────────────────────────────── */
reviewSchema.post("findOneAndDelete", async function (doc) {
  if (doc) await Product.recalculateRatings(doc.product);
});

reviewSchema.post("deleteOne", { document: true }, async function () {
  await Product.recalculateRatings(this.product);
});

const Review = mongoose.model("Review", reviewSchema);
export default Review;
