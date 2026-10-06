import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import "../styles/account.css";

const API_BASE = "/api";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState("email");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const navigate = useNavigate();

  const validateEmail = () => {
    if (!email.trim()) {
      setError("Email address is required");
      return false;
    }

    if (!/\S+@\S+\.\S+/.test(email.trim())) {
      setError("Please enter a valid email address");
      return false;
    }

    return true;
  };

  const sendOtp = async (e) => {
    e?.preventDefault();

    if (!validateEmail()) return;

    setError("");
    setMessage("");
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE}/users/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to send OTP");
      }

      setStep("otp");
      setMessage(
        "If an account exists for this email, a 6-digit OTP has been sent to your inbox.",
      );
    } catch (err) {
      setError(err.message || "Unable to send OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOtp = async (e) => {
    e.preventDefault();

    if (!/^\d{6}$/.test(otp)) {
      setError("Please enter the 6-digit OTP");
      return;
    }

    setError("");
    setMessage("");
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE}/users/verify-password-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          otp,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data?.resetToken) {
        throw new Error(data.message || "Invalid OTP");
      }

      sessionStorage.setItem("bokifa_password_reset_token", data.resetToken);
      sessionStorage.setItem(
        "bokifa_password_reset_email",
        email.trim().toLowerCase(),
      );

      navigate("/account/reset-password");
    } catch (err) {
      setError(err.message || "Invalid OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const resendOtp = async () => {
    setError("");
    setMessage("");
    setResendLoading(true);

    try {
      const response = await fetch(`${API_BASE}/users/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to resend OTP");
      }

      setOtp("");
      setMessage("A new OTP has been sent to your email.");
    } catch (err) {
      setError(err.message || "Unable to resend OTP. Please try again.");
    } finally {
      setResendLoading(false);
    }
  };

  const handleOtpChange = (e) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 6);
    setOtp(value);

    if (error) {
      setError("");
    }
  };

  return (
    <>
      <Header />

      <div className="bk-account-wrapper" style={{ padding: "40px 0" }}>
        <div className="bk-account-auth-container">
          <div className="bk-account-auth-card">
            <Link to="/" className="bk-account-auth-logo">
              Ap Bokifa
            </Link>

            {step === "email" ? (
              <div>
                <h2 className="bk-account-auth-title">Forgot your password?</h2>

                <p className="bk-account-auth-subtitle">
                  Enter your registered email address and we'll send you a
                  verification OTP.
                </p>

                <form onSubmit={sendOtp} noValidate>
                  <div
                    className="bk-account-form-group"
                    style={{ marginBottom: "24px" }}
                  >
                    <label className="bk-account-label" htmlFor="forgot-email">
                      Email Address <span className="req">*</span>
                    </label>

                    <input
                      id="forgot-email"
                      type="email"
                      className={`bk-account-input ${
                        error ? "bk-account-input--error" : ""
                      }`}
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (error) setError("");
                      }}
                      autoComplete="email"
                    />

                    {error && (
                      <span className="bk-account-field-error">{error}</span>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="bk-account-btn bk-account-btn--primary bk-account-btn--full"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <i className="fas fa-spinner fa-spin"></i> Sending
                        OTP...
                      </>
                    ) : (
                      "Send OTP"
                    )}
                  </button>
                </form>

                <div className="bk-account-auth-footer">
                  Remembered your password?{" "}
                  <Link to="/account/login">Sign in</Link>
                </div>
              </div>
            ) : (
              <div>
                <div
                  style={{
                    width: "56px",
                    height: "56px",
                    borderRadius: "50%",
                    backgroundColor: "var(--bk-green-light)",
                    color: "var(--bk-green-primary)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "24px",
                    margin: "0 auto 20px auto",
                  }}
                >
                  <i className="fas fa-envelope"></i>
                </div>

                <h2 className="bk-account-auth-title">Verify your email</h2>

                <p className="bk-account-auth-subtitle">
                  Enter the 6-digit OTP sent to <strong>{email}</strong>.
                </p>

                {message && (
                  <div
                    style={{
                      marginBottom: "18px",
                      color: "var(--bk-green-primary)",
                      fontSize: "13px",
                      lineHeight: "1.5",
                    }}
                  >
                    {message}
                  </div>
                )}

                <form onSubmit={verifyOtp} noValidate>
                  <div
                    className="bk-account-form-group"
                    style={{ marginBottom: "18px" }}
                  >
                    <label className="bk-account-label" htmlFor="forgot-otp">
                      Verification OTP <span className="req">*</span>
                    </label>

                    <input
                      id="forgot-otp"
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      autoComplete="one-time-code"
                      className={`bk-account-input ${
                        error ? "bk-account-input--error" : ""
                      }`}
                      placeholder="Enter 6-digit OTP"
                      value={otp}
                      onChange={handleOtpChange}
                      style={{
                        textAlign: "center",
                        letterSpacing: "8px",
                        fontSize: "20px",
                        fontWeight: "600",
                      }}
                    />

                    {error && (
                      <span className="bk-account-field-error">{error}</span>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="bk-account-btn bk-account-btn--primary bk-account-btn--full"
                    disabled={isLoading || otp.length !== 6}
                  >
                    {isLoading ? (
                      <>
                        <i className="fas fa-spinner fa-spin"></i> Verifying...
                      </>
                    ) : (
                      "Verify OTP"
                    )}
                  </button>
                </form>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    marginTop: "18px",
                  }}
                >
                  <button
                    type="button"
                    onClick={resendOtp}
                    disabled={resendLoading}
                    style={{
                      border: "none",
                      background: "transparent",
                      color: "var(--bk-green-primary)",
                      fontSize: "13px",
                      fontWeight: "600",
                      cursor: resendLoading ? "default" : "pointer",
                      padding: 0,
                    }}
                  >
                    {resendLoading ? "Sending..." : "Resend OTP"}
                  </button>
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    marginTop: "12px",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setStep("email");
                      setOtp("");
                      setError("");
                      setMessage("");
                    }}
                    style={{
                      border: "none",
                      background: "transparent",
                      color: "#666",
                      fontSize: "13px",
                      cursor: "pointer",
                      padding: 0,
                    }}
                  >
                    Change email
                  </button>
                </div>

                <div className="bk-account-auth-footer">
                  Remembered your password?{" "}
                  <Link to="/account/login">Sign in</Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default ForgotPasswordPage;
