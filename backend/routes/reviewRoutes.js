import express from "express";
import {
  getAllReviews,
  getReviewById,
  updateReviewStatus,
  deleteReview,
  createCustomerReview,
  getMyProductReview,
  getProductApprovedReviews,
} from "../controllers/reviewController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import adminMiddleware from "../middleware/adminMiddleware.js";

const router = express.Router();

// Admin review endpoints
router.get("/admin", authMiddleware, adminMiddleware, getAllReviews);
router.get("/admin/:id", authMiddleware, adminMiddleware, getReviewById);
router.put(
  "/admin/:id/status",
  authMiddleware,
  adminMiddleware,
  updateReviewStatus,
);
router.delete("/admin/:id", authMiddleware, adminMiddleware, deleteReview);

// Public / Customer review endpoints
router.get("/product/:productId", getProductApprovedReviews);
router.get("/products/:productId", getProductApprovedReviews);

router.post("/product/:productId", authMiddleware, createCustomerReview);
router.post("/products/:productId", authMiddleware, createCustomerReview);

router.get("/product/:productId/my-review", authMiddleware, getMyProductReview);
router.get(
  "/products/:productId/my-review",
  authMiddleware,
  getMyProductReview,
);

export default router;
