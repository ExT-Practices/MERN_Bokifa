import api from "./axios";

export const loginAdmin = async (credentials) => {
  const response = await api.post("/users/login", credentials);
  return response.data;
};

export const getAdminProfile = async () => {
  const response = await api.get("/users/profile");
  return response.data;
};

export const updateAdminProfile = async (data) => {
  const response = await api.put("/users/profile", data);
  return response.data;
};

export const changeAdminPassword = async (data) => {
  const response = await api.put("/users/change-password", data);
  return response.data;
};

// Register user
export const registerUser = async (userData) => {
  const response = await api.post("/users/register", userData);
  return response.data;
};

// Login user
export const loginUser = async (loginData) => {
  const response = await api.post("/users/login", loginData);
  return response.data;
};

// Get logged-in user's profile
export const getProfile = async () => {
  const response = await api.get("/users/profile");
  return response.data;
};

// Update logged-in user's profile
export const updateProfile = async (userData) => {
  const response = await api.put("/users/profile", userData);
  return response.data;
};

// Change password
export const changePassword = async (passwordData) => {
  const response = await api.put("/users/change-password", passwordData);

  return response.data;
};

export const getUserPreferences = async () => {
  const response = await api.get("/users/preferences");
  return response.data;
};

export const updateUserPreferences = async (preferences) => {
  const response = await api.put("/users/preferences", preferences);
  return response.data;
};

export const forgotPassword = async (email) => {
  const response = await api.post("/users/forgot-password", {
    email,
  });

  return response.data;
};

export const resetPassword = async (resetData) => {
  const response = await api.post("/users/reset-password", resetData);

  return response.data;
};