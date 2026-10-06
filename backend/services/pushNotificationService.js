import webpush from "web-push";
import PushSubscription from "../models/PushSubscription.js";

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT,
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY,
);

export const sendPushNotification = async ({
  userId,
  title,
  message,
  url = "/account",
}) => {
  try {
    const subscriptions = await PushSubscription.findAll({
      where: {
        user_id: userId,
      },
    });

    if (!subscriptions.length) {
      console.log(`ℹ️ No push subscription found for user ${userId}`);
      return {
        success: true,
        sent: 0,
      };
    }

    let sent = 0;

    for (const subscription of subscriptions) {
      try {
        await webpush.sendNotification(
          {
            endpoint: subscription.endpoint,
            keys: {
              p256dh: subscription.p256dh,
              auth: subscription.auth,
            },
          },
          JSON.stringify({
            title,
            message,
            url,
          }),
        );

        sent++;
      } catch (error) {
        console.error("❌ Push notification failed:", error.message);

        // Subscription expired/invalid
        if (error.statusCode === 404 || error.statusCode === 410) {
          await subscription.destroy();
          console.log("🗑️ Invalid push subscription removed");
        }
      }
    }

    return {
      success: true,
      sent,
    };
  } catch (error) {
    console.error("❌ Push notification service error:", error.message);

    return {
      success: false,
      error: error.message,
    };
  }
};
