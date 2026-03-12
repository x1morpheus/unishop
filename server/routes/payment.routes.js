import { Router } from "express";
import {
  createStripeIntent, stripeWebhook,
  createPayPalOrder, capturePayPalOrder,
  confirmCOD,
} from "../controllers/payment.controller.js";
import { verifyToken } from "../middleware/auth.middleware.js";
import express from "express";

const router = Router();

// Stripe webhook must receive raw body for signature verification
router.post(
  "/stripe/webhook",
  express.raw({ type: "application/json" }),
  stripeWebhook
);

// All other payment routes require authentication
router.use(verifyToken);

router.post("/stripe/intent",    createStripeIntent);
router.post("/paypal/create",    createPayPalOrder);
router.post("/paypal/capture",   capturePayPalOrder);
router.post("/cod/confirm",      confirmCOD);

export default router;
