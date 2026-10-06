import express from "express";

import {
  createAddress,
  getAddresses,
  getAddressById,
  updateAddress,
  deleteAddress,
} from "../controllers/addressController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Add address
router.post("/", authMiddleware, createAddress);

// Get all my addresses
router.get("/", authMiddleware, getAddresses);

// Get single address
router.get("/:id", authMiddleware, getAddressById);

// Update address
router.put("/:id", authMiddleware, updateAddress);

// Delete address
router.delete("/:id", authMiddleware, deleteAddress);

export default router;