import api from "./axios";

export const getAdminStats = async () => {
  const response = await api.get("/orders/admin/stats");
  return response.data;
};
