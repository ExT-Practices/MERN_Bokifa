import React, { createContext, useContext, useEffect, useState } from "react";

import {
  getProfile,
  updateProfile as updateProfileApi,
  changePassword as changePasswordApi,
  getUserPreferences,
  updateUserPreferences as updateUserPreferencesApi,
} from "../../api/authApi";

import {
  initialMockOrders,
  initialMockSettings,
} from "../data/mockAccountData";
import {
  getAddresses,
  createAddress,
  updateAddress as updateAddressApi,
  deleteAddress as deleteAddressApi,
} from "../../api/addressApi";
import {
  getMyOrders,
  getOrderById,
  cancelOrder as cancelOrderApi,
} from "../../api/orderApi";
import {
  setupPushNotifications,
  unsubscribeFromPushNotifications,
} from "../../utils/pushNotification";
const AccountContext = createContext(null);

export const AccountProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const [orders, setOrders] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [settings, setSettings] = useState(initialMockSettings);
  const [preferences, setPreferences] = useState({
    email_news: true,
    order_notifications: true,
    sms_alerts: false,
  });

  const [isLoggedIn, setIsLoggedIn] = useState(
    Boolean(localStorage.getItem("token")),
  );

  const [loading, setLoading] = useState(
    Boolean(localStorage.getItem("token")),
  );

  const [toastMessage, setToastMessage] = useState(null);

  // --------------------------------------------------
  // TOAST
  // --------------------------------------------------

  const showToast = (message, type = "success") => {
    setToastMessage({
      message,
      type,
    });

    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // --------------------------------------------------
  // LOAD PROFILE
  // --------------------------------------------------

  const loadProfile = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setUser(null);
      setIsLoggedIn(false);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const response = await getProfile();

      if (response?.success && response?.data) {
        setUser(response.data);
        setIsLoggedIn(true);
      } else {
        setUser(response?.data || null);
        setIsLoggedIn(Boolean(response?.data));
      }
    } catch (error) {
      console.error("Load Profile Error:", error);

      // Token invalid / expired
      if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.removeItem("token");
        setUser(null);
        setIsLoggedIn(false);
      }
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------------------
  // LOAD USER PREFERENCES
  // --------------------------------------------------

  const loadPreferences = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setPreferences({
        email_news: true,
        order_notifications: true,
        sms_alerts: false,
      });
      return;
    }

    try {
      const response = await getUserPreferences();

      if (response?.success && response?.data) {
        setPreferences({
          email_news: Boolean(response.data.email_news),
          order_notifications: Boolean(response.data.order_notifications),
          sms_alerts: Boolean(response.data.sms_alerts),
        });
      }
    } catch (error) {
      console.error("Load Preferences Error:", error);
    }
  };

  // --------------------------------------------------
  // LOAD ADDRESSES
  // --------------------------------------------------

  const loadAddresses = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setAddresses([]);
      return;
    }

    try {
      const response = await getAddresses();

      if (response?.success) {
        const formattedAddresses = (response.data || []).map((address) => {
          const nameParts = (address.full_name || "").trim().split(/\s+/);

          const firstName = nameParts.shift() || "";
          const lastName = nameParts.join(" ");

          return {
            id: address.address_id,
            address_id: address.address_id,

            firstName,
            lastName,

            addressLine1: address.address_line1 || "",
            addressLine2: address.address_line2 || "",

            city: address.city || "",
            state: address.state || "",
            postcode: address.postal_code || "",

            country: address.country || "India",
            phone: address.phone || "",

            isDefault: Boolean(address.is_default),

            addressType: address.address_type || "home",

            createdAt: address.created_at,
            updatedAt: address.updated_at,
          };
        });

        setAddresses(formattedAddresses);
      } else {
        setAddresses([]);
      }
    } catch (error) {
      console.error("Load Addresses Error:", error);

      setAddresses([]);
    }
  };
  // Load logged-in user's profile when app starts
  useEffect(() => {
    loadProfile();
    loadAddresses();
    loadOrders();
    getOrderDetails();
    cancelUserOrder();
    loadPreferences();
  }, []);
  const formatOrder = (order) => {
    const statusMap = {
      pending: {
        label: "Pending",
        bg: "#fff7ed",
        color: "#c2410c",
      },
      confirmed: {
        label: "Confirmed",
        bg: "#eff6ff",
        color: "#2563eb",
      },
      processing: {
        label: "Processing",
        bg: "#eff6ff",
        color: "#2563eb",
      },
      shipped: {
        label: "Shipped",
        bg: "#f5f3ff",
        color: "#7c3aed",
      },
      delivered: {
        label: "Delivered",
        bg: "#ecfdf3",
        color: "#027a36",
      },
      cancelled: {
        label: "Cancelled",
        bg: "#fef2f2",
        color: "#dc2626",
      },
    };

    const statusInfo = statusMap[order.status] || {
      label: order.status,
      bg: "#f1f5f9",
      color: "#475569",
    };

    const getImageUrl = (image) => {
      if (!image) return "";

      if (image.startsWith("http://") || image.startsWith("https://")) {
        return image;
      }

      if (image.startsWith("/")) {
        return `http://localhost:5000${image}`;
      }

      return `http://localhost:5000/${image}`;
    };

    const items = (order.items || []).map((item) => ({
      id: item.order_item_id,
      productId: item.product_id,

      title: item.product?.title || item.product_title || "Product",

      price: Number(item.product_price || 0),

      qty: Number(item.quantity || 0),

      image: getImageUrl(item.product?.image),

      author: item.product?.author || "",

      format: "",
    }));

    return {
      // Display ke liye order number
      id: order.order_number,

      // Backend API ke liye actual numeric primary key
      orderId: order.order_id,

      date: new Date(order.created_at).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),

      status: statusInfo.label,
      statusBg: statusInfo.bg,
      statusColor: statusInfo.color,

      paymentMethod:
        order.payment_method === "cod" ? "Cash on Delivery" : "Online Payment",

      paymentStatus: order.payment_status,

      items,

      itemsCount: items.reduce((total, item) => total + item.qty, 0),

      total: Number(order.total_amount || 0),

      trackingNumber: order.tracking_number || "Not available",

      estimatedDelivery: order.estimated_delivery || "Not available",

      shippingAddress: {
        fullName: order.shipping_name || "",
        street: order.shipping_address_line1 || "",
        addressLine2: order.shipping_address_line2 || "",
        city: order.shipping_city || "",
        state: order.shipping_state || "",
        postcode: order.shipping_postal_code || "",
        country: order.shipping_country || "India",
        phone: order.shipping_phone || "",
      },

      billingAddress: {
        fullName: order.shipping_name || "",
        street: order.shipping_address_line1 || "",
        addressLine2: order.shipping_address_line2 || "",
        city: order.shipping_city || "",
        state: order.shipping_state || "",
        postcode: order.shipping_postal_code || "",
        country: order.shipping_country || "India",
      },

      pricing: {
        subtotal: Number(order.subtotal || 0),
        shipping: Number(order.shipping_charge || 0),
        discount: Number(order.discount || 0),
        total: Number(order.total_amount || 0),
      },

      rawOrder: order,
    };
  };
  // --------------------------------------------------
  // LOAD ORDERS
  // --------------------------------------------------

  const loadOrders = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setOrders([]);
      return;
    }

    try {
      const response = await getMyOrders();

      if (response?.success) {
        const formattedOrders = (response.data || []).map(formatOrder);

        setOrders(formattedOrders);
      } else {
        setOrders([]);
      }
    } catch (error) {
      console.error("Load Orders Error:", error);
      setOrders([]);
    }
  };

  // --------------------------------------------------
  // GET ORDER DETAILS
  // --------------------------------------------------

  const getOrderDetails = async (id) => {
    try {
      const response = await getOrderById(id);

      if (!response?.success) {
        throw new Error(response?.message || "Failed to load order details");
      }

      return formatOrder(response.data);
    } catch (error) {
      console.error("Get Order Details Error:", error);
      throw error;
    }
  };

  // --------------------------------------------------
  // CANCEL ORDER
  // --------------------------------------------------

  const cancelUserOrder = async (id) => {
    try {
      const response = await cancelOrderApi(id);

      if (!response?.success) {
        throw new Error(response?.message || "Failed to cancel order");
      }

      await loadOrders();

      return response;
    } catch (error) {
      console.error("Cancel Order Error:", error);
      throw error;
    }
  };
  // --------------------------------------------------
  // LOGIN
  // --------------------------------------------------

  const login = async (userData, token) => {
    localStorage.setItem("token", token);

    setUser(userData);
    setIsLoggedIn(true);
    await setupPushNotifications();
  };

  // --------------------------------------------------
  // LOGOUT
  // --------------------------------------------------

  const logout = async () => {
    await unsubscribeFromPushNotifications();

    localStorage.removeItem("token");

    setUser(null);
    setIsLoggedIn(false);

    showToast("You have been logged out.", "info");
  };

  // --------------------------------------------------
  // UPDATE USER PREFERENCES
  // --------------------------------------------------

  const updatePreferences = async (updatedPreferences) => {
    try {
      const newPreferences = {
        ...preferences,
        ...updatedPreferences,
      };

      const response = await updateUserPreferencesApi(newPreferences);

      if (response?.success && response?.data) {
        setPreferences({
          email_news: Boolean(response.data.email_news),
          order_notifications: Boolean(response.data.order_notifications),
          sms_alerts: Boolean(response.data.sms_alerts),
        });
      }

      showToast("Account preferences saved!");

      return response;
    } catch (error) {
      console.error("Update Preferences Error:", error);

      showToast(
        error.response?.data?.message ||
          "Failed to update account preferences.",
        "error",
      );

      throw error;
    }
  };

  // --------------------------------------------------
  // UPDATE PROFILE
  // --------------------------------------------------

  const updateProfile = async (updatedDetails) => {
    try {
      const response = await updateProfileApi(updatedDetails);

      if (response?.success && response?.data) {
        setUser(response.data);
      } else if (response?.data) {
        setUser(response.data);
      }

      showToast("Personal details updated successfully!");

      return response;
    } catch (error) {
      console.error("Update Profile Error:", error);

      showToast(
        error.response?.data?.message || "Failed to update personal details.",
        "error",
      );

      throw error;
    }
  };

  // --------------------------------------------------
  // CHANGE PASSWORD
  // --------------------------------------------------

  const changePassword = async (passwordData) => {
    try {
      const response = await changePasswordApi(passwordData);

      showToast(response?.message || "Password changed successfully!");

      return response;
    } catch (error) {
      console.error("Change Password Error:", error);

      showToast(
        error.response?.data?.message || "Failed to change password.",
        "error",
      );

      throw error;
    }
  };

  // --------------------------------------------------
  // ADDRESS FUNCTIONS
  // --------------------------------------------------

  const addAddress = async (newAddr) => {
    try {
      const fullName = `${newAddr.firstName || ""} ${
        newAddr.lastName || ""
      }`.trim();

      const addressData = {
        full_name: fullName,
        phone: newAddr.phone?.trim(),
        address_line1: newAddr.addressLine1?.trim(),
        address_line2: newAddr.addressLine2?.trim() || null,
        city: newAddr.city?.trim(),
        state: newAddr.state?.trim(),
        postal_code: newAddr.postcode?.trim(),
        country: newAddr.country?.trim() || "India",
        address_type: "home",
        is_default: Boolean(newAddr.isDefault),
      };

      const response = await createAddress(addressData);

      if (response?.success && response?.data) {
        await loadAddresses();

        showToast("New address added successfully!");

        return response;
      }

      throw new Error(response?.message || "Failed to add address");
    } catch (error) {
      console.error("Add Address Error:", error);

      showToast(
        error.response?.data?.message ||
          error.message ||
          "Failed to add address.",
        "error",
      );

      throw error;
    }
  };

  const updateAddress = async (id, updatedAddr) => {
    try {
      const fullName = `${updatedAddr.firstName || ""} ${
        updatedAddr.lastName || ""
      }`.trim();

      const addressData = {
        full_name: fullName,
        phone: updatedAddr.phone?.trim(),
        address_line1: updatedAddr.addressLine1?.trim(),
        address_line2: updatedAddr.addressLine2?.trim() || null,
        city: updatedAddr.city?.trim(),
        state: updatedAddr.state?.trim(),
        postal_code: updatedAddr.postcode?.trim(),
        country: updatedAddr.country?.trim() || "India",
        address_type: "home",
        is_default: Boolean(updatedAddr.isDefault),
      };

      const response = await updateAddressApi(id, addressData);

      if (response?.success) {
        await loadAddresses();

        showToast("Address updated successfully!");

        return response;
      }

      throw new Error(response?.message || "Failed to update address");
    } catch (error) {
      console.error("Update Address Error:", error);

      showToast(
        error.response?.data?.message ||
          error.message ||
          "Failed to update address.",
        "error",
      );

      throw error;
    }
  };

  const deleteAddress = async (id) => {
    try {
      const response = await deleteAddressApi(id);

      if (response?.success) {
        await loadAddresses();

        showToast("Address removed successfully!");

        return response;
      }

      throw new Error(response?.message || "Failed to delete address");
    } catch (error) {
      console.error("Delete Address Error:", error);

      showToast(
        error.response?.data?.message ||
          error.message ||
          "Failed to delete address.",
        "error",
      );

      throw error;
    }
  };

  const setDefaultAddress = async (id) => {
    try {
      const currentAddress = addresses.find(
        (address) => address.address_id === id,
      );

      if (!currentAddress) {
        throw new Error("Address not found");
      }

      const response = await updateAddressApi(id, {
        is_default: true,
      });

      if (response?.success) {
        await loadAddresses();

        showToast("Default address updated!");

        return response;
      }

      throw new Error(response?.message || "Failed to update default address");
    } catch (error) {
      console.error("Set Default Address Error:", error);

      showToast(
        error.response?.data?.message ||
          error.message ||
          "Failed to update default address.",
        "error",
      );

      throw error;
    }
  };

  // --------------------------------------------------
  // SETTINGS
  // --------------------------------------------------

  const updateSettings = (newSettings) => {
    setSettings((prev) => ({
      ...prev,
      ...newSettings,
    }));

    showToast("Account preferences saved!");
  };

  // --------------------------------------------------
  // PROVIDER
  // --------------------------------------------------

  return (
    <AccountContext.Provider
      value={{
        user,
        orders,
        addresses,
        loadOrders,
        getOrderDetails,
        cancelUserOrder,
        settings,

        preferences,
        updatePreferences,

        isLoggedIn,
        loading,
        toastMessage,

        showToast,

        login,
        logout,
        loadProfile,

        updateProfile,
        changePassword,

        addAddress,
        updateAddress,
        deleteAddress,
        setDefaultAddress,

        updateSettings,
      }}
    >
      {children}
    </AccountContext.Provider>
  );
};

// --------------------------------------------------
// HOOK
// --------------------------------------------------

export const useAccount = () => {
  const context = useContext(AccountContext);

  if (!context) {
    throw new Error("useAccount must be used inside AccountProvider");
  }

  return context;
};
