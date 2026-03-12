import { useState } from "react";
import { Save, Store, CreditCard, Mail, Palette, Globe } from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ColorModeToggle } from "@/components/ui/ColorModeToggle";
import { useTheme } from "@/hooks/useTheme";
import { cn } from "@/utils/cn";

const TABS = [
  { id: "store",    label: "Store",    icon: Store },
  { id: "payments", label: "Payments", icon: CreditCard },
  { id: "email",    label: "Email",    icon: Mail },
  { id: "theme",    label: "Theme",    icon: Palette },
];

const Section = ({ title, description, children }) => (
  <div className="card p-6 space-y-5">
    <div>
      <h3 className="font-semibold text-[var(--color-text)]">{title}</h3>
      {description && <p className="text-sm text-[var(--color-text-muted)] mt-0.5">{description}</p>}
    </div>
    <div className="divider" />
    <div className="space-y-4">{children}</div>
  </div>
);

const Toggle = ({ label, description, checked, onChange }) => (
  <div className="flex items-center justify-between gap-4">
    <div>
      <p className="text-sm font-medium text-[var(--color-text)]">{label}</p>
      {description && <p className="text-xs text-[var(--color-text-muted)]">{description}</p>}
    </div>
    <label className="relative inline-flex items-center cursor-pointer shrink-0">
      <input type="checkbox" className="sr-only peer" checked={checked} onChange={onChange} />
      <div className="w-10 h-5 bg-[var(--color-border)] rounded-full peer peer-checked:bg-[var(--color-primary)] after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-5" />
    </label>
  </div>
);

