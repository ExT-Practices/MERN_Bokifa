import express from "express";
import {
  getVapidPublicKey,
  savePushSubscription,
  sendTestPushNotification,
  removePushSubscription,
} from "../controllers/pushController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/public-key", getVapidPublicKey);

router.post("/subscribe", authMiddleware, savePushSubscription);
router.post("/test", authMiddleware, sendTestPushNotification);
router.delete("/unsubscribe", authMiddleware, removePushSubscription);
export default router;
