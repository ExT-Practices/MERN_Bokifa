import { Op, fn, col, literal } from "sequelize";
import Order from "../models/Order.js";
import OrderItem from "../models/OrderItem.js";
import Cart from "../models/Cart.js";
import CartItem from "../models/CartItem.js";
import Product from "../models/Product.js";
import Address from "../models/Address.js";
import User from "../models/User.js";
import { sendOrderStatusEmail } from "../services/orderStatusEmailService.js";
import { createNotification } from "../services/notificationService.js";
// Create order from cart
export const createOrder = async (req, res) => {
  const transaction = await Order.sequelize.transaction();

  try {
    const user_id = req.user.id;

    const { address_id, payment_method = "cod" } = req.body;

    // Validate address_id
    if (!address_id) {
      await transaction.rollback();

      return res.status(400).json({
        success: false,
        message: "Address is required",
      });
    }

    // Validate payment method
    if (!["cod", "online"].includes(payment_method)) {
      await transaction.rollback();

      return res.status(400).json({
        success: false,
        message: "Invalid payment method",
      });
    }

    // Find user's address
    const address = await Address.findOne({
      where: {
        address_id,
        user_id,
      },
      transaction,
    });

    if (!address) {
      await transaction.rollback();

      return res.status(404).json({
        success: false,
        message: "Address not found",
      });
    }

    // Find active cart
    const cart = await Cart.findOne({
      where: {
        user_id,
        status: "active",
      },
      transaction,
    });

    if (!cart) {
      await transaction.rollback();

      return res.status(400).json({
        success: false,
        message: "Cart is empty",
      });
    }

    // Get cart items with products
    const cartItems = await CartItem.findAll({
      where: {
        cart_id: cart.cart_id,
      },

      include: [
        {
          model: Product,
          as: "product",
          where: {
            is_active: true,
          },
        },
      ],

      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (cartItems.length === 0) {
      await transaction.rollback();

      return res.status(400).json({
        success: false,
        message: "Cart is empty",
      });
    }

    let subtotal = 0;

    // Validate stock and calculate subtotal
    for (const cartItem of cartItems) {
      const product = cartItem.product;

      if (product.stock_quantity < cartItem.quantity) {
        await transaction.rollback();

        return res.status(400).json({
          success: false,
          message: `Only ${product.stock_quantity} items available for "${product.title}"`,
        });
      }

      const itemSubtotal = Number(product.price) * cartItem.quantity;

      subtotal += itemSubtotal;
    }

    // Shipping charge
    const shipping_charge = 0;

    // Discount
    const discount = 0;

    // Final total
    const total_amount = subtotal + shipping_charge - discount;

    // Generate unique order number
    const order_number =
      "BOK-" + Date.now() + "-" + Math.floor(1000 + Math.random() * 9000);

    // Create order
    const order = await Order.create(
      {
        user_id,
        order_number,
        status: "confirmed",
        payment_status: payment_method === "cod" ? "pending" : "pending",
        payment_method,

        subtotal: Number(subtotal.toFixed(2)),
        shipping_charge,
        discount,
        total_amount: Number(total_amount.toFixed(2)),

        // Shipping address snapshot
        shipping_name: address.full_name,
        shipping_phone: address.phone,
        shipping_address_line1: address.address_line1,
        shipping_address_line2: address.address_line2,
        shipping_city: address.city,
        shipping_state: address.state,
        shipping_postal_code: address.postal_code,
        shipping_country: address.country,
      },
      {
        transaction,
      },
    );

    // Create order items + reduce stock
    for (const cartItem of cartItems) {
      const product = cartItem.product;

      const itemSubtotal = Number(product.price) * cartItem.quantity;

      await OrderItem.create(
        {
          order_id: order.order_id,
          product_id: product.product_id,

          // Snapshot
          product_title: product.title,
          product_price: product.price,

          quantity: cartItem.quantity,
          subtotal: Number(itemSubtotal.toFixed(2)),
        },
        {
          transaction,
        },
      );

      // Reduce stock
      product.stock_quantity = product.stock_quantity - cartItem.quantity;

      await product.save({
        transaction,
      });
    }

    // Remove all cart items
    await CartItem.destroy({
      where: {
        cart_id: cart.cart_id,
      },
      transaction,
    });

    // Keep cart for future use
    // but mark it as converted
    cart.status = "converted";

    await cart.save({
      transaction,
    });

    // Commit transaction
    await transaction.commit();

    return res.status(201).json({
      success: true,
      message: "Order created successfully",

      data: {
        order_id: order.order_id,
        order_number: order.order_number,
        status: order.status,
        payment_status: order.payment_status,
        payment_method: order.payment_method,
        subtotal: order.subtotal,
        shipping_charge: order.shipping_charge,
        discount: order.discount,
        total_amount: order.total_amount,
      },
    });
  } catch (error) {
    await transaction.rollback();

    console.error("Create Order Error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

// Get logged-in user's orders
export const getMyOrders = async (req, res) => {
  try {
    const user_id = req.user.id;

    const orders = await Order.findAll({
      where: {
        user_id,
      },

      include: [
        {
          model: OrderItem,
          as: "items",
          attributes: [
            "order_item_id",
            "product_id",
            "product_title",
            "product_price",
            "quantity",
            "subtotal",
          ],

          include: [
            {
              model: Product,
              as: "product",
              attributes: ["product_id", "title", "author", "image"],
              required: false,
            },
          ],
        },
      ],

      order: [["created_at", "DESC"]],
    });

    return res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    console.error("Get My Orders Error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

// Get single order
export const getOrderById = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { id } = req.params;

    const order = await Order.findOne({
      where: {
        order_id: id,
        user_id,
      },

      include: [
        {
          model: OrderItem,
          as: "items",

          attributes: [
            "order_item_id",
            "product_id",
            "product_title",
            "product_price",
            "quantity",
            "subtotal",
          ],

          include: [
            {
              model: Product,
              as: "product",
              attributes: ["product_id", "title", "author", "image"],
              required: false,
            },
          ],
        },
      ],
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error("Get Order Error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

// Cancel order
export const cancelOrder = async (req, res) => {
  const transaction = await Order.sequelize.transaction();

  try {
    const user_id = req.user.id;
    const { id } = req.params;

    // Find user's order
    const order = await Order.findOne({
      where: {
        order_id: id,
        user_id,
      },
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!order) {
      await transaction.rollback();

      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Check whether order can be cancelled
    const cancellableStatuses = ["pending", "confirmed", "processing"];

    if (!cancellableStatuses.includes(order.status)) {
      await transaction.rollback();

      return res.status(400).json({
        success: false,
        message: `Order cannot be cancelled because its current status is "${order.status}"`,
      });
    }

    // Get order items
    const orderItems = await OrderItem.findAll({
      where: {
        order_id: order.order_id,
      },
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    // Restore product stock
    for (const item of orderItems) {
      const product = await Product.findByPk(item.product_id, {
        transaction,
        lock: transaction.LOCK.UPDATE,
      });

      // Product may have been deleted/deactivated later
      if (product) {
        product.stock_quantity += item.quantity;

        await product.save({
          transaction,
        });
      }
    }

    // Update order status
    order.status = "cancelled";
    try {
      const notificationResult = await createNotification({
        userId: order.user_id,
        type: "order_cancelled",
        title: "Order Cancelled ❌",
        message: `Your order #${order.order_number} has been cancelled successfully.`,
        orderId: order.order_id,
      });

      if (!notificationResult.success) {
        console.error(
          "⚠️ Order cancellation notification was not created:",
          notificationResult.error,
        );
      }
    } catch (notificationError) {
      console.error(
        "⚠️ Order cancellation notification error:",
        notificationError.message,
      );
    }
    // COD order has no completed payment
    if (order.payment_method === "cod") {
      order.payment_status = "pending";
    }

    await order.save({
      transaction,
    });

    await transaction.commit();
    // Send cancellation email after successful order cancellation
    try {
      const user = await User.findByPk(order.user_id, {
        attributes: ["id", "name", "email", "order_notifications"],
      });

      if (user?.email && user.order_notifications !== false) {
        const emailResult = await sendOrderStatusEmail({
          user,
          order,
          previousStatus,
        });

        if (!emailResult.success && !emailResult.skipped) {
          console.error(
            "⚠️ Order cancellation email was not sent:",
            emailResult.error,
          );
        }
      } else {
        console.log(
          "ℹ️ Order cancellation email skipped: notifications disabled or email missing",
        );
      }
    } catch (emailError) {
      console.error("⚠️ Order cancellation email error:", emailError.message);
    }
    return res.status(200).json({
      success: true,
      message: "Order cancelled successfully",
      data: {
        order_id: order.order_id,
        order_number: order.order_number,
        status: order.status,
        payment_status: order.payment_status,
      },
    });
  } catch (error) {
    await transaction.rollback();

    console.error("Cancel Order Error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

// Admin: Get all orders
export const getAllOrders = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      status,
      payment_status,
      payment_method,
      start_date,
      end_date,
    } = req.query;

    const currentPage = Math.max(parseInt(page), 1);
    const perPage = Math.min(Math.max(parseInt(limit), 1), 100);

    const offset = (currentPage - 1) * perPage;

    const where = {};

    // Order status filter
    if (status) {
      where.status = status;
    }

    // Payment status filter
    if (payment_status) {
      where.payment_status = payment_status;
    }

    // Payment method filter
    if (payment_method) {
      where.payment_method = payment_method;
    }

    // Date filter
    if (start_date || end_date) {
      where.created_at = {};

      if (start_date) {
        where.created_at[Op.gte] = new Date(`${start_date}T00:00:00`);
      }

      if (end_date) {
        where.created_at[Op.lte] = new Date(`${end_date}T23:59:59`);
      }
    }

    // Search
    if (search.trim()) {
      const searchValue = `%${search.trim()}%`;

      where[Op.or] = [
        {
          order_number: {
            [Op.like]: searchValue,
          },
        },
        {
          shipping_name: {
            [Op.like]: searchValue,
          },
        },
        {
          shipping_phone: {
            [Op.like]: searchValue,
          },
        },
        {
          razorpay_payment_id: {
            [Op.like]: searchValue,
          },
        },
        {
          razorpay_order_id: {
            [Op.like]: searchValue,
          },
        },
        {
          "$user.name$": {
            [Op.like]: searchValue,
          },
        },
        {
          "$user.email$": {
            [Op.like]: searchValue,
          },
        },
      ];
    }

    const { count, rows } = await Order.findAndCountAll({
      where,

      subQuery: false,

      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "name", "email"],
          required: false,
        },
      ],

      distinct: true,
      col: "order_id",

      order: [["created_at", "DESC"]],

      limit: perPage,
      offset,
    });

    const totalOrders = count;
    const totalPages = Math.ceil(totalOrders / perPage);

    return res.status(200).json({
      success: true,

      data: rows,

      pagination: {
        currentPage,
        limit: perPage,
        totalOrders,
        totalPages,
        hasNextPage: currentPage < totalPages,
        hasPreviousPage: currentPage > 1,
      },
    });
  } catch (error) {
    console.error("Get All Orders Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
      error: error.message,
    });
  }
};

// Admin: Get order by ID
export const getAdminOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findByPk(id, {
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "name", "email"],
        },
        {
          model: OrderItem,
          as: "items",
          include: [
            {
              model: Product,
              as: "product",
              attributes: ["product_id", "title", "image", "author"],
            },
          ],
        },
      ],
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error("Get admin order details error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch order details",
      error: error.message,
    });
  }
};

// Admin: Update order status
export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = [
      "pending",
      "confirmed",
      "processing",
      "shipped",
      "delivered",
    ];

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status is required",
      });
    }

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order status",
      });
    }

    const order = await Order.findByPk(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (order.status === "cancelled") {
      return res.status(400).json({
        success: false,
        message: "Cancelled order status cannot be changed",
      });
    }

    if (order.status === "delivered") {
      return res.status(400).json({
        success: false,
        message: "Delivered order status cannot be changed",
      });
    }

    // Save previous status before changing it
    const previousStatus = order.status;

    // If status is already the same, do nothing
    if (previousStatus === status) {
      return res.status(400).json({
        success: false,
        message: `Order is already ${status}`,
      });
    }

    // Update order status
    order.status = status;

    await order.save();
    // 🔔 Create in-app order status notification
    try {
      const notificationMap = {
        processing: {
          type: "order_processing",
          title: "Order Processing 📦",
          message: `Your order #${order.order_number} is now being processed.`,
        },

        shipped: {
          type: "order_shipped",
          title: "Order Shipped 🚚",
          message: `Your order #${order.order_number} has been shipped.`,
        },

        delivered: {
          type: "order_delivered",
          title: "Order Delivered 🎉",
          message: `Your order #${order.order_number} has been delivered successfully.`,
        },
      };

      const notificationData = notificationMap[status];

      if (notificationData) {
        const notificationResult = await createNotification({
          userId: order.user_id,
          type: notificationData.type,
          title: notificationData.title,
          message: notificationData.message,
          orderId: order.order_id,
        });

        if (!notificationResult.success) {
          console.error(
            "⚠️ Order status notification was not created:",
            notificationResult.error,
          );
        }
      }
    } catch (notificationError) {
      console.error(
        "⚠️ Order status notification error:",
        notificationError.message,
      );
    }

    // Get customer
    const user = await User.findByPk(order.user_id, {
      attributes: ["id", "name", "email", "order_notifications"],
    });

    // Send email only when customer has email
    // and order notifications are enabled
    if (user?.email && user.order_notifications !== false) {
      const emailResult = await sendOrderStatusEmail({
        user,
        order,
        previousStatus,
      });

      if (!emailResult.success && !emailResult.skipped) {
        console.error("⚠️ Order status email was not sent:", emailResult.error);
      }
    } else {
      console.log(
        "ℹ️ Order status email skipped: notifications disabled or email missing",
      );
    }

    return res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      data: order,
    });
  } catch (error) {
    console.error("Update Order Status Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update order status",
      error: error.message,
    });
  }
};

