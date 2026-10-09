import api from "./axios";

// Admin: Get all reviews with pagination, search, status, and rating filters
export const getAllReviews = async (params = {}) => {
  const response = await api.get("/reviews/admin", { params });
  return response.data;
};

// Admin: Get single review by ID
export const getReviewById = async (id) => {
  const response = await api.get(`/reviews/admin/${id}`);
  return response.data;
};

// Admin: Update review moderation status (approved, rejected, pending)
export const updateReviewStatus = async (id, status) => {
  const response = await api.put(`/reviews/admin/${id}/status`, { status });
  return response.data;
};

// Admin: Delete review
export const deleteReview = async (id) => {
  const response = await api.delete(`/reviews/admin/${id}`);
  return response.data;
};

// Customer / Public: Get approved reviews for a product
export const getProductReviews = async (productId, params = {}) => {
  const response = await api.get(`/reviews/products/${productId}`, { params });
  return response.data;
};

// Customer: Submit a new review for a product
export const submitProductReview = async (productId, reviewData) => {
  const response = await api.post(`/reviews/products/${productId}`, reviewData);
  return response.data;
};

// Customer: Get current user's review status for a product
export const getMyProductReview = async (productId) => {
  const response = await api.get(`/reviews/products/${productId}/my-review`);
  return response.data;
};
