import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Spinner } from "@/components/ui/Spinner";

/**
 * Wraps routes that require an authenticated user.
 *
 * - While auth status is resolving (silent refresh in flight): shows full-screen spinner
 * - Unauthenticated: redirects to /login, preserving the intended destination in location state
 * - Authenticated: renders child routes via <Outlet>
 */
export function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-background)]">
        <Spinner size="xl" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        state={{ from: location }}
        replace
      />
    );
  }

  return <Outlet />;
}
