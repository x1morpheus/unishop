import axios from "axios";

/**
 * Singleton axios instance for all API calls.
 * - Automatically attaches the in-memory access token to every request.
 * - On 401, silently calls /auth/refresh, stores the new token, retries once.
 * - On refresh failure, dispatches a custom "auth:logout" event so AuthContext clears state.
 *
 * Components/services NEVER import axios directly — always import this instance.
 */

const BASE_URL = import.meta.env.VITE_API_URL || "/api";

export const api = axios.create({
  baseURL:        BASE_URL,
  withCredentials: true, // send httpOnly refresh cookie on every request
  headers: { "Content-Type": "application/json" },
});

/* ── In-memory token store ─────────────────────────────────────────────────── */
// Access token lives ONLY here — never localStorage, never a cookie readable by JS.
let _accessToken = null;

export const setAccessToken  = (token) => { _accessToken = token; };
export const getAccessToken  = ()      => _accessToken;
export const clearAccessToken = ()     => { _accessToken = null; };

/* ── Request interceptor — attach Bearer token ──────────────────────────────── */
api.interceptors.request.use(
  (config) => {
    if (_accessToken) {
      config.headers.Authorization = `Bearer ${_accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/* ── Response interceptor — silent token refresh on 401 ────────────────────── */
let _isRefreshing = false;
let _refreshQueue = []; // queued requests while refresh is in flight

const processQueue = (error, token = null) => {
  _refreshQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token);
  });
  _refreshQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    // Only intercept 401s that haven't already been retried
    // and aren't the refresh endpoint itself (prevent infinite loops)
    if (
      error.response?.status === 401 &&
      !original._retry &&
      !original.url?.includes("/auth/refresh") &&
      !original.url?.includes("/auth/login")
    ) {
      if (_isRefreshing) {
        // Queue the request until the ongoing refresh resolves
        return new Promise((resolve, reject) => {
          _refreshQueue.push({ resolve, reject });
        })
          .then((token) => {
            original.headers.Authorization = `Bearer ${token}`;
            return api(original);
          })
          .catch((err) => Promise.reject(err));
      }

      original._retry  = true;
      _isRefreshing    = true;

      try {
        const { data } = await api.post("/auth/refresh");
        const newToken = data.data.accessToken;

        setAccessToken(newToken);
        processQueue(null, newToken);

        original.headers.Authorization = `Bearer ${newToken}`;
        return api(original);
      } catch (refreshError) {
        processQueue(refreshError, null);
        clearAccessToken();
        // Signal AuthContext to clear user state and redirect to login
        window.dispatchEvent(new CustomEvent("auth:logout"));
        return Promise.reject(refreshError);
      } finally {
        _isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
