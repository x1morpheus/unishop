import api from "./api.js";

export const orderService = {
  create: (body) => api.post("/orders", body).then((r) => r.data),

  getAll: (params) =>
    api.get("/orders", { params }).then((r) => r.data),

  getById: (id) => api.get(`/orders/${id}`).then((r) => r.data),

  cancel: (id) => api.delete(`/orders/${id}/cancel`).then((r) => r.data),

  // Admin
  updateStatus: (id, status) =>
    api.patch(`/orders/${id}/status`, { status }).then((r) => r.data),

  markPaid: (id, body) =>
    api.patch(`/orders/${id}/pay`, body).then((r) => r.data),
};
