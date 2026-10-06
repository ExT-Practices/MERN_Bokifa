import api from "../api/axios";

export const registerServiceWorker = async () => {
  if (!("serviceWorker" in navigator)) {
    console.log("❌ Service Worker is not supported");
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register("/sw.js");

    console.log("✅ Service Worker registered");

    return registration;
  } catch (error) {
    console.error("❌ Service Worker registration failed:", error);
    return null;
  }
};

export const requestNotificationPermission = async () => {
  if (!("Notification" in window)) {
    console.log("❌ Browser notifications are not supported");
    return "unsupported";
  }

  // Already allowed
  if (Notification.permission === "granted") {
    return "granted";
  }

  // Already denied
  if (Notification.permission === "denied") {
    console.log("⚠️ Notification permission was denied");
    return "denied";
  }

  const permission = await Notification.requestPermission();

  console.log("🔔 Notification permission:", permission);

  return permission;
};

const urlBase64ToUint8Array = (base64String) => {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);

  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

  const rawData = window.atob(base64);

  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
};

const getVapidPublicKey = async () => {
  const response = await api.get("/push/public-key");

  return response.data.publicKey;
};

const savePushSubscription = async (subscription) => {
  const subscriptionJson = subscription.toJSON();

  await api.post("/push/subscribe", {
    endpoint: subscriptionJson.endpoint,
    keys: {
      p256dh: subscriptionJson.keys.p256dh,
      auth: subscriptionJson.keys.auth,
    },
  });

  console.log("✅ Push subscription saved to backend");
};

export const setupPushNotifications = async () => {
  try {
    // User login nahi hai to push setup mat karo
    const token = localStorage.getItem("token");

    if (!token) {
      console.log("ℹ️ User is not logged in");
      return null;
    }

    // 1. Register Service Worker
    const registration = await registerServiceWorker();

    if (!registration) {
      return null;
    }

    // 2. Request notification permission
    const permission = await requestNotificationPermission();

    if (permission !== "granted") {
      return null;
    }

    // 3. Get VAPID public key
    const publicKey = await getVapidPublicKey();

    if (!publicKey) {
      console.error("❌ VAPID public key not received");
      return null;
    }

    // 4. Check existing subscription
    let subscription = await registration.pushManager.getSubscription();

    // 5. Create subscription if it doesn't exist
    if (!subscription) {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });

      console.log("✅ New push subscription created");
    } else {
      console.log("ℹ️ Existing push subscription found");
    }

    // 6. Save subscription to backend
    await savePushSubscription(subscription);

    return subscription;
  } catch (error) {
    console.error("❌ Push notification setup failed:", error);

    return null;
  }
};

export const unsubscribeFromPushNotifications = async () => {
  try {
    if (!("serviceWorker" in navigator)) {
      return;
    }

    const registration =
      await navigator.serviceWorker.getRegistration("/sw.js");

    if (!registration) {
      return;
    }

    const subscription = await registration.pushManager.getSubscription();

    if (!subscription) {
      return;
    }

    const endpoint = subscription.endpoint;

    // Backend DB se subscription remove
    try {
      await api.delete("/push/unsubscribe", {
        data: {
          endpoint,
        },
      });

      console.log("✅ Push subscription removed from backend");
    } catch (error) {
      console.error(
        "⚠️ Failed to remove subscription from backend:",
        error.message,
      );
    }

    // Browser subscription remove
    await subscription.unsubscribe();

    console.log("🔕 Push subscription unsubscribed from browser");
  } catch (error) {
    console.error("❌ Failed to unsubscribe push notifications:", error);
  }
};
