import PushSubscription from "../models/PushSubscription.js";

export const getVapidPublicKey = async (req, res) => {
  try {
    res.json({
      success: true,
      publicKey: process.env.VAPID_PUBLIC_KEY,
    });
  } catch (error) {
    console.error("VAPID public key error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to get VAPID public key",
    });
  }
};

export const savePushSubscription = async (req, res) => {
  try {
    const userId = req.user.id;

    const { endpoint, keys } = req.body;

    if (!endpoint || !keys?.p256dh || !keys?.auth) {
      return res.status(400).json({
        success: false,
        message: "Invalid push subscription",
      });
    }

    // Same browser/device endpoint ko find karo
    const existingSubscription = await PushSubscription.findOne({
      where: {
        endpoint,
      },
    });

    if (existingSubscription) {
      // Agar same device kisi aur user ke account se linked tha,
      // to current logged-in user ke account se link kar do.
      existingSubscription.user_id = userId;
      existingSubscription.p256dh = keys.p256dh;
      existingSubscription.auth = keys.auth;

      await existingSubscription.save();

      console.log(`🔄 Push subscription reassigned to user ${userId}`);

      return res.status(200).json({
        success: true,
        message: "Push subscription updated successfully",
      });
    }

    // New device/browser subscription
    await PushSubscription.create({
      user_id: userId,
      endpoint,
      p256dh: keys.p256dh,
      auth: keys.auth,
    });

    console.log(`✅ New push subscription saved for user ${userId}`);

    return res.status(201).json({
      success: true,
      message: "Push subscription saved successfully",
    });
  } catch (error) {
    console.error("❌ Save push subscription error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to save push subscription",
    });
  }
};

export const sendTestPushNotification = async (req, res) => {
  try {
    const userId = req.user.id;

    const { sendPushNotification } =
      await import("../services/pushNotificationService.js");

    const result = await sendPushNotification({
      userId,
      title: "Bokifa Test Notification 🔔",
      message: "Push notification successfully working! 🎉",
      url: "/account",
    });

    return res.status(200).json({
      success: true,
      message: "Test push notification sent",
      data: result,
    });
  } catch (error) {
    console.error("❌ Test push notification error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to send test push notification",
    });
  }
};

export const removePushSubscription = async (req, res) => {
  try {
    const userId = req.user.id;
    const { endpoint } = req.body;

    if (!endpoint) {
      return res.status(400).json({
        success: false,
        message: "Endpoint is required",
      });
    }

    const deletedCount = await PushSubscription.destroy({
      where: {
        user_id: userId,
        endpoint,
      },
    });

    console.log(
      `🔕 Push subscription removed for user ${userId}: ${deletedCount}`,
    );

    return res.status(200).json({
      success: true,
      message: "Push subscription removed successfully",
    });
  } catch (error) {
    console.error("❌ Remove push subscription error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to remove push subscription",
    });
  }
};
