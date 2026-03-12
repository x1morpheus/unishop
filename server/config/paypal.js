import paypal from "@paypal/checkout-server-sdk";

/**
 * Returns a configured PayPal HTTP client environment.
 * Switches between Sandbox and Live based on PAYPAL_MODE env var.
 */
const environment = () => {
  const clientId     = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  const mode         = process.env.PAYPAL_MODE || "sandbox";

  if (!clientId || !clientSecret) {
    throw new Error("PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET must be set in environment variables");
  }

  return mode === "live"
    ? new paypal.core.LiveEnvironment(clientId, clientSecret)
    : new paypal.core.SandboxEnvironment(clientId, clientSecret);
};

/**
 * Creates a new PayPal HTTP client.
 * Call this inside controllers — do not cache across requests.
 *
 * @returns {paypal.core.PayPalHttpClient}
 *
 * @example
 * import { getPayPalClient } from "../config/paypal.js";
 * const client = getPayPalClient();
 * const request = new paypal.orders.OrdersCreateRequest();
 * const response = await client.execute(request);
 */
export const getPayPalClient = () => new paypal.core.PayPalHttpClient(environment());

export { paypal };