// Admin: Cancel order
export const adminCancelOrder = async (req, res) => {
  const transaction = await Order.sequelize.transaction();

  try {
    const { id } = req.params;

    const order = await Order.findByPk(id, {
      include: [
        {
          model: OrderItem,
          as: "items",
        },
      ],
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!order) {
      await transaction.rollback();

      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Already cancelled
    const previousStatus = order.status;
    if (order.status === "cancelled") {
      await transaction.rollback();

      return res.status(400).json({
        success: false,
        message: "Order is already cancelled",
      });
    }

    // Delivered orders cannot be cancelled
    if (order.status === "delivered") {
      await transaction.rollback();

      return res.status(400).json({
        success: false,
        message: "Delivered order cannot be cancelled",
      });
    }

    // Shipped orders cannot be cancelled from admin panel
    if (order.status === "shipped") {
      await transaction.rollback();

      return res.status(400).json({
        success: false,
        message: "Shipped order cannot be cancelled",
      });
    }

    // Paid online orders need refund flow
    if (order.payment_status === "paid") {
      await transaction.rollback();

      return res.status(400).json({
        success: false,
        message:
          "Paid order cannot be cancelled directly. Refund is required first.",
      });
    }

    /*
      COD orders:
      Stock was already reduced when the order was created,
      so restore the ordered quantity.

      Online pending orders:
      Stock has NOT been reduced yet in our payment flow,
      so do not restore stock.
    */

    if (order.payment_method === "cod" && order.payment_status === "pending") {
      for (const item of order.items) {
        const product = await Product.findByPk(item.product_id, {
          transaction,
          lock: transaction.LOCK.UPDATE,
        });

        if (product) {
          product.stock_quantity += item.quantity;
          await product.save({ transaction });
        }
      }
    }

    order.status = "cancelled";
    try {
      const notificationResult = await createNotification({
        userId: order.user_id,
        type: "order_cancelled",
        title: "Order Cancelled ❌",
        message: `Your order #${order.order_number} has been cancelled successfully.`,
        orderId: order.order_id,
      });

      if (!notificationResult.success) {
        console.error(
          "⚠️ Order cancellation notification was not created:",
          notificationResult.error,
        );
      }
    } catch (notificationError) {
      console.error(
        "⚠️ Order cancellation notification error:",
        notificationError.message,
      );
    }
    await order.save({ transaction });

    await transaction.commit();

    // Send cancellation email after successful order cancellation
    try {
      const user = await User.findByPk(order.user_id, {
        attributes: ["id", "name", "email", "order_notifications"],
      });

      if (user?.email && user.order_notifications !== false) {
        const emailResult = await sendOrderStatusEmail({
          user,
          order,
          previousStatus,
        });

        if (!emailResult.success && !emailResult.skipped) {
          console.error(
            "⚠️ Order cancellation email was not sent:",
            emailResult.error,
          );
        }
      } else {
        console.log(
          "ℹ️ Order cancellation email skipped: notifications disabled or email missing",
        );
      }
    } catch (emailError) {
      console.error("⚠️ Order cancellation email error:", emailError.message);
    }

    return res.status(200).json({
      success: true,
      message: "Order cancelled successfully",
      data: order,
    });
  } catch (error) {
    await transaction.rollback();

    console.error("Admin Cancel Order Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to cancel order",
      error: error.message,
    });
  }
};

// Admin: Dashboard statistics
export const getAdminOrderStats = async (req, res) => {
  try {
    const totalOrders = await Order.count();

    const pendingOrders = await Order.count({
      where: { status: "pending" },
    });

    const confirmedOrders = await Order.count({
      where: { status: "confirmed" },
    });

    const processingOrders = await Order.count({
      where: { status: "processing" },
    });

    const shippedOrders = await Order.count({
      where: { status: "shipped" },
    });

    const deliveredOrders = await Order.count({
      where: { status: "delivered" },
    });

    const cancelledOrders = await Order.count({
      where: { status: "cancelled" },
    });

    const paidOrders = await Order.count({
      where: { payment_status: "paid" },
    });

    const pendingPayments = await Order.count({
      where: { payment_status: "pending" },
    });

    const revenueResult = await Order.sum("total_amount", {
      where: {
        payment_status: "paid",
      },
    });

    const totalRevenue = Number(revenueResult || 0);

    // Monthly Analytics for the last 6 months (Dynamic)
    const now = new Date();
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    // Start of 5 months ago (00:00:00.000)
    const startDate = new Date(
      now.getFullYear(),
      now.getMonth() - 5,
      1,
      0,
      0,
      0,
      0,
    );

    // Build the 6-month continuous template slots
    const monthlySlots = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = d.getFullYear();
      const monthNum = String(d.getMonth() + 1).padStart(2, "0");
      const key = `${year}-${monthNum}`;
      monthlySlots.push({
        key,
        month: monthNames[d.getMonth()],
        year,
        orders: 0,
        revenue: 0,
      });
    }

    // Aggregate monthly orders and revenue from database
    const monthlyRecords = await Order.findAll({
      attributes: [
        [fn("DATE_FORMAT", col("created_at"), "%Y-%m"), "monthKey"],
        [fn("COUNT", col("order_id")), "orders"],
        [
          fn(
            "COALESCE",
            fn(
              "SUM",
              literal(
                "CASE WHEN payment_status = 'paid' THEN total_amount ELSE 0 END",
              ),
            ),
            0,
          ),
          "revenue",
        ],
      ],
      where: {
        created_at: {
          [Op.gte]: startDate,
        },
      },
      group: [literal("DATE_FORMAT(created_at, '%Y-%m')")],
      raw: true,
    });

    const monthlyMap = new Map();
    monthlyRecords.forEach((item) => {
      monthlyMap.set(item.monthKey, {
        orders: parseInt(item.orders, 10) || 0,
        revenue: parseFloat(item.revenue || 0),
      });
    });

    const monthlyAnalytics = monthlySlots.map((slot) => {
      const found = monthlyMap.get(slot.key);
      return {
        month: slot.month,
        year: slot.year,
        orders: found ? found.orders : 0,
        revenue: found ? Math.round(found.revenue * 100) / 100 : 0,
      };
    });

    // Order Status Breakdown for distribution charts
    const statusCounts = await Order.findAll({
      attributes: ["status", [fn("COUNT", col("order_id")), "count"]],
      group: ["status"],
      raw: true,
    });

    const statusMap = {
      pending: 0,
      confirmed: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
    };

    statusCounts.forEach((item) => {
      if (item.status) {
        const s = String(item.status).toLowerCase();
        statusMap[s] = parseInt(item.count, 10) || 0;
      }
    });

    const orderStatusBreakdown = [
      { status: "pending", label: "Pending", count: statusMap.pending || 0 },
      {
        status: "confirmed",
        label: "Confirmed",
        count: statusMap.confirmed || 0,
      },
      {
        status: "processing",
        label: "Processing",
        count: statusMap.processing || 0,
      },
      { status: "shipped", label: "Shipped", count: statusMap.shipped || 0 },
      {
        status: "delivered",
        label: "Delivered",
        count: statusMap.delivered || 0,
      },
      {
        status: "cancelled",
        label: "Cancelled",
        count: statusMap.cancelled || 0,
      },
    ];

    return res.status(200).json({
      success: true,
      data: {
        totalOrders,
        pendingOrders,
        confirmedOrders,
        processingOrders,
        shippedOrders,
        deliveredOrders,
        cancelledOrders,
        paidOrders,
        pendingPayments,
        totalRevenue,
        monthlyAnalytics,
        orderStatusBreakdown,
      },
    });
  } catch (error) {
    console.error("Admin Order Stats Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch order statistics",
      error: error.message,
    });
  }
};
