import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ShoppingBag, Shield, Truck, HeartHandshake, ArrowRight, Mail, Phone } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useTheme } from "@/hooks/useTheme";

const fade = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, delay } },
});

const VALUES = [
  { icon: ShoppingBag,    title: "Curated Selection",     desc: "Every product is hand-picked for quality, value, and relevance. We don't list everything — we list the best." },
  { icon: Shield,         title: "Safe & Secure",         desc: "Your data and payments are protected with bank-grade encryption. We never sell your information." },
  { icon: Truck,          title: "Fast Delivery",         desc: "Orders ship the same day and arrive within 2–5 business days. Free shipping on orders over $50." },
  { icon: HeartHandshake, title: "Customer First",        desc: "Real humans answer your questions. 30-day hassle-free returns, no questions asked." },
];

export default function AboutPage() {
  const { brand, social } = useTheme();
  const activeSocials = Object.entries(social || {}).filter(([, url]) => !!url);

  return (
    <div className="pb-16">
      {/* Hero */}
      <section className="bg-[var(--color-primary-light)] py-16 sm:py-24">
        <div className="container-app text-center">
          <motion.div {...fade(0)} className="space-y-4 max-w-2xl mx-auto">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--color-primary)] text-white text-xs font-semibold">
              About {brand.name}
            </span>
            <h1 className="text-4xl sm:text-5xl font-bold text-[var(--color-text)] leading-tight">
              We're building the store<br className="hidden sm:block" /> you always wanted.
            </h1>
            <p className="text-lg text-[var(--color-text-muted)] leading-relaxed">
              {brand.name} was founded with a simple idea: shopping online should be fast, trustworthy, and actually enjoyable. No dark patterns, no junk, no spam — just great products and honest service.
            </p>
            <div className="flex gap-3 justify-center pt-2">
              <Link to="/products"><Button size="lg">Shop Now <ArrowRight size={16} /></Button></Link>
              <a href={`mailto:${brand.supportEmail}`}><Button size="lg" variant="outline">Get in Touch</Button></a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Our values */}
      <section className="container-app py-16">
        <motion.div {...fade(0.1)} className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-[var(--color-text)]">What we stand for</h2>
          <p className="text-[var(--color-text-muted)] mt-2">The principles that guide every decision we make.</p>
        </motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {VALUES.map(({ icon: Icon, title, desc }, i) => (
            <motion.div key={title} {...fade(0.1 + i * 0.07)}
              className="card p-6 space-y-3 text-center hover:shadow-md transition-shadow">
              <div className="h-12 w-12 rounded-xl bg-[var(--color-primary-light)] flex items-center justify-center mx-auto">
                <Icon size={22} className="text-[var(--color-primary)]" />
              </div>
              <h3 className="font-semibold text-[var(--color-text)]">{title}</h3>
              <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">{desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Story */}
      <section className="bg-[var(--color-surface)] border-y border-[var(--color-border)]">
        <div className="container-app py-16 grid md:grid-cols-2 gap-12 items-center">
          <motion.div {...fade(0.1)} className="space-y-5">
            <h2 className="text-2xl sm:text-3xl font-bold text-[var(--color-text)]">Our story</h2>
            <p className="text-[var(--color-text-muted)] leading-relaxed">
              What started as a side project to scratch our own itch became a full platform used by thousands of shoppers every day. We got tired of bloated e-commerce sites with poor search, misleading reviews, and checkout flows that felt like obstacle courses.
            </p>
            <p className="text-[var(--color-text-muted)] leading-relaxed">
              So we built {brand.name} — stripped back, lightning fast, and relentlessly focused on the things that matter: product quality, transparent pricing, and genuine customer care.
            </p>
            <p className="text-[var(--color-text-muted)] leading-relaxed">
              We're a small team with high standards. Every product you see has been reviewed. Every policy we write is written in plain English. And if something goes wrong, a real person will make it right.
            </p>
          </motion.div>
          <motion.div {...fade(0.2)}
            className="rounded-2xl overflow-hidden bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-dark)] h-64 md:h-full min-h-[280px] flex items-center justify-center">
            <div className="text-center text-white p-8 space-y-3">
              <ShoppingBag size={48} className="mx-auto opacity-80" />
              <p className="text-4xl font-bold">10k+</p>
              <p className="text-white/80">Happy customers</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Contact */}
      <section className="container-app py-16">
        <motion.div {...fade(0.1)} className="card p-8 sm:p-12 text-center max-w-2xl mx-auto space-y-5">
          <h2 className="text-2xl font-bold text-[var(--color-text)]">Get in touch</h2>
          <p className="text-[var(--color-text-muted)]">
            Questions, feedback, or just want to say hi? We'd love to hear from you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href={`mailto:${brand.supportEmail}`}
              className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--color-primary-light)] text-[var(--color-primary)] font-medium text-sm hover:bg-[var(--color-primary)] hover:text-white transition-all">
              <Mail size={15} /> {brand.supportEmail}
            </a>
            {brand.phone && (
              <a href={`tel:${brand.phone}`}
                className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--color-background)] text-[var(--color-text)] font-medium text-sm hover:bg-[var(--color-primary-light)] transition-all border border-[var(--color-border)]">
                <Phone size={15} /> {brand.phone}
              </a>
            )}
          </div>
          {activeSocials.length > 0 && (
            <p className="text-sm text-[var(--color-text-muted)]">
              Or find us on {activeSocials.map(([p]) => p).join(", ")}.
            </p>
          )}
        </motion.div>
      </section>
    </div>
  );
}
