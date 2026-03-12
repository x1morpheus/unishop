import { useState } from "react";
import { NavLink, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LayoutDashboard, Package, ShoppingBag, Users,
  BarChart2, Store, ChevronLeft, ChevronRight, LogOut, Tag, Zap, Settings,
} from "lucide-react";
import PropTypes from "prop-types";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/hooks/useAuth";
import { Avatar } from "@/components/ui/Avatar";
import { Tooltip } from "@/components/ui/Tooltip";
import { cn } from "@/utils/cn";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard",  to: "/admin" },
  { icon: Package,         label: "Products",   to: "/admin/products" },
  { icon: ShoppingBag,     label: "Orders",     to: "/admin/orders" },
  { icon: Users,           label: "Customers",  to: "/admin/customers" },
  { icon: BarChart2,       label: "Analytics",  to: "/admin/analytics" },
  { icon: Tag,             label: "Categories", to: "/admin/categories" },
  { icon: Zap,             label: "Flash Sales", to: "/admin/flash-sales" },
  { icon: Store,           label: "Vendors",    to: "/admin/vendors", multiOnly: true },
  { icon: Settings,        label: "Settings",   to: "/admin/settings" },
];

/**
 * @param {{ className?: string }} props
 */
export function AdminSidebar({ className }) {
  const { brand, storeMode } = useTheme();
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const visibleItems = navItems.filter(
    (item) => !item.multiOnly || storeMode === "multi"
  );

  return (
    <motion.aside
      className={cn("admin-sidebar flex flex-col h-full relative", className)}
      animate={{ width: collapsed ? 64 : 240 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-white/10 shrink-0 overflow-hidden">
        <Link to="/admin" className="shrink-0">
          <img src={brand.logo} alt={brand.name} className="h-7 w-7 object-contain" />
        </Link>
        {!collapsed && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15, delay: 0.05 }}
            className="font-semibold text-[var(--color-admin-text)] text-sm truncate"
          >
            {brand.name} Admin
          </motion.span>
        )}
      </div>

      {/* Nav items */}
      <nav className="flex-1 py-4 px-2 space-y-0.5 overflow-y-auto no-scrollbar">
        {visibleItems.map(({ icon: Icon, label, to }) => (
          <Tooltip key={to} content={label} side="right" className={cn(!collapsed && "hidden")}>
            <NavLink
              to={to}
              end={to === "/admin"}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150",
                  "text-[var(--color-admin-text)] opacity-70 hover:opacity-100 hover:bg-white/10",
                  isActive && "opacity-100 bg-white/15 text-white"
                )
              }
            >
              <Icon size={18} className="shrink-0" />
              {!collapsed && (
                <motion.span
                  animate={{ opacity: collapsed ? 0 : 1 }}
                  transition={{ duration: 0.1 }}
                  className="truncate"
                >
                  {label}
                </motion.span>
              )}
            </NavLink>
          </Tooltip>
        ))}
      </nav>

      {/* User + collapse */}
      <div className="border-t border-white/10 px-2 py-3 space-y-1 shrink-0">
        {/* User info */}
        <div className={cn(
          "flex items-center gap-3 px-3 py-2 rounded-xl overflow-hidden",
          collapsed && "justify-center"
        )}>
          <Avatar src={user?.avatar} name={user?.name} size="sm" className="shrink-0" />
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-xs font-semibold text-[var(--color-admin-text)] truncate">{user?.name}</p>
              <p className="text-[10px] text-[var(--color-admin-text)] opacity-50 truncate">{user?.email}</p>
            </div>
          )}
        </div>

        {/* Back to Store */}
        <Tooltip content="Back to Store" side="right" className={cn(!collapsed && "hidden")}>
          <Link
            to="/"
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm text-[var(--color-admin-text)] opacity-60 hover:opacity-100 hover:bg-white/10 transition-all"
          >
            <Store size={16} className="shrink-0" />
            {!collapsed && <span>Back to Store</span>}
          </Link>
        </Tooltip>

        {/* Sign out */}
        <Tooltip content="Sign out" side="right" className={cn(!collapsed && "hidden")}>
          <button
            onClick={logout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm text-[var(--color-admin-text)] opacity-60 hover:opacity-100 hover:bg-white/10 transition-all"
          >
            <LogOut size={16} className="shrink-0" />
            {!collapsed && <span>Sign out</span>}
          </button>
        </Tooltip>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed((v) => !v)}
        className="absolute -right-3 top-20 h-6 w-6 rounded-full bg-[var(--color-admin-surface)] border border-white/20 flex items-center justify-center text-[var(--color-admin-text)] hover:bg-white/10 transition-colors shadow-md z-10"
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>
    </motion.aside>
  );
}

AdminSidebar.propTypes = { className: PropTypes.string };
