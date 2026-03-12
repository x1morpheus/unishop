import { createContext, useReducer, useEffect, useCallback, useMemo } from "react";
import PropTypes from "prop-types";
import { authService } from "@/services/auth.service";
import { setAccessToken, clearAccessToken } from "@/services/api";

/* ── State shape ───────────────────────────────────────────────────────────── */
const initialState = {
  user:        null,
  accessToken: null,
  status:      "idle", // "idle" | "loading" | "authenticated" | "unauthenticated"
};

/* ── Reducer ───────────────────────────────────────────────────────────────── */
const authReducer = (state, action) => {
  switch (action.type) {
    case "AUTH_LOADING":
      return { ...state, status: "loading" };

    case "LOGIN":
      return {
        ...state,
        user:        action.payload.user,
        accessToken: action.payload.accessToken,
        status:      "authenticated",
      };

    case "LOGOUT":
      return { ...initialState, status: "unauthenticated" };

    case "REFRESH":
      return {
        ...state,
        accessToken: action.payload.accessToken,
        status:      "authenticated",
      };

    case "UPDATE_USER":
      return { ...state, user: { ...state.user, ...action.payload } };

    default:
      return state;
  }
};

/* ── Context ───────────────────────────────────────────────────────────────── */
export const AuthContext = createContext(null);

/**
 * @param {{ children: React.ReactNode }} props
 */
export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  /* ── Silent refresh on app mount ─────────────────────────────────────────── */
  useEffect(() => {
    const silentRefresh = async () => {
      dispatch({ type: "AUTH_LOADING" });
      try {
        const res = await authService.refresh();
        const { accessToken } = res.data;
        setAccessToken(accessToken);

        const meRes = await authService.getMe();
        dispatch({ type: "LOGIN", payload: { user: meRes.data, accessToken } });
      } catch {
        // No valid refresh cookie — user is a guest
        dispatch({ type: "LOGOUT" });
      }
    };
    silentRefresh();
  }, []);

  /* ── Listen for forced logout (from api.js interceptor on refresh failure) ── */
  useEffect(() => {
    const handleForceLogout = () => {
      clearAccessToken();
      dispatch({ type: "LOGOUT" });
    };
    window.addEventListener("auth:logout", handleForceLogout);
    return () => window.removeEventListener("auth:logout", handleForceLogout);
  }, []);

  /* ── Actions ─────────────────────────────────────────────────────────────── */
  const login = useCallback(async (credentials) => {
    const res = await authService.login(credentials);
    const { user, accessToken } = res.data;
    setAccessToken(accessToken);
    dispatch({ type: "LOGIN", payload: { user, accessToken } });
    return user;
  }, []);

  const register = useCallback(async (body) => {
    const res = await authService.register(body);
    const { user, accessToken } = res.data;
    setAccessToken(accessToken);
    dispatch({ type: "LOGIN", payload: { user, accessToken } });
    return user;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } finally {
      clearAccessToken();
      dispatch({ type: "LOGOUT" });
    }
  }, []);

  const updateUser = useCallback((patch) => {
    dispatch({ type: "UPDATE_USER", payload: patch });
  }, []);

  const value = useMemo(
    () => ({
      user:            state.user,
      accessToken:     state.accessToken,
      status:          state.status,
      isAuthenticated: state.status === "authenticated",
      isLoading:       state.status === "loading" || state.status === "idle",
      login,
      register,
      logout,
      updateUser,
    }),
    [state, login, register, logout, updateUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

AuthProvider.propTypes = { children: PropTypes.node.isRequired };
