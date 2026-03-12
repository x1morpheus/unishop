import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingCart, Search, Heart, User, Menu, X,
  LogOut, Package, Settings, ChevronDown, Zap,
} from "lucide-react";
import PropTypes from "prop-types";
import { ColorModeToggle } from "@/components/ui/ColorModeToggle";
import { useTheme } from "@/hooks/useTheme";
import { useQuery } from "@tanstack/react-query";
import { productService } from "@/services/product.service";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/utils/cn";

const navLinks = [
  { label: "Shop",       to: "/products" },
  { label: "Categories", to: "/products?view=categories" },
];

export function Navbar({ onCartOpen }) {
  const { brand } = useTheme();
  const { itemCount } = useCart();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const { data: flashData } = useQuery({
    queryKey: ["flash-nav"],
    queryFn:  () => productService.getFlashSales({ limit: 1 }),
    refetchInterval: 60_000,
    staleTime: 30_000,
  });
  const hasFlashSale = (flashData?.data?.length ?? 0) > 0;

  const [mobileOpen, setMobileOpen]   = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery]  = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
      setMobileOpen(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    setUserMenuOpen(false);
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-30 bg-[var(--color-surface)] border-b border-[var(--color-border)] shadow-sm">
      <div className="container-app">
        <div className="flex items-center justify-between h-16 gap-4">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0">
            <img src={brand.logo} alt={brand.name} className="h-8 w-auto" />
            <span className="font-semibold text-lg text-[var(--color-text)] hidden sm:block">
              {brand.name}
            </span>
          </Link>

          {/* Desktop nav links */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  cn(
                    "px-3.5 py-2 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "text-[var(--color-primary)] bg-[var(--color-primary-light)]"
                      : "text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-background)]"
                  )
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          {/* Desktop search */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-sm">
            <div className="relative w-full">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products…"
                className="input pl-9 py-2 text-sm"
              />
            </div>
          </form>

          {/* Right actions */}
          <div className="flex items-center gap-1">

            {/* Color mode toggle */}
            <ColorModeToggle variant="icon" />

            {/* Wishlist */}
            {user && (
              <Link
                to="/wishlist"
                className="p-2 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-background)] transition-colors"
                aria-label="Wishlist"
              >
                <Heart size={20} />
              </Link>
            )}

            {/* Cart */}
            <button
              onClick={onCartOpen}
              className="relative p-2 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-background)] transition-colors"
              aria-label={`Cart (${itemCount} items)`}
            >
              <ShoppingCart size={20} />
              {itemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 h-5 w-5 flex items-center justify-center text-xs font-bold rounded-full bg-[var(--color-primary)] text-white">
                  {itemCount > 99 ? "99+" : itemCount}
                </span>
              )}
            </button>

            {/* User menu */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen((v) => !v)}
                  className="flex items-center gap-1.5 pl-1 pr-2 py-1 rounded-lg hover:bg-[var(--color-background)] transition-colors"
                  aria-expanded={userMenuOpen}
                  aria-haspopup="true"
                >
                  <Avatar src={user.avatar} name={user.name} size="sm" />
                  <ChevronDown size={14} className="text-[var(--color-text-muted)] hidden sm:block" />
                </button>

                <AnimatePresence>
                  {userMenuOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} />
                      <motion.div
                        className="absolute right-0 mt-2 w-52 card py-1 z-20"
                        initial={{ opacity: 0, y: -8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.96 }}
                        transition={{ duration: 0.15 }}
                      >
                        <div className="px-3 py-2 border-b border-[var(--color-border)] mb-1">
                          <p className="text-sm font-semibold text-[var(--color-text)] truncate">{user.name}</p>
                          <p className="text-xs text-[var(--color-text-muted)] truncate">{user.email}</p>
                        </div>
                        {[
                          { icon: User,    label: "Profile",      to: "/profile" },
                          { icon: Package, label: "My Orders",    to: "/profile?tab=orders" },
                          { icon: Heart,   label: "Wishlist",     to: "/wishlist" },
                          ...(user.role === "admin" ? [{ icon: Settings, label: "Admin Panel", to: "/admin" }] : []),
                        ].map(({ icon: Icon, label, to }) => (
                          <Link
                            key={to}
                            to={to}
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-background)] transition-colors"
                          >
                            <Icon size={15} />
                            {label}
                          </Link>
                        ))}
                        <div className="border-t border-[var(--color-border)] mt-1 pt-1">
                          <button
                            onClick={handleLogout}
                            className="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-[var(--color-error)] hover:bg-[var(--color-background)] transition-colors"
                          >
                            <LogOut size={15} />
                            Sign out
                          </button>
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link to="/login" className="btn btn-ghost text-sm px-3 py-1.5">Sign in</Link>
                <Link to="/register" className="btn btn-primary text-sm px-3 py-1.5">Sign up</Link>
              </div>
            )}

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen((v) => !v)}
              className="p-2 rounded-lg text-[var(--color-text-muted)] hover:bg-[var(--color-background)] md:hidden transition-colors"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              className="md:hidden border-t border-[var(--color-border)] py-3 space-y-1"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
            >
              {/* Mobile search */}
              <form onSubmit={handleSearch} className="px-1 pb-2">
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
                  <input
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search products…"
                    className="input pl-9 py-2 text-sm"
                  />
                </div>
              </form>

              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      "block px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                      isActive
                        ? "text-[var(--color-primary)] bg-[var(--color-primary-light)]"
                        : "text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-background)]"
                    )
                  }
                >
                  {link.label}
                </NavLink>
              ))}

              {!user && (
                <div className="flex gap-2 pt-2 px-1">
                  <Link to="/login" onClick={() => setMobileOpen(false)} className="btn btn-secondary text-sm flex-1 py-2">Sign in</Link>
                  <Link to="/register" onClick={() => setMobileOpen(false)} className="btn btn-primary text-sm flex-1 py-2">Sign up</Link>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}

Navbar.propTypes = { onCartOpen: PropTypes.func.isRequired };
