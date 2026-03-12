import Stripe from "stripe";

/**
 * Stripe SDK instance — initialised once and reused across all controllers.
 * Secret key is read from environment — never exposed to the client.
 *
 * Usage:
 *   import { stripe } from "../config/stripe.js";
 *   const intent = await stripe.paymentIntents.create({ ... });
 */
let _stripe = null;

export const getStripe = () => {
  if (!_stripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error("STRIPE_SECRET_KEY is not set in environment variables");
    }
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2023-10-16",
    });
  }
  return _stripe;
};

// Named export for convenience
export const stripe = new Proxy(
  {},
  {
    get(_target, prop) {
      return getStripe()[prop];
    },
  }
);
