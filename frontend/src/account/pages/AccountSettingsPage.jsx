import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AccountLayout from "../components/AccountLayout";
import { useAccount } from "../context/AccountContext";
import { changePassword } from "../../api/authApi";

const AccountSettingsPage = () => {
  const {
    settings,
    updateSettings,
    logout,
    showToast,
    user,
    preferences,
    updatePreferences,
  } = useAccount();
  const navigate = useNavigate();

  const [localSettings, setLocalSettings] = useState(settings);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState({});
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    const updated = { ...localSettings, [name]: checked };
    setLocalSettings(updated);
    updateSettings(updated);
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswords((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    const errors = {};

    if (!passwords.currentPassword) {
      errors.currentPassword = "Current password is required";
    }

    if (!passwords.newPassword) {
      errors.newPassword = "New password is required";
    } else if (passwords.newPassword.length < 6) {
      errors.newPassword = "New password must be at least 6 characters";
    }

    if (!passwords.confirmNewPassword) {
      errors.confirmNewPassword = "Please confirm your new password";
    } else if (passwords.newPassword !== passwords.confirmNewPassword) {
      errors.confirmNewPassword = "Passwords do not match";
    }

    if (Object.keys(errors).length > 0) {
      setPasswordErrors(errors);
      return;
    }

    try {
      setPasswordErrors({});
      setIsUpdatingPassword(true);

      await changePassword({
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      });

      setPasswords({
        currentPassword: "",
        newPassword: "",
        confirmNewPassword: "",
      });

      setShowPasswordForm(false);

      showToast("Password updated successfully!");
    } catch (error) {
      console.error("Change Password Error:", error);

      const message =
        error?.response?.data?.message || "Failed to update password";

      setPasswordErrors({
        currentPassword:
          message === "Current password is incorrect" ? message : "",
        general: message !== "Current password is incorrect" ? message : "",
      });
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleLogoutClick = (e) => {
    e.preventDefault();
    logout();
    navigate("/account/login");
  };

  return (
    <AccountLayout>
      {/* Email Preferences */}
      <div className="bk-account-card">
        <div className="bk-account-card__header">
          <div>
            <h2 className="bk-account-card__title">
              <i
                className="fas fa-envelope-open-text"
                style={{ color: "var(--bk-green-primary)" }}
              ></i>
              Email preferences
            </h2>
            <p className="bk-account-card__subtitle">
              Manage what communications you want to receive from Bokifa.
            </p>
          </div>
        </div>

        <div>
          <label
            className="bk-account-checkbox-group"
            style={{ marginBottom: "16px" }}
          >
            <input
              type="checkbox"
              name="emailNews"
              className="bk-account-checkbox"
              checked={preferences.email_news}
              onChange={(e) =>
                updatePreferences({
                  email_news: e.target.checked,
                })
              }
            />
            <div>
              <span
                className="bk-account-checkbox-label"
                style={{ fontWeight: "700" }}
              >
                Receive news and special offers
              </span>
              <p
                style={{
                  fontSize: "13px",
                  color: "var(--bk-text-muted)",
                  margin: "2px 0 0 0",
                }}
              >
                Get early access to book releases, flash sales, and subscriber
                discounts.
              </p>
            </div>
          </label>

          <label
            className="bk-account-checkbox-group"
            style={{ marginBottom: "16px" }}
          >
            <input
              type="checkbox"
              name="orderNotifications"
              className="bk-account-checkbox"
              checked={preferences.order_notifications}
              onChange={(e) =>
                updatePreferences({
                  order_notifications: e.target.checked,
                })
              }
            />
            <div>
              <span
                className="bk-account-checkbox-label"
                style={{ fontWeight: "700" }}
              >
                Order status and shipping updates
              </span>
              <p
                style={{
                  fontSize: "13px",
                  color: "var(--bk-text-muted)",
                  margin: "2px 0 0 0",
                }}
              >
                Receive email tracking notifications whenever your parcel is
                dispatched.
              </p>
            </div>
          </label>

          <label className="bk-account-checkbox-group">
            <input
              type="checkbox"
              name="smsAlerts"
              className="bk-account-checkbox"
              checked={preferences.sms_alerts}
              onChange={(e) =>
                updatePreferences({
                  sms_alerts: e.target.checked,
                })
              }
            />
            <div>
              <span
                className="bk-account-checkbox-label"
                style={{ fontWeight: "700" }}
              >
                SMS delivery notifications
              </span>
              <p
                style={{
                  fontSize: "13px",
                  color: "var(--bk-text-muted)",
                  margin: "2px 0 0 0",
                }}
              >
                Receive text messages when your order is out for delivery.
              </p>
            </div>
          </label>
        </div>
      </div>

      {/* Security */}
      <div className="bk-account-card">
        <div className="bk-account-card__header">
          <div>
            <h2 className="bk-account-card__title">
              <i
                className="fas fa-shield-alt"
                style={{ color: "var(--bk-green-primary)" }}
              ></i>
              Security
            </h2>
            <p className="bk-account-card__subtitle">
              Keep your account credentials secure and updated.
            </p>
          </div>
        </div>

        {!showPasswordForm ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "16px",
            }}
          >
            <div>
              <strong style={{ fontSize: "15px" }}>Password</strong>
              <p
                style={{
                  fontSize: "13px",
                  color: "var(--bk-text-muted)",
                  margin: "2px 0 0 0",
                }}
              >
                Last changed 3 months ago.
              </p>
            </div>
            <button
              type="button"
              className="bk-account-btn bk-account-btn--secondary"
              onClick={() => setShowPasswordForm(true)}
            >
              <i className="fas fa-key"></i> Change password
            </button>
          </div>
        ) : (
          <form onSubmit={handlePasswordSubmit} noValidate>
            {passwordErrors.general && (
              <div
                style={{
                  marginBottom: "16px",
                  padding: "12px 14px",
                  borderRadius: "8px",
                  background: "#fef2f2",
                  color: "#dc2626",
                  fontSize: "13px",
                  fontWeight: "600",
                }}
              >
                {passwordErrors.general}
              </div>
            )}
            <div
              className="bk-account-form-group"
              style={{ marginBottom: "16px" }}
            >
              <label className="bk-account-label" htmlFor="settings-curr-pass">
                Current Password <span className="req">*</span>
              </label>
              <div className="bk-account-input-wrapper">
                <input
                  id="settings-curr-pass"
                  name="currentPassword"
                  type={showPassword ? "text" : "password"}
                  className={`bk-account-input ${
                    passwordErrors.currentPassword
                      ? "bk-account-input--error"
                      : ""
                  }`}
                  value={passwords.currentPassword}
                  onChange={handlePasswordChange}
                />
                <button
                  type="button"
                  className="bk-account-input-icon"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <i
                    className={`fas ${showPassword ? "fa-eye-slash" : "fa-eye"}`}
                  ></i>
                </button>
              </div>
              {passwordErrors.currentPassword && (
                <span className="bk-account-field-error">
                  {passwordErrors.currentPassword}
                </span>
              )}
            </div>

            <div
              className="bk-account-form-grid"
              style={{ marginBottom: "20px" }}
            >
              <div className="bk-account-form-group">
                <label className="bk-account-label" htmlFor="settings-new-pass">
                  New Password <span className="req">*</span>
                </label>
                <div className="bk-account-input-wrapper">
                  <input
                    id="settings-new-pass"
                    name="newPassword"
                    type={showPassword ? "text" : "password"}
                    className={`bk-account-input ${
                      passwordErrors.newPassword
                        ? "bk-account-input--error"
                        : ""
                    }`}
                    value={passwords.newPassword}
                    onChange={handlePasswordChange}
                  />
                </div>
                {passwordErrors.newPassword && (
                  <span className="bk-account-field-error">
                    {passwordErrors.newPassword}
                  </span>
                )}
              </div>

              <div className="bk-account-form-group">
                <label
                  className="bk-account-label"
                  htmlFor="settings-confirm-pass"
                >
                  Confirm New Password <span className="req">*</span>
                </label>
                <div className="bk-account-input-wrapper">
                  <input
                    id="settings-confirm-pass"
                    name="confirmNewPassword"
                    type={showPassword ? "text" : "password"}
                    className={`bk-account-input ${
                      passwordErrors.confirmNewPassword
                        ? "bk-account-input--error"
                        : ""
                    }`}
                    value={passwords.confirmNewPassword}
                    onChange={handlePasswordChange}
                  />
                </div>
                {passwordErrors.confirmNewPassword && (
                  <span className="bk-account-field-error">
                    {passwordErrors.confirmNewPassword}
                  </span>
                )}
              </div>
            </div>

            <div
              style={{
                display: "flex",
                gap: "12px",
                justifyContent: "flex-end",
              }}
            >
              <button
                type="button"
                className="bk-account-btn bk-account-btn--secondary"
                onClick={() => setShowPasswordForm(false)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bk-account-btn bk-account-btn--primary"
                disabled={isUpdatingPassword}
              >
                {isUpdatingPassword ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i> Updating...
                  </>
                ) : (
                  "Update Password"
                )}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Account Session / Logout */}
      <div className="bk-account-card">
        <div className="bk-account-card__header">
          <div>
            <h2 className="bk-account-card__title">
              <i
                className="fas fa-user-shield"
                style={{ color: "#dc2626" }}
              ></i>
              Account Session
            </h2>
            <p className="bk-account-card__subtitle">
              Sign out of your customer account session on this browser.
            </p>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "16px",
          }}
        >
          <div>
            <strong style={{ fontSize: "14px" }}>
              Logged in as {user?.name || "User"}
            </strong>

            <p
              style={{
                fontSize: "13px",
                color: "var(--bk-text-muted)",
                margin: "2px 0 0 0",
              }}
            >
              {user?.email || ""}
            </p>
          </div>

          <button
            type="button"
            className="bk-account-btn bk-account-btn--outline-danger"
            onClick={handleLogoutClick}
          >
            <i className="fas fa-sign-out-alt"></i> Logout from Account
          </button>
        </div>
      </div>
    </AccountLayout>
  );
};

export default AccountSettingsPage;
