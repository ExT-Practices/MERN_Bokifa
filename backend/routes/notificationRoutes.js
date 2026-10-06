import express from "express";
import { sendTestEmail } from "../controllers/notificationController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  testNotification,
  getMyNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
} from "../controllers/notificationController.js";

const router = express.Router();

router.post("/test-email", sendTestEmail);
router.post("/test", authMiddleware, testNotification);
// Get logged-in user's notifications
router.get("/", authMiddleware, getMyNotifications);

// Get unread notification count
router.get("/unread-count", authMiddleware, getUnreadNotificationCount);

// Mark notification as read
router.put("/:id/read", authMiddleware, markNotificationAsRead);
export default router;
