import jwt from "jsonwebtoken";

export const generateAccessToken = (payload) =>
  jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRES || "15m",
  });

export const generateRefreshToken = (payload) =>
  jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRES || "7d",
  });

export const verifyAccessToken = (token) =>
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

export const verifyRefreshToken = (token) =>
  jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);

/**
 * Cookie options for the refresh token.
 *
 * sameSite: "strict" blocks the cookie when the frontend and backend are on
 * different ports (e.g. Vite :5173 → Express :5000) because the browser treats
 * different ports as different sites in strict mode.
 * Use "lax" in development so the cookie is sent on same-origin navigation and
 * XHR/fetch calls — still safe because refresh tokens aren't sent on cross-site GETs.
 * In production on the same domain, "strict" is restored.
 */
export const refreshCookieOptions = (clear = false) => ({
  httpOnly: true,
  secure:   process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
  maxAge:   clear ? 0 : 7 * 24 * 60 * 60 * 1000,
  path:     "/",
});
