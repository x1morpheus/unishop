import { useContext } from "react";
import { AuthContext } from "@/context/AuthContext";

/**
 * Returns auth state and actions from AuthContext.
 *
 * @returns {{
 *   user: object|null,
 *   accessToken: string|null,
 *   status: "idle"|"loading"|"authenticated"|"unauthenticated",
 *   isAuthenticated: boolean,
 *   isLoading: boolean,
 *   login: (creds: object) => Promise<object>,
 *   register: (body: object) => Promise<object>,
 *   logout: () => Promise<void>,
 *   updateUser: (patch: object) => void,
 * }}
 */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
