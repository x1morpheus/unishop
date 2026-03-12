import { motion } from "framer-motion";
import { useTheme } from "@/hooks/useTheme";

const SECTIONS = [
  {
    title: "1. Acceptance of Terms",
    body: `By accessing or placing an order through this website, you confirm that you are at least 18 years of age and agree to be bound by these Terms and Conditions. If you do not agree to these terms, you must not use our site or services.`,
  },
  {
    title: "2. Products & Pricing",
    body: `We make every effort to display accurate product descriptions and prices. Prices are subject to change without notice. In the event of a pricing error, we reserve the right to cancel orders placed at the incorrect price and will notify affected customers promptly. All prices are listed in the currency shown at checkout.`,
  },
  {
    title: "3. Orders & Payment",
    body: `By placing an order, you are making an offer to purchase. We reserve the right to accept or decline any order. Payment is processed securely at checkout. We accept major credit cards, PayPal, and cash on delivery where available. Your payment information is encrypted and never stored on our servers.`,
  },
  {
    title: "4. Shipping & Delivery",
    body: `Orders are typically processed within 1 business day. Delivery estimates are provided at checkout and are not guaranteed. We are not responsible for delays caused by customs, postal services, or events outside our control. Risk of loss passes to you upon delivery.`,
  },
  {
    title: "5. Returns & Refunds",
    body: `We offer a 30-day return policy for most items. Products must be unused, in original packaging, and accompanied by proof of purchase. Digital goods and perishable items are non-refundable. To initiate a return, contact our support team. Refunds are processed within 5–10 business days after we receive the returned item.`,
  },
  {
    title: "6. Intellectual Property",
    body: `All content on this website — including logos, text, images, and software — is owned by or licensed to us and is protected by applicable intellectual property laws. You may not copy, reproduce, or distribute any content without our express written permission.`,
  },
  {
    title: "7. User Accounts",
    body: `You are responsible for maintaining the confidentiality of your account credentials. You agree to notify us immediately of any unauthorized use of your account. We reserve the right to suspend or terminate accounts that violate these terms or engage in fraudulent activity.`,
  },
  {
    title: "8. Privacy",
    body: `Your use of this website is also governed by our Privacy Policy, which is incorporated into these terms by reference. By using the site, you consent to our collection and use of personal data as described therein.`,
  },
  {
    title: "9. Limitation of Liability",
    body: `To the fullest extent permitted by law, we shall not be liable for any indirect, incidental, special, or consequential damages arising out of your use of our website or products. Our total liability in any matter is limited to the amount you paid for the relevant order.`,
  },
  {
    title: "10. Governing Law",
    body: `These Terms are governed by and construed in accordance with the laws of the jurisdiction in which we are registered, without regard to conflict of law principles. Any disputes shall be resolved in the courts of that jurisdiction.`,
  },
  {
    title: "11. Changes to Terms",
    body: `We may update these Terms from time to time. Changes take effect immediately upon posting to this page. Continued use of our services after changes constitutes your acceptance of the revised terms. We will notify registered users of material changes by email.`,
  },
];

export default function TermsPage() {
  const { brand } = useTheme();
  const lastUpdated = "March 2025";

  return (
    <div className="container-app py-12 max-w-3xl">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
        className="space-y-8">

        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-[var(--color-text)]">Terms & Conditions</h1>
          <p className="text-sm text-[var(--color-text-muted)]">
            Last updated: {lastUpdated} — Please read these terms carefully before using {brand.name}.
          </p>
        </div>

        <div className="card p-6 bg-amber-50 border-amber-200 text-amber-800 text-sm">
          <strong>Summary:</strong> Shop fairly, don't abuse the platform, and contact us if anything goes wrong. We'll treat you with the same respect we expect in return.
        </div>

        {/* Sections */}
        <div className="space-y-8">
          {SECTIONS.map((s) => (
            <section key={s.title} className="space-y-2">
              <h2 className="text-lg font-semibold text-[var(--color-text)]">{s.title}</h2>
              <p className="text-[var(--color-text-muted)] leading-relaxed text-sm">{s.body}</p>
            </section>
          ))}
        </div>

        {/* Contact */}
        <div className="card p-6 space-y-2 text-sm">
          <p className="font-semibold text-[var(--color-text)]">Questions about these terms?</p>
          <p className="text-[var(--color-text-muted)]">
            Contact us at{" "}
            <a href={`mailto:${brand.supportEmail}`} className="text-[var(--color-primary)] hover:underline font-medium">
              {brand.supportEmail}
            </a>
            . We're happy to explain anything in plain language.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
