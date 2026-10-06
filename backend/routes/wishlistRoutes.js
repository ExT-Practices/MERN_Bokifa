import express from "express";

import {
  addToWishlist,
  getWishlist,
  removeFromWishlist,
} from "../controllers/wishlistController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Add product to wishlist
router.post("/:product_id", authMiddleware, addToWishlist);

// Get my wishlist
router.get("/", authMiddleware, getWishlist);

// Remove product from wishlist
router.delete("/:product_id", authMiddleware, removeFromWishlist);

export default router;
