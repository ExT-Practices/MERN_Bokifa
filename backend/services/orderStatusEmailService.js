import { sendEmail } from "./emailService.js";

export const sendOrderStatusEmail = async ({ user, order, previousStatus }) => {
  try {
    if (!user?.email) {
      console.log("⚠️ Order status email skipped: customer email not found");

      return {
        success: false,
        skipped: true,
        reason: "Customer email not found",
      };
    }

    const status = order.status;

    const statusContent = {
      confirmed: {
        title: "Order Confirmed 🎉",
        message:
          "Great news! Your order has been confirmed and is being prepared.",
        emoji: "🎉",
      },

      processing: {
        title: "Order is Being Processed ⚙️",
        message:
          "Your order is now being processed. We are preparing your books for shipment.",
        emoji: "⚙️",
      },

      shipped: {
        title: "Your Order Has Been Shipped 🚚",
        message: "Your order has been shipped and is on its way to you.",
        emoji: "🚚",
      },

      delivered: {
        title: "Order Delivered 📦",
        message:
          "Your order has been successfully delivered. We hope you enjoy your books!",
        emoji: "📦",
      },
      cancelled: {
        title: "Order Cancelled ❌",
        message:
          "Your order has been cancelled successfully. If you have any questions, please contact Bokifa support.",
        emoji: "❌",
      },
    };

    const content = statusContent[status];

    if (!content) {
      console.log(
        `ℹ️ No customer email template configured for status: ${status}`,
      );

      return {
        success: true,
        skipped: true,
        reason: `No email template for status: ${status}`,
      };
    }

    const shippingAddress = {
      full_name: order.shipping_name,
      phone: order.shipping_phone,
      address_line1: order.shipping_address_line1,
      address_line2: order.shipping_address_line2,
      city: order.shipping_city,
      state: order.shipping_state,
      postal_code: order.shipping_postal_code,
      country: order.shipping_country,
    };

    const shippingAddressHtml = `
      <div style="
        background: #f8f8f8;
        padding: 16px;
        border-radius: 8px;
        line-height: 1.6;
      ">
        <strong>${shippingAddress.full_name || ""}</strong><br />

        ${shippingAddress.address_line1 || ""}<br />

        ${
          shippingAddress.address_line2
            ? `${shippingAddress.address_line2}<br />`
            : ""
        }

        ${shippingAddress.city || ""},
        ${shippingAddress.state || ""}
        ${shippingAddress.postal_code || ""}<br />

        ${shippingAddress.country || ""}

        ${shippingAddress.phone ? `<br />Phone: ${shippingAddress.phone}` : ""}
      </div>
    `;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8" />
          <title>${content.title}</title>
        </head>

        <body style="
          margin: 0;
          padding: 0;
          background: #f4f4f4;
          font-family: Arial, Helvetica, sans-serif;
          color: #222;
        ">

          <div style="
            max-width: 700px;
            margin: 30px auto;
            background: #ffffff;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 2px 10px rgba(0,0,0,0.08);
          ">

            <!-- Header -->
            <div style="
              background: #111827;
              color: #ffffff;
              padding: 24px;
              text-align: center;
            ">
              <h1 style="
                margin: 0;
                font-size: 28px;
              ">
                Bokifa
              </h1>

              <p style="
                margin: 8px 0 0;
                font-size: 14px;
                opacity: 0.85;
              ">
                Online Bookstore
              </p>
            </div>

            <!-- Content -->
            <div style="padding: 30px;">

              <h2 style="
                margin-top: 0;
                color: #111827;
              ">
                ${content.title}
              </h2>

              <p>
                Hi <strong>${user.name || "Customer"}</strong>,
              </p>

              <p>
                ${content.message}
              </p>

              <!-- Status -->
              <div style="
                background: #f8f8f8;
                padding: 18px;
                border-radius: 8px;
                margin: 24px 0;
              ">

                <p style="margin: 5px 0;">
                  <strong>Order Number:</strong>
                  ${order.order_number}
                </p>

                <p style="margin: 5px 0;">
                  <strong>Previous Status:</strong>
                  ${previousStatus || "N/A"}
                </p>

                <p style="margin: 5px 0;">
                  <strong>Current Status:</strong>
                  ${status}
                </p>

                <p style="margin: 5px 0;">
                  <strong>Payment Status:</strong>
                  ${order.payment_status}
                </p>

              </div>

              <!-- Amount -->
              <div style="
                border-top: 1px solid #ddd;
                padding-top: 16px;
              ">

                <p style="
                  margin: 8px 0;
                  text-align: right;
                ">
                  Subtotal:
                  <strong>
                    ₹${Number(order.subtotal || 0).toFixed(2)}
                  </strong>
                </p>

                <p style="
                  margin: 8px 0;
                  text-align: right;
                ">
                  Shipping:
                  <strong>
                    ₹${Number(order.shipping_charge || 0).toFixed(2)}
                  </strong>
                </p>

                <p style="
                  margin: 12px 0 0;
                  text-align: right;
                  font-size: 18px;
                ">
                  Total:
                  <strong>
                    ₹${Number(order.total_amount || 0).toFixed(2)}
                  </strong>
                </p>

              </div>

              <!-- Shipping Address -->
              <h3 style="
                margin-top: 30px;
                margin-bottom: 12px;
              ">
                Shipping Address
              </h3>

              ${shippingAddressHtml}

              <p style="
                margin-top: 30px;
                color: #666;
                font-size: 13px;
              ">
                Thank you for shopping with Bokifa ❤️
              </p>

            </div>

            <!-- Footer -->
            <div style="
              background: #f8f8f8;
              padding: 18px;
              text-align: center;
              color: #777;
              font-size: 12px;
            ">
              © ${new Date().getFullYear()} Bokifa. All rights reserved.
            </div>

          </div>

        </body>
      </html>
    `;

    const text = `
Bokifa - ${content.title}

Hi ${user.name || "Customer"},

${content.message}

Order Number: ${order.order_number}

Previous Status: ${previousStatus || "N/A"}
Current Status: ${status}
Payment Status: ${order.payment_status}

Total: ₹${Number(order.total_amount || 0).toFixed(2)}

Thank you for shopping with Bokifa.
`;

    return await sendEmail({
      to: user.email,
      subject: `Bokifa - ${content.title} #${order.order_number}`,
      html,
      text,
    });
  } catch (error) {
    console.error("❌ Order status email error:", error.message);

    return {
      success: false,
      error: error.message,
    };
  }
};
