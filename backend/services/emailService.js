import nodemailer from "nodemailer";
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const verifyEmailConnection = async () => {
  try {
    await transporter.verify();

    console.log("✅ Email SMTP connection successful");
  } catch (error) {
    console.error("❌ Email SMTP connection failed:", error.message);
  }
};

export const sendEmail = async ({ to, subject, html, text = "" }) => {
  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to,
      subject,
      text,
      html,
    });

    console.log(`📧 Email sent successfully to: ${to}`);
    console.log("Message ID:", info.messageId);

    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error) {
    console.error("❌ Email sending failed:", error.message);

    return {
      success: false,
      error: error.message,
    };
  }
};

export const sendOrderConfirmationEmail = async ({
  user,
  order,
  items = [],
}) => {
  try {
    if (!user?.email) {
      console.log("⚠️ Order confirmation email skipped: user email not found");
      return {
        success: false,
        skipped: true,
        reason: "User email not found",
      };
    }

    const itemRows = items
      .map(
        (item) => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #eee;">
          ${item.product_title || "Product"}
        </td>

        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">
          ${item.quantity}
        </td>

        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">
          ₹${Number(item.product_price || 0).toFixed(2)}
        </td>

        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">
          ₹${Number(item.subtotal || 0).toFixed(2)}
        </td>
      </tr>
    `,
      )
      .join("");

    const shippingAddress = order.shipping_address || {};

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
          <title>Order Confirmation</title>
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
                Order Confirmed 🎉
              </h2>

              <p>
                Hi <strong>${user.name || "Customer"}</strong>,
              </p>

              <p>
                Thank you for shopping with Bokifa.
                Your order has been successfully confirmed.
              </p>

              <!-- Order Info -->
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
                  <strong>Payment Status:</strong>
                  ${order.payment_status || "Paid"}
                </p>

                <p style="margin: 5px 0;">
                  <strong>Order Status:</strong>
                  ${order.status || "Confirmed"}
                </p>

              </div>

              <!-- Products -->
              <h3 style="
                margin-bottom: 12px;
              ">
                Order Items
              </h3>

              <table style="
                width: 100%;
                border-collapse: collapse;
                font-size: 14px;
              ">

                <thead>
                  <tr style="background: #f8f8f8;">
                    <th style="
                      padding: 12px;
                      text-align: left;
                    ">
                      Product
                    </th>

                    <th style="
                      padding: 12px;
                      text-align: center;
                    ">
                      Qty
                    </th>

                    <th style="
                      padding: 12px;
                      text-align: right;
                    ">
                      Price
                    </th>

                    <th style="
                      padding: 12px;
                      text-align: right;
                    ">
                      Subtotal
                    </th>
                  </tr>
                </thead>

                <tbody>
                  ${itemRows}
                </tbody>

              </table>

              <!-- Total -->
              <div style="
                margin-top: 24px;
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
                Thank you for choosing Bokifa ❤️
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
Bokifa - Order Confirmed

Hi ${user.name || "Customer"},

Thank you for shopping with Bokifa.

Order Number: ${order.order_number}
Order Status: ${order.status || "Confirmed"}
Payment Status: ${order.payment_status || "Paid"}

Total: ₹${Number(order.total || 0).toFixed(2)}

Thank you for choosing Bokifa.
`;

    return await sendEmail({
      to: user.email,
      subject: `Bokifa - Order Confirmed #${order.order_number}`,
      html,
      text,
    });
  } catch (error) {
    console.error("❌ Order confirmation email error:", error.message);

    return {
      success: false,
      error: error.message,
    };
  }
};
