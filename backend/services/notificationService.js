import Notification from "../models/Notification.js";
import { sendPushNotification } from "./pushNotificationService.js";

export const createNotification = async ({
  userId,
  type,
  title,
  message,
  orderId = null,
}) => {
  try {
    if (!userId) {
      console.error("❌ Notification Error: userId is required");

      return {
        success: false,
        error: "userId is required",
      };
    }

    // --------------------------------------------------
    // 1. CREATE IN-APP NOTIFICATION
    // --------------------------------------------------

    const notification = await Notification.create({
      user_id: userId,
      type,
      title,
      message,
      order_id: orderId,
      is_read: false,
    });

    console.log(`🔔 In-App Notification created for user ${userId}: ${title}`);

    // --------------------------------------------------
    // 2. SEND WEB PUSH NOTIFICATION
    // --------------------------------------------------

    try {
      const pushResult = await sendPushNotification({
        userId,
        title,
        message,
        url: orderId ? `/account/orders/${orderId}` : "/account",
      });

      if (!pushResult.success) {
        console.error("⚠️ Push notification was not sent:", pushResult.error);
      } else {
        console.log(`📱 Push notification sent: ${pushResult.sent} device(s)`);
      }
    } catch (pushError) {
      // Push failure should NOT break the main notification
      console.error("⚠️ Push notification error:", pushError.message);
    }

    // --------------------------------------------------
    // 3. RETURN SUCCESS
    // --------------------------------------------------

    return {
      success: true,
      notification,
    };
  } catch (error) {
    console.error("❌ Notification creation failed:", error.message);

    return {
      success: false,
      error: error.message,
    };
  }
};
