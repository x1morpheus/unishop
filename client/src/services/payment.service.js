import api from "./api.js";

export const paymentService = {
  /**
   * Create a Stripe PaymentIntent — returns clientSecret for Elements.
   * @param {{ amount: number, currency?: string, orderId?: string }} body
   */
  createStripeIntent: (body) =>
    api.post("/payment/stripe/intent", body).then((r) => r.data.data),

  /**
   * Create a PayPal order — returns paypalOrderId for PayPalButtons.
   * @param {{ amount: number, currency?: string, orderId?: string }} body
   */
  createPayPalOrder: (body) =>
    api.post("/payment/paypal/create", body).then((r) => r.data.data),

  /**
   * Capture an approved PayPal payment.
   * @param {{ paypalOrderId: string, orderId: string }} body
   */
  capturePayPalOrder: (body) =>
    api.post("/payment/paypal/capture", body).then((r) => r.data.data),

  /**
   * Confirm a Cash on Delivery order.
   * @param {{ orderId: string }} body
   */
  confirmCOD: (body) =>
    api.post("/payment/cod/confirm", body).then((r) => r.data.data),
};
