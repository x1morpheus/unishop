import { Navigate, useLocation } from "react-router-dom";
import PropTypes from "prop-types";
import { useAuth } from "@/hooks/useAuth";
import { Spinner } from "@/components/ui/Spinner";

/**
 * Wraps the entire /admin subtree.
 *
 * - Loading: full-screen spinner (silent refresh in flight)
 * - Not authenticated: → /login with return-to state
 * - Authenticated but not admin: → / (silently, no error shown)
 * - Admin: renders children (AdminLayout + nested Outlet)
 *
 * @param {{ children: React.ReactNode }} props
 */
export function AdminRoute({ children }) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-adminBg,#0F172A)]">
        <Spinner size="xl" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (user?.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return children;
}

AdminRoute.propTypes = { children: PropTypes.node.isRequired };
