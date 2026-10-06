import express from "express";
import {
  registerUser,
  loginUser,
  getProfile,
  updateProfile,
  changePassword,
  getAllUsers,
  getAdminUserById,
  getAdminUserOrders,
  updateUserStatus,
  getUserPreferences,
  updateUserPreferences,
  forgotPassword,
  verifyPasswordOtp,
  resetPassword,
} from "../controllers/userController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import adminMiddleware from "../middleware/adminMiddleware.js";

const router = express.Router();

router.get("/admin/all", authMiddleware, adminMiddleware, getAllUsers);
router.get(
  "/admin/:id/orders",
  authMiddleware,
  adminMiddleware,
  getAdminUserOrders,
);
router.get("/admin/:id", authMiddleware, adminMiddleware, getAdminUserById);
router.put(
  "/admin/:id/status",
  authMiddleware,
  adminMiddleware,
  updateUserStatus,
);
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/forgot-password", forgotPassword);
router.post("/verify-password-otp", verifyPasswordOtp);
router.post("/reset-password", resetPassword);
router.get("/profile", authMiddleware, getProfile);
router.put("/profile", authMiddleware, updateProfile);
router.get("/preferences", authMiddleware, getUserPreferences);

router.put("/preferences", authMiddleware, updateUserPreferences);

router.put("/change-password", authMiddleware, changePassword);
export default router;
