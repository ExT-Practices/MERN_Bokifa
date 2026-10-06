import { sendEmail } from "../services/emailService.js";
import Notification from "../models/Notification.js";
export const sendTestEmail = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const result = await sendEmail({
      to: email,
      subject: "Bokifa - Test Email",
      text: "This is a test email from Bokifa.",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2 style="color: #222;">Bokifa Test Email</h2>

          <p>Hello 👋</p>

          <p>
            This is a test email from your <strong>Bokifa</strong>
            backend notification system.
          </p>

          <p>
            If you received this email, your SMTP configuration
            is working correctly.
          </p>

          <hr />

          <p style="color: #777; font-size: 13px;">
            Bokifa Bookstore
          </p>
        </div>
      `,
    });

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: "Email sending failed",
        error: result.error,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Test email sent successfully",
      messageId: result.messageId,
    });
  } catch (error) {
    console.error("Test email error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to send test email",
      error: error.message,
    });
  }
};

export const testNotification = async (req, res) => {
  try {
    const notification = await Notification.create({
      user_id: req.user.id,
      type: "order_confirmed",
      title: "Order Confirmed 🎉",
      message: "Your order has been confirmed successfully.",
      order_id: null,
      is_read: false,
    });

    return res.status(201).json({
      success: true,
      message: "Test notification created successfully",
      data: notification,
    });
  } catch (error) {
    console.error("Test Notification Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create notification",
      error: error.message,
    });
  }
};

// Get user's notifications
export const getMyNotifications = async (req, res) => {
  try {
    const userId = req.user.id;

    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(
      Math.max(parseInt(req.query.limit, 10) || 10, 1),
      50,
    );

    const offset = (page - 1) * limit;

    const { count, rows } = await Notification.findAndCountAll({
      where: {
        user_id: userId,
      },
      order: [["created_at", "DESC"]],
      limit,
      offset,
    });

    return res.status(200).json({
      success: true,
      data: rows,
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    console.error("Get Notifications Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch notifications",
      error: error.message,
    });
  }
};

// Get unread notification count
export const getUnreadNotificationCount = async (req, res) => {
  try {
    const userId = req.user.id;

    const count = await Notification.count({
      where: {
        user_id: userId,
        is_read: false,
      },
    });

    return res.status(200).json({
      success: true,
      unreadCount: count,
    });
  } catch (error) {
    console.error("Unread Notification Count Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get unread notification count",
      error: error.message,
    });
  }
};

// Mark one notification as read
export const markNotificationAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const notification = await Notification.findOne({
      where: {
        notification_id: id,
        user_id: userId,
      },
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    if (!notification.is_read) {
      notification.is_read = true;
      await notification.save();
    }

    return res.status(200).json({
      success: true,
      message: "Notification marked as read",
      data: notification,
    });
  } catch (error) {
    console.error("Mark Notification Read Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to mark notification as read",
      error: error.message,
    });
  }
};
