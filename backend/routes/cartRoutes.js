import express from "express";

import {
  addToCart,
  getCart,
  updateCartItem,
  removeFromCart,
} from "../controllers/cartController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Add product to cart
router.post("/:product_id", authMiddleware, addToCart);

// Get logged-in user's cart
router.get("/", authMiddleware, getCart);

// Update cart item quantity
router.put("/:product_id", authMiddleware, updateCartItem);

// Remove product from cart
router.delete("/:product_id", authMiddleware, removeFromCart);

export default router;
