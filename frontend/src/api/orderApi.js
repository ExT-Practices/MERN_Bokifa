import api from "./axios";

// Get logged-in user's orders
export const getMyOrders = async () => {
  const response = await api.get("/orders");
  return response.data;
};

// Get single order
export const getOrderById = async (id) => {
  const response = await api.get(`/orders/${id}`);
  return response.data;
};

// Cancel order
export const cancelOrder = async (id) => {
  const response = await api.put(`/orders/${id}/cancel`);
  return response.data;
};
export const getAllOrders = async (params = {}) => {
  const response = await api.get("/orders/admin/all", { params });
  return response.data;
};

export const getAdminOrderById = async (id) => {
  const response = await api.get(`/orders/admin/${id}`);
  return response.data;
};

export const updateOrderStatus = async (id, status) => {
  const response = await api.put(`/orders/admin/${id}/status`, { status });
  return response.data;
};

export const adminCancelOrder = async (id) => {
  const response = await api.put(`/orders/admin/${id}/cancel`);
  return response.data;
};

export const refundOrder = async (id) => {
  const response = await api.post(`/payments/admin/orders/${id}/refund`);
  return response.data;
};
