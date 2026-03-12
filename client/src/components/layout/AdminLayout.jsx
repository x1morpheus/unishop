import { Outlet, useLocation, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Bell, ArrowLeft } from "lucide-react";
import { AdminSidebar } from "./AdminSidebar";
import { Avatar } from "@/components/ui/Avatar";
import { useAuth } from "@/hooks/useAuth";

const pageVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit:    { opacity: 0 },
};

/** Derives a page title from the current pathname */
const getPageTitle = (pathname) => {
  const segment = pathname.split("/").filter(Boolean).pop() || "dashboard";
  return segment.charAt(0).toUpperCase() + segment.slice(1);
};

export function AdminLayout() {
  const { user } = useAuth();
  const location = useLocation();
  const title = getPageTitle(location.pathname);

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--color-background)]">
      {/* Sidebar */}
      <AdminSidebar className="hidden md:flex shrink-0" />

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="h-16 bg-[var(--color-surface)] border-b border-[var(--color-border)] flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-3">
            <Link to="/" className="hidden sm:flex items-center gap-1.5 text-xs text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors px-2.5 py-1.5 rounded-lg hover:bg-[var(--color-background)] border border-[var(--color-border)]">
              <ArrowLeft size={13} /> Back to Store
            </Link>
            <h1 className="text-lg font-semibold text-[var(--color-text)] capitalize">{title}</h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              className="p-2 rounded-lg text-[var(--color-text-muted)] hover:bg-[var(--color-background)] transition-colors relative"
              aria-label="Notifications"
            >
              <Bell size={18} />
            </button>
            <Avatar src={user?.avatar} name={user?.name} size="sm" />
          </div>
        </header>

        {/* Page content */}
        <motion.main
          key={location.pathname}
          className="flex-1 overflow-y-auto p-6"
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.2 }}
        >
          <Outlet />
        </motion.main>
      </div>
    </div>
  );
}
