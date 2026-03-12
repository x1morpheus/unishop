import { Link } from "react-router-dom";
import { Mail, Phone, MapPin } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";

const SocialIcons = {
  facebook:  <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/></svg>,
  instagram: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>,
  twitter:   <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>,
  youtube:   <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4"><path d="M22.54 6.42a2.78 2.78 0 00-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 00-1.95 1.96A29 29 0 001 12a29 29 0 00.46 5.58A2.78 2.78 0 003.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 001.95-1.95A29 29 0 0023 12a29 29 0 00-.46-5.58zM9.75 15.02V8.98L15.5 12l-5.75 3.02z"/></svg>,
  tiktok:    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.77.1 2.89 2.89 0 012.89-2.99c.28 0 .54.04.79.1V9.01a6.34 6.34 0 106.32 6.33V8.69a8.18 8.18 0 004.78 1.52V6.79a4.85 4.85 0 01-1-.1z"/></svg>,
  pinterest: <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4"><path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z"/></svg>,
  linkedin:  <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4"><path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>,
};

const SOCIAL_LABEL = { facebook:"Facebook", instagram:"Instagram", twitter:"X (Twitter)", youtube:"YouTube", tiktok:"TikTok", pinterest:"Pinterest", linkedin:"LinkedIn" };

export function Footer() {
  const { brand, social } = useTheme();
  const year = new Date().getFullYear();
  const activeSocials = Object.entries(social || {}).filter(([, url]) => !!url);

  const footerLinks = {
    Shop: [
      { label: "All Products", to: "/products" },
      { label: "Flash Sales 🔥", to: "/sale" },
      { label: "Wishlist", to: "/wishlist" },
    ],
    Account: [
      { label: "Sign In", to: "/login" },
      { label: "Register", to: "/register" },
      { label: "My Orders", to: "/profile?tab=orders" },
    ],
    Company: [
      { label: "About Us", to: "/about" },
      { label: "Privacy Policy", to: "/privacy" },
      { label: "Terms & Conditions", to: "/terms" },
      { label: "Contact", to: `mailto:${brand.supportEmail}` },
    ],
  };

  return (
    <footer className="border-t border-[var(--color-border)] bg-[var(--color-surface)] mt-auto">
      <div className="container-app py-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">

          {/* Brand */}
          <div className="col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <img src={brand.logo} alt={brand.name} className="h-7 w-auto" />
              <span className="font-semibold text-[var(--color-text)]">{brand.name}</span>
            </Link>
            <p className="text-sm text-[var(--color-text-muted)] leading-relaxed max-w-xs">{brand.tagline}</p>

            <div className="space-y-2">
              <a href={`mailto:${brand.supportEmail}`} className="flex items-center gap-2 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors">
                <Mail size={14} className="shrink-0" />{brand.supportEmail}
              </a>
              {brand.phone && (
                <a href={`tel:${brand.phone}`} className="flex items-center gap-2 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors">
                  <Phone size={14} className="shrink-0" />{brand.phone}
                </a>
              )}
              {brand.address && (
                <p className="flex items-start gap-2 text-sm text-[var(--color-text-muted)]">
                  <MapPin size={14} className="shrink-0 mt-0.5" />{brand.address}
                </p>
              )}
            </div>

            {activeSocials.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {activeSocials.map(([platform, url]) => (
                  <a key={platform} href={url} target="_blank" rel="noopener noreferrer"
                    aria-label={SOCIAL_LABEL[platform] || platform}
                    className="h-8 w-8 rounded-lg flex items-center justify-center bg-[var(--color-background)] text-[var(--color-text-muted)] hover:bg-[var(--color-primary)] hover:text-white transition-all border border-[var(--color-border)] hover:border-[var(--color-primary)]">
                    {SocialIcons[platform]}
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([group, links]) => (
            <div key={group} className="space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-widest text-[var(--color-text-muted)]">{group}</h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.label}>
                    {link.to.startsWith("mailto:") ? (
                      <a href={link.to} className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors">{link.label}</a>
                    ) : (
                      <Link to={link.to} className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors">{link.label}</Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="divider my-8" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-[var(--color-text-muted)]">
          <p>&copy; {year} {brand.name}. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link to="/privacy" className="hover:text-[var(--color-primary)] transition-colors">Privacy</Link>
            <Link to="/terms"   className="hover:text-[var(--color-primary)] transition-colors">Terms</Link>
            <Link to="/about"   className="hover:text-[var(--color-primary)] transition-colors">About</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
