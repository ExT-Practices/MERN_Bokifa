import { sendEmail } from "./emailService.js";

export const sendPasswordResetOtpEmail = async ({ user, otp }) => {
  try {
    if (!user?.email) {
      return {
        success: false,
        error: "User email not available",
      };
    }

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8" />
          <title>Bokifa Password Reset OTP</title>
        </head>

        <body style="
          margin:0;
          padding:0;
          background:#f4f4f4;
          font-family:Arial, Helvetica, sans-serif;
          color:#222;
        ">
          <div style="
            max-width:600px;
            margin:30px auto;
            background:#ffffff;
            border-radius:10px;
            overflow:hidden;
            box-shadow:0 2px 10px rgba(0,0,0,0.08);
          ">
            <div style="
              background:#111827;
              color:#ffffff;
              padding:24px;
              text-align:center;
            ">
              <h1 style="margin:0;font-size:28px;">Bokifa</h1>
              <p style="margin:8px 0 0;font-size:14px;opacity:.85;">
                Online Bookstore
              </p>
            </div>

            <div style="padding:30px;">
              <h2 style="margin-top:0;color:#111827;">
                Password Reset Request 🔐
              </h2>

              <p>
                Hi <strong>${user.name || "Customer"}</strong>,
              </p>

              <p>
                We received a request to reset your Bokifa account password.
                Enter the OTP below to continue.
              </p>

              <div style="
                margin:28px 0;
                padding:22px;
                background:#f8f8f8;
                border-radius:10px;
                text-align:center;
              ">
                <div style="
                  font-size:13px;
                  color:#666;
                  margin-bottom:8px;
                ">
                  Your verification code
                </div>

                <div style="
                  font-size:34px;
                  letter-spacing:8px;
                  font-weight:700;
                  color:#111827;
                ">
                  ${otp}
                </div>
              </div>

              <p style="color:#666;font-size:14px;line-height:1.6;">
                This OTP is valid for <strong>10 minutes</strong>.
                If you did not request a password reset, you can safely ignore
                this email.
              </p>

              <p style="
                margin-top:28px;
                color:#333;
              ">
                Thank you for choosing <strong>Bokifa</strong> ❤️
              </p>
            </div>

            <div style="
              background:#f8f8f8;
              padding:18px;
              text-align:center;
              color:#777;
              font-size:12px;
            ">
              This is an automated email. Please do not reply directly to this email.
            </div>
          </div>
        </body>
      </html>
    `;

    const text = `
Bokifa - Password Reset OTP

Hi ${user.name || "Customer"},

Your Bokifa password reset OTP is: ${otp}

This OTP is valid for 10 minutes.

If you did not request a password reset, you can safely ignore this email.
`;

    return await sendEmail({
      to: user.email,
      subject: "Bokifa - Password Reset OTP 🔐",
      html,
      text,
    });
  } catch (error) {
    console.error("Password reset OTP email error:", error.message);

    return {
      success: false,
      error: error.message,
    };
  }
};
