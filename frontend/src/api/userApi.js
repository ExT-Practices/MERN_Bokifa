import api from "./axios";

export const getAllUsers = async (params = {}) => {
  const response = await api.get("/users/admin/all", { params });
  return response.data;
};

export const getAdminUserById = async (id) => {
  const response = await api.get(`/users/admin/${id}`);
  return response.data;
};

export const getAdminUserOrders = async (id) => {
  const response = await api.get(`/users/admin/${id}/orders`);
  return response.data;
};

export const updateUserStatus = async (id, is_active) => {
  const response = await api.put(`/users/admin/${id}/status`, { is_active });
  return response.data;
};
