import nodemailer from "nodemailer";

/**
 * Creates a nodemailer transporter from environment variables.
 * Swap EMAIL_HOST / EMAIL_PORT for any SMTP provider (Mailtrap, SendGrid, SES, etc.)
 */
const createTransporter = () =>
  nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT, 10) || 587,
    secure: parseInt(process.env.EMAIL_PORT, 10) === 465,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

/**
 * Sends a transactional email.
 *
 * @param {object} options
 * @param {string}   options.to      - Recipient email address
 * @param {string}   options.subject - Email subject line
 * @param {string}   options.html    - HTML body (use text as fallback)
 * @param {string}   [options.text]  - Plain text body
 * @returns {Promise<void>}
 *
 * @example
 * await sendEmail({
 *   to: "user@example.com",
 *   subject: "Order Confirmed",
 *   html: "<p>Your order #1234 has been confirmed.</p>",
 * });
 */
export const sendEmail = async ({ to, subject, html, text }) => {
  // Skip sending in test environment
  if (process.env.NODE_ENV === "test") return;

  const transporter = createTransporter();

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || "noreply@unishop.com",
    to,
    subject,
    html,
    text: text || html.replace(/<[^>]+>/g, ""), // strip HTML tags for plain text fallback
  });
};

/* ── Pre-built email templates ─────────────────────────────────────────────── */

/**
 * Sends an order confirmation email.
 *
 * @param {string} to
 * @param {{ orderNumber: string, total: string, items: Array }} orderData
 */
export const sendOrderConfirmation = async (to, orderData) => {
  const itemRows = orderData.items
    .map((i) => `<tr><td>${i.name}</td><td>x${i.qty}</td><td>${i.price}</td></tr>`)
    .join("");

  await sendEmail({
    to,
    subject: `Order Confirmed — #${orderData.orderNumber}`,
    html: `
      <h2>Thank you for your order!</h2>
      <p>Order number: <strong>#${orderData.orderNumber}</strong></p>
      <table border="1" cellpadding="8" style="border-collapse:collapse">
        <thead><tr><th>Item</th><th>Qty</th><th>Price</th></tr></thead>
        <tbody>${itemRows}</tbody>
      </table>
      <p><strong>Total: ${orderData.total}</strong></p>
    `,
  });
};

/**
 * Sends a welcome / registration email.
 *
 * @param {string} to
 * @param {string} name
 */
export const sendWelcomeEmail = async (to, name) => {
  await sendEmail({
    to,
    subject: "Welcome to UniShop!",
    html: `
      <h2>Welcome, ${name}!</h2>
      <p>Your account has been created successfully.</p>
      <p>Start shopping at <a href="${process.env.CLIENT_URL}">${process.env.CLIENT_URL}</a></p>
    `,
  });
};

/**
 * Sends an order status update email.
 *
 * @param {string} to
 * @param {{ orderNumber: string, status: string }} data
 */
export const sendOrderStatusUpdate = async (to, { orderNumber, status }) => {
  await sendEmail({
    to,
    subject: `Order #${orderNumber} Update — ${status}`,
    html: `
      <h2>Order Status Updated</h2>
      <p>Your order <strong>#${orderNumber}</strong> is now <strong>${status}</strong>.</p>
      <p>Track your order at <a href="${process.env.CLIENT_URL}/profile">${process.env.CLIENT_URL}/profile</a></p>
    `,
  });
};
