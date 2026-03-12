import { motion } from "framer-motion";
import { useTheme } from "@/hooks/useTheme";

const SECTIONS = [
  {
    title: "1. Information We Collect",
    body: `When you use our services, we collect information you provide directly — such as your name, email address, shipping address, and payment details during checkout. We also collect information automatically, including IP address, browser type, pages visited, and purchase history, through cookies and similar technologies.`,
  },
  {
    title: "2. How We Use Your Information",
    body: `We use your information to process orders and payments, send order confirmations and shipping updates, provide customer support, personalise your shopping experience, send promotional emails (only with your consent), detect and prevent fraud, and improve our website and services.`,
  },
  {
    title: "3. Payment Information",
    body: `We do not store your full card details. Payment processing is handled by PCI-DSS compliant providers (Stripe and/or PayPal). Your card number is transmitted directly to the payment processor and never touches our servers.`,
  },
  {
    title: "4. Sharing Your Information",
    body: `We do not sell, rent, or trade your personal information. We share data only with service providers who help us operate our business (e.g. shipping carriers, payment processors, email providers), where required by law, or to protect our rights and users' safety. All third parties are bound by confidentiality obligations.`,
  },
  {
    title: "5. Cookies & Tracking",
    body: `We use essential cookies to operate the site (e.g. your shopping cart and login session) and analytics cookies to understand how visitors use our site. You can disable non-essential cookies in your browser settings. Some features may not work correctly if cookies are fully disabled.`,
  },
  {
    title: "6. Data Retention",
    body: `We retain your personal data for as long as your account is active or as needed to provide services. Order records are kept for 7 years for legal and accounting purposes. You may request deletion of your account and associated data at any time.`,
  },
  {
    title: "7. Your Rights",
    body: `Depending on your location, you may have the right to: access the personal data we hold about you, correct inaccurate data, request deletion of your data, object to or restrict processing, and data portability. To exercise any of these rights, contact us at the email below.`,
  },
  {
    title: "8. Children's Privacy",
    body: `Our services are not directed to children under 13. We do not knowingly collect personal information from children. If we become aware that a child has provided personal data, we will promptly delete it.`,
  },
  {
    title: "9. Security",
    body: `We implement industry-standard security measures including HTTPS encryption, access controls, and regular security reviews. No method of transmission or storage is 100% secure. In the event of a data breach affecting your rights, we will notify you as required by applicable law.`,
  },
  {
    title: "10. Changes to this Policy",
    body: `We may update this Privacy Policy from time to time. We will notify registered users of material changes by email and update the "Last updated" date above. Continued use of our services after changes constitutes acceptance of the revised policy.`,
  },
];

export default function PrivacyPage() {
  const { brand } = useTheme();
  const lastUpdated = "March 2025";

  return (
    <div className="container-app py-12 max-w-3xl">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
        className="space-y-8">

        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-[var(--color-text)]">Privacy Policy</h1>
          <p className="text-sm text-[var(--color-text-muted)]">
            Last updated: {lastUpdated} — This policy describes how {brand.name} collects and uses your personal data.
          </p>
        </div>

        <div className="card p-6 bg-[var(--color-primary-light)] border-[var(--color-primary)]/20 text-sm">
          <strong className="text-[var(--color-primary)]">Our commitment:</strong>{" "}
          <span className="text-[var(--color-text-muted)]">We only collect what we need, we never sell your data, and we give you control over what we hold.</span>
        </div>

        <div className="space-y-8">
          {SECTIONS.map((s) => (
            <section key={s.title} className="space-y-2">
              <h2 className="text-lg font-semibold text-[var(--color-text)]">{s.title}</h2>
              <p className="text-[var(--color-text-muted)] leading-relaxed text-sm">{s.body}</p>
            </section>
          ))}
        </div>

        <div className="card p-6 space-y-2 text-sm">
          <p className="font-semibold text-[var(--color-text)]">Privacy questions or data requests?</p>
          <p className="text-[var(--color-text-muted)]">
            Email us at{" "}
            <a href={`mailto:${brand.supportEmail}`} className="text-[var(--color-primary)] hover:underline font-medium">
              {brand.supportEmail}
            </a>
            . We will respond within 30 days.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
