import api from "./api.js";

/**
 * All authentication API calls.
 * Returns the raw axios response `data` payload ({ success, data, message }).
 */

export const authService = {
  /**
   * @param {{ name: string, email: string, password: string }} body
   */
  register: (body) => api.post("/auth/register", body).then((r) => r.data),

  /**
   * @param {{ email: string, password: string }} body
   */
  login: (body) => api.post("/auth/login", body).then((r) => r.data),

  /** Reads httpOnly cookie, returns new accessToken */
  refresh: () => api.post("/auth/refresh").then((r) => r.data),

  logout: () => api.post("/auth/logout").then((r) => r.data),

  getMe: () => api.get("/auth/me").then((r) => r.data),

  /**
   * @param {{ currentPassword: string, newPassword: string, confirmPassword: string }} body
   */
  changePassword: (body) => api.patch("/auth/change-password", body).then((r) => r.data),
};
