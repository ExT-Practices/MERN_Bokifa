import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import "../styles/account.css";

const API_BASE = "/api";

const ResetPasswordPage = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};
    const resetToken = sessionStorage.getItem("bokifa_password_reset_token");

    if (!resetToken) {
      newErrors.general =
        "Your reset session is missing or expired. Please request a new OTP.";
    }

    if (!password) {
      newErrors.password = "New password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your new password";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE}/users/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token: resetToken,
          newPassword: password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to reset password");
      }

      sessionStorage.removeItem("bokifa_password_reset_token");
      sessionStorage.removeItem("bokifa_password_reset_email");

      setIsSuccess(true);
    } catch (error) {
      setErrors({
        general:
          error.message ||
          "Unable to reset password. Please request a new OTP.",
      });
    } finally {
      setIsLoading(false);
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

            {isSuccess ? (
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
                  <i className="fas fa-check"></i>
                </div>

                <h2 className="bk-account-auth-title">
                  Password Reset Complete
                </h2>

                <p className="bk-account-auth-subtitle">
                  Your password has been updated successfully. You can now sign
                  in with your new password.
                </p>

                <div style={{ marginTop: "24px" }}>
                  <button
                    type="button"
                    onClick={() => navigate("/account/login")}
                    className="bk-account-btn bk-account-btn--primary bk-account-btn--full"
                  >
                    Sign In Now
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <h2 className="bk-account-auth-title">Reset Password</h2>

                <p className="bk-account-auth-subtitle">
                  Please choose a strong new password for your Bokifa account.
                </p>

                {errors.general && (
                  <div
                    className="bk-account-field-error"
                    style={{
                      display: "block",
                      marginBottom: "18px",
                      lineHeight: "1.5",
                    }}
                  >
                    {errors.general}
                  </div>
                )}

                <form onSubmit={handleSubmit} noValidate>
                  <div
                    className="bk-account-form-group"
                    style={{ marginBottom: "18px" }}
                  >
                    <label
                      className="bk-account-label"
                      htmlFor="reset-new-password"
                    >
                      New Password <span className="req">*</span>
                    </label>

                    <div className="bk-account-input-wrapper">
                      <input
                        id="reset-new-password"
                        type={showPassword ? "text" : "password"}
                        className={`bk-account-input ${
                          errors.password ? "bk-account-input--error" : ""
                        }`}
                        placeholder="At least 6 characters"
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          if (errors.password) {
                            setErrors((prev) => ({
                              ...prev,
                              password: "",
                            }));
                          }
                        }}
                        autoComplete="new-password"
                      />

                      <button
                        type="button"
                        className="bk-account-input-icon"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={
                          showPassword ? "Hide password" : "Show password"
                        }
                      >
                        <i
                          className={`fas ${
                            showPassword ? "fa-eye-slash" : "fa-eye"
                          }`}
                        ></i>
                      </button>
                    </div>

                    {errors.password && (
                      <span className="bk-account-field-error">
                        {errors.password}
                      </span>
                    )}
                  </div>

                  <div
                    className="bk-account-form-group"
                    style={{ marginBottom: "24px" }}
                  >
                    <label
                      className="bk-account-label"
                      htmlFor="reset-confirm-password"
                    >
                      Confirm New Password <span className="req">*</span>
                    </label>

                    <div className="bk-account-input-wrapper">
                      <input
                        id="reset-confirm-password"
                        type={showPassword ? "text" : "password"}
                        className={`bk-account-input ${
                          errors.confirmPassword
                            ? "bk-account-input--error"
                            : ""
                        }`}
                        placeholder="Re-enter your password"
                        value={confirmPassword}
                        onChange={(e) => {
                          setConfirmPassword(e.target.value);
                          if (errors.confirmPassword) {
                            setErrors((prev) => ({
                              ...prev,
                              confirmPassword: "",
                            }));
                          }
                        }}
                        autoComplete="new-password"
                      />

                      <button
                        type="button"
                        className="bk-account-input-icon"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={
                          showPassword ? "Hide password" : "Show password"
                        }
                      >
                        <i
                          className={`fas ${
                            showPassword ? "fa-eye-slash" : "fa-eye"
                          }`}
                        ></i>
                      </button>
                    </div>

                    {errors.confirmPassword && (
                      <span className="bk-account-field-error">
                        {errors.confirmPassword}
                      </span>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="bk-account-btn bk-account-btn--primary bk-account-btn--full"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <i className="fas fa-spinner fa-spin"></i> Updating
                        password...
                      </>
                    ) : (
                      "Reset Password"
                    )}
                  </button>
                </form>

                <div className="bk-account-auth-footer">
                  <Link to="/account/forgot-password">
                    Back to Forgot Password
                  </Link>
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

export default ResetPasswordPage;
