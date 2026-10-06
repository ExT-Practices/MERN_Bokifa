import { sendEmail } from "./emailService.js";

export const sendRefundEmail = async ({ user, order, refund }) => {
  try {
    if (!user?.email) {
      return {
        success: false,
        skipped: true,
        error: "User email not available",
      };
    }

    const refundAmount = (Number(refund?.amount || 0) / 100).toFixed(2);

    const refundStatus =
      refund?.status === "processed"
        ? "Processed"
        : refund?.status === "pending"
          ? "Pending"
          : refund?.status || "Initiated";

    const subject = `Bokifa - Refund Confirmation 💰 #${order.order_number}`;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8" />
        <title>Refund Confirmation</title>
      </head>

      <body style="
        margin: 0;
        padding: 0;
        background: #f5f5f5;
        font-family: Arial, Helvetica, sans-serif;
      ">

        <div style="
          max-width: 650px;
          margin: 30px auto;
          background: #ffffff;
          border-radius: 10px;
          overflow: hidden;
          box-shadow: 0 2px 10px rgba(0,0,0,0.08);
        ">

          <div style="
            background: #111827;
            color: #ffffff;
            padding: 25px;
            text-align: center;
          ">
            <h1 style="margin: 0; font-size: 28px;">
              Bokifa
            </h1>

            <p style="
              margin: 8px 0 0;
              font-size: 16px;
            ">
              Refund Confirmation 💰
            </p>
          </div>

          <div style="padding: 30px;">

            <h2 style="
              margin-top: 0;
              color: #222222;
            ">
              Hello ${user.name || "Customer"},
            </h2>

            <p style="
              color: #555555;
              font-size: 15px;
              line-height: 1.6;
            ">
              Your refund has been successfully initiated for the following order.
            </p>

            <div style="
              background: #f8f9fa;
              border-radius: 8px;
              padding: 18px;
              margin: 25px 0;
            ">

              <p style="margin: 8px 0;">
                <strong>Order Number:</strong>
                ${order.order_number}
              </p>

              <p style="margin: 8px 0;">
                <strong>Refund ID:</strong>
                ${refund.id || "N/A"}
              </p>

              <p style="margin: 8px 0;">
                <strong>Refund Amount:</strong>
                ₹${refundAmount}
              </p>

              <p style="margin: 8px 0;">
                <strong>Payment Status:</strong>
                ${order.payment_status}
              </p>

              <p style="margin: 8px 0;">
                <strong>Refund Status:</strong>
                ${refundStatus}
              </p>

            </div>

            <div style="
              background: #fff8e1;
              border-left: 4px solid #f59e0b;
              padding: 15px;
              margin: 20px 0;
            ">
              <p style="
                margin: 0;
                color: #555555;
                font-size: 14px;
                line-height: 1.6;
              ">
                Your refund has been initiated through Razorpay.
                For normal refunds, the amount may take approximately
                5–7 working days to reach your original payment method.
              </p>
            </div>

            <p style="
              color: #555555;
              font-size: 15px;
              line-height: 1.6;
            ">
              If you have any questions regarding your refund,
              please contact Bokifa support.
            </p>

            <p style="
              margin-top: 30px;
              color: #333333;
            ">
              Thank you for shopping with <strong>Bokifa</strong> ❤️
            </p>

          </div>

          <div style="
            background: #f5f5f5;
            padding: 18px;
            text-align: center;
            color: #888888;
            font-size: 12px;
          ">
            This is an automated email. Please do not reply directly to this email.
          </div>

        </div>

      </body>
      </html>
    `;

    const text = `
Bokifa - Refund Confirmation

Hello ${user.name || "Customer"},

Your refund has been successfully initiated.

Order Number: ${order.order_number}
Refund ID: ${refund.id || "N/A"}
Refund Amount: ₹${refundAmount}

Payment Status: ${order.payment_status}
Refund Status: ${refundStatus}

For normal refunds, the amount may take approximately
5–7 working days to reach your original payment method.

Thank you for shopping with Bokifa.
`;

    return await sendEmail({
      to: user.email,
      subject,
      html,
      text,
    });
  } catch (error) {
    console.error("❌ Refund email error:", error.message);

    return {
      success: false,
      error: error.message,
    };
  }
};
