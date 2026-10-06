import express from "express";

import authMiddleware from "../middleware/authMiddleware.js";
import adminMiddleware from "../middleware/adminMiddleware.js";
import {
  createOnlinePaymentOrder,
  verifyOnlinePayment,
  refundOrder,
} from "../controllers/paymentController.js";

const router = express.Router();

router.post("/create-order", authMiddleware, createOnlinePaymentOrder);
router.post("/verify", authMiddleware, verifyOnlinePayment);
router.post(
  "/admin/orders/:id/refund",
  authMiddleware,
  adminMiddleware,
  refundOrder,
);
export default router;
