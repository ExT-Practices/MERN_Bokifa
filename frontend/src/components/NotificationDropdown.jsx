import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import "./notification.css";

const NotificationDropdown = () => {
  const navigate = useNavigate();
  const wrapperRef = useRef(null);

  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const isLoggedIn = Boolean(localStorage.getItem("token"));

  // --------------------------------------------------
  // FETCH NOTIFICATIONS
  // --------------------------------------------------

  const fetchNotifications = async () => {
    if (!localStorage.getItem("token")) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    try {
      setLoading(true);

      const response = await api.get("/notifications?limit=10");

      const data = response?.data;

      if (data?.success) {
        setNotifications(data.data || []);
      } else if (Array.isArray(data?.data)) {
        setNotifications(data.data);
      } else {
        setNotifications([]);
      }
    } catch (error) {
      console.error("Fetch Notifications Error:", error);

      if (error.response?.status === 401 || error.response?.status === 403) {
        setNotifications([]);
        setUnreadCount(0);
      }
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------------------
  // FETCH UNREAD COUNT
  // --------------------------------------------------

  const fetchUnreadCount = async () => {
    if (!localStorage.getItem("token")) {
      setUnreadCount(0);
      return;
    }

    try {
      const response = await api.get("/notifications/unread-count");

      const data = response?.data;

      if (data?.success) {
        setUnreadCount(
          Number(
            data.unreadCount ?? data.data?.unreadCount ?? data.data?.count ?? 0,
          ),
        );
      } else {
        setUnreadCount(Number(data?.unreadCount ?? data?.count ?? 0));
      }
    } catch (error) {
      console.error("Unread Notification Count Error:", error);
    }
  };

  // --------------------------------------------------
  // INITIAL LOAD
  // --------------------------------------------------

  useEffect(() => {
    if (!isLoggedIn) return;

    fetchUnreadCount();
    fetchNotifications();
  }, [isLoggedIn]);

  // --------------------------------------------------
  // REFRESH WHEN TAB GETS FOCUS
  // --------------------------------------------------

  useEffect(() => {
    const handleFocus = () => {
      if (localStorage.getItem("token")) {
        fetchUnreadCount();
      }
    };

    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  // --------------------------------------------------
  // CLOSE WHEN CLICKING OUTSIDE
  // --------------------------------------------------

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  // --------------------------------------------------
  // MARK AS READ
  // --------------------------------------------------

  const markAsRead = async (notification) => {
    if (notification.is_read) {
      return;
    }

    try {
      await api.put(`/notifications/${notification.notification_id}/read`);

      setNotifications((prev) =>
        prev.map((item) =>
          item.notification_id === notification.notification_id
            ? {
                ...item,
                is_read: true,
              }
            : item,
        ),
      );

      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Mark Notification Read Error:", error);
    }
  };

  // --------------------------------------------------
  // NOTIFICATION CLICK
  // --------------------------------------------------

  const handleNotificationClick = async (notification) => {
    await markAsRead(notification);

    setIsOpen(false);

    if (notification.order_id) {
      navigate(`/account/orders/${notification.order_id}`);
    }
  };

  // --------------------------------------------------
  // DATE FORMAT
  // --------------------------------------------------

  const formatNotificationDate = (date) => {
    if (!date) return "";

    const notificationDate = new Date(date);

    if (Number.isNaN(notificationDate.getTime())) {
      return "";
    }

    const now = new Date();
    const diff = now - notificationDate;

    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) {
      return "Just now";
    }

    if (minutes < 60) {
      return `${minutes} min ago`;
    }

    if (hours < 24) {
      return `${hours} hr ago`;
    }

    if (days < 7) {
      return `${days} day${days > 1 ? "s" : ""} ago`;
    }

    return notificationDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // --------------------------------------------------
  // DON'T SHOW IF NOT LOGGED IN
  // --------------------------------------------------

  if (!isLoggedIn) {
    return null;
  }

  return (
    <div className="notification-wrapper" ref={wrapperRef}>
      {/* Notification Icon */}

      <button
        type="button"
        className="header-icon header__icon-wrapper tap-target notification-trigger"
        aria-label="Notifications"
        aria-expanded={isOpen}
        onClick={() => {
          setIsOpen((prev) => !prev);

          if (!isOpen) {
            fetchNotifications();
            fetchUnreadCount();
          }
        }}
      >
        <div className="icon-header">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
          >
            <path
              d="M18 8C18 6.4087 17.3679 4.88258 16.2426 3.75736C15.1174 2.63214 13.5913 2 12 2C10.4087 2 8.88258 2.63214 7.75736 3.75736C6.63214 4.88258 6 6.4087 6 8C6 15 3 15 3 17H21C21 15 18 15 18 8Z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            <path
              d="M10 21H14"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </div>

        {unreadCount > 0 && (
          <span className="notification-count bubble-count">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}

      {isOpen && (
        <div className="notification-dropdown">
          <div className="notification-dropdown-header">
            <div>
              <h3>Notifications</h3>

              {unreadCount > 0 && <span>{unreadCount} unread</span>}
            </div>

            <button
              type="button"
              className="notification-close-btn"
              onClick={() => setIsOpen(false)}
              aria-label="Close notifications"
            >
              ×
            </button>
          </div>

          <div className="notification-list">
            {loading ? (
              <div className="notification-empty">
                <div className="notification-loader"></div>
                <p>Loading notifications...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="notification-empty">
                <div className="notification-empty-icon">
                  <i className="far fa-bell"></i>
                </div>

                <h4>No notifications</h4>

                <p>You're all caught up!</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <button
                  type="button"
                  key={notification.notification_id}
                  className={`notification-item ${
                    !notification.is_read ? "notification-item--unread" : ""
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="notification-item-icon">
                    {notification.type === "order_confirmed" && (
                      <i className="fas fa-check-circle"></i>
                    )}

                    {notification.type === "order_processing" && (
                      <i className="fas fa-box"></i>
                    )}

                    {notification.type === "order_shipped" && (
                      <i className="fas fa-truck"></i>
                    )}

                    {notification.type === "order_delivered" && (
                      <i className="fas fa-check-double"></i>
                    )}

                    {notification.type === "order_cancelled" && (
                      <i className="fas fa-times-circle"></i>
                    )}

                    {notification.type === "refund" && (
                      <i className="fas fa-money-bill-wave"></i>
                    )}

                    {![
                      "order_confirmed",
                      "order_processing",
                      "order_shipped",
                      "order_delivered",
                      "order_cancelled",
                      "refund",
                    ].includes(notification.type) && (
                      <i className="far fa-bell"></i>
                    )}
                  </div>

                  <div className="notification-item-content">
                    <div className="notification-item-title">
                      {notification.title}

                      {!notification.is_read && (
                        <span className="notification-unread-dot"></span>
                      )}
                    </div>

                    <p>{notification.message}</p>

                    <span className="notification-time">
                      {formatNotificationDate(notification.created_at)}
                    </span>
                  </div>
                </button>
              ))
            )}
          </div>

          {notifications.length > 0 && (
            <div className="notification-dropdown-footer">
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  navigate("/account");
                }}
              >
                View Account
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
