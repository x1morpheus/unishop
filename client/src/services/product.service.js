import api from "./api.js";

/**
 * @param {Record<string, any>} params - query params: page, limit, sort, search, category, etc.
 */
const toQuery = (params = {}) =>
  Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== ""));

export const productService = {
  getProducts:   (params) => api.get("/products",     { params: toQuery(params) }).then((r) => r.data),
  getCategories: ()       => api.get("/products/categories").then((r) => r.data),
  getBySlug:     (slug)   => api.get(`/products/${slug}`).then((r) => r.data),

  getFlashSales: (params) => api.get("/products/flash-sales", { params: toQuery(params) }).then((r) => r.data),

  getReviews: (id, params) =>
    api.get(`/products/${id}/reviews`, { params: toQuery(params) }).then((r) => r.data),

  createReview: (id, body) =>
    api.post(`/products/${id}/reviews`, body).then((r) => r.data),

  deleteReview: (productId, reviewId) =>
    api.delete(`/products/${productId}/reviews/${reviewId}`).then((r) => r.data),

  // Admin
  create: (body)       => api.post("/products",        body).then((r) => r.data),
  update: (id, body)   => api.put(`/products/${id}`,   body).then((r) => r.data),
  remove: (id)         => api.delete(`/products/${id}`).then((r) => r.data),
};
