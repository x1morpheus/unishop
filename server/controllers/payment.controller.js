import { stripe } from "../config/stripe.js";
import { getPayPalClient, paypal } from "../config/paypal.js";
import Order from "../models/Order.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { apiResponse, createError } from "../utils/apiResponse.js";
import { PAYMENT_STATUS, ORDER_STATUS } from "../../shared/constants.js";

/* ── POST /api/payment/stripe/intent ───────────────────────────────────────── */
export const createStripeIntent = asyncHandler(async (req, res) => {
  const { amount, currency = "usd", orderId } = req.body;

  if (!amount || amount <= 0) throw createError(400, "Valid amount is required");

  const paymentIntent = await stripe.paymentIntents.create({
    amount:   Math.round(amount * 100), // Stripe uses cents
    currency: currency.toLowerCase(),
    metadata: {
      orderId:    orderId || "",
      userId:     req.user._id.toString(),
      userEmail:  req.user.email,
    },
    automatic_payment_methods: { enabled: true },
  });

  // Return only the client secret — the secret key never leaves the server
  apiResponse(res, 200, { clientSecret: paymentIntent.client_secret }, "Payment intent created");
});

/* ── POST /api/payment/stripe/webhook ─────────────────────────────────────── */
export const stripeWebhook = asyncHandler(async (req, res) => {
  const sig = req.headers["stripe-signature"];

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,           // raw body (must use express.raw() on this route)
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch {
    throw createError(400, "Webhook signature verification failed");
  }

  if (event.type === "payment_intent.succeeded") {
    const intent  = event.data.object;
    const orderId = intent.metadata?.orderId;

    if (orderId) {
      await Order.findByIdAndUpdate(orderId, {
        "payment.status":   PAYMENT_STATUS.PAID,
        "payment.stripeId": intent.id,
        "payment.paidAt":   new Date(),
        orderStatus:        ORDER_STATUS.CONFIRMED,
      });
    }
  }

  if (event.type === "payment_intent.payment_failed") {
    const intent  = event.data.object;
    const orderId = intent.metadata?.orderId;
    if (orderId) {
      await Order.findByIdAndUpdate(orderId, {
        "payment.status": PAYMENT_STATUS.FAILED,
      });
    }
  }

  res.json({ received: true });
});

/* ── POST /api/payment/paypal/create ───────────────────────────────────────── */
export const createPayPalOrder = asyncHandler(async (req, res) => {
  const { amount, currency = "USD", orderId } = req.body;

  if (!amount || amount <= 0) throw createError(400, "Valid amount is required");

  const client  = getPayPalClient();
  const request = new paypal.orders.OrdersCreateRequest();

  request.prefer("return=representation");
  request.requestBody({
    intent: "CAPTURE",
    purchase_units: [
      {
        amount: {
          currency_code: currency.toUpperCase(),
          value:         amount.toFixed(2),
        },
        custom_id: orderId || "",
      },
    ],
  });

  const response = await client.execute(request);
  const paypalOrderId = response.result.id;

  apiResponse(res, 200, { paypalOrderId }, "PayPal order created");
});

/* ── POST /api/payment/paypal/capture ──────────────────────────────────────── */
export const capturePayPalOrder = asyncHandler(async (req, res) => {
  const { paypalOrderId, orderId } = req.body;

  if (!paypalOrderId) throw createError(400, "PayPal order ID is required");

  const client  = getPayPalClient();
  const request = new paypal.orders.OrdersCaptureRequest(paypalOrderId);
  request.requestBody({});

  const response = await client.execute(request);
  const capture  = response.result;

  if (capture.status !== "COMPLETED") {
    throw createError(400, `PayPal capture failed with status: ${capture.status}`);
  }

  // Update the UniShop order
  if (orderId) {
    await Order.findByIdAndUpdate(orderId, {
      "payment.status":   PAYMENT_STATUS.PAID,
      "payment.paypalId": paypalOrderId,
      "payment.paidAt":   new Date(),
      orderStatus:        ORDER_STATUS.CONFIRMED,
    });
  }

  apiResponse(res, 200, { captureId: capture.id }, "PayPal payment captured");
});

/* ── POST /api/payment/cod/confirm ─────────────────────────────────────────── */
export const confirmCOD = asyncHandler(async (req, res) => {
  const { orderId } = req.body;
  if (!orderId) throw createError(400, "Order ID is required");

  const order = await Order.findById(orderId);
  if (!order) throw createError(404, "Order not found");

  if (order.user.toString() !== req.user._id.toString()) {
    throw createError(403, "Not authorised");
  }

  if (order.payment.method !== "cod") {
    throw createError(400, "This order is not a COD order");
  }

  // COD stays pending until admin marks it paid on delivery
  order.orderStatus = ORDER_STATUS.CONFIRMED;
  await order.save();

  apiResponse(res, 200, { orderNumber: order.orderNumber }, "COD order confirmed");
});
