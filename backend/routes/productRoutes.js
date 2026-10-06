import express from "express";

import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} from "../controllers/productController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import adminMiddleware from "../middleware/adminMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";
import optionalAuthMiddleware from "../middleware/optionalAuthMiddleware.js";
const router = express.Router();

// Public routes
router.get("/", optionalAuthMiddleware, getProducts);

router.get("/:id", getProductById);

// Admin-only routes
router.post(
  "/",
  authMiddleware,
  adminMiddleware,
  upload.fields([
    {
      name: "image",
      maxCount: 1,
    },
    {
      name: "images",
      maxCount: 5,
    },
  ]),
  createProduct,
);

router.put(
  "/:id",
  authMiddleware,
  adminMiddleware,
  upload.fields([
    {
      name: "image",
      maxCount: 1,
    },
    {
      name: "images",
      maxCount: 5,
    },
  ]),
  updateProduct,
);

router.delete("/:id", authMiddleware, adminMiddleware, deleteProduct);

export default router;
