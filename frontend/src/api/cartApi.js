import api from "./axios";

// Get logged-in user's cart
export const getCart = async () => {
  const response = await api.get("/cart");
  return response.data;
};

// Add product to cart
export const addToCart = async (productId, quantity = 1) => {
  const response = await api.post(`/cart/${productId}`, {
    quantity,
  });

  return response.data;
};

// Update cart item quantity
export const updateCartItem = async (productId, quantity) => {
  const response = await api.put(`/cart/${productId}`, {
    quantity,
  });

  return response.data;
};

// Remove product from cart
export const removeFromCart = async (productId) => {
  const response = await api.delete(`/cart/${productId}`);
  return response.data;
};
