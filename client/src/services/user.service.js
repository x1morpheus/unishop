import api from "./api.js";

export const userService = {
  getProfile:    ()     => api.get("/users/profile").then((r) => r.data),
  updateProfile: (body) => api.patch("/users/profile", body).then((r) => r.data),
  getMyOrders:   (params) => api.get("/users/orders", { params }).then((r) => r.data),

  getWishlist:      ()          => api.get("/users/wishlist").then((r) => r.data),
  toggleWishlist:   (productId) => api.post(`/users/wishlist/${productId}`).then((r) => r.data),

  addAddress:    (body) => api.post("/users/addresses", body).then((r) => r.data),
  updateAddress: (id, body) => api.put(`/users/addresses/${id}`, body).then((r) => r.data),
  deleteAddress: (id)   => api.delete(`/users/addresses/${id}`).then((r) => r.data),

  // Admin
  adminGetAll:   (params) => api.get("/admin/users", { params }).then((r) => r.data),
  adminGetById:  (id)     => api.get(`/admin/users/${id}`).then((r) => r.data),
  adminUpdate:   (id, body) => api.patch(`/admin/users/${id}`, body).then((r) => r.data),
  adminDelete:   (id)     => api.delete(`/admin/users/${id}`).then((r) => r.data),
};
