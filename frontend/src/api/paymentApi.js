import api from "./axios";

// Get all payments (using order administration endpoints)
export const getAllPayments = async (params = {}) => {
  const response = await api.get("/orders/admin/all", { params });
  return response.data;
};

// Get single payment / order details
export const getPaymentDetails = async (id) => {
  const response = await api.get(`/orders/admin/${id}`);
  return response.data;
};

// Process refund through existing payment controller
export const refundOrderPayment = async (id) => {
  const response = await api.post(`/payments/admin/orders/${id}/refund`);
  return response.data;
};
