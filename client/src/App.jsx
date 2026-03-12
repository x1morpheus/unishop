import { lazy, Suspense } from "react";
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
  Outlet,
  useLocation,
} from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { Toaster } from "react-hot-toast";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Providers
import { ThemeProvider }      from "@/context/ThemeContext";
import { ColorModeProvider }  from "@/context/ColorModeContext";
import { AuthProvider }     from "@/context/AuthContext";
import { CartProvider }     from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";

// Layouts
import { StoreLayout } from "@/components/layout/StoreLayout";
import { AdminLayout } from "@/components/layout/AdminLayout";

// Auth guards
import { ProtectedRoute } from "./ProtectedRoute";
import { AdminRoute }     from "./AdminRoute";

// Spinner for lazy boundary
import { Spinner } from "@/components/ui/Spinner";

/* ── Lazy-load every page — zero bundle-cost until navigation ──────────────── */
const HomePage            = lazy(() => import("@/pages/store/HomePage"));
const ProductListingPage  = lazy(() => import("@/pages/store/ProductListingPage"));
const ProductDetailPage   = lazy(() => import("@/pages/store/ProductDetailPage"));
const CheckoutPage        = lazy(() => import("@/pages/store/CheckoutPage"));
const OrderSuccessPage    = lazy(() => import("@/pages/store/OrderSuccessPage"));
const ProfilePage         = lazy(() => import("@/pages/store/ProfilePage"));
const WishlistPage        = lazy(() => import("@/pages/store/WishlistPage").then(m => ({ default: m.WishlistPage })));
const SearchResultsPage   = lazy(() => import("@/pages/store/SearchResultsPage"));
const LoginPage           = lazy(() => import("@/pages/store/LoginPage"));
const RegisterPage        = lazy(() => import("@/pages/store/RegisterPage"));
const NotFoundPage        = lazy(() => import("@/pages/store/NotFoundPage"));
const SalePage            = lazy(() => import("@/pages/store/SalePage"));
const AboutPage           = lazy(() => import("@/pages/store/AboutPage"));
const TermsPage           = lazy(() => import("@/pages/store/TermsPage"));
const PrivacyPage         = lazy(() => import("@/pages/store/PrivacyPage"));

const AdminDashboard  = lazy(() => import("@/pages/admin/AdminDashboard"));
const AdminProducts   = lazy(() => import("@/pages/admin/AdminProducts"));
const AdminOrders     = lazy(() => import("@/pages/admin/AdminOrders"));
const AdminCustomers  = lazy(() => import("@/pages/admin/AdminCustomers"));
const AdminAnalytics  = lazy(() => import("@/pages/admin/AdminAnalytics"));
const AdminVendors    = lazy(() => import("@/pages/admin/AdminVendors"));
const AdminCategories = lazy(() => import("@/pages/admin/AdminCategories"));
const AdminFlashSales  = lazy(() => import("@/pages/admin/AdminFlashSales"));
const AdminSettings    = lazy(() => import("@/pages/admin/AdminSettings"));

/* ── TanStack Query client — global error/retry config ────────────────────── */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime:      1000 * 60 * 2,  // 2 minutes
      retry:          1,
      refetchOnWindowFocus: false,
    },
  },
});

/* ── Full-screen lazy boundary ──────────────────────────────────────────────── */
function PageFallback() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <Spinner size="xl" />
    </div>
  );
}

/* ── Animated outlet — wraps each route group for page transitions ──────────── */
function AnimatedOutlet() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait" initial={false}>
      <Outlet key={location.pathname} />
    </AnimatePresence>
  );
}

/* ── Router definition ──────────────────────────────────────────────────────── */
const router = createBrowserRouter([
  /* ── Store routes ──────────────────────────────────────────────────────── */
  {
    element: <StoreLayout />,
    children: [
      {
        element: (
          <Suspense fallback={<PageFallback />}>
            <AnimatedOutlet />
          </Suspense>
        ),
        children: [
          { index: true,             element: <HomePage /> },
          { path: "products",        element: <ProductListingPage /> },
          { path: "products/:slug",  element: <ProductDetailPage /> },
          { path: "search",          element: <SearchResultsPage /> },
          { path: "sale",            element: <SalePage /> },
          { path: "about",           element: <AboutPage /> },
          { path: "terms",           element: <TermsPage /> },
          { path: "privacy",         element: <PrivacyPage /> },

          // Auth-required store pages
          {
            element: <ProtectedRoute />,
            children: [
              { path: "checkout",        element: <CheckoutPage /> },
              { path: "order-success",   element: <OrderSuccessPage /> },
              { path: "profile",         element: <ProfilePage /> },
              { path: "wishlist",        element: <WishlistPage /> },
            ],
          },

          // Auth pages — redirect home if already signed in
          { path: "login",    element: <LoginPage /> },
          { path: "register", element: <RegisterPage /> },
        ],
      },
    ],
  },

  /* ── Admin routes ──────────────────────────────────────────────────────── */
  {
    path: "admin",
    element: (
      <AdminRoute>
        <AdminLayout />
      </AdminRoute>
    ),
    children: [
      {
        element: (
          <Suspense fallback={<PageFallback />}>
            <AnimatedOutlet />
          </Suspense>
        ),
        children: [
          { index: true,         element: <AdminDashboard /> },
          { path: "products",    element: <AdminProducts /> },
          { path: "orders",      element: <AdminOrders /> },
          { path: "customers",   element: <AdminCustomers /> },
          { path: "analytics",   element: <AdminAnalytics /> },
          { path: "vendors",      element: <AdminVendors /> },
          { path: "categories",   element: <AdminCategories /> },
          { path: "flash-sales",  element: <AdminFlashSales /> },
          { path: "settings",     element: <AdminSettings /> },
        ],
      },
    ],
  },

  /* ── Catch-all ─────────────────────────────────────────────────────────── */
  {
    path: "*",
    element: (
      <Suspense fallback={<PageFallback />}>
        <NotFoundPage />
      </Suspense>
    ),
  },
]);

/* ── Root App — all providers nested outermost-first ───────────────────────── */
export default function App() {
  return (
    <ThemeProvider>
      <ColorModeProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <RouterProvider router={router} />
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 3500,
                  style: {
                    background: "var(--color-surface)",
                    color:      "var(--color-text)",
                    border:     "1px solid var(--color-border)",
                    borderRadius: "var(--border-radius)",
                    fontSize:   "0.875rem",
                    fontFamily: "var(--font-body)",
                    boxShadow:  "0 4px 24px 0 rgb(0 0 0 / 0.08)",
                  },
                  success: { iconTheme: { primary: "var(--color-success)", secondary: "#fff" } },
                  error:   { iconTheme: { primary: "var(--color-error)",   secondary: "#fff" } },
                }}
              />
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </QueryClientProvider>
      </ColorModeProvider>
    </ThemeProvider>
  );
}
