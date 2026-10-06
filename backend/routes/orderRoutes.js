import express from "express";

import {
  createOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
  getAllOrders,
  getAdminOrderById,
  updateOrderStatus,
  adminCancelOrder,
  getAdminOrderStats,
} from "../controllers/orderController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import adminMiddleware from "../middleware/adminMiddleware.js";
const router = express.Router();
router.get("/admin/all", authMiddleware, adminMiddleware, getAllOrders);

router.get("/admin/stats", authMiddleware, adminMiddleware, getAdminOrderStats);
router.get("/admin/:id", authMiddleware, adminMiddleware, getAdminOrderById);
router.put(
  "/admin/:id/status",
  authMiddleware,
  adminMiddleware,
  updateOrderStatus,
);

router.put(
  "/admin/:id/cancel",
  authMiddleware,
  adminMiddleware,
  adminCancelOrder,
);
// Create order / checkout
router.post("/", authMiddleware, createOrder);

// Get my orders
router.get("/", authMiddleware, getMyOrders);

// Get single order
router.get("/:id", authMiddleware, getOrderById);

router.put("/:id/cancel", authMiddleware, cancelOrder);
export default router;
