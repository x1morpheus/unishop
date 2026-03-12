import { z } from "zod";

/* ── Primitives ────────────────────────────────────────────────────────────── */
export const emailSchema = z
  .string()
  .min(1, "Email is required")
  .email("Please enter a valid email address");

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(128, "Password is too long");

export const phoneSchema = z
  .string()
  .regex(/^\+?[\d\s\-().]{7,20}$/, "Please enter a valid phone number")
  .optional()
  .or(z.literal(""));

/* ── Auth ──────────────────────────────────────────────────────────────────── */
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
});

export const registerSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters").max(80),
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

/* ── Address ───────────────────────────────────────────────────────────────── */
export const addressSchema = z.object({
  name:    z.string().min(2, "Full name is required").max(100),
  address: z.string().min(5, "Street address is required").max(200),
  city:    z.string().min(2, "City is required").max(100),
  zip:     z.string().min(3, "Postal code is required").max(20),
  country: z.string().min(2, "Country is required").max(100),
  phone:   phoneSchema,
});

/* ── Product (admin) ───────────────────────────────────────────────────────── */
export const productSchema = z.object({
  name:         z.string().min(3, "Product name is required").max(200),
  description:  z.string().min(10, "Description is required").max(5000),
  price:        z.coerce.number().positive("Price must be greater than 0"),
  comparePrice: z.coerce.number().nonnegative().optional().or(z.literal("")),
  stock:        z.coerce.number().int().nonnegative("Stock cannot be negative"),
  category:     z.string().min(1, "Category is required"),
  tags:         z.string().optional(),
  isActive:     z.boolean().optional().default(true),
  isFeatured:   z.boolean().optional().default(false),
  badge:        z.string().optional().default(""),
  // flash sale
  flashSaleActive: z.boolean().optional().default(false),
  flashSalePrice:  z.coerce.number().nonnegative().optional().or(z.literal("")),
  flashSaleEndsAt: z.string().optional(),
  flashSaleLabel:  z.string().optional(),
});

/* ── Review ────────────────────────────────────────────────────────────────── */
export const reviewSchema = z.object({
  rating:  z.number().int().min(1, "Rating is required").max(5),
  comment: z.string().min(10, "Review must be at least 10 characters").max(2000),
});

/* ── Profile update ────────────────────────────────────────────────────────── */
export const profileSchema = z.object({
  name:  z.string().min(2, "Name must be at least 2 characters").max(80),
  phone: phoneSchema,
});

/* ── Change password ───────────────────────────────────────────────────────── */
export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword:     passwordSchema,
    confirmPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

/* ── Checkout ──────────────────────────────────────────────────────────────── */
export const checkoutSchema = z.object({
  shippingAddress: addressSchema,
  paymentMethod:   z.enum(["stripe", "paypal", "cod"], {
    required_error: "Please select a payment method",
  }),
});

/* ── Vendor (multi-vendor mode) ────────────────────────────────────────────── */
export const vendorSchema = z.object({
  storeName:   z.string().min(3, "Store name is required").max(100),
  description: z.string().min(10, "Description is required").max(2000),
});

/* ── Category ──────────────────────────────────────────────────────────────── */
export const categorySchema = z.object({
  name: z.string().min(2, "Category name is required").max(80),
  slug: z.string().optional(),
});
