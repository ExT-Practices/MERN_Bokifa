import api from "./axios";

// Get logged-in user's addresses
export const getAddresses = async () => {
  const response = await api.get("/addresses");
  return response.data;
};

// Create new address
export const createAddress = async (addressData) => {
  const response = await api.post("/addresses", addressData);
  return response.data;
};

// Get single address
export const getAddressById = async (id) => {
  const response = await api.get(`/addresses/${id}`);
  return response.data;
};

// Update address
export const updateAddress = async (id, addressData) => {
  const response = await api.put(`/addresses/${id}`, addressData);
  return response.data;
};

// Delete address
export const deleteAddress = async (id) => {
  const response = await api.delete(`/addresses/${id}`);
  return response.data;
};
