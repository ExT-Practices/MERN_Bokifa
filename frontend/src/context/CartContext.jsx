import React, { createContext, useContext, useEffect, useState } from "react";

import {
  getCart,
  addToCart as addToCartApi,
  updateCartItem as updateCartItemApi,
  removeFromCart as removeFromCartApi,
} from "../api/cartApi";

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [isCartOpen, setIsCartOpen] = useState(false);

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);
  const [cart, setCart] = useState({
    cart_id: null,
    items: [],
    totalItems: 0,
    totalAmount: 0,
  });

  const [cartLoading, setCartLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);

  // Load cart from backend
  const loadCart = async () => {
    const token = localStorage.getItem("token");

    // User is not logged in
    if (!token) {
      setCart({
        cart_id: null,
        items: [],
        totalItems: 0,
        totalAmount: 0,
      });
      return;
    }

    try {
      setCartLoading(true);

      const response = await getCart();

      if (response?.success) {
        setCart(
          response.data || {
            cart_id: null,
            items: [],
            totalItems: 0,
            totalAmount: 0,
          },
        );
      }
    } catch (error) {
      console.error("Load Cart Error:", error);

      // If cart request fails, don't break the whole application
      setCart({
        cart_id: null,
        items: [],
        totalItems: 0,
        totalAmount: 0,
      });
    } finally {
      setCartLoading(false);
    }
  };

  // Add product
  const addToCart = async (productId, quantity = 1) => {
    try {
      const response = await addToCartApi(productId, quantity);

      if (response?.success) {
        await loadCart();

        // Automatically open Cart Sidebar
        openCart();
      }

      return response;
    } catch (error) {
      console.error("Add To Cart Error:", error);
      throw error;
    }
  };

  // Update quantity
  const updateCartItem = async (productId, quantity) => {
    try {
      setUpdatingId(productId);

      const response = await updateCartItemApi(productId, quantity);

      if (response?.success) {
        await loadCart();
      }

      return response;
    } catch (error) {
      console.error("Update Cart Item Error:", error);

      throw error;
    } finally {
      setUpdatingId(null);
    }
  };

  // Remove item
  const removeFromCart = async (productId) => {
    try {
      setUpdatingId(productId);

      const response = await removeFromCartApi(productId);

      if (response?.success) {
        await loadCart();
      }

      return response;
    } catch (error) {
      console.error("Remove From Cart Error:", error);

      throw error;
    } finally {
      setUpdatingId(null);
    }
  };

  // Clear frontend cart state
  const clearCart = () => {
    setCart({
      cart_id: null,
      items: [],
      totalItems: 0,
      totalAmount: 0,
    });
  };

  // Load cart when user is logged in
  useEffect(() => {
    loadCart();
  }, []);

  const value = {
    cart,
    cartLoading,
    updatingId,
    isCartOpen,
    openCart,
    closeCart,
    loadCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used inside CartProvider");
  }

  return context;
};

export default CartContext;
