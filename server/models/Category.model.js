import mongoose from "mongoose";

const { Schema } = mongoose;

const categorySchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Category name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [80, "Name cannot exceed 80 characters"],
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
      default: "",
      maxlength: [500, "Description cannot exceed 500 characters"],
    },

    image: {
      type: String,
      default: "",
    },

    /** Optional parent for nested categories (e.g. Electronics > Phones) */
    parent: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      default: null,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    /** Display order in navigation / filter panel */
    sortOrder: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON:  { virtuals: true },
    toObject: { virtuals: true },
  }
);

/* ── Indexes ───────────────────────────────────────────────────────────────── */
categorySchema.index({ slug: 1 }, { unique: true });
categorySchema.index({ parent: 1 });
categorySchema.index({ isActive: 1, sortOrder: 1 });

/* ── Pre-save: auto-generate slug from name if not provided ────────────────── */
categorySchema.pre("save", function (next) {
  if (!this.isModified("name") && this.slug) return next();
  if (!this.slug) {
    this.slug = this.name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  }
  next();
});

/* ── Virtual: product count (populated externally when needed) ─────────────── */
categorySchema.virtual("products", {
  ref:          "Product",
  localField:   "_id",
  foreignField: "category",
  count:        true,
});

const Category = mongoose.model("Category", categorySchema);
export default Category;
