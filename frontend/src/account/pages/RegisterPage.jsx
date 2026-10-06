import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import "../styles/account.css";
import { registerUser } from "../../api/authApi";

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email address is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setIsLoading(true);

    try {
      const response = await registerUser({
        name: `${formData.firstName.trim()} ${formData.lastName.trim()}`,
        email: formData.email.trim(),
        password: formData.password,
      });

      console.log("Register API Response:", response);

      alert(response.message || "Account created successfully!");

      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: "",
      });

      navigate("/account/login");
    } catch (error) {
      console.error("Register Error:", error);

      setErrors({
        api:
          error.response?.data?.message ||
          "Registration failed. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Header />
      <div className="bk-account-wrapper" style={{ padding: "40px 0" }}>
        <div
          className="bk-account-auth-container"
          style={{ maxWidth: "560px" }}
        >
          <div className="bk-account-auth-card">
            <Link to="/" className="bk-account-auth-logo">
              Ap Bokifa
            </Link>
            <h2 className="bk-account-auth-title">Create Account</h2>
            <p className="bk-account-auth-subtitle">
              Join Bokifa to manage your orders, track shipments, and save
              wishlist items.
            </p>

            <form onSubmit={handleSubmit} noValidate>
              {errors.api && (
                <div
                  style={{
                    marginBottom: "18px",
                    padding: "12px 14px",
                    borderRadius: "6px",
                    background: "#fee2e2",
                    color: "#b91c1c",
                    fontSize: "14px",
                  }}
                >
                  {errors.api}
                </div>
              )}
              <div
                className="bk-account-form-grid"
                style={{ marginBottom: "18px" }}
              >
                <div className="bk-account-form-group">
                  <label
                    className="bk-account-label"
                    htmlFor="register-firstName"
                  >
                    First Name <span className="req">*</span>
                  </label>
                  <input
                    id="register-firstName"
                    name="firstName"
                    type="text"
                    className={`bk-account-input ${
                      errors.firstName ? "bk-account-input--error" : ""
                    }`}
                    placeholder="John"
                    value={formData.firstName}
                    onChange={handleChange}
                  />
                  {errors.firstName && (
                    <span className="bk-account-field-error">
                      {errors.firstName}
                    </span>
                  )}
                </div>

                <div className="bk-account-form-group">
                  <label
                    className="bk-account-label"
                    htmlFor="register-lastName"
                  >
                    Last Name <span className="req">*</span>
                  </label>
                  <input
                    id="register-lastName"
                    name="lastName"
                    type="text"
                    className={`bk-account-input ${
                      errors.lastName ? "bk-account-input--error" : ""
                    }`}
                    placeholder="Doe"
                    value={formData.lastName}
                    onChange={handleChange}
                  />
                  {errors.lastName && (
                    <span className="bk-account-field-error">
                      {errors.lastName}
                    </span>
                  )}
                </div>
              </div>

              <div
                className="bk-account-form-group"
                style={{ marginBottom: "18px" }}
              >
                <label className="bk-account-label" htmlFor="register-email">
                  Email Address <span className="req">*</span>
                </label>
                <input
                  id="register-email"
                  name="email"
                  type="email"
                  className={`bk-account-input ${
                    errors.email ? "bk-account-input--error" : ""
                  }`}
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={handleChange}
                />
                {errors.email && (
                  <span className="bk-account-field-error">{errors.email}</span>
                )}
              </div>

              <div
                className="bk-account-form-grid"
                style={{ marginBottom: "24px" }}
              >
                <div className="bk-account-form-group">
                  <label
                    className="bk-account-label"
                    htmlFor="register-password"
                  >
                    Password <span className="req">*</span>
                  </label>
                  <div className="bk-account-input-wrapper">
                    <input
                      id="register-password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      className={`bk-account-input ${
                        errors.password ? "bk-account-input--error" : ""
                      }`}
                      placeholder="At least 6 characters"
                      value={formData.password}
                      onChange={handleChange}
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
                  {errors.password && (
                    <span className="bk-account-field-error">
                      {errors.password}
                    </span>
                  )}
                </div>

                <div className="bk-account-form-group">
                  <label
                    className="bk-account-label"
                    htmlFor="register-confirmPassword"
                  >
                    Confirm Password <span className="req">*</span>
                  </label>
                  <div className="bk-account-input-wrapper">
                    <input
                      id="register-confirmPassword"
                      name="confirmPassword"
                      type={showPassword ? "text" : "password"}
                      className={`bk-account-input ${
                        errors.confirmPassword ? "bk-account-input--error" : ""
                      }`}
                      placeholder="Repeat password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                    />
                  </div>
                  {errors.confirmPassword && (
                    <span className="bk-account-field-error">
                      {errors.confirmPassword}
                    </span>
                  )}
                </div>
              </div>

              <button
                type="submit"
                className="bk-account-btn bk-account-btn--primary bk-account-btn--full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i> Creating
                    Account...
                  </>
                ) : (
                  "Create Account"
                )}
              </button>
            </form>

            <div className="bk-account-auth-footer">
              Already have an account? <Link to="/account/login">Sign in</Link>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default RegisterPage;
