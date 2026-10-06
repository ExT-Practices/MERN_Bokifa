import Razorpay from "razorpay";
import { Op } from "sequelize";
import crypto from "crypto";
import Order from "../models/Order.js";
import OrderItem from "../models/OrderItem.js";
import Cart from "../models/Cart.js";
import CartItem from "../models/CartItem.js";
import Product from "../models/Product.js";
import Address from "../models/Address.js";
import User from "../models/User.js";
import { sendOrderConfirmationEmail } from "../services/emailService.js";
import { sendRefundEmail } from "../services/refundEmailService.js";
import { createNotification } from "../services/notificationService.js";
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export const createOnlinePaymentOrder = async (req, res) => {
  const transaction = await Order.sequelize.transaction();

  try {
    const user_id = req.user.id;
    const { address_id, shipping_address } = req.body;

    let address = null;

    // --------------------------------------------------
    // 1. Get saved address OR use checkout-only address
    // --------------------------------------------------
    if (address_id) {
      address = await Address.findOne({
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
    } else if (shipping_address) {
      const {
        full_name,
        phone,
        address_line1,
        address_line2,
        city,
        state,
        postal_code,
        country,
      } = shipping_address;

      if (
        !full_name ||
        !phone ||
        !address_line1 ||
        !city ||
        !state ||
        !postal_code ||
        !country
      ) {
        await transaction.rollback();

        return res.status(400).json({
          success: false,
          message: "Complete shipping address is required",
        });
      }

      // Checkout-only address.
      // It will NOT be inserted into the addresses table.
      address = {
        full_name,
        phone,
        address_line1,
        address_line2: address_line2 || null,
        city,
        state,
        postal_code,
        country,
      };
    } else {
      await transaction.rollback();

      return res.status(400).json({
        success: false,
        message: "Shipping address is required",
      });
    }

    if (!address) {
      await transaction.rollback();

      return res.status(404).json({
        success: false,
        message: "Address not found",
      });
    }

    // 2. Get active cart
    const cart = await Cart.findOne({
      where: {
        user_id,
        status: "active",
      },
      include: [
        {
          model: CartItem,
          as: "items",
          include: [
            {
              model: Product,
              as: "product",
              where: {
                is_active: true,
              },
            },
          ],
        },
      ],
      transaction,
    });

    if (!cart || !cart.items || cart.items.length === 0) {
      await transaction.rollback();

      return res.status(400).json({
        success: false,
        message: "Cart is empty",
      });
    }

    // 3. Check stock and calculate subtotal
    let subtotal = 0;

    for (const item of cart.items) {
      const product = item.product;

      if (item.quantity > product.stock_quantity) {
        await transaction.rollback();

        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.title}`,
          product_id: product.product_id,
          available_stock: product.stock_quantity,
        });
      }

      subtotal += Number(product.price) * item.quantity;
    }

    const shipping_charge = 0;
    const discount = 0;
    const total_amount = subtotal + shipping_charge - discount;

    if (total_amount <= 0) {
      await transaction.rollback();

      return res.status(400).json({
        success: false,
        message: "Invalid order amount",
      });
    }

    // 4. Generate local order number
    const order_number = `BOK-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    // 5. Create Razorpay order
    // Amount must be in paise
    const razorpayAmount = Math.round(total_amount * 100);

    const razorpayOrder = await razorpay.orders.create({
      amount: razorpayAmount,
      currency: "INR",
      receipt: order_number,
      notes: {
        user_id: String(user_id),
      },
    });

    // 6. Create local order
    const order = await Order.create(
      {
        user_id,
        order_number,
        status: "pending",
        payment_status: "pending",
        payment_method: "online",

        razorpay_order_id: razorpayOrder.id,

        subtotal,
        shipping_charge,
        discount,
        total_amount,

        shipping_name: address.full_name,
        shipping_phone: address.phone,
        shipping_address_line1: address.address_line1,
        shipping_address_line2: address.address_line2,
        shipping_city: address.city,
        shipping_state: address.state,
        shipping_postal_code: address.postal_code,
        shipping_country: address.country,
      },
      { transaction },
    );

    // 7. Create order items
    const orderItems = cart.items.map((item) => ({
      order_id: order.order_id,
      product_id: item.product.product_id,
      product_title: item.product.title,
      product_price: item.product.price,
      quantity: item.quantity,
      subtotal: Number(item.product.price) * item.quantity,
    }));

    await OrderItem.bulkCreate(orderItems, {
      transaction,
    });

    await transaction.commit();

    return res.status(201).json({
      success: true,
      message: "Online payment order created successfully",

      data: {
        order_id: order.order_id,
        order_number: order.order_number,

        razorpay_order_id: razorpayOrder.id,
        razorpay_key_id: process.env.RAZORPAY_KEY_ID,

        amount: razorpayAmount,
        currency: "INR",

        subtotal,
        shipping_charge,
        discount,
        total_amount,
      },
    });
  } catch (error) {
    await transaction.rollback();

    console.error("Create online payment order error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create online payment order",
      error: error.message,
    });
  }
};

export const verifyOnlinePayment = async (req, res) => {
  const transaction = await Order.sequelize.transaction();

  try {
    const user_id = req.user.id;

    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } =
      req.body;

    // 1. Validate payment response
    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
      await transaction.rollback();

      return res.status(400).json({
        success: false,
        message: "Payment verification details are required",
      });
    }

    // 2. Find our local order
    const order = await Order.findOne({
      where: {
        user_id,
        razorpay_order_id,
        payment_method: "online",
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

    // 3. Prevent duplicate verification
    if (order.payment_status === "paid") {
      await transaction.rollback();

      return res.status(400).json({
        success: false,
        message: "Payment already verified",
      });
    }

    // 4. Verify Razorpay signature
    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${order.razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      order.payment_status = "failed";
      await order.save({ transaction });

      await transaction.commit();

      return res.status(400).json({
        success: false,
        message: "Invalid payment signature",
      });
    }

    // 5. Get order items
    const orderItems = await OrderItem.findAll({
      where: {
        order_id: order.order_id,
      },
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!orderItems.length) {
      await transaction.rollback();

      return res.status(400).json({
        success: false,
        message: "Order items not found",
      });
    }

    // 6. Check stock again and lock products
    const products = [];

    for (const item of orderItems) {
      const product = await Product.findByPk(item.product_id, {
        transaction,
        lock: transaction.LOCK.UPDATE,
      });

      if (!product || !product.is_active) {
        await transaction.rollback();

        return res.status(400).json({
          success: false,
          message: `Product is no longer available: ${item.product_title}`,
        });
      }

      if (product.stock_quantity < item.quantity) {
        await transaction.rollback();

        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.title}`,
          product_id: product.product_id,
          available_stock: product.stock_quantity,
        });
      }

      products.push({
        product,
        quantity: item.quantity,
      });
    }

    // 7. Reduce stock
    for (const item of products) {
      item.product.stock_quantity -= item.quantity;

      await item.product.save({
        transaction,
      });
    }

    // 8. Get user's active cart
    const cart = await Cart.findOne({
      where: {
        user_id,
        status: "active",
      },
      include: [
        {
          model: CartItem,
          as: "items",
        },
      ],
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    // 9. Remove only the items used in this order
    if (cart && cart.items) {
      for (const orderItem of orderItems) {
        const cartItem = cart.items.find(
          (item) => item.product_id === orderItem.product_id,
        );

        if (!cartItem) {
          continue;
        }

        const remainingQuantity = cartItem.quantity - orderItem.quantity;

        if (remainingQuantity > 0) {
          cartItem.quantity = remainingQuantity;

          await cartItem.save({
            transaction,
          });
        } else {
          await cartItem.destroy({
            transaction,
          });
        }
      }

      // If cart has no items left, mark it converted
      const remainingItems = await CartItem.count({
        where: {
          cart_id: cart.cart_id,
        },
        transaction,
      });

      if (remainingItems === 0) {
        cart.status = "converted";

        await cart.save({
          transaction,
        });
      }
    }

    // 10. Save payment details
    order.razorpay_payment_id = razorpay_payment_id;
    order.razorpay_signature = razorpay_signature;
    order.payment_status = "paid";
    order.status = "confirmed";

    await order.save({
      transaction,
    });

    // Get customer details for email notification
    const user = await User.findByPk(user_id, {
      attributes: ["id", "name", "email", "order_notifications"],
      transaction,
    });

    // Commit successful order/payment transaction first
    await transaction.commit();
    try {
      const notificationResult = await createNotification({
        userId: order.user_id,
        type: "order_confirmed",
        title: "Order Confirmed 🎉",
        message: `Your order #${order.order_number} has been confirmed successfully.`,
        orderId: order.order_id,
      });

      if (!notificationResult.success) {
        console.error(
          "⚠️ Order confirmation notification was not created:",
          notificationResult.error,
        );
      }
    } catch (notificationError) {
      console.error(
        "⚠️ Order confirmation notification error:",
        notificationError.message,
      );
    }

    // Send order confirmation email after successful commit
    if (user?.email && user.order_notifications !== false) {
      const emailOrder = {
        order_id: order.order_id,
        order_number: order.order_number,
        status: order.status,
        payment_status: order.payment_status,

        subtotal: order.subtotal,
        shipping_charge: order.shipping_charge,
        discount: order.discount,
        total_amount: order.total_amount,

        shipping_address: {
          full_name: order.shipping_name,
          phone: order.shipping_phone,
          address_line1: order.shipping_address_line1,
          address_line2: order.shipping_address_line2,
          city: order.shipping_city,
          state: order.shipping_state,
          postal_code: order.shipping_postal_code,
          country: order.shipping_country,
        },
      };

      const emailItems = orderItems.map((item) => ({
        product_title: item.product_title,
        product_price: item.product_price,
        quantity: item.quantity,
        subtotal: item.subtotal,
      }));

      const emailResult = await sendOrderConfirmationEmail({
        user,
        order: emailOrder,
        items: emailItems,
      });

      if (!emailResult.success) {
        console.error(
          "⚠️ Order confirmation email was not sent:",
          emailResult.error,
        );
      }
    }

    return res.status(200).json({
      success: true,
      message: "Payment verified successfully",
      data: {
        order_id: order.order_id,
        order_number: order.order_number,
        payment_status: order.payment_status,
        order_status: order.status,
        razorpay_payment_id: order.razorpay_payment_id,
      },
    });
  } catch (error) {
    await transaction.rollback();

    console.error("Verify online payment error:", error);

    return res.status(500).json({
      success: false,
      message: "Payment verification failed",
      error: error.message,
    });
  }
};

// Admin: Refund an order
export const refundOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findByPk(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Only online orders can be refunded through Razorpay
    if (order.payment_method !== "online") {
      return res.status(400).json({
        success: false,
        message: "Only online payments can be refunded through Razorpay",
      });
    }

    // Payment must actually be paid
    if (order.payment_status !== "paid") {
      return res.status(400).json({
        success: false,
        message: "Only paid orders can be refunded",
      });
    }

    // Razorpay payment ID is required
    if (!order.razorpay_payment_id) {
      return res.status(400).json({
        success: false,
        message: "Razorpay payment ID not found",
      });
    }

    // Prevent refunding an already cancelled/refunded order
    if (order.payment_status === "refunded") {
      return res.status(400).json({
        success: false,
        message: "Order is already refunded",
      });
    }

    // Amount in paise
    const refundAmount = Math.round(Number(order.total_amount) * 100);

    if (!refundAmount || refundAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid refund amount",
      });
    }

    const refund = await razorpay.payments.refund(order.razorpay_payment_id, {
      amount: refundAmount,
      speed: "normal",
      notes: {
        order_id: String(order.order_id),
        order_number: order.order_number,
      },
      receipt: order.order_number,
    });

    // Update local order only after Razorpay accepts refund
    order.payment_status = "refunded";

    if (order.status !== "cancelled") {
      order.status = "cancelled";
    }

    await order.save();
    // 🔔 Create in-app refund notification
    try {
      const notificationResult = await createNotification({
        userId: order.user_id,
        type: "refund",
        title: "Refund Initiated 💰",
        message: `Your refund of ₹${Number(order.total_amount).toFixed(
          2,
        )} for order #${order.order_number} has been initiated.`,
        orderId: order.order_id,
      });

      if (!notificationResult.success) {
        console.error(
          "⚠️ Refund notification was not created:",
          notificationResult.error,
        );
      }
    } catch (notificationError) {
      console.error("⚠️ Refund notification error:", notificationError.message);
    }
    // Send refund confirmation email
    try {
      const user = await User.findByPk(order.user_id, {
        attributes: ["id", "name", "email", "order_notifications"],
      });

      if (user?.email && user.order_notifications !== false) {
        const emailResult = await sendRefundEmail({
          user,
          order,
          refund,
        });

        if (!emailResult.success && !emailResult.skipped) {
          console.error(
            "⚠️ Refund confirmation email was not sent:",
            emailResult.error,
          );
        }
      } else {
        console.log(
          "ℹ️ Refund confirmation email skipped: notifications disabled or email missing",
        );
      }
    } catch (emailError) {
      console.error("⚠️ Refund confirmation email error:", emailError.message);
    }
    return res.status(200).json({
      success: true,
      message: "Refund initiated successfully",
      data: {
        order,
        refund,
      },
    });
  } catch (error) {
    console.error("Refund Order Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to refund order",
      error: error.error?.description || error.message,
    });
  }
};