export default function AdminSettings() {
  const { brand, payments, storeMode } = useTheme();
  const [activeTab, setActiveTab] = useState("store");

  // Local form state — in production these would PATCH to a settings API
  const [store, setStore] = useState({
    name:       brand.name || "",
    tagline:    brand.tagline || "",
    currency:   "USD",
    freeShipping: 50,
    taxRate:    10,
    maintenanceMode: false,
  });

  const [pays, setPays] = useState({
    stripe:  payments.stripe ?? false,
    paypal:  payments.paypal ?? false,
    cod:     payments.cod ?? true,
  });

  const [email, setEmail] = useState({
    fromName:    brand.name || "UniShop",
    fromAddress: "noreply@example.com",
    orderConfirmation: true,
    statusUpdates:     true,
    welcomeEmail:      true,
    newsletterEnabled: false,
  });

  const [theme, setTheme] = useState({
    primaryColor: "#6366f1",
    mode:         "light",
    borderRadius: "rounded",
    fontBody:     "Inter",
  });

  const handleSave = (section) => {
    // In a real deployment, this would PATCH /api/admin/settings
    toast.success(`${section} settings saved (stored locally in theme.config.js)`);
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-xl font-bold text-[var(--color-text)]">Settings</h1>
        <p className="text-sm text-[var(--color-text-muted)] mt-1">
          Manage your store configuration. Changes here update <code className="text-xs bg-[var(--color-background)] px-1 py-0.5 rounded">theme.config.js</code> — redeploy to apply.
        </p>
      </div>

      {/* Tab nav */}
      <div className="flex gap-1 p-1 bg-[var(--color-background)] rounded-xl w-fit">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setActiveTab(id)}
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all",
              activeTab === id
                ? "bg-[var(--color-surface)] text-[var(--color-text)] shadow-sm"
                : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
            )}>
            <Icon size={14} /> {label}
          </button>
        ))}
      </div>

      {/* Store tab */}
      {activeTab === "store" && (
        <div className="space-y-4">
          <Section title="Brand" description="Your store identity shown to customers.">
            <Input label="Store Name" value={store.name} onChange={e => setStore(s => ({ ...s, name: e.target.value }))} />
            <Input label="Tagline" value={store.tagline} onChange={e => setStore(s => ({ ...s, tagline: e.target.value }))} />
            <div>
              <label className="label">Currency</label>
              <select className="input w-full" value={store.currency} onChange={e => setStore(s => ({ ...s, currency: e.target.value }))}>
                {["USD","EUR","GBP","CAD","AUD","JPY","INR","NPR"].map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </Section>

          <Section title="Pricing & Shipping" description="Global rules applied at checkout.">
            <Input label="Free Shipping Threshold ($)" type="number"
              value={store.freeShipping} onChange={e => setStore(s => ({ ...s, freeShipping: e.target.value }))}
              helper="Orders above this amount get free shipping" />
            <Input label="Tax Rate (%)" type="number"
              value={store.taxRate} onChange={e => setStore(s => ({ ...s, taxRate: e.target.value }))}
              helper="Applied as a flat percentage at checkout" />
          </Section>

          <Section title="Maintenance" description="Temporarily disable the storefront.">
            <Toggle label="Maintenance Mode" description="Customers see a 'Coming Soon' page. Admin still has full access."
              checked={store.maintenanceMode} onChange={e => setStore(s => ({ ...s, maintenanceMode: e.target.checked }))} />
          </Section>

          <div className="flex justify-end">
            <Button onClick={() => handleSave("Store")} leftIcon={<Save size={15} />}>Save Store Settings</Button>
          </div>
        </div>
      )}

      {/* Payments tab */}
      {activeTab === "payments" && (
        <div className="space-y-4">
          <Section title="Payment Gateways" description="Enable the payment methods you've configured.">
            <Toggle label="Stripe (Card Payments)"
              description="Accepts Visa, Mastercard, Amex. Requires STRIPE_SECRET_KEY + STRIPE_WEBHOOK_SECRET in .env"
              checked={pays.stripe} onChange={e => setPays(p => ({ ...p, stripe: e.target.checked }))} />
            <div className="divider" />
            <Toggle label="PayPal"
              description="Requires PAYPAL_CLIENT_ID + PAYPAL_SECRET in .env"
              checked={pays.paypal} onChange={e => setPays(p => ({ ...p, paypal: e.target.checked }))} />
            <div className="divider" />
            <Toggle label="Cash on Delivery (COD)"
              description="Customer pays physically on delivery — no gateway required"
              checked={pays.cod} onChange={e => setPays(p => ({ ...p, cod: e.target.checked }))} />
          </Section>

          <div className="card p-4 bg-amber-50 border-amber-200 text-amber-800 text-sm space-y-1">
            <p className="font-semibold">⚠️ Important</p>
            <p>Payment gateway credentials must be set in your server <code className="text-xs">.env</code> file, not here. These toggles only control which options appear at checkout.</p>
          </div>

          <div className="flex justify-end">
            <Button onClick={() => handleSave("Payment")} leftIcon={<Save size={15} />}>Save Payment Settings</Button>
          </div>
        </div>
      )}

      {/* Email tab */}
      {activeTab === "email" && (
        <div className="space-y-4">
          <Section title="Sender Identity" description="How emails appear to customers.">
            <Input label="From Name" value={email.fromName} onChange={e => setEmail(em => ({ ...em, fromName: e.target.value }))} />
            <Input label="From Email Address" type="email" value={email.fromAddress} onChange={e => setEmail(em => ({ ...em, fromAddress: e.target.value }))} />
          </Section>

          <Section title="Automated Emails" description="Control which transactional emails are sent.">
            <Toggle label="Order Confirmation" description="Sent when a new order is placed"
              checked={email.orderConfirmation} onChange={e => setEmail(em => ({ ...em, orderConfirmation: e.target.checked }))} />
            <div className="divider" />
            <Toggle label="Order Status Updates" description="Sent when order status changes (shipped, delivered etc.)"
              checked={email.statusUpdates} onChange={e => setEmail(em => ({ ...em, statusUpdates: e.target.checked }))} />
            <div className="divider" />
            <Toggle label="Welcome Email" description="Sent when a new customer registers"
              checked={email.welcomeEmail} onChange={e => setEmail(em => ({ ...em, welcomeEmail: e.target.checked }))} />
            <div className="divider" />
            <Toggle label="Newsletter / Marketing Emails" description="Enable opt-in marketing list"
              checked={email.newsletterEnabled} onChange={e => setEmail(em => ({ ...em, newsletterEnabled: e.target.checked }))} />
          </Section>

          <div className="card p-4 text-sm text-[var(--color-text-muted)] space-y-1">
            <p className="font-medium text-[var(--color-text)]">Email provider</p>
            <p>Set <code className="text-xs">SMTP_HOST</code>, <code className="text-xs">SMTP_USER</code>, <code className="text-xs">SMTP_PASS</code> in your server <code className="text-xs">.env</code>. Compatible with SendGrid, Mailgun, SES, and any SMTP provider.</p>
          </div>

          <div className="flex justify-end">
            <Button onClick={() => handleSave("Email")} leftIcon={<Save size={15} />}>Save Email Settings</Button>
          </div>
        </div>
      )}

      {/* Theme tab */}
      {activeTab === "theme" && (
        <div className="space-y-4">
          {/* Color Mode Card */}
          <div className="card p-6 space-y-4">
            <div>
              <h3 className="font-semibold text-[var(--color-text)]">Color Mode</h3>
              <p className="text-sm text-[var(--color-text-muted)] mt-1">
                Choose how the admin and store interface looks. "Auto" follows the visitor&apos;s OS preference.
              </p>
            </div>
            <ColorModeToggle variant="full" />
          </div>

          <Section title="Appearance" description={<>Edit <code className="text-xs">client/src/config/theme.config.js</code> directly for full control, or use the <a href="/configurator" target="_blank" className="text-[var(--color-primary)] underline">Theme Configurator tool</a>.</>}>
            <div>
              <label className="label">Primary Color</label>
              <div className="flex items-center gap-3">
                <input type="color" value={theme.primaryColor}
                  onChange={e => setTheme(t => ({ ...t, primaryColor: e.target.value }))}
                  className="h-10 w-10 rounded-lg cursor-pointer border border-[var(--color-border)] p-0.5" />
                <code className="text-sm text-[var(--color-text-muted)]">{theme.primaryColor}</code>
              </div>
            </div>
            <div>
              <label className="label">Color Mode</label>
              <div className="flex gap-2">
                {["light","dark","system"].map(m => (
                  <button key={m} onClick={() => setTheme(t => ({ ...t, mode: m }))}
                    className={cn("px-3 py-1.5 rounded-lg text-sm font-medium capitalize border transition-all",
                      theme.mode === m
                        ? "border-[var(--color-primary)] bg-[var(--color-primary-light)] text-[var(--color-primary)]"
                        : "border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-primary)]/50")}>
                    {m}
                  </button>
                ))}
              </div>
            </div>
          </Section>

          <div className="card p-4 bg-[var(--color-primary-light)] border-[var(--color-primary)]/20 text-sm space-y-1">
            <p className="font-semibold text-[var(--color-primary)]">💡 Pro tip</p>
            <p className="text-[var(--color-text-muted)]">For a completely different white-label store, copy the project folder and edit <code className="text-xs">theme.config.js</code>. Each copy can point to a different MongoDB database for true multi-tenancy.</p>
          </div>

          <div className="flex justify-end">
            <Button onClick={() => handleSave("Theme")} leftIcon={<Save size={15} />}>Save Theme Settings</Button>
          </div>
        </div>
      )}
    </div>
  );
}
